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

Los botones de contexto (orden, departamento, día) envían directamente una consulta con el contexto seleccionado; si hay otra en curso, el asistente pide esperar. La IA consulta órdenes guardadas y puede proponer borradores de nuevas solicitudes; solo el visitante crea la solicitud tras revisarla. Las causas deben estar respaldadas por observaciones; si faltan datos, se indica. Si Gateway/cuotas no están disponibles, se mantiene la etiqueta explícita «Resumen calculado · Sin IA». La distinción no se oculta.

## PDF

`buildOperationalPdf` usa jsPDF, cargado bajo demanda. «Reporte PDF» abre un menú pequeño con «Últimos 7 días» y «Últimos 14 días». La descarga solo empieza al elegir una opción. El perfil se toma de la vista activa al seleccionar el periodo, sin permisos ni autenticación adicionales; el archivo incluye vista y duración en el nombre. El menú admite teclado, Escape, clic fuera y móvil. La guía espera `report-ready` tras la descarga y su ayuda explica la selección del periodo.

El intervalo incluye hoy y los seis o trece días previos, según America/Chihuahua, hasta el instante de exportación. `getReportScope` incluye órdenes con alta, cierre o entrada de historial dentro del periodo; excluye eventos futuros y órdenes sin movimientos en el intervalo. Los filtros de tabla no alteran ese alcance. El PDF identifica fechas y criterio de inclusión. Estados, checklist, presupuesto y costo real son valores actuales de esas órdenes: no se presentan como saldos al cierre, gasto exclusivo del periodo ni series históricas de costos. Las altas y cierres diarios se cuentan con los timestamps actuales; no se reconstruyen reaperturas anteriores.

- Operador: resumen, órdenes ordenadas por compromiso, responsable, prioridad, estado, costos, actividades verificadas/pendientes y obligatorias, solicitud y observaciones.
- Administrador: resumen de costos, gráfico vectorial de presupuesto/costo actual por departamento, control presupuestal por orden y cambios del historial dentro del periodo.
- Dirección: indicadores, gráfico vectorial de altas/cierres diarios, gráfico de presupuesto/costo actual por departamento y folios con retraso o sobrecosto. No duplica el checklist operativo.

Se genera en el navegador a partir de datos guardados, sin llamadas de IA, subir archivos, borradores ni conversación. Conserva encabezados, numeración, paginación y tipografía Latin-1; caracteres no compatibles se sustituyen por espacios. Los gráficos tienen leyendas, fechas e importes; los periodos vacíos muestran un estado explícito sin porcentajes ficticios.

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

Las preguntas de uso reconocidas (cambiar estado, renombrar estados, actividades, editar costo y PDF) reciben instrucciones verificadas y un botón para abrir una guía contextual de un paso. Se identifican como «Ayuda del sistema»; funcionan aunque Gateway no esté configurado y no consumen cuota del modelo. `product-help.ts` contiene el catálogo permitido; no se ejecutan enlaces, selectores ni instrucciones arbitrarias del modelo. El guía abre la vista y resalta el control con un pulso que respeta movimiento reducido. Nunca cambia una orden. Para preguntas libres, el prompt también incluye ayuda del producto y distingue la capacidad de edición del visitante del asistente, que consulta datos y prepara borradores sin guardar órdenes.


## Dictado y solicitudes asistidas

El micrófono, junto a Consultar, usa SpeechRecognition/webkitSpeechRecognition en español de México. El dictado conserva el texto previo, aparece en el campo del chat y no se envía automáticamente. Se puede detener; los errores de permisos, micrófono, red o falta de soporte permiten seguir escribiendo. Se limita a 300 caracteres, detiene la escucha al ocultar la página y libera el reconocimiento al desmontar el componente. No se adjuntan ni guardan archivos de audio en la aplicación. El servicio de reconocimiento lo proporciona el navegador y puede procesar audio externamente según su implementación; no se garantiza reconocimiento local ni disponibilidad en todos los navegadores.

