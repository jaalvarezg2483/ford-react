/**
 * Versión del contenido publicado. Cada cambio en el CMS la incrementa (hooks
 * afterChange/afterDelete) y el catálogo `/site-content.json` se vuelve a armar.
 */
const g = globalThis as unknown as { __fordSiteVersion?: number }
g.__fordSiteVersion ??= 1

export function bumpSiteVersion() {
  g.__fordSiteVersion = (g.__fordSiteVersion ?? 1) + 1
}

export function siteVersion(): number {
  return g.__fordSiteVersion ?? 1
}
