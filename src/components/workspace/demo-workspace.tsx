"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { DropdownMenu, Tabs } from "radix-ui";
import { ClipboardList, SlidersHorizontal, ChartNoAxesCombined, Download, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { OperationsDashboard, OperationsMetrics, type OrderEditorControl } from "@/components/operations/operations-dashboard";
import { CostByDepartmentChart } from "@/components/operations/cost-by-department-chart";
import { NewOrderForm, type NewOrderControl } from "@/components/operations/new-order";
import { OperationalAssistant, type AssistantControl } from "@/components/ai/operational-assistant";
import { ChangeHistory } from "@/components/admin/change-history";
import { CatalogSettings } from "@/components/admin/catalog-settings";
import { getSnapshot } from "@/lib/demo/store";
import { demoRoutes } from "@/config/routes";
import { notifyGuideAction } from "@/lib/guide/steps";
import type { ReportDays } from "@/lib/demo/report";
import { OrdersTable } from "./orders-table";
import { DirectorDashboard } from "./director-dashboard";
import styles from "./demo-workspace.module.css";

export function DemoWorkspace() {
  const params = useSearchParams();
  const requested = params.get("vista");
  const view = requested === "administrador" || requested === "direccion" ? requested : "operador";
  const [aiOpen, setAiOpen] = useState(false);
  useEffect(() => { if (!aiOpen) window.dispatchEvent(new Event("salazar:stop-dictation")); }, [aiOpen]);
  const [exporting, setExporting] = useState(false);
  const assistant = useRef<AssistantControl>(null);
  const newOrder = useRef<NewOrderControl>(null);
  const editor = useRef<OrderEditorControl>(null);
  const launcher = useRef<HTMLButtonElement>(null);
  const rail = useRef<HTMLElement>(null);
  useEffect(() => {
    const viewport = window.visualViewport;
    function sizePanel() {
      if (rail.current && window.matchMedia("(min-width: 1100px)").matches) {
        const top = Math.max(88, rail.current.getBoundingClientRect().top - (viewport?.offsetTop ?? 0));
        rail.current.style.setProperty("--assistant-desktop-height", `${Math.max(0, (viewport?.height ?? window.innerHeight) - top - 16)}px`);
      }
      rail.current?.style.setProperty("--assistant-viewport", `${viewport?.height ?? window.innerHeight}px`);
      rail.current?.style.setProperty("--assistant-bottom", `${Math.max(8, window.innerHeight - (viewport?.height ?? window.innerHeight) - (viewport?.offsetTop ?? 0) + 8)}px`);
    }
    sizePanel();
    const observer = new ResizeObserver(sizePanel);
    if (rail.current?.parentElement) observer.observe(rail.current.parentElement);
    window.addEventListener("resize", sizePanel);
    window.addEventListener("scroll", sizePanel, { passive: true });
    viewport?.addEventListener("resize", sizePanel);
    viewport?.addEventListener("scroll", sizePanel);
    return () => { observer.disconnect(); window.removeEventListener("resize", sizePanel); window.removeEventListener("scroll", sizePanel); viewport?.removeEventListener("resize", sizePanel); viewport?.removeEventListener("scroll", sizePanel); };
  }, []);
  useEffect(() => {
    function guideTarget(event: Event) { setAiOpen(String((event as CustomEvent).detail).startsWith("ai-")); }
    window.addEventListener("salazar:guide-target", guideTarget);
    return () => window.removeEventListener("salazar:guide-target", guideTarget);
  }, []);
  function changeView(next: string) {
    window.history.pushState(null, "", `${demoRoutes.workspace}?vista=${next}`);
    notifyGuideAction(next === "direccion" ? "view-director" : next === "administrador" ? "view-admin" : "view-operator");
  }
  function ask(question: string) { setAiOpen(true); assistant.current?.askQuestion(question); }
  function edit(id: string) {
    changeView("operador"); editor.current?.selectOrder(id);
    requestAnimationFrame(() => document.querySelector('[data-guide="order-edit"]')?.scrollIntoView({ block: "start", behavior: "instant" }));
  }
  async function download(days: ReportDays) {
    const snapshot = getSnapshot();
    if (!snapshot || exporting) return;
    setExporting(true);
    try {
      const { buildOperationalPdf } = await import("@/lib/demo/report");
      buildOperationalPdf(snapshot, new Date(), { view, days }).save(`salazar-reporte-${view}-${days}-dias.pdf`);
      notifyGuideAction("report-ready");
    } catch { toast.error("No se pudo generar el PDF. Intenta de nuevo."); }
    finally { setExporting(false); }
  }
  return <div className={styles.workspace}>
    <div className={styles.workspaceGrid}>
      <div className={styles.workArea}>
        <div className={styles.topline}><div><p className={styles.eyebrow}>Operación de planta</p><h1 className={styles.title}>Control de órdenes</h1></div>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild><Button data-guide="report-download" variant="outline" disabled={exporting}><Download aria-hidden />{exporting ? "Generando…" : "Reporte PDF"}</Button></DropdownMenu.Trigger>
            <DropdownMenu.Portal><DropdownMenu.Content align="end" sideOffset={6} aria-label="Periodo del reporte" aria-labelledby={undefined} className={styles.reportMenu}>
              {([7, 14] as const).map(days => <DropdownMenu.Item key={days} className={styles.reportOption} onSelect={() => void download(days)}>Últimos {days} días</DropdownMenu.Item>)}
            </DropdownMenu.Content></DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
        <Tabs.Root value={view} onValueChange={changeView}>
          <Tabs.List aria-label="Vista del demo" className={styles.viewSelector} data-guide="view-selector">
            <Tabs.Trigger value="operador" className={styles.viewButton}><ClipboardList aria-hidden />Operador</Tabs.Trigger>
            <Tabs.Trigger value="administrador" className={styles.viewButton}><SlidersHorizontal aria-hidden />Administrador</Tabs.Trigger>
            <Tabs.Trigger value="direccion" className={styles.viewButton}><ChartNoAxesCombined aria-hidden />Dirección</Tabs.Trigger>
          </Tabs.List>
          {view !== "direccion" && <OperationsMetrics />}
          <Tabs.Content value="operador" forceMount hidden={view !== "operador"} className={styles.panel}>
            <NewOrderForm controlRef={newOrder} onCreated={edit} />
            <OperationsDashboard controlRef={editor} onAsk={ask} />
          </Tabs.Content>
          <Tabs.Content value="administrador" forceMount hidden={view !== "administrador"} className={styles.panel}>
            <CatalogSettings /><ChangeHistory />
          </Tabs.Content>
          <Tabs.Content value="direccion" forceMount hidden={view !== "direccion"} className={styles.panel}>
            <DirectorDashboard onAsk={ask} /><CostByDepartmentChart onAsk={ask} />
          </Tabs.Content>
        </Tabs.Root>
        <OrdersTable onEdit={edit} onAsk={ask} />
      </div>
      <aside ref={rail} data-guide-fixed id="workspace-assistant" className={styles.assistantRail} data-open={aiOpen} aria-label="Asistente de la operación" onKeyDown={event => {
        if (event.key === "Escape" && window.matchMedia("(max-width: 1099px)").matches) { setAiOpen(false); launcher.current?.focus(); }
      }}>
        <div className={styles.mobileClose}><Button variant="ghost" onClick={() => { setAiOpen(false); launcher.current?.focus(); }}><X aria-hidden />Volver a la operación</Button></div>
        <OperationalAssistant controlRef={assistant} getDraft={() => newOrder.current?.getDraft() ?? null} onPrepare={draft => {
          const applied = newOrder.current?.prepare(draft);
          if (applied) {
            changeView("operador"); setAiOpen(false);
            requestAnimationFrame(() => { const form = document.querySelector<HTMLElement>('[data-guide="new-order"]'); form?.scrollIntoView({ block: "start", behavior: "instant" }); form?.querySelector<HTMLInputElement>("input")?.focus({ preventScroll: true }); });
          }
          return !!applied;
        }} />
      </aside>
    </div>
    <button ref={launcher} className={styles.mobileAiButton} aria-controls="workspace-assistant" aria-expanded={aiOpen} onClick={() => { setAiOpen(!aiOpen); if (!aiOpen) requestAnimationFrame(() => document.getElementById("operational-question")?.focus({ preventScroll: true })); }}><Sparkles aria-hidden />Asistente IA</button>
  </div>;
}
