import { useMemo, useState } from 'react'
import { Navigate, useParams, useSearchParams } from 'react-router-dom'
import { useContent } from '@/data/content'
import { blogThumb } from '@/lib/format'
import { A } from '@/components/ui/A'
import { EqualHeight } from '@/components/ui/EqualHeight'
import { NotFound } from '@/pages/NotFound'

const PAGE_SIZE = 9
const norm = (v: string) => v.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
const slug = (v: string) => norm(v).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

/** Listado del blog: búsqueda, filtro por categoría, destacado y "Cargar más". */
export function Blog() {
  const { posts } = useContent()
  const { alias } = useParams()
  const [params, setParams] = useSearchParams()
  const q = params.get('q') ?? ''
  const selected = params.getAll('categories[]')
  const [visible, setVisible] = useState(PAGE_SIZE)

  const categories = useMemo(() => {
    const map = new Map<string, number>()
    posts.forEach((p) => p.category && map.set(p.category, (map.get(p.category) ?? 0) + 1))
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0], 'es'))
  }, [posts])

  const categoryFromPath = alias
    ? categories.find(([cat]) => slug(cat) === slug(decodeURIComponent(alias)) || norm(cat) === norm(decodeURIComponent(alias)))?.[0]
    : ''

  const filtered = useMemo(() => {
    const term = norm(q.trim())
    return posts.filter((p) => (!selected.length || selected.includes(p.category)) && (!term || norm(`${p.title} ${p.summary}`).includes(term)))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [posts, q, selected.join('|')])

  const featured = filtered.find((p) => p.featured)
  const shown = filtered.slice(0, visible)

  const update = (next: { q?: string; categories?: string[] }) => {
    const out = new URLSearchParams()
    const nq = next.q ?? q
    if (nq) out.set('q', nq)
    ;(next.categories ?? selected).forEach((c) => out.append('categories[]', c))
    setVisible(PAGE_SIZE)
    setParams(out, { replace: true })
  }
  const toggle = (name: string) => update({ categories: selected.includes(name) ? selected.filter((c) => c !== name) : [...selected, name] })

  if (alias) {
    if (!categoryFromPath) return <NotFound />
    const out = new URLSearchParams()
    if (q) out.set('q', q)
    out.append('categories[]', categoryFromPath)
    return <Navigate to={`/blog?${out}`} replace />
  }

  return (
    <main id="main-content" tabIndex={-1}>
      <div className="wrapper wrapper-blog">
        <section className="container">
          <h1 className="title margin--top">Blog</h1>
          <div className="blog__filter">
            <form id="blog-form" onSubmit={(e) => e.preventDefault()}>
              <div className="row">
                <div className="col-sm-6">
                  <div className="input-wrap-blog">
                    <i className="icon icon-search" />
                    <input type="text" placeholder="Buscar artículo" className="input" name="q" value={q} onChange={(e) => update({ q: e.target.value })} />
                  </div>
                </div>
              </div>
              <div className="blog-filters">
                <input className="categories-select" id="checkbox-all" type="checkbox" name="select-all" value="all" checked={!selected.length} onChange={() => update({ categories: [] })} />
                <label htmlFor="checkbox-all">Todos ({posts.length})</label>
                {categories.map(([name, count], i) => (
                  <span key={name}>
                    <input className="categories-select" id={`checkbox-${i}`} type="checkbox" name="categories[]" value={name} checked={selected.includes(name)} onChange={() => toggle(name)} />
                    <label htmlFor={`checkbox-${i}`}>
                      {name} ({count})
                    </label>
                  </span>
                ))}
              </div>
            </form>
          </div>

          {featured && (
            <div className="row blog-panel blog-featured-panel">
              <h2 className="title margin--bottom">Destacado</h2>
              <A className="blog-link-featured blog" href={featured.path}>
                <div className="article-img">
                  <img src={blogThumb(featured.image)} alt={featured.title} />
                </div>
                <div className="card__content">
                  <h5 className="title">{featured.title}</h5>
                  <p>{featured.summary}</p>
                  <p className="text--primary">
                    <strong>
                      Ver más <i className="icon icon-arrow-right" />
                    </strong>
                  </p>
                </div>
              </A>
            </div>
          )}

          <div className="margin--top row blog-panel" id="articulos">
            <h2 className="title margin--bottom">Todos los artículos</h2>
            <EqualHeight key={shown.map((p) => p.path).join('|')} minWidth={992}>
              <div id="results">
                {shown.map((post) => (
                  <section className="col-sm-12 col-md-3" key={post.path}>
                    <A className="blog-link js-equal-height blog" href={post.path}>
                      <div className="article-img">
                        <img src={blogThumb(post.image)} alt={post.title} loading="lazy" />
                      </div>
                      <div className="card__content">
                        <h5 className="title">{post.title}</h5>
                        <p className="text--primary text--bold">
                          Ver más <i className="icon icon-arrow-right" />
                        </p>
                      </div>
                    </A>
                  </section>
                ))}
              </div>
            </EqualHeight>
            {!shown.length && <p className="text-center">No se encontraron artículos.</p>}
          </div>
          {visible < filtered.length && (
            <div>
              <button type="button" id="load-more" className="btn btn-primary" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
                Cargar más
              </button>
            </div>
          )}
        </section>
        <div className="clearfix-blog" />
      </div>
    </main>
  )
}
