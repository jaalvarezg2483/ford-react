import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { ContentBlockView } from '@/components/content/Blocks'
import { api, ApiError } from '@/lib/api'
import type { ContentPageData } from '@/data/types'
import { NotFound } from '@/pages/NotFound'

/** Página de contenido del CMS: pide el cuerpo a /content-page.json y dibuja los bloques. */
export function ContentPage() {
  const { pathname } = useLocation()
  const path = pathname.length > 1 ? pathname.replace(/\/$/, '') : pathname
  const [page, setPage] = useState<ContentPageData | null>(null)
  const [missing, setMissing] = useState(false)

  useEffect(() => {
    let cancelled = false
    setMissing(false)
    setPage(null)
    api
      .get<ContentPageData>(`/content-page.json?path=${encodeURIComponent(path)}`)
      .then((data) => {
        if (!cancelled) setPage(data)
      })
      .catch((err) => {
        if (!cancelled) setMissing(err instanceof ApiError && err.status === 404)
      })
    return () => {
      cancelled = true
    }
  }, [path])

  if (missing) return <NotFound />
  if (!page) return <main id="main-content" tabIndex={-1} />

  return (
    <main id="main-content" tabIndex={-1}>
      <div className="wrapper">
        {page.blocks.map((block, i) => (
          <ContentBlockView key={i} block={block} />
        ))}
      </div>
    </main>
  )
}
