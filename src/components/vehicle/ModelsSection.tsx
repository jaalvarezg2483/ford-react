import { useState } from 'react'
import type { Family } from '@/data/types'
import { money } from '@/lib/format'
import { A } from '@/components/ui/A'
import { Carousel, IconArrows } from '@/components/ui/Carousel'

const purdyGoStyle = { backgroundColor: '#00095B', color: 'white' }

/** Modelos de la familia: carrusel con foto y precio, y debajo sus datos (sincronizados). */
export function ModelsSection({ family }: { family: Family }) {
  const [index, setIndex] = useState(0)
  const models = family.models
  if (!models.length) return null
  return (
    <section className="car-profile-models margin--top">
      <div className="container">
        <h2 className="title">Modelos ({models.length})</h2>
        <p className="text" />
      </div>
      <div className="car-profile-models-slider">
        <Carousel className="slider slider--model js-slider-model js-slider-model-car" prevArrow={IconArrows.prev} nextArrow={IconArrows.next} index={index} onChange={setIndex}>
          {models.map((model) => (
            <div className="js-slider-model-inner" key={model.code || model.name}>
              <h3 className="title">{model.name}</h3>
              {model.price != null && !family.hidePrice ? <p>desde ${money(model.price)}</p> : null}
              <img src={model.image || family.homeImage} alt={model.name} />
            </div>
          ))}
        </Carousel>
      </div>
      {family.purdyGoUrl ? (
        <div className="container">
          <div className="row center">
            <a href={family.purdyGoUrl} className="btn btn--icon" target="_blank" rel="noopener noreferrer" style={purdyGoStyle}>
              Ir a PURDY GO y Reservar en Línea
            </a>
          </div>
        </div>
      ) : null}
      <div className="container">
        <div className="row">
          <div className="col-md-12">
            <Carousel className="slider slider--model-specs js-slider-model js-slider-model-specs" arrows={false} fade index={index} onChange={setIndex}>
              {models.map((model) => (
                <div key={model.code || model.name}>
                  <div className="text-left">
                    {family.showCalculate && model.calculable ? (
                      <A className="btn btn--primary margin--top" href={`/autos/${family.slug}/calcular/${model.code}`}>
                        {' '}
                        Calcular financiamiento
                      </A>
                    ) : null}
                  </div>
                </div>
              ))}
            </Carousel>
          </div>
        </div>
      </div>
    </section>
  )
}
