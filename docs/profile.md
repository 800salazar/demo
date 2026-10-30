# Perfil profesional de Adán Salazar

La raíz `https://salazar.red/` es una landing personal breve, con perfil lateral y una estructura reducida a cuatro secciones: **Conferencia, Perfil, Qué hago y Contacto**. Usa Next.js, CSS Modules y la identidad azul inspirada en `layout2`.

La versión minimalista concentra la presentación en «Expertos en **Soluciones Digitales**», el logotipo blanco de Salazar Consultores, un botón al sitio corporativo y tres iconos de sus redes. Continúan tres especialidades con una frase cada una. El cierre «Conectemos ideas 💡» enlaza al LinkedIn personal de Adán. Se retiraron los bloques de filosofía, proceso, trayectoria por responsabilidades, listas de herramientas y mensajes repetidos. La foto y el logotipo aparecen una sola vez.

Debajo del perfil, la tarjeta **Sobre mí** reúne una presentación breve, formación, habilidades, idiomas y accesos personales a LinkedIn y correo. Sus textos se editan en `src/config/profile.ts`; muestra español (nativo) e inglés. En escritorio aparece como tarjeta lateral; en móvil se despliega con «Ver más» dentro de la tarjeta del perfil.

El fondo usa un degradado diagonal de `#0057b8e6` a `#071a39`, con base azul marino para el canal alfa. La carga inicial usa el mismo fondo.

El bloque «Clientes», dentro de «Qué hago», reproduce `animo-stairway-720p.webm` directamente desde Storage. Se carga al acercarse al viewport, con reproducción silenciosa, bucle y controles nativos para pausarlo. Con movimiento reducido solo se precargan metadatos y el usuario inicia la reproducción. El video se omite en impresión.

## Recurso para la conferencia

La herramienta para estudiantes aparece al principio de `/`, antes de la presentación personal. Se puede compartir `https://salazar.red/#conferencia` o abrir `http://localhost:3000/` durante el desarrollo. El menú incluye «Conferencia».

- **Camino 1 · Ya tengo avances:** copiar el prompt de auditoría, abrir la IA elegida, adjuntar allí los archivos y pegar el texto. Una ayuda desplegable explica los cuatro tipos de documentos sugeridos.
- **Camino 2 · Solo tengo una idea:** completar producto, ciudad/zona y presupuesto. «Copiar prompt» incorpora esos datos. Se permiten presupuestos escritos como `$0 MXN` o un rango; la IA debe adaptar el plan a lo indicado.

Se muestra un solo camino a la vez y el prompt completo queda en un desplegable. El botón solo confirma la copia cuando la API del portapapeles responde correctamente. Si no está disponible o se deniega, aparece un campo de texto seleccionable para copiar manualmente.

Los tres datos se conservan únicamente en el estado de la página mientras está abierta. No hay carga local de archivos, llamadas al modelo, escritura en `localStorage`, registros de estudiantes ni acceso adicional a Supabase. Los archivos del camino 1 se adjuntan en la IA que el estudiante elija.

Editar los prompts en `src/lib/conference/prompts.ts`; la interfaz está en `src/components/conference/conference-toolkit.tsx` y `conference.module.css`. La impresión del CV omite esta herramienta. Las pruebas de navegador de `tests/e2e/conference.spec.ts` cubren copia real, respuestas insertadas, validación, cambio de camino y portapapeles denegado.

La regla de Tailwind en `next.config.ts` se limita a `globals.css`. No ampliarla a `*.css`: el loader renombraba los archivos `.module.css` como CSS global, dejaba vacíos sus exports y la página perdía todas las clases del perfil y de la conferencia. CSS Modules debe conservar el tratamiento nativo de Next.js.

## Navegación liquid glass y carga de contenido

El menú flota sobre el contenido: dock horizontal inferior en escritorio y menú desplegable inferior en móvil. Usa un tinte azul transparente, `backdrop-filter: blur(26px) saturate(180%)`, bordes con brillo y una selección translúcida. Los valores están en `.navigationShell` de `profile.module.css`; `--glass-tint` controla la transparencia. Hay una superficie opaca de respaldo si el navegador no admite desenfoque o el usuario pide reducir transparencia.

`ProfileNavigation` se monta fuera del `aside` y de cualquier contenedor con `transform`, `filter` u opacidad de revelado. Esto mantiene el dock fijo al viewport y por encima de las secciones, permitiendo que el contenido pase realmente por detrás. El menú no aparece en la impresión del CV.

