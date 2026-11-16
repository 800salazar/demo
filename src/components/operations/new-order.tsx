"use client";
import { useState, type FormEvent } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDemoData } from "@/lib/demo/use-demo-data";
import { updateDemoData } from "@/lib/demo/store";
import { createOrder, localDay, newOrderSchema } from "@/lib/demo/workflow";
import { formatCostInput, formatMexicanDate, formatMXN, parseCostInput } from "@/lib/format";

const field = "min-h-11 w-full rounded-lg border bg-background px-3 py-2 text-base";
export function NewOrderForm({ onCreated }: { onCreated: (id: string) => void }) {
  const data = useDemoData();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [cost, setCost] = useState("0.00");
  const [date, setDate] = useState(() => localDay(new Date()));
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = Object.fromEntries(new FormData(event.currentTarget));
    const parsed = newOrderSchema.safeParse({ ...fields, estimatedCost: parseCostInput(cost) });
    if (!parsed.success) { setError(parsed.error.issues[0].message); return; }
    try {
      let id = "";
      updateDemoData(current => { const next = createOrder(current, parsed.data); id = next.orders.at(-1)!.id; return next; });
      setOpen(false); setCost("0.00"); setError(""); onCreated(id);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudo crear."); }
  }
  if (!data) return null;
  if (!open) return <Button className="!bg-emerald-700 !text-white" onClick={() => setOpen(true)}><Plus aria-hidden />Nueva solicitud</Button>;
  return <Card>
    <CardHeader className="flex flex-row items-center justify-between"><CardTitle role="heading" aria-level={2}>Nueva solicitud</CardTitle><Button variant="ghost" size="icon" aria-label="Cancelar solicitud" onClick={() => { setOpen(false); setError(""); }}><X /></Button></CardHeader>
    <CardContent><form onSubmit={submit} className="space-y-4">
      <label className="block space-y-1 text-sm font-medium">¿Qué necesitas resolver?<input autoFocus name="title" placeholder="Revisar lector de etiquetas de la estación 4" required minLength={3} maxLength={200} className={field} /></label>
      <div className="grid gap-3 sm:grid-cols-2">
        {([['departmentId', 'Departamento', data.departments], ['categoryId', 'Tipo de solicitud', data.categories], ['priorityId', 'Prioridad', data.priorities]] as const).map(([name, label, options]) => <label key={name} className="space-y-1 text-sm font-medium">{label}<select name={name} className={field}>{options.filter(o => o.active).map(o => <option key={o.id} value={o.id}>{o.name}</option>)}</select></label>)}
        <label className="space-y-1 text-sm font-medium">Responsable<input name="assignee" required minLength={2} maxLength={120} className={field} placeholder="Nombre del responsable" /></label>
        <label className="space-y-1 text-sm font-medium">Fecha compromiso<span className="relative block rounded-lg focus-within:ring-2 focus-within:ring-ring"><span aria-hidden className={`${field} block`}>{formatMexicanDate(date, data.dateDisplayFormat)}</span><input name="dueDate" type="date" required value={date} onChange={e => setDate(e.target.value)} onClick={e => { try { e.currentTarget.showPicker?.(); } catch { /* Native picker remains available. */ } }} className="absolute inset-0 h-full w-full cursor-pointer opacity-0" /></span></label>
        <label className="space-y-1 text-sm font-medium">Presupuesto (MXN)<input value={cost} inputMode="decimal" maxLength={20} onChange={e => setCost(formatCostInput(e.target.value))} onBlur={() => { const n = parseCostInput(cost); if (n !== null) setCost(formatMXN(n).replace("$", "")); }} className={field} /></label>
      </div>
      <label className="block space-y-1 text-sm font-medium">Detalle <span className="font-normal text-muted-foreground">· opcional</span><textarea name="description" maxLength={800} rows={2} className={field} /></label>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <Button type="submit" className="!bg-emerald-700 !text-white">Crear solicitud</Button>
    </form></CardContent>
  </Card>;
}
