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
