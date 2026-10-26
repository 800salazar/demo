# Salazar Demo — Soluciones empresariales

Plataforma demostrativa interactiva de **Salazar Consultores** para gerentes de TI, directores de operaciones y responsables de compras de empresas manufactureras. Muestra, en menos de 3 minutos, tres ideas: sistemas **autoadministrables**, **control de operaciones** y **inteligencia artificial** que analiza información real.

Todos los datos son ficticios. No requiere cuentas ni registro: cada visitante tiene su propia demostración, guardada en su navegador.

## Estado del proyecto

Este repositorio contiene el **esqueleto** del proyecto: la pila completa, la navegación, el diseño base, la capa de datos ficticios y la infraestructura de despliegue. Las demostraciones se construyen por fases:

| Fase | Contenido | Estado |
| ---- | --------- | ------ |
| 1 | Estructura, navegación, diseño visual y datos ficticios | Esqueleto listo |
| 2 | Demo 1 · Sistema autoadministrable (prioridades, departamentos, categorías, estados) | Pendiente |
| 3 | Demo 2 · Control de operaciones y dashboard | Pendiente |
| 4 | Demo 3 · Inteligencia artificial conectada a los datos | Pendiente (endpoint base listo) |
| 5 | Integraciones demostrativas (CSV) y recorrido guiado | Pendiente |
| 6 | Pruebas, correcciones y optimización visual | Pendiente |

Lo que ya funciona de verdad:

- Showroom con las tres demos, menú lateral y navegación adaptable a móvil, tablet y escritorio.
- Datos ficticios realistas (6 departamentos, 3 prioridades, 4 estados, 30 órdenes con fechas relativas al momento de iniciar la demo) que persisten en el navegador.
- Botón **Restablecer datos de demostración**, con confirmación, que restaura el escenario original.
- Gráfica de costo real por departamento calculada en vivo con los datos.
- Endpoint `POST /api/ai` con validación, límites de tamaño y de uso. Si no está configurado, el asistente se muestra como **no disponible**; nunca se simulan respuestas de IA.
- Botón de WhatsApp con mensaje precargado y número configurable.

Las pantallas de cada módulo indican con claridad cuándo están «En construcción» y qué incluirán.

## Tecnologías

