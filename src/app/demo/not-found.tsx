import Link from "next/link";
import { Button } from "@/components/ui/button";
import { demoRoutes } from "@/config/routes";

export default function DemoNotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-24 text-center">
      <p className="text-sm font-medium text-primary">Error 404</p>
      <h1 className="text-2xl font-semibold tracking-tight">No encontramos esta demostración</h1>
      <p className="text-muted-foreground">Regresa al inicio del demo para elegir un módulo.</p>
      <Button asChild size="lg"><Link href={demoRoutes.home}>Volver al demo</Link></Button>
    </div>
  );
}
