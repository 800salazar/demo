"use client";

import { AiAction } from "@/components/ai/ai-action";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDemoData } from "@/lib/demo/use-demo-data";
import { activitySeries, localDay } from "@/lib/demo/workflow";
import { formatMexicanDate, formatMXN } from "@/lib/format";
import styles from "./demo-workspace.module.css";

export function DirectorDashboard({ onAsk }: { onAsk: (question: string) => void }) {
  const data = useDemoData();
  const [selected, setSelected] = useState("");
  const [days, setDays] = useState<3 | 7 | 14>(14);
  if (!data) return null;
  const series = activitySeries(data.orders, new Date(), days);
  const point = series.find(p => p.day === selected);
  const max = Math.max(1, ...series.flatMap(p => [p.created, p.completed]));
  const completed = data.orders.filter(o => data.statuses.find(s => s.id === o.statusId)?.kind === "completed");
  const overrun = data.orders.reduce((sum, o) => sum + Math.max(0, o.actualCost - o.estimatedCost), 0);
  const today = localDay(new Date());
  const late = data.orders.filter(o => o.dueDate < today && data.statuses.find(s => s.id === o.statusId)?.kind !== "completed").length;
  const cost = data.orders.reduce((sum, o) => sum + o.actualCost, 0);
  const total = data.orders.length;
  const completion = total ? Math.round(completed.length / total * 100) : 0;
  const metrics = [
    { label: "Órdenes", value: String(total), detail: "Referencia: 29 o más", tone: total >= 29 ? "good" : "warning" },
    { label: "Retrasadas", value: String(late), detail: late > 6 ? "Más de 6 retrasadas" : late > 3 ? "Supera el límite de 3" : "Dentro del límite de 3", tone: late > 6 ? "critical" : late > 3 ? "warning" : "good" },
    { label: "Costo real", value: formatMXN(cost), detail: cost > 300000 ? "Supera el límite de $300,000" : "Dentro del límite de $300,000", tone: cost > 300000 ? "critical" : "good" },
    { label: "Completadas", value: `${completed.length} / ${total}`, detail: total ? `${completion}% · objetivo 100%` : "Sin órdenes para evaluar", tone: !total ? "neutral" : completed.length === total ? "good" : "warning" },
    { label: "Sobrecostos", value: formatMXN(overrun), detail: overrun > 0 ? "Órdenes sobre presupuesto" : "Sin órdenes sobre presupuesto", tone: overrun > 0 ? "warning" : "good" },
  ];
  return <div className="space-y-4">
    <div className={styles.trafficLegend} aria-label="Semáforo de indicadores"><span><i className={styles.trafficGood} />Bien</span><span><i className={styles.trafficWarning} />Atención</span><span><i className={styles.trafficCritical} />Revisión inmediata</span><span><i className={styles.trafficNeutral} />Sin meta definida</span></div>
    <div className={styles.directorMetrics} aria-label="Indicadores de Dirección">
      {metrics.map(metric => <Card key={metric.label} className={`${styles.metric} ${styles[metric.tone]}`}><CardHeader><p className={styles.metricLabel}><span className={`${styles.statusDot} ${styles[`dot_${metric.tone}`]}`} aria-hidden />{metric.label}</p><CardTitle className={styles.metricValue}>{metric.value}</CardTitle><p className={styles.metricDetail}>{metric.tone === "good" ? "Bien" : metric.tone === "warning" ? "Atención" : metric.tone === "critical" ? "Revisión inmediata" : "Sin meta definida"} · {metric.detail}</p></CardHeader></Card>)}
    </div>
    <Card>
      <CardHeader><CardTitle role="heading" aria-level={2}>Actividad · últimos {days} días</CardTitle><p className="text-sm text-muted-foreground">Altas y cierres registrados. Toca un día para analizarlo.</p>
        <div className={styles.periodSelector} role="group" aria-label="Periodo de actividad">{([3, 7, 14] as const).map(period => <button key={period} type="button" aria-pressed={days === period} onClick={() => { setDays(period); setSelected(""); }}>{period} días</button>)}</div></CardHeader>
      <CardContent data-guide="activity-chart">
        <div className="mb-3 flex gap-4 text-sm"><span className="flex items-center gap-2"><i className="size-3 rounded bg-blue-500" />Creadas</span><span className="flex items-center gap-2"><i className="size-3 rounded bg-emerald-600" />Cerradas</span></div>
        <div className={styles.activityScroll} role="region" aria-label="Actividad diaria" tabIndex={0}>
          <div className={styles.activityChart} data-period={days}>{series.map(p => <button key={p.day} onClick={() => setSelected(p.day)} aria-pressed={selected === p.day} aria-label={`${formatMexicanDate(p.day)}: ${p.created} creadas y ${p.completed} cerradas`} className={styles.dayBar}>
            <span className={styles.barPair}><span style={{ height: `${p.created / max * 100}%` }} className={styles.createdBar}><b>{p.created}</b></span><span style={{ height: `${p.completed / max * 100}%` }} className={styles.closedBar}><b>{p.completed}</b></span></span>
            <span className="mt-2 block text-xs">{formatMexicanDate(p.day).slice(0, 6)}</span>
          </button>)}</div>
        </div>
        {point && <div className="mt-4 space-y-2 rounded-xl border border-blue-200 bg-blue-50 p-4" aria-live="polite">
          <h3 className="font-semibold">{formatMexicanDate(point.day)}</h3>
          <p className="text-sm"><strong>{point.created} creadas:</strong> {point.createdFolios.join(", ") || "ninguna"}</p>
          <p className="text-sm"><strong>{point.completed} cerradas:</strong> {point.completedFolios.join(", ") || "ninguna"}</p>
          <AiAction onClick={() => onAsk(`Analiza la actividad del ${point.day}: ¿qué órdenes forman este punto del gráfico? Explica lo verificable y señala si falta evidencia para conocer la causa.`)}>Analizar este día con IA</AiAction>
        </div>}
      </CardContent>
    </Card>
  </div>;
}
