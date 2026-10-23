import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { withPayload } from '@payloadcms/next/withPayload'

const cmsDir = path.dirname(fileURLToPath(import.meta.url))
const repoDir = path.resolve(cmsDir, '..')

/**
 * Next solo sirve el admin de Payload, su API y los archivos del CMS
 * (/admin, /api, /uploads, /media, /_next). El sitio público es el frontend
 * React/Vite de la raíz del repositorio.
 *
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  outputFileTracingRoot: repoDir,
  allowedDevOrigins: ['localhost:5173', '127.0.0.1:5173'],
  poweredByHeader: false,
  devIndicators: false,
  // Las URLs históricas (/uploads/…) y la API no llevan barra final forzada.
  skipTrailingSlashRedirect: true,
  // Estos paquetes se usan solo en el servidor y no se empaquetan con webpack.
  serverExternalPackages: ['@azure/identity', '@azure/storage-blob', 'sharp', 'pg'],
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ]
  },
}

export default withPayload(nextConfig)
