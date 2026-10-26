import { DATA_VERSION, type DemoData } from "./types";

/**
 * Frontera de persistencia. Hoy se guarda en el navegador; para usar Supabase basta con
 * otro adaptador que cumpla este contrato y asignarlo en `store.ts`.
 */
export interface PersistenceAdapter {
  load(): Promise<DemoData | null>;
  save(data: DemoData): Promise<void>;
}

export const STORAGE_KEY = "salazar-demo:data";

function isDemoData(value: unknown): value is DemoData {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Partial<Record<keyof DemoData, unknown>>;
  return (
    candidate.version === DATA_VERSION &&
    Array.isArray(candidate.departments) &&
    Array.isArray(candidate.categories) &&
    Array.isArray(candidate.priorities) &&
    Array.isArray(candidate.statuses) &&
    Array.isArray(candidate.orders) &&
    Array.isArray(candidate.checklist) &&
    Array.isArray(candidate.history)
  );
}

export const localStorageAdapter: PersistenceAdapter = {
  async load() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed: unknown = JSON.parse(raw);
      return isDemoData(parsed) ? parsed : null;
    } catch {
      return null;
    }
  },
  async save(data) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Almacenamiento bloqueado o lleno: la demostración sigue funcionando en memoria.
    }
  },
};
