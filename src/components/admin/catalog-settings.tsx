"use client";

import { useState, type FormEvent } from "react";
import { Building2, Tags, CircleDot, Flag, CalendarDays, Check, Pencil, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel } from "@/components/ui/alert-dialog";
import styles from "./catalog-settings.module.css";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ColorBadge } from "@/components/shared/color-badge";
import { COLOR_STYLES } from "@/lib/demo/colors";
import { editCatalogItem, renameNamedCatalog, addCatalogItem, removeCatalogItem, type ManagedCatalogKey, type CatalogKey } from "@/lib/demo/catalog";
import { updateDemoData } from "@/lib/demo/store";
import { useDemoData } from "@/lib/demo/use-demo-data";
import type { ColorKey, Priority, Department, StatusKind } from "@/lib/demo/types";
import { notifyGuideAction } from "@/lib/guide/steps";

const catalogIconButton = "!size-11 !min-h-11 !min-w-11 !rounded-lg";

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
      {!editing && <div className="flex gap-1"><Button type="button" variant="outline" size="icon" className={catalogIconButton} disabled={!item.active} title={`Editar ${item.name}`} aria-label={`Editar ${prefix.toLocaleLowerCase("es-MX")}`} onClick={() => { setName(item.name); setColor(item.color); setScope("all"); setError(""); setMessage(""); setEditing(true); }}><Pencil aria-hidden /></Button><RemoveCatalogOption item={item} catalog={catalog} affected={affected} /></div>}
    </div>
    {!item.active && <p className="text-xs text-muted-foreground">Solo en registros anteriores</p>}
    {editing && <>
    <div className="flex flex-wrap gap-2">
      <label className="min-w-0 flex-1 basis-32"><span className="sr-only">{prefix} nombre</span>
        <input aria-label={`${prefix} nombre`} value={name} onChange={(event) => setName(event.target.value)} required maxLength={120} className="min-h-11 w-full rounded-lg border bg-background px-3 py-2 text-base" />
      </label>
      <Button type="submit" variant="outline" className="min-h-11" disabled={!dirty || !name.trim()} aria-label={`Guardar ${prefix.toLocaleLowerCase("es-MX")}`}>Guardar</Button>
      <Button type="button" variant="ghost" className="min-h-11" onClick={() => { setName(item.name); setColor(item.color); setScope("all"); setError(""); setEditing(false); }}>Cancelar</Button>
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

const singular: Record<ManagedCatalogKey, string> = { departments: "departamento", categories: "tipo de solicitud", statuses: "estado", priorities: "prioridad" };
const inputClass = "min-h-11 w-full rounded-lg border bg-background px-3 py-2 text-base";

function RemoveCatalogOption({ item, catalog, affected }: { item: Department; catalog: ManagedCatalogKey; affected: number }) {
  const data = useDemoData();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"future" | "replace" | "">("");
  const [replacement, setReplacement] = useState("");
  const [error, setError] = useState("");
  function remove() {
    try {
      updateDemoData(current => removeCatalogItem(current, catalog, item.id, affected ? mode as "future" | "replace" : "future", replacement));
      setOpen(false); toast.success("Opción retirada"); notifyGuideAction("catalog-saved");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudo retirar la opción."); }
  }
  return <AlertDialog open={open} onOpenChange={value => { setOpen(value); if (value) { setMode(""); setReplacement(""); setError(""); } }}>
    <AlertDialogTrigger asChild><Button type="button" size="icon" variant="outline" className={`${catalogIconButton} !border-red-300 !bg-red-50 !text-red-700 hover:!bg-red-100`} aria-label={`Eliminar ${singular[catalog]} ${item.name}`} title={`Eliminar ${item.name}`}><Trash2 aria-hidden /></Button></AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogHeader><AlertDialogTitle>Eliminar «{item.name}»</AlertDialogTitle><AlertDialogDescription>{affected} órdenes usan esta opción. El historial anterior se conserva.</AlertDialogDescription></AlertDialogHeader>
      {affected > 0 && <fieldset className="space-y-2 text-sm"><legend className="mb-2 font-medium">¿Qué hacer con las órdenes existentes?</legend>
        <label className="flex min-h-11 items-center gap-3"><input type="radio" name={`remove-${catalog}-${item.id}`} checked={mode === "future"} onChange={() => { setMode("future"); setError(""); }} />Conservar en las anteriores; retirar de nuevas asignaciones</label>
        <label className="flex min-h-11 items-center gap-3"><input type="radio" name={`remove-${catalog}-${item.id}`} checked={mode === "replace"} onChange={() => { setMode("replace"); setError(""); }} />Sustituir también en las órdenes existentes</label>
        {mode === "replace" && <label className="block space-y-1">Sustituir por<select value={replacement} onChange={e => { setReplacement(e.target.value); setError(""); }} className={inputClass}><option value="">Selecciona una opción</option>{data?.[catalog].filter(i => i.active && i.id !== item.id).map(i => <option key={i.id} value={i.id}>{i.name}{"kind" in i ? ` · ${i.kind === "completed" ? "Completada" : i.kind === "pending" ? "Pendiente" : "En proceso"}` : ""}</option>)}</select></label>}
      </fieldset>}
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <AlertDialogFooter><AlertDialogCancel className="min-h-11">Cancelar</AlertDialogCancel><Button type="button" variant="destructive" className="min-h-11" disabled={affected > 0 && (!mode || (mode === "replace" && !replacement))} onClick={remove}>Confirmar eliminación</Button></AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>;
}

function AddCatalogOption({ catalog }: { catalog: ManagedCatalogKey }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState<ColorKey>("blue");
  const [kind, setKind] = useState<StatusKind | "">("");
  const [error, setError] = useState("");
  function save(event: FormEvent) {
    event.preventDefault(); setError("");
    try {
      updateDemoData(current => addCatalogItem(current, catalog, name, { color, kind: kind || undefined }));
      setOpen(false); setName(""); setKind(""); setColor("blue"); toast.success("Opción agregada"); notifyGuideAction("catalog-saved");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Revisa los datos."); }
  }
  if (!open) return <Button type="button" className="min-h-11" onClick={() => { setError(""); setOpen(true); }} aria-label={`Agregar ${singular[catalog]}`}><Plus aria-hidden />Agregar</Button>;
  return <form onSubmit={save} className="space-y-3 rounded-xl border bg-blue-50 p-3">
    <label className="block text-sm">Nombre de {singular[catalog]}<input autoFocus value={name} onChange={e => setName(e.target.value)} required maxLength={120} className={inputClass} /></label>
    {(catalog === "statuses" || catalog === "priorities") && <label className="block text-sm">Color<select value={color} onChange={e => setColor(e.target.value as ColorKey)} className={inputClass}>{Object.entries(COLOR_STYLES).map(([key, value]) => <option key={key} value={key}>{value.label}</option>)}</select></label>}
    {catalog === "statuses" && <label className="block text-sm">Comportamiento del estado<select value={kind} onChange={e => setKind(e.target.value as StatusKind)} required className={inputClass}><option value="" disabled>Selecciona…</option><option value="pending">Pendiente</option><option value="in_progress">En proceso</option><option value="completed">Completada</option></select></label>}
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    <div className="flex gap-2"><Button type="submit" className="min-h-11" disabled={!name.trim() || (catalog === "statuses" && !kind)}>Agregar opción</Button><Button type="button" variant="ghost" className="min-h-11" onClick={() => setOpen(false)}>Cancelar</Button></div>
  </form>;
}

function NamedRow({ item, catalog, index, affected }: { item: Department; catalog: "departments" | "categories"; index: number; affected: number }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(item.name);
  const [error, setError] = useState("");
  const prefix = `${catalog === "departments" ? "Departamento" : "Tipo"} ${index + 1}`;
  function save(event: FormEvent) {
    event.preventDefault(); setError("");
    try { updateDemoData(current => renameNamedCatalog(current, catalog, item.id, name)); setEditing(false); toast.success("Guardado"); notifyGuideAction("catalog-saved"); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Revisa el nombre."); }
  }
  return <form onSubmit={save} className="space-y-2 border-b pb-3 last:border-0">
    <div className="flex min-h-11 items-center justify-between gap-2"><span className="min-w-0 break-words text-sm font-medium">{item.name}</span>
      {!editing && <div className="flex shrink-0 gap-1"><Button type="button" size="icon" variant="outline" className={catalogIconButton} disabled={!item.active} aria-label={`Editar ${prefix.toLocaleLowerCase("es-MX")}`} title={`Editar ${item.name}`} onClick={() => { setName(item.name); setError(""); setEditing(true); }}><Pencil aria-hidden /></Button><RemoveCatalogOption item={item} catalog={catalog} affected={affected} /></div>}
    </div>
    {!item.active && <p className="text-xs text-muted-foreground">Solo en registros anteriores</p>}
    {editing && <><label className="block text-sm">{prefix}<input aria-label={`${prefix} nombre`} value={name} onChange={e => setName(e.target.value)} required maxLength={120} className={inputClass} /></label>
      <p className="text-sm text-muted-foreground">Se actualizará el nombre en {affected} órdenes. El historial se conserva.</p>
      <div className="flex gap-2"><Button type="submit" variant="outline" className="min-h-11" disabled={!name.trim() || name.trim() === item.name}>Guardar</Button><Button type="button" variant="ghost" className="min-h-11" onClick={() => setEditing(false)}>Cancelar</Button></div></>}
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
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
        <CardContent className="space-y-4"><AddCatalogOption catalog={catalog} />{data[catalog].map((item, index) => <CatalogRow key={`${data.seededAt}:${item.id}`} item={item} catalog={catalog} index={index} affected={data.orders.filter(o => (catalog === "statuses" ? o.statusId : o.priorityId) === item.id).length} />)}</CardContent>
      </Card>)}
      {(["departments", "categories"] as const).map(catalog => <Card key={catalog} className={styles.card}>
        <CardHeader><CardTitle role="heading" aria-level={3} className={styles.heading}><span className={styles.icon}>{catalog === "departments" ? <Building2 aria-hidden /> : <Tags aria-hidden />}</span>{catalog === "departments" ? "Departamentos" : "Tipos de solicitud"}</CardTitle></CardHeader>
        <CardContent className="space-y-3"><AddCatalogOption catalog={catalog} />{data[catalog].map((item, index) => <NamedRow key={`${data.seededAt}:${item.id}`} item={item} catalog={catalog} index={index} affected={data.orders.filter(o => (catalog === "departments" ? o.departmentId : o.categoryId) === item.id).length} />)}</CardContent>
      </Card>)}
    </div>}
  </section>;
}
