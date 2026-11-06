# Identidad visual de Salazar Consultores

Indicaciones del propietario aplicadas al showroom `/demo` el **2026-11-06**. El perfil personal de `/` conserva su composición y sus estilos propios.

## Colores y superficies

| Uso | Degradado | Texto |
| --- | --- | --- |
| Acentos visuales y contenedores de iconos | `#8cc3fcff` → `#2c80e1ff` | Blanco en los iconos; etiquetas legibles fuera del acento |
| Elementos clave, fondo del menú lateral y botones principales | `#0057b8e6` → `#01172fe6` | Blanco |
| Sección activa del menú | `#8cc3fcff` → `#2c80e1ff`, borde e indicador lateral | Azul marino `#01172f`, con marca visible y `aria-current` |
| Portada y cierre comercial | Degradado oscuro sobre una base azul marino, con luz y retícula sutiles | Blanco y azul claro para énfasis |
| Tarjetas y encabezado móvil | Fondos claros, bordes suaves, sombras discretas | Azul marino |

El diseño es moderno, futurista y minimalista: paneles redondeados, jerarquía clara y movimiento discreto. Los tokens y estilos están en `src/components/layout/demo-theme.module.css`. Se aplican al layout del demo y al menú móvil que se monta en un portal; no se escriben sobre los colores globales de la landing personal.

## Material proporcionado

Los recursos están en el bucket público `landing` del proyecto Supabase compartido. Las URLs exactas se centralizan en `src/config/brand.ts`, sin claves, firmas ni consultas de base de datos.

| Archivo | Uso en el demo |
| --- | --- |
| `animo-stairway-720p.webm` | Video de clientes en la primera sección, junto a la presentación del showroom |
| `icon.png` | Icono del sitio en las páginas del demo, definido en metadata |
| `logonew2025-azul.png` | Marca en el encabezado móvil claro |
| `logonew2025-blanco.png` | Marca en el menú lateral, el panel móvil y los degradados oscuros de portada y contacto |
| `logonew2025-negro.png` | Marca sobre la superficie clara del pie |

La portada usa el video en formato **1:1**, sin recortarlo, con controles para pausar, reproducción silenciosa, bucle y soporte para reproducción dentro de la página en móvil. Precarga metadatos e intenta reproducirse al montar; con movimiento reducido se deja al usuario iniciar la reproducción. Un cambio a movimiento reducido pausa el video y una pausa manual no se reinicia por actualizaciones de datos del demo.

Si el video no carga, muestra un enlace para abrir el archivo. Si un logo falla, se muestra el nombre de la empresa. `SalazarLogo` usa `next/image` con lectura directa de los PNG públicos (`unoptimized`); el video tampoco pasa por el optimizador de imágenes. Se retiró el icono genérico local del demo para que no prevalezca sobre el icono seleccionado.

El favicon se declara mediante `brandIcons` en los metadatos de raíz, perfil y demo, con `type="image/png"`, acceso directo y Apple icon. Su URL incluye una versión para renovar una copia anterior del icono del starter. La ruta convencional `/favicon.ico` responde con una redirección 308 al PNG de Salazar. El archivo sigue siendo público y no necesita claves; después de publicar, verificar el PNG y abrir una pestaña nueva para comprobar el cambio.

El perfil personal sigue exportando `profileAssets` y `profileMedia` con las mismas URLs a través de esta configuración compartida. Su imagen personal y el comportamiento de su bloque de clientes se conservan.

## Contacto comercial confirmado

El pie de todas las pantallas muestra el logo negro, «Estamos para servirte» y los cuatro enlaces de contacto dispuestos horizontalmente. El diseño es compacto; en móvil permite que los contactos se repartan en las filas necesarias sin desbordarse ni convertirse en una columna de bloques. Se retiró la leyenda «Demostración de Salazar Consultores · Todos los datos son ficticios» del pie.

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
- Menú lateral y panel móvil con fondo degradado oscuro. La selección tiene otro degradado, texto de alto contraste, marca de verificación, borde e indicador lateral; no depende únicamente del color. El contraste mínimo del texto activo contra los extremos del degradado es aproximadamente 4.53:1.
- Panel móvil limitado al ancho y alto visibles, con áreas seguras, navegación desplazable y botón de cierre de 44 px. Se cierra al elegir una sección y conserva los comportamientos de foco y Escape del diálogo.
- El editor identifica el folio de la orden. Guardar está deshabilitado hasta editar un campo y vuelve a deshabilitarse tras guardar para evitar escrituras repetidas.
- Los estados completados se deshabilitan si hay actividades obligatorias pendientes y se explica el motivo antes de guardar. La validación del manejador sigue activa como segunda comprobación.
- Restablecer datos requiere confirmación; el botón de confirmación tiene aspecto destructivo y el cuadro se adapta al espacio móvil.
- El asistente conserva el bloqueo de consultas simultáneas, muestra cuándo está analizando y avisa si las órdenes cambiaron después de una respuesta.

