import { html as htmlResponse } from './respond'
import * as cheerio from 'cheerio'
import { getPage } from './data'
import { getSession, json, withSession } from './session'
import { readFields } from './forms'

/**
 * /save/location: guarda la ubicación del visitante y devuelve el listado de
 * sucursales o talleres ordenado por cercanía (partials/sucursales|talleres.html.twig).
 * El listado sale del contenido de la página /sucursales/ o /talleres del CMS.
 */
export async function saveLocation(req: Request): Promise<Response> {
  const v = await readFields(req)
  const session = await getSession(req)
  const lat = Number(v.lat), lng = Number(v.lng)
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) >= 90 || Math.abs(lng) >= 180) return json({ success: true }, 200, session)
  session.set('lat', lat)
  session.set('lng', lng)
  await session.save()
  const source = v.type === 'sucursales' ? ((await getPage('/sucursales/')) ?? (await getPage('/sucursales'))) : v.type === 'talleres' ? await getPage('/talleres') : null
  if (!source) return json({ success: true }, 200, session)
  const $ = cheerio.load(source.content || '', null, false)
  const list = $('#results').children().first()
  const units: { html: string; distance: number }[] = []
  list.children().each((_, el) => {
    const node = $(el)
    const btn = node.is('button.collapsible__header') ? node : node.find('button.collapsible__header').first()
    if (!btn.length) return
    let html = $.html(node)
    if (node.is('button')) html += $.html(node.next('.collapsible__body'))
    const d = haversine(lat, lng, Number(btn.attr('data-lat')), Number(btn.attr('data-long')))
    html = html.replace(/(<button[^>]*collapsible__header[^>]*>[^<]*<strong>)[^<]*(<\/strong>)/, (_m: string, a: string, b: string) => `${a}${d.toFixed(1)} km de vos${b}`)
    units.push({ html, distance: d })
  })
  units.sort((a, b) => a.distance - b.distance)
  const res = htmlResponse(`<div class="col-md-4">\n${units.map((u) => u.html).join('\n')}\n</div>`)
  return withSession(res, session)
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  if (![lat2, lon2].every(Number.isFinite)) return Number.MAX_SAFE_INTEGER
  const R = 6371, toRad = (x: number) => (x * Math.PI) / 180
  const dLat = toRad(lat2 - lat1), dLon = toRad(lon2 - lon1)
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(a))
}
