import {
  DATA_VERSION,
  type ChecklistItem,
  type ColorKey,
  type DemoData,
  type HistoryEntry,
  type StatusKind,
  type WorkOrder,
} from "./types";

const DEPARTMENTS = [
  { key: "produccion", name: "Producción" },
  { key: "mantenimiento", name: "Mantenimiento" },
  { key: "calidad", name: "Calidad" },
  { key: "almacen", name: "Almacén" },
  { key: "compras", name: "Compras" },
  { key: "administracion", name: "Administración" },
] as const;

const CATEGORIES = [
  { key: "correctivo", name: "Mantenimiento correctivo" },
  { key: "preventivo", name: "Mantenimiento preventivo" },
  { key: "mejora", name: "Mejora de proceso" },
  { key: "inspeccion", name: "Inspección de calidad" },
  { key: "abasto", name: "Reabastecimiento" },
  { key: "administrativo", name: "Trámite administrativo" },
] as const;

const PRIORITIES = [
  { key: "alto", name: "Alto", color: "red" },
  { key: "medio", name: "Medio", color: "amber" },
  { key: "bajo", name: "Bajo", color: "green" },
] as const satisfies ReadonlyArray<{ key: string; name: string; color: ColorKey }>;

const STATUSES = [
  { key: "pendiente", name: "Pendiente", color: "slate", kind: "pending" },
  { key: "proceso", name: "En proceso", color: "blue", kind: "in_progress" },
  { key: "revision", name: "En revisión", color: "violet", kind: "in_progress" },
  { key: "completada", name: "Completada", color: "teal", kind: "completed" },
] as const satisfies ReadonlyArray<{ key: string; name: string; color: ColorKey; kind: StatusKind }>;

type DepartmentKey = (typeof DEPARTMENTS)[number]["key"];
type CategoryKey = (typeof CATEGORIES)[number]["key"];
type PriorityKey = (typeof PRIORITIES)[number]["key"];
type StatusKey = (typeof STATUSES)[number]["key"];

const STATUS_PATH: Record<StatusKey, StatusKey[]> = {
  pendiente: [],
  proceso: ["proceso"],
  revision: ["proceso", "revision"],
  completada: ["proceso", "revision", "completada"],
};

/** Actividades por categoría: las obligatorias van primero. */
const CHECKLISTS: Record<CategoryKey, ReadonlyArray<readonly [label: string, required: boolean]>> = {
  correctivo: [
    ["Aislar y bloquear el equipo", true],
    ["Registrar la causa de la falla", true],
    ["Probar la operación tras la reparación", true],
    ["Actualizar la bitácora del equipo", false],
  ],
  preventivo: [
    ["Revisar la lista de verificación del fabricante", true],
    ["Lubricar y ajustar componentes", true],
    ["Registrar horas de operación", false],
  ],
  mejora: [
    ["Documentar la situación inicial", true],
    ["Validar resultados con el responsable", true],
    ["Capacitar al personal involucrado", false],
  ],
  inspeccion: [
    ["Registrar mediciones o hallazgos", true],
    ["Adjuntar evidencia", true],
    ["Notificar resultados al responsable", false],
  ],
  abasto: [
    ["Validar existencias disponibles", true],
    ["Confirmar fecha de entrega", true],
    ["Recibir y verificar el material", false],
  ],
  administrativo: [
    ["Reunir la documentación requerida", true],
    ["Obtener la autorización", true],
    ["Archivar los comprobantes", false],
  ],
};

/** OT-1011 queda en revisión con una actividad obligatoria pendiente para mostrar la validación. */
const BLOCKED_IN_REVIEW = new Set([11]);

type OrderSeed = [
  department: DepartmentKey,
  category: CategoryKey,
  priority: PriorityKey,
  status: StatusKey,
  assignee: string,
  createdDaysAgo: number,
  dueInDays: number,
  estimatedCost: number,
  actualCost: number,
  title: string,
  description: string,
  observations?: string,
];

