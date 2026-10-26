import Link from "next/link";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

/** Identidad textual temporal; sustituir el cuadro por el logotipo cuando esté disponible en `public/`. */
export function Brand({ className, onClick }: { className?: string; onClick?: () => void }) {
  return (
    <Link
      href="/"
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        className,
      )}
    >
      <span
        aria-hidden
        className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary text-lg font-semibold text-primary-foreground shadow-sm"
      >
        S
      </span>
      <span className="flex flex-col leading-tight">
        <span className="text-sm font-semibold tracking-tight">{siteConfig.name}</span>
        <span className="text-xs text-muted-foreground">{siteConfig.tagline}</span>
      </span>
    </Link>
  );
}
