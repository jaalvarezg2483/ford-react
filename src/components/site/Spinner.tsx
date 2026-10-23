'use client'

import { useEffect, useState } from 'react'
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
  if (state === 'hidden') return null
  return (
    <div
      className="spinner"
      aria-hidden="true"
      style={{ display: 'block', opacity: state === 'fading' ? 0 : 1, transition: 'opacity 400ms' }}
      dangerouslySetInnerHTML={{ __html: SPINNER_SVG }}
    />
  )
}
