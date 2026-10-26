import { useSyncExternalStore } from "react";
import { getServerSnapshot, getSnapshot, subscribe } from "./store";
import type { DemoData } from "./types";

/** Datos de la demostración del visitante; `null` mientras se cargan en el navegador. */
export function useDemoData(): DemoData | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
