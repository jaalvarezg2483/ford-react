const hits = new Map<string, number[]>()

/** True si `key` ya superó `max` eventos en la ventana. */
export function rateLimited(key: string, max: number, windowMs: number): boolean {
  const now = Date.now()
  const next = (hits.get(key) ?? []).filter((t) => now - t < windowMs)
  if (next.length >= max) {
    hits.set(key, next)
    return true
  }
  next.push(now)
  hits.set(key, next)
  if (hits.size > 10_000) {
    for (const [k, times] of hits) {
      const kept = times.filter((t) => now - t < windowMs)
      if (kept.length) hits.set(k, kept)
      else hits.delete(k)
    }
  }
  return false
}

export function clientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim().slice(0, 64) || 'unknown'
  return (req.headers.get('x-real-ip') || 'unknown').slice(0, 64)
}

/** POST del mismo origen (SPA). Sin Origin/Referer coincidente se rechaza. */
export function isSameSite(req: Request): boolean {
  const host = (req.headers.get('x-forwarded-host') || req.headers.get('host') || '').split(',')[0].trim()
  if (!host) return false
  const origin = req.headers.get('origin')
  if (origin) {
    try { return new URL(origin).host === host } catch { return false }
  }
  const referer = req.headers.get('referer')
  if (!referer) return false
  try { return new URL(referer).host === host } catch { return false }
}
