import type { ColorKey, DemoData } from "./types";
import { COLOR_STYLES } from "./colors";

export type CatalogKey = "statuses" | "priorities";

/** Update presentation only: identifiers and the meaning of completed states stay intact. */
export function editCatalogItem(data: DemoData, catalog: CatalogKey, id: string, name: string, color: ColorKey): DemoData {
  const trimmed = name.trim();
  if (!trimmed || trimmed.length > 120) throw new Error("Escribe un nombre de 1 a 120 caracteres.");
  if (!Object.hasOwn(COLOR_STYLES, color)) throw new Error("Elige un color disponible.");
  if (!data[catalog].some((item) => item.id === id)) throw new Error("La opción ya no existe. Actualiza el demo.");
  if (data[catalog].some((item) => item.id !== id && item.name.toLocaleLowerCase("es-MX") === trimmed.toLocaleLowerCase("es-MX"))) {
    throw new Error("Ese nombre ya existe en este catálogo.");
  }
  return catalog === "statuses"
    ? { ...data, statuses: data.statuses.map((item) => item.id === id ? { ...item, name: trimmed, color } : item) }
    : { ...data, priorities: data.priorities.map((item) => item.id === id ? { ...item, name: trimmed, color } : item) };
}
