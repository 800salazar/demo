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
import styles from "@/components/layout/demo-theme.module.css";

type ResetDemoButtonProps = Pick<ComponentProps<typeof Button>, "variant" | "size" | "className">;

export function ResetDemoButton({ variant = "outline", size = "default", className }: ResetDemoButtonProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          <RotateCcw data-icon="inline-start" aria-hidden />
          Restablecer demo
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className={`${styles.theme} ${styles.resetDialog}`}>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Restablecer el demo?</AlertDialogTitle>
          <AlertDialogDescription>
            Se perderán tus cambios en este navegador y volverán los datos originales.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={() => {
              resetDemoData();
              toast.success("Demo restablecido");
            }}
          >
            Restablecer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
