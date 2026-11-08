export type AnswerPart = { text: string; bold: boolean };

/** Only inline bold is interpreted; everything else stays plain text. */
export function answerParts(value: string): AnswerPart[] {
  return value.split(/(\*\*[^*\n]+\*\*)/g).filter(Boolean).map((part) => ({
    text: part.startsWith("**") && part.endsWith("**") ? part.slice(2, -2) : part,
    bold: part.startsWith("**") && part.endsWith("**"),
  }));
}

export function plainAnswer(value: string): string {
  return answerParts(value).map((part) => part.text).join("");
}
