import { findFamily } from './legacy-data'
import type { PageDoc } from './data'

/**
 * Las páginas de cada vehículo traen el precio escrito en el HTML del CMS
 * anterior. Al importar se anota qué precios aparecen (priceRefs); si luego se
 * cambia el precio en Vehículos, aquí se actualiza en todas las páginas.
 */
const dotted = (n: number) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.')

export async function syncPrices(page: PageDoc): Promise<PageDoc> {
  if (!page.priceRefs?.length) return page
  const slug = /^\/(?:autos|reserva|preaprobador|accesorios|fichas-tecnicas-precios|test-drive)\/([^/?]+)/.exec(page.path)?.[1]
  const family = slug ? await findFamily({ slug }) : null
  if (!family) return page
  const changes: [number, number][] = []
  for (const r of page.priceRefs) {
    const current = r.ref === 'family' ? family.startPrice : family.models.find((m) => `model:${m.code}` === r.ref)?.price
    if (current != null && Number(current) !== Number(r.value)) changes.push([Number(r.value), Number(current)])
  }
  if (!changes.length) return page
  const apply = (s?: string) => {
    if (!s) return s
    let out = s
    for (const [from, to] of changes) {
      out = out
        .replace(new RegExp(`(\\$\\s?)${dotted(from).replace(/\./g, '\\.')}(?![\\d.])`, 'g'), (_m: string, a: string) => `${a}${dotted(to)}`)
        .replace(new RegExp(`(\\$|= |"|>)${from}(?![\\d.])`, 'g'), (_m: string, a: string) => `${a}${to}`)
    }
    return out
  }
  return { ...page, content: apply(page.content), scripts: apply(page.scripts) }
}
