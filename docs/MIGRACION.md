# Migración de ford.cr (Symfony) a React + Node

Referencia del código anterior (Symfony y el primer port con Twig/HTML importado): commit `72a0fac` de este repositorio.
`git show 72a0fac:modern/src/site/<archivo>` para ver cada módulo.

## Hecho (fase 1)

- Base: SPA Vite + React Router, CMS Payload + Next 15 + PostgreSQL, un solo proceso (`cms/server.mjs`), catálogo `/site-content.json`, SEO en el HTML inicial, redirecciones desde el CMS, `noindex` fuera del dominio oficial.
- Encabezado, submenú de vehículos, buscador del menú, pie, botón de WhatsApp, GTM/Site24x7.
- Portada completa (hero, familias, servicios, tecnología, CTAs, blog reciente, app Purdy Go).
- Ficha de vehículo y galería (banner, colores, características, modelos, galería con visor, descargas).
- Blog (listado + nota con votos 👍/👎) y comparador (cuota aprox. CAFSA).

## Pendiente (fase 2)

Cada módulo se porta a un componente/página en `src/pages/` y a un endpoint en `cms/src/payload/endpoints/`.

| Módulo | Rutas | Referencia (commit 72a0fac) |
|---|---|---|
| Calculadora de cuota y selección de modelos | `/calcular`, `/autos/{slug}/modelos`, `/autos/{slug}/calcular/{código}…` | `src/site/calculator.ts`, `session.ts` |
| Accesorios / cotizador | `/autos/{slug}/calcular/{código}/…` | `src/site/calculator.ts` |
| Formularios y correos (contacto, test drive, reserva, cotizaciones, asesor) | **Hecho (contacto):** `/contacto`, `/contacto/gracias`, `/contacto/:type(/:family)/gracias`, `/contactanos` → `/contacto`. POST `/api/forms/contacto` y `/api/forms/snippet/:type`. Pendiente: test drive, reserva, cotizaciones, asesor. | `src/site/forms.ts`, `contactus.ts`, `mailer.ts`, `src/legacy/views/Email` |
| Citas de taller | `/citas`, `/citas/step1`–`step4`, `/citas/scheduled-car` | **Hecho.** React + endpoints `/api/citas/*`. El gateway de microservicios (`MICROSERVICES_GATEWAY`) no está configurado en local: el index se ve igual y la búsqueda muestra el modal de error. |
| Sucursales por ubicación | `/sucursales`, `/save/location` | `src/site/location.ts` |
| Búsqueda | `/resultados` | `src/site/search.ts` |
| Páginas de contenido (servicios, herramientas de compra, legales, micrositios) | `/servicios`, `/herramientas-de-compra`, `/seguros` (+ coberturas/condiciones), `/sobre-nosotros`, `/tecnologia`, `/reglamentos`, `/planes-mantenimiento`, `/carroceria-pintura`, `/servicios/repuestos`, `/servicio/accesorios`, `/article/terminos-condiciones`, `/mantenimiento-y-talleres` | **Hecho.** Colección `content-pages` (bloques React). HTML archivado en `pages` queda de consulta. |
| Especificaciones y fichas técnicas por modelo | `/autos/{slug}/especificaciones`, `/fichas-tecnicas-precios/…` | `src/site/dynamic.ts` |
| PDF de cotización y visor `/view-pdf/…` | `/view-pdf/{slug}/{id}`, `/show_calculate/…` | `src/site/pdf.ts` |
| Videos | `/videos` | `src/site/videos.ts` |
| Chat y hotspots | — | `public/chat` |
| Salesforce (SOAP `createApointment`) | — | pendiente también en el port anterior |

Mientras un módulo no esté migrado, su ruta muestra "Esta sección está en migración" (y, fuera de www.ford.cr, un enlace al sitio anterior).
Redirecciones por expresión regular de `/autos/{slug}/calculate/{código}/…` → `/calcular/…`: agregar en `cms/server.mjs` al portar la calculadora.

## Notas

- Las migraciones de base de datos van en `cms/src/migrations/` y se crean con `npm run db:migrate:create -- <nombre>`.
- La colección **Páginas** conserva el HTML del sitio anterior como archivo de consulta; ya no se sirve.
- GTM: el sitio es una SPA y envía el evento `pageview` (con `page`) al `dataLayer` en cada cambio de ruta. Configurar en el contenedor un activador por ese evento (o "Historial de cambios") si se miden páginas vistas.
