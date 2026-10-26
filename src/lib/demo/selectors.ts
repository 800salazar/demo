import type { DemoData } from "./types";

export interface DepartmentSummary {
  departmentId: string;
  department: string;
  orders: number;
  actualCost: number;
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
      };
    })
    .sort((a, b) => b.actualCost - a.actualCost);
}
