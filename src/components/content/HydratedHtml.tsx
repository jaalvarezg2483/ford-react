import { useEffect, useRef } from 'react'
import { useEqualHeight } from '@/hooks/useEqualHeight'

/**
 * HTML editorial ya limpio (sin scripts). Activa el acordeón `.js-collapse-next`,
 * iguala alturas y convierte `javascript:history.back()` en un botón real.
 */
export function HydratedHtml({ html, className }: { html: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useEqualHeight(ref, '.js-equal-height', [html], 768)
  useEffect(() => {
    const root = ref.current
    if (!root) return
    const onClick = (e: Event) => {
      const target = e.target as HTMLElement
      const back = target.closest<HTMLAnchorElement>('a.js-history-back, a[href^="javascript:history"]')
      if (back) {
        e.preventDefault()
        window.history.back()
        return
      }
      const btn = target.closest<HTMLElement>('.js-collapse-next')
      if (!btn || !root.contains(btn)) return
      e.preventDefault()
      btn.classList.toggle('is-open')
      const body = btn.nextElementSibling as HTMLElement | null
      if (body?.classList.contains('collapsible__body')) body.classList.toggle('is-open')
    }
    root.addEventListener('click', onClick)
    return () => root.removeEventListener('click', onClick)
  }, [html])
  return <div ref={ref} className={className} dangerouslySetInnerHTML={{ __html: html }} />
}
