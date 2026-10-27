import type { Metadata } from "next";
import { PrioritiesOverview } from "@/components/admin/priorities-overview";
import { ModulePlaceholder } from "@/components/shared/module-placeholder";
import { PageHeader } from "@/components/shared/page-header";

export const metadata: Metadata = { title: "Sistema autoadministrable" };

export default function AdministracionPage() {
  return (
    <>
      <PageHeader
        eyebrow="Demo 1"
        title="Sistema autoadministrable"
        description="Menos dependencia, más autonomía: tu equipo realiza cambios cotidianos sin esperar ni pagar por modificaciones sencillas."
      />
      <div className="space-y-6">
        <PrioritiesOverview />
        <ModulePlaceholder
          phase={2}
          summary="Administración de las listas y configuraciones que usa el sistema, con identificadores estables para conservar las relaciones entre registros."
          items={[
            "Crear una prioridad nueva, por ejemplo «Crítico»",
            "Renombrar y cambiar el color de cualquier prioridad",
            "Reordenar, activar y desactivar prioridades",
            "Ver los cambios reflejados al instante en las órdenes existentes",
            "Administrar departamentos, categorías y estados de proceso",
            "Agregar campos adicionales sencillos a las órdenes",
          ]}
        />
      </div>
    </>
  );
}
