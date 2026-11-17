import type { ColorKey, DemoData } from "./types";
import { COLOR_STYLES } from "./colors";

export type CatalogKey = "statuses" | "priorities";

/** Update presentation only: identifiers and the meaning of completed states stay intact. */
export function editCatalogItem(data: DemoData, catalog: CatalogKey, id: string, name: string, color: ColorKey, scope: "all" | "future" = "all"): DemoData {
  const trimmed = name.trim();
  if (!trimmed || trimmed.length > 120) throw new Error("Escribe un nombre de 1 a 120 caracteres.");
  if (!Object.hasOwn(COLOR_STYLES, color)) throw new Error("Elige un color disponible.");
  if (!data[catalog].some((item) => item.id === id)) throw new Error("La opción ya no existe. Actualiza el demo.");
  if (data[catalog].some((item) => item.id !== id && item.name.toLocaleLowerCase("es-MX") === trimmed.toLocaleLowerCase("es-MX"))) {
    throw new Error("Ese nombre ya existe en este catálogo.");
  }
  const item = data[catalog].find(item => item.id === id)!;
  const reference = catalog === "statuses" ? "statusId" : "priorityId";
  const label = catalog === "statuses" ? "statusLabel" : "priorityLabel";
  const renamed = trimmed !== item.name;
  const needsSnapshots = renamed && (scope === "future" || data.orders.some(o => o[reference] === id && o[label]));
  const orders = needsSnapshots ? data.orders.map(order => order[reference] === id
    ? { ...order, [label]: scope === "future" ? order[label] ?? item.name : undefined } : order) : data.orders;
  const history = renamed ? [...data.history, ...data.orders.filter(o => o[reference] === id).map(order => ({
    id: crypto.randomUUID(), orderId: order.id, at: new Date().toISOString(), action: "updated" as const,
    detail: `Catálogo: ${item.name} → ${trimmed}. ${scope === "future" ? "Se conserva el nombre en esta orden" : "Nombre actualizado en esta orden"}.`,
  }))] : data.history;
  data = { ...data, orders, history };
  return catalog === "statuses"
    ? { ...data, statuses: data.statuses.map((item) => item.id === id ? { ...item, name: trimmed, color } : item) }
    : { ...data, priorities: data.priorities.map((item) => item.id === id ? { ...item, name: trimmed, color } : item) };
}

/** Renames shared department/category labels and records the impact without altering IDs. */
export function renameNamedCatalog(data: DemoData, catalog: "departments" | "categories", id: string, name: string): DemoData {
  const value = name.trim();
  if (!value || value.length > 120) throw new Error("Escribe un nombre de 1 a 120 caracteres.");
  const item = data[catalog].find(entry => entry.id === id);
  if (!item) throw new Error("La opción ya no existe.");
  if (data[catalog].some(entry => entry.id !== id && entry.name.toLocaleLowerCase("es-MX") === value.toLocaleLowerCase("es-MX"))) throw new Error("Ese nombre ya existe en este catálogo.");
  if (item.name === value) return data;
  const reference = catalog === "departments" ? "departmentId" : "categoryId";
  return { ...data, [catalog]: data[catalog].map(entry => entry.id === id ? { ...entry, name: value } : entry),
    history: [...data.history, ...data.orders.filter(order => order[reference] === id).map(order => ({
      id: crypto.randomUUID(), orderId: order.id, at: new Date().toISOString(), action: "updated" as const,
      detail: `${catalog === "departments" ? "Departamento" : "Tipo"}: ${item.name} → ${value}.`,
    }))],
  };
}

export type ManagedCatalogKey = CatalogKey | "departments" | "categories";
export const catalogReference = { departments: "departmentId", categories: "categoryId", statuses: "statusId", priorities: "priorityId" } as const;

