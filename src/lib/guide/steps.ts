import { demoRoutes } from "@/config/routes";

export type GuideAction = "order-saved" | "answer-ready" | "catalog-saved" | "view-admin" | "view-operator" | "view-director" | "report-ready";
export type DemoView = "operador" | "administrador" | "direccion";
export type GuideStep = {
  id: string; path: string; target: string; title: string; description: string;
  action?: GuideAction; view?: DemoView;
};

const full: GuideStep[] = [
  { id: "order", path: demoRoutes.workspace, view: "operador", target: "order-select", title: "Elige una orden", description: "Busca un folio o escribe parte de su nombre." },
  { id: "edit", path: demoRoutes.workspace, view: "operador", target: "order-edit", title: "Prueba un cambio", description: "Cambia el costo o una observación y guarda.", action: "order-saved" },
  { id: "checklist", path: demoRoutes.workspace, view: "operador", target: "order-checklist", title: "Cierra sin omisiones", description: "Marca las actividades verificadas. Las obligatorias desbloquean el cierre; el historial conserva los cambios." },
  { id: "ask", path: demoRoutes.workspace, view: "operador", target: "ai-suggestions", title: "Pregunta a la IA", description: "Elige una pregunta. El asistente analiza tus datos guardados y sigue contigo al cambiar de vista.", action: "answer-ready" },
  { id: "admin", path: demoRoutes.workspace, view: "operador", target: "view-selector", title: "Cambia de perspectiva", description: "Selecciona Administrador. Puedes probar todas las vistas libremente.", action: "view-admin" },
  { id: "settings", path: demoRoutes.workspace, view: "administrador", target: "status-settings", title: "Adapta tu sistema", description: "Pulsa Editar en un estado, cambia su nombre o color y guarda.", action: "catalog-saved" },
  { id: "table", path: demoRoutes.workspace, view: "administrador", target: "orders-table", title: "Encuentra lo importante", description: "Busca o filtra órdenes. El folio abre la edición y el botón IA prepara una consulta." },
  { id: "director", path: demoRoutes.workspace, view: "administrador", target: "view-selector", title: "Mira la operación completa", description: "Selecciona Dirección para revisar indicadores y actividad.", action: "view-director" },
  { id: "activity", path: demoRoutes.workspace, view: "direccion", target: "activity-chart", title: "Entiende cada pico", description: "Toca un día para ver las órdenes que lo forman. «Analizar este día con IA» envía una consulta sobre ese día." },
  { id: "report", path: demoRoutes.workspace, view: "direccion", target: "report-download", title: "Llévate el reporte", description: "Pulsa Reporte PDF y elige 7 o 14 días. Dirección incluye indicadores y gráficos del periodo.", action: "report-ready" },
];

export const guides = {
  helpStatus: [{ id: "status", path: demoRoutes.workspace, view: "operador", target: "order-status", title: "Cambia el estado", description: "Elige el nuevo estado y pulsa Guardar cambios. Para completar, verifica primero las actividades obligatorias." }],
  helpCatalog: [{ id: "catalog", path: demoRoutes.workspace, view: "administrador", target: "status-settings", title: "Edita tus estados", description: "Pulsa Editar en un estado, ajusta el nombre o color y guarda." }],
  helpChecklist: [full[2]],
  helpCost: [{ id: "cost", path: demoRoutes.workspace, view: "operador", target: "order-cost", title: "Actualiza el costo", description: "Escribe el costo real y pulsa Guardar cambios para aplicar tu edición." }],
  helpReport: [{ id: "report-help", path: demoRoutes.workspace, view: "operador", target: "report-download", title: "Descarga tu reporte", description: "Pulsa el botón y elige 7 o 14 días. El PDF usa tu vista actual y las órdenes con movimientos en ese periodo." }],
  home: full,
  full,
  // Keep the public guide entry points compatible with the former routes.
  administration: full.slice(5),
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