Cada consulta añade `draftContext` validado: nombres e identificadores de departamentos, tipos y prioridades activos, y el borrador abierto si existe. Se mantiene el snapshot operativo permitido y las cuotas existentes. Gateway devuelve una respuesta estructurada con `answer` y `draft` (o null). No hay herramientas de creación, SQL ni acceso adicional a Supabase. El servidor y el cliente validan los campos, importes, fechas y pertenencia al catálogo; rechazan identificadores inventados. La interpretación semántica procede del modelo; el usuario debe verificarla.

Al solicitar una nueva orden o completar un borrador por voz o texto, la propuesta abre Nueva solicitud en Operador. No asigna folio, crea historial ni cambia las órdenes guardadas. Los datos desconocidos quedan vacíos, incluidos presupuesto y fecha; cero es un presupuesto válido si se proporcionó. La respuesta enumera los campos obligatorios faltantes. Se conserva el borrador entre vistas y se envía en la siguiente consulta para permitir dictar datos adicionales. Reemplazar una solicitud abierta requiere confirmación; rechazarla conserva el contenido manual. El botón Revisar borrador permite recuperar una propuesta. Para crear se requieren campos válidos, marcar «Revisé los datos de la solicitud» y pulsar «Crear solicitud». Sin IA o ante una propuesta inválida se indica que no se aplicó ningún borrador, junto al resumen calculado.

Las pruebas de `order-draft.test.ts`, `route.test.ts` y `voice-draft.spec.ts` cubren validación, cuotas, campos faltantes, reconocimiento simulado, revisión y protección de borradores. El reconocimiento físico y la interpretación del proveedor real requieren una prueba manual con micrófono y Gateway; los mocks no los verifican.

Verificación local de esta función (2026-11-16): 89 pruebas unitarias, ESLint, TypeScript y siete pruebas E2E seleccionadas aprobadas (seis de voz/borrador y la creación manual con checklist). Se ejecutaron contra `PLAYWRIGHT_BASE_URL=http://localhost:3000`; `127.0.0.1` fue bloqueado por las restricciones de origen del servidor de desarrollo existente. La prueba de bloqueo de cierre comprueba la propiedad nativa `disabled` de la opción. La compilación de producción se intentó, pero Turbopack falló al abrir un puerto interno del proceso de estilos con `EPERM`; no se considera aprobada. No se desplegó.

## Sugerencias según la conversación

Antes de la primera consulta se muestran las tres entradas iniciales. Después, la misma respuesta estructurada de Gateway incluye entre una y tres sugerencias generadas por IA: etiqueta breve de hasta 48 caracteres y prompt completo de hasta 300. El modelo recibe la pregunta, el snapshot actual, el borrador abierto y los últimos dos intercambios de este chat, validados con una lista de campos permitidos (`history`, hasta 300 caracteres por pregunta y 5000 por respuesta). Este contexto solo se mantiene en memoria del navegador y se envía a Gateway al consultar; no se guarda en Supabase. No se hace una segunda llamada para generar botones.

El prompt pide seguimientos autosuficientes y distintos según el trabajo: analizar costos del departamento mencionado, comparar áreas existentes, revisar folios o datos pendientes de una solicitud, o preparar otra desde cero. Una nueva solicitud explícita no debe copiar el borrador anterior y conserva la confirmación antes de reemplazarlo. Las sugerencias no ejecutan operaciones ni guardan órdenes; al pulsarlas envían su pregunta completa con los datos vigentes y conservan el texto aún no enviado del compositor. Siguen disponibles entre cambios de vista. Durante una consulta o dictado quedan bloqueadas.

Servidor y cliente validan las sugerencias y eliminan duplicados, preguntas idénticas a la actual y entradas inválidas; no truncan prompts. En ayuda local, ausencia de IA o respuestas sin sugerencias utilizables se ofrecen opciones locales según tema, departamento, folio y borrador. Estas opciones de respaldo no se presentan como generación de IA. La selección semántica del modelo requiere verificación con el proveedor real; las pruebas simulan sus respuestas.

