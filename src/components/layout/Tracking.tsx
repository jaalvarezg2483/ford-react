import { useEffect } from 'react'

const safeId = (v: string) => v.replace(/[^\w-]/g, '')

function loadScript(id: string, init: (script: HTMLScriptElement) => void) {
  if (document.getElementById(id)) return
  const script = document.createElement('script')
  script.id = id
  script.async = true
  init(script)
  document.head.appendChild(script)
}

/** Google Tag Manager y monitoreo Site24x7, configurables en el CMS. Se cargan una sola vez. */
export function HeadTracking({ gtmId, site24x7Key }: { gtmId: string; site24x7Key: string }) {
  useEffect(() => {
    const gtm = safeId(gtmId)
    if (gtm) {
      const w = window as unknown as { dataLayer?: unknown[] }
      w.dataLayer = w.dataLayer || []
      w.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' })
      loadScript('gtm', (s) => { s.src = `https://www.googletagmanager.com/gtm.js?id=${gtm}` })
    }
    const rum = safeId(site24x7Key)
    if (rum) {
      const timer = window.setTimeout(() => loadScript('site24x7', (s) => { s.src = `https://static.site24x7rum.com/beacon/site24x7rum-min.js?appKey=${rum}` }), 3000)
      return () => window.clearTimeout(timer)
    }
  }, [gtmId, site24x7Key])
  return null
}

/** Cada cambio de página lo registra GTM (el sitio es una SPA: no hay carga completa). */
export function pageView(path: string) {
  const w = window as unknown as { dataLayer?: Record<string, unknown>[] }
  w.dataLayer?.push({ event: 'pageview', page: path })
}

export function GtmNoScript({ gtmId }: { gtmId: string }) {
  const gtm = safeId(gtmId)
  if (!gtm) return null
  return (
    <noscript>
      <iframe src={`https://www.googletagmanager.com/ns.html?id=${gtm}`} height="0" width="0" style={{ display: 'none', visibility: 'hidden' }} title="GTM" />
    </noscript>
  )
}

/** Píxel de retargeting Sizmek DSP de la portada. */
export function SizmekTracking({ rb, ca }: { rb?: string | null; ca?: string | null }) {
  useEffect(() => {
    const r = safeId(rb ?? '')
    const c = safeId(ca ?? '')
    if (!r || !c) return
    const w = window as unknown as Record<string, any>
    if (typeof w._rfi !== 'function') {
      w._rfi = function (...args: unknown[]) {
        w._rfi.commands = w._rfi.commands || []
        w._rfi.commands.push(args)
      }
    }
    loadScript('sizmek', (s) => { s.src = '//c1.rfihub.net/js/tc.min.js' })
    w._rfi('setArgs', 'ver', '9')
    w._rfi('setArgs', 'rb', r)
    w._rfi('setArgs', 'ca', c)
    w._rfi('setArgs', '_o', r)
    w._rfi('setArgs', '_t', c)
    w._rfi('track')
  }, [rb, ca])
  return null
}
