# Despliegue y verificación de Salazar Demo

Esta guía conserva la arquitectura acordada: **Salazar Demo y Enfoca comparten el proyecto Supabase `acwlzsofiqdaxmwpyczu`**. Ver [arquitectura](architecture.md). No crear otro proyecto ni cambiar la configuración de acceso de Enfoca para desplegar el demo.

## Dominio de publicación

El propietario indicó que `salazar.red` ya está asignado al proyecto en Vercel. La versión de este repositorio debe servir la landing independiente en `/` y el showroom en `/demo`, con la IA en `/demo/ia` y sus endpoints en `/demo/api/*`.

No cambiar el dominio a otro proyecto ni configurar un `basePath` global. El cambio se implementa con carpetas y layouts del App Router dentro del despliegue existente. La raíz contiene el perfil profesional de Adán Salazar, con contenido público estático y diseño azul inspirado en `layout2`. No requiere nuevas variables ni migraciones de Supabase. Ver [edición del perfil](profile.md).

Se conservan redirecciones HTTP 307 desde `/administracion`, `/operaciones`, `/ia`, `/recorrido`, `/integraciones`, `/api/ai` y `/api/health` a sus equivalentes bajo `/demo`. Este estado debe comprobarse en la versión desplegada; no se han modificado ajustes remotos de Vercel desde esta sesión.

## Variables por entorno

Las variables de la versión publicada se configuran en **Vercel → proyecto Salazar Demo → Settings → Environment Variables**. Seleccionar Production y, si se utilizará, Preview. Development sirve para el desarrollo local vinculado a Vercel; `.env.local` solo configura la ejecución en la computadora.

| Variable | Valor o finalidad | Requisito |
| --- | --- | --- |
| `AI_MODEL` | `nvidia/nemotron-3.5-lightning-free` para las pruebas gratuitas acordadas | Obligatoria para generar respuestas con IA |
| `AI_GATEWAY_API_KEY` | Clave de Vercel AI Gateway | Necesaria si no se usa OIDC |
| `VERCEL_OIDC_TOKEN` | Autenticación alternativa de Vercel | Alternativa a la clave; no es necesario configurar ambos métodos |
| `SUPABASE_URL` | `https://acwlzsofiqdaxmwpyczu.supabase.co` | Obligatoria para la cuota persistente |
| `SUPABASE_SECRET_KEY` | Clave privada del proyecto compartido | Obligatoria para la RPC de cuotas en el código actual; solo servidor |
| `SUPABASE_PUBLISHABLE_KEY` | Clave pública del mismo proyecto | Usada por la comprobación de salud; no sustituye a la clave privada para cuotas |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Contacto comercial en formato internacional, solo dígitos | Opcional |

No colocar valores reales de claves en documentación, commits o capturas. Cambiar las variables en Vercel requiere un nuevo despliegue para que esa versión utilice la configuración actualizada. Los nombres anteriores `NEXT_PUBLIC_SUPABASE_*` se admiten como respaldo para URL y publishable key; no hace falta duplicarlos.

## Verificar los objetos existentes

El propietario ya compartió un esquema que contiene `demo_ai_usage`. Antes de ejecutar una migración, comprobar la tabla y la función en **SQL Editor del proyecto compartido**. Estas consultas solo leen metadatos:

```sql
select
  to_regclass('public.demo_ai_usage') as quota_table,
  to_regprocedure('public.consume_demo_ai_quota(text)') as quota_function;
```

Un valor `null` indica que ese objeto no se encuentra con ese nombre o firma. Si la tabla existe y la función no, falta completar la función y sus permisos; no repetir el `CREATE TABLE`.

Para revisar RLS y el acceso de los roles a los objetos del demo:

```sql
select
  c.relrowsecurity as rls_enabled,
  has_table_privilege('anon', c.oid, 'SELECT, INSERT, UPDATE, DELETE') as anon_has_access,
  has_table_privilege('authenticated', c.oid, 'SELECT, INSERT, UPDATE, DELETE') as authenticated_has_access
from pg_class c
where c.oid = to_regclass('public.demo_ai_usage');

select
  p.oid::regprocedure as quota_function,
  p.prosecdef as security_definer,
  has_function_privilege('anon', p.oid, 'EXECUTE') as anon_can_execute,
  has_function_privilege('authenticated', p.oid, 'EXECUTE') as authenticated_can_execute,
  has_function_privilege('service_role', p.oid, 'EXECUTE') as server_can_execute
from pg_proc p
where p.oid = to_regprocedure('public.consume_demo_ai_quota(text)');
```

El diseño del repositorio espera RLS activado, acceso denegado a `anon` y `authenticated` tanto para la tabla como para la función, ejecución permitida a `service_role` y `security_definer = false`. Si una consulta no devuelve filas, comprobar primero la existencia del objeto. Estas comprobaciones no modifican las tablas ni las políticas de Enfoca.

La conexión disponible en esta conversación devolvió falta de permisos para inspeccionar el proyecto. No considerar verificadas la RPC ni sus políticas por la sola presencia del archivo de migración.

## Aplicar únicamente lo que falte

