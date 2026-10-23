'use client'

import { useRef, type ReactNode } from 'react'
import { useEqualHeight } from './useEqualHeight'

/** Contenedor que iguala la altura de sus `.js-equal-height` (js-equal-height-parent). */
export function EqualHeight({ className, children }: { className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  useEqualHeight(ref)
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}
