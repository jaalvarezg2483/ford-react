import { renderTwig } from '@/legacy/twig'
import { cached } from './cache'
import { payloadClient } from './payload'
import { html } from './respond'
import { renderTwigOverPage } from './twigpage'

/** /videos y /videos/{categoría} con búsqueda y "Cargar más" (DefaultController::videosAction). */
const SIZE = 9
type Video = { name: string; youtube: string; image: string; description: string; category: string }

function allVideos(): Promise<Video[]> {
  return cached('videos', async () => {
    const payload = await payloadClient()
    const res = await payload.find({ collection: 'videos', where: { active: { equals: true } }, sort: 'order', limit: 1000, depth: 0 })
    return res.docs.map((v: any) => {
      const id = /[?&]v=([^&]+)|youtu\.be\/([^?]+)/.exec(v.youtube)
      return { name: v.name, youtube: v.youtube, description: v.description || '', category: v.category, image: v.image || (id ? `https://img.youtube.com/vi/${id[1] || id[2]}/hqdefault.jpg` : '') }
    })
  })
}

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

export async function renderVideos(req: Request, url: URL, categoryName: string | null): Promise<Response | null> {
  const name = url.searchParams.get('name') ?? ''
  const page = Math.max(1, Number(url.searchParams.get('page')) || 1)
  const videos = (await allVideos()).filter((v) => !name || norm(v.name).includes(norm(name)))
  const entity = (v: Video) => ({ ...v, getWebPath: () => v.image })
  const order: string[] = []
  for (const v of await allVideos()) if (!order.includes(v.category)) order.push(v.category)
  if (categoryName && !order.includes(categoryName)) return null
  const categories = order
    .map((c) => ({ name: c, videos: videos.filter((v) => v.category === c).map(entity) }))
    .filter((c) => !name || c.videos.length > 0)
  let list: ReturnType<typeof entity>[] = []
  let pages: number | null = null
  if (categoryName) {
    const all = videos.filter((v) => v.category === categoryName).map(entity)
    pages = Math.ceil(all.length / SIZE)
    list = all.slice((page - 1) * SIZE, page * SIZE)
    if (req.headers.get('x-requested-with') === 'XMLHttpRequest') {
      return new Response(renderTwig('Default/partials/videos-results.html.twig', { videos: list }), { headers: { 'Content-Type': 'text/html; charset=UTF-8' } })
    }
  }
  const query = new URLSearchParams([...url.searchParams].filter(([k]) => k !== 'page')).toString()
  const basePath = categoryName ? url.pathname : '/videos'
  return html(await renderTwigOverPage('LumenAppBundle:Default:videos.html.twig', {
    videos: list,
    categories,
    category_selected: categoryName ? { name: categoryName } : null,
    name_selected: name,
    moreResults: pages != null && pages > page && pages > 1,
    query,
    pages,
  }, basePath))
}
