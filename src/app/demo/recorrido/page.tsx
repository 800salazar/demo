import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ModulePlaceholder } from "@/components/shared/module-placeholder";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { demoRoutes } from "@/config/routes";

export const metadata: Metadata = { title: "Recorrido de 3 minutos" };

const steps = [
  {
    href: demoRoutes.administration,
    time: "≈ 30 s",
    text: "Agrega una nueva prioridad y comprueba cómo se actualiza el sistema.",
  },
  {
    href: demoRoutes.operations,
    time: "≈ 60 s",
    text: "Crea una orden, cambia su estado y observa cómo se actualizan los indicadores.",
  },
  {
    href: demoRoutes.ai,
    time: "≈ 60 s",
    text: "Pregunta a la inteligencia artificial qué departamento tiene mayores costos.",
  },
];

export default function RecorridoPage() {
  return (
    <>
      <PageHeader
        eyebrow="Recorrido guiado"
        title="Recorrido de 3 minutos"
        description="Tres pasos para comprobar la autonomía, la facilidad operativa y la inteligencia artificial aplicada a tus datos."
      />
      <div className="space-y-6">
        <ol className="grid gap-4">
          {steps.map((step, index) => (
            <li key={step.href}>
              <Card>
                <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <span
                    aria-hidden
                    className="grid size-10 shrink-0 place-items-center rounded-full bg-primary text-base font-semibold text-primary-foreground"
                  >
                    {index + 1}
                  </span>
                  <div className="flex-1 space-y-1">
                    <p className="text-xs font-medium tracking-wide text-primary uppercase">Paso {index + 1}</p>
                    <p className="text-base font-medium text-pretty">{step.text}</p>
                  </div>
                  <Badge variant="secondary">{step.time}</Badge>
                  <Button asChild size="lg" variant="outline">
                    <Link href={step.href}>
                      Ir al paso {index + 1}
                      <ArrowRight data-icon="inline-end" aria-hidden />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </li>
          ))}
        </ol>
        <ModulePlaceholder
          phase={5}
          summary="Hoy cada paso lleva directamente al módulo correspondiente. El recorrido guiado completo añadirá:"
          items={[
            "Avance visible del recorrido de paso en paso",
            "Resaltado de las funciones importantes de cada pantalla",
            "Instrucciones breves, sin tutoriales largos ni ventanas emergentes constantes",
          ]}
        />
      </div>
    </>
  );
}
