import { mkdir, readFile, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { liveSource } from '../import/source'
import { payloadClient } from './payload'

const TYPES: Record<string, string> = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif', webp: 'image/webp', svg: 'image/svg+xml', pdf: 'application/pdf', mp4: 'video/mp4' }

const safeDecode = (p: string) => {
  try { return decodeURI(p) } catch { return p }
}

/** Origen del sitio anterior: de ahí se rellenan archivos que el volumen de Railway/Azure todavía no tiene. */
function legacyOrigin() {
  const configured = process.env.LEGACY_ASSETS_URL?.trim() || process.env.LEGACY_SITE_URL?.trim()
  return (configured || 'https://www.ford.cr').replace(/\/$/, '')
}

/** Ruta absoluta dentro de `media/`; rechaza `..` y rutas fuera del directorio. */
function mediaFile(filename: unknown): string | null {
  if (typeof filename !== 'string' || !filename || filename.includes('\0')) return null
  const root = path.resolve(process.env.CMS_DIR || process.cwd(), 'media')
  const file = path.resolve(root, filename)
  const prefix = root.endsWith(path.sep) ? root : root + path.sep
  if (file !== root && !file.startsWith(prefix)) return null
  return file
}

export async function getMediaByPath(legacyPath: string) {
  const payload = await payloadClient()
  const res = await payload.find({ collection: 'media', where: { legacyPath: { equals: legacyPath } }, limit: 1, depth: 0, overrideAccess: true })
  return (res.docs[0] as any) ?? null
}

async function pullLegacy(pathname: string) {
  try {
    return await liveSource(legacyOrigin()).file(pathname)
  } catch {
    return null
  }
}

async function cacheLocal(filename: string, data: Buffer) {
  const file = mediaFile(filename)
  if (!file) return
  await mkdir(path.dirname(file), { recursive: true })
  await writeFile(file, data)
}

function bytesResponse(req: Request, body: Uint8Array, type: string) {
  return new Response(req.method === 'HEAD' ? null : body, {
    headers: { 'Content-Type': type, 'Cache-Control': 'public, max-age=2592000', 'Content-Length': String(body.length) },
  })
}

/** Entrega un archivo del CMS en su URL pública histórica (/uploads/…, /media/cache/…). */
export async function serveMedia(legacyPath: string, req: Request): Promise<Response | null> {
  let doc: any = null
  for (const candidate of [legacyPath, safeDecode(legacyPath)]) {
    doc = await getMediaByPath(candidate)
    if (doc) break
  }
  const type = doc?.mimeType || TYPES[legacyPath.split('.').pop()!.toLowerCase()] || 'application/octet-stream'
  const headers = { 'Content-Type': type, 'Cache-Control': 'public, max-age=2592000' }

  if (process.env.STORAGE_PROVIDER === 'azure' && doc?.url && /^https?:/.test(doc.url)) {
    const upstream = await fetch(doc.url).catch(() => null)
    if (upstream?.ok) {
      return new Response(req.method === 'HEAD' ? null : upstream.body, { headers: { ...headers, 'Content-Length': upstream.headers.get('content-length') || '' } })
    }
  }

  const filename = (typeof doc?.filename === 'string' && doc.filename) || path.basename(safeDecode(legacyPath))
  const file = mediaFile(filename)
  if (file) {
    const info = await stat(file).catch(() => null)
    if (info?.isFile()) {
      return new Response(req.method === 'HEAD' ? null : new Uint8Array(await readFile(file)), { headers: { ...headers, 'Content-Length': String(info.size) } })
    }
  }

  const pulled = await pullLegacy(legacyPath)
  if (!pulled) return null
  if (process.env.STORAGE_PROVIDER !== 'azure') {
    await cacheLocal(filename, pulled.data).catch(() => {})
  }
  return bytesResponse(req, new Uint8Array(pulled.data), pulled.mimetype || type)
}

/**
 * Archivo que todavía no está en el CMS: se redirige a LEGACY_ASSETS_URL (por defecto
 * https://www.ford.cr) para que Railway/Azure no dejen imágenes rotas.
 */
export function legacyAssetRedirect(pathname: string, search = ''): Response | null {
  const base = legacyOrigin()
  if (!base) return null
  return new Response(null, { status: 307, headers: { Location: `${base}${pathname}${search}`, 'Cache-Control': 'public, max-age=300' } })
}
