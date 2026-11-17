import { describe, expect, it } from "vitest";
import { editCatalogItem, addCatalogItem, removeCatalogItem, catalogReference } from "@/lib/demo/catalog";
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

it("renames departments and types globally, preserving associations and previous history", async () => {
  const { renameNamedCatalog } = await import("@/lib/demo/catalog");
  const data = seed();
  for (const key of ["departments", "categories"] as const) {
    const item = data[key][0];
    const updated = renameNamedCatalog(data, key, item.id, "Nuevo nombre");
    expect(updated[key][0].name).toBe("Nuevo nombre");
    expect(updated.orders).toBe(data.orders);
    expect(updated.history.slice(0, data.history.length)).toEqual(data.history);
    expect(() => renameNamedCatalog(data, key, item.id, data[key][1].name)).toThrow(/ya existe/);
  }
});


for (const catalog of ["departments", "categories", "statuses", "priorities"] as const) {
  describe(`managed ${catalog}`, () => {
    it("adds unique active entries without changing existing identifiers or references", () => {
      const data = seed(); const next = addCatalogItem(data, catalog, " Nueva opción ", { color: "green", kind: "in_progress" });
      expect(next[catalog].at(-1)).toMatchObject({ name: "Nueva opción", active: true });
      expect(next[catalog].at(-1)!.id).not.toBe(data[catalog][0].id);
      expect(next.orders).toBe(data.orders); expect(next[catalog].slice(0, -1)).toEqual(data[catalog]);
      expect(() => addCatalogItem(next, catalog, "NUEVA OPCIÓN", { kind: "pending" })).toThrow(/ya existe/);
      expect(() => addCatalogItem(data, catalog, " ")).toThrow();
    });
    it("retires from new assignments while keeping existing references and previous history", () => {
      const data = seed(); const item = catalog === "statuses" ? data.statuses.find(s => s.kind === "in_progress")! : data[catalog][0];
      const next = removeCatalogItem(data, catalog, item.id, "future");
      expect(next[catalog].find(i => i.id === item.id)?.active).toBe(false);
      expect(next.orders).toBe(data.orders); expect(next.history.slice(0, data.history.length)).toEqual(data.history);
      expect(operationalSnapshotSchema.safeParse(getOperationalSnapshot(next)).success).toBe(true);
    });
    it("replaces existing references without orphaning orders or rewriting old history", () => {
      const data = seed(); const item = catalog === "statuses" ? data.statuses.find(s => s.kind === "in_progress")! : data[catalog][0];
      const target = data[catalog].find(i => i.id !== item.id)!;
      const reference = catalogReference[catalog];
      const next = removeCatalogItem(data, catalog, item.id, "replace", target.id);
      expect(next[catalog].some(i => i.id === item.id)).toBe(false);
      expect(next.orders.filter(o => data.orders.find(old => old.id === o.id)![reference] === item.id).every(o => o[reference] === target.id)).toBe(true);
      expect(next.history.slice(0, data.history.length)).toEqual(data.history);
      expect(operationalSnapshotSchema.safeParse(getOperationalSnapshot(next)).success).toBe(true);
      expect(() => removeCatalogItem(data, catalog, item.id, "replace", "missing")).toThrow(/activa/);
      expect(() => removeCatalogItem(data, catalog, item.id, "replace", item.id)).toThrow();
    });
    it("deletes an unused option and protects the last active option", () => {
      const data = seed(); const added = addCatalogItem(data, catalog, "Sin uso", { kind: "in_progress" });
      const next = removeCatalogItem(added, catalog, added[catalog].at(-1)!.id, "future");
      expect(next[catalog]).toEqual(data[catalog]); expect(next.history).toEqual(data.history);
      const oneActive = { ...data, [catalog]: data[catalog].map((i, index) => ({ ...i, active: index === 0 })) };
      expect(() => removeCatalogItem(oneActive, catalog, data[catalog][0].id, "future")).toThrow(/al menos una/);
    });
  });
}

it("requires state semantics, preserves initial/final states and blocks closing unverified orders", () => {
  const data = seed();
  expect(() => addCatalogItem(data, "statuses", "Sin comportamiento")).toThrow(/comportamiento/);
  const pending = data.statuses.find(s => s.kind === "pending")!;
  const completed = data.statuses.find(s => s.kind === "completed")!;
  expect(() => removeCatalogItem(data, "statuses", pending.id, "future")).toThrow(/pendiente/);
  expect(() => removeCatalogItem(data, "statuses", completed.id, "future")).toThrow(/completado/);
  const progress = data.statuses.find(s => s.kind === "in_progress")!;
  expect(() => removeCatalogItem(data, "statuses", progress.id, "replace", completed.id)).toThrow(/actividades/);
  const checked = { ...data, checklist: data.checklist.map(i => ({ ...i, done: true })) };
  const now = new Date("2026-11-16T18:00:00Z");
  const closed = removeCatalogItem(checked, "statuses", progress.id, "replace", completed.id, now);
  expect(closed.orders.filter(o => data.orders.find(old => old.id === o.id)!.statusId === progress.id).every(o => o.completedAt === now.toISOString())).toBe(true);
});

it("keeps the AI catalog limit and preserved labels consistent after replacement", () => {
  let data = seed();
  while (data.departments.length < 30) data = addCatalogItem(data, "departments", `Área ${data.departments.length}`);
  expect(() => addCatalogItem(data, "departments", "Exceso")).toThrow(/30/);
  const original = seed(); const id = original.priorities[0].id;
  const renamed = editCatalogItem(original, "priorities", id, "Urgente", "red", "future");
  const replaced = removeCatalogItem(renamed, "priorities", id, "replace", original.priorities[1].id);
  expect(replaced.orders.filter(o => original.orders.find(old => old.id === o.id)!.priorityId === id).every(o => !o.priorityLabel)).toBe(true);
});