Verificación de sugerencias: `suggestions.test.ts` y pruebas del endpoint cubren límites, historial, catálogos personalizados, prompts completos y respuesta sin llamadas adicionales. Las tres pruebas de `contextual-suggestions.spec.ts` y las seis de voz/borrador aprobaron en Chrome con `PLAYWRIGHT_BASE_URL=http://localhost:3000`, incluyendo móvil, teclado, cambio de vista y conservación del texto. La compilación de producción mantiene la limitación de permisos de Turbopack documentada arriba; no se desplegó.

Verificación de PDF por perfil y periodo (2026-11-16): 102 pruebas unitarias, TypeScript y ESLint aprobados. Siete pruebas E2E de descarga por perfil/periodo y teclado/móvil, más las tres pruebas de la guía, aprobadas contra localhost. PDF de los tres perfiles renderizados con Poppler y revisados visualmente, incluidos gráficos, saltos de página y numeración. El regreso del foco al cerrar la guía espera que el botón de ayuda vuelva a estar visible y descarta elementos ocultos de rutas conservadas por Next. No se desplegó; sigue pendiente la compilación de producción por la restricción de puertos de Turbopack descrita arriba.

## Adaptación y prueba real de NVIDIA (2026-11-16)

Se conserva `nvidia/nemotron-3.5-lightning-free` mediante AI Gateway. La ficha oficial y el catálogo de Gateway consultados el 2026-11-16 anuncian contexto de 1M tokens, máximo de salida de 65,000 y precio de entrada/salida cero. Eso no equivale a una garantía de disponibilidad o de límites de solicitudes. El endpoint es de prueba y registra entradas/salidas para mejorar productos de NVIDIA: utilizar exclusivamente datos ficticios, sin información confidencial de clientes. Fuentes: https://vercel.com/ai-gateway/models/nemotron-3.5-lightning-free y https://vercel.com/changelog/nemotron-3-5-lightning-now-available-on-ai-gateway-for-free.

La credencial y el modelo sí respondieron a pruebas mínimas. El fallo real del formato completo fue `AI_NoObjectGeneratedError` con causa `AI_JSONParseError`, junto a una advertencia del proveedor de que el esquema de `Output.object` no se estaba aplicando. Para este modelo, el endpoint usa `Output.json()`, instrucciones explícitas de formato y validación estricta local con Zod. Otros modelos conservan `Output.object`. Se mantiene `reasoning: none`, salida de 2200 tokens, timeout de 25 segundos y las cuotas existentes. La categoría de diagnóstico `invalid_output` distingue problemas de estructura sin registrar preguntas, secretos ni cuerpos del proveedor.

El escenario conserva sus 30 órdenes y los cambios del visitante. `compactModelContext` envía todos los totales departamentales/globales calculados, pero hasta ocho detalles relevantes por consulta normal: primero folios o departamentos mencionados, o registros priorizados por alertas. Identifica expresamente que el detalle es parcial; no cambia el denominador de los totales. Una petición explícita de listado completo puede incluir todos los detalles permitidos. Para preparar/corregir borradores sin folios específicos omite los detalles operativos ajenos al formulario. La actividad diaria se añade cuando la consulta la necesita. El cliente sigue enviando su snapshot validado al servidor; la reducción se hace antes de llamar al modelo.

Al corregir un borrador, NVIDIA devuelve un parche con los campos solicitados. El servidor conserva los campos omitidos del borrador actual y valida el resultado y sus referencias a catálogos. Al pedir una nueva solicitud desde cero, parte de campos vacíos. El mensaje de revisión se construye desde el borrador validado, evitando contradicciones entre el texto generado y el formulario. No se guarda una orden. Las pruebas reales detectaron y corrigieron un cambio de fecha no solicitado al regenerar el objeto completo; el nuevo recorrido conservó fecha, responsable, área y tipo al cambiar únicamente el presupuesto. La revisión humana sigue siendo obligatoria: estas comprobaciones no garantizan ausencia de errores semánticos en cualquier petición futura.

