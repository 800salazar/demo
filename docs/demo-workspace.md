# Demo de operación de planta

Implementación local del 2026-11-16. Un escenario compartido por tres perspectivas, con asistente permanente. No hay usuarios, permisos simulados que restrinjan funciones, integraciones ni importación de Excel. Enfoca y el proyecto Supabase compartido no se modifican.

## Distribución

- `/demo`: presentación, video, acceso al sistema, guía y contacto.
- `/demo/sistema?vista=operador`: crear solicitudes, buscar/editar órdenes, verificar checklist y consultar historial.
- `?vista=administrador`: configuración de departamentos, tipos, estados, prioridades y formato de fecha compromiso.
- `?vista=direccion`: indicadores, altas/cierres de los últimos 14 días y costos por departamento.
- En todas las vistas: tabla con todos los registros, buscador, filtros por departamento/estado/alerta, orden por folio/compromiso/costo y reporte PDF. Cada folio abre la edición; cada botón IA prepara una consulta.
- Escritorio desde 1100 px: área de trabajo a la izquierda y un único asistente sticky a la derecha. Tiene altura acotada al viewport y scroll interno en la conversación; el input permanece disponible.
- Móvil/tablet: botón fijo «Asistente IA» que abre el mismo panel, con cierre y Escape. No se duplica ni reinicia el chat. La tabla se desplaza horizontalmente dentro de su contenedor.

Las rutas anteriores conservan sus redirecciones. La raíz personal sigue independiente.

## Datos y prevención de errores

Cada visitante conserva su escenario en `salazar-demo:data` de su navegador. Las tres vistas permanecen montadas y comparten el mismo store. Los borradores del editor, filtros, selección y dos intercambios del chat sobreviven a los cambios de vista; los borradores/chat se pierden al recargar. Las escrituras no usan Supabase.

- Una solicitud nueva recibe folio secuencial, estado pendiente, costo real cero, dos actividades obligatorias y entrada de historial. Límite: 100 órdenes.
- Se validan título, responsable, fecha real, presupuesto y referencias a catálogos activos.
- El editor permite costo real, compromiso, estado y observaciones. Cambiar de orden con borrador pide confirmación. Guardar muestra el folio y registra el cambio.
- El checklist se guarda al marcar/desmarcar y añade historial. Una orden completada debe reabrirse antes de modificar actividades; pendientes obligatorios impiden completarla.
- Los campos de costo usan separadores de miles y dos decimales al salir. Las fechas visibles usan día, mes de tres letras y año.
- Los estados/prioridades usan colores de catálogo; las alertas incluyen texto, no dependen solo del color.

## Catálogos autoadministrados

`editCatalogItem` conserva identificadores, referencias, `kind` y orden. Renombrar muestra cuántas órdenes afecta y permite:

1. Actualizar los nombres en las órdenes existentes.
2. Conservar sus nombres anteriores y usar el nuevo en nuevas asignaciones.

La segunda opción guarda `statusLabel` / `priorityLabel` opcionales en las órdenes existentes; compatible con los datos versión 1, sin restablecerlos. Los colores siguen siendo globales. Los nombres de departamentos y tipos se actualizan en todas las órdenes y agregan una entrada al historial; la preferencia de formato de fecha se guarda en el navegador. Cambiar una orden a otro estado adopta el nombre vigente. Una renombrada posterior para todas las órdenes elimina las etiquetas conservadas. El historial anterior nunca se reescribe; se agregan entradas explicando la decisión.

## Dirección e IA

La actividad cuenta `createdAt` y `completedAt` actuales en America/Chihuahua. No representa movimientos diarios de costo ni una auditoría completa de reaperturas. El detalle de cada día muestra los folios que forman el conteo. El seed y sus fechas son ficticios.

El asistente recibe el snapshot al enviar, incluyendo campos operativos permitidos, fechas de alta/cierre, descripción/observaciones, etiquetas conservadas, cantidad de actividades obligatorias pendientes y los dos últimos cambios por orden (hasta 400 caracteres cada uno). El servidor vuelve a calcular métricas y actividad. Rechaza contexto arbitrario y limita el cuerpo a 1 MiB, 100 órdenes y preguntas de 300 caracteres.

