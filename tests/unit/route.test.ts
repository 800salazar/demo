import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ generateText: vi.fn(), checkRateLimit: vi.fn() }));
vi.mock("ai", () => ({
  generateText: mocks.generateText,
  gateway: (id: string) => id,
  APICallError: { isInstance: () => false },
}));
vi.mock("@/lib/ai/rate-limit", () => ({ checkRateLimit: mocks.checkRateLimit, getClientBucket: () => "hashed-visitor" }));

import { POST } from "@/app/demo/api/ai/route";
import { getOperationalSnapshot } from "@/lib/ai/analysis";
import { createSeedData } from "@/lib/demo/seed";
import { MAX_BODY_BYTES } from "@/lib/ai/limits";

const body = () => ({ question: "Resumen operativo", snapshot: getOperationalSnapshot(createSeedData(new Date("2026-10-26T18:00:00Z"))) });
const request = (value: unknown, headers: Record<string, string> = {}) => new Request("https://demo.test/demo/api/ai", {
  method: "POST", headers: { "Content-Type": "application/json", ...headers }, body: JSON.stringify(value),
});

beforeEach(() => {
  vi.stubEnv("AI_GATEWAY_API_KEY", "private-test-gateway-key");
  vi.stubEnv("AI_MODEL", "test/model");
  vi.stubEnv("VERCEL_OIDC_TOKEN", "");
  vi.stubEnv("SUPABASE_SECRET_KEY", "private-test-supabase-key");
  mocks.generateText.mockReset().mockResolvedValue({ text: "Datos: 30 órdenes. Análisis: datos ficticios. Recomendaciones: revisar retrasos." });
  mocks.checkRateLimit.mockReset().mockResolvedValue({ allowed: true });
});
afterEach(() => vi.unstubAllEnvs());

describe("POST /demo/api/ai", () => {
  it("sends only this visitor's current 30 orders and computed totals to Gateway", async () => {
    const input = body();
    input.snapshot.orders[0].actualCost = 123456;
    const response = await POST(request(input));
    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toContain("no-store");
    const result = await response.json();
    expect(result.source).toBe("ai");
    const call = mocks.generateText.mock.calls[0][0];
    expect(call.model).toBe("test/model");
    const prompt = JSON.parse(call.prompt);
    expect(prompt.datos.orders).toHaveLength(30);
    expect(prompt.datos.orders[0].actualCost).toBe(123456);
    expect(call).not.toHaveProperty("tools");
    expect(JSON.stringify(result)).not.toContain("private-test");
  });

  it("separates two requests rather than caching the first visitor's data", async () => {
    const a = body();
    const b = body();
    a.snapshot.orders[0].actualCost = 999999;
    await POST(request(a));
    await POST(request(b));
    const prompts = mocks.generateText.mock.calls.map(([call]) => JSON.parse(call.prompt));
    expect(prompts[0].datos.orders[0].actualCost).toBe(999999);
    expect(prompts[1].datos.orders[0].actualCost).toBe(b.snapshot.orders[0].actualCost);
  });

  it.each(["key", "model"])("labels calculations when %s is missing, without calling the provider", async (missing) => {
    vi.stubEnv(missing === "key" ? "AI_GATEWAY_API_KEY" : "AI_MODEL", "");
    const result = await (await POST(request(body()))).json();
    expect(result.source).toBe("calculations");
    expect(result.reason).toBe("ai_not_configured");
    expect(mocks.generateText).not.toHaveBeenCalled();
  });

  it("accepts OIDC without a separate provider API key", async () => {
    vi.stubEnv("AI_GATEWAY_API_KEY", "");
    vi.stubEnv("VERCEL_OIDC_TOKEN", "test-oidc");
    expect((await (await POST(request(body()))).json()).source).toBe("ai");
  });

  it("fails closed if the persistent quota is unavailable", async () => {
    mocks.checkRateLimit.mockResolvedValue({ unavailable: true });
    const result = await (await POST(request(body()))).json();
    expect(result.reason).toBe("quota_unavailable");
    expect(result.source).toBe("calculations");
    expect(mocks.generateText).not.toHaveBeenCalled();
  });

  it("returns 429 and Retry-After without a provider call when limited", async () => {
    mocks.checkRateLimit.mockResolvedValue({ allowed: false, retryAfterSeconds: 80 });
    const response = await POST(request(body()));
    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBe("80");
    expect(mocks.generateText).not.toHaveBeenCalled();
  });

  it.each(["failure", "empty"])("uses clearly labelled calculations after provider %s", async (mode) => {
    if (mode === "empty") mocks.generateText.mockResolvedValue({ text: "  " });
    else mocks.generateText.mockRejectedValue(new Error("private-test-error"));
    const result = await (await POST(request(body()))).json();
    expect(result.source).toBe("calculations");
    expect(result.answer).toContain("30 órdenes");
    expect(JSON.stringify(result)).not.toContain("private-test");
  });

  it("rejects foreign origins and unstructured private context before any provider call", async () => {
    expect((await POST(request(body(), { Origin: "https://evil.test" }))).status).toBe(403);
    expect((await POST(request({ ...body(), context: { enfoca: "private" } }))).status).toBe(400);
    expect(mocks.generateText).not.toHaveBeenCalled();
  });

  it("rejects malformed JSON and unsupported content types", async () => {
    expect((await POST(new Request("https://demo.test/demo/api/ai", { method: "POST", body: "{", headers: { "Content-Type": "application/json" } }))).status).toBe(400);
    expect((await POST(request(body(), { "Content-Type": "text/plain" }))).status).toBe(415);
  });

  it("bounds UTF-8 bytes even if Content-Length is forged", async () => {
    const raw = JSON.stringify({ question: "ñ".repeat(MAX_BODY_BYTES / 2), snapshot: {} });
    expect(raw.length).toBeLessThan(MAX_BODY_BYTES);
    const response = await POST(new Request("https://demo.test/demo/api/ai", {
      method: "POST", body: raw, headers: { "Content-Type": "application/json", "Content-Length": "1" },
    }));
    expect(response.status).toBe(413);
    expect(mocks.generateText).not.toHaveBeenCalled();
  });
});
