import type { Metadata } from "next";
import { CostByDepartmentChart } from "@/components/operations/cost-by-department-chart";
import { PageHeader } from "@/components/shared/page-header";
import { OperationsDashboard } from "@/components/operations/operations-dashboard";
import { OperationalAssistant } from "@/components/ai/operational-assistant";

export const metadata: Metadata = { title: "Control de operaciones" };

export default function OperacionesPage() {
  return (
    <>
      <PageHeader
        title="Control de operaciones"
      />
      <div className="space-y-6">
        <OperationsDashboard />
        <CostByDepartmentChart />
        <OperationalAssistant />
      </div>
    </>
  );
}
