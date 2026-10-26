import { localStorageAdapter, type PersistenceAdapter } from "./persistence";
import { createSeedData } from "./seed";
import type { DemoData } from "./types";

type Listener = () => void;

const adapter: PersistenceAdapter = localStorageAdapter;
const listeners = new Set<Listener>();

let snapshot: DemoData | null = null;
let loading: Promise<void> | null = null;

function publish(next: DemoData) {
  snapshot = next;
  listeners.forEach((listener) => listener());
}

function persist(data: DemoData) {
  adapter.save(data).catch(() => undefined);
}

function load() {
  if (snapshot || loading) return;
  loading = adapter
    .load()
    .catch(() => null)
    .then((stored) => {
      if (snapshot) return;
      if (stored) {
        publish(stored);
        return;
      }
      const seeded = createSeedData(new Date());
      publish(seeded);
      persist(seeded);
    })
    .finally(() => {
      loading = null;
    });
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  load();
  return () => {
    listeners.delete(listener);
  };
}

/** `null` mientras los datos se cargan en el navegador. */
export function getSnapshot(): DemoData | null {
  return snapshot;
}

export function getServerSnapshot(): null {
  return null;
}

/** Única vía de escritura: `updater` debe devolver un objeto nuevo sin mutar el actual. */
export function updateDemoData(updater: (current: DemoData) => DemoData) {
  if (!snapshot) return;
  const next = updater(snapshot);
  publish(next);
  persist(next);
}

/** Restaura el escenario original con fechas relativas al momento actual. */
export function resetDemoData() {
  const seeded = createSeedData(new Date());
  publish(seeded);
  persist(seeded);
}
