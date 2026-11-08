import "server-only";
import { createHmac } from "node:crypto";
import { isIP } from "node:net";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { getSupabaseUrl } from "@/lib/supabase/config";

export type RateLimitResult =
  | { allowed: true }
  | { allowed: false; retryAfterSeconds: number }
  | { unavailable: true };

export function isRateLimitConfigured(): boolean {
  return Boolean(getSupabaseUrl() && process.env.SUPABASE_SECRET_KEY?.trim());
}

/** Only Vercel's overwritten IP header is trusted; other hosts share a conservative bucket. */
export function getClientBucket(headers: Headers, secret: string): string {
  const forwarded = process.env.VERCEL === "1" ? headers.get("x-vercel-forwarded-for")?.trim() : null;
  const identity = forwarded && isIP(forwarded) ? forwarded : "shared-non-vercel";
  return createHmac("sha256", secret).update(`salazar-demo-ai:${identity}`).digest("hex");
}

const resultSchema = z.object({ allowed: z.boolean(), retry_after_seconds: z.number().int().min(0).max(86400) });

/** Atomic, persistent quotas: 12 requests/IP/10 min, 200 requests/project/UTC day. Fail closed. */
export async function checkRateLimit(headers: Headers): Promise<RateLimitResult> {
  const url = getSupabaseUrl();
  const secret = process.env.SUPABASE_SECRET_KEY?.trim();
  if (!url || !secret) {
    console.warn("[api/ai] Quota unavailable", { category: "missing_configuration" });
    return { unavailable: true };
  }
  try {
    const client = createClient(url, secret, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
    const { data, error, status } = await client.rpc("consume_demo_ai_quota", {
      p_client_hash: getClientBucket(headers, secret),
    }).abortSignal(AbortSignal.timeout(5_000));
    if (error) {
      const knownCodes = ["PGRST202", "PGRST301", "PGRST303", "42501"];
      const code = knownCodes.includes(error.code) ? error.code : "other";
      console.warn("[api/ai] Quota unavailable", {
        category: "rpc_error", code,
        ...(Number.isInteger(status) && status >= 100 && status <= 599 ? { status } : {}),
      });
      return { unavailable: true };
    }
    const parsed = resultSchema.safeParse(data);
    if (!parsed.success) {
      console.warn("[api/ai] Quota unavailable", { category: "invalid_response" });
      return { unavailable: true };
    }
    return parsed.data.allowed ? { allowed: true } : {
      allowed: false, retryAfterSeconds: Math.max(1, parsed.data.retry_after_seconds),
    };
  } catch {
    console.warn("[api/ai] Quota unavailable", { category: "connection_error" });
    return { unavailable: true };
  }
}
