"use client";

import { useState, type FormEvent } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ColorBadge } from "@/components/shared/color-badge";
import { COLOR_STYLES } from "@/lib/demo/colors";
import { editCatalogItem, type CatalogKey } from "@/lib/demo/catalog";
import { updateDemoData } from "@/lib/demo/store";
import { useDemoData } from "@/lib/demo/use-demo-data";
import type { ColorKey, Priority } from "@/lib/demo/types";
import { notifyGuideAction } from "@/lib/guide/steps";

function CatalogRow({ item, catalog, index }: { item: Priority; catalog: CatalogKey; index: number }) {
  const [name, setName] = useState(item.name);
  const [color, setColor] = useState(item.color);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const prefix = `${catalog === "statuses" ? "Estado" : "Prioridad"} ${index + 1}`;
  const dirty = name.trim() !== item.name || color !== item.color;
  function save(event: FormEvent) {
    event.preventDefault();
    setMessage(""); setError("");
    if (!dirty) return;
    try {
      updateDemoData((current) => editCatalogItem(current, catalog, item.id, name, color));
      setName(name.trim());
      setMessage("Guardado");
      notifyGuideAction("catalog-saved");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Revisa los datos."); }
  }
  return <form onSubmit={save} onChange={() => { setMessage(""); setError(""); }} className="space-y-2 border-b pb-4 last:border-0 last:pb-0">
    <ColorBadge color={color}>{name.trim() || item.name}</ColorBadge>
    <div className="flex flex-wrap gap-2">
      <label className="min-w-0 flex-1 basis-32"><span className="sr-only">{prefix} nombre</span>
        <input aria-label={`${prefix} nombre`} value={name} onChange={(event) => setName(event.target.value)} required maxLength={120} className="min-h-11 w-full rounded-lg border bg-background px-3 py-2 text-base" />
      </label>
      <label><span className="sr-only">{prefix} color</span>
        <select aria-label={`${prefix} color`} value={color} onChange={(event) => setColor(event.target.value as ColorKey)} className="min-h-11 rounded-lg border bg-background px-2 py-2 text-base">
          {Object.entries(COLOR_STYLES).map(([value, style]) => <option key={value} value={value}>{style.label}</option>)}
        </select>
      </label>
      <Button type="submit" variant="outline" disabled={!dirty || !name.trim()} aria-label={`Guardar ${prefix.toLocaleLowerCase("es-MX")}`}>Guardar</Button>
    </div>
    {message && <p role="status" className="text-sm text-green-700">{message}</p>}
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
  </form>;
}

export function CatalogSettings() {
  const data = useDemoData();
  return <Card data-guide="catalog-settings">
    <CardHeader><CardTitle role="heading" aria-level={2}>Configuración</CardTitle></CardHeader>
    <CardContent className="space-y-6">
      {!data ? <Skeleton className="h-48 w-full" aria-label="Cargando configuración" /> : (["statuses", "priorities"] as const).map((catalog) => (
        <section key={catalog} aria-label={catalog === "statuses" ? "Estados" : "Prioridades"} className="space-y-3">
          <h3 className="text-base font-semibold">{catalog === "statuses" ? "Estados" : "Prioridades"}</h3>
          {data[catalog].map((item, index) => <CatalogRow key={`${data.seededAt}:${item.id}`} item={item} catalog={catalog} index={index} />)}
        </section>
      ))}
    </CardContent>
  </Card>;
}
