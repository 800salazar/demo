import { describe, expect, it } from "vitest";
import { createSeedData } from "@/lib/demo/seed";
import { draftCatalogs, draftContextSchema, draftReview, emptyOrderDraft, validateDraft } from "@/lib/ai/order-draft";

const data = createSeedData(new Date("2026-11-16T18:00:00Z"));
const context = { ...draftCatalogs(data), draft: null };
describe("AI order drafts", () => {
  it("keeps absent fields unknown and reports required fields, including a missing budget", () => {
    const draft = validateDraft(emptyOrderDraft(), context);
    expect(draft.estimatedCost).toBeNull();
    expect(draftReview(draft)).toContain("presupuesto");
    expect(draftReview(draft)).toContain("responsable");
    expect(draftReview(draft)).not.toContain("detalle");
  });
  it("accepts zero as an explicitly supplied budget and requires review", () => {
    const draft = { title: "Revisar sensor", departmentId: context.departments[0].id, categoryId: context.categories[0].id, priorityId: context.priorities[0].id, assignee: "Ana", dueDate: "2026-11-20", estimatedCost: 0, description: null };
    expect(draftReview(validateDraft(draft, context))).toContain("Borrador completo");
    expect(data.orders).toHaveLength(30);
  });
  it.each(["departmentId", "categoryId", "priorityId"])("rejects invented %s and never changes the store", key => {
    expect(() => validateDraft({ ...emptyOrderDraft(), [key]: "invented" }, context)).toThrow();
    expect(data.orders).toHaveLength(30);
  });
  it("uses active renamed catalogs only", () => {
    const renamed = { ...data, departments: data.departments.map((d, i) => ({ ...d, name: `Área ${i}`, active: i === 0 })) };
    expect(draftCatalogs(renamed).departments).toEqual([{ id: data.departments[0].id, name: "Área 0" }]);
  });
  it("rejects impossible dates, negative budgets and arbitrary fields", () => {
    for (const invalid of [{ dueDate: "2026-02-30" }, { estimatedCost: -10 }, { statusId: "completed" }, { sql: "select *" }]) {
      expect(() => validateDraft({ ...emptyOrderDraft(), ...invalid }, context)).toThrow();
    }
    expect(draftContextSchema.safeParse({ ...context, secret: "hidden" }).success).toBe(false);
  });
});
