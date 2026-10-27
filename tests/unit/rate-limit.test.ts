import { afterEach, beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ rpc: vi.fn(), result: vi.fn() }));
vi.mock("@supabase/supabase-js", () => ({ createClient: () => ({ rpc: mocks.rpc }) }));
import { checkRateLimit, getClientBucket } from "@/lib/ai/rate-limit";

beforeEach(() => {
  vi.stubEnv("VERCEL", "1");
  vi.stubEnv("SUPABASE_URL", "https://test.supabase.co");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
  vi.stubEnv("SUPABASE_SECRET_KEY", "test-secret");
  mocks.result.mockReset().mockResolvedValue({ data: { allowed: true, retry_after_seconds: 0 }, error: null });
  mocks.rpc.mockReset().mockImplementation(() => ({ abortSignal: mocks.result }));
});
afterEach(() => vi.unstubAllEnvs());

it("uses a one-way bucket from the trusted Vercel IP; ignores user-selected identities", () => {
  const a = getClientBucket(new Headers({ "x-vercel-forwarded-for": "192.0.2.1", "x-forwarded-for": "1.1.1.1" }), "secret");
  const b = getClientBucket(new Headers({ "x-vercel-forwarded-for": "192.0.2.1", "x-forwarded-for": "8.8.8.8" }), "secret");
  expect(a).toMatch(/^[a-f0-9]{64}$/);
  expect(a).toBe(b);
  expect(a).not.toContain("192.0.2.1");
  vi.stubEnv("VERCEL", "");
  expect(getClientBucket(new Headers({ "x-vercel-forwarded-for": "192.0.2.1" }), "secret"))
    .toBe(getClientBucket(new Headers({ "x-vercel-forwarded-for": "192.0.2.2" }), "secret"));
});

it("uses the database decision and retry time instead of process memory", async () => {
  expect(await checkRateLimit(new Headers())).toEqual({ allowed: true });
  mocks.result.mockResolvedValue({ data: { allowed: false, retry_after_seconds: 400 }, error: null });
  expect(await checkRateLimit(new Headers())).toEqual({ allowed: false, retryAfterSeconds: 400 });
  expect(mocks.rpc).toHaveBeenCalledWith("consume_demo_ai_quota", { p_client_hash: expect.stringMatching(/^[a-f0-9]{64}$/) });
});

it("fails closed for missing configuration, database errors or invalid RPC results", async () => {
  vi.stubEnv("SUPABASE_SECRET_KEY", "");
  expect(await checkRateLimit(new Headers())).toEqual({ unavailable: true });
  expect(mocks.rpc).not.toHaveBeenCalled();
  vi.stubEnv("SUPABASE_SECRET_KEY", "test-secret");
  mocks.result.mockResolvedValue({ data: null, error: { message: "database unavailable" } });
  expect(await checkRateLimit(new Headers())).toEqual({ unavailable: true });
  mocks.result.mockResolvedValue({ data: {}, error: null });
  expect(await checkRateLimit(new Headers())).toEqual({ unavailable: true });
});
