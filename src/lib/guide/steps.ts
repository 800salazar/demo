import { demoRoutes } from "@/config/routes";

export type GuideAction = "order-saved" | "answer-ready" | "catalog-saved" | "view-admin" | "view-operator";
export type DemoView = "operador" | "administrador";
export type GuideStep = {
  id: string; path: string; target: string; title: string; description: string;
  action?: GuideAction; view?: DemoView;
};

const full: GuideStep[] = [
  { id: "order", path: demoRoutes.workspace, view: "operador", target: "order-select", title: "Elige una orden", description: "Busca un folio y revisa sus datos." },
  { id: "edit", path: demoRoutes.workspace, view: "operador", target: "order-edit", title: "Prueba un cambio", description: "Cambia el costo real y guarda la orden.", action: "order-saved" },
  { id: "ask", path: demoRoutes.workspace, view: "operador", target: "ai-suggestions", title: "Pregunta a la IA", description: "Elige una pregunta. El análisis usará tus cambios.", action: "answer-ready" },
  { id: "admin", path: demoRoutes.workspace, view: "operador", target: "view-selector", title: "Cambia de perspectiva", description: "Selecciona Administrador para revisar resultados.", action: "view-admin" },
  { id: "chart", path: demoRoutes.workspace, view: "administrador", target: "cost-chart", title: "Revisa los costos", description: "Toca una barra para ver las órdenes y sus importes." },
  { id: "settings", path: demoRoutes.workspace, view: "administrador", target: "catalog-settings", title: "Adapta tu sistema", description: "Cambia el nombre o color de un estado y guarda.", action: "catalog-saved" },
  { id: "operator", path: demoRoutes.workspace, view: "administrador", target: "view-selector", title: "Comprueba el cambio", description: "Vuelve a Operador. Los estados ya usan tu configuración.", action: "view-operator" },
];

export const guides = {
  home: full,
  full,
  // Keep the public guide entry points compatible with the former routes.
  administration: full.slice(4),
  operations: full,
  ai: full,
  integrations: full,
} satisfies Record<string, GuideStep[]>;
export type GuideId = keyof typeof guides;
export function guideStepUrl(step: GuideStep): string {
  return step.view ? `${step.path}?vista=${step.view}` : step.path;
}

/** Local UI signal only; no analytics, payloads, network calls or database access. */
export function notifyGuideAction(action: GuideAction) {
  window.dispatchEvent(new CustomEvent("salazar:guide-action", { detail: action }));
}
