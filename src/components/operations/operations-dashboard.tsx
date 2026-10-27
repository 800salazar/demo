"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { updateDemoData } from "@/lib/demo/store";
import type { DemoData, WorkOrder } from "@/lib/demo/types";
import { useDemoData } from "@/lib/demo/use-demo-data";
import { formatMXN } from "@/lib/format";

const fieldClass = "w-full rounded-lg border bg-background px-3 py-2 text-sm";

function OrderEditor({ order, data }: { order: WorkOrder; data: DemoData }) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");
    const fields = new FormData(event.currentTarget);
    const actualCost = Number(fields.get("actualCost"));
    const dueDate = String(fields.get("dueDate"));
    const statusId = String(fields.get("statusId"));
    const status = data.statuses.find((s) => s.id === statusId);
    if (!Number.isFinite(actualCost) || actualCost < 0 || actualCost > 1_000_000_000 || !/^\d{4}-\d{2}-\d{2}$/.test(dueDate) || !status) {
      setError("Revisa el costo, la fecha y el estado.");
      return;
    }
    if (status.kind === "completed" && data.checklist.some((item) => item.orderId === order.id && item.required && !item.done)) {
      setError("Esta orden tiene actividades obligatorias pendientes; elige otro estado.");
      return;
    }
    const now = new Date().toISOString();
    updateDemoData((current) => ({
      ...current,
      orders: current.orders.map((o) => o.id === order.id ? {
        ...o, actualCost, dueDate, statusId,
        completedAt: status.kind === "completed" ? o.completedAt ?? now : null,
      } : o),
      history: [...current.history, {
        id: crypto.randomUUID(), orderId: order.id, at: now, action: "updated",
        detail: `Actualización manual: costo ${formatMXN(actualCost)}, compromiso ${dueDate}, estado ${status.name}.`,
      }],
    }));
    setMessage(`${order.folio} actualizada. La siguiente consulta usará estos cambios.`);
  }

  return (
    <form onSubmit={save} className="space-y-4">
      <p className="text-sm text-muted-foreground">{order.title} · {order.assignee}</p>
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="space-y-2 text-sm font-medium">Costo real (MXN)
          <input name="actualCost" type="number" min="0" max="1000000000" step="0.01" defaultValue={order.actualCost} required className={fieldClass} />
        </label>
        <label className="space-y-2 text-sm font-medium">Fecha compromiso
          <input name="dueDate" type="date" defaultValue={order.dueDate} required className={fieldClass} />
        </label>
        <label className="space-y-2 text-sm font-medium">Estado
          <select name="statusId" defaultValue={order.statusId} className={fieldClass}>
            {data.statuses.filter((s) => s.active || s.id === order.statusId).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </label>
      </div>
      <Button type="submit">Guardar cambios</Button>
      {message && <p role="status" className="text-sm text-green-700">{message}</p>}
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    </form>
  );
}

export function OperationsDashboard() {
  const data = useDemoData();
  const [selectedId, setSelectedId] = useState("");
  if (!data) return <Skeleton className="h-72 w-full" aria-label="Cargando órdenes" />;
  const order = data.orders.find((o) => o.id === selectedId) ?? data.orders[0];
  const completed = data.orders.filter((o) => data.statuses.find((s) => s.id === o.statusId)?.kind === "completed").length;
  const cost = data.orders.reduce((sum, o) => sum + o.actualCost, 0);
  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        {[ ["Órdenes", data.orders.length], ["Completadas", completed], ["Costo real", formatMXN(cost)] ].map(([label, value]) => (
          <Card key={label}><CardHeader><CardDescription>{label}</CardDescription><CardTitle className="text-2xl">{value}</CardTitle></CardHeader></Card>
        ))}
      </div>
      <Card>
        <CardHeader><CardTitle>Prueba un cambio en producción</CardTitle><CardDescription>Actualiza una orden ficticia y consulta al asistente. Los cambios se guardan solo en tu navegador.</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          <label className="block space-y-2 text-sm font-medium">Orden de trabajo
            <select value={order?.id ?? ""} onChange={(e) => setSelectedId(e.target.value)} className={fieldClass}>
              {data.orders.map((o) => <option key={o.id} value={o.id}>{o.folio} · {o.title}</option>)}
            </select>
          </label>
          {order && <OrderEditor key={`${order.id}:${data.seededAt}`} order={order} data={data} />}
        </CardContent>
      </Card>
    </div>
  );
}
