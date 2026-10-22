import { serveMedia } from '@/site/media'
import { notFound, redirectTo } from '@/site/respond'

export const dynamic = 'force-dynamic'

/** Miniaturas de LiipImagine (/media/cache/<filtro>/uploads/…). Si no existe la miniatura, se redirige al original. */
export async function GET(req: Request) {
  const pathname = new URL(req.url).pathname
  const hit = await serveMedia(pathname, req)
  if (hit) return hit
  const original = /^\/media\/cache\/(?:resolve\/)?[^/]+(\/uploads\/.+)$/.exec(pathname)?.[1]
  if (original) {
    // Con el host público: detrás del proxy `req.url` trae el host interno del contenedor.
    const res = redirectTo(req, original, 307)
    res.headers.set('Cache-Control', 'public, max-age=3600')
    return res
  }
  return notFound(req)
}
export const HEAD = GET
