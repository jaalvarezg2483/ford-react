import { legacyAssetRedirect, serveMedia } from '@/lib/media'

export const dynamic = 'force-dynamic'

/** Archivos del CMS en su URL histórica: /uploads/… */
export async function GET(req: Request) {
  const url = new URL(req.url)
  return (await serveMedia(url.pathname, req)) ?? legacyAssetRedirect(url.pathname, url.search) ?? new Response('No encontrado', { status: 404 })
}
export const HEAD = GET
