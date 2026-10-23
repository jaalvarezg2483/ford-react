import type { Endpoint, Payload } from 'payload'
import type { PostDetail } from '../../../../src/data/types'
import { sanitizeArticleHtml } from '../../lib/sanitize'
import { getSiteContent, mediaUrl } from '../../lib/siteContent'
import { clientIp, isSameSite, rateLimited } from '../../lib/rateLimit'

const json = (data: unknown, status = 200, headers: Record<string, string> = {}) =>
  Response.json(data, { status, headers: { 'Cache-Control': 'no-cache', ...headers } })

async function postByPath(payload: Payload, path: string) {
  const res = await payload.find({ collection: 'posts', where: { and: [{ path: { equals: path } }, { active: { equals: true } }] }, limit: 1, depth: 1, overrideAccess: true })
  return (res.docs[0] as Record<string, any> | undefined) ?? null
}

async function voteCounts(payload: Payload, articleId: number) {
  const count = async (kind: 'up' | 'down') =>
    (await payload.count({ collection: 'blog-feedback', where: { and: [{ articleId: { equals: articleId } }, { kind: { equals: kind } }] }, overrideAccess: true })).totalDocs
  const [up, down] = await Promise.all([count('up'), count('down')])
  return { up, down }
}

/** Sitio público: catálogo, artículos del blog y votos. */
export const siteEndpoints: Endpoint[] = [
  {
    // Catálogo que consume el sitio React (el servidor lo publica como /site-content.json).
    path: '/site-content',
    method: 'get',
    handler: async () => json(await getSiteContent()),
  },
  {
    // Artículo completo (el catálogo solo trae la ficha de cada nota). Publicado como /blog-post.json?path=…
    path: '/blog-post',
    method: 'get',
    handler: async (req) => {
      const path = new URL(req.url ?? '', 'http://localhost').searchParams.get('path') || ''
      const post = path ? await postByPath(req.payload, path) : null
      if (!post) return json({ error: 'No encontrado' }, 404)
      const articleId = Number(post.articleId ?? post.id)
      const votes = await voteCounts(req.payload, articleId)
      const detail: PostDetail = {
        path: post.path,
        title: post.title,
        heading: post.heading || post.title,
        banner: mediaUrl(post.banner) || post.bannerPath || '',
        bodyHtml: sanitizeArticleHtml(post.bodyHtml || ''),
        articleId,
        views: post.views ?? 0,
        up: Number(post.pollUp ?? 0) + votes.up,
        down: Number(post.pollDown ?? 0) + votes.down,
        description: post.metaDescription || post.summary || '',
        image: mediaUrl(post.image),
      }
      return json(detail)
    },
  },
  {
    // Votos 👍/👎 y opiniones de las notas: POST /api/site/blog-feedback { path, kind: 'up'|'down'|'opinion', opinion? }
    path: '/site/blog-feedback',
    method: 'post',
    handler: async (req) => {
      const request = req as unknown as Request
      if (!isSameSite(request)) return json({ error: 'Solicitud inválida' }, 403)
      const ip = clientIp(request)
      if (rateLimited(`blog:${ip}`, 8, 60 * 60 * 1000)) return json({ error: 'Demasiados votos' }, 429)
      let body: { path?: string; kind?: string; opinion?: string } = {}
      try { body = await (req as any).json() } catch { return json({ error: 'Solicitud inválida' }, 400) }
      const kind = body.kind === 'up' || body.kind === 'down' || body.kind === 'opinion' ? body.kind : null
      const post = body.path && kind ? await postByPath(req.payload, body.path) : null
      if (!post || !kind) return json({ error: 'Solicitud inválida' }, 400)
      const articleId = Number(post.articleId ?? post.id)
      if (rateLimited(`blog:${ip}:${articleId}:${kind}`, 1, 12 * 60 * 60 * 1000)) return json({ error: 'Ya registró este voto' }, 429)
      await req.payload.create({
        collection: 'blog-feedback',
        data: { kind, articleId, opinion: kind === 'opinion' ? String(body.opinion || '').slice(0, 2000) : undefined } as any,
        overrideAccess: true,
      })
      const votes = await voteCounts(req.payload, articleId)
      return json({ up: Number(post.pollUp ?? 0) + votes.up, down: Number(post.pollDown ?? 0) + votes.down })
    },
  },
]
