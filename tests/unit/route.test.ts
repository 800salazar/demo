import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ generateText: vi.fn(), checkRateLimit: vi.fn() }));
vi.mock("ai", () => ({
  generateText: mocks.generateText,
  Output: { object: (options: unknown) => options, json: () => ({ type: "json" }) },
  gateway: (id: string) => id,
  APICallError: { isInstance: () => false },
}));
vi.mock("@/lib/ai/rate-limit", () => ({ checkRateLimit: mocks.checkRateLimit, getClientBucket: () => "hashed-visitor" }));

import { initialSuggestions } from "@/lib/ai/suggestions";
import { draftCatalogs, emptyOrderDraft } from "@/lib/ai/order-draft";
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
    expect(prompt.datos.totals.orders).toBe(30);
    expect(prompt.datos.orders.length).toBeLessThanOrEqual(8);
    expect(prompt.datos.orders.find((o: { folio: string }) => o.folio === "OT-1001").actualCost).toBe(123456);
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
    expect(prompts[0].datos.orders.find((o: { folio: string }) => o.folio === "OT-1001").actualCost).toBe(999999);
    expect(prompts[1].datos.totals.actualCost).not.toBe(prompts[0].datos.totals.actualCost);
  });

  it("preserves output for the free Nemotron model without changing other model settings", async () => {
    vi.stubEnv("AI_MODEL", "nvidia/nemotron-3.5-lightning-free");
    expect((await (await POST(request(body()))).json()).source).toBe("ai");
    expect(mocks.generateText.mock.calls[0][0].reasoning).toBe("none");
    mocks.generateText.mockClear();
    vi.stubEnv("AI_MODEL", "test/model");
    await POST(request(body()));
    expect(mocks.generateText.mock.calls[0][0]).not.toHaveProperty("reasoning");
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

  it("classifies authentication failures without logging secrets or provider messages", async () => {
    const log = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    try {
      const error = Object.assign(new Error("private-test-provider-message"), { name: "GatewayAuthenticationError" });
      mocks.generateText.mockRejectedValue(error);
      const result = await (await POST(request(body()))).json();
      expect(result).toMatchObject({ source: "calculations", reason: "ai_error" });
      expect(log).toHaveBeenCalledWith("[api/ai] Gateway unavailable", { category: "authentication" });
      expect(JSON.stringify(log.mock.calls)).not.toContain("private-test");
    } finally { log.mockRestore(); }
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

it("explains state changes with a trusted guide even without Gateway, without model or quota calls", async () => {
  vi.stubEnv("AI_GATEWAY_API_KEY", "");
  vi.stubEnv("AI_MODEL", "");
  const input = { ...body(), question: "como hacer un cambio de estado?" };
  const response = await POST(request(input));
  const result = await response.json();
  expect(result).toMatchObject({ source: "help", helpId: "changeStatus" });
  expect(result.answer).toContain("Guardar cambios");
  expect(mocks.generateText).not.toHaveBeenCalled();
  expect(mocks.checkRateLimit).not.toHaveBeenCalled();
});


describe("draft preparation endpoint", () => {
  const context = () => ({ ...draftCatalogs(createSeedData(new Date("2026-11-16T18:00:00Z"))), draft: null });
  it("returns a validated proposal and missing fields without tools or creation", async () => {
    const draft = { ...emptyOrderDraft(), title: "Revisar sensor", departmentId: context().departments[0].id };
    mocks.generateText.mockResolvedValue({ text: "structured", output: { answer: "Preparé el borrador.", draft, suggestions: initialSuggestions } });
    const result = await (await POST(request({ ...body(), question: "Crea una solicitud para revisar sensor", draftContext: context() }))).json();
    expect(result.source).toBe("ai");
    expect(result.draft).toEqual(draft);
    expect(result.answer).toContain("responsable");
    expect(result.answer).toContain("Revisa los datos");
    expect(mocks.generateText.mock.calls[0][0]).not.toHaveProperty("tools");
  });
  it("rejects a model proposal with a nonexistent department", async () => {
    mocks.generateText.mockResolvedValue({ text: "structured", output: { answer: "Propuesta", draft: { ...emptyOrderDraft(), departmentId: "invented" }, suggestions: initialSuggestions } });
    const result = await (await POST(request({ ...body(), draftContext: context() }))).json();
    expect(result.source).toBe("calculations");
    expect(result).not.toHaveProperty("draft");
    expect(result.answer).toContain("no se aplicó ningún borrador");
  });
  it("sends the current draft for follow-up instructions and retains quota checks", async () => {
    mocks.generateText.mockResolvedValue({ text: "structured", output: { answer: "Consulta", draft: null, suggestions: initialSuggestions } });
    const draftContext = { ...context(), draft: { ...emptyOrderDraft(), assignee: "Ana" } };
    await POST(request({ ...body(), question: "El presupuesto es de 1200 pesos", draftContext }));
    expect(JSON.parse(mocks.generateText.mock.calls[0][0].prompt).contextoBorrador.draft.assignee).toBe("Ana");
    expect(mocks.checkRateLimit).toHaveBeenCalledOnce();
  });
});

describe("generated follow-up suggestions", () => {
  it("returns the model's suggestions and supplies the bounded conversation to the same call", async () => {
    const suggestions = [{ label: "Analizar área", question: "Analiza presupuesto y costo real del departamento de Mantenimiento y cita los folios con sobrecosto." }];
    mocks.generateText.mockResolvedValue({ text: "structured", output: { answer: "Revisa los costos del área.", draft: null, suggestions } });
    const draftContext = { ...draftCatalogs(createSeedData(new Date("2026-11-16T18:00:00Z"))), draft: null };
    const history = [{ question: "Analiza costos", answer: "Revisa el presupuesto por departamento." }];
    const result = await (await POST(request({ ...body(), draftContext, history }))).json();
    expect(result.suggestions).toEqual(suggestions);
    expect(JSON.parse(mocks.generateText.mock.calls[0][0].prompt).historial).toEqual(history);
    expect(mocks.generateText).toHaveBeenCalledOnce();
    expect(mocks.checkRateLimit).toHaveBeenCalledOnce();
  });
  it("includes contextual local suggestions in calculated and help responses without extra model calls", async () => {
    vi.stubEnv("AI_MODEL", "");
    const costs = await (await POST(request({ ...body(), question: `Analiza costos de ${body().snapshot.departments[0].name}` }))).json();
    expect(costs.source).toBe("calculations");
    expect(costs.suggestions[0].question).toContain(body().snapshot.departments[0].name);
    const help = await (await POST(request({ ...body(), question: "¿Cómo cambio el estado?" }))).json();
    expect(help.source).toBe("help");
    expect(help.suggestions.length).toBeGreaterThan(0);
    expect(mocks.generateText).not.toHaveBeenCalled();
  });
});
