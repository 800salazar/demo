import type { ReactNode } from "react";
import { Brand } from "@/components/layout/brand";
import { MobileHeader } from "@/components/layout/mobile-header";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { ContactFooter } from "@/components/layout/contact-footer";
import { GuideHelpButton } from "@/components/guide/demo-guide";
import styles from "./demo-theme.module.css";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className={styles.shell}>
      <aside className={`${styles.sidebar} ${styles.navigationSurface}`}>
        <Brand className="px-2 pt-2" variant="white" />
        <div className="min-h-0 flex-1 overflow-y-auto">
          <SidebarNav />
        </div>
      </aside>
      <div className={styles.content}>
        <MobileHeader />
        <main className={styles.main}><GuideHelpButton />{children}</main>
        <ContactFooter />
      </div>
    </div>
  );
}
