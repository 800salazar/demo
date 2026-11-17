import { jsPDF } from "jspdf";
import type { DemoData } from "./types";
import { activitySeries, localDay } from "./workflow";
import { buildOperationalAnalysis, getOperationalSnapshot } from "@/lib/ai/analysis";
import { formatMexicanDate, formatMXN } from "@/lib/format";

export type ReportView = "operador" | "administrador" | "direccion";
export type ReportDays = 7 | 14;
export type ReportOptions = { view: ReportView; days: ReportDays };
const profiles = { operador: "Operador", administrador: "Administrador", direccion: "Dirección" };

/** Inclusive Chihuahua calendar days, through the instant of export. Costs remain current. */
export function getReportScope(data: DemoData, now: Date, days: ReportDays) {
  if (days !== 7 && days !== 14) throw new Error("Selecciona 7 o 14 días.");
  const activity = activitySeries(data.orders, now, days);
  const start = activity[0].day, end = localDay(now);
  function inPeriod(at: string | null) {
    if (!at || !Number.isFinite(Date.parse(at)) || Date.parse(at) > now.getTime()) return false;
    const day = localDay(at);
    return day >= start && day <= end;
  }
  const history = data.history.filter(h => inPeriod(h.at));
  const changed = new Set(history.map(h => h.orderId));
  const orders = data.orders.filter(o => inPeriod(o.createdAt) || inPeriod(o.completedAt) || changed.has(o.id));
  const ids = new Set(orders.map(o => o.id));
  const selected = { ...data, orders, checklist: data.checklist.filter(i => ids.has(i.orderId)), history: history.filter(h => ids.has(h.orderId)) };
  return { data: selected, start, end, activity: activitySeries(orders.map(o => ({ ...o, createdAt: inPeriod(o.createdAt) ? o.createdAt : "", completedAt: inPeriod(o.completedAt) ? o.completedAt : null })), now, days) };
}