El patrón skeleton con pulso y revelado vive en `src/components/motion/skeleton-reveal.tsx` y `skeleton-reveal.css`. Sus clases globales están prefijadas con `.t-`; solo se importa en el layout de la landing. Los tokens locales son:

| Variable | Valor inicial |
| --- | --- |
| `--t-skeleton-duration` | `320ms` |
| `--t-skeleton-easing` | `cubic-bezier(.22, 1, .36, 1)` |
| `--t-skeleton-distance` | `8px` |
| `--t-skeleton-blur` | `6px` |
| `--t-skeleton-scale` | `.985` |
| `--t-skeleton-pulse-duration` | `1200ms` |

La página cambia de placeholder a contenido al hidratar; las imágenes lo hacen al terminar su carga o al mostrarse la alternativa por error. No hay un temporizador para retrasar contenido que ya está listo. La geometría del contenido se conserva para evitar saltos. `src/app/(landing)/loading.tsx` proporciona también el fallback de una carga real del segmento de Next.js. El movimiento reducido elimina pulso, desplazamiento y desenfoque de la transición; la impresión y la variante sin JavaScript muestran el contenido directamente.

Referencia solicitada: https://transitions.dev/detail.html?t=skeleton-loader-and-reveal. Se intentó usar `npx transitions-dev add skeleton-loader-and-reveal --help`, pero npm no pudo resolver el registro. Después la revisión de permisos del navegador rechazó abrir transitions.dev. Por tanto, el código integrado es una implementación local del comportamiento público descrito —pulso y transición hacia el contenido—, no el fragmento oficial ni sus tokens exactos. No se instaló una skill ni una dependencia de transitions.dev.

Verificación de esta actualización: menú abierto y navegación probados en móvil y escritorio, desenfoque confirmado en estilos calculados, dock por encima del contenido, sin desbordamiento horizontal y estados de carga completados. Se comprobó la copia del prompt después del revelado y no hubo errores en la consola de esa revisión. ESLint, TypeScript, 40 pruebas unitarias y la compilación alternativa con webpack y fuentes de prueba aprobaron. El build habitual y el runner E2E conservan las limitaciones del entorno descritas abajo.

## Editar contenido

- `src/config/profile.ts`: nombre, cargo, LinkedIn personal, habilidades, tres especialidades y las cuatro entradas de navegación. `companySocialLinks` contiene las redes de la empresa; `profileMedia` contiene el video.
- `src/app/(landing)/page.tsx`: composición y textos editoriales de cada sección.
- `src/components/profile/profile.module.css`: identidad azul, diseño adaptable y versión de impresión.
- `src/components/profile/profile-navigation.tsx`: menú activo por desplazamiento, navegación móvil e impresión.
- `src/app/(landing)/opengraph-image.tsx`: portada para compartir exclusiva de la landing. El favicon usa `profileAssets.icon`.

El propietario proporcionó los siguientes recursos del bucket `landing` del proyecto Supabase compartido:

| Archivo | Uso |
| --- | --- |
| `yo.jpeg` | Foto de perfil, sin duplicación en el contenido |
| `icon.png` | Favicon de la landing |
| `logonew2025-blanco.png` | Logotipo bajo el título principal; el botón contiguo abre el sitio corporativo |
| `logonew2025-azul.png` y `logonew2025-negro.png` | Variantes disponibles en `profileAssets` para futuras superficies claras |
| `animo-stairway-720p.webm` | Video de logos en «Clientes», servido directamente al navegador |

Las URLs se definen explícitamente en `profileAssets` y `profileMedia`, con la base `https://acwlzsofiqdaxmwpyczu.supabase.co/storage/v1/object/public/landing/`. Next.js permite optimizar únicamente las cinco imágenes mediante `images.remotePatterns`; el video no pasa por el optimizador. No hay un proxy abierto para otros buckets. Los recursos deben ser públicamente legibles para mostrarse a visitantes. No se han modificado permisos de Storage ni políticas de Enfoca.

En el servidor local del usuario se confirmó la carga del retrato y del logotipo, y la reproducción del video sin error: 720 × 720, duración aproximada de 20 segundos, silenciado. Esto verifica los recursos mostrados por la página local; la disponibilidad desde el despliegue de producción aún requiere comprobación. La URL del dashboard no sirve como `src` de un recurso público.