## Textos y jerarquía

Mostrar solo lo necesario para elegir, actuar o prevenir un error. Evitar encabezados duplicados, frases comerciales repetidas y explicaciones de controles evidentes. Las sugerencias del asistente tienen etiquetas breves; envían la pregunta completa al seleccionarlas. Las funciones pendientes de administración y operaciones se agrupan en «Próximamente», cerrado por defecto. Integraciones identifica sus opciones como aún no activas y el recorrido describe acciones disponibles.

Conservar los nombres de los campos, las etiquetas accesibles, el folio, los errores y motivos de bloqueo, la confirmación de restablecer y el origen de las respuestas. El aviso de datos ficticios y guardado local se concentra en la navegación; el asistente también identifica las órdenes como ficticias. El pie mantiene los contactos acordados.

## Ayuda interactiva

«Guía de uso» es la única acción de la portada, en lugar de «Explorar demos» y «Recorrido de 3 minutos». Inicia el recorrido completo: prioridades, edición, gráfica y consulta al asistente. Su pulso suave se detiene al pasar el cursor, enfocar o iniciar la guía; se desactiva con movimiento reducido. Las demás pantallas conservan un acceso contextual con el mismo nombre. `/demo/recorrido` sigue disponible directamente. No se abre automáticamente. Los pasos se configuran en `src/lib/guide/steps.ts`; el controlador y su presentación están en `src/components/guide/`.

La portada elimina «Sin registro», el bloque «Conecta tus sistemas» y «Tu demo en cifras». Conserva los módulos, el video y la sección comercial, cuyo enlace «WhatsApp» usa el formato sencillo del pie. En la navegación quedan Inicio y tres grupos con divisor y etiqueta «Demo 1», «Demo 2», «Demo 3», cada uno con el módulo correspondiente debajo; se retiran Integraciones y el enlace adicional al recorrido.

El contorno destaca el objetivo real (`data-guide`), conserva sus controles disponibles y desplaza el contenido para dejar espacio al panel. Se recalcula al desplazar, redimensionar y abrir el teclado móvil usando `visualViewport`. El panel es un diálogo no modal: permite retroceder, omitir, cerrar, usar Escape o llevar el foco al control resaltado. Al cerrar devuelve el foco al acceso a la ayuda; los atributos temporales del objetivo se restauran.

Los pasos de guardar y consultar esperan señales locales emitidas después de una escritura válida o una respuesta recibida. No activan botones, no editan datos ni llaman a la API de IA por sí mismos. Si falla una consulta, el visitante puede reintentar u omitir. Si un objetivo no aparece, se permite omitir y se identifica la situación tras seis segundos. Una navegación mediante enlace o el historial cierra la guía.

La pregunta final «¿Te fue útil?» guarda solo la última opinión y fecha en `localStorage`, clave `salazar-demo:guide-feedback`. No hay analítica remota ni almacenamiento en Supabase. El recorrido se puede repetir desde el principio y funciona aunque el navegador bloquee ese almacenamiento. No se incorpora Floik ni una suscripción externa.

## Verificación

TypeScript, ESLint y las 40 pruebas existentes aprobaron después de aplicar la identidad. El nuevo CSS también se compiló con Lightning CSS en modo CSS Modules. Estos checks no sustituyen una revisión visual de escritorio y móvil ni la comprobación de reproducción real.

Las pruebas de `tests/e2e/demo-mobile.spec.ts` están preparadas para comprobar la altura y alineación del footer, el menú a 320 px, la selección activa, los controles táctiles, el bloqueo del cierre con actividades pendientes, el guardado y la cancelación de restablecer datos. Su ejecución se detuvo antes de abrir el navegador porque el entorno no permite iniciar el servidor en el puerto 3100 (`EPERM`); no se consideran aprobadas.

En esta sesión la red impidió acceder a los archivos públicos de Supabase y al servidor local; el build habitual falló al descargar Geist desde Google Fonts. La documentación del perfil registra verificaciones anteriores de esos recursos, pero su disponibilidad actual debe confirmarse en el navegador o en el despliegue. No se modificaron permisos de Storage ni configuración remota.

Para la guía y el favicon se añadieron pruebas en `tests/e2e/demo-guide.spec.ts`: declaración del icono, flujo completo con guardado real y consulta iniciada por el visitante, opinión local, controles en 320 px, retroceso, omisión, Escape y reapertura sin cambios automáticos. El intento de ejecutarlas volvió a detenerse en `listen EPERM 127.0.0.1:3100`; no se consideran aprobadas. Las 40 pruebas unitarias existentes siguen aprobadas y el CSS de la guía se compiló con Lightning CSS. La disponibilidad actual del PNG no pudo verificarse desde la sesión por un fallo de DNS.
