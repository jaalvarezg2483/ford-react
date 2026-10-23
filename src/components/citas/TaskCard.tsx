import { money } from '@/lib/format'
import type { CitaTask } from './types'

const PREVIEW = 4

type Props = {
  task: CitaTask
  index: number
  selected: boolean
  plate: string
  expanded: boolean
  onToggleExpand: () => void
  onSelect: () => void
}

export function TaskCard({ task, index, selected, plate, expanded, onToggleExpand, onSelect }: Props) {
  if (!task.CTrabajo_Id) return null
  const services = task.services || []
  const preview = services.slice(0, PREVIEW)
  const n = index + 1
  return (
    <div id={`selec-card-${n}`} className={`select-card${selected ? ' card-selected-border' : ''}`}>
      <div className="top">
        <div className="img-container">
          <img src="/img/icons/engine-icon.png" alt="engine__icon" />
        </div>
        <h6 data-id={task.CTrabajo_Id}>{task.Detalle}</h6>
      </div>
      <h5>Detalle de mantenimiento</h5>
      <p className="print-plate hidden-object">{plate}</p>
      <div className="more-info-container">
        <div className={`minified-list ${expanded ? 'hidden-object' : 'visible-object'}`}>
          {preview.map((info, i) => (
            <ServiceLine key={i} info={info} />
          ))}
        </div>
        <div className={`full-list ${expanded ? 'visible-object' : 'hidden-object'}`}>
          {services.map((info, i) => (
            <ServiceLine key={i} info={info} />
          ))}
        </div>
        {services.length > PREVIEW ? (
          <div className="see-all-services-container">
            <span id={`chevron-${n}`} className={`see-all-services see-all-services-js ${expanded ? 'see-all-selected' : 'see-less-selected'}`} onClick={onToggleExpand}>
              {expanded ? 'Ver menos' : 'VER TODOS LOS SERVICIOS'}
            </span>
            <i className={`chevron-icon mdi ${expanded ? 'mdi-chevron-up' : 'mdi-chevron-down'} chevron-${n}`} />
          </div>
        ) : null}
        <div className={`price-selector-container step-two-simulated-radio-button${selected ? ' selected-radio-button' : ' non-selected-radio-button'}`} onClick={onSelect}>
          <input
            id={`type-maintenance-${task.CTrabajo_Id}`}
            className="vehicle-maintenance-radio"
            name="type-maintenance"
            type="radio"
            value={task.CTrabajo_Id}
            data-detail={task.Detalle}
            checked={selected}
            onChange={onSelect}
          />
          <label className="step-two-simulated-radio-button-text" htmlFor={`type-maintenance-${task.CTrabajo_Id}`}>
            <p>
              *COSTO: &nbsp;<b>₡{money(Number(task.Precio_CT_Sugerido) || 0)}</b>
            </p>
          </label>
        </div>
        {task.disclaimer ? <p className="text--disclaimer text--disclaimer--spaced">{task.disclaimer}</p> : null}
      </div>
    </div>
  )
}

function ServiceLine({ info }: { info: string }) {
  return (
    <div className="detail-container">
      <div className="check-container">
        <img src="/img/icons/blue-check.png" alt="red__check" />
      </div>
      <p>{info}</p>
    </div>
  )
}

export function ExtraServiceCards({ hasAppointment, onCancel }: { hasAppointment: boolean; onCancel: () => void }) {
  return (
    <>
      <div className="select-card select-card-service-width">
        <div className="top">
          <div className="img-container">
            <img src="/img/icons/engine-icon.png" alt="engine__icon" />
          </div>
          <h6>REVISIÓN POR FALLA</h6>
        </div>
        {hasAppointment ? (
          <>
            <a className="btn btn--primary btn--full cancel-for-service" onClick={onCancel}>
              CANCELAR CITA
            </a>
            <p className="text--disclaimer">*Si ya cuentas con una cita activa, debes cancelarla para hacer uso de este servicio.</p>
          </>
        ) : (
          <>
            <p>Si su vehículo tiene algún detalle mecánico, por favor agende su cita por estos medios.</p>
            <a className="btn--whatsapp" href="https://api.whatsapp.com/send?phone=+50685891000&text=Hola, quiero agendar una cita de Revisión por Falla" target="_blank" rel="noreferrer">
              <img src="/img/icons/whatsapp-icon.png" alt="whatsapp__icon" />
              <p>AGENDAR VÍA WHATSAPP</p>
            </a>
            <a className="btn--call" href="tel:+50625197777">
              <div className="icon-and-text">
                <img src="/img/icons/phone.png" alt="ford__phone__icon" />
                <p>
                  Agendar por teléfono<span>2519-7777</span>
                </p>
              </div>
              <img src="/img/icons/ford-redirect-icon.png" alt="redirect__icon" />
            </a>
          </>
        )}
      </div>
      <div className="select-card select-card-service-width">
        <div className="top">
          <div className="img-container">
            <img src="/img/icons/mobile-workshop-icon.png" alt="engine__icon" />
          </div>
          <h6>TALLER MÓVIL</h6>
        </div>
        {hasAppointment ? (
          <>
            <a className="btn btn--primary btn--full cancel-for-service" onClick={onCancel}>
              CANCELAR CITA
            </a>
            <p className="text--disclaimer">*Si ya cuentas con una cita activa, debes cancelarla para hacer uso de este servicio.</p>
          </>
        ) : (
          <>
            <p>Podés agendar el servicio de Taller Móvil para mantenimientos preventivos, cambios de aceite u otros servicios de taller, por los siguientes medios:</p>
            <a className="btn--whatsapp" href="https://api.whatsapp.com/send?phone=+50685891000&text=Hola, quiero agendar el taller móvil" target="_blank" rel="noreferrer">
              <img src="/img/icons/whatsapp-icon.png" alt="whatsapp__icon" />
              <p>AGENDAR VÍA WHATSAPP</p>
            </a>
            <a className="btn--call" href="tel:+50625197777">
              <div className="icon-and-text">
                <img src="/img/icons/phone.png" alt="ford__phone__icon" />
                <p>
                  Agendar por teléfono<span>2519-7777</span>
                </p>
              </div>
              <img src="/img/icons/ford-redirect-icon.png" alt="redirect__icon" />
            </a>
          </>
        )}
      </div>
    </>
  )
}
