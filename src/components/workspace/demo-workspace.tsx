"use client";

import { useSearchParams } from "next/navigation";
import { Tabs } from "radix-ui";
import { ClipboardList, SlidersHorizontal } from "lucide-react";
import { OperationsDashboard, OperationsMetrics } from "@/components/operations/operations-dashboard";
import { CostByDepartmentChart } from "@/components/operations/cost-by-department-chart";
import { OperationalAssistant } from "@/components/ai/operational-assistant";
import { CatalogSettings } from "@/components/admin/catalog-settings";
import { demoRoutes } from "@/config/routes";
import { notifyGuideAction } from "@/lib/guide/steps";
import styles from "./demo-workspace.module.css";

export function DemoWorkspace() {
  const params = useSearchParams();
  const view = params.get("vista") === "administrador" ? "administrador" : "operador";
  function changeView(next: string) {
    // Native history integrates with Next and retains the editor and chat in memory.
    window.history.pushState(null, "", `${demoRoutes.workspace}?vista=${next}`);
    notifyGuideAction(next === "administrador" ? "view-admin" : "view-operator");
  }
  return (
    <div className={styles.workspace}>
      <h1 className={styles.title}>Control de órdenes</h1>
      <Tabs.Root value={view} onValueChange={changeView}>
        <Tabs.List aria-label="Vista del demo" className={styles.viewSelector} data-guide="view-selector">
          <Tabs.Trigger value="operador" className={styles.viewButton}><ClipboardList aria-hidden />Operador</Tabs.Trigger>
          <Tabs.Trigger value="administrador" className={styles.viewButton}><SlidersHorizontal aria-hidden />Administrador</Tabs.Trigger>
        </Tabs.List>
        <OperationsMetrics />
        <Tabs.Content value="operador" forceMount hidden={view !== "operador"} className={styles.panel}>
          <div className={styles.operatorGrid}>
            <OperationsDashboard />
            <OperationalAssistant />
          </div>
        </Tabs.Content>
        <Tabs.Content value="administrador" forceMount hidden={view !== "administrador"} className={styles.panel}>
          <div className={styles.adminGrid}>
            <CostByDepartmentChart />
            <CatalogSettings />
          </div>
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
}
