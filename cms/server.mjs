import http from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { readFile, stat } from 'node:fs/promises'
import next from 'next'
import serve from 'serve-handler'
import nextEnv from '@next/env'
import { etagOf, publicCacheControl, sendBody } from './httpCache.mjs'
import { headFor, injectHead } from '../src/lib/seo.mjs'

/**
 * Servidor integrado (un solo proceso Node):
 *   - sitio público: React/Vite construido en ../dist (en desarrollo, Vite como middleware)
 *   - CMS: Payload sobre Next (/admin, /api, /_next) y archivos del CMS (/uploads, /media)
 *   - /site-content.json y /blog-post.json: catálogos publicados que consume el sitio
 *   - redirecciones 301/302 del sitio anterior y cabeceras de seguridad
 */
const cmsDir = path.dirname(fileURLToPath(import.meta.url))
const repoDir = path.resolve(cmsDir, '..')
const dev = process.argv.includes('--dev')
process.env.NODE_ENV = dev ? 'development' : 'production'
process.env.CMS_DIR = cmsDir
nextEnv.loadEnvConfig(cmsDir, dev)

if (process.env.DATABASE_AUTH_MODE === 'managed_identity') {
  // Azure: PostgreSQL con identidad administrada (token de Entra), sin contraseña.
  for (const key of ['POSTGRES_HOST', 'POSTGRES_DATABASE', 'POSTGRES_USER']) {
    if (!process.env[key]) throw new Error(`DATABASE_AUTH_MODE=managed_identity requiere ${key}.`)
  }
} else if (!/^postgres(?:ql)?:\/\//.test(process.env.DATABASE_URL || process.env.DATABASE_URI || '')) {
  throw new Error('DATABASE_URL debe ser una URL de PostgreSQL.')
}
if (!dev && (!process.env.PAYLOAD_SECRET || process.env.PAYLOAD_SECRET.length < 32 || process.env.PAYLOAD_SECRET.includes('change-me'))) {
  throw new Error('Defina PAYLOAD_SECRET con un secreto aleatorio de al menos 32 caracteres.')
}

const port = Number(process.env.PORT || (dev ? 5173 : 3000))
const app = next({ dev, dir: cmsDir, hostname: '0.0.0.0', port })
await app.prepare()
const handle = app.getRequestHandler()

const publicDir = path.join(repoDir, 'public')
const distDir = path.join(repoDir, 'dist')
const NEXT_PATHS = /^\/(admin|api|_next|uploads|media)(\/|$)/

/** Dominio público: el de FORD_PUBLIC_URL, Railway o Azure; en producción sin configurar, www.ford.cr. */
function publicOrigin() {
  const clean = (v) => (v && v.trim() ? v.trim() : undefined)
  const host = clean(process.env.RAILWAY_PUBLIC_DOMAIN) || clean(process.env.WEBSITE_HOSTNAME)
  const url = clean(process.env.FORD_PUBLIC_URL) || (host ? `https://${host}` : undefined) || (dev ? `http://localhost:${port}` : 'https://www.ford.cr')
  return url.replace(/\/$/, '')
}
const ORIGIN = publicOrigin()
// Fuera de www.ford.cr (Railway, pruebas) la copia no debe indexarse.
const NOINDEX = !/^https:\/\/www\.ford\.cr$/.test(ORIGIN) && !dev

// ---- Catálogo publicado (lo arma el CMS en /api/site-content) ----
const SITE_TTL_MS = 5000
let siteCache = null
let siteBuild = null

function loadSiteContent() {
  if (siteCache && Date.now() - siteCache.at < SITE_TTL_MS) return Promise.resolve(siteCache)
  if (!siteBuild) {
    siteBuild = (async () => {
      const res = await fetch(`http://127.0.0.1:${port}/api/site-content`, { headers: { Accept: 'application/json' } })
      if (!res.ok) throw new Error(`site-content respondió ${res.status}`)
      const body = await res.text()
      siteCache = { body, data: JSON.parse(body), etag: etagOf(body), at: Date.now() }
      return siteCache
    })().finally(() => {
      siteBuild = null
    })
  }
  return siteBuild
}

/** Reenvía a Next cambiando la ruta interna (sin que el navegador la vea). */
function proxyToNext(req, res, internalPath) {
  const url = new URL(req.url, 'http://localhost')
  req.url = `${internalPath}${url.search}`
  return handle(req, res)
}

async function fileInfo(root, pathname) {
  const file = path.resolve(root, `.${pathname}`)
  if (!file.startsWith(`${root}${path.sep}`)) return null
  const info = await stat(file).catch(() => null)
  return info?.isFile() ? info : null
}

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  ...(NOINDEX ? { 'X-Robots-Tag': 'noindex, nofollow' } : {}),
}

let vite
let indexHtml = null
async function loadIndexHtml(url) {
  if (dev) return vite.transformIndexHtml(url, await readFile(path.join(repoDir, 'index.html'), 'utf8'))
  indexHtml ??= await readFile(path.join(distDir, 'index.html'), 'utf8')
  return indexHtml
}

