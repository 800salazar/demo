import type { DemoData } from "@/lib/demo/types";
import { activitySeries } from "@/lib/demo/workflow";
import { formatMXN } from "@/lib/format";
import type { OperationalSnapshot } from "./schema";

/** Only these operational fields leave this visitor's browser. */
export function getOperationalSnapshot(data: DemoData): OperationalSnapshot {
  return {
    departments: data.departments.map(({ id, name }) => ({ id, name })),
    priorities: data.priorities.map(({ id, name }) => ({ id, name })),
    statuses: data.statuses.map(({ id, name, kind }) => ({ id, name, kind })),
    orders: data.orders.map(order => ({
      id: order.id, folio: order.folio, title: order.title, departmentId: order.departmentId,
      priorityId: order.priorityId, statusId: order.statusId, assignee: order.assignee,
      dueDate: order.dueDate, estimatedCost: order.estimatedCost, actualCost: order.actualCost,
      observations: order.observations.slice(0, 800), description: order.description.slice(0, 800),
      statusLabel: order.statusLabel, priorityLabel: order.priorityLabel,
      createdAt: order.createdAt, completedAt: order.completedAt,
      requiredRemaining: data.checklist.filter(i => i.orderId === order.id && i.required && !i.done).length,
      recentChanges: data.history.filter(h => h.orderId === order.id).slice(-2).map(h => ({ at: h.at, detail: h.detail.slice(0, 400) })),
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
      priority: order.priorityLabel ?? snapshot.priorities.find((p) => p.id === order.priorityId)!.name,
      status: order.statusLabel ?? status.name, kind: status.kind, dueDate: order.dueDate,
      overdue: status.kind !== "completed" && order.dueDate < today,
      estimatedCost: order.estimatedCost, actualCost: order.actualCost,
      overrun: Math.max(0, order.actualCost - order.estimatedCost), observations: order.observations,
      description: order.description, requiredRemaining: order.requiredRemaining, recentChanges: order.recentChanges,
      createdAt: order.createdAt, completedAt: order.completedAt,
    };
  });
  const sum = (items: typeof orders, key: "actualCost" | "estimatedCost" | "overrun") =>
    Math.round(items.reduce((total, o) => total + o[key], 0) * 100) / 100;
  return {
    asOf: now.toISOString(), today, timeZone: "America/Chihuahua", currency: "MXN",
    activity: activitySeries(snapshot.orders.filter(o => o.createdAt).map(o => ({
      folio: o.folio, createdAt: o.createdAt!, completedAt: o.completedAt ?? null,
    })), now),
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
        estimatedCost: sum(items, "estimatedCost"), overrun: sum(items, "overrun"), overdue: items.filter((o) => o.overdue).length };
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
  // Respect explicit departments in the fallback, using the same original visitor snapshot.
  const normalized = question.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const requested = data.departments.filter(d => normalized.includes(d.department.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()));
  if (requested.length) {
    const names = new Set(requested.map(d => d.department));
    const orders = data.orders.filter(o => names.has(o.department));
    data = { ...data, orders, departments: requested, totals: {
      ...data.totals, orders: orders.length,
      pending: orders.filter(o => o.kind === "pending").length, inProgress: orders.filter(o => o.kind === "in_progress").length,
      completed: orders.filter(o => o.kind === "completed").length, overdue: orders.filter(o => o.overdue).length,
      actualCost: Math.round(orders.reduce((sum, o) => sum + o.actualCost, 0) * 100) / 100,
      estimatedCost: Math.round(orders.reduce((sum, o) => sum + o.estimatedCost, 0) * 100) / 100,
      overrun: Math.round(orders.reduce((sum, o) => sum + o.overrun, 0) * 100) / 100,
    }, activity: data.activity.map(p => {
      const folios = new Set(orders.map(o => o.folio));
      const createdFolios = p.createdFolios.filter(f => folios.has(f)), completedFolios = p.completedFolios.filter(f => folios.has(f));
      return { ...p, createdFolios, completedFolios, created: createdFolios.length, completed: completedFolios.length };
    }) };
  }
  const day = question.match(/\d{4}-\d{2}-\d{2}/)?.[0];
  if (day && /actividad|pico|cread|cerrad/i.test(question)) {
    const point = data.activity.find(p => p.day === day);
    if (point) return `**${day}: ${point.created} creadas y ${point.completed} cerradas**.\nCreadas: ${point.createdFolios.join(", ") || "ninguna"}.\nCerradas: ${point.completedFolios.join(", ") || "ninguna"}.\nEstos registros explican el conteo; no prueban una causa operativa.`;
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
    return `${requested.length ? `Departamento: ${requested.map(d => d.department).join(", ")}.\nPresupuesto: ${formatMXN(data.totals.estimatedCost)} · Costo real: ${formatMXN(data.totals.actualCost)}.\n` : ""}${top && !requested.length ? `Mayor costo: **${top.department}, ${formatMXN(top.actualCost)}**.\n` : ""}Sobrecostos por orden: **${formatMXN(data.totals.overrun)}**.\n${overruns.length ? `Órdenes sobre presupuesto: ${overruns.map((o) => `${o.folio} (+${formatMXN(o.overrun)})`).join(", ")}.` : "No hay órdenes sobre presupuesto."}${/ahorr/i.test(question) ? "\nEstas cifras no confirman ahorros futuros." : ""}`;
  }
  return `${data.totals.orders} órdenes: ${data.totals.pending} pendientes, ${data.totals.inProgress} en proceso y ${data.totals.completed} completadas.\nRetrasadas: ${data.totals.overdue}. Costo real: ${formatMXN(data.totals.actualCost)}.\nPuedo calcular costos, retrasos o consultar un folio como OT-1001.`;
}
