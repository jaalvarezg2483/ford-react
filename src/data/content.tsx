import { createContext, useContext, type ReactNode } from 'react'
import type { Family, SiteContent } from './types'

let content: SiteContent | null = null

/** Carga el catálogo publicado por el CMS (/site-content.json). Se hace antes de montar la aplicación. */
export async function loadContent(): Promise<SiteContent> {
  const res = await fetch('/site-content.json', { headers: { Accept: 'application/json' } })
  if (!res.ok) throw new Error(`No se pudo cargar el contenido del sitio (${res.status})`)
  content = (await res.json()) as SiteContent
  return content
}

const Ctx = createContext<SiteContent | null>(null)

export function ContentProvider({ value, children }: { value: SiteContent; children: ReactNode }) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useContent(): SiteContent {
  const value = useContext(Ctx)
  if (!value) throw new Error('useContent debe usarse dentro de ContentProvider')
  return value
}

export function useFamily(slug: string | undefined): Family | undefined {
  const { families } = useContent()
  return slug ? families.find((f) => f.slug === slug) : undefined
}