- Revisar las migraciones del repositorio y el historial remoto antes de ejecutar SQL o `supabase db push` sobre el proyecto compartido.
- La migración `supabase/migrations/20261026225631_ai_usage_limits.sql` contiene la definición de las cuotas. Si parte de ella ya está aplicada, preparar solamente los cambios faltantes sobre los objetos del demo.
- No ejecutar el esquema completo exportado para contexto: incluye tablas de Enfoca y no está destinado a ejecutarse como migración.
- No aplicar la migración inicial de `demo_sessions` como requisito para la IA: las órdenes siguen en `localStorage`.
- No ejecutar `supabase/tests/ai_usage_limits.sql` en la base compartida en uso. Está destinada a una base de pruebas desechable y modifica temporalmente sus contadores aunque finalmente haga rollback.

## Publicar el código actualizado

1. Ejecutar `pnpm test`, `pnpm typecheck`, `pnpm lint` y `pnpm build` en un entorno que permita la compilación.
2. Subir los cambios del repositorio mediante el flujo de Git utilizado por el propietario, o desplegar explícitamente los archivos locales con la CLI vinculada al proyecto correcto.
3. Generar un nuevo deployment de Vercel con esos cambios y las variables del entorno elegido. Un Redeploy de una versión anterior no incorpora modificaciones locales sin subir.
4. Confirmar que la compilación de Vercel termina correctamente antes de dar por publicado el cambio.

Estado registrado el **2026-10-27**, después de trasladar el showroom a `/demo`: se aprobaron **40 pruebas automatizadas, TypeScript y ESLint**. Las pruebas incluyen las redirecciones ejecutadas con las utilidades de Next.js, la selección del menú, los cálculos y el endpoint de IA con dobles de los servicios externos. La compilación local siguió bloqueada por la restricción de abrir el puerto interno de Turbopack. Las pruebas de navegador requieren un servidor local, también bloqueado por el entorno; un intento anterior de compilación con webpack no pudo resolver Google Fonts. No equivale a una certificación del build de Vercel ni a una prueba real del proveedor de IA.

Después de implementar el perfil personal, las mismas 40 pruebas, TypeScript y ESLint vuelven a pasar. La compilación alternativa con webpack y fuentes locales de prueba terminó correctamente, incluida la página raíz y la portada Open Graph. El build habitual de Turbopack, las pruebas de navegador y la lectura pública de los archivos de `landing` continúan pendientes por las restricciones descritas en [verificación del perfil](profile.md#verificación-del-2026-10-27). No se publicó un deployment desde esta sesión.

## Prueba funcional del despliegue

| Prueba | Resultado esperado |
| --- | --- |
| Abrir `https://salazar.red/` | Perfil de Adán Salazar, navegación entre secciones y contacto por correo; sin contenido del demo ni redirección al showroom |
| Abrir la raíz en celular | Tarjeta de perfil adaptable y menú inferior desplegable; sin desplazamiento horizontal |
| Comprobar los recursos de `landing` sin iniciar sesión | Foto `yo.jpeg`, icono y logotipos públicos accesibles; no se necesitan claves para servirlos |
| Pulsar «Imprimir perfil» | Diálogo de impresión con una versión clara del perfil, apta para guardar como PDF |
| Abrir `https://salazar.red/demo` y navegar entre módulos | Todos los enlaces del showroom permanecen bajo `/demo`; «Inicio» vuelve al showroom |
| Entrar por un enlace anterior como `/ia` | Redirige a `/demo/ia` |
| Abrir una URL inexistente bajo `/demo` | Muestra el error del demo y permite volver a `/demo` |
| Consultar `/demo/ia` por órdenes retrasadas | Respuesta basada en las órdenes ficticias del visitante |
| Comprobar el origen de la respuesta | La interfaz muestra «Respuesta generada con IA»; en `/demo/api/ai`, `source` vale `ai` |
| Modificar el costo de una orden y volver a consultar | La siguiente respuesta refleja el nuevo costo |
| Abrir otro navegador o una ventana incógnita | Mantiene su propio escenario, sin copiar los cambios del primer visitante |
| Pedir información de Enfoca | El asistente explica su alcance; no consulta ni devuelve información privada |
| Alcanzar la cuota en un entorno de pruebas | HTTP 429 con `Retry-After`, sin llamadas adicionales al modelo |
| Revisar la solicitud y los recursos del navegador | No aparecen claves privadas, sesiones ni datos de Enfoca |

La etiqueta «Resumen calculado · Sin generación de IA» significa que esa consulta utilizó la alternativa del sistema. El campo `reason` permite distinguir `ai_not_configured`, `quota_unavailable`, `ai_empty` y `ai_error`; una respuesta HTTP 200 por sí sola no confirma que el modelo haya respondido.

El endpoint `/demo/api/health` comprueba el esquema previsto para snapshots con la clave publishable. Su campo `supabase.schemaReady` no certifica que `consume_demo_ai_quota` exista, y que `demo_sessions` todavía no esté creada no impide analizar las órdenes locales si las cuotas y Gateway están operativos.
