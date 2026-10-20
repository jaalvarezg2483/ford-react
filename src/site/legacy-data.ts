import locations from '../data/locations.json'
import { cached } from './cache'
import { payloadClient } from './payload'

/** Datos de apoyo con la misma forma que devolvía el Symfony. */

export function provinciasTree() {
  const tree: Record<number, any> = {}
  for (const p of locations.provincias) tree[p.id] = { id: p.id, name: p.name, cantones: {} }
  for (const c of locations.cantones) if (tree[c.provincia]) tree[c.provincia].cantones[c.id] = { id: c.id, name: c.name, distritos: {} }
  for (const d of locations.distritos) {
    for (const p of Object.values(tree)) {
      const c = p.cantones[d.canton]
      if (c) { c.distritos[d.id] = { id: d.id, name: d.name }; break }
    }
  }
  return tree
}

export const locationName = {
  provincia: (id: unknown) => locations.provincias.find((p) => String(p.id) === String(id))?.name,
  canton: (id: unknown) => locations.cantones.find((p) => String(p.id) === String(id))?.name,
  distrito: (id: unknown) => locations.distritos.find((p) => String(p.id) === String(id))?.name,
}

export type FamilyRecord = {
  id: number
  legacyId?: number
  name: string
  slug: string
  code?: string
  startPrice?: number
  models: { code: string; name: string; year?: number; legacyId?: number; price?: number; familySalesForce?: string; categorySalesForce?: string }[]
  dataSheets: { title: string; url: string; legacyId?: number }[]
}

export function allFamilies(): Promise<FamilyRecord[]> {
  return cached('families:all', async () => {
    const payload = await payloadClient()
    const res = await payload.find({ collection: 'families', limit: 200, depth: 1 })
    return res.docs.map((f: any) => ({
      id: f.id, legacyId: f.legacyId, name: f.name, slug: f.slug, code: f.code, startPrice: f.startPrice,
      models: (f.models || []).map((m: any) => ({ code: m.code, name: m.name, year: m.year, legacyId: m.legacyId, price: m.price, familySalesForce: m.familySalesForce, categorySalesForce: m.categorySalesForce })),
      dataSheets: (f.dataSheets || []).map((d: any) => ({ title: d.title, url: d.file?.legacyPath || d.file?.url || '', legacyId: d.legacyId })),
    }))
  })
}

export async function findFamily(by: { slug?: string; legacyId?: unknown }) {
  const all = await allFamilies()
  if (by.slug) return all.find((f) => f.slug === by.slug) ?? null
  if (by.legacyId != null) return all.find((f) => String(f.legacyId) === String(by.legacyId)) ?? null
  return null
}

export async function findModel(by: { code?: string; legacyId?: unknown }, family?: FamilyRecord | null) {
  const pool = family ? [family] : await allFamilies()
  for (const f of pool) {
    const m = f.models.find((x) => (by.code && x.code === by.code) || (by.legacyId != null && String(x.legacyId) === String(by.legacyId)))
    if (m) return { family: f, model: m }
  }
  return null
}

/** Entidades financieras de la calculadora (CAFSA, Facileasing…). */
export type Calculator = { id: number; name: string; rate: number; commission: number; prima: number; termMonth: number[]; terms: number[]; image: string }

export function calculators(): Promise<Calculator[]> {
  return cached('calculators', async () => {
    const payload = await payloadClient()
    const s = (await payload.findGlobal({ slug: 'site-settings', depth: 0 })) as any
    return Array.isArray(s.calculators) ? s.calculators : []
  })
}

/** Equivalente de Calculator.php para las plantillas de correo. */
export function calculatorEntity(c: Calculator) {
  const calcPrima = (total: number) => total * (c.prima / 100)
  return {
    ...c,
    getWebPath: () => c.image.replace(/^\//, ''),
    getTermArray: () => c.terms,
    calcPrima,
    calculate: (total: number) => {
      const prima = calcPrima(total)
      const priceComision = (total - prima) + (total - prima) * (c.commission * 0.01)
      const interest = c.rate / 1200
      const time = c.termMonth[0] ?? 96
      return priceComision * (interest * Math.pow(1 + interest, time)) / (Math.pow(1 + interest, time) - 1)
    },
  }
}

/** Parámetros de la configuración del sitio (tabla parameter del Symfony). */
export function siteParameters(): Promise<Record<string, string>> {
  return cached('parameters', async () => {
    const payload = await payloadClient()
    const s = (await payload.findGlobal({ slug: 'site-settings', depth: 0 })) as any
    return Object.fromEntries((s.parameters || []).map((p: any) => [p.name, p.value ?? '']))
  })
}

export async function recipient(key: string, fallback: string): Promise<string> {
  const map = await cached('recipients', async () => {
    const payload = await payloadClient()
    const s = (await payload.findGlobal({ slug: 'form-settings', depth: 0, overrideAccess: true })) as any
    return Object.fromEntries((s.recipients || []).map((r: any) => [r.key, r.to]))
  })
  return map[key] || fallback
}
