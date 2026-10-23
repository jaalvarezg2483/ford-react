import type { CitaVehicle } from './types'
import { formatFullDate, formatHour, modelLabel } from './dates'

type Props = {
  vehicle: CitaVehicle
  index: number
  selected: boolean
  odometer: string
  onSelect: () => void
  onOdometer: (value: string) => void
  onUnlink: () => void
  onEdit?: () => void
  onCancel?: () => void
  hideSelect?: boolean
}

export function VehicleCard({ vehicle, index, selected, odometer, onSelect, onOdometer, onUnlink, onEdit, onCancel, hideSelect }: Props) {
  const appointment = vehicle.Citas_Activas
  const n = index + 1
  return (
    <div className="grid-box">
      <div className={`select-card${selected ? ' card-selected-border' : ''}`} id={`card${n}`}>
        <a className="delete-car" data-tooltip="Desvincular vehículo" onClick={onUnlink}>
          DESVINCULAR VEHICULO <i className="mdi mdi-window-close" />
        </a>
        <div className="model__plate-container">
          <span className="modelcar" data-model={modelLabel(vehicle.Modelo)}>
            {modelLabel(vehicle.Modelo)}
          </span>
          <span className="plate" data-plate={vehicle.Placa}>
            Placa: {vehicle.Placa}
          </span>
        </div>
        <span className="plate hidden-object" data-plate={vehicle.Placa}>
          Placa: {vehicle.Placa}
        </span>
        <div id={`mileage${n}`} className={`mileage ${selected ? 'visible-object' : 'hidden-object'}`}>
          <span>Ingresá el kilometraje de tu vehículo</span>
          <input placeholder="Kilometraje actual" type="number" value={odometer} onChange={(e) => onOdometer(e.target.value)} />
          <span className="km-mask">km</span>
        </div>
        {appointment ? (
          <div id={`active-appointment-${vehicle.Placa}`} className="active-appointment">
            <h3>CITA EN TALLER</h3>
            <p>{appointment.work?.detail || ''}</p>
            <p>{appointment.subsidiaryName || ''}</p>
            <p>Fecha: {formatFullDate(appointment.date)}</p>
            <p>Hora: {formatHour(appointment.date)}</p>
            <div className="appointment-options-container">
              <a className={`appointment-option update-event${selected ? '' : ' disabled'}`} onClick={selected ? onEdit : undefined}>
                EDITAR CITA
              </a>
              <a className={`appointment-option cancel-event${selected ? '' : ' disabled'}`} data-plate={vehicle.Placa} onClick={selected ? onCancel : undefined}>
                CANCELAR CITA
              </a>
            </div>
          </div>
        ) : null}
        <a id={`simulated-radio-button-container-${n}`} className={`selection-car${selected ? ' select-car' : ''}${hideSelect ? ' hidden-object' : ''}`} onClick={onSelect}>
          <div
            id={`step-one-simulated-radio-button-${n}`}
            data-plate={vehicle.Placa}
            className={`step-one-simulated-radio-button${appointment ? ' active-appointment' : ''}${selected ? ' selected-radio-button' : ' non-selected-radio-button'}`}
          />
          <p className="step-one-simulated-radio-button-text">{selected ? 'SELECCIONADO' : 'SELECCIONAR'}</p>
        </a>
      </div>
    </div>
  )
}
