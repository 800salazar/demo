# Arquitectura de Enfoca y Salazar Demo

Decisión confirmada por el propietario el **2026-10-27**. Esta es la referencia para el desarrollo y las operaciones del repositorio.

## Un único proyecto Supabase

Enfoca y Salazar Demo utilizan el mismo proyecto Supabase. Compartir el proyecto es una decisión explícita; separar bases o crear otro proyecto no es un requisito del demo.

| Dato | Valor |
| --- | --- |
| Referencia del proyecto | `acwlzsofiqdaxmwpyczu` |
| URL | `https://acwlzsofiqdaxmwpyczu.supabase.co` |
| Aplicación privada | Enfoca, de uso exclusivo de Adán |
| Aplicación pública | Salazar Demo, para que visitantes prueben demostraciones de proyectos |

La referencia y la URL identifican el proyecto; no son credenciales. No guardar claves reales en esta documentación.

## Dominio y separación de las páginas

El despliegue de este repositorio usa el dominio `salazar.red` asignado por el propietario en Vercel. La landing y el showroom son secciones distintas del mismo despliegue; no hace falta cambiar el proyecto Supabase para organizar sus URLs.

| Ubicación | Función |
| --- | --- |
| `salazar.red/` · `src/app/(landing)/` | Perfil profesional de Adán Salazar y herramienta de conferencia para estudiantes en `#conferencia`, con identidad azul y layout propio. No monta datos ni navegación de Demo o Enfoca. |
| `salazar.red/demo` · `src/app/demo/` | Showroom público, sus módulos, su navegación y sus APIs |
| `src/app/layout.tsx` | Estructura HTML, fuentes y estilos generales; no monta el menú ni los datos del demo |
| `src/app/demo/layout.tsx` | Menú, marca, pie de demostración y notificaciones, exclusivos de `/demo` |

Los enlaces del showroom permanecen bajo `/demo`, incluido el regreso al inicio. La landing no monta el store del demo ni lo promueve mediante enlaces o contenido. El estado sigue usando la clave existente `salazar-demo:data` de `localStorage`; cambiar la ruta conserva los datos anteriores en ese mismo navegador y origen.

La landing usa contenido público estático en `src/config/profile.ts`, CSS Modules y componentes de servidor. El menú, la impresión y la alternativa visual al fallar una imagen usan componentes de cliente. Sus fotos y logotipos se sirven desde archivos explícitos del bucket `landing` del proyecto compartido. No consulta tablas de Supabase ni requiere credenciales o migraciones adicionales. El contacto abre el cliente de correo; no almacena ni envía formularios desde el servidor. La lectura pública de los archivos de Storage sigue pendiente de confirmar. Ver [edición del perfil](profile.md).

El recurso `#conferencia` es un componente de cliente para elegir un prompt, completar tres datos y copiar texto al portapapeles. Los datos solo viven en el estado de React; no se guardan en disco, `localStorage` ni Supabase. No llama al endpoint de IA del demo. El alumno adjunta sus archivos y envía el prompt directamente en la IA externa que elija.

No configurar un `basePath` global ni una redirección desde `/` al showroom. `src/config/routes.ts` centraliza las URLs; `next.config.ts` redirige únicamente las antiguas páginas y endpoints del demo. La existencia del código local no confirma que esta nueva estructura ya esté publicada: requiere desplegar la versión actualizada.

## Responsabilidades y datos

| Componente | Información y acceso previstos |
| --- | --- |
| Enfoca | Información personal del propietario: tareas, metas, áreas, proyectos, etiquetas y planeación semanal. Su acceso se conserva privado. |
| Navegador de un visitante del demo | Órdenes y catálogos ficticios propios de su demostración, guardados en `localStorage`. No requiere cuenta de Enfoca. |
| `POST /demo/api/ai` | Recibe el snapshot operativo actual del visitante, valida su estructura y recalcula métricas. No consulta información de Enfoca. |
| Modelo en AI Gateway | Recibe la pregunta, las métricas y las órdenes ficticias de esa solicitud. No recibe claves, sesiones, datos de Enfoca ni herramientas de base de datos. |
| RPC `consume_demo_ai_quota(text)` | Actualiza exclusivamente los contadores de `public.demo_ai_usage`. No almacena órdenes, preguntas ni respuestas. |
| `GET /demo/api/health` | Usa la clave publishable para comprobar `demo_sessions`, una tabla prevista para persistencia futura. Esa comprobación no certifica que la RPC de cuotas esté lista. |

En el esquema compartido por el propietario aparecen tablas de Enfoca como `profiles`, `areas`, `projects`, `tags`, `goals`, `tasks`, `task_tags`, `task_goals`, `daily_focus` y las tablas `week_*`. No son fuentes para el asistente del demo y no deben modificarse como parte de su implementación.

## Límites del código

- Mantener consultas y nombres de objetos explícitos. El cliente no puede elegir una tabla, una función SQL ni una consulta para que el servidor la ejecute.
- No añadir herramientas de lectura o escritura de Enfoca al asistente público.
- No compartir snapshots, conversaciones ni respuestas entre visitantes. La respuesta identifica si proviene de IA o de cálculos del sistema.
- Conservar la autenticación, los permisos y las políticas de Enfoca. Los cambios del demo se limitan a sus propios objetos.
- La clave secret del proyecto tiene privilegios amplios y omite RLS. Por tanto, la restricción a cuotas está en el código del servidor; no debe describirse como una clave con permisos limitados exclusivamente a una tabla.
- Las claves permanecen en el servidor. No incluirlas en `NEXT_PUBLIC_*`, respuestas HTTP, registros de errores ni contexto del modelo.

El hecho de compartir proyecto no concede acceso desde el navegador del demo a Enfoca. Tampoco constituye por sí mismo una prueba de sus políticas: cualquier afirmación de seguridad verificada debe apoyarse en comprobaciones del despliegue y de los permisos reales.

## Objetos del demo y estado conocido

| Objeto | Estado documentado |
| --- | --- |
| `public.demo_ai_usage` | Presente en el esquema compartido por el propietario el 2026-10-27. No se ha inspeccionado directamente con la conexión disponible. |
| `public.consume_demo_ai_quota(text)` | Definida en la migración del repositorio; existencia y permisos remotos pendientes de confirmar. |
| `public.demo_sessions` | Definida en la migración inicial para una función futura; no aparece en el esquema compartido. No asumir que está creada ni usarla como requisito para analizar las órdenes locales. |

Un esquema exportado para contexto no es una migración ejecutable y no incluye necesariamente funciones, permisos o políticas. No recrear las tablas de Enfoca ni repetir `CREATE TABLE demo_ai_usage` por asumir que falta.

## Configuración

Las variables preferidas son `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` y `SUPABASE_SECRET_KEY`; todas corresponden al mismo proyecto compartido. El código conserva los nombres anteriores `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` como respaldo, con prioridad para los nuevos.

El modelo seleccionado para las pruebas gratuitas es `nvidia/nemotron-3.5-lightning-free`. El endpoint gratuito es para pruebas con datos ficticios y el proveedor puede registrar entradas y salidas. La disponibilidad y la gratuidad deben verificarse antes del lanzamiento; no hay garantía de permanencia. No configurar un modelo de pago como alternativa automática sin decisión del propietario.

Ver [despliegue y verificaciones](deployment.md) para los pasos operativos y [README](../README.md) para el contrato del asistente.
