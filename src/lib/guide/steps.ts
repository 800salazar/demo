import { demoRoutes } from "@/config/routes";

export type GuideAction = "order-saved" | "answer-ready";
export type GuideStep = {
  id: string;
  path: string;
  target: string;
  title: string;
  description: string;
  action?: GuideAction;
};

const priorities: GuideStep = {
  id: "priorities", path: demoRoutes.administration, target: "priorities",
  title: "Identifica la urgencia", description: "Estas prioridades distinguen las órdenes. Su edición llegará después.",
};
const operations: GuideStep[] = [
  { id: "order", path: demoRoutes.operations, target: "order-select", title: "Elige una orden", description: "Selecciona un folio para revisar sus datos." },
  { id: "cost", path: demoRoutes.operations, target: "order-cost", title: "Prueba un cambio", description: "Escribe otro costo. Solo cambiarás los datos de tu demo." },
  { id: "save", path: demoRoutes.operations, target: "order-save", title: "Guarda el cambio", description: "Haz clic en Guardar cambios. Se habilita al editar un campo.", action: "order-saved" },
  { id: "chart", path: demoRoutes.operations, target: "cost-chart", title: "Comprueba el resultado", description: "La gráfica ya refleja tus cambios. Toca una barra para ver el costo." },
];
const ai: GuideStep[] = [
  { id: "ask", path: demoRoutes.ai, target: "ai-suggestions", title: "Haz una consulta", description: "Elige una pregunta para enviarla al asistente y espera la respuesta.", action: "answer-ready" },
  { id: "answer", path: demoRoutes.ai, target: "ai-answer", title: "Revisa el análisis", description: "Usa tus órdenes actuales. La etiqueta distingue una respuesta de IA de un resumen calculado." },
];

export const guides = {
  home: [
    { id: "modules", path: demoRoutes.home, target: "demo-modules", title: "Elige qué explorar", description: "Cada tarjeta abre una experiencia diferente." },
    { id: "contact", path: demoRoutes.home, target: "demo-contact", title: "Hablemos de tu proceso", description: "Este botón abre WhatsApp para conversar sobre tu proyecto." },
  ],
  administration: [priorities],
  operations,
  ai,
  integrations: [
    { id: "integrations", path: demoRoutes.integrations, target: "integrations", title: "Conecta tu operación", description: "Estas son opciones de integración. En este demo aún no están activas." },
  ],
  full: [priorities, ...operations, ...ai],
} satisfies Record<string, GuideStep[]>;

export type GuideId = keyof typeof guides;

export function guideForPath(pathname: string): GuideId {
  switch (pathname.replace(/\/+$/, "")) {
    case demoRoutes.administration: return "administration";
    case demoRoutes.operations: return "operations";
    case demoRoutes.ai: return "ai";
    case demoRoutes.integrations: return "integrations";
    case demoRoutes.home: return "home";
    default: return "full";
  }
}

/** Local UI signal only; no analytics, payloads, network calls or database access. */
export function notifyGuideAction(action: GuideAction) {
  window.dispatchEvent(new CustomEvent("salazar:guide-action", { detail: action }));
}
