# Ford Costa Rica — Next.js + Payload CMS + PostgreSQL
# Misma imagen para Railway (hoy) y Azure (después).
FROM node:22-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

FROM node:22-bookworm-slim AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Valores solo para compilar; en ejecución vienen de las variables del entorno.
ENV PAYLOAD_SECRET=build-time-only-secret-min-32-characters \
    DATABASE_URL=postgresql://build:build@127.0.0.1:5432/build \
    NEXT_PUBLIC_SERVER_URL=http://localhost:3000
RUN npm run build

FROM node:22-bookworm-slim AS run
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 TZ=America/Costa_Rica PORT=3000
COPY --from=build /app ./
RUN mkdir -p /app/media && chown -R node:node /app/media
USER node
EXPOSE 3000
CMD ["npm", "start"]
