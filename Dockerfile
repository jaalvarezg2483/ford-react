# Ford Costa Rica: sitio React (Vite) + CMS Payload + PostgreSQL en un solo proceso Node.
# Misma imagen para Railway (hoy) y Azure (después).
FROM node:22-bookworm-slim AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY package.json package-lock.json ./
COPY cms/package.json cms/package-lock.json ./cms/
# El postinstall de la raíz instala también cms/.
RUN npm ci --no-audit --no-fund
COPY . .
# Valores solo para compilar; no quedan guardados en la configuración de la imagen.
RUN PAYLOAD_SECRET=build-time-only-secret-min-32-characters \
    DATABASE_URL=postgresql://build:build@127.0.0.1:5432/build \
    npm run build

FROM node:22-bookworm-slim AS run
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 TZ=America/Costa_Rica PORT=3000
COPY --from=build /app ./
RUN mkdir -p /app/cms/media && chown -R node:node /app/cms/media
USER node
EXPOSE 3000
CMD ["npm", "start"]
