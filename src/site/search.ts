import * as cheerio from 'cheerio'
import { cached } from './cache'
import { allFamilies } from './legacy-data'
import { getPage } from './data'
import { payloadClient } from './payload'
import { html } from './respond'
import { renderTwigOverPage } from './twigpage'

/** /resultados (SearchElasticaService::searchNormal): vehículos, artículos del CMS y sucursales. */
type Doc = { title: string; section: string; description: string; path: string; text: string }

const SIZE = 10
const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
const SKIP = /^\/(autos|accesorios|reserva|preaprobador|select-family|test-drive|snippet|citas|contacto\/|fichas-tecnicas-precios|comparador|__404|resultados|calcular|blog$|videos)/

function index(): Promise<Doc[]> {
  return cached('search:index', async () => {
    const docs: Doc[] = []
    for (const f of await allFamilies()) {
      const fam = await familyDescription(f.slug)
      docs.push({ title: f.name, section: `Autos Nuevos||${f.name}`, description: fam, path: `/autos/${f.slug}`, text: `${f.name} ${fam}` })
    }
    const payload = await payloadClient()
    const res = await payload.find({ collection: 'pages', where: { template: { equals: 'default' } }, limit: 1000, depth: 0, select: { path: true, title: true, metaHtml: true, content: true } as any })
    for (const p of res.docs as any[]) {
      if (SKIP.test(p.path) || p.path.includes('?')) continue
      const title = String(p.title || '').replace(/\s*\|\s*Ford Costa Rica \| Grupo Purdy\s*$/, '')
      const description = /<meta name="description" content="([^"]*)"/.exec(p.metaHtml || '')?.[1] ?? ''
      const text = String(p.content || '').replace(/<style[\s\S]*?<\/style>|<script[\s\S]*?<\/script>/g, ' ').replace(/<[^>]+>/g, ' ')
      docs.push({ title, section: 'Información', description, path: p.path, text })
    }
    const suc = (await getPage('/sucursales/')) ?? (await getPage('/sucursales'))
    if (suc) {
      const $ = cheerio.load(suc.content || '')
      $('#results button.collapsible__header').each((_, b) => {
        const name = $(b).clone().children().remove().end().text().trim()
        docs.push({ title: name, section: 'Sucursales', description: name, path: '/sucursales', text: name })
      })
    }
    return docs
  })
}

async function familyDescription(slug: string) {
  const page = await getPage(`/autos/${slug}`)
  return /<meta name="description" content="([^"]*)"/.exec(page?.metaHtml || '')?.[1] ?? ''
}

/** Coincidencia aproximada como el "palabra~" de Elasticsearch: tolera una letra de diferencia en palabras de 4+ letras. */
function matches(hay: string, word: string): number {
  if (hay.includes(word)) return 2
  if (word.length < 4) return 0
  const tokens = hay.split(/[^a-z0-9ñ]+/)
  return tokens.some((t) => Math.abs(t.length - word.length) <= 1 && distance(t, word) <= 1) ? 1 : 0
}
function distance(a: string, b: string) {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)])
  for (let j = 1; j <= b.length; j++) dp[0][j] = j
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
  return dp[a.length][b.length]
}

export async function renderSearch(url: URL): Promise<Response> {
  const q = url.searchParams.get('q') || ''
  const page = Math.max(1, Number(url.searchParams.get('page')) || 1)
  const words = norm(q).split(/\s+/).filter(Boolean)
  let hits: { doc: Doc; score: number }[] = []
  if (words.length) {
    for (const doc of await index()) {
      const title = norm(doc.title), body = norm(`${doc.description} ${doc.text}`)
      let score = 0
      for (const w of words) score += matches(title, w) * 3 + matches(body, w)
      if (score > 0) hits.push({ doc, score })
    }
    hits = hits.sort((a, b) => b.score - a.score)
  }
  const elements = hits.slice((page - 1) * SIZE, page * SIZE).map(({ doc }) => ({
    getRouteSearch: () => ({ path: doc.path }),
    getTittleSearch: () => doc.title,
    getSection: () => doc.section,
    getDescriptionSearch: () => doc.description,
  }))
  const pagination = { elements, pages: Math.max(1, Math.ceil(hits.length / SIZE)), count: hits.length }
  return html(await renderTwigOverPage('LumenAppBundle:Default:results.html.twig', { pagination, search: q || false, page }, '/resultados'))
}
