import { useParams } from 'react-router-dom'
import { A } from '@/components/ui/A'
import { useFamily } from '@/data/content'
import { NotFound } from '@/pages/NotFound'

/** Visor simple de la ficha técnica (PDF) de una familia. */
export function ViewPdf() {
  const { slug, id } = useParams()
  const family = useFamily(slug)
  const sheet = family?.dataSheets.find((d) => d.id != null && String(d.id) === id)
  if (!family || !sheet?.url) return <NotFound />

  return (
    <main id="main-content" tabIndex={-1}>
      <div className="wrapper">
        <div className="container margin--top margin--bottom">
          <p>
            <A href={`/autos/${family.slug}`} className="text--primary">
              <i className="icon icon-arrow-left" /> Volver al sitio
            </A>
          </p>
          <h1 className="title">Ficha técnica {family.name}</h1>
          <iframe title={sheet.title || `Ficha técnica ${family.name}`} src={sheet.url} style={{ width: '100%', height: '80vh', border: 0 }} />
        </div>
      </div>
    </main>
  )
}
