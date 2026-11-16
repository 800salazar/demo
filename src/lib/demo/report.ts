import { jsPDF } from "jspdf";
import type { DemoData } from "./types";
import { buildOperationalAnalysis, getOperationalSnapshot } from "@/lib/ai/analysis";
import { formatMexicanDate, formatMXN } from "@/lib/format";

/** Built from the same current snapshot as the assistant; no uploads or server persistence. */
export function buildOperationalPdf(data: DemoData, now = new Date()): jsPDF {
  const analysis = buildOperationalAnalysis(getOperationalSnapshot(data), now);
  const pdf = new jsPDF({ unit: "mm", format: "a4" });
  pdf.setProperties({ title: "Salazar Consultores · Reporte operativo", author: "Salazar Consultores" });
  let y = 0;
  function header() {
    pdf.setFillColor(8, 43, 82); pdf.rect(0, 0, 210, 29, "F");
    pdf.setTextColor(255); pdf.setFont("helvetica", "bold"); pdf.setFontSize(17); pdf.text("Salazar Consultores", 16, 14);
    pdf.setFontSize(10); pdf.text("Control de órdenes · Reporte operativo", 16, 23); y = 40;
  }
  function room(height: number) { if (y + height > 275) { pdf.addPage(); header(); } }
  function line(text: string, bold = false, size = 10) {
    pdf.setFont("helvetica", bold ? "bold" : "normal"); pdf.setFontSize(size); pdf.setTextColor(28, 44, 62);
    // Core font is Latin-1; replace unsupported characters instead of emitting broken glyphs.
    const safe = text.replace(/[^\u0020-\u007e\u00a0-\u00ff]/g, " ");
    const lines: string[] = pdf.splitTextToSize(safe, 178);
    for (const part of lines) { room(6); pdf.setFont("helvetica", bold ? "bold" : "normal"); pdf.setFontSize(size); pdf.setTextColor(28, 44, 62); pdf.text(part, 16, y); y += 5.5; }
  }
  header();
  line(`Emitido: ${now.toLocaleString("es-MX", { timeZone: "America/Chihuahua" })}`);
  line("Escenario ficticio · Datos actuales de este navegador · Importes en MXN"); y += 4;
  line(`${analysis.totals.orders} órdenes | ${analysis.totals.completed} completadas | ${analysis.totals.overdue} retrasadas`, true, 12);
  line(`Costo real: ${formatMXN(analysis.totals.actualCost)} | Presupuesto: ${formatMXN(analysis.totals.estimatedCost)}`);
  line(`Sobrecostos individuales: ${formatMXN(analysis.totals.overrun)}`); y += 5;
  line("Costo por departamento", true, 13);
  analysis.departments.forEach(d => line(`${d.department}: ${formatMXN(d.actualCost)} · ${d.orders} órdenes · ${d.overdue} retrasadas`)); y += 5;
  line("Actividad · últimos 14 días", true, 13);
  analysis.activity.forEach(p => line(`${formatMexicanDate(p.day)}: ${p.created} creadas, ${p.completed} cerradas`));
  line("Conteos basados en las fechas actuales de alta y cierre; no representan una serie histórica de costos."); y += 5;
  line("Detalle de todas las órdenes", true, 13);
  data.orders.forEach(order => {
    room(47); y += 4;
    line(`${order.folio} · ${order.title}`, true, 11);
    line(`${data.departments.find(d => d.id === order.departmentId)?.name} · ${data.categories.find(c => c.id === order.categoryId)?.name}`);
    line(`Responsable: ${order.assignee} · Prioridad: ${order.priorityLabel ?? data.priorities.find(p => p.id === order.priorityId)?.name}`);
    line(`Estado: ${order.statusLabel ?? data.statuses.find(s => s.id === order.statusId)?.name} · Compromiso: ${formatMexicanDate(order.dueDate, data.dateDisplayFormat)}`);
    line(`Real: ${formatMXN(order.actualCost)} · Presupuesto: ${formatMXN(order.estimatedCost)}`);
    const items = data.checklist.filter(i => i.orderId === order.id);
    line(`Actividades verificadas: ${items.filter(i => i.done).length}/${items.length}`);
    if (order.description) line(`Solicitud: ${order.description}`);
    if (order.observations) line(`Observaciones: ${order.observations}`);
  });
  const pages = pdf.getNumberOfPages();
  for (let page = 1; page <= pages; page++) {
    pdf.setPage(page); pdf.setFontSize(9); pdf.setFont("helvetica", "normal"); pdf.setTextColor(90);
    pdf.text("salazar.red/demo · Información de demostración", 16, 287); pdf.text(`${page} / ${pages}`, 192, 287, { align: "right" });
  }
  return pdf;
}
