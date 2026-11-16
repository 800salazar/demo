import { z } from "zod";
import type { DemoData, WorkOrder } from "./types";

export const newOrderSchema = z.object({
  title: z.string().trim().min(3, "Escribe un título de al menos 3 caracteres.").max(200),
  departmentId: z.string().min(1), categoryId: z.string().min(1), priorityId: z.string().min(1),
  assignee: z.string().trim().min(2, "Indica quién atenderá la solicitud.").max(120),
  dueDate: z.iso.date(), estimatedCost: z.number().finite().min(0).max(1_000_000_000),
  description: z.string().trim().max(800),
});
export type NewOrder = z.infer<typeof newOrderSchema>;

export function createOrder(data: DemoData, input: NewOrder, now = new Date()): DemoData {
  const fields = newOrderSchema.parse(input);
  if (data.orders.length >= 100) throw new Error("El demo admite hasta 100 órdenes. Restablécelo para comenzar de nuevo.");
  if (!data.departments.some(d => d.id === fields.departmentId && d.active) ||
      !data.categories.some(c => c.id === fields.categoryId && c.active) ||
      !data.priorities.some(p => p.id === fields.priorityId && p.active)) throw new Error("Selecciona opciones vigentes.");
  const status = data.statuses.find(s => s.kind === "pending" && s.active);
  if (!status) throw new Error("No hay un estado inicial disponible.");
  const number = Math.max(1000, ...data.orders.map(o => Number(o.folio.slice(3)))) + 1;
  const order: WorkOrder = { ...fields, id: crypto.randomUUID(), folio: `OT-${number}`, statusId: status.id,
    createdAt: now.toISOString(), completedAt: null, actualCost: 0, observations: "" };
  return { ...data, orders: [...data.orders, order],
    checklist: [...data.checklist, ...["Confirmar la solicitud con el responsable", "Verificar el resultado antes del cierre"].map(label => ({
      id: crypto.randomUUID(), orderId: order.id, label, required: true, done: false,
    }))],
    history: [...data.history, { id: crypto.randomUUID(), orderId: order.id, at: now.toISOString(), action: "created", detail: `Solicitud creada: ${order.title}. Estado: ${status.name}.` }],
  };
}

export function toggleChecklist(data: DemoData, itemId: string, now = new Date()): DemoData {
  const item = data.checklist.find(i => i.id === itemId);
  if (!item) throw new Error("La actividad ya no existe.");
  const order = data.orders.find(o => o.id === item.orderId);
  if (!order) throw new Error("La orden ya no existe.");
  if (data.statuses.find(s => s.id === order.statusId)?.kind === "completed") throw new Error("Reabre la orden antes de cambiar sus actividades.");
  return { ...data, checklist: data.checklist.map(i => i.id === itemId ? { ...i, done: !i.done } : i),
    history: [...data.history, { id: crypto.randomUUID(), orderId: item.orderId, at: now.toISOString(), action: "updated", detail: `${item.done ? "Pendiente" : "Verificada"}: ${item.label}.` }],
  };
}

export function localDay(value: string | Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Chihuahua", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(value));
}

/** Current creation/closure timestamps, not a historical series of costs or status snapshots. */
export function activitySeries(orders: Pick<WorkOrder, "folio" | "createdAt" | "completedAt">[], now = new Date(), days = 14) {
  const today = localDay(now);
  return Array.from({ length: days }, (_, index) => {
    const date = new Date(`${today}T12:00:00Z`);
    date.setUTCDate(date.getUTCDate() - days + index + 1);
    const day = date.toISOString().slice(0, 10);
    const created = orders.filter(o => o.createdAt && localDay(o.createdAt) === day).map(o => o.folio);
    const completed = orders.filter(o => o.completedAt && localDay(o.completedAt) === day).map(o => o.folio);
    return { day, created: created.length, completed: completed.length, createdFolios: created, completedFolios: completed };
  });
}
