"use client";

import { useState } from "react";
import { History, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { localDay } from "@/lib/demo/workflow";
import { useDemoData } from "@/lib/demo/use-demo-data";

export function ChangeHistory() {
  const data = useDemoData();
  const [query, setQuery] = useState("");
  if (!data) return null;
  const search = query.trim().toLocaleLowerCase("es-MX");
  const entries = data.history.map(entry => ({ ...entry, order: data.orders.find(order => order.id === entry.orderId) }))
    .filter(entry => !search || `${entry.order?.folio ?? ""} ${entry.order?.title ?? ""} ${entry.detail}`.toLocaleLowerCase("es-MX").includes(search))
    .sort((a, b) => b.at.localeCompare(a.at));
  const groups = entries.reduce<Array<{ day: string; label: string; entries: typeof entries }>>((result, entry) => {
    const day = localDay(entry.at);
    let group = result.find(item => item.day === day);
    if (!group) { group = { day, label: new Intl.DateTimeFormat("es-MX", { timeZone: "America/Chihuahua", day: "numeric", month: "long", year: "numeric" }).format(new Date(entry.at)), entries: [] }; result.push(group); }
    group.entries.push(entry);
    return result;
  }, []);
  return <Card>
    <CardHeader><CardTitle role="heading" aria-level={2} className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-xl bg-blue-50 text-blue-700"><History aria-hidden /></span>Historial de cambios</CardTitle>
      <p className="text-sm text-muted-foreground">Actividad de este navegador · Sin identificación de usuario</p></CardHeader>
    <CardContent className="space-y-3">
      <label className="flex min-h-11 items-center gap-2 rounded-lg border px-3"><Search size={18} aria-hidden /><input className="min-w-0 flex-1 bg-transparent text-base outline-none" aria-label="Buscar en historial" placeholder="Buscar folio o cambio" value={query} onChange={event => setQuery(event.target.value)} /></label>
      <p className="text-sm text-muted-foreground">{entries.length} movimientos</p>
      <div className="max-h-96 space-y-4 overflow-y-auto overscroll-contain" aria-label="Movimientos registrados">
        {groups.map(group => <section key={group.day} aria-label={group.label}>
          <h3 className="sticky top-0 z-10 bg-white py-2 text-sm font-semibold text-slate-700">{group.label}</h3>
          <ol className="space-y-2">{group.entries.map(entry => <li key={entry.id} className="rounded-xl border bg-slate-50 p-3 text-sm"><div className="flex flex-wrap items-center justify-between gap-2"><strong>{entry.order?.folio ?? "Orden no disponible"}</strong><time dateTime={entry.at} className="text-xs text-muted-foreground">{new Date(entry.at).toLocaleTimeString("es-MX", { timeZone: "America/Chihuahua", hour: "numeric", minute: "2-digit" })}</time></div><p className="mt-1 break-words">{entry.detail}</p></li>)}</ol>
        </section>)}
      </div>
      {!entries.length && <p className="py-4 text-center text-sm text-muted-foreground">No se encontraron movimientos.</p>}
    </CardContent>
  </Card>;
}
