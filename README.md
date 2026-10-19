# Ford React

Nueva implementación del sitio Ford Costa Rica. El proyecto vive en `modern/` para mantener separado el código modernizado del sitio Symfony legado mientras se realiza la migración. Las imágenes de la flota y los banners usados en esta primera portada apuntan temporalmente al CDN público de Ford; deben copiarse a la biblioteca de contenido administrada por el nuevo CMS antes del corte definitivo.

La rama de Azure conserva el repo existente y contiene esta aplicación bajo `modern/`. La rama de GitHub `feature/ford-react-railway` tiene este subdirectorio como raíz; se publicó así para no copiar al repo personal el historial anterior. Al actualizar GitHub desde el repo Azure, usá:

```sh
git subtree split --prefix=modern
git push origin <sha-generado>:refs/heads/feature/ford-react-railway
```

No hagás `git push origin feature/ford-react-railway` desde el repo Azure: esa rama incluye el historial legado.

## Desarrollo

Requiere Node.js 22 y PostgreSQL.

```sh
cp .env.example .env
npm install
npm run db:migrate
npm run dev
```

Vite sirve el sitio en `http://localhost:5173`; la API corre en `http://localhost:4174`.

## Railway y Azure

Railway puede desplegar desde `modern/` con `railway.json`. Configurá `DATABASE_URL`, `MICROSERVICES_GATEWAY_URL`, `MICROSERVICES_CLIENT_ID`, `MICROSERVICES_CLIENT_SECRET`, `SENDGRID_API_KEY`, `SENDGRID_FROM_EMAIL` y `CONTACT_TO_EMAIL` como variables del entorno. No se deben copiar valores de `app/config/parameters.*.yml`.

El servidor usa `PORT` y una URL PostgreSQL estándar, por lo que la misma aplicación podrá pasar a Azure App Service/PostgreSQL sin cambiar código. El stack inicial es React + Express + PostgreSQL; la administración editorial con Payload y las rutas internas pendientes del sitio se agregan en las siguientes etapas.

## Integraciones

`POST /api/microservices/:service/:action` solicita un token OAuth al gateway y reenvía únicamente servicios/acciones permitidos. Las rutas cubren vehículos del usuario, citas, sucursales, configuración y consentimiento. Las credenciales viven en variables de entorno y nunca se envían al navegador.

`POST /api/contact` guarda el lead en PostgreSQL y lo envía por SendGrid. La tabla se crea con `npm run db:migrate`.
