import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep Turbopack scoped to this app, not the legacy Symfony workspace root.
  turbopack: { root: process.cwd() },
  // Azure App Service usa el paquete standalone (BUILD_STANDALONE=1); Railway corre `next start`.
  ...(process.env.BUILD_STANDALONE === '1' ? { output: 'standalone' } : {}),
  poweredByHeader: false,
  // El SCSS original usa @import y funciones de color antiguas; compila igual con Sass moderno.
  sassOptions: { silenceDeprecations: ['import', 'global-builtin', 'color-functions', 'slash-div', 'mixed-decls', 'legacy-js-api'] },
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
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000' },
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
