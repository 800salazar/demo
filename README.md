# Salazar Demo — Soluciones empresariales

Showroom interactivo de Salazar Consultores para empresas manufactureras. Todos los datos son ficticios: cada visitante conserva sus 30 órdenes en su navegador, sin cuentas ni registro.

## Dominio y navegación

El dominio configurado por el propietario en Vercel es **`salazar.red`**. Este despliegue organiza sus páginas así:

| URL | Contenido |
| --- | --- |
| `https://salazar.red/` | Landing breve de Adán Salazar: Conferencia, Perfil, Qué hago y Contacto, con identidad azul y layout independiente. |
| `https://salazar.red/demo` | Inicio del showroom de demostraciones |
| `/demo/administracion` | Administración del demo |
| `/demo/operaciones` | Dashboard, órdenes y asistente operativo |
| `/demo/ia` | Análisis con IA |
| `/demo/recorrido` y `/demo/integraciones` | Recorrido y catálogo de integraciones |
| `/demo/api/ai` y `/demo/api/health` | Endpoints del demo |

La landing tiene su propio layout en `src/app/(landing)/`. El menú, el pie, la marca y las notificaciones del demo solo se montan en `src/app/demo/layout.tsx`. La raíz no redirige a `/demo` ni carga los datos de demostración. Las antiguas rutas del showroom, como `/ia`, redirigen a su nueva ubicación; las redirecciones son explícitas y no capturan todas las rutas del dominio.

Las rutas internas del demo se centralizan en `src/config/routes.ts`. No se usa `basePath` global. El perfil profesional se publica en la raíz del mismo despliegue; sus textos, contacto y fotografía opcional se configuran en `src/config/profile.ts`. Ver [edición del perfil](docs/profile.md).

La sección `/#conferencia` permite elegir entre revisar avances y aterrizar una idea, completar tres datos cuando corresponde y copiar un prompt para pegarlo en la IA favorita del alumno. Los prompts se editan en `src/lib/conference/prompts.ts`. La herramienta no recibe archivos ni guarda respuestas de los estudiantes.

## Decisión de arquitectura: un solo Supabase

**Enfoca y Salazar Demo comparten el proyecto Supabase `acwlzsofiqdaxmwpyczu`.** Enfoca es privado, de uso exclusivo de Adán; Salazar Demo es público y permite a los visitantes probar ejemplos con datos ficticios. No se requiere crear otro proyecto Supabase.

La separación se mantiene en el acceso de cada aplicación y en las consultas explícitas del servidor. El asistente recibe las órdenes actuales del navegador y usa Supabase únicamente para la cuota de IA; no consulta las tablas de Enfoca. La clave secret tiene privilegios amplios sobre el proyecto y permanece en el servidor, fuera del contexto del modelo.

Referencias para continuar el desarrollo: [arquitectura y límites entre aplicaciones](docs/architecture.md), [despliegue y verificaciones](docs/deployment.md) y [reglas para agentes](AGENTS.md).

## Funciones disponibles

- Navegación adaptable, datos de demostración y restablecimiento con confirmación.
- Gráfica de costo real por departamento e indicadores de órdenes, completadas y costos.
- Edición de costo real, fecha compromiso y estado de una orden en `/demo/operaciones` y `/demo/ia`. Completar una orden requiere que sus actividades obligatorias estén realizadas.
- Asistente operativo en ambas pantallas, con preguntas sugeridas y consulta libre. Cada consulta envía el estado actual de las órdenes del visitante.
- Métricas recalculadas en el servidor, análisis con Vercel AI Gateway y respuestas alternativas claramente identificadas como cálculos.
- Aviso cuando una respuesta corresponde a datos anteriores a un cambio.

Las demás funciones anunciadas en los módulos de administración, operaciones, integraciones y recorrido conservan sus avisos de construcción. El asistente no realiza cambios ni integra información de Enfoca.

## Tecnologías

Next.js 16.4 / React 19 / TypeScript / Tailwind CSS 4 / shadcn/ui / Recharts / Vercel AI SDK 7 / Vercel AI Gateway / Supabase / Zod / pnpm.

## Desarrollo

Requiere Node.js 22 o superior y pnpm 10.

```bash
pnpm install
cp .env.example .env.local  # Solo si no existe; conserva tus variables actuales
pnpm dev
```

En desarrollo local, el showroom se abre en `http://localhost:3000/demo`; `http://localhost:3000/` corresponde a la landing.

| Comando | Función |
| --- | --- |
| `pnpm dev` | Servidor local |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | Tipos de rutas y TypeScript |
| `pnpm test` | Pruebas de cálculos, endpoint y adaptador de cuotas |
| `pnpm test:e2e` | Pruebas en Chrome; inicia un servidor local en el puerto 3100 |
| `pnpm build` / `pnpm start` | Compilar y servir producción |
| `pnpm check` | Lint, tipos y build |

