# Identidad visual de Salazar Consultores

Indicaciones del propietario aplicadas al showroom `/demo` el **2026-11-06**. El perfil personal de `/` conserva su composición y sus estilos propios.

## Colores y superficies

| Uso | Degradado | Texto |
| --- | --- | --- |
| Acentos visuales y contenedores de iconos | `#8cc3fcff` → `#2c80e1ff` | Blanco en los iconos; etiquetas legibles fuera del acento |
| Elementos clave, pestaña activa y botones principales | `#0057b8e6` → `#01172fe6` | Blanco |
| Selección de vista | `#8cc3fcff` → `#2c80e1ff`, borde e indicador lateral | Azul marino `#01172f`, con marca visible y `aria-current` |
| Portada y cierre comercial | Degradado oscuro sobre una base azul marino, con luz y retícula sutiles | Blanco y azul claro para énfasis |
| Tarjetas y encabezado móvil | Fondos claros, bordes suaves, sombras discretas | Azul marino |

El diseño es moderno, futurista y minimalista: paneles redondeados, jerarquía clara y movimiento discreto. Los tokens y estilos están en `src/components/layout/demo-theme.module.css`. Se aplican al layout del demo y sus diálogos; no se escriben sobre los colores globales de la landing personal.

## Material proporcionado

Los recursos están en el bucket público `landing` del proyecto Supabase compartido. Las URLs exactas se centralizan en `src/config/brand.ts`, sin claves, firmas ni consultas de base de datos.

| Archivo | Uso en el demo |
| --- | --- |
| `animo-stairway-720p.webm` | Video de clientes en la primera sección, junto a la presentación del showroom |
| `icon.png` | Icono del sitio en las páginas del demo, definido en metadata |
| `logonew2025-azul.png` | Marca en el encabezado claro |
| `logonew2025-blanco.png` | Marca en los degradados oscuros de portada y contacto |
| `logonew2025-negro.png` | Marca sobre la superficie clara del pie |

La portada usa el video en formato **1:1**, sin recortarlo, con controles para pausar, reproducción silenciosa, bucle y soporte para reproducción dentro de la página en móvil. Precarga metadatos e intenta reproducirse al montar; con movimiento reducido se deja al usuario iniciar la reproducción. Un cambio a movimiento reducido pausa el video y una pausa manual no se reinicia por actualizaciones de datos del demo.

Si el video no carga, muestra un enlace para abrir el archivo. Si un logo falla, se muestra el nombre de la empresa. `SalazarLogo` usa `next/image` con lectura directa de los PNG públicos (`unoptimized`); el video tampoco pasa por el optimizador de imágenes. Se retiró el icono genérico local del demo para que no prevalezca sobre el icono seleccionado.

El favicon se declara mediante `brandIcons` en los metadatos de raíz, perfil y demo, con `type="image/png"`, acceso directo y Apple icon. Su URL incluye una versión para renovar una copia anterior del icono del starter. La ruta convencional `/favicon.ico` responde con una redirección 308 al PNG de Salazar. El archivo sigue siendo público y no necesita claves; después de publicar, verificar el PNG y abrir una pestaña nueva para comprobar el cambio.

El perfil personal sigue exportando `profileAssets` y `profileMedia` con las mismas URLs a través de esta configuración compartida. Su imagen personal y el comportamiento de su bloque de clientes se conservan.

## Contacto comercial confirmado

En escritorio el pie muestra el logo negro, «Estamos para servirte» y cuatro enlaces horizontales. En móvil tiene dos filas: logo enlazado al sitio corporativo y, debajo, correo y WhatsApp. Se retiró la leyenda «Demostración de Salazar Consultores · Todos los datos son ficticios» del pie.

| Enlace | Destino |
| --- | --- |
| Correo | `mailto:info@800salazar.com` |
| Teléfono | `tel:8007252927` |
| WhatsApp | Número internacional `526141282123` y mensaje «Quiero conocer más de software de Salazar Consultores» |
| Sitio corporativo | `https://salazarconsultores.com/` |

Los datos se editan en `src/config/site.ts`. `src/lib/whatsapp.ts` construye la misma URL para el pie y el botón comercial, con el mensaje codificado. El destino es el número indicado por el propietario; ya no depende de `NEXT_PUBLIC_WHATSAPP_NUMBER`. No se envían mensajes automáticamente.

El componente del pie está en `src/components/layout/contact-footer.tsx`. Su información es pública y no requiere variables de entorno nuevas ni modificaciones de Supabase.

## Uso móvil y prevención de errores (poka-yoke)

- Controles y enlaces de contacto con al menos 44 px de altura táctil; campos a 16 px en móvil para evitar el zoom automático de iOS.
- Encabezado compacto y pestañas Operador / Administrador con nombres, iconos, selección visible y navegación por teclado; sin menú lateral ni drawer móvil.
- El editor identifica el folio de la orden. Guardar está deshabilitado hasta editar un campo y vuelve a deshabilitarse tras guardar para evitar escrituras repetidas.
- Los estados completados se deshabilitan si hay actividades obligatorias pendientes y se explica el motivo antes de guardar. La validación del manejador sigue activa como segunda comprobación.
- Restablecer datos requiere confirmación; el botón de confirmación tiene aspecto destructivo y el cuadro se adapta al espacio móvil.
- El asistente conserva el bloqueo de consultas simultáneas, muestra cuándo está analizando y avisa si las órdenes cambiaron después de una respuesta.

## Textos y jerarquía

