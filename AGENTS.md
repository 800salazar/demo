<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Dominio y rutas acordadas

- El dominio de este despliegue en Vercel es `salazar.red`.
- La raíz `https://salazar.red/` contiene el perfil profesional de Adán Salazar: landing tipo CV en tonos azules, inspirada en `layout2`. Mantenerla independiente de Demo y Enfoca, sin navegación obligatoria hacia ellos. Su contenido editable está en `src/config/profile.ts`; consultar `docs/profile.md`.
- El recurso para estudiantes de la conferencia aparece al principio de `/`, con ancla `#conferencia`: dos caminos y prompts para copiar. Su contenido está en `src/lib/conference/prompts.ts`. No subir archivos ni guardar datos de estudiantes en el servidor o en Supabase; los documentos se adjuntan directamente en la IA elegida por cada alumno.
- Salazar Demo se publica en `https://salazar.red/demo`. Todas sus pantallas y APIs están bajo `/demo`, con rutas centralizadas en `src/config/routes.ts`.
- El menú, la marca del demo, el pie y el Toaster pertenecen a `src/app/demo/layout.tsx`, no al layout raíz. El enlace de inicio y el logotipo del demo llevan a `/demo`, nunca a `/`.
- La landing está en `src/app/(landing)/`; su grupo de rutas no añade segmentos a la URL. No aplicar `basePath: '/demo'` a toda la aplicación ni redirigir `/` al showroom.
- Conservar las redirecciones explícitas de las antiguas rutas del demo; no añadir una redirección global que capture rutas de la landing.

## Identidad y contacto comercial del demo

- El showroom usa la identidad de Salazar Consultores: degradado claro `#8cc3fcff` → `#2c80e1ff`, degradado principal `#0057b8e6` → `#01172fe6`, textos blancos en superficies de marca, bordes redondeados y estilo moderno, futurista y minimalista. Los estilos están limitados al demo; consultar `docs/brand.md`.
- Usar los recursos públicos del bucket `landing` desde `src/config/brand.ts`: logo azul sobre claro, blanco sobre oscuro, negro en el pie, `icon.png` como icono y `animo-stairway-720p.webm` en formato 1:1 al principio del showroom.
- El pie muestra «Estamos para servirte», `info@800salazar.com`, `800-725-2927`, «WhatsApp» y `SalazarConsultores.com`. El enlace comercial de la portada también usa «WhatsApp», con el mismo formato sencillo del pie. WhatsApp apunta a `+52 614 128 2123` con «Quiero conocer más de software de Salazar Consultores». El contacto se edita en `src/config/site.ts`; no depende de una variable de entorno.
- Mantener el footer compacto y horizontal, con ajuste de filas en móvil; no volver a añadir la leyenda «Demostración de Salazar Consultores · Todos los datos son ficticios» al pie. El demo usa un encabezado compacto y dos pestañas, Operador y Administrador, con selección explícita y degradado azul activo. Ya no tiene menú lateral ni panel móvil.
- Aplicar prevención de errores (poka-yoke): controles táctiles de 44 px, campos legibles, folio visible al editar, bloqueo de guardado sin edición y de cierres con actividades obligatorias pendientes, y confirmación antes de restablecer datos. Ver `docs/brand.md`.
- Mantener textos mínimos: títulos claros, acciones cortas y sin párrafos que repitan el diseño. Mostrar funciones futuras bajo demanda; conservar etiquetas accesibles, errores, motivos de bloqueo y la distinción entre IA y cálculos.
- La portada de `/demo` mantiene video, una entrada «Abrir demo» y contacto; no mostrar «Sin registro», el bloque de integraciones ni «Tu demo en cifras». La única pantalla de trabajo es `/demo/sistema`, con `?vista=operador` o `?vista=administrador`. No volver a dividirla en Demo 1/2/3. Las antiguas rutas de administración, operaciones, IA e integraciones redirigen al sistema.
- La ayuda interactiva vive exclusivamente en `/demo`: «Guía de uso» en la portada sustituye «Explorar demos» e inicia el recorrido completo. Tiene un pulso suave que respeta movimiento reducido. El sistema abre el mismo recorrido unificado de siete pasos. La guía selecciona la vista que requiere cada paso y espera señales reales de guardar, consultar y cambiar de vista. `/demo/recorrido` sigue disponible por URL. Editar pasos en `src/lib/guide/steps.ts`; mantener los objetivos `data-guide`. La guía no modifica órdenes ni envía consultas por sí sola, permite omitir/salir y guarda la opinión final solo en el navegador.
- El favicon usa `icon.png` de Salazar con URL versionada en `brandIcons` (`src/config/brand.ts`), compartida por los metadatos de raíz, perfil y demo. `/favicon.ico` redirige a ese recurso público; no restaurar iconos del starter.

