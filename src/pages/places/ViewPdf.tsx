import { useParams } from 'react-router-dom'
import { A } from '@/components/ui/A'
import { useFamily } from '@/data/content'
import { NotFound } from '@/pages/NotFound'

/** Visor de ficha técnica (PDF) en React: el archivo vive en el CMS (`/uploads/…`). */
export function ViewPdf() {
  const { slug, id } = useParams()
  const family = useFamily(slug)
  const sheet = family?.dataSheets.find((d) => d.id != null && String(d.id) === id)
  if (!family || !sheet?.url) return <NotFound />

  const title = sheet.title || `Ficha técnica ${family.name}`

  return (
    <main id="main-content" tabIndex={-1}>
      <div className="wrapper">
        <div className="container margin--top margin--bottom">
          <p>
            <A href={`/autos/${family.slug}`} className="text--primary">
              <i className="icon icon-arrow-left" /> Volver a Ford {family.name}
            </A>
          </p>
          <h1 className="title">{title}</h1>
          <p className="margin--bottom">
            <a className="btn btn--clear" href={sheet.url} download>
              Descargar ficha <i className="icon icon-download" />
            </a>
          </p>
          <object data={sheet.url} type="application/pdf" title={title} style={{ width: '100%', height: '80vh' }}>
            <p>
              El navegador no pudo mostrar el PDF.{' '}
              <a href={sheet.url} target="_blank" rel="noopener noreferrer">
                Abrirlo en una pestaña
              </a>
              .
            </p>
          </object>
        </div>
      </div>
    </main>
  )
}
