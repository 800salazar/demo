import type { Metadata } from "next";
import { CostByDepartmentChart } from "@/components/operations/cost-by-department-chart";
import { ModulePlaceholder } from "@/components/shared/module-placeholder";
import { PageHeader } from "@/components/shared/page-header";
import { OperationsDashboard } from "@/components/operations/operations-dashboard";
import { OperationalAssistant } from "@/components/ai/operational-assistant";

export const metadata: Metadata = { title: "Control de operaciones" };

export default function OperacionesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Demo 2"
        title="Control de operaciones"
        description="Menos errores, procesos más sencillos: un sistema que guía a tu equipo paso a paso y ayuda a evitar errores operativos."
      />
      <div className="space-y-6">
        <OperationsDashboard />
        <CostByDepartmentChart />
        <OperationalAssistant />
        <ModulePlaceholder
          phase={3}
          summary="Gestión de órdenes de trabajo de una empresa manufacturera ficticia, con indicadores que se actualizan al instante."
          items={[
            "Dashboard con órdenes pendientes, en proceso, completadas y retrasadas",
            "Crear, editar y mover órdenes entre etapas en un tablero de estados",
            "Filtros por departamento, estado y prioridad",
            "Historial de cambios y observaciones por orden",
            "Checklist de actividades con validación antes de completar",
            "Alertas visuales para órdenes retrasadas",
          ]}
        />
      </div>
    </>
  );
}
