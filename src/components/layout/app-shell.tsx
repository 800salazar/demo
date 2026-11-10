import type { ReactNode } from "react";
import Link from "next/link";
import { Brand } from "@/components/layout/brand";
import { ContactFooter } from "@/components/layout/contact-footer";
import { GuideHelpButton } from "@/components/guide/demo-guide";
import { demoRoutes } from "@/config/routes";
import styles from "./demo-theme.module.css";

export function AppShell({ children }: { children: ReactNode }) {
  return <div className={styles.content}>
    <header className={styles.workspaceHeader}>
      <Brand />
      <nav aria-label="Principal"><Link href={demoRoutes.home}>Inicio</Link></nav>
    </header>
    <main className={styles.main}><GuideHelpButton />{children}</main>
    <ContactFooter />
  </div>;
}
