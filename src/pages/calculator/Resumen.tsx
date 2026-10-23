import { useEffect, useMemo, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { A } from '@/components/ui/A'
import { CalculateNav } from '@/components/calculator/CalculateNav'
import { accessoriesFor } from '@/data/accessories'
import { useContent, useFamily } from '@/data/content'
import { cafsaQuota, entityTerms, formatCuota, readCalc, useEntities, writeCalc } from '@/lib/calc'
import { money } from '@/lib/format'

type Props = { mode?: 'calcular' | 'preaprobador' }

/** Resumen de cotización: vehículo, accesorios, total, cuota CAFSA y llamados a la acción. */
export function Resumen({ mode = 'calcular' }: Props) {
  const { slug, code } = useParams()
  const family = useFamily(slug)
  const { cafsa, site } = useContent()
  const model = family?.models.find((m) => m.code === code)
  const items = accessoriesFor(family?.slug)
  const [accIds, setAccIds] = useState<number[]>([])
  const [term, setTerm] = useState<number | undefined>()
  useEffect(() => {
    const saved = readCalc()
    const ids = saved && saved.slug === slug && (saved.code === code || !saved.code) ? saved.accIds : []
    setAccIds(ids)
    setTerm(saved?.term)
    if (slug && code) writeCalc({ slug, code, accIds: ids, term: saved?.term })
  }, [slug, code])
  const entities = useEntities()
  const cafsaEntity = entities.find((e) => e.name.toUpperCase() === 'CAFSA') ?? entities[0]
  const terms = entityTerms(cafsaEntity, cafsa?.term || 96)
  const plazo = term || cafsa?.term || terms[0] || 96

  const selected = useMemo(() => items.filter((a) => accIds.includes(a.id)), [items, accIds])
  const extras = selected.reduce((sum, a) => sum + a.price, 0)
  const base = model?.price ?? 0
  const total = base + extras
  const quota = cafsa ? cafsaQuota(total, cafsa, plazo) : 0

  if (!family || !model) return <Navigate to="/404" replace />

  const pre = mode === 'preaprobador'
  const basePath = `/autos/${family.slug}/calcular/${model.code}`
  const phone = site.whatsapp?.phone.replace(/\D/g, '')
  const whatsapp = phone
    ? `https://api.whatsapp.com/send?phone=+${phone}&text=${encodeURIComponent(`Hola, coticé el modelo en el sitio ${model.code} ${model.name} y quiero conversar con un asesor`)}`
    : ''

  return (
    <main id="main-content" tabIndex={-1}>
      <div className="calculate--header">
        <div className="calculate--cancel bg--accent-light">
          <A className="btn btn--clear" href={`/autos/${family.slug}`}>
            <i className="icon icon-arrow-left" /> Cancelar
          </A>
        </div>
        <div className="text-center margin--top">
          <h2 className="title">{pre ? 'Pre Aprobación de Crédito' : 'Calcular Financiamiento'}</h2>
        </div>
        {pre ? null : <CalculateNav step={3} slug={family.slug} code={model.code} />}
      </div>
      <div className="wrapper-calculate">
        <section>
          <div className="calculate__top container">
            <div className="row">
              <div className="col-sm-6 collapse-resumen">
                <div className="calculate-resumen-head">
                  <h2 className="title">
                    <span>Ford</span> {model.name}
                  </h2>
                  {model.image ? <img src={model.image} className="img-responsive" alt={model.name} /> : null}
                </div>
                <div className="collapsible__body collapsible--calculate" style={{ display: 'block' }}>
                  <table className="table--calculate">
                    <tbody>
                      <tr>
                        <td id="pc-model-name">{model.name}</td>
                        <td>
                          <strong id="pc-model-start-price">{model.price != null ? `$${money(model.price)}` : '—'}</strong>
                        </td>
                        <td>&nbsp;</td>
                      </tr>
                      {selected.map((a) => (
                        <tr key={a.id}>
                          <td>{a.name}</td>
                          <td>
                            <strong>${money(a.price)}</strong>
                          </td>
                          <td>&nbsp;</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="small">
                    Total <strong>${money(total)}</strong>
                    {cafsa ? (
                      <>
                        {' '}
                        · Cuota estimada {cafsa.name}: <strong>${formatCuota(quota)}</strong>
                      </>
                    ) : null}
                  </p>
                  {terms.length > 1 ? (
                    <div className="input-field select-cars select">
                      <label htmlFor="resumen-term">Plazo</label>
                      <select
                        id="resumen-term"
                        value={plazo}
                        onChange={(e) => {
                          const next = Number(e.target.value)
                          setTerm(next)
                          writeCalc({ slug: family.slug, code: model.code, accIds, term: next })
                        }}
                      >
                        {terms.map((t) => (
                          <option key={t} value={t}>
                            {t} meses
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : null}
                </div>
                {family.purdyGoUrl ? (
                  <div className="row">
                    <a href={family.purdyGoUrl} className="btn btn--icon" target="_blank" rel="noopener noreferrer" style={{ backgroundColor: '#00095B', color: 'white', marginLeft: 15, height: 55, borderRadius: 4 }}>
                      Ir a PURDY GO y Reservar en Línea
                    </a>
                  </div>
                ) : null}
              </div>
              <div className="col-sm-6 hidden-xs">
                {model.image ? <img src={model.image} className="img-responsive" alt={model.name} /> : null}
              </div>
            </div>
          </div>
          <div className="container">
            <div className="row js-equal-height-parent-desktop row-card--links">
              {whatsapp ? (
                <div className="col-sm-6">
                  <a href={whatsapp} className="sr-sequenceFadeInBottom card--action" target="_blank" rel="noopener noreferrer">
                    <div className="card__content">
                      <span className="whatsapp">
                        <i className="icon icon-whatsapp" />
                      </span>
                      <p>Contactar Asesor por Whatsapp</p>
                      <i className="icon icon-arrow-right" />
                    </div>
                  </a>
                </div>
              ) : null}
              <div className="col-sm-6">
                <A href={`${basePath}/asesor`} className="sr-sequenceFadeInBottom card--action">
                  <div className="card__content">
                    <span>
                      <i className="icon icon-phone" />
                    </span>
                    <p>Solicitar Seguimiento y Enviar Cotización al correo</p>
                    <i className="icon icon-arrow-right" />
                  </div>
                </A>
              </div>
              <div className="col-sm-6">
                <A href={`${basePath}/prueba-manejo`} className="sr-sequenceFadeInBottom card--action">
                  <div className="card__content">
                    <span>
                      <i className="icon icon-car" />
                    </span>
                    <p>Solicitar Test Drive</p>
                    <i className="icon icon-arrow-right" />
                  </div>
                </A>
              </div>
              <div className="col-sm-6">
                <A href={pre ? '/preaprobador/familias' : '/calcular'} className="sr-sequenceFadeInBottom card--action">
                  <div className="card__content">
                    <span>
                      <i className="icon icon-plus" />
                    </span>
                    <p>Iniciar nueva cotización</p>
                    <i className="icon icon-arrow-right" />
                  </div>
                </A>
              </div>
              <div className="col-sm-6">
                <A href={`${basePath}/reserva`} className="sr-sequenceFadeInBottom card--action">
                  <div className="card__content">
                    <span>
                      <i className="icon icon-chart" />
                    </span>
                    <p className="card__text">Solicitar reserva de vehículo</p>
                    <i className="icon icon-arrow-right" />
                  </div>
                </A>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
