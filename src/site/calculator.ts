import { cached } from './cache'
import { allFamilies, calculatorEntity, calculators, findFamily, findModel, provinciasTree } from './legacy-data'
import { payloadClient } from './payload'
import { getSession, json, withSession, type Session } from './session'
import { money } from './html'
import { readFields } from './forms'

/**
 * Calculadora de financiamiento y cotizador de accesorios (SessionService.php
 * y AjaxController.php): la selección del visitante vive en su sesión.
 */
const ACC = 'Se_accessories'
const MAINT = 'Se_maintenance'
const INS = 'Se_insurance'
const FAMILY = 'Se_family'

type Item = { id: string; price: number; name: string }

/** Catálogo de accesorios con id/precio/nombre, tomado de las páginas del cotizador. */
function accessoryCatalog(): Promise<Map<string, Item>> {
  return cached('accessory-catalog', async () => {
    const payload = await payloadClient()
    const map = new Map<string, Item>()
    let page = 1
    for (;;) {
      const res = await payload.find({ collection: 'pages', where: { or: [{ path: { like: '/autos/%/calcular/%' } }, { path: { like: '/accesorios/%' } }] }, limit: 100, page, depth: 0, select: { content: true } as any })
      for (const d of res.docs as any[]) {
        for (const m of String(d.content || '').matchAll(/<input[^>]*class="checkbox control-resume"[^>]*>/g)) {
          const tag = m[0]
          const attr = (n: string) => new RegExp(`${n}="([^"]*)"`).exec(tag)?.[1]
          const id = attr('data-id'), price = attr('data-price'), name = attr('data-name')
          if (id && price && name) map.set(id, { id, price: Number(price), name: decode(name) })
        }
      }
      if (!res.hasNextPage) break
      page++
    }
    return map
  })
}

const decode = (s: string) => s.replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/&amp;/g, '&')

export function sessionTotal(session: Session): number {
  let total = 0
  for (const k of [ACC, MAINT, INS]) for (const i of Object.values(session.get(k, {}) as Record<string, Item>)) total += Number(i.price) || 0
  return total
}

async function toggleAccessory(session: Session, id: string) {
  const items: Record<string, Item> = { ...session.get(ACC, {}) }
  if (items[id]) delete items[id]
  else if (id !== '0') {
    const item = (await accessoryCatalog()).get(id)
    if (item) items[id] = { id, price: item.price, name: item.name }
  }
  session.set(ACC, items)
  return items
}

/** GET/POST de la calculadora. Devuelve null si la ruta no es de aquí. */
export async function handleCalculatorGet(req: Request, url: URL): Promise<Response | null> {
  const p = url.pathname.replace(/\/$/, '')
  let m: RegExpExecArray | null
  if (p === '/get-cantones-ajax') return json(provinciasTree())
  if (p === '/rest/v2/calculator') return json(await calculatorsLegacy())
  if (p === '/family_and_model') {
    // FamilyRepository::getWithModel serializado con el grupo "select".
    const out: Record<string, unknown> = {}
    for (const f of await allFamilies()) {
      if (f.legacyId == null) continue
      const models: Record<string, unknown> = {}
      for (const m of f.models) if (m.legacyId != null) models[m.legacyId] = { id: m.legacyId, code: m.code, name: m.name, description: '' }
      if (Object.keys(models).length) out[f.legacyId] = { id: f.legacyId, name: f.name, models }
    }
    return json(out)
  }
  if ((m = /^\/ajax\/model\/([^/]+)$/.exec(p))) {
    const hit = await findModel({ code: m[1] })
    return json(hit?.model.price ?? null)
  }
  if (p === '/ajax/accessories') {
    const session = await getSession(req)
    return json(session.get(ACC, {}), 200, session)
  }
  if ((m = /^\/ajax\/accessories\/([^/]+)$/.exec(p))) {
    const session = await getSession(req)
    const items = await toggleAccessory(session, m[1])
    await session.save()
    return json(items, 200, session)
  }
  if ((m = /^\/ajax\/maintenance\/insurance\/([^/]+)$/.exec(p))) {
    const session = await getSession(req)
    if (m[1] === '0') return json({ maintenance: session.get(MAINT, {}), insurance: session.get(INS, {}) }, 200, session)
    return json([], 200, session)
  }
  return null
}

