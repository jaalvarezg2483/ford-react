import { serveMedia } from '@/site/media'
import { notFound } from '@/site/respond'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const pathname = new URL(req.url).pathname
  return (await serveMedia(pathname, req)) ?? notFound(req)
}
export const HEAD = GET
