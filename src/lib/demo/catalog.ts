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
