import { describe, expect, it } from "vitest";
import { editCatalogItem } from "@/lib/demo/catalog";
import { createSeedData } from "@/lib/demo/seed";
import { getOperationalSnapshot } from "@/lib/ai/analysis";
import { operationalSnapshotSchema } from "@/lib/ai/schema";

const seed = () => createSeedData(new Date("2026-11-08T12:00:00Z"));
describe("visitor catalog configuration", () => {
  it("renames and recolors without changing IDs, completion rules, orders or the original data", () => {
    const data = seed();
    const status = data.statuses[0];
    const updated = editCatalogItem(data, "statuses", status.id, "  Por iniciar  ", "violet");
    expect(updated.statuses[0]).toEqual({ ...status, name: "Por iniciar", color: "violet" });
    expect(updated.orders).toBe(data.orders);
    expect(updated.statuses[0].kind).toBe(status.kind);
    expect(data.statuses[0]).toEqual(status);
    const snapshot = getOperationalSnapshot(updated);
    expect(snapshot.statuses[0].name).toBe("Por iniciar");
    expect(operationalSnapshotSchema.safeParse(snapshot).success).toBe(true);
  });
  it("preserves priority IDs, ordering and associations", () => {
    const data = seed();
    const updated = editCatalogItem(data, "priorities", data.priorities[0].id, "Atención inmediata", "red");
    expect(updated.priorities[0]).toEqual({ ...data.priorities[0], name: "Atención inmediata", color: "red" });
    expect(updated.statuses).toBe(data.statuses);
    expect(updated.orders).toBe(data.orders);
  });
  it("rejects blank, excessive and duplicate names, invalid colors and missing records", () => {
    const data = seed();
    const id = data.statuses[0].id;
    expect(() => editCatalogItem(data, "statuses", id, "  ", "blue")).toThrow();
    expect(() => editCatalogItem(data, "statuses", id, "x".repeat(121), "blue")).toThrow();
    expect(() => editCatalogItem(data, "statuses", id, data.statuses[1].name.toUpperCase(), "blue")).toThrow(/ya existe/);
    expect(() => editCatalogItem(data, "statuses", "absent", "Estado", "blue")).toThrow();
    expect(() => editCatalogItem(data, "statuses", id, "Estado", "unknown" as "blue")).toThrow();
  });
});