Si una imagen falla, el retrato muestra las iniciales AS y el logotipo muestra el nombre de la empresa. También es posible usar una imagen local aprobada en `public/profile/` asignando su ruta a `profile.photo`, o volver a `null` para usar solo las iniciales. No usar fotos de la persona ficticia de la plantilla.

El propietario indicó el contacto personal https://www.linkedin.com/in/adansalazarr y las redes de la empresa: Facebook e Instagram `salcon.ia`, y LinkedIn `company/salcon.ia`. Estos enlaces y el botón a https://salazarconsultores.com/ abren otra pestaña con `rel="noopener noreferrer"`. Las redes corporativas muestran solo iconos, con nombres accesibles. No se envían mensajes ni se guardan contactos en Supabase.

No se publican años de experiencia personal, estudios, premios, certificaciones personales, testimonios ni casos de clientes sin información confirmada. Los prompts completos permanecen en desplegables para mantener sencilla la interfaz de la conferencia.

## Despliegue y aislamiento

La landing funciona en el proyecto Vercel existente. Obtiene imágenes públicas de Storage, sin claves ni cliente Supabase. No requiere variables nuevas ni cambios de base de datos. Conserva la arquitectura compartida de Enfoca y Demo; no importa sus stores ni clientes de datos y no inicializa `salazar-demo:data`.

`layout2/` se conserva como referencia fuera de TypeScript, ESLint y las subidas con la CLI de Vercel (`.vercelignore`). No es necesario instalar sus dependencias. Las rutas y APIs del showroom permanecen bajo `/demo`; la landing no enlaza hacia ellas.

«Imprimir perfil» abre el diálogo del navegador con estilos claros de impresión. Desde ahí puede elegirse guardar como PDF. No se anuncia la descarga de un archivo inexistente.

Antes de publicar: revisar los textos personales y el correo elegido, ejecutar las verificaciones del repositorio y comprobar escritorio, celular, navegación por teclado y vista de impresión en el entorno desplegado. La presencia del código local no significa que ya esté publicado en producción.

## Verificación del 2026-10-27

- ESLint y TypeScript aprobados; las 40 pruebas unitarias existentes pasan.
- Compilación alternativa con webpack aprobada, incluida la generación estática de `/` y la portada Open Graph. Para esa comprobación se proporcionaron fuentes Geist ya incluidas en Next.js mediante fixtures temporales; no se cambió la configuración de fuentes de la aplicación.
- `pnpm build` con Turbopack no pudo completar en este entorno: la red bloqueó Google Fonts y, al usar fuentes de prueba, el proceso interno no pudo abrir su puerto (`EPERM`). Esto no certifica el build habitual de Vercel.
- La página pudo revisarse en el servidor que el usuario ya tiene abierto: navegación móvil y de escritorio, ausencia de desbordamiento horizontal, carga de foto y logotipo y reproducción del video de clientes. El entorno de ejecución de comandos no puede abrir su propio servidor.
- El despliegue real y la vista de impresión siguen pendientes. No se modificó configuración remota ni permisos.

Verificación posterior de la conferencia, en el servidor del usuario abierto en `http://localhost:3000/`: se probaron los dos caminos en navegador, la validación de campos y la copia real al portapapeles. El prompt de idea incluyó correctamente producto, ciudad y presupuesto; el de auditoría incluyó el análisis completo. Se comprobaron vistas de 334 × 634 y 1280 × 900 sin desbordamiento horizontal, y se confirmó la carga de las clases CSS Modules después de corregir la regla de Tailwind. ESLint, TypeScript y las 40 pruebas existentes pasan; la compilación alternativa de webpack vuelve a aprobarse con las fuentes de prueba descritas arriba. Las tres pruebas E2E nuevas están preparadas; su runner no se ejecutó porque este entorno no puede abrir su propio servidor. La alternativa de copia manual se mantiene pendiente de una prueba automatizada con permisos denegados.

La revisión final de contenido confirmó en escritorio y móvil el título con «Soluciones Digitales» en negritas, la carga del logotipo bajo el título, las tres redes corporativas sin texto visible y sus nombres accesibles, y el cierre con el LinkedIn personal indicado. La tarjeta de seis habilidades aparece solo en escritorio. Los cinco destinos coinciden con las URLs proporcionadas y no se abrieron para enviar mensajes. ESLint, TypeScript, las 40 pruebas y el build alternativo con webpack aprobaron tras estos cambios.
