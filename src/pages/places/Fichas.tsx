import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { A } from '@/components/ui/A'
import { useTabs } from '@/hooks/useTabs'
import { useContent } from '@/data/content'
import type { Specs } from '@/data/types'
import { money } from '@/lib/format'
import { NotFound } from '@/pages/NotFound'

const SPEC_ROWS: { key: keyof Specs; icon: string; label: (v: string | number) => string }[] = [
  { key: 'cc', icon: 'motor.svg', label: (v) => `Motor: ${v} cc` },
  { key: 'gas', icon: 'combustible.svg', label: (v) => `Tipo de combustible: ${v}` },
  { key: 'traction', icon: 'tire.svg', label: (v) => `Tracción: ${v}` },
  { key: 'transmission', icon: 'tacometro.svg', label: (v) => `Transmisión: ${v}` },
  { key: 'pasajeros', icon: 'user.svg', label: (v) => `Pasajeros: ${v}` },
  { key: 'totalLength', icon: 'meters.png', label: (v) => `Largo total: ${v}` },
  { key: 'totalHeight', icon: 'meters.png', label: (v) => `Alto total: ${v}` },
  { key: 'totalWidth', icon: 'meters.png', label: (v) => `Ancho total: ${v}` },
  { key: 'distanceBetweenAxis', icon: 'meters.png', label: (v) => `Distancia entre ejes: ${v}` },
]

/** Fichas técnicas y precios por familia. Sin slug redirige a la primera familia. */
export function Fichas() {
  const { slug } = useParams()
  const { families } = useContent()
  const navigate = useNavigate()
  const tabs = useTabs(0)

  if (!slug) {
    const first = families[0]
    return first ? <Navigate to={`/fichas-tecnicas-precios/${first.slug}`} replace /> : <NotFound />
  }

  const family = families.find((f) => f.slug === slug)
  if (!family) return <NotFound />

  const model = family.models.find((m) => Object.keys(m.specs || {}).length) ?? family.models[0]
  const specs = model?.specs ?? {}
  const rows = SPEC_ROWS.filter((row) => specs[row.key] != null && specs[row.key] !== '')
  const sorted = [...families].sort((a, b) => a.name.localeCompare(b.name, 'es'))
  const carImg = family.menuImage || family.homeImage

  return (
    <main id="main-content" tabIndex={-1}>
      <div className="wrapper--car">
        <div className="text-left padding-1 bg--accent-light hidden-xs">
          <div className="container">
            <a
              href="#"
              className="text--primary"
              onClick={(e) => {
                e.preventDefault()
                window.history.back()
              }}
            >
              <i className="icon icon-arrow-left" /> Volver
            </a>
          </div>
        </div>
        <div className="text-left margin--bottom hidden-md">
          <div className="container">
            <a
              href="#"
              className="text--primary"
              onClick={(e) => {
                e.preventDefault()
                window.history.back()
              }}
            >
              <i className="icon icon-arrow-left" /> Volver
            </a>
          </div>
        </div>
        <div className="container margin--top">
          <h1 className="title">
            Precios y <br />
            Fichas técnicas
          </h1>
        </div>
        <div className="container margin--top">
          <div className="row">
            <div className="input-field col-md-4 select-cars select">
              <select
                className="js-select change_family"
                value={family.slug}
                onChange={(e) => navigate(`/fichas-tecnicas-precios/${e.target.value}`)}
              >
                {sorted.map((f) => (
                  <option key={f.slug} value={f.slug}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className="container spec-car-container">
          {carImg ? <img className="spec-car-img hidden-xs" src={carImg} alt={family.name} /> : null}
          <ul className="tabs">
            <li className={`tab ${tabs.tabClass(0)}`}>
              <a
                href="#tab-ficha"
                role="tab"
                onClick={(e) => {
                  e.preventDefault()
                  tabs.select(0)
                }}
              >
                Ficha técnica
              </a>
            </li>
            <li className={`tab ${tabs.tabClass(1)}`}>
              <a
                href="#tab-costo"
                role="tab"
                onClick={(e) => {
                  e.preventDefault()
                  tabs.select(1)
                }}
              >
                Costo por modelo
              </a>
            </li>
          </ul>
          <div className="tab-content">
            <div role="tabpanel" className={`tab-pane fade clearfix ${tabs.paneClass(0)}`} id="tab-ficha">
              <div className="car-specs-details">
                <div className="car-details-pre">
                  <h2 className="title margin--bottom">Ford {family.name}</h2>
                  <h4 className="title">Datos generales</h4>
                </div>
                <div className="specs-list-container margin--top">
                  <ul className="car-specs-list">
                    {rows.map((row) => {
                      const value = specs[row.key]
                      if (value == null) return null
                      return (
                        <li key={row.key}>
                          <img className="car-spec-icon" src={`/img/content/icons/${row.icon}`} alt="" />
                          {row.label(value)}
                        </li>
                      )
                    })}
                  </ul>
                </div>
              </div>
              {family.dataSheets.length ? (
                <div className="text-center">
                  <div className="margin--top">
                    {family.dataSheets.map((sheet) => (
                      <a key={sheet.url} className="btn btn--clear" href={sheet.url} target="_blank" rel="noopener noreferrer">
                        Descargar ficha <i className="icon icon-download" />
                      </a>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
            <div role="tabpanel" className={`tab-pane fade clearfix ${tabs.paneClass(1)}`} id="tab-costo">
              <div className="container bg--accent-light margin--bottom">
                <div className="row">
                  {family.models.map((m) => (
                    <div className="col-sm-4 card-cost" key={m.code || m.name}>
                      <div className="card-cost--content">
                        <img src={m.image || family.homeImage} alt={m.name} />
                        <div>
                          <h4 className="title">{m.name}</h4>
                          {m.price != null && !family.hidePrice ? (
                            <>
                              <small>desde</small>
                              <h4 className="title">${money(m.price)}</h4>
                            </>
                          ) : null}
                        </div>
                      </div>
                      <div className="text-center">
                        <A className="btn" href={`/autos/${family.slug}/calcular/${m.code}`}>
                          Calcular financiamiento
                        </A>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
