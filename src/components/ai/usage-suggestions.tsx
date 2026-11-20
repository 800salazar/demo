"use client";

import { useRef, useState } from "react";
import { ArrowLeft, ChartNoAxesCombined, ChevronRight, CircleDot, ClipboardCheck, ClipboardList, FileDown, Lightbulb, X } from "lucide-react";
import { Popover } from "radix-ui";
import { Button } from "@/components/ui/button";
import { useGuide } from "@/components/guide/demo-guide";
import guideStyles from "@/components/guide/demo-guide.module.css";
import { maintenanceDepartmentId, type GuideId } from "@/lib/guide/steps";
import type { DemoData, WorkOrder } from "@/lib/demo/types";
import styles from "./operational-assistant.module.css";

type Props = {
  data: DemoData | null;
  disabled: boolean;
  onConsultOrder: (order: WorkOrder) => void;
  onStatusHelp: () => void;
};

export function UsageSuggestions({ data, disabled, onConsultOrder, onStatusHelp }: Props) {
  const { start, active } = useGuide();
  const trigger = useRef<HTMLButtonElement>(null);
  const skipReturnFocus = useRef(false);
  const [open, setOpen] = useState(false);
  const [choosingOrder, setChoosingOrder] = useState(false);
  const department = data?.departments.find(({ id }) => id === maintenanceDepartmentId);

  function startGuide(guide: GuideId) {
    skipReturnFocus.current = true;
    setOpen(false);
    start(guide, trigger.current ?? undefined);
  }

  return <Popover.Root open={open} onOpenChange={setOpen}>
    <Popover.Trigger asChild>
      <Button ref={trigger} type="button" variant="outline"
        className={`${guideStyles.attention} ${styles.usageTrigger}`}
        disabled={!data || disabled || active} aria-label="Sugerencias" title="Sugerencias">
        <Lightbulb aria-hidden />
        <span className={styles.usageLabel}>Sugerencias</span>
      </Button>
    </Popover.Trigger>
    <Popover.Portal>
      <Popover.Content side="top" align="end" sideOffset={10} collisionPadding={8} className={styles.usagePopover}
        onOpenAutoFocus={() => { skipReturnFocus.current = false; }}
        onCloseAutoFocus={(event) => {
          if (skipReturnFocus.current) event.preventDefault();
          setChoosingOrder(false);
        }}>
        <div className={styles.usageHeader}>
          {choosingOrder && <button className={styles.usageIcon} type="button" aria-label="Volver a sugerencias" onClick={() => setChoosingOrder(false)}><ArrowLeft aria-hidden /></button>}
          <Popover.Title className="flex-1 font-semibold">{choosingOrder ? "Elige una orden" : "Sugerencias de uso"}</Popover.Title>
          <Popover.Close className={styles.usageIcon} aria-label="Cerrar sugerencias"><X aria-hidden /></Popover.Close>
        </div>
        {choosingOrder ? data?.orders.map((order, index) =>
          <button key={order.id} type="button" autoFocus={index === 0} className={styles.usageOption}
            onClick={() => { skipReturnFocus.current = true; setOpen(false); onConsultOrder(order); }}>
            <span><strong>{order.folio}</strong> · {order.title}</span>
          </button>
        ) : <>
          <button type="button" autoFocus className={styles.usageOption} disabled={!data?.orders.length} onClick={() => setChoosingOrder(true)}>
            <ClipboardList aria-hidden /><span>Consultar una orden</span><ChevronRight aria-hidden />
          </button>
          <button type="button" className={styles.usageOption} onClick={() => { setOpen(false); onStatusHelp(); }}>
            <CircleDot aria-hidden /><span>Agregar o editar un estado</span>
          </button>
          <button type="button" className={styles.usageOption} disabled={!data?.departments.length} onClick={() => startGuide("analyzeDepartment")}>
            <ChartNoAxesCombined aria-hidden /><span>{department ? `Analizar costos de ${department.name}` : "Analizar costos por departamento"}</span>
          </button>
          <button type="button" className={styles.usageOption} onClick={() => startGuide("helpChecklist")}>
            <ClipboardCheck aria-hidden /><span>Revisar el cierre de una orden</span>
          </button>
          <button type="button" className={styles.usageOption} onClick={() => startGuide("directorReport")}>
            <FileDown aria-hidden /><span>Descargar reporte de Dirección</span>
          </button>
        </>}
      </Popover.Content>
    </Popover.Portal>
  </Popover.Root>;
}
