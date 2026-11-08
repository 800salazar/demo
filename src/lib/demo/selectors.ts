import type { DemoData, WorkOrder } from "./types";

export interface DepartmentSummary {
  departmentId: string;
  department: string;
  orders: number;
  actualCost: number;
  details: Pick<WorkOrder, "id" | "folio" | "title" | "actualCost">[];
}

/** Órdenes y costo real por departamento, de mayor a menor costo. */
export function summarizeByDepartment(data: DemoData): DepartmentSummary[] {
  return data.departments
    .map((department) => {
      const orders = data.orders.filter((order) => order.departmentId === department.id);
      return {
        departmentId: department.id,
        department: department.name,
        orders: orders.length,
        actualCost: orders.reduce((total, order) => total + order.actualCost, 0),
        details: orders.map(({ id, folio, title, actualCost }) => ({ id, folio, title, actualCost })),
      };
    })
    .sort((a, b) => b.actualCost - a.actualCost);
}
