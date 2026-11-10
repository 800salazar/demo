# Demo unificado de control de órdenes

Implementación local del 2026-11-08. Sustituye la división Demo 1 / Demo 2 / Demo 3 por una portada y un sistema con dos vistas. No se ha publicado desde esta sesión.

## Pantallas y responsabilidades

- `/demo`: video y presentación de Salazar, guía amarilla, una entrada «Abrir demo», restablecimiento y contacto.
- `/demo/sistema`: indicadores compartidos de órdenes, retrasadas y costo real, con pestañas Operador / Administrador.
- Operador: búsqueda y edición de órdenes junto al único asistente morado. En escritorio amplio se muestran en dos columnas; en móvil se apilan.
- Administrador: gráfica de costos por departamento con desglose, y edición de nombres/colores de estados y prioridades. Los cambios se reflejan en las órdenes y en los nombres enviados a la IA.

`?vista=administrador` abre Administración; cualquier otro valor abre Operador. Las antiguas rutas `/demo/administracion`, `/demo/operaciones`, `/demo/ia` e `/demo/integraciones` redirigen al sistema. `/demo/recorrido` conserva un acceso directo a la guía. La landing personal y las APIs mantienen su función.

## Estado y prevención de errores

El selector representa una simulación de responsabilidades, no usuarios autenticados ni un control de acceso real. Ambos paneles permanecen montados mediante Radix Tabs `forceMount`; el inactivo usa `hidden` y queda fuera del foco y del árbol accesible. El historial nativo actualiza la URL sin desmontar el editor o el chat. Cambiar de pestaña conserva la orden elegida, sus borradores y los dos intercambios temporales del asistente. El navegador Atrás recupera la vista anterior.

Cambiar de orden con cambios sin guardar requiere elegir entre seguir editando o descartarlos. Guardar conserva el folio visible, la validación de costos/fechas y la prohibición de completar órdenes con actividades obligatorias pendientes.

Los catálogos se editan sobre el store existente `salazar-demo:data`. La función pura `editCatalogItem` valida el nombre (1–120 caracteres, sin duplicados en el mismo catálogo) y el color permitido. Solo actualiza nombre y color: conserva identificadores, orden, referencias, actividad y `kind`. Renombrar un estado de completado no altera su significado para métricas o validación. No se añaden ni eliminan catálogos. El restablecimiento recupera órdenes y configuración juntos. No cambia la versión de datos ni descarta los escenarios ya guardados.

Los borradores y las respuestas temporales no sobreviven a recargar o abandonar el sistema; las órdenes y catálogos guardados sí. No se envían datos a Supabase al cambiar de vista o editar configuración. El asistente sigue siendo de solo lectura y continúa enviando el snapshot actual a su endpoint con validación y cuota persistente. Enfoca y su proyecto Supabase compartido no se modifican.

## Guía

Un recorrido de siete pasos lleva a elegir orden, cambiar costo/guardar, consultar al asistente, pasar a Administrador, revisar la gráfica, editar configuración y regresar a Operador. Cada paso selecciona su vista al avanzar o retroceder. Las acciones esperan eventos locales `order-saved`, `answer-ready`, `view-admin`, `catalog-saved` o `view-operator`; la guía no modifica ni consulta por sí sola. La medición observa visibilidad de pestañas y sigue ampliando el enfoque para incluir el listado de órdenes abierto.

La ayuda amarilla sigue flotando arriba a la derecha, con icono solo en móvil y una segunda entrada en la portada. Respeta movimiento reducido. Restablecer se desplaza con el contenido y requiere confirmación. El footer móvil mantiene dos filas: logo enlazado y correo/WhatsApp.

## Verificación

- 53 pruebas unitarias aprobadas, incluyendo cambios de catálogos, conservación de referencias/reglas y compatibilidad del snapshot con el esquema de IA.
- TypeScript y ESLint aprobados.
- Compilación de producción alternativa `next build --webpack` aprobada, incluida `/demo/sistema` y el prerenderizado de las rutas anteriores.
- El build habitual `pnpm build` con Turbopack aprobó después de regenerar únicamente su caché de producción. Los dos primeros intentos habían fallado con `ModuleGraph::from_graphs_inner was canceled`; la caché anterior se conservó en una ubicación temporal y no se alteró el servidor de desarrollo. La versión final compila, verifica tipos y genera las 15 páginas estáticas.
- La nueva ruta respondió HTTP 200 en el servidor local existente del propietario, puerto 3001. No se detuvo ni reemplazó ese servidor.
- Se actualizaron las pruebas E2E de navegación, guía, gráfica y móvil y se añadieron pruebas de conservación de borradores/chat, configuración, persistencia y confirmación de descarte. Su runner no pudo abrir otro `next dev` porque el servidor del propietario ya ocupa el checkout. El intento independiente de Chrome terminó en `SIGABRT`/`EPERM`; las pruebas de navegador y la revisión visual no se consideran aprobadas.

Antes de publicar, ejecutar las pruebas de navegador en un entorno con Chrome operativo y comprobar el flujo a 320 px y en escritorio. No hay cambios remotos ni deployment en esta implementación.
