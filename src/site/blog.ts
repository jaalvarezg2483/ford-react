import { renderTwig } from '@/legacy/twig'
import { cached } from './cache'
import { getPosts } from './data'
import { payloadClient } from './payload'
import { html } from './respond'
import { renderTwigOverPage } from './twigpage'

/** /blog con búsqueda, filtro por categoría y "Cargar más" (DefaultController::blogAction). */
const SIZE = 9

type Post = Awaited<ReturnType<typeof getPosts>>[number]

const article = (p: Post) => ({
  category: { alias: 'blog' },
  alias: p.path.replace(/^\/blog\//, ''),
  title: () => p.title,
  shortDescription: () => p.summary,
  getWebPath: () => p.image,
})

/** Texto de cada nota para la búsqueda (el Symfony usaba Elasticsearch sobre título y contenido). */
function postTexts(): Promise<Map<string, string>> {
  return cached('blog:texts', async () => {
    const payload = await payloadClient()
    const res = await payload.find({ collection: 'pages', where: { path: { like: '/blog/%' } }, limit: 500, depth: 0, select: { path: true, content: true } as any })
    return new Map(res.docs.map((d: any) => [d.path, String(d.content || '').replace(/<style[\s\S]*?<\/style>|<script[\s\S]*?<\/script>/g, ' ').replace(/<[^>]+>/g, ' ')]))
  })
}

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

async function search(q: string, categories: string[]) {
  const posts = await getPosts()
  let list = posts
  if (categories.length) list = list.filter((p) => categories.includes(p.category))
  if (q.trim()) {
    const texts = await postTexts()
    const words = norm(q).split(/\s+/).filter(Boolean)
    list = list.filter((p) => {
      const hay = norm(`${p.title} ${p.summary} ${texts.get(p.path) ?? ''}`)
      return words.every((w) => hay.includes(w))
    })
  }
  return list
}

export async function renderBlog(req: Request, url: URL): Promise<Response> {
  const q = url.searchParams.get('q') ?? ''
  const categories = [...url.searchParams.getAll('categories[]'), ...url.searchParams.getAll('categories')]
  const page = Math.max(1, Number(url.searchParams.get('page')) || 1)
  const filtered = q !== '' || categories.length > 0
  const results = await search(filtered ? q : '', filtered ? categories : [])
  // The featured post is rendered in its own hero card on the unfiltered page.
  const listing = filtered ? results : results.filter((post) => !post.featured)
  const pageItems = listing.slice((page - 1) * SIZE, page * SIZE).map(article)

  if (req.headers.get('x-requested-with') === 'XMLHttpRequest') {
    return html(renderTwig('Default/partials/blog-results.html.twig', { articles: pageItems }))
  }
  const all = await getPosts()
  const featured = all.find((p) => p.featured) ?? [...all].sort((a, b) => b.views - a.views)[0] ?? null
  const subs = new Map<string, { id: number; name: string; articles: Post[] }>()
  for (const p of all) {
    if (!p.category) continue
    const s: { id: number; name: string; articles: Post[] } = subs.get(p.category) ?? { id: p.categoryId ?? subs.size + 1, name: p.category, articles: [] }
    s.articles.push(p)
    subs.set(p.category, s)
  }
  const data: Record<string, unknown> = {}
  for (const [k, v] of url.searchParams) {
    if (k === 'page') continue
    if (k === 'categories[]') (data.categories as string[] | undefined) ? (data.categories as string[]).push(v) : (data.categories = [v])
    else data[k] = v
  }
  const query = new URLSearchParams([...url.searchParams].filter(([k]) => k !== 'page')).toString()
  const pages = Math.ceil(listing.length / SIZE)
  const body = await renderTwigOverPage('LumenAppBundle:Default:blog.html.twig', {
    category: { alias: 'blog' },
    articles: pageItems,
    total: all.length,
    featured: featured ? article(featured) : null,
    subcategories: [...subs.values()].sort((a, b) => a.name.localeCompare(b.name)),
    title: filtered ? 'Resultados de búsqueda' : 'Todos los artículos',
    moreResults: pages > page,
    data,
    query,
    pages,
  }, '/blog')
  return html(body)
}