export function addCatalogItem(data: DemoData, catalog: ManagedCatalogKey, name: string, options: { color?: ColorKey; kind?: "pending" | "in_progress" | "completed" } = {}): DemoData {
  const value = name.trim();
  if (!value || value.length > 120) throw new Error("Escribe un nombre de 1 a 120 caracteres.");
  if (data[catalog].length >= 30) throw new Error("El catálogo admite hasta 30 opciones, incluidas las conservadas en registros anteriores.");
  if (data[catalog].some(i => i.name.toLocaleLowerCase("es-MX") === value.toLocaleLowerCase("es-MX"))) throw new Error("Ese nombre ya existe en este catálogo.");
  const base = { id: crypto.randomUUID(), name: value, active: true };
  if (catalog === "departments" || catalog === "categories") return { ...data, [catalog]: [...data[catalog], base] };
  const color = options.color ?? "blue";
  if (!Object.hasOwn(COLOR_STYLES, color)) throw new Error("Elige un color disponible.");
  const order = Math.max(0, ...data[catalog].map(i => i.order)) + 1;
  if (catalog === "statuses") {
    if (!options.kind || !["pending", "in_progress", "completed"].includes(options.kind)) throw new Error("Elige el comportamiento del estado.");
    return { ...data, statuses: [...data.statuses, { ...base, color, order, kind: options.kind }] };
  }
  return { ...data, priorities: [...data.priorities, { ...base, color, order }] };
}

/** Retire from new assignments or explicitly replace existing references; never rewrite old history. */
export function removeCatalogItem(data: DemoData, catalog: ManagedCatalogKey, id: string, mode: "future" | "replace", replacementId?: string, now = new Date()): DemoData {
  const item = data[catalog].find(i => i.id === id);
  if (!item) throw new Error("La opción ya no existe.");
  if (mode !== "future" && mode !== "replace") throw new Error("Elige qué hacer con los registros anteriores.");
  const remaining = data[catalog].filter(i => i.id !== id && i.active);
  if (!remaining.length) throw new Error("Debe quedar al menos una opción activa en este catálogo.");
  if (catalog === "statuses") {
    const state = data.statuses.find(s => s.id === id)!;
    if (state.active && (state.kind === "pending" || state.kind === "completed") && !data.statuses.some(s => s.active && s.id !== id && s.kind === state.kind)) {
      throw new Error(`Agrega otro estado ${state.kind === "pending" ? "pendiente" : "completado"} antes de retirar este.`);
    }
  }
  const reference = catalogReference[catalog];
  const affected = data.orders.filter(o => o[reference] === id);
  const replacement = mode === "replace" ? remaining.find(i => i.id === replacementId) : undefined;
  if (mode === "replace" && affected.length && !replacement) throw new Error("Selecciona una opción activa para sustituirla.");
  const targetState = catalog === "statuses" && replacement ? data.statuses.find(s => s.id === replacement.id) : undefined;
  if (targetState?.kind === "completed" && affected.some(o => data.checklist.some(i => i.orderId === o.id && i.required && !i.done))) {
    throw new Error("No puedes completar órdenes con actividades obligatorias pendientes. Elige otro estado o conserva sus registros.");
  }
  const orders = mode === "replace" && replacement ? data.orders.map(o => {
    if (o[reference] !== id) return o;
    return { ...o, [reference]: replacement.id,
      ...(catalog === "statuses" ? { statusLabel: undefined, completedAt: targetState!.kind === "completed" ? o.completedAt ?? now.toISOString() : null } : {}),
      ...(catalog === "priorities" ? { priorityLabel: undefined } : {}),
    };
  }) : data.orders;
  const preserve = mode === "future" && affected.length > 0;
  return { ...data, orders,
    [catalog]: preserve ? data[catalog].map(i => i.id === id ? { ...i, active: false } : i) : data[catalog].filter(i => i.id !== id),
    history: [...data.history, ...affected.map(o => ({ id: crypto.randomUUID(), orderId: o.id, at: now.toISOString(), action: "updated" as const,
      detail: preserve ? `Catálogo: «${item.name}» retirado para nuevas asignaciones. Esta orden conserva su opción anterior.` : `Catálogo: «${item.name}» sustituido por «${replacement!.name}» en esta orden.`,
    }))],
  };
}
