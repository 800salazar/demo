import "server-only";

export type AiConfig = { available: true; apiKey: string; model: string } | { available: false };

/** El asistente solo está disponible si existen la API key y el modelo; nunca se simulan respuestas. */
export function getAiConfig(): AiConfig {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  const model = process.env.OPENAI_MODEL?.trim();

  return apiKey && model ? { available: true, apiKey, model } : { available: false };
}
