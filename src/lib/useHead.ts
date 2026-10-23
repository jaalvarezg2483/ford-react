import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useContent } from '@/data/content'
import { headFor } from './seo.mjs'

function setMeta(attr: 'name' | 'property', key: string, value: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!value) {
    el?.remove()
    return
  }
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', value)
}

/**
 * Actualiza título y metadatos al navegar. Usa la misma función que el servidor
 * (src/lib/seo.mjs), así el HTML inicial y el de la navegación interna coinciden.
 */
export function useRouteHead() {
  const content = useContent()
  const { pathname, search } = useLocation()
  useEffect(() => {
    const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname
    const head = headFor(path, new URLSearchParams(search), content, window.location.origin)
    document.title = head.title
    setMeta('name', 'description', head.description)
    setMeta('property', 'og:title', head.title)
    setMeta('property', 'og:description', head.description)
    setMeta('property', 'og:image', head.image)
    setMeta('property', 'og:url', head.url)
    // Si el servidor ya marcó noindex (dominio que no es el oficial) no se quita.
    if (head.noindex) setMeta('name', 'robots', 'noindex')
  }, [content, pathname, search])
}
