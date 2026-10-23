import { useRef, type ElementType, type ReactNode } from 'react'
import { useEqualHeight } from '@/hooks/useEqualHeight'

/** Contenedor que iguala la altura de sus `.js-equal-height` (js-equal-height-parent). */
export function EqualHeight({ className, children, tag: Tag = 'div', minWidth }: { className?: string; children: ReactNode; tag?: ElementType; minWidth?: number }) {
  const ref = useRef<HTMLElement>(null)
  useEqualHeight(ref, '.js-equal-height', [], minWidth)
  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  )
}
