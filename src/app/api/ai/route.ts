import { NextResponse } from "next/server";
import OpenAI, { APIError } from "openai";
import { getAiConfig } from "@/lib/ai/config";
import { SYSTEM_PROMPT } from "@/lib/ai/prompt";
import { checkRateLimit } from "@/lib/ai/rate-limit";
import { aiRequestSchema, MAX_BODY_BYTES } from "@/lib/ai/schema";

function errorResponse(error: string, message: string, status: number, headers?: HeadersInit) {
  return NextResponse.json({ error, message }, { status, headers });
}

export async function POST(request: Request) {
  const config = getAiConfig();
  if (!config.available) {
    return errorResponse("ai_unavailable", "El asistente de IA no está configurado en este entorno.", 503);
  }

  const clientId =
    request.headers.get("x-real-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anonymous";
  const limit = checkRateLimit(clientId);
  if (!limit.allowed) {
    return errorResponse("rate_limited", "Hiciste muchas consultas seguidas. Intenta de nuevo en unos minutos.", 429, {
      "Retry-After": String(limit.retryAfterSeconds),
    });
  }

  if (Number(request.headers.get("content-length") ?? 0) > MAX_BODY_BYTES) {
    return errorResponse("payload_too_large", "La consulta es demasiado grande.", 413);
  }

  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) {
    return errorResponse("payload_too_large", "La consulta es demasiado grande.", 413);
  }

  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return errorResponse("invalid_json", "El cuerpo de la solicitud no es JSON válido.", 400);
  }

  const parsed = aiRequestSchema.safeParse(json);
  if (!parsed.success) {
    return errorResponse("invalid_request", parsed.error.issues[0]?.message ?? "Solicitud inválida.", 400);
  }

  const { question, context } = parsed.data;

  try {
    const client = new OpenAI({ apiKey: config.apiKey, timeout: 25_000, maxRetries: 1 });
    const response = await client.responses.create({
      model: config.model,
      instructions: SYSTEM_PROMPT,
      input: JSON.stringify({ pregunta: question, datos: context }),
      max_output_tokens: 1500,
      store: false,
    });

    if (!response.output_text) {
      return errorResponse("ai_empty", "El asistente no devolvió una respuesta. Intenta reformular la pregunta.", 502);
    }

    return NextResponse.json({ answer: response.output_text });
  } catch (error) {
    const detail = error instanceof APIError ? { status: error.status, code: error.code } : (error as Error).message;
    console.error("[api/ai] La solicitud a OpenAI falló", detail);
    return errorResponse("ai_error", "No se pudo obtener una respuesta del asistente. Intenta de nuevo.", 502);
  }
}
