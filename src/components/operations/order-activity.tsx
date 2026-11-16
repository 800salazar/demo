"use client";
import { useState } from "react";
import { updateDemoData } from "@/lib/demo/store";
import { toggleChecklist } from "@/lib/demo/workflow";
import type { DemoData, WorkOrder } from "@/lib/demo/types";

export function OrderActivity({ data, order }: { data: DemoData; order: WorkOrder }) {
  const [error, setError] = useState("");
  const items = data.checklist.filter(i => i.orderId === order.id);
  const history = data.history.filter(h => h.orderId === order.id).slice().reverse();
  const closed = data.statuses.find(s => s.id === order.statusId)?.kind === "completed";
  return <div className="space-y-4 border-t pt-4">
    <fieldset data-guide="order-checklist" className="space-y-1">
      <legend className="mb-2 text-base font-semibold">Antes de cerrar <span className="text-sm font-normal text-muted-foreground">{items.filter(i => i.done).length}/{items.length}</span></legend>
      {items.map(item => <label key={item.id} className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-2 py-2 hover:bg-muted">
        <input type="checkbox" checked={item.done} disabled={closed} className="size-5 accent-emerald-600" onChange={() => {
          try { updateDemoData(current => toggleChecklist(current, item.id)); setError(""); }
          catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudo guardar."); }
        }} />
        <span className="text-sm">{item.label}{!item.required && <span className="text-muted-foreground"> · opcional</span>}</span>
      </label>)}
      {closed && <p className="text-sm text-muted-foreground">Orden cerrada. Reábrela para editar actividades.</p>}
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    </fieldset>
    <details className="rounded-xl border px-3">
      <summary className="min-h-11 cursor-pointer py-3 text-sm font-semibold">Historial · {history.length}</summary>
      <ol className="max-h-64 space-y-3 overflow-y-auto pb-4 text-sm">
        {history.map(entry => <li key={entry.id} className="border-l-2 border-blue-200 pl-3"><time className="text-xs text-muted-foreground" dateTime={entry.at}>{new Date(entry.at).toLocaleString("es-MX", { timeZone: "America/Chihuahua", dateStyle: "medium", timeStyle: "short" })}</time><p>{entry.detail}</p></li>)}
      </ol>
    </details>
  </div>;
}
