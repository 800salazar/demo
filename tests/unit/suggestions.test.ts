import { describe, expect, it } from "vitest";
import { getOperationalSnapshot } from "@/lib/ai/analysis";
import { createSeedData } from "@/lib/demo/seed";
import { emptyOrderDraft } from "@/lib/ai/order-draft";
import { fallbackSuggestions, readSuggestions, suggestionsSchema } from "@/lib/ai/suggestions";
import { aiRequestSchema } from "@/lib/ai/schema";

const snapshot = getOperationalSnapshot(createSeedData(new Date("2026-11-16T18:00:00Z")));
describe("contextual suggestions", () => {
  it("accepts one to three concise labels with complete prompts, rejecting long payloads", () => {
    const one = [{ label: "Analizar área", question: "Analiza el presupuesto y costo real del área de Mantenimiento." }];
    expect(suggestionsSchema.safeParse(one).success).toBe(true);
    expect(suggestionsSchema.safeParse([]).success).toBe(false);
    expect(suggestionsSchema.safeParse([...one, ...one, ...one, ...one]).success).toBe(false);
    expect(readSuggestions([{ label: "Largo", question: "x".repeat(301) }])).toEqual([]);
    expect(readSuggestions([{ ...one[0], execute: "save" }])).toEqual([]);
  });
  it("removes invalid or duplicate suggestions and never repeats the current question", () => {
    expect(readSuggestions([
      { label: "Repetida", question: "¿Analiza costos?" },
      { label: "Área", question: "Analiza mantenimiento" },
      { label: "area", question: "Otro análisis de costos" },
      { label: "Duplicada", question: "ANALIZA mantenimiento!" },
      { label: "Comparar áreas", question: "Compara los departamentos" },
      { label: "Revisar retrasos", question: "Prioriza los retrasos" },
      { label: "Extra", question: "Otro seguimiento" },
    ], "Analiza costos").map(s => s.label)).toEqual(["Área", "Comparar áreas", "Revisar retrasos"]);
  });
  it("keeps the named department and generates cost prompts from this visitor's catalogs", () => {
    const custom = { ...snapshot, departments: snapshot.departments.map((d, i) => ({ ...d, name: i === 0 ? "Área especial" : d.name })) };
    const items = fallbackSuggestions("Investiga costos del area especial", custom);
    expect(items).toHaveLength(2);
    expect(items[0].label).toBe("Analizar Área especial");
    expect(items[0].question).toContain("Área especial");
    expect(items[0].question.length).toBeGreaterThan(items[0].label.length);
    expect(suggestionsSchema.safeParse(items).success).toBe(true);
  });
  it("offers draft review and a fresh request without supplying invented field values", () => {
    const items = fallbackSuggestions("La fecha es mañana", snapshot, emptyOrderDraft());
    expect(items.map(s => s.label)).toEqual(["Revisar pendientes", "Nueva solicitud"]);
    expect(items[1].question).toContain("sin reutilizar datos");
    expect(items[1].question).toContain("No guardes");
  });
  it("retains a real folio in complete follow-up prompts", () => {
    const items = fallbackSuggestions("Revisa OT-1001", snapshot);
    expect(items.every(s => s.question.includes("OT-1001"))).toBe(true);
    expect(fallbackSuggestions("Revisa OT-999999", snapshot)[0].question).not.toContain("OT-999999");
  });
  it("keeps catalog names from producing prompts beyond the request limit", () => {
    const name = "Departamento ".repeat(9).trim();
    const custom = { ...snapshot, departments: [{ ...snapshot.departments[0], name }] };
    expect(suggestionsSchema.safeParse(fallbackSuggestions(`Revisa retrasos de ${name}`, custom)).success).toBe(true);
  });
  it("bounds conversation history and rejects arbitrary context or extra private fields", () => {
    const turn = { question: "Analiza costos", answer: "Respuesta de ejemplo" };
    const request = { question: "Compara esta área", snapshot, history: [turn, turn] };
    expect(aiRequestSchema.safeParse(request).success).toBe(true);
    expect(aiRequestSchema.safeParse({ ...request, history: [turn, turn, turn] }).success).toBe(false);
    expect(aiRequestSchema.safeParse({ ...request, history: [{ ...turn, secret: "private" }] }).success).toBe(false);
  });
});
