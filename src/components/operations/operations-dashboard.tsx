"use client";

import { useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { updateDemoData } from "@/lib/demo/store";
import type { DemoData, WorkOrder } from "@/lib/demo/types";
import { useDemoData } from "@/lib/demo/use-demo-data";
import { formatCostInput, formatMexicanDate, formatMXN, parseCostInput } from "@/lib/format";
import { COLOR_STYLES } from "@/lib/demo/colors";
import { cn } from "@/lib/utils";
import { notifyGuideAction } from "@/lib/guide/steps";

const fieldClass = "w-full rounded-lg border bg-background px-3 py-2 text-sm";

function OrderEditor({ order, data }: { order: WorkOrder; data: DemoData }) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [hasEdits, setHasEdits] = useState(false);
  const [cost, setCost] = useState(() => formatMXN(order.actualCost).replace("$", ""));
  const [dueDate, setDueDate] = useState(order.dueDate);
  const [statusId, setStatusId] = useState(order.statusId);
  const selectedStatus = data.statuses.find((status) => status.id === statusId);
  const requiredRemaining = data.checklist.filter((item) => item.orderId === order.id && item.required && !item.done).length;

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!hasEdits) return;
    setMessage("");
    setError("");
    const fields = new FormData(event.currentTarget);
    const actualCost = parseCostInput(String(fields.get("actualCost") ?? ""));
    const dueDate = String(fields.get("dueDate"));
    const statusId = String(fields.get("statusId"));
    const status = data.statuses.find((s) => s.id === statusId);
    if (actualCost === null || !/^\d{4}-\d{2}-\d{2}$/.test(dueDate) || !status) {
      setError("Revisa el costo (máximo dos decimales), la fecha y el estado.");
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
    setHasEdits(false);
    setMessage(`${order.folio} actualizada.`);
    notifyGuideAction("order-saved");
  }

  return (
    <form onSubmit={save} onChange={() => { setHasEdits(true); setMessage(""); setError(""); }} className="space-y-4">
      <p className="text-sm text-muted-foreground"><strong className="font-semibold text-foreground">Editando {order.folio}</strong> · {order.title} · {order.assignee}</p>
      <div className="grid gap-4 sm:grid-cols-3">
        <label data-guide="order-cost" className="space-y-2 text-sm font-medium">Costo real (MXN)
          <input name="actualCost" type="text" inputMode="decimal" value={cost} maxLength={20} required className={fieldClass}
            onChange={(event) => {
              const input = event.currentTarget;
              const before = input.value.slice(0, input.selectionStart ?? input.value.length);
              const next = formatCostInput(input.value);
              const position = formatCostInput(before).length;
              setCost(next);
              requestAnimationFrame(() => { if (document.activeElement === input) input.setSelectionRange(position, position); });
            }}
            onBlur={() => { const amount = parseCostInput(cost); if (amount !== null) setCost(formatMXN(amount).replace("$", "")); }} />
        </label>
        <label className="space-y-2 text-sm font-medium">Fecha compromiso
          <span className="relative block rounded-lg focus-within:ring-2 focus-within:ring-ring">
            <span aria-hidden className={`${fieldClass} flex items-center`}>{formatMexicanDate(dueDate)}</span>
            <input name="dueDate" type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} required
              onClick={(event) => { try { event.currentTarget.showPicker?.(); } catch { /* El control nativo sigue disponible. */ } }}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0" />
          </span>
        </label>
        <label className="space-y-2 text-sm font-medium">Estado
          <select name="statusId" value={statusId} onChange={(event) => setStatusId(event.target.value)} aria-describedby={requiredRemaining ? "order-status-help" : undefined}
            className={cn(fieldClass, "rounded-full font-medium ring-1 ring-inset", selectedStatus && COLOR_STYLES[selectedStatus.color].badge)}>
            {data.statuses.filter((s) => s.active || s.id === order.statusId).map((s) => (
              <option key={s.id} value={s.id} className={COLOR_STYLES[s.color].badge} disabled={s.kind === "completed" && requiredRemaining > 0}>
                {s.name}{s.kind === "completed" && requiredRemaining > 0 ? " · actividades pendientes" : ""}
              </option>
            ))}
          </select>
        </label>
      </div>
      {requiredRemaining > 0 && <p id="order-status-help" className="text-xs text-muted-foreground">Cierre bloqueado: {requiredRemaining} actividades obligatorias pendientes.</p>}
      <div className="flex flex-wrap items-center gap-3">
        <Button data-guide="order-save" type="submit" disabled={!hasEdits}>Guardar cambios</Button>
        {hasEdits && <p role="status" className="text-xs text-muted-foreground">Cambios sin guardar en {order.folio}.</p>}
      </div>
      {message && <p role="status" className="text-sm text-green-700">{message}</p>}
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    </form>
  );
}

function OrderSearch({ orders, order, onSelect }: { orders: WorkOrder[]; order: WorkOrder; onSelect: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const label = (item: WorkOrder) => `${item.folio} · ${item.title}`;
  const matches = orders.filter((item) => label(item).toLocaleLowerCase("es-MX").includes(query.trim().toLocaleLowerCase("es-MX")));
  function choose(item: WorkOrder) { onSelect(item.id); setOpen(false); setQuery(""); input.current?.blur(); }
  function keyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") { setOpen(false); input.current?.blur(); }
    else if (event.key === "ArrowDown") { event.preventDefault(); setOpen(true); setHighlight((index) => Math.min(index + 1, matches.length - 1)); }
    else if (event.key === "ArrowUp") { event.preventDefault(); setHighlight((index) => Math.max(index - 1, 0)); }
    else if (event.key === "Enter" && open && matches[highlight]) { event.preventDefault(); choose(matches[highlight]); }
  }
  return (
    <div data-guide="order-select" className="relative space-y-2 text-sm font-medium">
      <label htmlFor="order-search">Orden de trabajo</label>
      <div className="relative">
        <input ref={input} id="order-search" role="combobox" aria-expanded={open} aria-controls="order-options"
          aria-autocomplete="list" aria-activedescendant={open && matches[highlight] ? `order-option-${matches[highlight].id}` : undefined}
          value={open ? query : label(order)} placeholder={label(order)} autoComplete="off" className={`${fieldClass} pr-10`}
          onFocus={() => { setQuery(""); setHighlight(0); setOpen(true); }} onClick={() => setOpen(true)}
          onChange={(event) => { setQuery(event.target.value); setHighlight(0); setOpen(true); }} onKeyDown={keyDown}
          onBlur={() => setOpen(false)} />
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
      </div>
      {open && <ul id="order-options" role="listbox" aria-label="Órdenes de trabajo" className="absolute z-30 max-h-60 w-full overflow-y-auto rounded-xl border bg-popover p-1 text-popover-foreground shadow-lg">
        {matches.length ? matches.map((item, index) => <li key={item.id} id={`order-option-${item.id}`} role="option" aria-selected={item.id === order.id}
          className={cn("min-h-11 cursor-pointer rounded-lg px-3 py-3", index === highlight && "bg-accent text-accent-foreground")}
          onMouseDown={(event) => event.preventDefault()} onClick={() => choose(item)} onMouseEnter={() => setHighlight(index)}>{label(item)}</li>)
          : <li className="px-3 py-3 text-muted-foreground">Sin resultados</li>}
      </ul>}
    </div>
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
        <CardHeader><CardTitle>Editar orden</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {order && <OrderSearch orders={data.orders} order={order} onSelect={setSelectedId} />}
          {order && <OrderEditor key={`${order.id}:${data.seededAt}`} order={order} data={data} />}
        </CardContent>
      </Card>
    </div>
  );
}