export async function handleCalculatorPost(req: Request, url: URL): Promise<Response | null> {
  const p = url.pathname.replace(/\/$/, '')
  if (p === '/get-cantones-ajax') return json(provinciasTree())
  if (p === '/accesoriesDelete') {
    const session = await getSession(req)
    const v = await readFields(req)
    if (v.type === 'accesory') await toggleAccessory(session, v.id)
    await session.save()
    return json(true, 200, session)
  }
  return null
}

/** Mismo formato que /rest/v2/calculator del Symfony. */
async function calculatorsLegacy() {
  return (await calculators()).map((c) => ({ termMonth: c.termMonth, terms: c.terms, image: c.image, id: c.id, name: c.name, commission: c.commission, rate: c.rate, prima: c.prima }))
}

/**
 * Cotizador: al entrar a una familia distinta se limpia la selección
 * (SessionService::cleanCalculate) y el resumen muestra lo elegido.
 */
export async function applyCalculatorSession(req: Request, url: URL, content: string): Promise<{ content: string; session: Session } | null> {
  const p = url.pathname.replace(/\/$/, '')
  const m = /^\/(?:autos|preaprobador)\/([^/]+)\/calcular\/([^/]+)(\/resumen)?$/.exec(p) || /^\/accesorios\/([^/]+)(?:\/(resumen|correo|asesor))?$/.exec(p)
  if (!m) return null
  const session = await getSession(req)
  const family = await findFamily({ slug: m[1] })
  if (family) {
    const current = session.get(FAMILY, null)
    if (current !== family.slug) {
      session.set(FAMILY, family.slug)
      if (current) { session.remove(ACC); session.remove(MAINT); session.remove(INS) }
    }
  }
  let out = content
  const accessories: Record<string, Item> = session.get(ACC, {})
  const total = sessionTotal(session)
  // Marcar los accesorios ya elegidos en el paso de adicionales.
  for (const id of Object.keys(accessories)) {
    out = out.replace(new RegExp(`(<input value="${id}" type="checkbox" class="checkbox control-resume")`, 'g'), '$1 checked')
  }
  if (/\/resumen$/.test(p) && Object.keys(accessories).length) {
    const rows = Object.entries(accessories).map(([key, a]) => `
									<tr>
										<td>
											${escapeHtml(a.name)}
										</td>
										<td>
											<strong>$${money(a.price)}</strong>
										</td>
										<td>
											<a data-id="${key}" data-attr="accesory" class="js-delete-accessory"><span class="icon icon-close"></span></a>
										</td>
									</tr>`).join('')
    out = out.replace(/(<strong id="pc-model-start-price">\$([\d.]+)<\/strong><\/td>\s*<td>&nbsp;<\/td>\s*<\/tr>)/, `$1${rows}`)
    const start = Number((/<strong id="pc-model-start-price">\$([\d.]+)</.exec(out)?.[1] ?? '0').replace(/\./g, ''))
    const grand = start + total
    out = out.replace(/(<span id="pc-total-price">)[\d.]+(<\/span>)/, `$1${money(grand)}$2`)
    const ents = (await calculators()).map(calculatorEntity)
    out = out.replace(/<form data-calculator="([^"]+)"[\s\S]*?<\/form>/g, (form, name) => {
      const e = ents.find((x) => x.name === name)
      if (!e) return form
      const prima = phpNumber(e.calcPrima(grand))
      const fee = (e.calculate(grand)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      return form
        .replace(/(class="validate rate_prima no-letters" value=")[^"]*(")/, `$1${prima}$2`)
        .replace(/(La prima no puede ser menor a \$)[^<]*/, `$1${prima}`)
        .replace(/(class="title text-center fee_wdg(?:_plain)? text--red text--bold">\$)[^<]*/, `$1${fee}`)
        .replace(/(class="fee_wdg_plain priceAndColor">\$)[^<]*/, `$1${fee}`)
    })
  }
  return { content: out, session }
}

/** PHP imprime los float sin decimales sobrantes (11598.0 → "11598"). */
function phpNumber(n: number) {
  return Number.isInteger(n) ? String(n) : String(Number(n.toFixed(10)))
}
function escapeHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
export { withSession }
