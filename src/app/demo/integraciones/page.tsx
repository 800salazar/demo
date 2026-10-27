import type { Metadata } from "next";
import { ModulePlaceholder } from "@/components/shared/module-placeholder";
import { PageHeader } from "@/components/shared/page-header";

export const metadata: Metadata = { title: "Integraciones" };

export default function IntegracionesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Integraciones"
        title="Conectamos tus sistemas y procesos"
        description="Ejemplos de las integraciones que desarrollamos, diferenciando con claridad las demostrativas de las conexiones reales."
      />
      <ModulePlaceholder
        phase={5}
        summary="Intercambio de información con otros sistemas, sin necesidad de una integración compleja."
        items={[
          "Importar órdenes desde un archivo CSV con validación y vista previa",
          "Exportar las órdenes a CSV",
          "ERP y sistemas administrativos",
          "Microsoft 365 y Google Workspace",
          "Aplicaciones externas mediante API",
          "Equipos, sensores industriales e inventarios (simulación identificada como tal)",
        ]}
      />
    </>
  );
}
