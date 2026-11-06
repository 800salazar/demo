import type { Metadata } from "next";
import { PrioritiesOverview } from "@/components/admin/priorities-overview";
import { ModulePlaceholder } from "@/components/shared/module-placeholder";
import { PageHeader } from "@/components/shared/page-header";

export const metadata: Metadata = { title: "Sistema autoadministrable" };

export default function AdministracionPage() {
  return (
    <>
      <PageHeader
        title="Sistema autoadministrable"
      />
      <div className="space-y-6">
        <PrioritiesOverview />
        <ModulePlaceholder
          items={[
            "Crear, editar y ordenar prioridades",
            "Configurar departamentos y estados",
            "Agregar campos a las órdenes",
          ]}
        />
      </div>
    </>
  );
}
