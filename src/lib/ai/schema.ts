import { z } from "zod";

export const MAX_BODY_BYTES = 16 * 1024;
export const MAX_QUESTION_LENGTH = 300;
export const MAX_CONTEXT_CHARS = 12_000;

/**
 * `context` contiene únicamente métricas ya calculadas por la aplicación (no datos crudos).
 * Su forma concreta se define al construir el módulo de IA; aquí solo se acota su tamaño.
 */
export const aiRequestSchema = z.object(
  {
    question: z
      .string({ error: "La pregunta es obligatoria." })
      .trim()
      .min(3, "Escribe una pregunta más completa.")
      .max(MAX_QUESTION_LENGTH, `La pregunta no puede exceder ${MAX_QUESTION_LENGTH} caracteres.`),
    context: z
      .record(z.string(), z.unknown(), { error: "Faltan los datos calculados para responder." })
      .refine((value) => JSON.stringify(value).length <= MAX_CONTEXT_CHARS, "Los datos enviados son demasiado grandes."),
  },
  { error: "La solicitud no tiene el formato esperado." },
);

export type AiRequest = z.infer<typeof aiRequestSchema>;
