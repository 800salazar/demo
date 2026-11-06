import Link from "next/link";
import { siteConfig } from "@/config/site";
import { demoRoutes } from "@/config/routes";
import { cn } from "@/lib/utils";
import { SalazarLogo } from "@/components/shared/salazar-logo";

/** Select the logo that keeps its contrast on the navigation surface. */
export function Brand({ className, onClick, variant = "blue" }: {
  className?: string; onClick?: () => void; variant?: "blue" | "white";
}) {
  return (
    <Link
      href={demoRoutes.home}
      aria-label={`${siteConfig.name} — Inicio del demo`}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        className,
      )}
    >
      <SalazarLogo variant={variant} eager />
    </Link>
  );
}
