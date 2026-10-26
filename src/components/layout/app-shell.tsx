import type { ReactNode } from "react";
import { Brand } from "@/components/layout/brand";
import { MobileHeader } from "@/components/layout/mobile-header";
import { SidebarFooter } from "@/components/layout/sidebar-footer";
import { SidebarNav } from "@/components/layout/sidebar-nav";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[16rem_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-dvh flex-col gap-6 border-r bg-sidebar p-4 lg:flex">
        <Brand className="px-2 pt-2" />
        <div className="flex-1 overflow-y-auto">
          <SidebarNav />
        </div>
        <SidebarFooter />
      </aside>
      <div className="flex min-h-dvh min-w-0 flex-col">
        <MobileHeader />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">{children}</main>
        <footer className="border-t px-4 py-4 text-center text-xs text-muted-foreground sm:px-6 lg:px-10">
          Demostración de Salazar Consultores · Todos los datos son ficticios.
        </footer>
      </div>
    </div>
  );
}
