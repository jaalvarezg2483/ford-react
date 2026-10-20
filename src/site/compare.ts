import { allFamilies, calculatorEntity, calculators } from './legacy-data'
import { html } from './respond'
import { renderTwigOverPage } from './twigpage'

/** /comparador?models[]=ID… (DefaultController::comparadorAction). */
export async function renderComparador(url: URL): Promise<Response | null> {
  const ids = [...url.searchParams.getAll('models[]'), ...url.searchParams.getAll('models')].filter(Boolean)
  if (!ids.length) return null
  const families = await allFamilies()
  const models: any[] = []
  for (const id of ids) {
    for (const f of families) {
      const m = f.models.find((x) => String(x.legacyId) === String(id) || x.code === id)
      if (m) {
        const specs: Record<string, unknown> = (m as any).specs ?? {}
        models.push({ ...specs, id: m.legacyId, code: m.code, name: m.name, startPrice: m.price ?? f.startPrice ?? 0, family: { id: f.legacyId, slug: f.slug, name: f.name } })
        break
      }
    }
  }
  if (!models.length) return null
  const cafsa = (await calculators()).find((c) => c.name.toUpperCase() === 'CAFSA')
  const familyList = families.filter((f) => f.legacyId != null && f.models.some((m) => m.legacyId != null)).map((f) => ({ id: f.legacyId, name: f.name }))
  const body = await renderTwigOverPage('LumenAppBundle:Default:comparador.html.twig', {
    models: models.slice(0, 4),
    calculator: cafsa ? calculatorEntity(cafsa) : null,
    modelList: ids,
    familyList,
    query: url.search.slice(1),
  }, '/comparador')
  return html(body)
}
