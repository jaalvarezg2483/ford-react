import { legacyAssetRedirect, serveMedia } from '@/lib/media'

export const dynamic = 'force-dynamic'

/** Miniaturas de LiipImagine (/media/cache/<filtro>/uploads/…). Si no existe la miniatura se entrega el original. */
export async function GET(req: Request) {
  const url = new URL(req.url)
  const hit = await serveMedia(url.pathname, req)
  if (hit) return hit
  const original = /^\/media\/cache\/(?:resolve\/)?[^/]+(\/uploads\/.+)$/.exec(url.pathname)?.[1]
  if (original) {
    const file = await serveMedia(original, req)
    if (file) return file
    return legacyAssetRedirect(url.pathname, url.search) ?? new Response('No encontrado', { status: 404 })
  }
  return legacyAssetRedirect(url.pathname, url.search) ?? new Response('No encontrado', { status: 404 })
}
export const HEAD = GET
