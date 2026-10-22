import { cached } from './cache'
import { payloadClient } from './payload'
import { json } from './session'
import { readFields } from './forms'
import type { PageDoc } from './data'

/**
 * Votos 👍/👎 y opiniones de las notas del blog (AjaxController del Symfony).
 * El conteo que muestra la página es el que tenía ford.cr al importar más los
 * votos recibidos desde entonces.
 */
const UP_RE = /(class="poll thumbsUp" data-value="up"><i class="mdi mdi-thumb-up"><\/i> <span> )(\d+)(<\/span>)/g
const DOWN_RE = /(class="poll thumbsDown" data-value="down"><i class="mdi mdi-thumb-down"><\/i> <span> )(\d+)(<\/span>)/g

export function articleIdOf(page: Pick<PageDoc, 'scripts' | 'content'>): number | null {
  const m = /var currentArticle = (\d+);/.exec(`${page.scripts || ''}${page.content || ''}`)
  return m ? Number(m[1]) : null
}

function baseline(content: string) {
  return {
    up: Number(new RegExp(UP_RE.source).exec(content)?.[2] ?? 0),
    down: Number(new RegExp(DOWN_RE.source).exec(content)?.[2] ?? 0),
  }
}

async function votes(articleId: number) {
  const payload = await payloadClient()
  const count = async (kind: 'up' | 'down') =>
    (await payload.count({ collection: 'blog-feedback', where: { and: [{ articleId: { equals: articleId } }, { kind: { equals: kind } }] }, overrideAccess: true })).totalDocs
  const [up, down] = await Promise.all([count('up'), count('down')])
  return { up, down }
}

/** Página de la nota con ese id del Symfony (para el conteo base). */
function articlePage(articleId: number): Promise<PageDoc | null> {
  return cached(`article-page:${articleId}`, async () => {
    const payload = await payloadClient()
    const res = await payload.find({ collection: 'pages', where: { scripts: { contains: `var currentArticle = ${articleId};` } }, limit: 1, depth: 0, overrideAccess: true })
    return (res.docs[0] as unknown as PageDoc) ?? null
  })
}

/** Al mostrar una nota, sus contadores incluyen los votos nuevos. */
export async function applyPollCounts(page: PageDoc): Promise<PageDoc> {
  const id = articleIdOf(page)
  if (id == null || !page.content?.includes('poll thumbsUp')) return page
  const base = baseline(page.content)
  const v = await votes(id)
  const content = page.content
    .replace(UP_RE, (_m, a, _n, b) => `${a}${base.up + v.up}${b}`)
    .replace(DOWN_RE, (_m, a, _n, b) => `${a}${base.down + v.down}${b}`)
  return { ...page, content }
}

/** POST /ajax/article-poll/{id}, /ajax/article-opinion/{id} y /ajax/register-workshop. */
export async function handleFeedback(req: Request, path: string): Promise<Response | null> {
  const poll = /^\/ajax\/article-poll\/(\d+)$/.exec(path)
  const opinion = /^\/ajax\/article-opinion\/(\d+)$/.exec(path)
  if (!poll && !opinion && path !== '/ajax/register-workshop') return null
  const xhr = req.headers.get('x-requested-with') === 'XMLHttpRequest'
  if (!xhr) return json({ success: false, message: 'Solo envíos ajax' })
  const fields = await readFields(req)
  const payload = await payloadClient()
  const create = (data: Record<string, unknown>) => payload.create({ collection: 'blog-feedback', data: data as any, overrideAccess: true })

  if (poll) {
    const id = Number(poll[1])
    const page = await articlePage(id)
    if (!page) return json({ success: false }, 404)
    await create({ kind: fields.type === 'up' ? 'up' : 'down', articleId: id })
    const base = baseline(page.content || '')
    const v = await votes(id)
    return json({ thumbsUp: base.up + v.up, thumbsDown: base.down + v.down })
  }
  if (opinion) {
    await create({ kind: 'opinion', articleId: Number(opinion[1]), opinion: fields.opinion || '' })
    return json({ success: true })
  }
  // Un mismo correo solo se registra una vez por nota y taller.
  const articleId = Number(fields.article) || 0
  const workshopId = Number(fields.workshop) || 0
  const exists = await payload.count({
    collection: 'blog-feedback',
    where: { and: [{ kind: { equals: 'workshop' } }, { articleId: { equals: articleId } }, { workshopId: { equals: workshopId } }, { email: { equals: fields.email || '' } }] },
    overrideAccess: true,
  })
  if (exists.totalDocs) return json({ success: false })
  await create({ kind: 'workshop', articleId, workshopId, name: fields.name || '', email: fields.email || '', opinion: fields.opinion || '' })
  return json({ success: true })
}
