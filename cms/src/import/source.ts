import { existsSync, readFileSync } from 'node:fs'
import http from 'node:http'
import https from 'node:https'
import path from 'node:path'

export type CrawledPage = { path: string; status: number; url: string; html: string }

export interface ImportSource {
  pages(): Promise<CrawledPage[]>
  rest(endpoint: string): Promise<string | null>
  file(legacyPath: string): Promise<{ data: Buffer; mimetype: string } | null>
  fragment(pathWithQuery: string): Promise<string | null>
  /** Una página puntual (variantes con parámetros: ?models[0]=…). */
  page(pathWithQuery: string): Promise<CrawledPage | null>
}

const MIME: Record<string, string> = {
  png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif', webp: 'image/webp', svg: 'image/svg+xml',
  pdf: 'application/pdf', mp4: 'video/mp4', zip: 'application/zip',
}
export const mimeOf = (p: string) => MIME[p.split('.').pop()!.toLowerCase()] ?? 'application/octet-stream'

/** Carpeta generada por la captura (pages.json + html/ + files/ + rest.json). */
export function dirSource(dir: string, live?: ImportSource): ImportSource {
  const index = JSON.parse(readFileSync(path.join(dir, 'pages.json'), 'utf8')) as Record<string, { status: number; url: string; file: string }>
  const rest = existsSync(path.join(dir, 'rest.json')) ? JSON.parse(readFileSync(path.join(dir, 'rest.json'), 'utf8')) : {}
  return {
    async pages() {
      return Object.entries(index).map(([p, v]) => ({ path: p, status: v.status, url: v.url, html: readFileSync(path.join(dir, 'html', v.file), 'utf8') }))
    },
    async rest(endpoint) {
      return rest[endpoint]?.body ?? (live ? live.rest(endpoint) : null)
    },
    async file(legacyPath) {
      const local = path.join(dir, 'files', decodeURIComponent(legacyPath))
      const raw = path.join(dir, 'files', legacyPath)
      for (const f of [raw, local]) if (existsSync(f)) return { data: readFileSync(f), mimetype: mimeOf(f) }
      return live ? live.file(legacyPath) : null
    },
    async fragment(p) {
      return live ? live.fragment(p) : null
    },
    async page(p) {
      const hit = index[p]
      if (hit) return { path: p, status: hit.status, url: hit.url, html: readFileSync(path.join(dir, 'html', hit.file), 'utf8') }
      return live ? live.page(p) : null
    },
  }
}

/** Lee el sitio publicado (Railway/Azure sí tienen salida a internet). */
export function liveSource(base: string): ImportSource {
  const get = async (p: string, redirects = 0): Promise<{
    status: number
    ok: boolean
    url: string
    headers: { get(name: string): string | null }
    text(): Promise<string>
    arrayBuffer(): Promise<ArrayBuffer>
  }> => {
    const url = p.startsWith('http://') || p.startsWith('https://') ? new URL(p) : new URL(base + p)
    const fordOrigin = /(^|\.)ford\.cr$/i.test(url.hostname)
    const result = await new Promise<{ status: number; url: string; headers: http.IncomingHttpHeaders; body: Buffer }>((resolve, reject) => {
      const options = {
        method: 'GET',
        headers: { 'User-Agent': 'FordCR-Importer/1.0', 'Accept-Encoding': 'identity' },
        // Ford's origin sends a malformed response header. TLS certificate and hostname checks stay enabled.
        insecureHTTPParser: fordOrigin,
        timeout: 60_000,
      } as const
      const onResponse = (res: http.IncomingMessage) => {
        const chunks: Buffer[] = []
        res.on('data', (chunk: Buffer | string) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)))
        res.on('end', () => resolve({
          status: res.statusCode ?? 0,
          url: url.toString(),
          headers: res.headers,
          body: Buffer.concat(chunks),
        }))
        res.on('error', reject)
      }
      const req = url.protocol === 'https:'
        ? https.request(url, options, onResponse)
        : http.request(url, options, onResponse)
      req.on('timeout', () => req.destroy(new Error(`Timeout al leer ${url}`)))
      req.on('error', reject)
      req.end()
    })

    const location = result.headers.location
    if (result.status >= 300 && result.status < 400 && location) {
      if (redirects >= 10) throw new Error(`Demasiadas redirecciones al leer ${url}`)
      return get(new URL(location, url).toString(), redirects + 1)
    }

    return {
      status: result.status,
      ok: result.status >= 200 && result.status < 300,
      url: result.url,
      headers: { get: (name) => {
        const value = result.headers[name.toLowerCase()]
        return Array.isArray(value) ? value.join(', ') : value ?? null
      } },
      text: async () => result.body.toString('utf8'),
      arrayBuffer: async () => result.body.buffer.slice(result.body.byteOffset, result.body.byteOffset + result.body.byteLength) as ArrayBuffer,
    }
  }
  const SKIP = /^\/(admin|app_dev|uploads|media|js|css|img|fonts|icomoon|360|rest|ajax|logout|system|generate-pdf|download|datasheet|view-pdf|test-email)/
  const ASSET = /\.(pdf|jpe?g|png|gif|svg|webp|mp4|zip|docx?|xlsx?|css|js|ico|woff2?|ttf|eot)$/i
  const norm = (href: string) => {
    try {
      const u = new URL(href, base)
      if (!/(^|\.)ford\.cr$/.test(u.hostname)) return null
      if (ASSET.test(u.pathname) || SKIP.test(u.pathname)) return null
      return u.pathname + (u.search && !/utm_|fbclid|gclid/.test(u.search) ? u.search : '')
    } catch { return null }
  }
  return {
    async pages() {
      const seen = new Set<string>(['/'])
      const queue = ['/']
      const sitemap = await get('/sitemap.xml').then((r) => r.text()).catch(() => '')
      for (const m of sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)) {
        const n = norm(m[1].replace(/&amp;/g, '&'))
        if (n && !seen.has(n)) { seen.add(n); queue.push(n) }
      }
      const out: CrawledPage[] = []
      const worker = async () => {
        while (queue.length) {
          const p = queue.shift()!
          try {
            const res = await get(p)
            const html = await res.text()
            out.push({ path: p, status: res.status, url: res.url, html })
            if (res.status < 400 && (res.headers.get('content-type') || '').includes('html')) {
              for (const m of html.matchAll(/<(?:a|form)\b[^>]*?(?:href|action)="([^"]+)"/g)) {
                const n = norm(m[1].replace(/&amp;/g, '&'))
                if (n && !seen.has(n)) { seen.add(n); queue.push(n) }
              }
            }
          } catch (error) {
            console.error('No se pudo leer', p, error)
          }
        }
      }
      await Promise.all(Array.from({ length: 6 }, worker))
      return out
    },
    async rest(endpoint) {
      const res = await get(endpoint).catch(() => null)
      return res?.ok ? res.text() : null
    },
    async file(legacyPath) {
      const res = await get(legacyPath).catch(() => null)
      if (!res?.ok) return null
      return { data: Buffer.from(await res.arrayBuffer()), mimetype: res.headers.get('content-type')?.split(';')[0] || mimeOf(legacyPath) }
    },
    async fragment(p) {
      const res = await get(p).catch(() => null)
      return res?.ok ? res.text() : null
    },
    async page(p) {
      const res = await get(p).catch(() => null)
      return res ? { path: p, status: res.status, url: res.url, html: await res.text() } : null
    },
  }
}