Mostrar solo lo necesario para elegir, actuar o prevenir un error. Evitar encabezados duplicados, frases comerciales repetidas y explicaciones de controles evidentes. Las sugerencias del asistente tienen etiquetas breves; envían la pregunta completa al seleccionarlas. No mostrar tarjetas de funciones futuras en administración ni operaciones. Integraciones identifica sus opciones como aún no activas y el recorrido describe acciones disponibles.

El «Asistente IA de producción» usa un icono con destellos ocasionales para facilitar su descubrimiento. La animación respeta la preferencia de movimiento reducido y no altera el funcionamiento del asistente.

La conversación muestra como máximo los dos intercambios más recientes mediante burbujas dentro de una tarjeta morada de altura limitada, con burbujas claras y controles de alto contraste. Las sugerencias acompañan al campo de pregunta; la ventana sigue la respuesta al crecer y el campo se mantiene visible cuando el visitante no se desplaza manualmente. Los intercambios se guardan únicamente en memoria del componente y desaparecen al recargar. El intercambio anterior pasa a un tono más tenue y el nuevo aparece con movimiento suave. Se interpreta únicamente la negrita marcada con `**`; el texto se presenta como texto seguro, sin ejecutar HTML. Copiar usa la respuesta completa sin marcadores y reintentar vuelve a consultar con el estado actual de las órdenes. Cada solicitud se analiza de forma independiente: la conversación visual no se envía como historial al modelo ni se guarda en Supabase.

Conservar los nombres de los campos, las etiquetas accesibles, el folio, los errores y motivos de bloqueo, la confirmación de restablecer y el origen de las respuestas. Se retiró del menú el aviso de datos ficticios y guardado local; el asistente sigue identificando las órdenes como ficticias. El pie mantiene los contactos acordados.

## Ayuda interactiva

«Guía de uso» permanece fija en la parte superior derecha del demo; en móvil muestra solo el icono con nombre accesible y en escritorio conserva el texto. La portada añade una segunda entrada animada. Ambos inician el recorrido unificado de siete pasos. El botón amarillo conserva el latido y, ocasionalmente, muestra durante unos segundos «Estoy aquí para ayudarte». El acceso se oculta mientras la guía está activa. Con movimiento reducido permanece amarillo, sin animación. `/demo/recorrido` sigue disponible directamente. Los pasos se configuran en `src/lib/guide/steps.ts`.

«Restablecer demo» aparece en el contenido de la portada y los módulos; se desplaza con la página. No está en el menú lateral ni en el panel móvil. Conserva la confirmación y se deshabilita mientras la guía está activa.

La portada conserva video, guía, una única entrada «Abrir demo» y contacto. La pantalla `/demo/sistema` tiene dos vistas complementarias: Operador con editor y asistente; Administrador con gráfica y configuración. La navegación Demo 1/2/3 se retiró. Ver [demo unificado](demo-workspace.md).

El contorno destaca el objetivo real (`data-guide`), conserva sus controles disponibles y desplaza el contenido para dejar espacio al panel. Se recalcula al desplazar, redimensionar y abrir el teclado móvil usando `visualViewport`. El panel es un diálogo no modal: permite retroceder, omitir, cerrar, usar Escape o llevar el foco al control resaltado. Al cerrar devuelve el foco al acceso a la ayuda; los atributos temporales del objetivo se restauran.

Los pasos de guardar y consultar esperan señales locales emitidas después de una escritura válida o una respuesta recibida. No activan botones, no editan datos ni llaman a la API de IA por sí mismos. Si falla una consulta, el visitante puede reintentar u omitir. Si un objetivo no aparece, se permite omitir y se identifica la situación tras seis segundos. Una navegación mediante enlace o el historial cierra la guía.

La pregunta final «¿Te fue útil?» guarda solo la última opinión y fecha en `localStorage`, clave `salazar-demo:guide-feedback`. No hay analítica remota ni almacenamiento en Supabase. El recorrido se puede repetir desde el principio y funciona aunque el navegador bloquee ese almacenamiento. No se incorpora Floik ni una suscripción externa.

## Verificación

TypeScript, ESLint y las 40 pruebas existentes aprobaron después de aplicar la identidad. El nuevo CSS también se compiló con Lightning CSS en modo CSS Modules. Estos checks no sustituyen una revisión visual de escritorio y móvil ni la comprobación de reproducción real.

Las pruebas de `tests/e2e/demo-mobile.spec.ts` están preparadas para comprobar la altura y alineación del footer, el menú a 320 px, la selección activa, los controles táctiles, el bloqueo del cierre con actividades pendientes, el guardado y la cancelación de restablecer datos. Su ejecución se detuvo antes de abrir el navegador porque el entorno no permite iniciar el servidor en el puerto 3100 (`EPERM`); no se consideran aprobadas.

En esta sesión la red impidió acceder a los archivos públicos de Supabase y al servidor local; el build habitual falló al descargar Geist desde Google Fonts. La documentación del perfil registra verificaciones anteriores de esos recursos, pero su disponibilidad actual debe confirmarse en el navegador o en el despliegue. No se modificaron permisos de Storage ni configuración remota.

Para la guía y el favicon se añadieron pruebas en `tests/e2e/demo-guide.spec.ts`: declaración del icono, flujo completo con guardado real y consulta iniciada por el visitante, opinión local, controles en 320 px, retroceso, omisión, Escape y reapertura sin cambios automáticos. El intento de ejecutarlas volvió a detenerse en `listen EPERM 127.0.0.1:3100`; no se consideran aprobadas. Las 40 pruebas unitarias existentes siguen aprobadas y el CSS de la guía se compiló con Lightning CSS. La disponibilidad actual del PNG no pudo verificarse desde la sesión por un fallo de DNS.
