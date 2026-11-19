"use client";

import { AiAction } from "@/components/ai/ai-action";
import { useEffect, useRef, useState } from "react";
import { Popover } from "radix-ui";
import { X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatMXN } from "@/lib/format";
import { summarizeByDepartment } from "@/lib/demo/selectors";
import { useDemoData } from "@/lib/demo/use-demo-data";
import { maintenanceDepartmentId, notifyGuideAction } from "@/lib/guide/steps";

export function CostByDepartmentChart({ onAsk }: { onAsk?: (question: string) => void }) {
  const data = useDemoData();
  const [openId, setOpenId] = useState<string | null>(null);
  const [pinned, setPinned] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (closeTimer.current) clearTimeout(closeTimer.current); }, []);

  function cancelClose() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = null;
  }
  function scheduleClose() {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpenId(null), 200);
  }

  const departments = data ? summarizeByDepartment(data) : [];
  const guideDepartment = departments.find(({ departmentId }) => departmentId === maintenanceDepartmentId) ?? departments[0];
  const total = departments.reduce((sum, item) => sum + item.actualCost, 0);
  const colors = ["#2563eb", "#7c3aed", "#0891b2", "#d97706", "#16a34a", "#db2777"];
  const segments = departments.map((item, index) => {
    const percentage = total ? item.actualCost / total * 100 : 0;
    const start = total ? departments.slice(0, index).reduce((sum, previous) => sum + previous.actualCost, 0) / total * 100 : 0;
    return { percentage, midpoint: start + percentage / 2, color: colors[index % colors.length], start, end: start + percentage };
  });
  const stops = segments.map(segment => `${segment.color} ${segment.start}% ${segment.end}%`);
  const percent = (value: number) => `${new Intl.NumberFormat("es-MX", { maximumFractionDigits: 1 }).format(value)}%`;
  return (
    <Card>
      <CardHeader><CardTitle role="heading" aria-level={2}>Costo por departamento (MXN)</CardTitle></CardHeader>
      <CardContent>
        {data ? (
          <div data-guide="cost-chart" aria-label="Costos por departamento">
            <div className="relative mx-auto mb-5 grid size-64 max-w-full place-items-center rounded-full" aria-hidden style={{ aspectRatio: "1", background: total ? `conic-gradient(${stops.join(",")})` : "#e5e7eb" }}>
              <div className="grid h-[58%] w-[58%] place-content-center rounded-full bg-white text-center"><span className="text-xs text-muted-foreground">Costo total</span><strong className="text-sm">{formatMXN(total)}</strong></div>
              {segments.map((segment, index) => {
                if (segment.percentage < 6) return null;
                const angle = segment.midpoint * Math.PI / 50 - Math.PI / 2;
                return <span key={departments[index].departmentId} className="absolute -translate-x-1/2 -translate-y-1/2 rounded bg-slate-950/75 px-1 py-0.5 text-xs font-bold text-white" style={{ left: `${50 + 40 * Math.cos(angle)}%`, top: `${50 + 40 * Math.sin(angle)}%` }}>{percent(segment.percentage)}</span>;
              })}
            </div>
            <p className="sr-only">Costo total: {formatMXN(total)}. Selecciona un departamento para ver el desglose.</p>
            <div className="space-y-1">{departments.map((department, index) => (
              <Popover.Root key={department.departmentId} open={openId === department.departmentId}
                onOpenChange={(open) => { cancelClose(); setPinned(open); setOpenId(open ? department.departmentId : null); }}>
                <Popover.Trigger asChild>
                  <button type="button" className="group min-h-11 w-full rounded-xl px-2 py-2 text-left hover:bg-accent/60 focus-visible:outline-2 focus-visible:outline-ring"
                    data-guide={department === guideDepartment ? "cost-department" : undefined}
                    aria-label={`${department.department}: ${formatMXN(department.actualCost)}, ${percent(segments[index].percentage)} del total. Ver desglose`}
                    onClick={(event) => {
                      event.preventDefault();
                      cancelClose();
                      const open = !pinned || openId !== department.departmentId;
                      setPinned(open);
                      setOpenId(open ? department.departmentId : null);
                      if (open) notifyGuideAction("department-selected");
                    }}
                    onPointerEnter={(event) => { if (!pinned && event.pointerType === "mouse") { cancelClose(); setOpenId(department.departmentId); } }}
                    onPointerLeave={(event) => { if (!pinned && event.pointerType === "mouse") scheduleClose(); }}>
                    <span className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 text-sm">
                      <span className="flex items-center gap-2 font-medium"><span className="size-3 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} aria-hidden />{department.department}</span>
                      <span className="font-semibold tabular-nums">{formatMXN(department.actualCost)} <span className="text-muted-foreground">· {percent(segments[index].percentage)}</span></span>
                    </span>

                  </button>
                </Popover.Trigger>
                <Popover.Portal>
                  <Popover.Content side="top" sideOffset={8} collisionPadding={12} aria-label={`Desglose de ${department.department}`} aria-labelledby={undefined}
                    onOpenAutoFocus={(event) => event.preventDefault()} onCloseAutoFocus={(event) => event.preventDefault()}
                    onInteractOutside={(event) => {
                      if (event.target instanceof Element && event.target.closest("[data-demo-guide-panel]")) event.preventDefault();
                    }}
                    onPointerEnter={(event) => { if (event.pointerType === "mouse") cancelClose(); }}
                    onPointerLeave={(event) => { if (!pinned && event.pointerType === "mouse") scheduleClose(); }}
                    className="z-50 flex max-h-[var(--radix-popover-content-available-height)] w-80 max-w-[calc(100vw-1.5rem)] flex-col overflow-y-auto rounded-xl border bg-popover p-4 text-popover-foreground shadow-xl outline-none">
                    <div className="flex shrink-0 items-start justify-between gap-3">
                      <div>
                        <Popover.Title className="font-semibold">{department.department}</Popover.Title>
                        <p className="mt-1 text-sm font-medium">Total: {formatMXN(department.actualCost)}</p>
                      </div>
                      <Popover.Close aria-label="Cerrar desglose" className="grid size-11 shrink-0 place-items-center rounded-lg hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring"><X className="size-4" aria-hidden /></Popover.Close>
                    </div>
                    <div className="mt-3 min-h-10 max-h-[min(45dvh,20rem)] overflow-y-auto overscroll-contain">
                      {department.details.length ? <ul className="divide-y text-sm">
                        {department.details.map((order) => <li key={order.id} className="flex items-start justify-between gap-3 py-2.5">
                          <span className="min-w-0"><span className="font-medium">{order.folio}</span><span className="block break-words text-muted-foreground">{order.title}</span></span>
                          <span className="shrink-0 font-medium tabular-nums">{formatMXN(order.actualCost)}</span>
                        </li>)}
                      </ul> : <p className="text-sm text-muted-foreground">Sin órdenes.</p>}
                    </div>
                    {onAsk && <AiAction data-guide="cost-analysis" data-guide-fixed className="mt-3 w-full" onClick={() => {
                      cancelClose();
                      setPinned(false);
                      setOpenId(null);
                      notifyGuideAction("department-analysis");
                      onAsk(`Analiza los costos de ${department.department}. ¿Qué órdenes explican su costo y cuáles requieren atención?`);
                    }}>Analizar con IA</AiAction>}
                  </Popover.Content>
                </Popover.Portal>
              </Popover.Root>
            ))}</div>
          </div>
        ) : <Skeleton className="h-72 w-full" aria-busy="true" aria-label="Cargando gráfica" />}
      </CardContent>
    </Card>
  );
}
