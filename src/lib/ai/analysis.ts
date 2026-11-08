import type { DemoData } from "@/lib/demo/types";
import { formatMXN } from "@/lib/format";
import type { OperationalSnapshot } from "./schema";

/** Only these operational fields leave this visitor's browser. */
export function getOperationalSnapshot(data: DemoData): OperationalSnapshot {
  return {
    departments: data.departments.map(({ id, name }) => ({ id, name })),
    priorities: data.priorities.map(({ id, name }) => ({ id, name })),
    statuses: data.statuses.map(({ id, name, kind }) => ({ id, name, kind })),
    orders: data.orders.map(({ id, folio, title, departmentId, priorityId, statusId, assignee,
      dueDate, estimatedCost, actualCost, observations }) => ({
      id, folio, title, departmentId, priorityId, statusId, assignee,
      dueDate, estimatedCost, actualCost, observations,
    })),
  };
}

export function buildOperationalAnalysis(snapshot: OperationalSnapshot, now: Date) {
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Chihuahua", year: "numeric", month: "2-digit", day: "2-digit",
  }).format(now);
  const orders = snapshot.orders.map((order) => {
    const status = snapshot.statuses.find((s) => s.id === order.statusId)!;
    return {
      folio: order.folio, title: order.title, assignee: order.assignee,
      departmentId: order.departmentId,
      department: snapshot.departments.find((d) => d.id === order.departmentId)!.name,
      priority: snapshot.priorities.find((p) => p.id === order.priorityId)!.name,
      status: status.name, kind: status.kind, dueDate: order.dueDate,
      overdue: status.kind !== "completed" && order.dueDate < today,
      estimatedCost: order.estimatedCost, actualCost: order.actualCost,
      overrun: Math.max(0, order.actualCost - order.estimatedCost), observations: order.observations,
    };
  });
  const sum = (items: typeof orders, key: "actualCost" | "estimatedCost" | "overrun") =>
    Math.round(items.reduce((total, o) => total + o[key], 0) * 100) / 100;
  return {
    asOf: now.toISOString(), today, timeZone: "America/Chihuahua", currency: "MXN",
    totals: {
      orders: orders.length,
      pending: orders.filter((o) => o.kind === "pending").length,
      inProgress: orders.filter((o) => o.kind === "in_progress").length,
      completed: orders.filter((o) => o.kind === "completed").length,
      overdue: orders.filter((o) => o.overdue).length,
      estimatedCost: sum(orders, "estimatedCost"), actualCost: sum(orders, "actualCost"),
      overrun: sum(orders, "overrun"),
    },
    departments: snapshot.departments.map((d) => {
      const items = orders.filter((o) => o.departmentId === d.id);
      return { department: d.name, orders: items.length, actualCost: sum(items, "actualCost"),
        estimatedCost: sum(items, "estimatedCost"), overdue: items.filter((o) => o.overdue).length };
    }).sort((a, b) => b.actualCost - a.actualCost),
    orders,
  };
}

export type OperationalAnalysis = ReturnType<typeof buildOperationalAnalysis>;

/** Explicitly labelled calculations, never presented as generated AI. */
export function getCalculatedFallback(question: string, data: OperationalAnalysis): string {
  if (/enfoca|privad|contraseñ|secreto|api.?key/i.test(question)) {
    return "Solo puedo analizar las órdenes ficticias de este navegador. No tengo acceso a Enfoca, credenciales ni información privada.";
  }
  const folio = question.match(/OT-\d+/i)?.[0].toUpperCase();
  if (folio) {
    const order = data.orders.find((o) => o.folio === folio);
    return order
      ? `${order.folio}: ${order.title}. Estado: ${order.status}. Responsable: ${order.assignee}. Compromiso: ${order.dueDate}. Costo real: ${formatMXN(order.actualCost)}; estimado: ${formatMXN(order.estimatedCost)}. ${order.overdue ? "Está retrasada." : "No tiene retraso abierto."}`
      : `No se encontró ${folio} en las órdenes de esta demostración.`;
  }
  if (/retras|vencid|atras/i.test(question)) {
    const late = data.orders.filter((o) => o.overdue).sort((a, b) => a.dueDate.localeCompare(b.dueDate));
    return late.length
      ? `**${late.length} órdenes retrasadas**. Revisa primero las de fecha más antigua:\n${late.map((o) => `• ${o.folio} · ${o.department} · ${o.dueDate}`).join("\n")}`
      : "No hay órdenes retrasadas.";
  }
  if (/costo|gast|presupuest|ahorr|sobrecosto/i.test(question)) {
    const top = data.departments[0];
    const overruns = data.orders.filter((o) => o.overrun > 0);
    return `${top ? `Mayor costo: **${top.department}, ${formatMXN(top.actualCost)}**.\n` : ""}Sobrecostos por orden: **${formatMXN(data.totals.overrun)}**.\n${overruns.length ? `Órdenes sobre presupuesto: ${overruns.map((o) => `${o.folio} (+${formatMXN(o.overrun)})`).join(", ")}.` : "No hay órdenes sobre presupuesto."}${/ahorr/i.test(question) ? "\nEstas cifras no confirman ahorros futuros." : ""}`;
  }
  return `${data.totals.orders} órdenes: ${data.totals.pending} pendientes, ${data.totals.inProgress} en proceso y ${data.totals.completed} completadas.\nRetrasadas: ${data.totals.overdue}. Costo real: ${formatMXN(data.totals.actualCost)}.\nPuedo calcular costos, retrasos o consultar un folio como OT-1001.`;
}
