import { NextResponse } from "next/server";
import { APICallError, gateway, generateText } from "ai";
import { getAiConfig } from "@/lib/ai/config";
import { buildOperationalAnalysis, getCalculatedFallback } from "@/lib/ai/analysis";
import { SYSTEM_PROMPT } from "@/lib/ai/prompt";
import { checkRateLimit, getClientBucket } from "@/lib/ai/rate-limit";
import { aiRequestSchema } from "@/lib/ai/schema";
import { MAX_BODY_BYTES } from "@/lib/ai/limits";

export const maxDuration = 40;
const privateHeaders = { "Cache-Control": "private, no-store" };

function errorResponse(error: string, message: string, status: number, headers?: Record<string, string>) {
  return NextResponse.json({ error, message }, { status, headers: { ...privateHeaders, ...headers } });
}

/** Bound actual bytes while streaming, even with absent/false Content-Length. */
async function readBody(request: Request): Promise<string | null> {
  if (Number(request.headers.get("content-length")) > MAX_BODY_BYTES) return null;
  const reader = request.body?.getReader();
  if (!reader) return "";
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BODY_BYTES) {
        await reader.cancel();
        return null;
      }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  return Buffer.concat(chunks).toString("utf8");
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if ((origin && origin !== new URL(request.url).origin) || request.headers.get("sec-fetch-site") === "cross-site") {
    return errorResponse("invalid_origin", "La consulta debe enviarse desde esta demostración.", 403);
  }
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    return errorResponse("invalid_content_type", "Envía la consulta como JSON.", 415);
  }
  let json: unknown;
  try {
    const raw = await readBody(request);
    if (raw === null) return errorResponse("payload_too_large", "La consulta es demasiado grande.", 413);
    json = JSON.parse(raw);
  } catch {
    return errorResponse("invalid_json", "El cuerpo de la solicitud no es JSON válido.", 400);
  }
  const parsed = aiRequestSchema.safeParse(json);
  if (!parsed.success) {
    return errorResponse("invalid_request", "Revisa la pregunta y los datos de las órdenes de la demostración.", 400);
  }
  const { question, snapshot } = parsed.data;
  const analysis = buildOperationalAnalysis(snapshot, new Date());
  const fallback = (reason: string) => NextResponse.json({
    answer: getCalculatedFallback(question, analysis), source: "calculations", reason, asOf: analysis.asOf,
  }, { headers: privateHeaders });

  const config = getAiConfig();
  if (!config.available) return fallback("ai_not_configured");
  const limit = await checkRateLimit(request.headers);
  if ("unavailable" in limit) return fallback("quota_unavailable");
  if (!limit.allowed) {
    return errorResponse("rate_limited", "Se alcanzó el límite de consultas. Intenta más tarde.", 429, {
      "Retry-After": String(limit.retryAfterSeconds),
    });
  }
  try {
    const response = await generateText({
      model: gateway(config.model), system: SYSTEM_PROMPT,
      prompt: JSON.stringify({ pregunta: question, datos: analysis }),
      maxOutputTokens: 1500, maxRetries: 0, timeout: 25_000, abortSignal: request.signal,
      providerOptions: { gateway: {
        user: getClientBucket(request.headers, process.env.SUPABASE_SECRET_KEY!),
        tags: ["salazar-demo", "operational-assistant"],
      } },
    });
    if (!response.text.trim()) return fallback("ai_empty");
    return NextResponse.json({ answer: response.text, source: "ai", asOf: analysis.asOf }, { headers: privateHeaders });
  } catch (error) {
    // Never log questions, snapshots, credentials or provider error bodies.
    console.warn("[api/ai] Gateway unavailable", { status: APICallError.isInstance(error) ? error.statusCode : undefined });
    return fallback("ai_error");
  }
}
