# Ford Costa Rica

Clon de [www.ford.cr](https://www.ford.cr) con **Next.js 16 + Payload CMS 3 + PostgreSQL**. Se ve y funciona igual que el sitio Symfony: mismas URLs, mismo HTML, mismo CSS y JS, mismos correos y los mismos microservicios. Lo nuevo es el backend, el CMS y la base de datos.

## Cómo está armado

| Pieza | Dónde |
|---|---|
| Sitio público | `src/app/[[...path]]/route.ts`: cada URL del Symfony se resuelve contra el CMS y se arma con la plantilla de `base.html.twig` (`src/site/render.ts`). |
| Encabezado, menú y submenú de vehículos | `src/site/chrome.ts`, con datos de **Vehículos** y **Categorías**. |
| Contenido de cada página | Colección **Páginas**. Es el HTML que publicaba el CMS anterior y se puede editar en el admin. |
| Bloques dinámicos dentro del contenido | `<div data-controller="…">`, igual que en el CMS anterior: banners (**Sliders**), vehículos del inicio y últimas notas del **Blog** (`src/site/controllers.ts`). |
| Archivos `/uploads/…` y `/media/cache/…` | Colección **Archivos**. Cada archivo se sirve en su URL original (`legacyPath`). |
| CSS, JS, imágenes y documentos estáticos | `public/`: los mismos archivos de `web/` del Symfony (`npm run assets:sync`). |
| Formularios y correos | `src/site/forms.ts` y `src/site/contactus.ts` (port de `handleContactus`). Las plantillas de correo son las Twig originales (`src/legacy/views/Email`), renderizadas con twig.js. |
| Citas de taller | `src/site/citas.ts` (port de `CitasController`) + `src/site/gateway.ts` (gateway de microservicios con token OAuth). |
| Calculadora y accesorios | `src/site/calculator.ts` (sesión del visitante en la tabla `site_sessions`). |
| Sucursales por cercanía | `src/site/location.ts` (`/save/location`). |
| Solicitudes recibidas | Colección **Solicitudes (leads)**: guarda cada envío con a quién se mandó el correo y si salió. |

Los destinatarios de cada formulario están en **Formularios y correos**. Arrancan con los mismos correos de `parameters.prod.yml`.

## Desarrollo local

Requiere Node 22 y PostgreSQL.

```bash
cp .env.example .env          # DATABASE_URL, PAYLOAD_SECRET; FORD_PUBLIC_URL es opcional
npm install
npm run db:migrate
npm run dev                   # http://localhost:3000  ·  admin: /admin
npm run import:ford           # trae páginas, archivos y datos de www.ford.cr
```

Para probar correos sin enviarlos: `SMTP_HOST=__file__` guarda cada correo como `.eml` en `data/mail/`.

## Railway (mientras se habilita Azure)

1. Crear un servicio desde este repositorio de GitHub. Usa el `Dockerfile` y `railway.json`.
2. Agregar un **PostgreSQL** y en el servicio poner `DATABASE_URL=${{Postgres.DATABASE_URL}}`.
3. Montar un **volumen** en `/app/media`; ahí quedan los archivos subidos al CMS.
4. Variables: `FORD_PUBLIC_URL` (opcional; Railway y Azure detectan su dominio automáticamente), `PAYLOAD_SECRET` (32+ caracteres aleatorios), `SMTP_PASSWORD` (API key de SendGrid), `EMAIL_FROM`, y las demás de `.env.example` que apliquen.
5. Al arrancar, las migraciones se aplican solas. Entrar a `/admin`, crear el primer usuario y usar **Importar ahora** en el escritorio. Eso trae todo el contenido de www.ford.cr.

## Azure (después)

Es el mismo código y no hay que cambiarlo. Solo cambian las variables:

- PostgreSQL con identidad administrada: `DATABASE_AUTH_MODE=managed_identity`, `POSTGRES_HOST`, `POSTGRES_DATABASE` y `POSTGRES_USER`.
- Archivos en Blob: `STORAGE_PROVIDER=azure` y `AZURE_STORAGE_*`.
- Microservicios: `MICROSERVICES_GATEWAY` apuntando al gateway interno (hoy es `http://microservice-gateway:3000` dentro del clúster).
- Para el paquete ZIP de App Service: `BUILD_STANDALONE=1 npm run build`.

## Verificación contra ford.cr

- `npm run verify:pages -- <captura>/html`: comprueba que cada página capturada se descompone y se vuelve a armar igual.
- `npm run compare -- <captura> http://localhost:3000`: compara el HTML que entrega el sitio nuevo contra la captura. Ignora espacios y dominio.

## Dominio público (NEXT_PUBLIC_SERVER_URL)

- El contenido importado trae URLs absolutas a `https://www.ford.cr` (así las generaba el Symfony). Si `NEXT_PUBLIC_SERVER_URL` es otro dominio (Railway, Azure de pruebas), se reescriben a ese dominio al servir cada página, fragmento AJAX o JSON. Así el clon no depende del sitio viejo.
- En ese mismo caso las páginas salen con `X-Robots-Tag: noindex, nofollow`, para que Google no indexe la copia. Cuando `NEXT_PUBLIC_SERVER_URL=https://www.ford.cr`, nada de esto aplica.
- Las redirecciones usan el host público (`X-Forwarded-Host`), no el interno del contenedor.

## Llaves atadas al dominio

La llave pública de reCAPTCHA y la de Google Maps del sitio actual solo funcionan en `ford.cr`. Mientras el sitio corra en el dominio de Railway, definí `RECAPTCHA_SITE_KEY` (y `RECAPTCHA_SECRET_KEY`) y `GOOGLE_MAPS_API_KEY` con llaves registradas para ese dominio: se reemplazan solas en todas las páginas. En `ford.cr` se pueden dejar vacías.

## Microservicios desde Railway

El gateway del Symfony (`http://microservice-gateway:3000`) solo se ve dentro del clúster. Para probar citas desde Railway, `MICROSERVICES_GATEWAY` puede apuntar a un gateway público con las mismas rutas (`/oauth/token`, `/<micro>/api/<acción>`), si Infraestructura lo habilita. Sin gateway, los pasos de citas muestran el mismo mensaje de error que el sitio actual cuando el servicio no responde.

## Ya funcionan igual que el Symfony

Formularios y correos (contacto, test drive, reserva, cotizaciones, asesor, snippet), citas, calculadora y cuotas, cotizador de accesorios, comparador, búsqueda `/resultados`, blog con filtros y paginación, votos 👍/👎 de las notas (**Opiniones del blog** en el admin), videos, PDF de cotización, `/view-pdf`, fichas técnicas, sucursales ordenadas por ubicación, `/test-drive/{familia}` y las redirecciones viejas del `RedirectController`. Los precios de las páginas se actualizan solos desde **Vehículos**.

Diferencias a propósito (mejoras sin cambio visible):
- Las plantillas Twig escapan el HTML como en Symfony: lo que escribe el visitante en búsquedas o formularios no se inyecta en la página ni en los correos.
- Las reservas que en ford.cr daban error 500 entregan la misma página de error con código 404.
- El chat de Avaya (`/chat`) está inactivo también en ford.cr (ningún botón lo abre); se mantiene el HTML, pero sus archivos PHP no se publican.

## Pendiente

- Llamada SOAP a Salesforce (`createApointment`) del test drive y la reserva: los WSDL viven en la tabla `parameter` del Symfony, que no está en el repositorio. Por ahora el lead queda en el CMS y los correos salen igual.
