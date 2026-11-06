"use client";

import Link from "next/link";
import { useId } from "react";
import { usePathname } from "next/navigation";
import { navItems } from "@/config/site";
import { isActiveDemoRoute } from "@/config/routes";
import { Check } from "lucide-react";
import styles from "./demo-theme.module.css";

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const navId = useId();

  return (
    <nav aria-label="Principal" className={styles.navigation}>
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = isActiveDemoRoute(pathname, item.href);

        return (
          <div key={item.href} className={item.demoNumber ? styles.navigationGroup : undefined}
            role={item.demoNumber ? "group" : undefined} aria-labelledby={item.demoNumber ? `${navId}-demo-${item.demoNumber}` : undefined}>
            {item.demoNumber && <p id={`${navId}-demo-${item.demoNumber}`} className={styles.navigationHeading}>Demo {item.demoNumber}</p>}
            <Link
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={styles.navigationLink}
            >
              <Icon className="size-4 shrink-0" aria-hidden />
              <span className="min-w-0 flex-1 leading-snug">{item.label}</span>
              {active && <Check className="size-4 shrink-0" aria-hidden />}
            </Link>
          </div>
        );
      })}
    </nav>
  );
}
