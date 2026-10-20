/** Caché en memoria del sitio público. Cada cambio en el CMS la invalida (hooks afterChange). */
const g = globalThis as unknown as { __fordSiteVersion?: number; __fordSiteCache?: Map<string, { v: number; at: number; value: unknown }> }
g.__fordSiteVersion ??= 1
g.__fordSiteCache ??= new Map()

const TTL_MS = 60_000

export function bumpSiteVersion() {
  g.__fordSiteVersion = (g.__fordSiteVersion ?? 1) + 1
}

export async function cached<T>(key: string, load: () => Promise<T>): Promise<T> {
  const hit = g.__fordSiteCache!.get(key)
  if (hit && hit.v === g.__fordSiteVersion && Date.now() - hit.at < TTL_MS) return hit.value as T
  const value = await load()
  g.__fordSiteCache!.set(key, { v: g.__fordSiteVersion!, at: Date.now(), value })
  return value
}
