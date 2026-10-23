# Ford Costa Rica

Sitio de [www.ford.cr](https://www.ford.cr) en **React + Node.js**, con la misma arquitectura que Toyota CR / Purdy: un sitio Vite + React y un CMS Payload sobre PostgreSQL, servidos por **un solo proceso Node**.

## Cómo está armado

| Pieza | Dónde |
|---|---|
| Sitio público (SPA) | `src/`: Vite + React 19 + React Router. Páginas en `src/pages/`, componentes en `src/components/`. |
| Estilos | `src/styles/ford/`: el SCSS original de ford.cr, compilado por Vite. Mismas clases, mismo diseño. |
| Catálogo de contenido | `src/data/types.ts` (contrato) · `cms/src/lib/siteContent.ts` (lo arma) · `/site-content.json` (lo publica, con ETag y gzip). |
| CMS | `cms/`: Payload 3 + Next 15 (solo `/admin`, `/api`, `/_next`) + PostgreSQL. Colecciones en `cms/src/payload/`. |
| Servidor | `cms/server.mjs`: sirve `dist/`, `public/`, el catálogo, las redirecciones 301/302 y el CMS. Inyecta título y metas (SEO) en el HTML inicial con `src/lib/seo.mjs`. |
| Archivos `/uploads/…` y `/media/cache/…` | Colección **Archivos**: cada archivo se sirve en su URL original (`legacyPath`). |
| Estáticos (imágenes, fuentes, documentos) | `public/` (de `web/` del Symfony: `npm run assets:sync`). |

## Páginas migradas

Portada, fichas de vehículo (`/autos/{slug}` y `/autos/{slug}/galeria`, con visor de fotos), blog (listado con búsqueda, categorías y "Cargar más", y nota con votos), comparador de modelos y las redirecciones viejas. Lo demás está en [docs/MIGRACION.md](docs/MIGRACION.md).

## Desarrollo local

Requiere Node 22 y PostgreSQL.

```bash
cp cms/.env.example cms/.env   # DATABASE_URL, PAYLOAD_SECRET
npm install                    # instala también cms/
npm run db:migrate
npm run import:ford            # trae vehículos, fichas, blog y archivos de www.ford.cr
npm run dev                    # http://localhost:5173  ·  admin: /admin
```

Otros comandos: `npm run typecheck`, `npm run build`, `npm start`.

## Railway (mientras se habilita Azure)

1. Crear un servicio desde este repositorio. Usa el `Dockerfile` y `railway.json`.
2. Agregar un **PostgreSQL** y poner `DATABASE_URL=${{Postgres.DATABASE_URL}}`.
3. Montar un **volumen** en `/app/cms/media`: ahí quedan los archivos subidos al CMS.
4. Variables: `PAYLOAD_SECRET` (32+ caracteres aleatorios), `FORD_PUBLIC_URL` (opcional; Railway y Azure detectan su dominio) y las demás de `cms/.env.example` que apliquen.
5. Las migraciones se aplican con `npm run db:migrate`. Entrar a `/admin`, crear el primer usuario y ejecutar la importación.

## Azure (después)

Es el mismo código; solo cambian variables: `DATABASE_AUTH_MODE=managed_identity` con `POSTGRES_HOST/DATABASE/USER`, y `STORAGE_PROVIDER=azure` con `AZURE_STORAGE_*`.

## Dominio público

- Si el dominio no es `www.ford.cr`, todas las respuestas salen con `X-Robots-Tag: noindex, nofollow` y las secciones no migradas ofrecen abrir el sitio anterior (`LEGACY_SITE_URL`). Los archivos que falten en el CMS se piden a `LEGACY_ASSETS_URL`.
- En `www.ford.cr` nada de eso aplica.
