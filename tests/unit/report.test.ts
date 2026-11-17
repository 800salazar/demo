import { describe, expect, it } from "vitest";
import { createSeedData } from "@/lib/demo/seed";
import { buildOperationalPdf, getReportScope } from "@/lib/demo/report";

const now = new Date("2026-11-17T05:30:00Z"); // Still November 16 in Chihuahua.
function fixture() {
  const data = createSeedData(now);
  const base = data.orders[0];
  data.orders = [
    { ...base, id: "recent", folio: "OT-2001", title: "Alta reciente", createdAt: "2026-11-16T18:00:00Z", completedAt: null },
    { ...base, id: "older", folio: "OT-2002", title: "Alta de catorce dias", createdAt: "2026-11-05T18:00:00Z", completedAt: null },
    { ...base, id: "boundary", folio: "OT-2003", title: "Limite de siete dias", createdAt: "2026-11-10T06:00:00Z", completedAt: null },
    { ...base, id: "closed", folio: "OT-2004", title: "Cierre reciente de orden antigua", createdAt: "2026-10-01T18:00:00Z", completedAt: "2026-11-15T18:00:00Z" },
    { ...base, id: "changed", folio: "OT-2005", title: "Cambio reciente de orden antigua", createdAt: "2026-10-01T18:00:00Z", completedAt: null },
    { ...base, id: "excluded", folio: "OT-2006", title: "Orden sin movimientos recientes", createdAt: "2026-10-01T18:00:00Z", completedAt: null },
    { ...base, id: "future", folio: "OT-2007", title: "Alta futura", createdAt: "2026-11-17T05:45:00Z", completedAt: null },
  ];
  data.history = [{ id: "h1", orderId: "changed", at: "2026-11-15T18:00:00Z", action: "updated", detail: "Cambio comprobable del periodo" }];
  data.checklist = [{ id: "c1", orderId: "recent", label: "Verificar sensor de prueba", required: true, done: false }];
  return data;
}
describe("reports by profile and period", () => {
  it("includes seven calendar days in Chihuahua by creation, closure or recorded change, excluding future events", () => {
    const data = fixture();
    const scope = getReportScope(data, now, 7);
    expect(scope.start).toBe("2026-11-10"); expect(scope.end).toBe("2026-11-16");
    expect(scope.data.orders.map(o => o.id)).toEqual(["recent", "boundary", "closed", "changed"]);
    expect(scope.activity).toHaveLength(7);
    expect(scope.activity.reduce((n, p) => n + p.created, 0)).toBe(2);
    expect(scope.activity.reduce((n, p) => n + p.completed, 0)).toBe(1);
    expect(data.orders).toHaveLength(7);
  });
  it("expands to fourteen days without including older inactive orders", () => {
    const scope = getReportScope(fixture(), now, 14);
    expect(scope.start).toBe("2026-11-03");
    expect(scope.data.orders.map(o => o.id)).toEqual(["recent", "older", "boundary", "closed", "changed"]);
    expect(scope.activity).toHaveLength(14);
  });
  it("adapts the content to the profile and excludes records outside the chosen period", () => {
    const data = fixture();
    const operator = buildOperationalPdf(data, now, { view: "operador", days: 7 }).output();
    expect(operator).toContain("Verificar sensor de prueba");
    expect(operator).not.toContain("OT-2002"); expect(operator).not.toContain("OT-2006");
    const admin = buildOperationalPdf(data, now, { view: "administrador", days: 14 }).output();
    expect(admin).toContain("Control presupuestal por orden");
    expect(admin).toContain("Cambio comprobable del periodo");
    expect(admin).toContain("OT-2002"); expect(admin).not.toContain("Verificar sensor de prueba");
    const director = buildOperationalPdf(data, now, { view: "direccion", days: 7 }).output();
    expect(director).toContain("Altas y cierres por d");
    expect(director).toContain("Presupuesto y costo actual por departamento");
    expect(director).not.toContain("Verificar sensor de prueba");
    expect(director).toContain("no son saldos hist");
  });
  it("supports empty periods without percentages or invalid numeric chart values", () => {
    const data = { ...fixture(), orders: [], history: [], checklist: [] };
    for (const view of ["operador", "administrador", "direccion"] as const) {
      const output = buildOperationalPdf(data, now, { view, days: 7 }).output();
      expect(output).toContain("No hay"); expect(output).not.toContain("NaN"); expect(output).not.toContain("Infinity");
    }
  });
});
