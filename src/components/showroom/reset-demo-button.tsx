"use client";

import type { ComponentProps } from "react";
import { RotateCcw } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { resetDemoData } from "@/lib/demo/store";

type ResetDemoButtonProps = Pick<ComponentProps<typeof Button>, "variant" | "size" | "className">;

export function ResetDemoButton({ variant = "outline", size = "default", className }: ResetDemoButtonProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          <RotateCcw data-icon="inline-start" aria-hidden />
          Restablecer datos de demostración
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Restablecer los datos de demostración?</AlertDialogTitle>
          <AlertDialogDescription>
            Se perderán los cambios que hayas hecho y se restaurará el escenario original. Esta acción solo afecta a
            tu navegador.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              resetDemoData();
              toast.success("Datos de demostración restablecidos");
            }}
          >
            Restablecer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
