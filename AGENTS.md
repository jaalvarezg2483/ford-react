# AGENTS.md — Ford CR (Next.js + Payload)

Notas para cualquier asistente que trabaje en este proyecto.

## Regla principal
El sitio debe verse y funcionar **igual que www.ford.cr**, pero construido con tecnología actual:
- Páginas en **React** (Next.js App Router, `src/app/(site)/`) y componentes en `src/components/site/`. Sin jQuery, Bootstrap JS, slick, select2 ni otras librerías del Symfony.
- Estilos: el SCSS original en `src/styles/ford/`, compilado por Next con Sass moderno (`src/styles/site.scss`). Los componentes usan las mismas clases para que el diseño sea idéntico.
- Contenido en campos del CMS (globals y colecciones), no en HTML pegado.
- Las páginas que todavía no se pasaron a React las sirve `src/app/[...path]/route.ts` (HTML importado). Cada tipo de página que se migra deja de pasar por ahí.
- Antes de cerrar un cambio visual, compará contra la captura de ford.cr con capturas de pantalla (escritorio y celular) y con `npm run compare`.

## Repos
- Azure DevOps `fordcr`, rama `feature/ford-react-railway`: el proyecto vive en `modern/` junto al Symfony.
- GitHub `jaalvarezg2483/ford-react`, rama `feature/ford-react-railway`: es **solo** `modern/` (subtree). Para publicar desde el repo de Azure:
  ```sh
  git subtree split --prefix=modern -b ford-react-github
  git push origin ford-react-github:feature/ford-react-railway
  ```
  No hagás `git push origin feature/ford-react-railway` desde el repo de Azure, porque sube todo el historial del Symfony.

## Datos
- Base: PostgreSQL. Los cambios de esquema se hacen con `npm run payload -- migrate:create <nombre>` y se versionan en `migrations/`. No uses `push`.
- No subás `.env`, bases de datos ni credenciales. Los valores de `app/config/parameters.*.yml` del Symfony no se copian; los destinatarios de correo se editan en el CMS.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
