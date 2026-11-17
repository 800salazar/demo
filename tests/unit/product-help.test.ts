import { describe, expect, it } from "vitest";
import { findProductHelp, isProductHelpId, productHelp } from "@/lib/ai/product-help";
import { guides } from "@/lib/guide/steps";

describe("curated product help", () => {
  it.each([
    ["como hacer un cambio de estado?", "changeStatus"],
    ["como canbiar un estdo", "changeStatus"],
    ["editar estado", "changeStatus"],
    ["kmo cambio el estatus", "changeStatus"],
    ["cmo edtar el costo real", "cost"],
    ["como cambiar el csto", "cost"],
    ["CAMBIAR COSTO REAL", "cost"],
    ["quiero cambiar el cosot real", "cost"],
    ["como renonbrar un estado", "renameStatus"],
    ["dond descargo el reporte", "report"],
    ["¿Dónde puedo cambiar el estado de OT-1001?", "changeStatus"],
    ["Quiero renombrar un estado", "renameStatus"],
    ["¿Cómo cambio el costo real?", "cost"],
    ["¿Cómo completo las actividades?", "checklist"],
    ["¿Cómo descargo el PDF?", "report"],
  ])("routes %s to a verified guide", (question, expected) => {
    const id = findProductHelp(question)!;
    expect(id).toBe(expected);
    expect(guides[productHelp[id].guide]).toHaveLength(1);
  });
  it("keeps operational analysis and private requests out of help routing", () => {
    expect(findProductHelp("¿Qué órdenes cambiaron de estado?")).toBeUndefined();
    expect(findProductHelp("¿Por qué cambió el costo real?")).toBeUndefined();
    expect(findProductHelp("¿Cuál es el costo real?")).toBeUndefined();
    expect(findProductHelp("Analiza las actividades pendientes")).toBeUndefined();
    expect(findProductHelp("¿Cómo cambio estados de Enfoca?")).toBeUndefined();
    expect(isProductHelpId("https://evil.test")).toBe(false);
    expect(isProductHelpId("__proto__")).toBe(false);
  });
});
