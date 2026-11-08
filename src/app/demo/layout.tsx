import type { Metadata } from "next";
import { Suspense } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Toaster } from "@/components/ui/sonner";
import { siteConfig } from "@/config/site";
import { brandIcons } from "@/config/brand";
import { DemoGuideProvider } from "@/components/guide/demo-guide";
import styles from "@/components/layout/demo-theme.module.css";

export const metadata: Metadata = {
  title: { default: siteConfig.title, template: `%s · ${siteConfig.name}` },
  description: siteConfig.description,
  icons: brandIcons,
};

export default function DemoLayout({ children }: LayoutProps<"/demo">) {
  return (
    <div className={styles.theme}>
      <Suspense fallback={<main className="p-6" aria-busy="true">Cargando demo…</main>}>
        <DemoGuideProvider><AppShell>{children}</AppShell></DemoGuideProvider>
      </Suspense>
      <Toaster position="top-right" />
    </div>
  );
}