const ORDER_SEEDS: OrderSeed[] = [
  ["mantenimiento", "correctivo", "alto", "proceso", "Luis Hernández", 12, -2, 45000, 38500, "Reparación de banda transportadora L2", "Sustitución de rodillos y banda desgastada en la línea 2.", "Se detectó desgaste adicional en el motor; falta cotizar la refacción."],
  ["mantenimiento", "correctivo", "alto", "completada", "Carlos Mendoza", 30, -20, 40000, 46800, "Cambio de rodamientos en compresor C-03", "Reemplazo de rodamientos y sello del eje por vibración excesiva.", "El costo superó lo estimado por el cambio adicional del sello."],
  ["mantenimiento", "preventivo", "medio", "completada", "Diego Castillo", 28, -18, 6500, 6200, "Mantenimiento preventivo de montacargas", "Revisión general, cambio de aceite y ajuste de frenos."],
  ["mantenimiento", "correctivo", "alto", "completada", "Luis Hernández", 22, -12, 52000, 58200, "Reparación de fuga hidráulica en prensa P-07", "Cambio de mangueras, sellos y reposición de fluido hidráulico."],
  ["mantenimiento", "preventivo", "medio", "revision", "Carlos Mendoza", 9, 3, 14000, 12800, "Calibración del sistema de enfriamiento", "Ajuste de válvulas y verificación de temperaturas de operación."],
  ["mantenimiento", "correctivo", "alto", "pendiente", "Diego Castillo", 3, 9, 52000, 0, "Sustitución de motor en extrusora E-01", "Cambio de motor principal por pérdida de potencia."],
  ["mantenimiento", "preventivo", "bajo", "pendiente", "Jorge Ramírez", 5, 14, 8500, 0, "Revisión eléctrica del tablero principal", "Termografía y reapriete de conexiones del tablero general."],
  ["mantenimiento", "correctivo", "medio", "proceso", "Luis Hernández", 8, -1, 16000, 11500, "Reemplazo de válvulas neumáticas en L1", "Cambio de válvulas con fugas en la línea 1."],
  ["produccion", "mejora", "medio", "completada", "Ana Reyes", 25, -15, 12000, 11300, "Ajuste de parámetros en línea de ensamble 3", "Optimización de velocidades y tiempos de ciclo."],
  ["produccion", "mejora", "medio", "proceso", "Patricia Navarro", 10, 4, 30000, 18700, "Reconfiguración de celda de soldadura", "Reubicación de estaciones para reducir traslados."],
  ["produccion", "mejora", "alto", "revision", "Ana Reyes", 14, 2, 20000, 19200, "Reducción de merma en corte de lámina", "Nuevo patrón de corte para aprovechar mejor el material."],
  ["produccion", "preventivo", "medio", "pendiente", "Patricia Navarro", 2, 7, 9500, 0, "Cambio de molde M-12 programado", "Cambio planeado de molde durante el paro de fin de semana."],
  ["produccion", "mejora", "bajo", "completada", "Elena Barrios", 35, -25, 7000, 6400, "Capacitación en nuevo procedimiento de arranque", "Sesiones para operadores de los tres turnos."],
  ["produccion", "mejora", "medio", "proceso", "Ana Reyes", 18, -4, 26000, 21500, "Instalación de sensores de conteo en línea 1", "Sensores para registrar producción por turno."],
  ["produccion", "correctivo", "alto", "pendiente", "Patricia Navarro", 1, 5, 18000, 0, "Cambio de herramental en troqueladora T-05", "Sustitución de dados desgastados."],
  ["calidad", "inspeccion", "medio", "completada", "Laura Pineda", 40, -30, 15000, 15900, "Calibración de instrumentos de medición", "Calibración anual de calibradores y micrómetros."],
  ["calidad", "inspeccion", "medio", "proceso", "Laura Pineda", 12, 6, 12000, 7800, "Auditoría interna de procesos ISO 9001", "Revisión de procedimientos en cuatro áreas."],
  ["calidad", "correctivo", "alto", "proceso", "Héctor Villalobos", 6, 1, 9000, 5200, "Análisis de causa raíz por rechazo del lote 4471", "Investigación de la causa de rechazo y plan de acción."],
  ["calidad", "inspeccion", "bajo", "pendiente", "Laura Pineda", 2, 10, 4500, 0, "Muestreo de materia prima de proveedor nuevo", "Inspección de las primeras entregas del proveedor."],
  ["calidad", "mejora", "bajo", "completada", "Héctor Villalobos", 20, -9, 5000, 4600, "Actualización del plan de control", "Revisión de puntos de inspección y frecuencias."],
  ["almacen", "inspeccion", "medio", "completada", "Raúl Domínguez", 26, -16, 6000, 5800, "Inventario cíclico de refacciones", "Conteo de refacciones críticas y conciliación."],
  ["almacen", "mejora", "bajo", "proceso", "Sofía Aguilar", 11, -3, 14000, 9900, "Reubicación de racks en zona B", "Reacomodo para mejorar el flujo de montacargas."],
  ["almacen", "abasto", "medio", "completada", "Raúl Domínguez", 15, -6, 11000, 12300, "Reabastecimiento de insumos de embalaje", "Compra y recepción de cajas, cinta y tarimas."],
  ["almacen", "mejora", "bajo", "pendiente", "Sofía Aguilar", 4, 12, 8000, 0, "Etiquetado de ubicaciones con código de barras", "Etiquetas para identificar cada ubicación del almacén."],
  ["compras", "abasto", "alto", "revision", "Mariana Cortés", 7, 0, 4500, 3800, "Cotización de refacciones para extrusora", "Comparativo de tres proveedores para la extrusora E-01."],
  ["compras", "mejora", "bajo", "completada", "Mariana Cortés", 32, -22, 6000, 5400, "Evaluación de proveedores de lubricantes", "Análisis de precio, entrega y calidad."],
  ["compras", "administrativo", "medio", "pendiente", "Mariana Cortés", 6, -1, 9000, 0, "Contrato anual de insumos de limpieza", "Negociación y firma del contrato anual."],
  ["administracion", "administrativo", "medio", "completada", "Gabriela Soto", 45, -35, 18000, 17200, "Renovación de licencias de software", "Renovación de licencias de diseño y administración."],
  ["administracion", "administrativo", "alto", "proceso", "Gabriela Soto", 13, 8, 7500, 3100, "Actualización de políticas de seguridad industrial", "Revisión y publicación de políticas actualizadas."],
  ["administracion", "administrativo", "bajo", "pendiente", "Gabriela Soto", 3, 15, 5000, 0, "Conciliación de gastos del trimestre", "Conciliación de gastos con contabilidad."],
];

