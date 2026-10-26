import type { ColorKey } from "./types";

interface ColorStyle {
  label: string;
  /** Clases completas para que Tailwind las detecte en el código fuente. */
  badge: string;
  dot: string;
}

export const COLOR_STYLES: Record<ColorKey, ColorStyle> = {
  red: { label: "Rojo", badge: "bg-red-100 text-red-800 ring-red-600/20", dot: "bg-red-500" },
  darkRed: { label: "Rojo oscuro", badge: "bg-red-900 text-red-50 ring-red-950/40", dot: "bg-red-300" },
  orange: { label: "Naranja", badge: "bg-orange-100 text-orange-800 ring-orange-600/20", dot: "bg-orange-500" },
  amber: { label: "Amarillo", badge: "bg-amber-100 text-amber-800 ring-amber-600/20", dot: "bg-amber-500" },
  green: { label: "Verde", badge: "bg-green-100 text-green-800 ring-green-600/20", dot: "bg-green-500" },
  teal: { label: "Turquesa", badge: "bg-teal-100 text-teal-800 ring-teal-600/20", dot: "bg-teal-500" },
  blue: { label: "Azul", badge: "bg-blue-100 text-blue-800 ring-blue-600/20", dot: "bg-blue-500" },
  violet: { label: "Violeta", badge: "bg-violet-100 text-violet-800 ring-violet-600/20", dot: "bg-violet-500" },
  slate: { label: "Gris", badge: "bg-slate-100 text-slate-700 ring-slate-500/20", dot: "bg-slate-400" },
};