const server = http.createServer(async (req, res) => {
  try {
    for (const [k, v] of Object.entries(SECURITY_HEADERS)) res.setHeader(k, v)
    const url = new URL(req.url, 'http://localhost')
    const method = req.method || 'GET'

    if (url.pathname === '/site-content.json') {
      if (!['GET', 'HEAD'].includes(method)) { res.writeHead(405).end(); return }
      const site = await loadSiteContent()
      sendBody(req, res, 200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-cache', ETag: site.etag }, site.body)
      return
    }
    if (url.pathname === '/blog-post.json') {
      await proxyToNext(req, res, '/api/blog-post')
      return
    }
    if (url.pathname === '/content-page.json') {
      await proxyToNext(req, res, '/api/content-page')
      return
    }
    if (NEXT_PATHS.test(url.pathname)) {
      await handle(req, res)
      return
    }
    if (!['GET', 'HEAD'].includes(method)) { res.writeHead(405, { Allow: 'GET, HEAD' }).end(); return }

    // Archivos estáticos del sitio (css, js, fuentes, imágenes, documentos).
    const pathname = decodeURIComponent(url.pathname)
    const info = await fileInfo(publicDir, pathname)
    if (info) {
      await serve(req, res, {
        public: publicDir,
        directoryListing: false,
        cleanUrls: false,
        headers: [{ source: '**', headers: [{ key: 'Cache-Control', value: publicCacheControl(url, pathname) }] }],
      })
      return
    }
    const sheetMatch = /^\/datasheet\/(\d+)\//.exec(pathname)
    if (sheetMatch) {
      try {
        const catalog = (await loadSiteContent()).data
        for (const family of catalog.families || []) {
          const sheet = (family.dataSheets || []).find((d) => String(d.id) === sheetMatch[1])
          if (sheet?.url) {
            res.writeHead(302, { Location: sheet.url, 'Cache-Control': 'public, max-age=300' }).end()
            return
          }
        }
      } catch (error) {
        console.error('Catálogo no disponible:', error.message)
      }
    }
    if (dev) {
      // Vite sirve /src, /@vite, módulos y el index.html de la SPA.
      if (/^\/(src\/|@vite\/|@id\/|@fs\/|@react-refresh|node_modules\/)/.test(pathname) || /\.[a-z0-9]+$/i.test(pathname)) {
        vite.middlewares(req, res)
        return
      }
    } else if (pathname.startsWith('/assets/')) {
      await serve(req, res, {
        public: distDir,
        directoryListing: false,
        cleanUrls: false,
        headers: [{ source: '**', headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }] }],
      })
      return
    }
    // Un archivo con extensión que no existe no es una página de la SPA.
    if (/\.[a-z0-9]{2,5}$/i.test(pathname) && !/\.html?$/i.test(pathname)) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('No encontrado')
      return
    }

    // Páginas: redirecciones del sitio anterior y SPA con metadatos en el HTML inicial.
    let site = null
    try { site = (await loadSiteContent()).data } catch (error) { console.error('Catálogo no disponible:', error.message) }
    const key = url.pathname.length > 1 ? url.pathname.replace(/\/$/, '') : '/'
    const redirect = site?.redirects?.[key + url.search] || site?.redirects?.[key]
    if (redirect) {
      res.writeHead(redirect.permanent ? 301 : 302, { Location: redirect.to, 'Cache-Control': 'public, max-age=300' }).end()
      return
    }
    let html = await loadIndexHtml(req.url)
    const head = headFor(key, url.searchParams, site, ORIGIN)
    html = injectHead(html, head)
    // Una ficha o nota que no existe en el catálogo responde 404 (headFor la marca con noindex).
    sendBody(req, res, head.noindex ? 404 : 200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache', ETag: etagOf(html) }, html)
  } catch (error) {
    console.error('Request failed:', error)
    if (!res.headersSent) res.writeHead(error instanceof URIError ? 400 : 500)
    res.end('Request failed')
  }
})

if (dev) {
  const { createServer } = await import('vite')
  vite = await createServer({
    root: repoDir,
    configFile: path.join(repoDir, 'vite.config.ts'),
    // El HMR compartido con Next en el mismo puerto provoca recargas en bucle; en desarrollo se recarga a mano.
    server: { middlewareMode: { server }, hmr: false, watch: { ignored: [path.join(repoDir, 'cms/**'), path.join(repoDir, 'public/**')] } },
    appType: 'custom',
  })
  const upgrade = app.getUpgradeHandler()
  server.on('upgrade', (req, socket, head) => {
    if ((req.url?.split('?')[0] ?? '').startsWith('/_next/')) upgrade(req, socket, head)
  })
}

server.keepAliveTimeout = 65_000
server.headersTimeout = 70_000
server.listen(port, '0.0.0.0', () => console.log(`Ford CR (sitio + admin) en el puerto ${port} · ${ORIGIN}`))
for (const signal of ['SIGTERM', 'SIGINT']) {
  process.once(signal, () => {
    server.close(async () => {
      await vite?.close()
      await app.close()
      process.exit(0)
    })
    setTimeout(() => process.exit(1), 25000).unref()
  })
}