## Arquitectura acordada: Supabase compartido

- Enfoca y Salazar Demo comparten **un único proyecto Supabase**: `acwlzsofiqdaxmwpyczu` (`https://acwlzsofiqdaxmwpyczu.supabase.co`). Es una decisión explícita del propietario. No exigir ni proponer separar proyectos como requisito para continuar.
- Enfoca es la aplicación privada de uso exclusivo de Adán. Salazar Demo es la aplicación pública donde los visitantes prueban demostraciones con información ficticia.
- Las órdenes de cada visitante del demo permanecen en su navegador (`localStorage`). Cada consulta de IA envía su snapshot actual; el modelo no recibe datos de Enfoca ni herramientas para consultar o modificar la base de datos.
- El código de IA del demo usa Supabase solamente para `consume_demo_ai_quota`, que opera sobre `demo_ai_usage`. El endpoint de salud usa la clave publishable para comprobar `demo_sessions`, prevista para una futura persistencia; no asumir que esa tabla ya existe en remoto.
- Limitar cambios de base de datos a los objetos del demo. No modificar tablas, datos, autenticación, roles ni políticas de Enfoca para implementar funciones del demo.
- Las variables preferidas son `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` y `SUPABASE_SECRET_KEY`. Las tres corresponden al proyecto compartido; los nombres anteriores `NEXT_PUBLIC_SUPABASE_*` siguen admitidos como respaldo para URL y publishable key. La clave privada permanece exclusivamente en el servidor y no se envía al modelo.
- La clave secret tiene privilegios sobre el proyecto compartido; el uso exclusivo de cuotas es una restricción del código, no una credencial limitada automáticamente a esa tabla. Mantener consultas explícitas, sin acceso genérico a tablas ni herramientas SQL para la IA.
- El esquema compartido por el propietario el 2026-10-27 incluye `demo_ai_usage`; no recrearla por asumir que falta. La existencia y los permisos de la RPC todavía requieren verificación remota. No ejecutar un esquema exportado para contexto como si fuera una migración.
- Consultar [la arquitectura](docs/architecture.md) y [el despliegue y las verificaciones](docs/deployment.md). La documentación de este repositorio debe mantener esta decisión y distinguir implementación local de verificación remota.

## Demo unificado (2026-11-08)

- `/demo/sistema`: Operador muestra editor y asistente morado; Administrador muestra costos por departamento y configuración de estados/prioridades. Los indicadores se comparten, sin duplicar el editor o el chat.
- Las pestañas simulan responsabilidades, no autenticación ni permisos reales. Ambas vistas operan sobre el mismo escenario ficticio de cada visitante.
- Conservar los paneles montados y ocultar el inactivo: los borradores, la orden seleccionada y los dos intercambios del chat sobreviven al cambio de pestaña. Cambiar de orden con edición pendiente requiere confirmación.
- La configuración modifica solo nombres y colores: preservar identificadores, referencias, orden y `kind` de los estados. Rechazar nombres vacíos, largos o duplicados. Todo se guarda en el store local existente y se restablece junto con las órdenes.
- La ayuda sigue amarilla y fija arriba a la derecha, solo icono en móvil; hay una segunda entrada animada en la portada. El footer móvil tiene logo enlazado y una segunda fila con correo y WhatsApp.
- Consultar `docs/demo-workspace.md` para flujo, pruebas y límites. No cambiar Enfoca ni el proyecto Supabase compartido por esta reorganización.
