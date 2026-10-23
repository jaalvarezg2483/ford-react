# AGENTS.md — Ford CR (React + Node)

Notas para cualquier asistente que trabaje en este proyecto.

## Regla principal
El sitio debe verse y funcionar **igual que www.ford.cr**, pero con la misma arquitectura que Toyota CR / Purdy
(`/Users/jaalvarezg/Projects/Toyotacr`, estándar en `docs/ESTANDAR_SITIOS_WEB.md`):

- **Sitio**: Vite + React 19 + React Router (`src/`). Una SPA: `src/main.tsx` carga `/site-content.json` antes de montar y todo se pinta desde ese catálogo. **No** se usa Next para el sitio público, ni jQuery, Bootstrap JS, slick, select2, magnific-popup ni Twig.
- **CMS**: `cms/` (Payload 3 + Next 15 + PostgreSQL). Next solo sirve `/admin`, `/api`, `/_next`, `/uploads` y `/media`.
- **Un solo proceso Node**: `cms/server.mjs` sirve `dist/`, el catálogo, las redirecciones y el CMS en `$PORT`. No crear un segundo servicio.
- **Estilos**: el SCSS original en `src/styles/ford/` (Sass moderno, `src/styles/site.scss`). Los componentes usan las mismas clases para que el diseño sea idéntico.
- **Contenido** en campos del CMS (colecciones/globals), no en HTML pegado. Excepción: cuerpo de notas del blog y texto de características destacadas, que son HTML sanitizado en el servidor (`cms/src/lib/sanitize.ts`).
- **Contrato** entre CMS y sitio: `src/data/types.ts`. El CMS lo arma en `cms/src/lib/siteContent.ts`. Si agregás un campo, tocá los dos lados.
- **SEO**: el servidor inyecta título/metas/OG en el HTML inicial con `src/lib/seo.mjs` (la misma función la usa el sitio al navegar, `src/lib/useHead.ts`). Si agregás una ruta pública, agregala también a `headFor`.
- Antes de cerrar un cambio visual, compará contra www.ford.cr con capturas de pantalla (escritorio y celular).

## Lo que falta migrar
Ver `docs/MIGRACION.md`. El código del Symfony y el port anterior (Twig, formularios, citas, calculadora, PDF…) quedó en el historial de git (commit `72a0fac`) como referencia: se porta módulo por módulo a React + endpoints de Payload. No volver a pegar HTML importado ni a servir páginas con un catch-all.

## Comandos
- `npm install` (instala también `cms/`), `npm run db:migrate`, `npm run dev` → http://localhost:5173 (admin en `/admin`).
- `npm run typecheck`, `npm run build`, `npm start`.
- `npm run import:ford`: trae vehículos, fichas, blog y archivos de www.ford.cr al CMS.

## Repos
- Azure DevOps `fordcr`, rama `feature/ford-react-railway`: el proyecto vive en `modern/` junto al Symfony.
- GitHub `jaalvarezg2483/ford-react`, rama `feature/ford-react-railway`: es **solo** `modern/` (subtree). Para publicar desde el repo de Azure:
  ```sh
  git subtree split --prefix=modern -b ford-react-github
  git push origin ford-react-github:feature/ford-react-railway
  ```
  No hagás `git push origin feature/ford-react-railway` desde el repo de Azure, porque sube todo el historial del Symfony.

## Datos
- Base: PostgreSQL. Los cambios de esquema se hacen con `npm run db:migrate:create -- <nombre>` y se versionan en `cms/src/migrations/`. No uses `push`. Las migraciones no deben usar la Local API para rellenar datos sin comprobar antes que hay filas (en una base nueva el esquema todavía está incompleto).
- No subás `.env`, bases de datos ni credenciales. Los valores de `app/config/parameters.*.yml` del Symfony no se copian.
