"use client";

import { AiAction } from "@/components/ai/ai-action";import { useState } from "react";
import { ArrowDownUp, Search } from "lucide-react";
import { ColorBadge } from "@/components/shared/color-badge";
import { useDemoData } from "@/lib/demo/use-demo-data";
import { formatMexicanDate, formatMXN } from "@/lib/format";
import { localDay } from "@/lib/demo/workflow";
import styles from "./demo-workspace.module.css";

export function OrdersTable({ onEdit, onAsk }: { onEdit: (id: string) => void; onAsk: (question: string) => void }) {
  const data = useDemoData();
  const [query, setQuery] = useState("");
  const [department, setDepartment] = useState("");
  const [state, setState] = useState("");
  const [sort, setSort] = useState<"folio" | "dueDate" | "actualCost">("folio");
  const [descending, setDescending] = useState(false);
  if (!data) return null;
  const today = localDay(new Date());
  const rows = data.orders.filter(order => {
    const text = [order.folio, order.title, order.assignee, data.departments.find(d => d.id === order.departmentId)?.name].join(" ").toLocaleLowerCase("es-MX");
    const late = order.dueDate < today && data.statuses.find(s => s.id === order.statusId)?.kind !== "completed";
    return text.includes(query.toLocaleLowerCase("es-MX").trim()) && (!department || department === order.departmentId)
      && (!state || state === order.statusId || (state === "late" && late) || (state === "overrun" && order.actualCost > order.estimatedCost));
  }).sort((a, b) => (sort === "actualCost" ? a.actualCost - b.actualCost : a[sort].localeCompare(b[sort], "es-MX", { numeric: true })) * (descending ? -1 : 1));
  function changeSort(next: typeof sort) { setDescending(next === sort ? !descending : false); setSort(next); }
  return <section className={styles.tableCard} aria-label="Todas las órdenes">
    <div data-guide="orders-table" className={styles.tableHeader}><h2 className="text-lg font-semibold">Órdenes <span className="text-sm font-normal text-muted-foreground">{rows.length}/{data.orders.length}</span></h2>
      <div className={styles.filters}>
        <label className={styles.search}><Search size={18} aria-hidden /><input aria-label="Buscar en órdenes" placeholder="Buscar folio, título o responsable" value={query} onChange={e => setQuery(e.target.value)} /></label>
        <select aria-label="Filtrar departamento" value={department} onChange={e => setDepartment(e.target.value)}><option value="">Todos los departamentos</option>{data.departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select>
        <select aria-label="Filtrar estado o alerta" value={state} onChange={e => setState(e.target.value)}><option value="">Todos los estados</option><option value="late">Retrasadas</option><option value="overrun">Sobre presupuesto</option>{data.statuses.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
      </div>
    </div>
    <div className={styles.tableScroll} role="region" aria-label="Tabla de órdenes, desplázate para ver más columnas" tabIndex={0}>
      <table className={styles.ordersTable}>
        <caption className="sr-only">Órdenes actuales de este navegador. Importes en MXN.</caption>
        <thead><tr>
          <th scope="col" aria-sort={sort === "folio" ? descending ? "descending" : "ascending" : "none"}><button onClick={() => changeSort("folio")}>Orden <ArrowDownUp size={14} /></button></th>
          <th scope="col">Departamento / tipo</th><th scope="col">Responsable</th><th scope="col">Prioridad</th><th scope="col">Estado</th>
          <th scope="col" aria-sort={sort === "dueDate" ? descending ? "descending" : "ascending" : "none"}><button onClick={() => changeSort("dueDate")}>Compromiso <ArrowDownUp size={14} /></button></th>
          <th scope="col">Presupuesto</th><th scope="col" aria-sort={sort === "actualCost" ? descending ? "descending" : "ascending" : "none"}><button onClick={() => changeSort("actualCost")}>Costo real <ArrowDownUp size={14} /></button></th><th scope="col">Consulta</th>
        </tr></thead>
        <tbody>{rows.map(order => {
          const status = data.statuses.find(s => s.id === order.statusId)!;
          const priority = data.priorities.find(p => p.id === order.priorityId)!;
          const late = order.dueDate < today && status.kind !== "completed";
          return <tr key={order.id}>
            <th scope="row"><button className={styles.orderLink} onClick={() => onEdit(order.id)}><strong>{order.folio}</strong><span>{order.title}</span></button></th>
            <td><ColorBadge color="blue">{data.departments.find(d => d.id === order.departmentId)?.name}</ColorBadge><span className="mt-1 block text-xs text-muted-foreground">{data.categories.find(c => c.id === order.categoryId)?.name}</span></td>
            <td>{order.assignee}</td><td><ColorBadge color={priority.color}>{order.priorityLabel ?? priority.name}</ColorBadge></td><td><ColorBadge color={status.color}>{order.statusLabel ?? status.name}</ColorBadge></td>
            <td><span className="whitespace-nowrap">{formatMexicanDate(order.dueDate, data.dateDisplayFormat)}</span>{late && <span className="block text-xs font-medium text-red-700">Retrasada</span>}</td>
            <td className="whitespace-nowrap tabular-nums">{formatMXN(order.estimatedCost)}</td><td className="whitespace-nowrap tabular-nums">{formatMXN(order.actualCost)}{order.actualCost > order.estimatedCost && <span className="block text-xs font-semibold text-red-700">+{formatMXN(order.actualCost - order.estimatedCost)}</span>}</td>
            <td><AiAction onClick={() => onAsk(`Analiza ${order.folio}: riesgos, costos y siguiente paso recomendado.`)} aria-label={`Consultar ${order.folio} con IA`}>IA</AiAction></td>
          </tr>;
        })}</tbody>
      </table>
      {!rows.length && <p className="p-8 text-center text-muted-foreground">No hay órdenes con estos filtros.</p>}
    </div>
  </section>;
}
