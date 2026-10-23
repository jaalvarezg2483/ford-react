'use client'

import type { ReactNode } from 'react'
import { toggleSubmenu } from './SiteChrome'

/** Enlace que abre el submenú de vehículos (p. ej. "Vehículos nuevos" en el pie). */
export function SubmenuLink({ children }: { children: ReactNode }) {
  return (
    <a
      href="#subNuevos"
      onClick={(e) => {
        e.preventDefault()
        toggleSubmenu()
      }}
    >
      {children}
    </a>
  )
}
