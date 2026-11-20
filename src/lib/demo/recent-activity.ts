import { createSeedData } from "./seed";
import { activitySeries, localDay } from "./workflow";
import type { DemoData, HistoryEntry, WorkOrder, ChecklistItem } from "./types";

/**
 * Adds a small fictional batch only when the previous fourteen calendar days have
 * no creations or closures. Existing orders and history are never changed.
 */
export function addRecentActivity(data: DemoData, now: Date): DemoData {
  if (data.orders.length >= 100) return data;
  if (activitySeries(data.orders, now, 14).some(day => day.created || day.completed)) return data;

  const department = data.departments.find(item => item.active);
  const category = data.categories.find(item => item.active);
  const priority = data.priorities.find(item => item.active);
  const pending = data.statuses.find(item => item.active && item.kind === "pending");
  const completed = data.statuses.find(item => item.active && item.kind === "completed");
  if (!department || !category || !priority || !pending || !completed) return data;

  const templates = createSeedData(now);
  const examples = [templates.orders[0], templates.orders[1], templates.orders[9], templates.orders[2]];
  const orders: WorkOrder[] = [];
  const checklist: ChecklistItem[] = [];
  const history: HistoryEntry[] = [];
  let folio = Math.max(1000, ...data.orders.map(order => Number(order.folio.slice(3)) || 0));

  examples.slice(0, 100 - data.orders.length).forEach((template, index) => {
    const done = index % 2 === 1;
    const status = done ? completed : pending;
    const createdAt = new Date(now.getTime() - (6 - index) * 86400000).toISOString();
    const completedAt = done ? new Date(now.getTime() - (3 - Math.floor(index / 2)) * 86400000).toISOString() : null;
    const dueDate = localDay(new Date(now.getTime() + (done ? -2 : 7) * 86400000));
    const id = crypto.randomUUID();
    const sourceDepartment = data.departments.find(item => item.id === template.departmentId && item.active) ?? department;
    const sourceCategory = data.categories.find(item => item.id === template.categoryId && item.active) ?? category;
    const sourcePriority = data.priorities.find(item => item.id === template.priorityId && item.active) ?? priority;
    const order: WorkOrder = {
      ...template, id, folio: `OT-${++folio}`, departmentId: sourceDepartment.id,
      categoryId: sourceCategory.id, priorityId: sourcePriority.id, statusId: status.id,
      createdAt, dueDate, completedAt, actualCost: done ? template.actualCost : 0,
    };
    orders.push(order);
    checklist.push(...templates.checklist.filter(item => item.orderId === template.id).map(item => ({
      ...item, id: crypto.randomUUID(), orderId: id, done,
    })));
    history.push({ id: crypto.randomUUID(), orderId: id, at: createdAt, action: "created", detail: `Orden de ejemplo creada con prioridad ${sourcePriority.name}` });
    if (completedAt) history.push({ id: crypto.randomUUID(), orderId: id, at: completedAt, action: "status_changed", detail: `Estado: ${pending.name} → ${completed.name}` });
  });
  return { ...data, orders: [...data.orders, ...orders], checklist: [...data.checklist, ...checklist], history: [...data.history, ...history] };
}
