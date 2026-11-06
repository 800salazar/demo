import type { Metadata } from "next";
import { FileSpreadsheet, Plug, Radio, type LucideIcon } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "Integraciones" };

const integrations: { name: string; icon: LucideIcon }[] = [
  { name: "Excel y CSV", icon: FileSpreadsheet },
  { name: "ERP y administración", icon: Plug },
  { name: "Microsoft 365 y Google Workspace", icon: Plug },
  { name: "APIs externas", icon: Plug },
  { name: "Equipos y sensores", icon: Radio },
  { name: "Inventarios", icon: Plug },
];

export default function IntegracionesPage() {
  return (
    <>
      <PageHeader
        title="Integraciones"
        description="Opciones de conexión · Aún no activas en el demo."
      />
      <ul data-guide="integrations" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {integrations.map(({ name, icon: Icon }) => (
          <li key={name}>
            <Card className="h-full">
              <CardHeader className="flex items-center gap-3">
                <Icon className="size-5 shrink-0 text-primary" aria-hidden />
                <CardTitle>{name}</CardTitle>
              </CardHeader>
            </Card>
          </li>
        ))}
      </ul>
    </>
  );
}
