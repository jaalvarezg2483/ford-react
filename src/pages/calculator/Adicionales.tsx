import { useEffect, useMemo, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { A } from '@/components/ui/A'
import { AccessoryCards } from '@/components/calculator/AccessoryCards'
import { CalculateNav } from '@/components/calculator/CalculateNav'
import { accessoriesFor } from '@/data/accessories'
import { useContent, useFamily } from '@/data/content'
import { cafsaQuota, entityTerms, formatCuota, readCalc, useEntities, writeCalc } from '@/lib/calc'
import { money } from '@/lib/format'
import { useTabs } from '@/hooks/useTabs'

/** Paso 2: accesorios, total, plazo y cuota estimada CAFSA. */
export function Adicionales() {
  const { slug, code } = useParams()
  const family = useFamily(slug)
  const { cafsa } = useContent()
  const navigate = useNavigate()
  const model = family?.models.find((m) => m.code === code)
  const items = accessoriesFor(family?.slug)
  const [accIds, setAccIds] = useState<number[]>([])
  const [term, setTerm] = useState<number | undefined>()
  useEffect(() => {
    const saved = readCalc()
    if (saved && saved.slug === slug && saved.code === code) {
      setAccIds(saved.accIds)
      setTerm(saved.term)
    } else {
      setAccIds([])
      setTerm(undefined)
      if (slug && code) writeCalc({ slug, code, accIds: [] })
    }
  }, [slug, code])
  const [open, setOpen] = useState(false)
  const tabs = useTabs(0)
  const entities = useEntities()
  const cafsaEntity = entities.find((e) => e.name.toUpperCase() === 'CAFSA') ?? entities[0]
  const terms = entityTerms(cafsaEntity, cafsa?.term || 96)
  const plazo = term || cafsa?.term || terms[0] || 96

  const persist = (nextIds: number[], nextTerm = plazo) => {
    if (!family || !model) return
    writeCalc({ slug: family.slug, code: model.code, accIds: nextIds, term: nextTerm })
  }

  const selected = useMemo(() => items.filter((a) => accIds.includes(a.id)), [items, accIds])
  const extras = selected.reduce((sum, a) => sum + a.price, 0)
  const base = model?.price ?? 0
  const total = base + extras
  const quota = cafsa ? cafsaQuota(total, cafsa, plazo) : 0

  if (!family || !model) return <Navigate to="/404" replace />

  const toggle = (id: number) => {
    const next = accIds.includes(id) ? accIds.filter((x) => x !== id) : [...accIds, id]
    setAccIds(next)
    persist(next)
  }

  const onTerm = (value: number) => {
    setTerm(value)
    persist(accIds, value)
  }

  const basePath = `/autos/${family.slug}/calcular/${model.code}`

  return (
    <main id="main-content" tabIndex={-1}>
      <div className="calculate--header">
        <div className="calculate--cancel bg--accent-light">
          <A className="btn btn--clear" href={`/autos/${family.slug}`}>
            <i className="icon icon-arrow-left" /> Cancelar
          </A>
        </div>
        <div className="text-center margin--top">
          <h2 className="title">Calcular Financiamiento</h2>
        </div>
        <CalculateNav step={2} slug={family.slug} code={model.code} />
      </div>
      <div className="calculate--top container">
        <div className="row">
          <div className="input-field col-md-6 select-cars select">
            <select className="js-select change_model" value={model.code} onChange={(e) => navigate(`/autos/${family.slug}/calcular/${e.target.value}`)}>
              {family.models.map((m) => (
                <option key={m.code} value={m.code} disabled={m.code === model.code}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="row">
          <p className="padding-1">Acá podés agregar los accesorios para tu vehículo o bien, saltarte este paso</p>
        </div>
      </div>
      <div className="wrapper-calculate wrapper-calculate-step-2">
        <div className="container">
          <ul className="tabs" role="tablist">
            <li className={`tab ${tabs.tabClass(0)}`}>
              <a
                href="#accesorios"
                role="tab"
                onClick={(e) => {
                  e.preventDefault()
                  tabs.select(0)
                }}
              >
                Accesorios
              </a>
            </li>
            <li className={`tab ${tabs.tabClass(1)}`}>
              <a
                href="#mantenimiento"
                role="tab"
                onClick={(e) => {
                  e.preventDefault()
                  tabs.select(1)
                }}
              >
                Plan de mantenimiento
              </a>
            </li>
          </ul>
        </div>
        <section className="container container-calculate">
          <div className="row sticky-parent">
            <div className="tab-content col-md-8">
              <div role="tabpanel" className={`tab-pane fade clearfix ${tabs.paneClass(0)}`} id="accesorios">
                <div className="row content-accesories-car accessories_wdg">
                  <AccessoryCards items={items} selected={accIds} onToggle={toggle} emptyText="Este modelo no cuenta con ningún accesorio disponible en este momento, por favor pasá al siguiente paso." />
                </div>
              </div>
              <div role="tabpanel" className={`tab-pane fade clearfix ${tabs.paneClass(1)}`} id="mantenimiento">
                <div className="row content-accesories-car accessories_wdg">
                  <div className="col-xs-12">
                    <div className="card-stacked">
                      <div className="card-content">
                        <span>Este modelo no cuenta con ningún plan de mantenimiento disponible en este momento, por favor pasá al siguiente paso.</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="accesories-resume col-md-4">
              <button type="button" className="js-collapse-next hidden-md" onClick={() => setOpen((v) => !v)}>
                <span id="total-selected">
                  Adicionales <strong>({selected.length})</strong>
                </span>
                <span id="total">
                  Total <strong>${money(total)}</strong>
                </span>
                <i className="mdi mdi-chevron-down" />
              </button>
              <div className="collapsible__body" style={open ? { display: 'block' } : undefined}>
                <h3 className="title hidden-xs">Mi selección</h3>
                <hr />
                <ul className="accessory-list" id="resume">
                  {selected.length ? (
                    selected.map((a) => (
                      <li key={a.id}>
                        <span>{a.name}</span>
                        <span>${money(a.price)}</span>
                      </li>
                    ))
                  ) : (
                    <div className="accesory-list-empty text-center">
                      <i className="mdi mdi-alert-circle-outline mdi-36px" />
                      <p>No tienes artículos seleccionados</p>
                    </div>
                  )}
                </ul>
                {terms.length > 1 ? (
                  <div className="input-field select-cars select margin--top">
                    <label htmlFor="calc-term">Plazo</label>
                    <select id="calc-term" value={plazo} onChange={(e) => onTerm(Number(e.target.value))}>
                      {terms.map((t) => (
                        <option key={t} value={t}>
                          {t} meses
                        </option>
                      ))}
                    </select>
                  </div>
                ) : cafsa ? (
                  <p className="margin--top">
                    Plazo: <strong>{plazo} meses</strong>
                  </p>
                ) : null}
                {cafsa ? (
                  <p className="margin--top">
                    Cuota estimada {cafsa.name}: <strong>${formatCuota(quota)}</strong>
                  </p>
                ) : null}
              </div>
              <div className="accessories-resume-footer">
                <div className="hidden-xs">
                  <p className="text--bold">Detalle de orden</p>
                  <span id="total-selected">
                    Adicionales <strong>({selected.length})</strong>
                  </span>{' '}
                  |{' '}
                  <span id="total">
                    Total <strong>${money(total)}</strong>
                  </span>
                </div>
                <A href={`/autos/${family.slug}/modelos`} className="btn">
                  Anterior
                </A>
                <A href={`${basePath}/resumen`} className="btn btn--primary" onClick={() => persist(accIds)}>
                  Siguiente paso
                </A>
                <A href={`${basePath}/asesor`} className="btn">
                  Contactar asesor
                </A>
                <A href={`${basePath}/reserva`} className="btn">
                  Reservar
                </A>
                <A href={`${basePath}/prueba-manejo`} className="btn">
                  Prueba de manejo
                </A>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