- [Next.js 16](https://nextjs.org) (App Router, Cache Components) · React 19 · TypeScript
- [Tailwind CSS 4](https://tailwindcss.com) · [shadcn/ui](https://ui.shadcn.com) · [Lucide](https://lucide.dev) · [Recharts](https://recharts.org)
- [OpenAI SDK](https://github.com/openai/openai-node) (solo en el servidor)
- [Supabase](https://supabase.com) (preparado, aún no se usa en la demo) · [Zod](https://zod.dev)
- pnpm · ESLint

## Requisitos

- Node.js **22 o superior**
- [pnpm](https://pnpm.io) 10

## Instalación y ejecución

```bash
pnpm install
cp .env.example .env.local   # opcional: solo necesario para IA, Supabase y WhatsApp
pnpm dev                     # http://localhost:3000
```

Scripts disponibles:

| Comando | Descripción |
| ------- | ----------- |
| `pnpm dev` | Servidor de desarrollo |
| `pnpm build` / `pnpm start` | Compilación y servidor de producción |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | Genera los tipos de rutas y ejecuta TypeScript |
| `pnpm check` | Lint + typecheck + build |

## Variables de entorno

Se definen en `.env.local` (desarrollo) o en *Project Settings → Environment Variables* de Vercel. Ninguna es obligatoria para que la demo funcione.

| Variable | Ámbito | Descripción |
| -------- | ------ | ----------- |
| `OPENAI_API_KEY` | Servidor | API key de OpenAI. Nunca llega al navegador. |
| `OPENAI_MODEL` | Servidor | Modelo a utilizar. Sin esta variable y la anterior, el asistente de IA aparece como no disponible. |
| `NEXT_PUBLIC_SUPABASE_URL` | Público | URL del proyecto de Supabase. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Público | Llave *publishable* de Supabase (pública por diseño). |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Público | Número de contacto en formato internacional, solo dígitos (por ejemplo `521XXXXXXXXXX`). Sin número, WhatsApp abre el mensaje y permite elegir el contacto. |

Las variables `NEXT_PUBLIC_*` se incorporan al compilar: tras cambiarlas en Vercel hay que volver a desplegar.

## Estructura

```
src/
├── app/                      # Rutas (App Router)
│   ├── page.tsx              # Showroom
│   ├── administracion/       # Demo 1
│   ├── operaciones/          # Demo 2
│   ├── ia/                   # Demo 3
│   ├── integraciones/
│   ├── recorrido/            # Recorrido de 3 minutos
│   └── api/
│       ├── ai/route.ts       # POST: asistente de IA (servidor)
│       └── health/route.ts   # GET: estado del despliegue y de Supabase
├── components/
│   ├── ui/                   # shadcn/ui
│   ├── layout/               # Menú lateral, encabezado móvil, marca
│   ├── showroom/             # Tarjetas de demo, panel de datos, restablecer, contacto
│   ├── shared/               # Encabezado de página, etiquetas de color, placeholders
│   ├── admin/ operations/ ai/  # Piezas de cada demo
├── config/site.ts            # Marca, navegación y las tres demos
└── lib/
    ├── demo/                 # Tipos, datos ficticios, persistencia y store reactivo
    ├── ai/                   # Configuración, prompt, validación y límite de uso (solo servidor)
    └── supabase/client.ts    # Cliente de Supabase (preparado)
supabase/
├── config.toml
└── migrations/               # Esquema de la base de datos
```

## Datos de la demostración

- `lib/demo/seed.ts` genera el escenario original. Las fechas son relativas al momento en que se genera, así que los ejemplos siguen siendo útiles con el tiempo.
- `lib/demo/store.ts` mantiene los datos en memoria, los comparte entre las tres demos y los guarda mediante un **adaptador de persistencia** (`lib/demo/persistence.ts`). Hoy el adaptador usa `localStorage`; para usar Supabase basta con implementar el mismo contrato (`load` / `save`) y asignarlo en `store.ts`.
- Los registros usan identificadores estables, de modo que renombrar una prioridad, un departamento o un estado no rompe las relaciones con las órdenes existentes.
- Los indicadores se calculan con el tipo de estado (`pending`, `in_progress`, `completed`), no con su nombre.
- Si los datos guardados están dañados o son de otra versión (`DATA_VERSION`), se regeneran automáticamente.
- Todas las escrituras deben pasar por `updateDemoData`; el restablecimiento es `resetDemoData`.

## Inteligencia artificial

`POST /api/ai` recibe `{ question, context }`, donde `context` son únicamente métricas **ya calculadas** por la aplicación. El servidor:

- usa el SDK oficial de OpenAI, con la API key y el modelo definidos por variables de entorno;
- limita el tamaño del cuerpo (16 KB), de la pregunta (300 caracteres) y de los datos (12 000 caracteres);
- limita el uso por cliente (12 solicitudes cada 10 minutos);
- responde `503` cuando no está configurado, en lugar de simular una respuesta;
- instruye al modelo a usar solo los datos recibidos y a separar datos, análisis y recomendaciones.

El límite de uso vive en memoria de cada instancia, por lo que es un freno básico, no una garantía. Configura además un **límite mensual de gasto** en tu cuenta de OpenAI.

## Supabase

La demo actual **no depende de Supabase**: persiste en el navegador. La migración `supabase/migrations/*_init_demo_sessions.sql` deja listo el esquema para guardar un snapshot por visitante (autenticación anónima), con RLS por propietario y sin acceso para el rol `anon`.

```bash
supabase login
supabase link --project-ref <ref-del-proyecto>
supabase db push
```

Después agrega `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` en Vercel. `GET /api/health` indica si Supabase está configurado y migrado, sin exponer secretos.

## Despliegue en Vercel

1. Importa el repositorio en [vercel.com/new](https://vercel.com/new) (Framework: Next.js; se detecta pnpm automáticamente).
2. Agrega las variables de entorno que necesites (ver tabla anterior).
3. Despliega. Cada `git push` a `main` publica una nueva versión de producción.

Con la CLI: `vercel link`, `vercel env add <NOMBRE> production` y `vercel --prod`.

## Notas para quien continúe el desarrollo

- Este proyecto usa Next.js 16 con **Cache Components** y **Partial Prefetching** activados. No llames a `Date.now()`, `new Date()`, `Math.random()` ni `crypto.randomUUID()` durante el render; hazlo en efectos o manejadores de eventos. Lee `AGENTS.md` y la documentación incluida en `node_modules/next/dist/docs/` antes de modificar APIs de Next.
- En `error.tsx` la propiedad para reintentar se llama `retry`.
- Los componentes de shadcn/ui se agregan con `pnpm dlx shadcn@latest add <componente>`.
- La interfaz está en español (México); el código y los identificadores, en inglés.

## Limitaciones conocidas

- Las demostraciones de las fases 2 a 5 aún no están construidas.
- Los datos viven en el navegador: cambiar de navegador o borrar los datos del sitio devuelve el escenario original.
- La respuesta real del asistente de IA no se ha probado con una API key; el endpoint se verificó en sus validaciones y límites.
- No hay pruebas automatizadas todavía.