Las pruebas E2E usan Chrome instalado y deshabilitan llamadas al modelo para evitar consumo. Comprueban el flujo real navegador → endpoint → cálculos → respuesta, persistencia tras recargar y dos contextos de navegador independientes. Las pruebas unitarias de Gateway y Supabase usan dobles de prueba; no certifican una conexión externa real.

## Activar la IA

Configura las variables del sitio publicado en Vercel → proyecto Salazar Demo → Settings → Environment Variables, para Production y para Preview si probarás ahí. `.env.local` corresponde a la ejecución local; no configura el despliegue. Los secretos son exclusivamente del servidor, sin prefijo `NEXT_PUBLIC_`.

| Variable | Ámbito | Uso |
| --- | --- | --- |
| `AI_MODEL` | Servidor | ID `proveedor/modelo` disponible en [el catálogo de Gateway](https://ai-gateway.vercel.sh/v1/models). Para pruebas gratuitas con datos ficticios: `nvidia/nemotron-3.5-lightning-free`. |
| `AI_GATEWAY_API_KEY` | Servidor | Clave de Vercel AI Gateway. Alternativa a OIDC. |
| `VERCEL_OIDC_TOKEN` | Servidor | Autenticación OIDC de Vercel; alternativa a la clave de Gateway. |
| `SUPABASE_URL` | Servidor | URL del proyecto compartido con Enfoca: `https://acwlzsofiqdaxmwpyczu.supabase.co`. |
| `SUPABASE_PUBLISHABLE_KEY` | Servidor | Clave pública del proyecto compartido; usada en el servidor para comprobar el esquema sin privilegios. No es necesaria para la llamada de IA y su cuota. |
| `SUPABASE_SECRET_KEY` | Servidor | Clave privada del proyecto compartido. El código de IA la usa exclusivamente para la RPC de cuotas. No se expone al navegador ni al modelo. |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Público | Contacto comercial, solo dígitos. |

La clave de Gateway tiene prioridad si se configuran ambos métodos de autenticación. En Vercel puedes usar OIDC; para desarrollo local con un proyecto vinculado, `vercel env pull` obtiene un token temporal. Consulta [la configuración oficial de OIDC](https://vercel.com/docs/ai-gateway/authentication-and-byok/oidc). No se necesita contratar ni configurar OpenAI por separado.

El código no fija un modelo por defecto: `AI_MODEL` debe configurarse explícitamente. Verifica disponibilidad y costo antes de elegirlo. Define también un presupuesto en AI Gateway; una cuota de solicitudes no equivale a un presupuesto monetario.

Los nombres anteriores `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` siguen aceptándose como respaldo; los nuevos tienen prioridad. Ningún componente del navegador necesita un cliente Supabase en esta versión. La clave publishable no sustituye a `SUPABASE_SECRET_KEY`, necesaria para ejecutar la RPC privada de cuotas.

### Cuota persistente

Las cuotas viven en el **mismo proyecto Supabase que Enfoca**. Antes de aplicar SQL, comprueba qué objetos del demo ya existen y revisa las migraciones pendientes conforme a [la guía de despliegue](docs/deployment.md).

Para vincular la CLI al proyecto acordado:

```bash
supabase link --project-ref acwlzsofiqdaxmwpyczu
```

`20261026225631_ai_usage_limits.sql` define únicamente la tabla `demo_ai_usage`, su índice, sus permisos y la función `consume_demo_ai_quota`. El esquema que compartió el propietario el 2026-10-27 ya contiene `demo_ai_usage`; no vuelvas a ejecutar su `CREATE TABLE` sin comprobar el estado. Falta confirmar remotamente la función y sus permisos. No ejecutes todas las migraciones con `supabase db push` sin revisar antes las pendientes y el historial del proyecto compartido.

- Máximo de 12 llamadas al modelo por IP en ventanas fijas de 10 minutos.
- Máximo compartido de 200 llamadas por día UTC por base de datos.
- La transacción bloquea primero el contador del proyecto y después el del visitante, para coordinar instancias concurrentes.
- Solo `service_role` puede ejecutar la función o acceder a los contadores. RLS está activado; `anon` y `authenticated` no tienen permisos.
- No se guardan preguntas, respuestas, órdenes ni IP en texto. El identificador de cuota es un HMAC calculado en el servidor.
- En Vercel se usa `x-vercel-forwarded-for`; fuera de Vercel las solicitudes comparten una cuota conservadora. Visitantes en la misma red comparten el límite por IP, aunque sus datos operativos siguen separados.
- Si falta configuración, migración o disponibilidad del almacén, no se llama al modelo: se muestran cálculos. Los fallos del proveedor también consumen su intento reservado, sin reintentos automáticos.

La prueba SQL en `supabase/tests/ai_usage_limits.sql` verifica permisos, la llamada 13 y el tope global. Ejecútala únicamente en una base de prueba desechable; se revierte al terminar. La prueba secuencial no sustituye una prueba de concurrencia en el entorno de lanzamiento.

## Contrato y aislamiento del asistente

`POST /demo/api/ai` recibe `{ question, snapshot }`. El snapshot incluye únicamente departamentos, prioridades, estados y una proyección de las órdenes actuales. No acepta contexto arbitrario, credenciales ni instrucciones para consultar otras fuentes.

El servidor:

1. Rechaza solicitudes de otros orígenes y formatos distintos de JSON.
2. Limita el cuerpo a 96 KiB reales en UTF-8, incluso sin `Content-Length`, y la pregunta a 300 caracteres.
3. Valida forma, longitudes, costos, fechas, identificadores únicos y referencias entre las órdenes y catálogos; admite hasta 100 órdenes.
4. Recalcula totales, costos por departamento, sobrecostos por orden y retrasos con fecha de Chihuahua. No confunde una orden completada con un retraso abierto.
5. Reserva la cuota persistente y envía únicamente estos datos a Gateway, sin herramientas de consulta o escritura.
6. Devuelve `{ answer, source, asOf }`. `source: "ai"` identifica generación; `source: "calculations"` identifica un cálculo alternativo y añade `reason`.

El modelo recibe títulos y observaciones como contenido no confiable. No tiene herramientas de base de datos, navegación ni escritura. No se comparten conversaciones ni snapshots entre solicitudes, y todas las respuestas HTTP usan `private, no-store`. Los textos del modelo se muestran como texto, sin ejecutar HTML.

Si no hay IA, los cálculos alternativos cubren resumen, costos, retrasos y consulta de un folio. La interfaz indica esta limitación; no simula inteligencia artificial. Las recomendaciones generadas deben verificarse antes de tomar decisiones.

## Datos y estructura

`src/lib/demo/store.ts` es la única vía de actualización y persiste en `localStorage`. `resetDemoData` restaura el escenario con fechas relativas al momento actual. Las referencias usan IDs estables y los indicadores usan `status.kind`, independientemente del nombre visible.

| Ruta | Contenido |
| --- | --- |
| `src/app/demo/api/ai/route.ts` | Validación, cuota, Gateway y alternativa calculada |
| `src/app/(landing)/` | Página y layout de la landing independiente en `/` |
| `src/app/demo/` | Páginas, APIs y layout del showroom en `/demo` |
| `src/config/routes.ts` | Rutas del demo, selección del menú y redirecciones de compatibilidad |
| `src/lib/ai/` | Configuración, esquemas, cálculos, prompt y adaptador de cuota |
| `src/components/ai/` | Asistente visual y estado de configuración |
| `src/components/operations/` | Indicadores, editor de prueba y gráfica |
| `supabase/migrations/` | Snapshots futuros y cuotas del asistente |
| `tests/unit/` | Pruebas automatizadas de las fronteras del servidor |
| `tests/e2e/` | Cambios, persistencia y aislamiento de navegadores |
| `docs/architecture.md` | Proyecto Supabase compartido, accesos y límites de las aplicaciones |
| `docs/deployment.md` | Variables, comprobación de cuotas y pruebas de lanzamiento |

La tabla `demo_sessions` sigue preparada para una futura persistencia por usuario anónimo. Las órdenes del demo actual permanecen en el navegador. La cuota sí necesita persistencia en el servidor.

## Validación de lanzamiento pendiente

- Confirmar Gateway/OIDC, `AI_MODEL` y las variables del proyecto Supabase compartido en el entorno de Vercel que se desplegará.
- Verificar la tabla de cuotas ya reportada, la RPC y sus permisos; aplicar solamente los objetos del demo que falten, sin cambios a Enfoca.
- Ejecutar `pnpm check`, `pnpm test` y `pnpm test:e2e` en un entorno con permisos para iniciar procesos y puertos locales.
- Probar respuestas reales del modelo para las 30 órdenes, una orden modificada y dos visitantes.
- Revisar los recursos públicos del navegador para confirmar que no contienen secretos.
- Desplegar en Vercel después de revisar el resultado y repetir las pruebas con la URL de Preview/producción.

Las variables `NEXT_PUBLIC_*` se incorporan al compilar: cambiar sus valores requiere un nuevo despliegue. La presencia de variables no certifica conectividad; la pantalla indica que la conexión está configurada, y la solicitud real determina si puede usarse.

## Notas de Next.js

Este proyecto usa Next.js 16 con Cache Components y Partial Prefetching. Lee `AGENTS.md` y los documentos incluidos en `node_modules/next/dist/docs/` antes de modificar APIs. No generes fechas, aleatorios ni UUID durante el render: utiliza efectos o manejadores. La interfaz está en español de México; los identificadores están en inglés.
