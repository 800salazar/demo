import { describe, expect, it } from "vitest";
import { createSeedData } from "@/lib/demo/seed";
import { summarizeByDepartment } from "@/lib/demo/selectors";

describe("desglose por departamento", () => {
  it("incluye cada orden y actualiza el total y el desglose al cambiar un costo", () => {
    const data = createSeedData(new Date("2026-10-26T18:00:00Z"));
    const order = data.orders[0];
    const before = summarizeByDepartment(data).find((item) => item.departmentId === order.departmentId)!;
    expect(before.details).toHaveLength(before.orders);
    expect(before.details.reduce((sum, item) => sum + item.actualCost, 0)).toBe(before.actualCost);
    order.actualCost += 123.45;
    const after = summarizeByDepartment(data).find((item) => item.departmentId === order.departmentId)!;
    expect(after.details.find((item) => item.id === order.id)?.actualCost).toBe(order.actualCost);
    expect(after.actualCost).toBeCloseTo(before.actualCost + 123.45, 2);
    expect(before.details.find((item) => item.id === order.id)?.actualCost).not.toBe(order.actualCost);
  });
});