/** Generated in the browser from saved records, with no uploads or AI calls. */
export function buildOperationalPdf(data: DemoData, now = new Date(), options: ReportOptions = { view: "operador", days: 14 }): jsPDF {
  if (!Object.hasOwn(profiles, options.view)) throw new Error("Selecciona una vista válida.");
  const scope = getReportScope(data, now, options.days);
  const analysis = buildOperationalAnalysis(getOperationalSnapshot(scope.data), now);
  const profile = profiles[options.view];
  const pdf = new jsPDF({ unit: "mm", format: "a4" });
  pdf.setProperties({ title: `Salazar Consultores · Reporte de ${profile} · ${options.days} días`, author: "Salazar Consultores" });
  let y = 0;
  const safe = (text: string) => text.replace(/[^\u0020-\u007e\u00a0-\u00ff]/g, " ");
  function header() {
    pdf.setFillColor(8, 43, 82); pdf.rect(0, 0, 210, 29, "F");
    pdf.setTextColor(255); pdf.setFont("helvetica", "bold"); pdf.setFontSize(17); pdf.text("Salazar Consultores", 16, 14);
    pdf.setFontSize(10); pdf.text(`Reporte de ${profile} · Últimos ${options.days} días`, 16, 23); y = 40;
  }
  function room(height: number) { if (y + height > 275) { pdf.addPage(); header(); } }
  function line(text: string, bold = false, size = 10) {
    pdf.setFont("helvetica", bold ? "bold" : "normal"); pdf.setFontSize(size);
    const lines: string[] = pdf.splitTextToSize(safe(text), 178);
    for (const part of lines) {
      room(6); pdf.setFont("helvetica", bold ? "bold" : "normal"); pdf.setFontSize(size); pdf.setTextColor(28, 44, 62);
      pdf.text(part, 16, y); y += 5.5;
    }
  }
  function section(title: string, reserve = 20) { room(reserve); y += 5; line(title, true, 13); y += 3; }
  function departmentChart() {
    const departments = analysis.departments.filter(d => d.orders > 0);
    room(Math.min(230, 23 + departments.length * 18));
    section("Presupuesto y costo actual por departamento", 40);
    line("Azul: presupuesto · Naranja: costo real actual", false, 9);
    const max = Math.max(1, ...departments.flatMap(d => [d.actualCost, d.estimatedCost]));
    departments.forEach(d => {
      pdf.setFont("helvetica", "normal"); pdf.setFontSize(9);
      const labelLines: string[] = pdf.splitTextToSize(safe(d.department), 60);
      const rowHeight = Math.max(18, labelLines.length * 3.7 + 5);
      if (y + rowHeight > 275) {
        pdf.addPage(); header();
        section("Costos por departamento · continuación", 35);
        line("Azul: presupuesto · Naranja: costo real actual", false, 9);
      }
      pdf.setFont("helvetica", "normal"); pdf.setFontSize(9); pdf.setTextColor(28, 44, 62);
      pdf.text(labelLines, 16, y + 3);
      pdf.setFillColor(0, 87, 184); pdf.rect(80, y, d.estimatedCost / max * 76, 4, "F");
      pdf.setFillColor(213, 103, 26); pdf.rect(80, y + 6, d.actualCost / max * 76, 4, "F");
      pdf.setTextColor(28, 44, 62); pdf.setFontSize(8);
      pdf.text(formatMXN(d.estimatedCost), 194, y + 3, { align: "right" });
      pdf.text(formatMXN(d.actualCost), 194, y + 9, { align: "right" });
      y += rowHeight;
    });
  }
  function activityChart() {
    section("Altas y cierres por día", 85);
    line("Azul: altas · Verde: cierres · Conteos del periodo", false, 9);
    const baseline = y + 43;
    const max = Math.max(1, ...scope.activity.flatMap(p => [p.created, p.completed]));
    const width = 178 / options.days;
    pdf.setDrawColor(188, 200, 215); pdf.line(16, baseline, 194, baseline);
    scope.activity.forEach((p, i) => {
      const x = 16 + i * width, bar = Math.min(4, width / 3);
      for (const [value, offset, color] of [[p.created, 1, [0, 87, 184]], [p.completed, bar + 2, [13, 125, 105]]] as const) {
        const height = value / max * 34;
        pdf.setFillColor(color[0], color[1], color[2]); if (value) pdf.rect(x + offset, baseline - height, bar, height, "F");
        pdf.setTextColor(28, 44, 62); pdf.setFontSize(8);
        pdf.text(String(value), x + offset + bar / 2, baseline - height - 2, { align: "center" });
      }
      pdf.setTextColor(28, 44, 62); pdf.setFontSize(8);
      pdf.text(`${p.day.slice(8)}/${p.day.slice(5, 7)}`, x + width / 2, baseline + 6, { align: "center" });
    });
    y = baseline + 15;
  }
  header();
  line(`Periodo: ${formatMexicanDate(scope.start)} al ${formatMexicanDate(scope.end)} · America/Chihuahua`, true);
  line(`Emitido: ${now.toLocaleString("es-MX", { timeZone: "America/Chihuahua" })}`, false, 9);
  line("Escenario ficticio · Datos guardados de este navegador · Importes en MXN", false, 9);
  line("Incluye órdenes con altas, cierres o cambios registrados en el periodo.", false, 9);
  line("Estados, checklist y costos son actuales; no son saldos históricos ni gastos del periodo.", false, 9);
  section(options.view === "direccion" ? "Indicadores de Dirección" : options.view === "administrador" ? "Control de costos" : "Resumen de operación");
  line(`${analysis.totals.orders} órdenes del periodo | ${analysis.totals.completed} completadas | ${analysis.totals.overdue} retrasadas`, true, 12);
  const created = scope.activity.reduce((sum, p) => sum + p.created, 0), closed = scope.activity.reduce((sum, p) => sum + p.completed, 0);
  line(`Altas: ${created} · Cierres: ${closed} · Avance actual: ${analysis.totals.orders ? Math.round(analysis.totals.completed / analysis.totals.orders * 100) + "%" : "Sin órdenes"}`);
  line(`Costo real: ${formatMXN(analysis.totals.actualCost)} · Presupuesto: ${formatMXN(analysis.totals.estimatedCost)}`);
  line(`Sobrecostos individuales: ${formatMXN(analysis.totals.overrun)}`);
  if (!scope.data.orders.length) line("No hay órdenes con movimientos registrados en este periodo.");

  if (options.view === "direccion") {
    activityChart();
    if (scope.data.orders.length) departmentChart();
    section("Órdenes que requieren atención");
    const attention = analysis.orders.filter(o => o.overdue || o.overrun > 0).sort((a, b) => b.overrun - a.overrun);
    if (!attention.length) line("Sin retrasos ni sobrecostos en las órdenes incluidas.");
    attention.forEach(o => { room(20); line(`${o.folio} · ${o.department}`, true); line(`${o.overdue ? "Retrasada" : "Sin retraso abierto"} · Sobrecosto: ${formatMXN(o.overrun)} · Responsable: ${o.assignee}`); });
    line("Las alertas indican qué revisar; los registros no prueban causas ni ahorros futuros.", false, 9);
  } else if (options.view === "administrador") {
    if (scope.data.orders.length) departmentChart();
    section("Control presupuestal por orden", 45);
    analysis.orders.forEach(o => { room(25); line(`${o.folio} · ${o.title}`, true); line(`${o.department} · Presupuesto: ${formatMXN(o.estimatedCost)} · Real: ${formatMXN(o.actualCost)}`); line(`Sobrecosto: ${formatMXN(o.overrun)} · Estado: ${o.status}`); });
    section("Cambios registrados en el periodo");
    if (!scope.data.history.length) line("Sin cambios registrados.");
    [...scope.data.history].sort((a, b) => b.at.localeCompare(a.at)).forEach(h => { room(17); line(`${formatMexicanDate(localDay(h.at))} · ${scope.data.orders.find(o => o.id === h.orderId)?.folio}`, true, 9); line(h.detail, false, 9); });
  } else {
    const orders = [...scope.data.orders].sort((a, b) => a.dueDate.localeCompare(b.dueDate));
    orders.forEach((order, index) => {
      const items = scope.data.checklist.filter(i => i.orderId === order.id);
      const rows: { text: string; bold?: boolean; size?: number }[] = [
        { text: `${order.folio} · ${order.title}`, bold: true, size: 11 },
        { text: `${data.departments.find(d => d.id === order.departmentId)?.name} · ${data.categories.find(c => c.id === order.categoryId)?.name}` },
        { text: `Responsable: ${order.assignee} · Prioridad: ${order.priorityLabel ?? data.priorities.find(p => p.id === order.priorityId)?.name}` },
        { text: `Estado: ${order.statusLabel ?? data.statuses.find(s => s.id === order.statusId)?.name} · Compromiso: ${formatMexicanDate(order.dueDate, data.dateDisplayFormat)}` },
        { text: `Real: ${formatMXN(order.actualCost)} · Presupuesto: ${formatMXN(order.estimatedCost)}` },
        { text: `Actividades verificadas: ${items.filter(i => i.done).length}/${items.length}` },
        ...items.map(i => ({ text: `${i.done ? "Verificada" : "Pendiente"}${i.required ? " · Obligatoria" : ""}: ${i.label}`, size: 9 })),
        ...(order.description ? [{ text: `Solicitud: ${order.description}` }] : []),
        ...(order.observations ? [{ text: `Observaciones: ${order.observations}` }] : []),
      ];
      const height = rows.reduce((sum, row) => {
        pdf.setFont("helvetica", row.bold ? "bold" : "normal"); pdf.setFontSize(row.size ?? 10);
        return sum + pdf.splitTextToSize(safe(row.text), 178).length * 5.5;
      }, 5);
      room(Math.min(230, height + (index === 0 ? 17 : 0)));
      if (index === 0) section("Detalle y actividades de las órdenes");
      y += 4;
      rows.forEach(row => line(row.text, row.bold, row.size));
    });
  }
  const pages = pdf.getNumberOfPages();
  for (let page = 1; page <= pages; page++) {
    pdf.setPage(page); pdf.setFontSize(9); pdf.setFont("helvetica", "normal"); pdf.setTextColor(90);
    pdf.text("salazar.red/demo · Información de demostración", 16, 287); pdf.text(`${page} / ${pages}`, 194, 287, { align: "right" });
  }
  return pdf;
}