function addDays(base: Date, days: number): Date {
  const date = new Date(base);
  date.setDate(date.getDate() + days);
  return date;
}

function atTime(date: Date, hours: number, minutes: number): Date {
  const result = new Date(date);
  result.setHours(hours, minutes, 0, 0);
  return result;
}

function toDateOnly(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

/** Genera el escenario original. Todas las fechas son relativas a `now`. */
export function createSeedData(now: Date): DemoData {
  const departments = DEPARTMENTS.map((d) => ({ id: `dept-${d.key}`, name: d.name, active: true }));
  const categories = CATEGORIES.map((c) => ({ id: `cat-${c.key}`, name: c.name, active: true }));
  const priorities = PRIORITIES.map((p, index) => ({
    id: `prio-${p.key}`,
    name: p.name,
    color: p.color,
    order: index + 1,
    active: true,
  }));
  const statuses = STATUSES.map((s, index) => ({
    id: `st-${s.key}`,
    name: s.name,
    color: s.color,
    kind: s.kind,
    order: index + 1,
    active: true,
  }));

  const priorityName = (key: PriorityKey) => PRIORITIES.find((p) => p.key === key)!.name;
  const statusName = (key: StatusKey) => STATUSES.find((s) => s.key === key)!.name;

  const orders: WorkOrder[] = [];
  const checklist: ChecklistItem[] = [];
  const history: HistoryEntry[] = [];

  ORDER_SEEDS.forEach((seed, index) => {
    const [department, category, priority, status, assignee, createdDaysAgo, dueInDays, estimatedCost, actualCost, title, description, observations = ""] = seed;
    const seq = index + 1;
    const id = `ord-${String(seq).padStart(3, "0")}`;

    const createdAt = atTime(addDays(now, -createdDaysAgo), 8 + (seq % 9), (seq * 7) % 60);
    const completedAt = status === "completada" ? atTime(addDays(now, dueInDays - 1), 16, 0) : null;

    orders.push({
      id,
      folio: `OT-${1000 + seq}`,
      title,
      departmentId: `dept-${department}`,
      categoryId: `cat-${category}`,
      assignee,
      priorityId: `prio-${priority}`,
      statusId: `st-${status}`,
      createdAt: createdAt.toISOString(),
      dueDate: toDateOnly(addDays(now, dueInDays)),
      completedAt: completedAt?.toISOString() ?? null,
      estimatedCost,
      actualCost,
      description,
      observations,
    });

    const items = CHECKLISTS[category];
    const requiredCount = items.filter(([, required]) => required).length;
    const doneCount =
      status === "completada"
        ? items.length
        : status === "revision"
          ? requiredCount - (BLOCKED_IN_REVIEW.has(seq) ? 1 : 0)
          : status === "proceso"
            ? 1
            : 0;
    items.forEach(([label, required], itemIndex) => {
      checklist.push({ id: `chk-${seq}-${itemIndex + 1}`, orderId: id, label, required, done: itemIndex < doneCount });
    });

    history.push({
      id: `hist-${seq}-0`,
      orderId: id,
      at: createdAt.toISOString(),
      action: "created",
      detail: `Orden creada con prioridad ${priorityName(priority)}`,
    });

    // Los cambios de estado se reparten entre la creación y la finalización (o el momento actual).
    const steps = STATUS_PATH[status];
    const startMs = createdAt.getTime();
    const endMs = (completedAt ?? now).getTime();
    const divisor = completedAt ? steps.length : steps.length + 1;
    steps.forEach((step, stepIndex) => {
      const from = stepIndex === 0 ? "pendiente" : steps[stepIndex - 1];
      history.push({
        id: `hist-${seq}-${stepIndex + 1}`,
        orderId: id,
        at: new Date(startMs + ((endMs - startMs) * (stepIndex + 1)) / divisor).toISOString(),
        action: "status_changed",
        detail: `Estado: ${statusName(from)} → ${statusName(step)}`,
      });
    });
  });

  return {
    version: DATA_VERSION,
    seededAt: now.toISOString(),
    departments,
    categories,
    priorities,
    statuses,
    orders,
    checklist,
    history,
  };
}
