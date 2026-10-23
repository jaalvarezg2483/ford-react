import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { FamilyPicker } from '@/components/forms/FamilyPicker'
import { FormPage } from '@/components/forms/FormPage'
import { A } from '@/components/ui/A'
import { useContent, useFamily } from '@/data/content'
import { money } from '@/lib/format'
import { VehicleLead } from './VehicleLead'

/** /reserva — elegir familia para solicitar la reserva. */
export function ReservaFamily() {
  return (
    <FormPage
      title="Solicitar reserva de vehículo"
      intro={<p className="text text-center">Elegí la familia para ver los modelos disponibles.</p>}
      back={{ href: '/', label: <>Volver al <strong>inicio</strong></> }}
    >
      <FamilyPicker hrefFor={(f) => `/reserva/${f.slug}/modelos`} />
    </FormPage>
  )
}

/** /reserva/:slug/modelos — elegir modelo. */
export function ReservaModelos() {
  const { slug } = useParams()
  const family = useFamily(slug)
  const { families } = useContent()
  const navigate = useNavigate()
  if (!family) return <Navigate to="/404" replace />

  const options = families.filter((f) => f.models.length)
  return (
    <FormPage
      title="Solicitar reserva de vehículo"
      intro={<p>Seleccioná el modelo para continuar con la reserva.</p>}
      back={{ href: '/reserva', label: <>Volver a <strong>familias</strong></> }}
    >
      {options.length > 1 ? (
        <div className="row margin--top">
          <div className="input-field col-md-4 select-cars select">
            <select className="input js-select browser-default" value={family.slug} onChange={(e) => navigate(`/reserva/${e.target.value}/modelos`)}>
              {options.map((f) => (
                <option key={f.slug} value={f.slug}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      ) : null}
      <div className="row">
        {family.models.map((model) => (
          <div className="col-xs-12 col-sm-4" key={model.code || model.name}>
            <div className="calculate-card">
              <div className="calculate-card-content">
                {model.image || family.homeImage ? <img src={model.image || family.homeImage} alt={model.name} className="calculate-card-img" /> : null}
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
                <A href={`/autos/${family.slug}/calcular/${model.code}`} className="btn btn--clear">
                  Calcular <i className="icon icon-calculator" />
                </A>
                <A href={`/reserva/${family.slug}/${model.code}`} className="btn btn--clear">
                  Seleccionar <i className="icon icon-arrow-right" />
                </A>
              </div>
            </div>
          </div>
        ))}
      </div>
    </FormPage>
  )
}

/** /reserva/:slug/:code — formulario de reserva del modelo. */
export function ReservaForm() {
  return <VehicleLead type="reserva" />
}
