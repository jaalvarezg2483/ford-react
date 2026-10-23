# Fase 2: guía para portar los módulos que faltan

Contexto: ford.cr se rehízo con una arquitectura React 19 + Vite + React Router, CMS Payload 3 + Next 16, PostgreSQL, **un solo proceso Node** (`cms/server.mjs`). La fase 1 (portada, ficha de vehículo, galería, blog, comparador, encabezado, pie) está terminada. Lea `README.md`, `AGENTS.md` y `docs/MIGRACION.md`.

El sitio anterior (Symfony 3 + Twig + jQuery) ya no está en el repositorio; quedó en el historial de git. **No se copia esa tecnología** (nada de Twig, HTML crudo importado, jQuery, `dangerouslySetInnerHTML` de páginas completas). El sitio debe verse y comportarse igual que https://www.ford.cr.

## Dónde mirar para portar un módulo

1. **Comportamiento real**: abra la página en https://www.ford.cr (Chrome headless, ver "Verificación").
2. **HTML renderizado de cada página de ford.cr**: tabla `pages` del PostgreSQL local (columna `content`, `path`, `title`; 317 páginas rastreadas del sitio real). Ej.: `psql -h /tmp -p 5544 -U ford ford -At -c "select content from pages where path='/contacto'"`. Úselo para ver el marcado y las clases CSS exactas.
3. **Código Node ya portado antes (commit `72a0fac`)**: `git show 72a0fac:modern/src/site/<modulo>.ts` (calculator, citas, gateway, contactus, forms, location, search, videos, pdf, dynamic, prices, session, mailer…). Esa lógica de negocio (cálculos, validaciones, llamadas a microservicios, correos) se reutiliza adaptándola a endpoints del CMS.
4. **Plantillas Twig originales** (historial): `git show 72a0fac:modern/src/legacy/views/<carpeta>/<archivo>.html.twig`. Correos: `.../views/Email/*.twig` (ya convertidos a funciones TS que devuelven HTML).
5. **Controladores Symfony** (historial): `git show 72a0fac:src/Lumen/AppBundle/Controller`.

## Reglas del proyecto

- **Frontend**: React + TypeScript, componentes en `src/components/<módulo>/`, páginas en `src/pages/<módulo>/`, rutas en `src/routes/<módulo>.tsx` (arreglo `RouteObject[]`; se conservan las **mismas URLs** del sitio anterior). Estilos: SCSS original ya cargado (`src/styles/site.scss`); use las mismas clases del marcado original; si falta un estilo agréguelo en `src/styles/components/<módulo>.scss` e impórtelo en `site.scss`. Sin jQuery ni plugins: la interacción (pestañas, carruseles, selects, validación) se hace con React; reutilice `Carousel`, `useTabs`, `EqualHeight`, `A`, `Lightbox`, `Field`/`Captcha` (`src/components/forms`).
- **Datos del catálogo** (familias, modelos, precios, colores): `useContent()` (`src/data/content.tsx`, tipos en `src/data/types.ts`). Lo que no esté en el catálogo se pide a un endpoint propio del módulo con `api.get/post` (`src/lib/api.ts`; muestra el indicador de carga).
- **Backend**: un archivo de endpoints por módulo en `cms/src/payload/endpoints/<módulo>.ts` (ya conectado en `endpoints/index.ts`; quedan en `/api/<path>`; **no** usar paths que coincidan con colecciones: `leads`, `pages`, `posts`, `families`, `media`, `videos`, `redirects`, `sliders`, `users`, `blog-feedback`). Utilidades compartidas: `cms/src/lib/{http,session,mailer,data,cache,env,payload}.ts` (`json`, `readFields`, `captchaOk`, `getSession/withSession`, `sendMail`, `allFamilies`, `findFamily`, `findModel`, `calculators`, `siteParameters`, `recipient`, `provinciasTree`…). Lógica en `cms/src/lib/<módulo>/*.ts`; plantillas de correo en `cms/src/lib/emails/<nombre>.ts` (funciones que devuelven HTML con el mismo contenido que el Twig).
- **Formularios**: validar en cliente (mensajes en español) y de nuevo en servidor; reCAPTCHA con `Captcha` + `captchaOk`; guardar siempre la solicitud en la colección `leads` (campos `form`, `path`, `name`, `email`, `phone`, `data`, `emailTo`, `emailStatus`, `salesforceStatus`, `error`); correo con `sendMail` al destinatario de `recipient('<clave>', '<respaldo>')` (global `form-settings`); Salesforce Web-to-Lead según `WTLEAD_*` (como `72a0fac:modern/src/site/contactus.ts`). Un formulario solo confirma el envío si la solicitud quedó guardada. Escape de HTML en correos. Nunca registrar datos personales en logs.
- **Sesión del visitante** (reemplaza la sesión PHP): `getSession(req)` guarda calculadora, accesorios elegidos, etc. Use **las mismas claves** que `72a0fac:modern/src/site/calculator.ts`/`session.ts` para que calculadora y formularios (asesor, reserva, correo, prueba de manejo) se entiendan entre sí.
- **SEO**: el título y la descripción de cada página se declaran en `src/lib/heads/<módulo>.mjs` (reglas `{ test, head }`; léase el encabezado del archivo). Tome los títulos de ford.cr (columna `title` de `pages`). Rutas que dependen de datos inexistentes → `noindex` o 404.
- **Esquema/CMS**: si necesita tablas o campos nuevos, escriba una migración a mano en `cms/src/migrations/` (copie el estilo de las existentes; nombre `AAAAMMDD_HHMMSS_<nombre>.ts`; agréguela al final de `migrations/index.ts`; sin `push`). Colecciones nuevas en `cms/src/payload/collections/` y registro en `payload.config.ts` (solo añadir líneas, releer el archivo antes de editar: otros agentes trabajan en paralelo en otros módulos). Todo lo que negocio edita con frecuencia debe ser campo del CMS (textos, destinatarios, imágenes), no código.
- **Integraciones externas** (microservicios de Purdy, Salesforce, CAFSA): conservar la lógica y las variables de entorno (`cms/src/lib/env.ts`, `.env.example`). Si no hay credenciales en local, el endpoint debe devolver un error controlado en español (no inventar datos ni simular que se envió).
- **Código limpio**: sin comentarios que narren lo obvio, en español como el resto del repo, componentes pequeños, nada de `any` evitable. Sin compartir ni imprimir secretos.

