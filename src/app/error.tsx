"use client";

import { Button } from "@/components/ui/button";

export default function Error({ retry }: { error: unknown; retry: () => void }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-24 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">Algo salió mal</h1>
      <p className="text-muted-foreground">
        Ocurrió un error inesperado al mostrar esta pantalla. Puedes intentarlo de nuevo.
      </p>
      <Button size="lg" onClick={() => retry()}>
        Intentar de nuevo
      </Button>
    </div>
  );
}
