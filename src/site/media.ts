import { readFile, stat } from 'node:fs/promises'
import path from 'node:path'
import { getMediaByPath } from './data'

const TYPES: Record<string, string> = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif', webp: 'image/webp', svg: 'image/svg+xml', pdf: 'application/pdf', mp4: 'video/mp4' }

/** Entrega un archivo del CMS en su URL pública histórica (/uploads/…, /media/cache/…). */
export async function serveMedia(legacyPath: string, req: Request): Promise<Response | null> {
  const candidates = [legacyPath, safeDecode(legacyPath)]
  let doc: any = null
  for (const c of candidates) {
    doc = await getMediaByPath(c)
    if (doc) break
  }
  if (!doc) return null
  const type = doc.mimeType || TYPES[legacyPath.split('.').pop()!.toLowerCase()] || 'application/octet-stream'
  const headers = { 'Content-Type': type, 'Cache-Control': 'public, max-age=2592000' }
  if (process.env.STORAGE_PROVIDER === 'azure' && doc.url && /^https?:/.test(doc.url)) {
    const upstream = await fetch(doc.url)
    if (!upstream.ok) return null
    return new Response(req.method === 'HEAD' ? null : upstream.body, { headers: { ...headers, 'Content-Length': upstream.headers.get('content-length') || '' } })
  }
  const file = path.join(process.cwd(), 'media', doc.filename)
  const info = await stat(file).catch(() => null)
  if (!info) return null
  return new Response(req.method === 'HEAD' ? null : new Uint8Array(await readFile(file)), { headers: { ...headers, 'Content-Length': String(info.size) } })
}

function safeDecode(p: string) {
  try { return decodeURI(p) } catch { return p }
}
