import { describe, expect, it } from "vitest";
import { answerParts, plainAnswer } from "@/lib/ai/answer-format";

describe("formato de respuestas", () => {
  it("resalta los datos indicados y copia el texto sin marcadores", () => {
    expect(answerParts("Costo: **$1,500.00** en **Producción**.")).toEqual([
      { text: "Costo: ", bold: false }, { text: "$1,500.00", bold: true },
      { text: " en ", bold: false }, { text: "Producción", bold: true }, { text: ".", bold: false },
    ]);
    expect(plainAnswer("Costo: **$1,500.00**")).toBe("Costo: $1,500.00");
  });
  it("deja HTML y marcadores incompletos como texto literal", () => {
    expect(answerParts("<script>alert(1)</script> **sin cerrar")).toEqual([
      { text: "<script>alert(1)</script> **sin cerrar", bold: false },
    ]);
  });
});
