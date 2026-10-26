/** Incrementar al cambiar la forma de `DemoData`: los datos guardados de otra versión se descartan. */
export const DATA_VERSION = 1;

export type ColorKey =
  | "red"
  | "darkRed"
  | "orange"
  | "amber"
  | "green"
  | "teal"
  | "blue"
  | "violet"
  | "slate";

export interface Department {
  id: string;
  name: string;
  active: boolean;
}

export interface OrderCategory {
  id: string;
  name: string;
  active: boolean;
}

export interface Priority {
  id: string;
  name: string;
  color: ColorKey;
  order: number;
  active: boolean;
}

/** Los indicadores se calculan con `kind`, así el nombre del estado puede renombrarse libremente. */
export type StatusKind = "pending" | "in_progress" | "completed";

export interface OrderStatus {
  id: string;
  name: string;
  color: ColorKey;
  kind: StatusKind;
  order: number;
  active: boolean;
}

export interface WorkOrder {
  id: string;
  folio: string;
  title: string;
  departmentId: string;
  categoryId: string;
  assignee: string;
  priorityId: string;
  statusId: string;
  /** ISO 8601 */
  createdAt: string;
  /** Fecha compromiso, `YYYY-MM-DD` en hora local. */
  dueDate: string;
  completedAt: string | null;
  estimatedCost: number;
  actualCost: number;
  description: string;
  observations: string;
}

export interface ChecklistItem {
  id: string;
  orderId: string;
  label: string;
  required: boolean;
  done: boolean;
}

export type HistoryAction = "created" | "status_changed" | "priority_changed" | "updated" | "note_added";

export interface HistoryEntry {
  id: string;
  orderId: string;
  /** ISO 8601 */
  at: string;
  action: HistoryAction;
  detail: string;
}

export interface DemoData {
  version: number;
  /** Momento en que se generó el escenario; las fechas de ejemplo son relativas a este instante. */
  seededAt: string;
  departments: Department[];
  categories: OrderCategory[];
  priorities: Priority[];
  statuses: OrderStatus[];
  orders: WorkOrder[];
  checklist: ChecklistItem[];
  history: HistoryEntry[];
}
