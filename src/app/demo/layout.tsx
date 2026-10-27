import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { Toaster } from "@/components/ui/sonner";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: { default: siteConfig.title, template: `%s · ${siteConfig.name}` },
  description: siteConfig.description,
};

export default function DemoLayout({ children }: LayoutProps<"/demo">) {
  return (
    <>
      <AppShell>{children}</AppShell>
      <Toaster position="top-right" />
    </>
  );
}
