import type { ReactNode } from "react";
import { COLOR_STYLES } from "@/lib/demo/colors";
import type { ColorKey } from "@/lib/demo/types";
import { cn } from "@/lib/utils";

/** Etiqueta de color para prioridades, estados y otros indicadores administrables. */
export function ColorBadge({ color, children }: { color: ColorKey; children: ReactNode }) {
  const style = COLOR_STYLES[color];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        style.badge,
      )}
    >
      <span aria-hidden className={cn("size-1.5 rounded-full", style.dot)} />
      {children}
    </span>
  );
}
