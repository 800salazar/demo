import "server-only";

export type AiConfig = { available: true; model: string } | { available: false };

export function getAiConfig(): AiConfig {
  const model = process.env.AI_MODEL?.trim();
  const authenticated = Boolean(process.env.AI_GATEWAY_API_KEY?.trim() || process.env.VERCEL_OIDC_TOKEN?.trim());
  return authenticated && model && /^[\w.-]+\/[\w./-]+$/.test(model)
    ? { available: true, model } : { available: false };
}
