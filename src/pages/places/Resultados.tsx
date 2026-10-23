import { useMemo, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { A } from '@/components/ui/A'
import { useContent } from '@/data/content'

const norm = (v: string) => v.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
const cleanTitle = (t: string) => t.replace(/\s*\|\s*Ford Costa Rica \| Grupo Purdy\s*$/i, '').trim()

type Hit = { title: string; href: string; crumbs: string[]; text: string }

function haystack(...parts: (string | null | undefined)[]) {
  return norm(parts.filter(Boolean).join(' '))
}

/** Buscador del sitio: familias, artículos, videos y páginas de contenido. */
export function Resultados() {
  const { families, posts, videos, pages } = useContent()
  const [params, setParams] = useSearchParams()
  const q = params.get('q') ?? ''

  const hits = useMemo(() => {
    const term = norm(q.trim())
    if (!term) return [] as Hit[]
    const out: Hit[] = []
    for (const f of families) {
      if (haystack(f.name, f.tagline, f.leadText, f.slug).includes(term)) {
        out.push({ title: f.name, href: `/autos/${f.slug}`, crumbs: ['Autos Nuevos', f.name], text: f.tagline || f.leadText })
      }
    }
    for (const p of posts) {
      if (haystack(p.title, p.summary).includes(term)) {
        out.push({ title: p.title, href: p.path, crumbs: ['Información'], text: p.summary })
      }
    }
    for (const v of videos) {
      if (haystack(v.name, v.description).includes(term)) {
        out.push({ title: v.name, href: '/videos', crumbs: ['Videos'], text: v.description })
      }
    }
    for (const p of pages) {
      if (haystack(p.title, p.description).includes(term)) {
        out.push({ title: cleanTitle(p.title), href: p.path, crumbs: ['Información'], text: p.description })
      }
    }
    return out
  }, [families, posts, videos, pages, q])

  function onSearch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const value = String(new FormData(e.currentTarget).get('q') ?? '')
    const next = new URLSearchParams()
    if (value.trim()) next.set('q', value.trim())
    setParams(next)
  }

  return (
    <main id="main-content" tabIndex={-1}>
      <div className="wrapper">
        <div className="search__head">
          <div className="container">
            <div className="search__field">
              <form action="/resultados" method="GET" onSubmit={onSearch}>
                <input className="input" type="text" placeholder="Buscar en el sitio" name="q" defaultValue={q} key={q} />
                <button type="submit">
                  <i className="mdi mdi-arrow-right" />
                </button>
              </form>
            </div>
          </div>
        </div>
        <div className="search__body">
          <div className="container">
            {q.trim() ? (
              <p className="search__result">
                <span>{hits.length}</span> Resultado{hits.length === 1 ? '' : 's'} para “<strong>{q.trim()}</strong>”
              </p>
            ) : (
              <p className="search__result">Escribí un término para buscar en el sitio.</p>
            )}
            {hits.map((hit) => (
              <A href={hit.href} className="search__item" key={`${hit.href}-${hit.title}`}>
                <h2 className="subtitle">{hit.title}</h2>
                <ol>
                  {hit.crumbs.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ol>
                {hit.text ? <p>{hit.text}</p> : null}
                <p className="text--red">VER MÁS</p>
              </A>
            ))}
            {q.trim() && !hits.length ? (
              <div className="search__no-results">
                <p>
                  No se encontraron resultados para “<strong>{q.trim()}</strong>”.
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </main>
  )
}
