import type { Metadata } from "next";
import { Suspense } from "react";
import { AiStatus } from "@/components/ai/ai-status";
import { ModulePlaceholder } from "@/components/shared/module-placeholder";
import { PageHeader } from "@/components/shared/page-header";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = { title: "Inteligencia artificial empresarial" };

export default function IaPage() {
  return (
    <>
      <PageHeader
        eyebrow="Demo 3"
        title="Inteligencia artificial empresarial"
        description="Inteligencia artificial que realmente utiliza tu información: ayuda a encontrar problemas, analizar costos y detectar oportunidades de mejora."
      />
      <div className="space-y-6">
        <Suspense fallback={<Skeleton className="h-24 w-full rounded-xl" aria-busy="true" aria-label="Verificando asistente" />}>
          <AiStatus />
        </Suspense>
        <ModulePlaceholder
          phase={4}
          summary="Un asistente que consulta y analiza los datos de la demostración: primero calcula las métricas con lógica verificable y solo entonces el modelo las interpreta."
          items={[
            "Dashboard financiero y operativo con gráficas de costos",
            "Preguntas sugeridas y preguntas libres del visitante",
            "Respuestas que separan datos, cálculos y recomendaciones",
            "Registros y métricas que sustentan cada conclusión",
            "Comparación de periodos y detección de oportunidades de ahorro",
            "Aviso claro cuando no hay información suficiente",
          ]}
        />
      </div>
    </>
  );
}
