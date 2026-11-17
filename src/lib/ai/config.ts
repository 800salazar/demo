import "server-only";

export type AiConfig = { available: true; model: string } | { available: false };

export function getAiConfig(requestHeaders?: Pick<Headers, "get">): AiConfig {
  const model = process.env.AI_MODEL?.trim();
  // Vercel Functions supply OIDC per request; only local/build tokens live in env.
  // The Gateway SDK retrieves and validates the runtime token from Vercel's request context.
  const runtimeOidc = process.env.VERCEL === "1" && Boolean(requestHeaders?.get("x-vercel-oidc-token")?.trim());
  const authenticated = Boolean(process.env.AI_GATEWAY_API_KEY?.trim() || process.env.VERCEL_OIDC_TOKEN?.trim() || runtimeOidc);
  return authenticated && model && /^[\w.-]+\/[\w./-]+$/.test(model)
    ? { available: true, model } : { available: false };
}
