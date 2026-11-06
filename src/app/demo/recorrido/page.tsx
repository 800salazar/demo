import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { demoRoutes } from "@/config/routes";
import { GuideStartButton } from "@/components/guide/demo-guide";

export const metadata: Metadata = { title: "Guía de uso" };

const steps = [
  {
    href: demoRoutes.administration,
    time: "≈ 30 s",
    text: "Consulta las prioridades.",
  },
  {
    href: demoRoutes.operations,
    time: "≈ 60 s",
    text: "Ajusta el costo de una orden y guarda.",
  },
  {
    href: demoRoutes.ai,
    time: "≈ 60 s",
    text: "Pregunta al asistente por los costos.",
  },
];

export default function RecorridoPage() {
  return (
    <>
      <PageHeader
        title="Guía de uso"
        actions={<GuideStartButton guide="full" />}
      />
      <div className="space-y-6">
        <ol className="grid gap-4">
          {steps.map((step, index) => (
            <li key={step.href}>
              <Card>
                <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <span
                    className="grid size-10 shrink-0 place-items-center rounded-full bg-primary text-base font-semibold text-primary-foreground"
                  >
                    <span className="sr-only">Paso </span>{index + 1}
                  </span>
                  <div className="flex-1 space-y-1">
                    <p className="text-base font-medium text-pretty">{step.text}</p>
                  </div>
                  <Badge variant="secondary">{step.time}</Badge>
                  <Button asChild size="lg" variant="outline">
                    <Link href={step.href}>
                      <span aria-hidden>Ir</span><span className="sr-only">Ir al paso {index + 1}</span>
                      <ArrowRight data-icon="inline-end" aria-hidden />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </li>
          ))}
        </ol>
      </div>
    </>
  );
}