Los botones de contexto (orden, departamento, día) envían directamente una consulta con el contexto seleccionado; si hay otra en curso, el asistente pide esperar. La IA sigue siendo de solo lectura. Las causas deben estar respaldadas por observaciones; si faltan datos, se indica. Si Gateway/cuotas no están disponibles, se mantiene la etiqueta explícita «Resumen calculado · Sin IA». La distinción no se oculta.

## PDF

`buildOperationalPdf` usa jsPDF, cargado bajo demanda. Genera una descarga real `.pdf` con fecha de emisión, indicadores, costos departamentales, actividad, todas las órdenes, observaciones y avance de checklist. Se basa en el snapshot completo guardado al pulsar el botón, independientemente de filtros de tabla; no incluye borradores ni conversación. Se pagina automáticamente y se genera en el navegador, sin subir archivos. La tipografía básica admite español/Latin-1; caracteres fuera de ese conjunto se sustituyen por espacios.

## Guía adaptada

Diez pasos: selección, editar/guardar, checklist, IA, Administrador, renombrar, tabla, Dirección, actividad y PDF. Navega a la vista necesaria, permite retroceder/omitir/salir y espera acciones reales donde aplica. No crea solicitudes, cambia órdenes ni envía consultas por sí sola.

Los eventos locales `order-saved`, `answer-ready`, `view-admin`, `catalog-saved`, `view-director` y `report-ready` confirman acciones. `salazar:guide-target` abre el asistente móvil en pasos de IA y lo cierra en los demás o al salir. Los targets son `data-guide`; el listado desplegable mantiene la ampliación del enfoque. La ayuda amarilla y el footer compacto se conservan.

## Validación

- 61 pruebas unitarias aprobadas: aislamiento de snapshots, cálculo, cuota, formatos, creación, checklist, renombrado con conservación, fechas de Chihuahua, tamaño máximo de escenario, PDF paginado y guía.
- TypeScript, ESLint y compilación de producción Next.js 16.4.6 aprobados durante la implementación.
- `/demo/sistema?vista=direccion` responde HTTP 200 en el servidor local existente, puerto 3000.
- Pruebas E2E actualizadas para guía de diez pasos, tres vistas, móvil y nuevos flujos. Chrome falla al arrancar en este entorno con SIGABRT/EPERM, antes de ejecutar la UI: validación visual/E2E pendiente, no aprobada.
- Para usar un servidor ya iniciado sin ocupar otro lock de Next: `PLAYWRIGHT_BASE_URL=http://127.0.0.1:3000 pnpm test:e2e`. Las pruebas de integración que esperan fallback requieren servidor con Gateway deshabilitado; los nuevos flujos mockean la respuesta sin consumo.
- No se desplegó ni se validó una consulta real a Gateway en esta sesión.

En Dirección, las cinco tarjetas muestran umbrales de ejemplo: 29 órdenes o más en verde y más de 3 retrasadas en naranja. Los sobrecostos se señalan cuando existen; costo real usa un límite de $300,000 (rojo si lo supera) y completadas muestra verde al 100% y amarillo mientras esté por debajo. Si no hay órdenes, completadas queda sin meta evaluable. La comparación del costo con otro periodo no está disponible: no se almacena una serie histórica de costos. La actividad permite elegir 3, 7 o 14 días y muestra las altas y cierres correspondientes.

El semáforo usa verde para objetivos cumplidos, amarillo para atención, rojo para revisión inmediata y gris cuando no hay meta definida. Como regla de demostración, más de seis órdenes retrasadas activa rojo; entre cuatro y seis, amarillo. La dona de costos muestra el total y permite consultar el desglose desde la lista de departamentos.

## Ayuda desde el asistente

Las preguntas de uso reconocidas (cambiar estado, renombrar estados, actividades, editar costo y PDF) reciben instrucciones verificadas y un botón para abrir una guía contextual de un paso. Se identifican como «Ayuda del sistema»; funcionan aunque Gateway no esté configurado y no consumen cuota del modelo. `product-help.ts` contiene el catálogo permitido; no se ejecutan enlaces, selectores ni instrucciones arbitrarias del modelo. El guía abre la vista y resalta el control con un pulso que respeta movimiento reducido. Nunca cambia una orden. Para preguntas libres, el prompt también incluye ayuda del producto y distingue la capacidad de edición del visitante del alcance de solo lectura del asistente.