## Entorno de desarrollo (cada agente usa el suyo)

El árbol de código es compartido (varios agentes trabajan a la vez en módulos distintos), así que:

1. **Mantenga todos sus archivos compilando en todo momento** (guarde cambios completos, no a medias): si un archivo de otro módulo está roto, espere un momento y reintente; no lo toque.
2. **Su propia base de datos y puerto**: `pg_dump -h /tmp -p 5544 -U ford ford | psql -h /tmp -p 5544 -U ford -d postgres -c 'create database ford_<modulo>'` (cree la base vacía y restaure con `psql ... < dump`), luego en `modern/cms`:
   `DATABASE_URL=postgresql://ford@localhost:5544/ford_<modulo> PORT=<su puerto> SMTP_HOST=__file__ EMAIL_FROM=no-reply@ford.cr node server.mjs --dev` (ejecute en segundo plano; Postgres local ya está levantado en el puerto 5544 con socket en `/tmp`; el `.env` de `modern/cms` trae el resto). Puertos: forms 5181, calculator 5182, citas 5183, places 5184, content 5185. El sitio queda en `http://localhost:<puerto>`; con `hmr:false` hay que recargar el navegador. Los correos de prueba se guardan como `.eml` en `modern/cms/data/mail`.
3. Migraciones sobre su base: `DATABASE_URL=… npm run payload -- migrate` dentro de `modern/cms`.
4. **No hacer commits** ni tocar archivos de otros módulos (salvo líneas de registro: `payload.config.ts`, `migrations/index.ts`, `site.scss`, `types.ts` del catálogo si es imprescindible). No tocar `src/pages/` ni `src/components/` de otros módulos, ni la fase 1 (salvo corregir errores reales que afecten a su módulo).
5. Antes de terminar: `cd modern && npx tsc -b` y `cd modern/cms && npx tsc --noEmit` sin errores en sus archivos, y `npx vite build` en `modern/`.

## Verificación visual y funcional

`/tmp/shots/cdp.mjs` (Node, Chrome headless por CDP): `node /tmp/shots/cdp.mjs <url> <ancho> <alto> <salida.png> [1=página completa] [scrollY]`; imprime `{"sw":…,"cw":…,"sh":…}` (si `sw > cw` hay desborde horizontal). Úselo con su sitio (`http://localhost:<puerto>/…`) y con el real (`https://www.ford.cr/…`) a 1440, 1018, 768 y 390 px y compare. Lea las imágenes con la herramienta de lectura de archivos. Si necesita interactuar (clic, escribir) ajuste una copia del script con `Input.dispatchMouseEvent` / `Runtime.evaluate`. Pruebe cada flujo de punta a punta (enviar formulario → fila en `leads` y `.eml` generado), en móvil y escritorio, y revise la consola del navegador (sin errores).

Antes de matar procesos de Chrome use `pkill -f "remote-debugging-port=<puerto>"` (no `pkill -f headless`, porque afectaría a otros agentes).

## Entrega

Al terminar, responda con: páginas/rutas portadas (con estado), endpoints creados, tablas/campos nuevos, variables de entorno nuevas, pruebas realizadas (evidencia), diferencias conocidas con ford.cr y pendientes. Actualice la fila de su módulo en `docs/MIGRACION.md` (solo su fila).
