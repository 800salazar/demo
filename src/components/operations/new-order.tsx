"use client";
import { useState, useRef, useImperativeHandle, type Ref, type FormEvent } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDemoData } from "@/lib/demo/use-demo-data";
import { updateDemoData } from "@/lib/demo/store";
import { createOrder, localDay, newOrderSchema } from "@/lib/demo/workflow";
import { formatCostInput, formatMexicanDate, formatMXN, parseCostInput } from "@/lib/format";

import { draftCatalogs, emptyOrderDraft, orderDraftSchema, validateDraft, type OrderDraft } from "@/lib/ai/order-draft";

export type NewOrderControl = { getDraft: () => OrderDraft | null; prepare: (draft: OrderDraft) => boolean };
const field = "min-h-11 w-full rounded-lg border bg-background px-3 py-2 text-base";
export function NewOrderForm({ onCreated, controlRef }: { onCreated: (id: string) => void; controlRef?: Ref<NewOrderControl> }) {
  const data = useDemoData();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [cost, setCost] = useState("0.00");
  const [date, setDate] = useState(() => localDay(new Date()));
  const form = useRef<HTMLFormElement>(null);
  const [prepared, setPrepared] = useState<OrderDraft | null>(null);
  const [revision, setRevision] = useState(0);
  useImperativeHandle(controlRef, () => ({
    getDraft() {
      if (!open || !form.current) return null;
      const values = Object.fromEntries(new FormData(form.current));
      const draft = emptyOrderDraft();
      for (const key of Object.keys(draft) as (keyof OrderDraft)[]) {
        const value = key === "estimatedCost" ? parseCostInput(cost) : key === "dueDate" ? date || null : values[key] || null;
        const parsed = orderDraftSchema.shape[key].safeParse(value);
        Object.assign(draft, { [key]: parsed.success ? parsed.data : null });
      }
      return draft;
    },
    prepare(value) {
      if (!data) return false;
      const next = validateDraft(value, { ...draftCatalogs(data), draft: null });
      if (open && !window.confirm("Hay una solicitud sin guardar. ¿Reemplazar su borrador con la propuesta de IA?")) return false;
      setPrepared(next); setCost(next.estimatedCost === null ? "" : formatMXN(next.estimatedCost).replace("$", ""));
      setDate(next.dueDate ?? ""); setRevision(r => r + 1); setOpen(true); setError("");
      return true;
    },
  }));
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = Object.fromEntries(new FormData(event.currentTarget));
    const parsed = newOrderSchema.safeParse({ ...fields, estimatedCost: parseCostInput(cost) });
    if (!parsed.success) { setError(parsed.error.issues[0].message); return; }
    try {
      let id = "";
      updateDemoData(current => { const next = createOrder(current, parsed.data); id = next.orders.at(-1)!.id; return next; });
      setOpen(false); setPrepared(null); setCost("0.00"); setDate(localDay(new Date())); setError(""); onCreated(id);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudo crear."); }
  }
  if (!data) return null;
  if (!open) return <Button className="!bg-emerald-700 !text-white" onClick={() => setOpen(true)}><Plus aria-hidden />Nueva solicitud</Button>;
  return <Card data-guide="new-order">
    <CardHeader className="flex flex-row items-center justify-between"><CardTitle role="heading" aria-level={2}>Nueva solicitud</CardTitle><Button variant="ghost" size="icon" aria-label="Cancelar solicitud" onClick={() => { if (!window.confirm("¿Descartar esta solicitud sin guardar?")) return; setOpen(false); setPrepared(null); setCost("0.00"); setDate(localDay(new Date())); setError(""); }}><X /></Button></CardHeader>
    <CardContent><form key={revision} ref={form} onSubmit={submit} className="space-y-4">
      <label className="block space-y-1 text-sm font-medium">¿Qué necesitas resolver?<input autoFocus name="title" defaultValue={prepared?.title ?? ""} placeholder="Revisar lector de etiquetas de la estación 4" required minLength={3} maxLength={200} className={field} /></label>
      <div className="grid gap-3 sm:grid-cols-2">
        {([['departmentId', 'Departamento', data.departments], ['categoryId', 'Tipo de solicitud', data.categories], ['priorityId', 'Prioridad', data.priorities]] as const).map(([name, label, options]) => <label key={name} className="space-y-1 text-sm font-medium">{label}<select name={name} required defaultValue={prepared ? prepared[name] ?? "" : options.find(o => o.active)?.id ?? ""} className={field}><option value="" disabled>Selecciona…</option>{options.filter(o => o.active).map(o => <option key={o.id} value={o.id}>{o.name}</option>)}</select></label>)}
        <label className="space-y-1 text-sm font-medium">Responsable<input name="assignee" defaultValue={prepared?.assignee ?? ""} required minLength={2} maxLength={120} className={field} placeholder="Nombre del responsable" /></label>
        <label className="space-y-1 text-sm font-medium">Fecha compromiso<span className="relative block rounded-lg focus-within:ring-2 focus-within:ring-ring"><span aria-hidden className={`${field} block`}>{formatMexicanDate(date, data.dateDisplayFormat)}</span><input name="dueDate" type="date" required value={date} onChange={e => setDate(e.target.value)} onClick={e => { try { e.currentTarget.showPicker?.(); } catch { /* Native picker remains available. */ } }} className="absolute inset-0 h-full w-full cursor-pointer opacity-0" /></span></label>
        <label className="space-y-1 text-sm font-medium">Presupuesto (MXN)<input required value={cost} inputMode="decimal" maxLength={20} onChange={e => setCost(formatCostInput(e.target.value))} onBlur={() => { const n = parseCostInput(cost); if (n !== null) setCost(formatMXN(n).replace("$", "")); }} className={field} /></label>
      </div>
      <label className="block space-y-1 text-sm font-medium">Detalle <span className="font-normal text-muted-foreground">· opcional</span><textarea name="description" defaultValue={prepared?.description ?? ""} maxLength={800} rows={2} className={field} /></label>
      {prepared && <><p role="status" className="text-sm">Propuesta de IA. Completa los campos vacíos y revisa los datos antes de crear la solicitud.</p><label className="flex min-h-11 items-center gap-3 text-sm"><input type="checkbox" name="reviewed" required className="size-5" />Revisé los datos de la solicitud</label></>}
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <Button type="submit" className="!bg-emerald-700 !text-white">Crear solicitud</Button>
    </form></CardContent>
  </Card>;
}
