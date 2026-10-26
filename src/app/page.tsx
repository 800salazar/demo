import Link from "next/link";
import { Compass, Plug } from "lucide-react";
import { ContactCta } from "@/components/showroom/contact-cta";
import { DemoCard } from "@/components/showroom/demo-card";
import { DemoDataPanel } from "@/components/showroom/demo-data-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { demoModules } from "@/config/site";

export default function HomePage() {
  return (
    <div className="space-y-12">
      <section className="rounded-2xl bg-linear-to-br from-accent via-card to-card px-6 py-10 ring-1 ring-foreground/10 sm:px-10 sm:py-14">
        <Badge variant="secondary" className="mb-4">
          Demostración interactiva
        </Badge>
        <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-balance sm:text-4xl lg:text-5xl">
          Software que se adapta a tu empresa, <span className="text-primary">no al revés.</span>
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-pretty text-muted-foreground">
          Descubre cómo simplificamos operaciones, reducimos errores y facilitamos el trabajo de tu equipo.
        </p>
        <Button asChild size="lg" className="mt-8">
          <Link href="/recorrido">
            <Compass data-icon="inline-start" aria-hidden />
            Recorrido de 3 minutos
          </Link>
        </Button>
      </section>

      <section aria-labelledby="demos-title">
        <h2 id="demos-title" className="sr-only">
          Demostraciones
        </h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {demoModules.map((module) => (
            <DemoCard
              key={module.href}
              module={module}
              className={module.number === 3 ? "md:col-span-2 xl:col-span-1" : undefined}
            />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4 rounded-2xl bg-card px-6 py-6 ring-1 ring-foreground/10 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground">
            <Plug className="size-5" aria-hidden />
          </div>
          <div>
            <h2 className="font-medium">Conectamos tus sistemas y procesos</h2>
            <p className="text-sm text-muted-foreground">
              ERP, Microsoft 365 y Google Workspace, archivos Excel y CSV, APIs, equipos industriales e inventarios.
            </p>
          </div>
        </div>
        <Button asChild variant="outline" size="lg">
          <Link href="/integraciones">Ver integraciones</Link>
        </Button>
      </section>

      <DemoDataPanel />
      <ContactCta />
    </div>
  );
}
