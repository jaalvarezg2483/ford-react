import { useEffect, useState } from 'react'
import { useBusy } from '@/lib/api'
import { SPINNER_SVG } from './spinner-svg'

/** Indicador de carga: se ve al entrar y se desvanece igual que en el sitio anterior. */
export function Spinner() {
  const [state, setState] = useState<'shown' | 'fading' | 'hidden'>('shown')
  useEffect(() => {
    const fade = window.setTimeout(() => setState('fading'), 600)
    const hide = window.setTimeout(() => setState('hidden'), 1000)
    return () => {
      window.clearTimeout(fade)
      window.clearTimeout(hide)
    }
  }, [])
  const busy = useBusy()
  if (state === 'hidden' && !busy) return null
  return (
    <div
      className="spinner"
      aria-hidden="true"
      style={{ display: 'block', opacity: state === 'fading' || (state === 'hidden' && !busy) ? 0 : 1, transition: 'opacity 400ms' }}
      dangerouslySetInnerHTML={{ __html: SPINNER_SVG }}
    />
  )
}
