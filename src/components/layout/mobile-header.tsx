"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Brand } from "@/components/layout/brand";
import { SidebarFooter } from "@/components/layout/sidebar-footer";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import styles from "./demo-theme.module.css";

export function MobileHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className={`${styles.mobileHeader} sticky top-0 z-40 flex items-center justify-between border-b px-4 backdrop-blur lg:hidden`}>
      <Brand />
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon-lg" aria-label="Abrir menú">
            <Menu aria-hidden />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" showCloseButton={false} className={`${styles.theme} ${styles.navigationSurface} ${styles.mobileMenu}`}>
          <SheetHeader className={styles.mobileMenuHeader}>
            <SheetTitle className="sr-only">Menú</SheetTitle>
            <SheetDescription className="sr-only">Navegación principal de la demostración</SheetDescription>
            <Brand variant="white" onClick={() => setOpen(false)} />
          </SheetHeader>
          <SheetClose asChild>
            <Button variant="ghost" size="icon" aria-label="Cerrar menú" className={styles.menuClose}><X aria-hidden /></Button>
          </SheetClose>
          <div className="min-h-0 flex-1 overflow-y-auto">
            <SidebarNav onNavigate={() => setOpen(false)} />
          </div>
          <SidebarFooter />
        </SheetContent>
      </Sheet>
    </header>
  );
}
