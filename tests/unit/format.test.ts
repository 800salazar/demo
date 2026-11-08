import { describe, expect, it } from "vitest";
import { formatCostInput, formatMexicanDate, formatMXN, parseCostInput } from "@/lib/format";

describe("formatos operativos", () => {
  it("agrupa la captura y conserva los centavos", () => {
    expect(formatCostInput("1234567.5")).toBe("1,234,567.5");
    expect(parseCostInput("1,234,567.50")).toBe(1234567.5);
    expect(parseCostInput(".50")).toBe(0.5);
    expect(formatMXN(1234567.5)).toBe("$1,234,567.50");
  });
  it("rechaza cifras inválidas, excesos y más de dos decimales", () => {
    for (const value of ["", "-1", "1.234", "1000000000.01", "abc"]) expect(parseCostInput(value)).toBeNull();
  });
  it("muestra el mes mexicano sin cambios por zona horaria", () => {
    expect(formatMexicanDate("2026-01-05")).toBe("05 ene 2026");
    expect(formatMexicanDate("2026-12-31")).toBe("31 dic 2026");
  });
});
