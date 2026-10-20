import { renderTwigPage, setTwigParameters } from '@/legacy/twig'
import { getPage, type PageDoc } from './data'
import { siteParameters } from './legacy-data'
import { renderPage } from './render'

/**
 * Renderiza una plantilla Twig del Symfony dentro del documento del sitio,
 * tomando de la página capturada los metadatos, la clase del <body> y el menú activo.
 */
export async function renderTwigOverPage(template: string, ctx: Record<string, unknown>, basePath: string, overrides: Partial<PageDoc> = {}): Promise<string> {
  setTwigParameters(await siteParameters())
  const base = (await getPage(basePath)) ?? ({ id: 0, path: basePath, template: 'default' } as PageDoc)
  const route = overrides.route ?? base.route ?? base.bodyClass ?? ''
  const parts = renderTwigPage(template, { ...ctx, app: { request: { get: (k: string) => (k === '_route' ? route : null), locale: 'es' }, environment: 'prod' } })
  return renderPage({
    ...base,
    title: parts.title ? `${parts.title}${route === 'model_list' ? '' : ' | Ford Costa Rica | Grupo Purdy'}` : base.title,
    headStyles: parts.styles.trim() ? `\n\n            ${parts.styles.trim()}\n\n        ` : base.headStyles,
    content: `\n${parts.body}\n`,
    scripts: parts.scripts,
    ...overrides,
  })
}
