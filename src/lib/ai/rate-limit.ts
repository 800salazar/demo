import "server-only";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 12;
const MAX_TRACKED_CLIENTS = 5_000;

const hits = new Map<string, number[]>();

export type RateLimitResult = { allowed: true } | { allowed: false; retryAfterSeconds: number };

/**
 * Límite básico por cliente en memoria. En serverless cada instancia lleva su propio conteo,
 * así que es un freno razonable, no una garantía: fija además un tope de gasto en OpenAI.
 */
export function checkRateLimit(clientId: string, now: number = Date.now()): RateLimitResult {
  const recent = (hits.get(clientId) ?? []).filter((timestamp) => now - timestamp < WINDOW_MS);

  if (recent.length >= MAX_REQUESTS) {
    hits.set(clientId, recent);
    return { allowed: false, retryAfterSeconds: Math.ceil((recent[0] + WINDOW_MS - now) / 1000) };
  }

  recent.push(now);
  hits.set(clientId, recent);

  if (hits.size > MAX_TRACKED_CLIENTS) {
    for (const [id, timestamps] of hits) {
      if (timestamps.every((timestamp) => now - timestamp >= WINDOW_MS)) hits.delete(id);
    }
  }

  return { allowed: true };
}
