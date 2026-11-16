"use client";

import { useState, type FormEvent } from "react";
import { Building2, Tags, CircleDot, Flag, CalendarDays, Check } from "lucide-react";
import styles from "./catalog-settings.module.css";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ColorBadge } from "@/components/shared/color-badge";
import { COLOR_STYLES } from "@/lib/demo/colors";
import { editCatalogItem, renameNamedCatalog, type CatalogKey } from "@/lib/demo/catalog";
import { updateDemoData } from "@/lib/demo/store";
import { useDemoData } from "@/lib/demo/use-demo-data";
import type { ColorKey, Priority, Department } from "@/lib/demo/types";
import { notifyGuideAction } from "@/lib/guide/steps";

function CatalogRow({ item, catalog, index, affected }: { item: Priority; catalog: CatalogKey; index: number; affected: number }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(item.name);
  const [color, setColor] = useState(item.color);
  const [scope, setScope] = useState<"all" | "future">("all");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const prefix = `${catalog === "statuses" ? "Estado" : "Prioridad"} ${index + 1}`;
  const dirty = name.trim() !== item.name || color !== item.color;
  function save(event: FormEvent) {
    event.preventDefault();
    setMessage(""); setError("");
    if (!dirty) return;
    try {
      updateDemoData((current) => editCatalogItem(current, catalog, item.id, name, color, scope));
      setName(name.trim());
      setMessage("Guardado");
      setEditing(false);
      notifyGuideAction("catalog-saved");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Revisa los datos."); }
  }
  return <form onSubmit={save} onChange={() => { setMessage(""); setError(""); }} className="space-y-2 border-b pb-4 last:border-0 last:pb-0">
    <div className="flex min-h-11 items-center justify-between gap-3">
      <ColorBadge color={editing ? color : item.color}>{editing ? name.trim() || item.name : item.name}</ColorBadge>
      {!editing && <Button type="button" variant="outline" aria-label={`Editar ${prefix.toLocaleLowerCase("es-MX")}`} onClick={() => { setName(item.name); setColor(item.color); setScope("all"); setError(""); setMessage(""); setEditing(true); }}>Editar</Button>}
    </div>
    {editing && <>
    <div className="flex flex-wrap gap-2">
      <label className="min-w-0 flex-1 basis-32"><span className="sr-only">{prefix} nombre</span>
        <input aria-label={`${prefix} nombre`} value={name} onChange={(event) => setName(event.target.value)} required maxLength={120} className="min-h-11 w-full rounded-lg border bg-background px-3 py-2 text-base" />
      </label>
      <Button type="submit" variant="outline" disabled={!dirty || !name.trim()} aria-label={`Guardar ${prefix.toLocaleLowerCase("es-MX")}`}>Guardar</Button>
      <Button type="button" variant="ghost" onClick={() => { setName(item.name); setColor(item.color); setScope("all"); setError(""); setEditing(false); }}>Cancelar</Button>
    </div>
    <fieldset className={styles.palette} aria-label={`${prefix} color`}>
      <legend className="sr-only">Color de {prefix.toLocaleLowerCase("es-MX")}</legend>
      {Object.entries(COLOR_STYLES).map(([value, style]) => <label key={value} className={styles.colorOption} title={style.label}>
        <input type="radio" name={`color-${catalog}-${item.id}`} value={value} checked={color === value} onChange={() => setColor(value as ColorKey)} aria-label={style.label} />
        <span className={`${styles.swatch} ${value === "darkRed" ? "bg-red-900" : style.dot}`}>{color === value && <Check aria-hidden size={15} />}</span>
      </label>)}
      <span className="text-sm text-muted-foreground">{COLOR_STYLES[color].label}</span>
    </fieldset>
    {name.trim() && name.trim() !== item.name && <fieldset className="space-y-1 rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm">
      <legend className="px-1 font-medium">{affected} órdenes usan «{item.name}»</legend>
      <label className="flex min-h-11 items-center gap-2"><input type="radio" name={`scope-${item.id}`} checked={scope === "all"} onChange={() => setScope("all")} />Actualizar también las órdenes existentes</label>
      <label className="flex min-h-11 items-center gap-2"><input type="radio" name={`scope-${item.id}`} checked={scope === "future"} onChange={() => setScope("future")} />Conservar sus nombres anteriores</label>
      {scope === "future" && <p className="text-xs text-muted-foreground">Las nuevas asignaciones usarán «{name.trim()}». El historial anterior se conserva.</p>}
    </fieldset>}
    </>}
    {message && <p role="status" className="text-sm text-green-700">{message}</p>}
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
  </form>;
}

function NamedRow({ item, catalog, index, affected }: { item: Department; catalog: "departments" | "categories"; index: number; affected: number }) {
  const [name, setName] = useState(item.name);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const prefix = `${catalog === "departments" ? "Departamento" : "Tipo"} ${index + 1}`;
  function save(event: FormEvent) {
    event.preventDefault(); setError(""); setMessage("");
    try { updateDemoData(current => renameNamedCatalog(current, catalog, item.id, name)); setName(name.trim()); setMessage("Guardado"); notifyGuideAction("catalog-saved"); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Revisa el nombre."); }
  }
  return <form onSubmit={save} className="space-y-2 border-b pb-3 last:border-0">
    <div className="flex flex-wrap items-end gap-2">
      <label className="min-w-0 flex-1 basis-40 text-sm font-medium">{prefix}<input aria-label={`${prefix} nombre`} value={name} onChange={event => { setName(event.target.value); setMessage(""); setError(""); }} maxLength={120} required className="mt-1 min-h-11 w-full rounded-lg border bg-background px-3 text-base" /></label>
      <Button type="submit" variant="outline" disabled={!name.trim() || name.trim() === item.name}>Guardar</Button>
    </div>
    {name.trim() !== item.name && <p className="text-sm text-muted-foreground">Se actualizará el nombre en {affected} órdenes. El historial se conserva.</p>}
    {message && <p role="status" className="text-sm text-green-700">{message}</p>}{error && <p role="alert" className="text-sm text-destructive">{error}</p>}
  </form>;
}

export function CatalogSettings() {
  const data = useDemoData();
  return <section data-guide="catalog-settings" className="space-y-4">
    <h2 className="text-xl font-semibold">Configuración</h2>
    {!data ? <Skeleton className="h-48 w-full" aria-label="Cargando configuración" /> : <div className={styles.grid}>
      <Card className={styles.card}><CardHeader><CardTitle role="heading" aria-level={3} className={styles.heading}><span className={styles.icon}><CalendarDays aria-hidden /></span>Fecha compromiso</CardTitle></CardHeader>
        <CardContent className="space-y-2"><label className="block text-sm">Formato<select aria-label="Formato de fecha compromiso" value={data.dateDisplayFormat ?? "short"} onChange={event => updateDemoData(current => ({ ...current, dateDisplayFormat: event.target.value as "short" | "numeric" }))} className="mt-2 block min-h-11 w-full rounded-lg border bg-white px-3 text-base"><option value="short">16 nov 2026</option><option value="numeric">16/11/2026</option></select></label><p className="text-sm text-muted-foreground">Editor, tabla y reporte.</p></CardContent>
      </Card>
      {(["statuses", "priorities"] as const).map(catalog => <Card key={catalog} className={styles.card} data-guide={catalog === "statuses" ? "status-settings" : undefined}>
        <CardHeader><CardTitle role="heading" aria-level={3} className={styles.heading}><span className={styles.icon}>{catalog === "statuses" ? <CircleDot aria-hidden /> : <Flag aria-hidden />}</span>{catalog === "statuses" ? "Estados" : "Prioridades"}</CardTitle></CardHeader>
        <CardContent className="space-y-4">{data[catalog].map((item, index) => <CatalogRow key={`${data.seededAt}:${item.id}`} item={item} catalog={catalog} index={index} affected={data.orders.filter(o => (catalog === "statuses" ? o.statusId : o.priorityId) === item.id).length} />)}</CardContent>
      </Card>)}
      {(["departments", "categories"] as const).map(catalog => <Card key={catalog} className={styles.card}>
        <CardHeader><CardTitle role="heading" aria-level={3} className={styles.heading}><span className={styles.icon}>{catalog === "departments" ? <Building2 aria-hidden /> : <Tags aria-hidden />}</span>{catalog === "departments" ? "Departamentos" : "Tipos de solicitud"}</CardTitle></CardHeader>
        <CardContent className="space-y-3">{data[catalog].map((item, index) => <NamedRow key={`${data.seededAt}:${item.id}`} item={item} catalog={catalog} index={index} affected={data.orders.filter(o => (catalog === "departments" ? o.departmentId : o.categoryId) === item.id).length} />)}</CardContent>
      </Card>)}
    </div>}
  </section>;
}
