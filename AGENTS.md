# AGENTS.md — Ford CR (Next.js + Payload)

Notas para cualquier asistente que trabaje en este proyecto.

## Regla principal
El sitio debe verse y funcionar **igual que www.ford.cr**. No cambiés markup, clases, CSS ni JS visibles sin pedirlo. Se puede modernizar por dentro siempre que el resultado para el usuario sea el mismo. Antes de cerrar un cambio, corré `npm run compare`.

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
