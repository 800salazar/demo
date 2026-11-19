import { demoRoutes } from "@/config/routes";

export type GuideAction = "order-saved" | "answer-ready" | "catalog-saved" | "view-admin" | "view-operator" | "view-director" | "report-ready" | "department-selected" | "department-analysis";
export type DemoView = "operador" | "administrador" | "direccion";
export type GuideStep = {
  id: string; path: string; target: string; title: string; description: string;
  action?: GuideAction; view?: DemoView; onAction?: "next" | "close";
};

export const maintenanceDepartmentId = "dept-mantenimiento";

const full: GuideStep[] = [
  { id: "order", path: demoRoutes.workspace, view: "operador", target: "order-select", title: "Elige una orden", description: "Busca un folio o escribe parte de su nombre." },
  { id: "edit", path: demoRoutes.workspace, view: "operador", target: "order-edit", title: "Prueba un cambio", description: "Cambia el costo o una observación y guarda.", action: "order-saved" },
  { id: "checklist", path: demoRoutes.workspace, view: "operador", target: "order-checklist", title: "Cierra sin omisiones", description: "Marca las actividades verificadas. Las obligatorias desbloquean el cierre; el historial conserva los cambios." },
  { id: "ask", path: demoRoutes.workspace, view: "operador", target: "ai-suggestions", title: "Pregunta a la IA", description: "Elige una pregunta. El asistente analiza tus datos guardados y sigue contigo al cambiar de vista.", action: "answer-ready" },
  { id: "admin", path: demoRoutes.workspace, view: "operador", target: "view-selector", title: "Cambia de perspectiva", description: "Selecciona Administrador. Puedes probar todas las vistas libremente.", action: "view-admin" },
  { id: "settings", path: demoRoutes.workspace, view: "administrador", target: "status-settings", title: "Adapta tu sistema", description: "Pulsa el lápiz de un estado, cambia su nombre o color y guarda.", action: "catalog-saved" },
  { id: "table", path: demoRoutes.workspace, view: "administrador", target: "orders-table", title: "Encuentra lo importante", description: "Busca o filtra órdenes. El folio abre la edición y el botón IA prepara una consulta." },
  { id: "director", path: demoRoutes.workspace, view: "administrador", target: "view-selector", title: "Mira la operación completa", description: "Selecciona Dirección para revisar indicadores y actividad.", action: "view-director" },
  { id: "activity", path: demoRoutes.workspace, view: "direccion", target: "activity-chart", title: "Entiende cada pico", description: "Toca un día para ver las órdenes que lo forman. «Analizar este día con IA» envía una consulta sobre ese día." },
  { id: "report", path: demoRoutes.workspace, view: "direccion", target: "report-download", title: "Llévate el reporte", description: "Pulsa Reporte PDF y elige 7 o 14 días. Dirección incluye indicadores y gráficos del periodo.", action: "report-ready" },
];

export const guides = {
  helpStatus: [{ id: "status", path: demoRoutes.workspace, view: "operador", target: "order-status", title: "Cambia el estado", description: "Elige el nuevo estado y pulsa Guardar cambios. Para completar, verifica primero las actividades obligatorias." }],
  helpCatalog: [{ id: "catalog", path: demoRoutes.workspace, view: "administrador", target: "status-settings", title: "Edita tus estados", description: "Pulsa el lápiz de un estado, ajusta el nombre o color y guarda." }],
  manageStatuses: [
    { id: "add-status", path: demoRoutes.workspace, view: "administrador", target: "status-add", title: "Agrega un estado", description: "Pulsa Agregar. Define el nombre, el color y el comportamiento del nuevo estado. Pulsa Siguiente para ver dónde editar uno existente." },
    { id: "edit-status", path: demoRoutes.workspace, view: "administrador", target: "status-edit", title: "Edita un estado", description: "Pulsa el lápiz. Puedes cambiar el nombre o el color y decidir si el nuevo nombre se usa también en las órdenes existentes." },
  ],
  analyzeDepartment: [
    { id: "department", path: demoRoutes.workspace, view: "direccion", target: "cost-department", title: "Selecciona un departamento", description: "En el gráfico de costos, pulsa el departamento resaltado para ver las órdenes que componen su costo.", action: "department-selected", onAction: "next" },
    { id: "analyze-department", path: demoRoutes.workspace, view: "direccion", target: "cost-analysis", title: "Analiza los costos con IA", description: "Pulsa Analizar con IA para consultar qué órdenes explican el costo del departamento.", action: "department-analysis", onAction: "close" },
  ],
  helpChecklist: [full[2]],
  helpCost: [{ id: "cost", path: demoRoutes.workspace, view: "operador", target: "order-cost", title: "Actualiza el costo", description: "Escribe el costo real y pulsa Guardar cambios para aplicar tu edición." }],
  helpReport: [{ id: "report-help", path: demoRoutes.workspace, view: "operador", target: "report-download", title: "Descarga tu reporte", description: "Pulsa el botón y elige 7 o 14 días. El PDF usa tu vista actual y las órdenes con movimientos en ese periodo." }],
  directorReport: [full[9]],
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
