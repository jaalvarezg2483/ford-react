# Migración de ford.cr a React + Node

El sitio público ya corre en Vite + React Router, CMS Payload + PostgreSQL y un solo proceso Node (`cms/server.mjs`). El Symfony quedó solo en el historial de git (commit `72a0fac`).

## En el CMS

Portada, vehículos, blog, comparador, calculadora, accesorios, formularios, citas (UI), sucursales, videos, fichas, sitemap y páginas de contenido (`content-pages`: servicios, seguros, legales, etc.). La colección **Páginas** guarda HTML archivado de consulta; no se sirve.

## Fuera de código de página

- **reCAPTCHA**: falta configurar llaves del dominio nuevo.
- **Citas**: el gateway Purdy (`MICROSERVICES_GATEWAY`) no está configurado en local.
- **Chat Avaya / Salesforce SOAP** (`createApointment`): no se portaron; el Web-to-Lead sí.

Fuera de `www.ford.cr` las respuestas llevan `X-Robots-Tag: noindex, nofollow`.
