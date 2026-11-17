/** Curated help only. The model never chooses selectors, scripts or arbitrary navigation. */
export const productHelp = {
  changeStatus: {
    answer: "En **Operador**, elige la orden, selecciona su nuevo **Estado** y pulsa **Guardar cambios**. Para completarla, primero verifica las actividades obligatorias. Yo te muestro dónde; tú decides y guardas el cambio.",
    guide: "helpStatus", label: "Mostrar dónde cambiar el estado",
  },
  renameStatus: {
    answer: "En **Administrador → Estados**, pulsa el **lápiz**. Cambia el nombre o el color, elige si actualizar las órdenes existentes o conservar sus nombres y guarda.",
    guide: "helpCatalog", label: "Mostrar configuración de estados",
  },
  checklist: {
    answer: "En **Operador**, elige la orden y revisa **Antes de cerrar**. Marca solo las actividades que verificaste. Las obligatorias pendientes bloquean el cierre. Una orden completada debe reabrirse antes de editar sus actividades.",
    guide: "helpChecklist", label: "Mostrar actividades de la orden",
  },
  cost: {
    answer: "En **Operador**, elige la orden, edita **Costo real (MXN)** y pulsa **Guardar cambios**. La tabla, los indicadores y la próxima consulta usarán el nuevo importe.",
    guide: "helpCost", label: "Mostrar dónde editar el costo",
  },
  report: {
    answer: "Pulsa **Reporte PDF** y elige **Últimos 7 días** o **Últimos 14 días**. El PDF se adapta a tu vista: Operador, Administrador o Dirección. Incluye órdenes con altas, cierres o cambios en ese periodo; los costos son actuales. No incluye borradores.",
    guide: "helpReport", label: "Mostrar descarga del reporte",
  },
} as const;
export type ProductHelpId = keyof typeof productHelp;
export function isProductHelpId(value: unknown): value is ProductHelpId {
  return typeof value === "string" && Object.hasOwn(productHelp, value);
}
/** Small typo tolerance (insertion, omission, substitution or adjacent transposition). */
function nearWord(word: string, expected: string): boolean {
  if (word === expected) return true;
  if (Math.abs(word.length - expected.length) > 1 || Math.min(word.length, expected.length) < 4) return false;
  if (word.length === expected.length) {
    const differences = [...word].flatMap((letter, index) => letter === expected[index] ? [] : [index]);
    return differences.length === 1 || (differences.length === 2 && differences[1] === differences[0] + 1
      && word[differences[0]] === expected[differences[1]] && word[differences[1]] === expected[differences[0]]);
  }
  const shorter = word.length < expected.length ? word : expected;
  const longer = word.length < expected.length ? expected : word;
  for (let index = 0; index < longer.length; index++) {
    if (longer.slice(0, index) + longer.slice(index + 1) === shorter) return true;
  }
  return false;
}

export function findProductHelp(question: string): ProductHelpId | undefined {
  const q = question.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  if (/enfoca|privad|contrase|secreto/.test(q)) return;
  const words = q.match(/[a-z0-9]+/g) ?? [];
  const has = (...terms: string[]) => words.some(word => terms.some(term => nearWord(word, term)));
  const how = has("como", "donde", "ayuda", "ayudame", "pasos", "muestra", "mostrar", "quiero", "necesito", "puedo", "kmo", "cmo");
  // Past changes, statistics and explanations must continue to operational analysis.
  if (!how && /\b(que|cuales|cuantas|cuantos|por que|porque|analiza|resumen)\b/.test(q)) return;
  const edit = has("cambiar", "cambio", "cambia", "editar", "edito", "edita", "modificar", "modifico", "actualizar", "actualizo", "poner");
  const state = has("estado", "estados", "estatus");
  const catalog = has("renombrar", "renombro", "nombre", "nombres", "color", "colores", "configurar", "configuracion");
  if (state && catalog && (how || edit || has("renombrar", "configurar"))) return "renameStatus";
  if (state && edit) return "changeStatus";
  if ((how || has("completar", "cerrar", "verificar")) && has("checklist", "actividades", "actividad", "completar", "cerrar")) return "checklist";
  if (has("costo", "costos", "importe", "monto") && (edit || has("registrar", "registro"))) return "cost";
  if (has("pdf", "reporte", "reportes") && (how || has("descargar", "descarga", "descargo", "generar", "genero", "obtener", "sacar"))) return "report";
}

export const PRODUCT_HELP_CONTEXT = Object.values(productHelp).map(item => item.answer).join("\n") + "\nEn Administrador, los cuatro catálogos (Departamentos, Tipos de solicitud, Estados y Prioridades) permiten Agregar, editar con lápiz y eliminar con papelera. Al eliminar una opción usada, el visitante debe elegir conservarla en las órdenes anteriores y retirarla de nuevas asignaciones, o sustituirla por otra opción activa. El historial anterior se conserva. Los estados nuevos requieren comportamiento Pendiente, En proceso o Completada. No se pueden completar órdenes con actividades obligatorias pendientes ni retirar el último estado pendiente o completado. El asistente explica estos pasos; no modifica catálogos.";
