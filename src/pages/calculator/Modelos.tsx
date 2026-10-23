import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { A } from '@/components/ui/A'
import { CalculateNav } from '@/components/calculator/CalculateNav'
import { useContent, useFamily } from '@/data/content'
import type { Model } from '@/data/types'
import { money } from '@/lib/format'
import { writeCalc } from '@/lib/calc'

type Props = { mode?: 'calcular' | 'preaprobador' }

function calculableModels(models: Model[]) {
  const listed = models.filter((m) => m.calculable)
  return listed.length ? listed : models
}

/** Lista de modelos de una familia para cotizar o preaprobar. */
export function Modelos({ mode = 'calcular' }: Props) {
  const { slug } = useParams()
  const family = useFamily(slug)
  const { families } = useContent()
  const navigate = useNavigate()
  const [detail, setDetail] = useState<Model | null>(null)
  if (!family) return <Navigate to="/404" replace />

  const pre = mode === 'preaprobador'
  const models = calculableModels(family.models)
  const pickHref = (code: string) => (pre ? `/preaprobador/${family.slug}/calcular/${code}/resumen` : `/autos/${family.slug}/calcular/${code}`)
  const onPick = (code: string) => {
    writeCalc({ slug: family.slug, code, accIds: [] })
    navigate(pickHref(code))
  }

  return (
    <main id="main-content" tabIndex={-1}>
      <div>
        <div className="calculate--cancel bg--accent-light">
          <A className="btn btn--clear" href={pre ? '/preaprobador/familias' : `/autos/${family.slug}`}>
            <i className="icon icon-arrow-left" /> Cancelar
          </A>
        </div>
        <div className="text-center margin--top">
          <h2 className="title">{pre ? 'Pre Aprobación de Crédito' : 'Calcular Financiamiento'}</h2>
        </div>
        {pre ? null : <CalculateNav step={1} slug={family.slug} />}
      </div>
      <div className="calculate--top container">
        <div className="row margin--top">
          <div className="input-field col-md-4 select-cars select">
            <select
              className="js-select change_model"
              value={family.slug}
              onChange={(e) => navigate(pre ? `/preaprobador/${e.target.value}/modelos` : `/autos/${e.target.value}/modelos`)}
            >
              {families.map((f) => (
                <option key={f.slug} value={f.slug} disabled={f.slug === family.slug}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="row">
          <p className="padding-1">{pre ? 'Seleccioná el modelo para calcular financiamiento.' : 'Seleccioná tu modelo favorito para calcular la cuota de financiamiento.'}</p>
        </div>
      </div>
      <div className="calculate--content">
        <section className="container container-cards-calculate">
          <div className="row">
            {models.map((model) => (
              <div className="col-xs-12 col-sm-4" key={model.code}>
                <div className="calculate-card">
                  <div className="calculate-card-content">
                    {model.image ? <img src={model.image} className="calculate-card-img" alt={model.name} /> : null}
                    <div className="calculate-card-text">
                      <h4 className="title">{model.name}</h4>
                      {model.price != null && !family.hidePrice ? (
                        <>
                          <p>desde</p>
                          <h4 className="title">${money(model.price)}</h4>
                        </>
                      ) : null}
                    </div>
                  </div>
                  <div className="calculate-card-btns">
                    <button type="button" className="btn btn--clear js-btn-modal" onClick={() => setDetail(model)}>
                      Ver más <i className="icon icon-plus" />
                    </button>
                    <A
                      href={pickHref(model.code)}
                      className="btn btn--clear"
                      onClick={() => writeCalc({ slug: family.slug, code: model.code, accIds: [] })}
                    >
                      Seleccionar <i className="icon icon-arrow-right" />
                    </A>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
      {detail
        ? createPortal(
            <div className="modal fade in show modal--full" role="dialog" aria-modal="true" style={{ display: 'block' }} onClick={(e) => e.target === e.currentTarget && setDetail(null)}>
              <div className="modal-dialog" role="document">
                <div className="modal-content cars-slider-modal">
                  <div className="car-calculate-slide">
                    <button type="button" className="modal__close" onClick={() => setDetail(null)} aria-label="Cerrar">
                      <i className="mdi mdi-close" />
                    </button>
                    {detail.image ? (
                      <div className="slide-mask hidden-xs">
                        <img src={detail.image} className="slide-image" alt="" />
                      </div>
                    ) : null}
                    <div className="slide-content">
                      <div className="slide-content-text">
                        <h2 className="title">{detail.name}</h2>
                        {detail.price != null && !family.hidePrice ? <h4 className="title">desde $ {money(detail.price)}</h4> : null}
                        {detail.image ? <img src={detail.image} className="slide-image hidden-md" alt="" /> : null}
                        <ul className="slide-car-list">
                          {detail.features.map((feat) => (
                            <li key={feat}>{feat}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="btns-container">
                        <button type="button" className="btn btn--primary" onClick={() => onPick(detail.code)}>
                          Seleccionar Modelo
                        </button>
                        <button type="button" className="btn" onClick={() => setDetail(null)}>
                          Cerrar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </main>
  )
}
