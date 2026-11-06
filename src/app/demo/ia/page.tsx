import type { Metadata } from "next";
import { Suspense } from "react";
import { AiStatus } from "@/components/ai/ai-status";
import { OperationalAssistant } from "@/components/ai/operational-assistant";
import { OperationsDashboard } from "@/components/operations/operations-dashboard";
import { CostByDepartmentChart } from "@/components/operations/cost-by-department-chart";
import { PageHeader } from "@/components/shared/page-header";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = { title: "Inteligencia artificial empresarial" };

export default function IaPage() {
  return (
    <>
      <PageHeader
        title="IA empresarial"
      />
      <div className="space-y-6">
        <Suspense fallback={<Skeleton className="h-6 w-56 rounded-lg" aria-busy="true" aria-label="Verificando asistente" />}>
          <AiStatus />
        </Suspense>
        <OperationalAssistant />
        <OperationsDashboard />
        <CostByDepartmentChart />
      </div>
    </>
  );
}
