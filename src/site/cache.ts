/**
 * Caché en memoria del sitio público. Cada cambio en el CMS la invalida
 * (hooks afterChange → bumpSiteVersion) y cada entrada vive como máximo 60 s.
 *
 * Tiene tope de entradas (las URLs inexistentes también se guardan, y un bot
 * podría pedir miles) y comparte la carga en curso entre peticiones simultáneas.
 */
type Entry = { v: number; at: number; value: Promise<unknown> }
const g = globalThis as unknown as { __fordSiteVersion?: number; __fordSiteCache?: Map<string, Entry> }
g.__fordSiteVersion ??= 1
g.__fordSiteCache ??= new Map()

const TTL_MS = 60_000
const MAX_ENTRIES = 5_000

export function bumpSiteVersion() {
  g.__fordSiteVersion = (g.__fordSiteVersion ?? 1) + 1
}

export function cached<T>(key: string, load: () => Promise<T>): Promise<T> {
  const cache = g.__fordSiteCache!
  const hit = cache.get(key)
  if (hit && hit.v === g.__fordSiteVersion && Date.now() - hit.at < TTL_MS) {
    // Al usarla pasa al final: las menos usadas quedan al principio y salen primero.
    cache.delete(key)
    cache.set(key, hit)
    return hit.value as Promise<T>
  }
  const value = load()
  const entry: Entry = { v: g.__fordSiteVersion!, at: Date.now(), value }
  cache.delete(key)
  cache.set(key, entry)
  // Un error no se guarda: la próxima petición vuelve a intentar.
  value.catch(() => { if (cache.get(key) === entry) cache.delete(key) })
  while (cache.size > MAX_ENTRIES) cache.delete(cache.keys().next().value!)
  return value
}
