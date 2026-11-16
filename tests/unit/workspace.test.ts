import { describe, expect, it } from "vitest";
import { createSeedData } from "@/lib/demo/seed";
import { createOrder, toggleChecklist, activitySeries, localDay } from "@/lib/demo/workflow";
import { editCatalogItem } from "@/lib/demo/catalog";
import { getOperationalSnapshot, buildOperationalAnalysis, getCalculatedFallback } from "@/lib/ai/analysis";
import { aiRequestSchema } from "@/lib/ai/schema";
import { MAX_BODY_BYTES } from "@/lib/ai/limits";
import { buildOperationalPdf } from "@/lib/demo/report";
import { guides, guideStepUrl } from "@/lib/guide/steps";
const now = new Date("2026-11-16T18:00:00Z");
const seed = () => createSeedData(now);
const draft = (data = seed()) => ({ title: "Revisar lector estación 4", departmentId: data.departments[0].id,
  categoryId: data.categories[0].id, priorityId: data.priorities[0].id, assignee: "Ana Torres", dueDate: "2026-11-20", estimatedCost: 1200.50, description: "Lecturas intermitentes" });

describe("plant workflow", () => {
  it("creates unique orders with an initial state, required checklist and history without mutating seed", () => {
    const data = seed();
    const next = createOrder(data, draft(data), now);
    const order = next.orders.at(-1)!;
    expect(order).toMatchObject({ folio: "OT-1031", actualCost: 0, completedAt: null, ...draft(data) });
    expect(next.checklist.filter(i => i.orderId === order.id)).toHaveLength(2);
    expect(next.history.at(-1)?.orderId).toBe(order.id);
    expect(data.orders).toHaveLength(30);
    expect(createOrder(next, draft(data), now).orders.at(-1)?.folio).toBe("OT-1032");
    expect(aiRequestSchema.safeParse({ question: "Resumen", snapshot: getOperationalSnapshot(next) }).success).toBe(true);
  });
  it("rejects invalid dates, references, money and the 101st order", () => {
    const data = seed();
    expect(() => createOrder(data, { ...draft(data), dueDate: "2026-02-30" })).toThrow();
    expect(() => createOrder(data, { ...draft(data), departmentId: "missing" })).toThrow();
    expect(() => createOrder(data, { ...draft(data), estimatedCost: -1 })).toThrow();
    const full = { ...data, orders: Array.from({ length: 100 }, (_, i) => ({ ...data.orders[0], id: `order-${i}`, folio: `OT-${i + 1001}` })) };
    expect(() => createOrder(full, draft(data))).toThrow(/100/);
  });
  it("tracks checklist changes and protects completed orders", () => {
    const data = seed();
    const pending = data.orders.find(o => data.statuses.find(s => s.id === o.statusId)?.kind !== "completed")!;
    const item = data.checklist.find(i => i.orderId === pending.id)!;
    const next = toggleChecklist(data, item.id, now);
    expect(next.checklist.find(i => i.id === item.id)?.done).toBe(!item.done);
    expect(next.history.at(-1)?.detail).toContain(item.label);
    expect(data.checklist.find(i => i.id === item.id)?.done).toBe(item.done);
    const completed = data.orders.find(o => data.statuses.find(s => s.id === o.statusId)?.kind === "completed")!;
    expect(() => toggleChecklist(data, data.checklist.find(i => i.orderId === completed.id)!.id)).toThrow(/Reabre/);
  });
  it("preserves old labels when requested and applies subsequent bulk changes without rewriting history", () => {
    const data = seed(); const state = data.statuses[0];
    const renamed = editCatalogItem(data, "statuses", state.id, "Por comenzar", "blue", "future");
    expect(renamed.orders.filter(o => o.statusId === state.id).every(o => o.statusLabel === state.name)).toBe(true);
    const afterNew = createOrder(renamed, draft(renamed), now);
    expect(afterNew.orders.at(-1)?.statusLabel).toBeUndefined();
    const snapshot = getOperationalSnapshot(afterNew);
    expect(buildOperationalAnalysis(snapshot, now).orders.find(o => o.folio === data.orders.find(o => o.statusId === state.id)!.folio)?.status).toBe(state.name);
    const all = editCatalogItem(afterNew, "statuses", state.id, "En planeación", "slate", "all");
    expect(all.orders.filter(o => o.statusId === state.id).every(o => o.statusLabel === undefined)).toBe(true);
    expect(all.history.slice(0, data.history.length)).toEqual(data.history);
    expect(all.statuses.find(s => s.id === state.id)?.kind).toBe(state.kind);
  });
  it("counts activity in Chihuahua and explains the contributors without inventing causes", () => {
    const series = activitySeries([{ folio: "OT-1", createdAt: "2026-11-16T05:00:00Z", completedAt: "2026-11-16T07:00:00Z" }], now);
    expect(localDay("2026-11-16T05:00:00Z")).toBe("2026-11-15");
    expect(series.find(p => p.day === "2026-11-15")?.createdFolios).toEqual(["OT-1"]);
    expect(series.at(-1)?.completedFolios).toEqual(["OT-1"]);
    const data = createOrder(seed(), draft(), now);
    const answer = getCalculatedFallback("Analiza la actividad del 2026-11-16", buildOperationalAnalysis(getOperationalSnapshot(data), now));
    expect(answer).toContain("OT-1031");
    expect(answer).toContain("no prueban una causa");
  });
  it("bounds history sent to AI and accommodates the largest supported scenario", () => {
    let data = seed();
    while (data.orders.length < 100) data = createOrder(data, { ...draft(data), description: "á".repeat(800), title: "á".repeat(200), assignee: "á".repeat(120) }, now);
    data.orders = data.orders.map(o => ({ ...o, observations: "á".repeat(800) }));
    const snapshot = getOperationalSnapshot(data);
    expect(snapshot.orders.every(o => o.recentChanges!.length <= 2)).toBe(true);
    expect(aiRequestSchema.safeParse({ question: "Resumen", snapshot }).success).toBe(true);
    expect(new TextEncoder().encode(JSON.stringify({ question: "Resumen", snapshot })).length).toBeLessThan(MAX_BODY_BYTES);
  });
  it("generates a paginated PDF with current records and amounts", () => {
    const data = createOrder(seed(), { ...draft(), title: "Solicitud PDF comprobable" }, now);
    data.orders.at(-1)!.actualCost = 123456.78;
    const pdf = buildOperationalPdf(data, now);
    expect(pdf.getNumberOfPages()).toBeGreaterThan(1);
    const output = pdf.output();
    expect(output.startsWith("%PDF-")).toBe(true);
    expect(output).toContain("Solicitud PDF comprobable");
    expect(output).toContain("123,456.78");
    expect(output).toContain("OT-1031");
  });
  it("guides through all perspectives and PDF with real action signals", () => {
    expect(guides.full).toHaveLength(10);
    expect(guides.full.some(s => s.action === "view-director")).toBe(true);
    expect(guides.full.at(-1)?.action).toBe("report-ready");
    expect(guideStepUrl(guides.full.at(-1)!)).toBe("/demo/sistema?vista=direccion");
  });
});
