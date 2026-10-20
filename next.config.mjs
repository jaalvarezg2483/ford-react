import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Azure App Service usa el paquete standalone (BUILD_STANDALONE=1); Railway corre `next start`.
  ...(process.env.BUILD_STANDALONE === '1' ? { output: 'standalone' } : {}),
  poweredByHeader: false,
  devIndicators: false,
  // El sitio público reproduce las URLs del sitio Symfony: sin barra final forzada.
  skipTrailingSlashRedirect: true,
  serverExternalPackages: ['@azure/identity', 'sharp', 'twig', 'playwright-core'],
  // Plantillas Twig del Symfony y datos de apoyo que se leen del disco en tiempo de ejecución.
  outputFileTracingIncludes: { '/**': ['./src/legacy/**/*', './src/data/**/*', './src/import/*.json'] },
  images: { unoptimized: true },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
      {
        source: '/(css|js|img|fonts|icomoon|icons)/(.*)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=604800' }],
      },
    ]
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
