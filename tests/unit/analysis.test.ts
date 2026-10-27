import { describe, expect, it } from "vitest";
import { createSeedData } from "@/lib/demo/seed";
import { buildOperationalAnalysis, getOperationalSnapshot, getCalculatedFallback } from "@/lib/ai/analysis";
import { aiRequestSchema } from "@/lib/ai/schema";

const now = new Date("2026-10-26T18:00:00Z");
const snapshot = () => getOperationalSnapshot(createSeedData(now));

describe("operational data boundary", () => {
  it("validates all 30 seed orders and excludes unrelated fields", () => {
    const data = snapshot();
    expect(data.orders).toHaveLength(30);
    expect(aiRequestSchema.safeParse({ question: "Resumen operativo", snapshot: data }).success).toBe(true);
    expect(data).not.toHaveProperty("history");
    expect(data).not.toHaveProperty("checklist");
  });

  it("rejects arbitrary private context, broken references, duplicates and invalid costs", () => {
    const input = { question: "Resumen", snapshot: snapshot() };
    expect(aiRequestSchema.safeParse({ ...input, context: { enfoca: "private" } }).success).toBe(false);
    expect(aiRequestSchema.safeParse({ ...input, snapshot: { ...input.snapshot, enfoca: {} } }).success).toBe(false);
    input.snapshot.orders[0].departmentId = "missing";
    expect(aiRequestSchema.safeParse(input).success).toBe(false);
    input.snapshot = snapshot();
    input.snapshot.orders[1].id = input.snapshot.orders[0].id;
    expect(aiRequestSchema.safeParse(input).success).toBe(false);
    input.snapshot = snapshot();
    input.snapshot.orders[0].actualCost = -10;
    expect(aiRequestSchema.safeParse(input).success).toBe(false);
  });

  it("recalculates changed costs and never shares snapshots between visitors", () => {
    const a = snapshot();
    const b = snapshot();
    const baseline = buildOperationalAnalysis(b, now);
    a.orders[0].actualCost += 50_000;
    const changed = buildOperationalAnalysis(a, now);
    expect(changed.totals.actualCost).toBe(baseline.totals.actualCost + 50_000);
    expect(buildOperationalAnalysis(b, now)).toEqual(baseline);
    expect(getCalculatedFallback("Costo OT-1001", changed)).toContain("OT-1001");
  });

  it("uses Chihuahua date and status kinds, even after renaming states", () => {
    const data = snapshot();
    data.orders = data.orders.slice(0, 1);
    data.orders[0].dueDate = "2026-10-26";
    data.orders[0].statusId = data.statuses.find((s) => s.kind === "pending")!.id;
    expect(buildOperationalAnalysis(data, new Date("2026-10-27T05:00:00Z")).totals.overdue).toBe(0);
    expect(buildOperationalAnalysis(data, new Date("2026-10-27T07:00:00Z")).totals.overdue).toBe(1);
    const done = data.statuses.find((s) => s.kind === "completed")!;
    done.name = "Finalizada";
    data.orders[0].statusId = done.id;
    expect(buildOperationalAnalysis(data, new Date("2026-10-27T07:00:00Z")).totals.overdue).toBe(0);
  });

  it("does not offset an overrun with savings on another order", () => {
    const data = snapshot();
    data.orders = data.orders.slice(0, 2);
    data.orders[0].estimatedCost = 100;
    data.orders[0].actualCost = 150;
    data.orders[1].estimatedCost = 100;
    data.orders[1].actualCost = 0;
    expect(buildOperationalAnalysis(data, now).totals.overrun).toBe(50);
  });

  it("explains the boundary for private requests, empty data and missing folios", () => {
    const data = snapshot();
    data.orders = [];
    const analysis = buildOperationalAnalysis(data, now);
    expect(getCalculatedFallback("Consulta Enfoca", analysis)).toContain("No tengo acceso a Enfoca");
    expect(getCalculatedFallback("OT-9999", analysis)).toContain("No se encontró");
    expect(getCalculatedFallback("Resumen", analysis)).toContain("0 órdenes");
  });
});
