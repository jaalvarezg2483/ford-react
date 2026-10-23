import { siteVersion } from './siteVersion'

/**
 * Caché en memoria de datos del CMS que usan los endpoints (familias, calculadoras, parámetros…).
 * Cada cambio en el CMS la invalida (hooks afterChange → bumpSiteVersion) y cada entrada vive como máximo 60 s.
 * Comparte la carga en curso entre peticiones simultáneas y tiene tope de entradas.
 */
type Entry = { v: number; at: number; value: Promise<unknown> }
const g = globalThis as unknown as { __fordDataCache?: Map<string, Entry> }
g.__fordDataCache ??= new Map()

const TTL_MS = 60_000
const MAX_ENTRIES = 2_000

export function cached<T>(key: string, load: () => Promise<T>): Promise<T> {
  const cache = g.__fordDataCache!
  const hit = cache.get(key)
  if (hit && hit.v === siteVersion() && Date.now() - hit.at < TTL_MS) {
    cache.delete(key)
    cache.set(key, hit)
    return hit.value as Promise<T>
  }
  const value = load()
  const entry: Entry = { v: siteVersion(), at: Date.now(), value }
  cache.delete(key)
  cache.set(key, entry)
  value.catch(() => { if (cache.get(key) === entry) cache.delete(key) })
  while (cache.size > MAX_ENTRIES) cache.delete(cache.keys().next().value!)
  return value
}
