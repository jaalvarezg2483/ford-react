import { serveMedia } from '@/site/media'
import { notFound } from '@/site/respond'

export const dynamic = 'force-dynamic'

/** Miniaturas de LiipImagine (/media/cache/<filtro>/uploads/…). Si no existe la miniatura, se entrega el original. */
export async function GET(req: Request) {
  const pathname = new URL(req.url).pathname
  const hit = await serveMedia(pathname, req)
  if (hit) return hit
  const original = /^\/media\/cache\/(?:resolve\/)?[^/]+(\/uploads\/.+)$/.exec(pathname)?.[1]
  if (original) {
    const url = new URL(req.url)
    url.pathname = original
    return new Response(null, { status: 307, headers: { Location: url.toString(), 'Cache-Control': 'public, max-age=3600' } })
  }
  return notFound(req)
}
export const HEAD = GET
