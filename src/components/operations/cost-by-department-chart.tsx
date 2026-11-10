"use client";

import { useEffect, useRef, useState } from "react";
import { Popover } from "radix-ui";
import { X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatMXN } from "@/lib/format";
import { summarizeByDepartment } from "@/lib/demo/selectors";
import { useDemoData } from "@/lib/demo/use-demo-data";

export function CostByDepartmentChart() {
  const data = useDemoData();
  const [openId, setOpenId] = useState<string | null>(null);
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
  const maxCost = Math.max(0, ...departments.map((item) => item.actualCost));
  return (
    <Card>
      <CardHeader><CardTitle role="heading" aria-level={2}>Costo por departamento (MXN)</CardTitle></CardHeader>
      <CardContent>
        {data ? (
          <div data-guide="cost-chart" className="space-y-2" aria-label="Costos por departamento">
            {departments.map((department) => (
              <Popover.Root key={department.departmentId} open={openId === department.departmentId}
                onOpenChange={(open) => { cancelClose(); setOpenId(open ? department.departmentId : null); }}>
                <Popover.Trigger asChild>
                  <button type="button" className="group w-full rounded-xl px-2 py-2 text-left hover:bg-accent/60 focus-visible:outline-2 focus-visible:outline-ring"
                    aria-label={`${department.department}: ${formatMXN(department.actualCost)}. Ver desglose`}
                    onPointerEnter={(event) => { if (event.pointerType === "mouse") { cancelClose(); setOpenId(department.departmentId); } }}
                    onPointerLeave={(event) => { if (event.pointerType === "mouse") scheduleClose(); }}>
                    <span className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 text-sm">
                      <span className="font-medium">{department.department}</span>
                      <span className="font-semibold tabular-nums">{formatMXN(department.actualCost)}</span>
                    </span>
                    <span className="mt-2 block h-3 overflow-hidden rounded-full bg-muted" aria-hidden>
                      <span className="block h-full rounded-full bg-primary" style={{ width: `${maxCost ? department.actualCost / maxCost * 100 : 0}%` }} />
                    </span>
                  </button>
                </Popover.Trigger>
                <Popover.Portal>
                  <Popover.Content side="top" sideOffset={8} collisionPadding={12} aria-label={`Desglose de ${department.department}`}
                    onOpenAutoFocus={(event) => event.preventDefault()} onCloseAutoFocus={(event) => event.preventDefault()}
                    onPointerEnter={(event) => { if (event.pointerType === "mouse") cancelClose(); }}
                    onPointerLeave={(event) => { if (event.pointerType === "mouse") scheduleClose(); }}
                    className="z-50 w-80 max-w-[calc(100vw-1.5rem)] rounded-xl border bg-popover p-4 text-popover-foreground shadow-xl outline-none">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <Popover.Title className="font-semibold">{department.department}</Popover.Title>
                        <p className="mt-1 text-sm font-medium">Total: {formatMXN(department.actualCost)}</p>
                      </div>
                      <Popover.Close aria-label="Cerrar desglose" className="grid size-11 shrink-0 place-items-center rounded-lg hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring"><X className="size-4" aria-hidden /></Popover.Close>
                    </div>
                    <div className="mt-3 max-h-[min(45dvh,20rem)] overflow-y-auto overscroll-contain">
                      {department.details.length ? <ul className="divide-y text-sm">
                        {department.details.map((order) => <li key={order.id} className="flex items-start justify-between gap-3 py-2.5">
                          <span className="min-w-0"><span className="font-medium">{order.folio}</span><span className="block break-words text-muted-foreground">{order.title}</span></span>
                          <span className="shrink-0 font-medium tabular-nums">{formatMXN(order.actualCost)}</span>
                        </li>)}
                      </ul> : <p className="text-sm text-muted-foreground">Sin órdenes.</p>}
                    </div>
                  </Popover.Content>
                </Popover.Portal>
              </Popover.Root>
            ))}
          </div>
        ) : <Skeleton className="h-72 w-full" aria-busy="true" aria-label="Cargando gráfica" />}
      </CardContent>
    </Card>
  );
}
