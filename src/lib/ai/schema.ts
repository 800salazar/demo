import { z } from "zod";

import { MAX_QUESTION_LENGTH } from "./limits";
const id = z.string().min(1).max(80);
const name = z.string().trim().min(1).max(120);
const money = z.number().finite().min(0).max(1_000_000_000);

// Allowlist: never accept arbitrary context, credentials, URLs or external records.
export const operationalSnapshotSchema = z.strictObject({
  departments: z.array(z.strictObject({ id, name })).min(1).max(30),
  priorities: z.array(z.strictObject({ id, name })).min(1).max(30),
  statuses: z.array(z.strictObject({ id, name, kind: z.enum(["pending", "in_progress", "completed"]) })).min(1).max(30),
  orders: z.array(z.strictObject({
    id,
    folio: z.string().regex(/^OT-\d{1,8}$/),
    title: z.string().trim().min(1).max(200),
    departmentId: id,
    priorityId: id,
    statusId: id,
    assignee: name,
    dueDate: z.iso.date(),
    estimatedCost: money,
    actualCost: money,
    observations: z.string().max(800),
  })).max(100),
}).superRefine((data, ctx) => {
  for (const key of ["departments", "priorities", "statuses", "orders"] as const) {
    if (new Set(data[key].map((item) => item.id)).size !== data[key].length) {
      ctx.addIssue({ code: "custom", path: [key], message: "Hay identificadores repetidos." });
    }
  }
  if (new Set(data.orders.map((order) => order.folio)).size !== data.orders.length) {
    ctx.addIssue({ code: "custom", path: ["orders"], message: "Hay folios repetidos." });
  }
  data.orders.forEach((order, index) => {
    if (!data.departments.some((d) => d.id === order.departmentId) ||
        !data.priorities.some((p) => p.id === order.priorityId) ||
        !data.statuses.some((s) => s.id === order.statusId)) {
      ctx.addIssue({ code: "custom", path: ["orders", index], message: "Una orden tiene referencias inválidas." });
    }
  });
});

export const aiRequestSchema = z.strictObject({
  question: z.string().trim().min(3, "Escribe una pregunta más completa.")
    .max(MAX_QUESTION_LENGTH, `La pregunta no puede exceder ${MAX_QUESTION_LENGTH} caracteres.`),
  snapshot: operationalSnapshotSchema,
});

export type OperationalSnapshot = z.infer<typeof operationalSnapshotSchema>;
export type AiRequest = z.infer<typeof aiRequestSchema>;