El respaldo calculado ahora limita costos, retrasos y actividad a los departamentos mencionados. Para Mantenimiento verificó sobrecosto de $13,000.00 y folios OT-1002/OT-1004, sin mezclar OT-1016/OT-1023 de otras áreas. Su aviso distingue el resumen calculado de una respuesta de IA.

El chat de escritorio ajusta su altura al espacio real entre su posición y el borde inferior de la ventana, y la recalcula al cambiar tamaño o desplazar la página. Se comprobaron campo, enviar y micrófono completamente visibles a 1440×900, 1366×768 y 1280×720, tanto al inicio como tras desplazar y volver arriba.

Prueba real completada a través del navegador y `/demo/api/ai`: análisis de Mantenimiento, nueva solicitud con catálogos reales y cambio de presupuesto de 1500 a 1800 conservando fecha 2026-12-20 y responsable Ana Torres. Las tres respuestas fueron `source: ai`, sin crear órdenes. En una ejecución completaron en aproximadamente 1.2 a 2.9 segundos cada una; no es una promesa de latencia. Tras resolver los conflictos de integración aprobaron 23 pruebas E2E seleccionadas, incluyendo los tres intercambios reales, los tres tamaños de escritorio, sugerencias, guía, PDF y dictado simulado.

La prueba de proveedor quedó como `tests/e2e/live-nemotron.spec.ts`, desactivada por defecto para evitar consumo accidental. Ejecutar conscientemente con `RUN_LIVE_AI=1 PLAYWRIGHT_BASE_URL=http://localhost:3000 pnpm test:e2e tests/e2e/live-nemotron.spec.ts`, contra un servidor con variables reales. Sus artefactos quedan en la salida de Playwright. El micrófono físico y la versión publicada no se verificaron en este recorrido. No se cambiaron credenciales, objetos de Supabase ni configuración remota.


## Altas y retiro de catálogos

Administrador permite agregar, editar con lápiz y retirar con papelera en Departamentos, Tipos de solicitud, Estados y Prioridades. Los iconos conservan etiquetas accesibles y controles de 44 px. Los estados y prioridades mantienen su edición de color y alcance del renombrado; departamentos y tipos renombrados actualizan el nombre global sin reescribir el historial anterior.

`addCatalogItem` valida nombres de 1 a 120 caracteres, duplicados y un máximo de 30 entradas por catálogo (incluidas las conservadas para registros anteriores). Genera identificadores nuevos; los existentes nunca se renumeran. Estados nuevos requieren elegir su comportamiento; prioridades/estados se agregan al final. El comportamiento y el orden de opciones existentes se conservan.

La papelera abre una confirmación con la cantidad de órdenes afectadas. Si se utiliza, exige elegir entre conservarla solo en esas órdenes (`active: false`, fuera de nuevas asignaciones), o sustituir sus referencias por otra opción activa. Una opción sin uso se elimina físicamente. Las conservadas se identifican como «Solo en registros anteriores» y permiten su posterior sustitución. El historial anterior nunca se reescribe: se agregan entradas explicando la retirada o sustitución.

`removeCatalogItem` revalida las referencias y la elección contra el store actual. Mantiene al menos una opción activa por catálogo y un estado pendiente y otro completado activos. Una sustitución hacia estado completado se bloquea si hay actividades obligatorias pendientes; al completar o reabrir actualiza `completedAt` coherentemente. Las sustituciones de estado/prioridad eliminan etiquetas de nombre conservadas para adoptar la opción destino. El checklist y los identificadores de órdenes se conservan. No hay cambios de Supabase ni pérdida de escenarios guardados; todas las operaciones usan el store local y el restablecimiento existente.

Validación local de gestión de catálogos: 129 pruebas unitarias, TypeScript y ESLint aprobados. Doce pruebas E2E de altas/edición/eliminación, conservación y sustitución de referencias, bloqueo de cierre, guía y persistencia entre vistas, más una prueba móvil de tamaño táctil, confirmación y Escape, aprobadas. La ayuda y las guías indican el lápiz en lugar de un botón de texto «Editar». No se desplegó esta ampliación.
