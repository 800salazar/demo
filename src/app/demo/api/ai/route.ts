import { NextResponse } from "next/server";
import { APICallError, gateway, generateText, Output } from "ai";
import { getAiConfig } from "@/lib/ai/config";
import { buildOperationalAnalysis, getCalculatedFallback } from "@/lib/ai/analysis";
import { findProductHelp, productHelp, PRODUCT_HELP_CONTEXT } from "@/lib/ai/product-help";
import { assistantOutputSchema, DRAFT_PROMPT, draftReview, validateDraft } from "@/lib/ai/order-draft";
import { fallbackSuggestions, readSuggestions, SUGGESTIONS_PROMPT } from "@/lib/ai/suggestions";
import { compactModelContext, FREE_NEMOTRON_MODEL, NEMOTRON_JSON_PROMPT, NEMOTRON_SYSTEM_PROMPT, parseNemotronResponse } from "@/lib/ai/model-context";
import { SYSTEM_PROMPT } from "@/lib/ai/prompt";
import { checkRateLimit, getClientBucket } from "@/lib/ai/rate-limit";
import { aiRequestSchema } from "@/lib/ai/schema";
import { MAX_BODY_BYTES } from "@/lib/ai/limits";

export const maxDuration = 40;
const privateHeaders = { "Cache-Control": "private, no-store" };

function errorResponse(error: string, message: string, status: number, headers?: Record<string, string>) {
  return NextResponse.json({ error, message }, { status, headers: { ...privateHeaders, ...headers } });
}

/** Fixed categories only: provider messages and causes can contain sensitive data. */
function gatewayDiagnostic(error: unknown) {
  const name = error instanceof Error ? error.name : "";
  const authentication = error instanceof Error && (name === "GatewayAuthenticationError"
    || (name === "GatewayError" && error.message.startsWith("Unauthenticated.")));
  const status = APICallError.isInstance(error) && typeof error.statusCode === "number"
    && error.statusCode >= 100 && error.statusCode <= 599 ? error.statusCode : undefined;
  const invalidOutput = ["AI_NoObjectGeneratedError", "AI_NoOutputGeneratedError", "AI_TypeValidationError", "ZodError"].includes(name);
  const category = invalidOutput ? "invalid_output" : authentication ? "authentication" : name === "AbortError" || name === "TimeoutError" ? "timeout_or_abort" : "gateway_error";
  return { category, ...(status === undefined ? {} : { status }) };
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
  const { question, snapshot, draftContext, history } = parsed.data;
  const analysis = buildOperationalAnalysis(snapshot, new Date());
  const suggestions = fallbackSuggestions(question, snapshot, draftContext?.draft);
  const fallback = (reason: string) => NextResponse.json({
    answer: `${draftContext ? "La IA no pudo responder. Este resumen usa cálculos; no se aplicó ningún borrador.\n" : ""}${getCalculatedFallback(question, analysis)}`, suggestions, source: "calculations", reason, asOf: analysis.asOf,
  }, { headers: privateHeaders });

  const helpId = findProductHelp(question);
  if (helpId) return NextResponse.json({ answer: productHelp[helpId].answer, suggestions, source: "help", helpId, asOf: analysis.asOf }, { headers: privateHeaders });

  const config = getAiConfig(request.headers);
  if (!config.available) return fallback("ai_not_configured");
  const limit = await checkRateLimit(request.headers);
  if ("unavailable" in limit) return fallback("quota_unavailable");
  if (!limit.allowed) {
    return errorResponse("rate_limited", "Se alcanzó el límite de consultas. Intenta más tarde.", 429, {
      "Retry-After": String(limit.retryAfterSeconds),
    });
  }
  try {
    const freeNemotron = config.model === FREE_NEMOTRON_MODEL;
    const response = await generateText({
      model: gateway(config.model), system: `${freeNemotron ? NEMOTRON_SYSTEM_PROMPT : SYSTEM_PROMPT}\n${draftContext ? `${DRAFT_PROMPT}\n${SUGGESTIONS_PROMPT}\n${freeNemotron ? NEMOTRON_JSON_PROMPT : ""}` : ""}\nAyuda del producto verificada:\n${PRODUCT_HELP_CONTEXT}`,
      prompt: JSON.stringify({ pregunta: question, datos: compactModelContext(analysis, question), ...(history?.length ? { historial: history } : {}), ...(draftContext ? { contextoBorrador: draftContext } : {}) }),
      ...(draftContext ? { output: freeNemotron ? Output.json() : Output.object({ schema: assistantOutputSchema }) } : {}),
      // This model can exhaust the output budget on reasoning before returning text.
      ...(freeNemotron ? { reasoning: "none" as const } : {}),
      maxOutputTokens: 2200, maxRetries: 0, timeout: 25_000, abortSignal: request.signal,
      providerOptions: { gateway: {
        user: getClientBucket(request.headers, process.env.SUPABASE_SECRET_KEY!),
        tags: ["salazar-demo", "operational-assistant"],
      } },
    });
    if (!response.text.trim()) {
      console.warn("[api/ai] Gateway unavailable", { category: "empty_response", finishReason: response.finishReason });
      return fallback("ai_empty");
    }
    if (draftContext) {
      const output = freeNemotron ? parseNemotronResponse(response.output, draftContext.draft, question) : assistantOutputSchema.parse(response.output);
      const draft = output.draft ? validateDraft(output.draft, draftContext) : null;
      const followUps = readSuggestions(output.suggestions, question);
      return NextResponse.json({ answer: draft ? draftReview(draft) : output.answer, draft, suggestions: followUps.length ? followUps : suggestions, source: "ai", asOf: analysis.asOf }, { headers: privateHeaders });
    }
    return NextResponse.json({ answer: response.text, suggestions, source: "ai", asOf: analysis.asOf }, { headers: privateHeaders });
  } catch (error) {
    // Never log questions, snapshots, credentials or provider error bodies.
    console.warn("[api/ai] Gateway unavailable", gatewayDiagnostic(error));
    return fallback("ai_error");
  }
}
