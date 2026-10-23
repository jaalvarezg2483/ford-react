import { useState } from 'react'
import type { CitaBranch, CitaTime } from './types'
import { DatePicker, parseParamDate } from './DatePicker'
import { formatDayName } from './dates'

type Times = { am: CitaTime[]; pm: CitaTime[] }

type Props = {
  branches: CitaBranch[]
  parameters: { minDate?: unknown; maxDate?: unknown } | null
  selectedId: string
  onSelect: (branch: CitaBranch) => void
  onDate: (branch: CitaBranch, date: Date) => void
  times: Times
  timesFor: string
  loadingTimes: boolean
  noTimes: boolean
  selectedHour: string
  onHour: (value: string, label: string) => void
  onConfirm: () => void
  confirmDisabled: boolean
}

export function BranchList({
  branches,
  parameters,
  selectedId,
  onSelect,
  onDate,
  times,
  timesFor,
  loadingTimes,
  noTimes,
  selectedHour,
  onHour,
  onConfirm,
  confirmDisabled,
}: Props) {
  const [month, setMonth] = useState(() => new Date())
  const [picked, setPicked] = useState<Date | null>(null)
  const [mapOpen, setMapOpen] = useState<string>('')
  const [showCalendar, setShowCalendar] = useState(true)
  const minDate = parseParamDate(parameters?.minDate)
  const maxDate = parseParamDate(parameters?.maxDate)

  return (
    <div className="info-locations">
      {branches.map((branch, i) => {
        const key = `${branch.Empresa}-${branch.Suc_Id}`
        const open = selectedId === key
        const lat = String(branch.Suc_Latitud ?? '').replace(',', '.')
        const lng = String(branch.Suc_Longitud ?? '').replace(',', '.')
        return (
          <div className="selection-branch" id={`suc${i + 1}`} key={key}>
            <div className={`radio-selection${open ? ' selection-radio' : ''}`}>
              <label htmlFor={`branch${key}`}>
                <i className="mdi mdi-map-marker" /> {branch.Suc_Nombre}
                <p className="txt-btn-regular">SELECCIONAR</p>
              </label>
              <input
                className="input-radios"
                type="radio"
                name="date-cita"
                data-idsuc={branch.Suc_Id}
                data-idcomp={branch.Empresa}
                data-namesuc={branch.Suc_Nombre}
                id={`branch${key}`}
                checked={open}
                onChange={() => {
                  setPicked(null)
                  setShowCalendar(true)
                  setMapOpen('')
                  onSelect(branch)
                }}
              />
            </div>
            <article className="info-branch" style={open ? { display: 'block' } : undefined}>
              <a
                className="view-map js-toggle-map"
                data-lat={lat}
                data-long={lng}
                onClick={() => setMapOpen((cur) => (cur === key ? '' : key))}
              >
                <i className="mdi mdi-map-marker" />
                VER MAPA
              </a>
              <div className="map" id={`map${i + 1}`} style={mapOpen === key ? { display: 'block', height: 220 } : undefined}>
                {mapOpen === key && lat && lng ? (
                  <iframe
                    title={branch.Suc_Nombre}
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(`${lat},${lng}`)}&z=16&output=embed`}
                    width="100%"
                    height="220"
                    style={{ border: 0 }}
                    loading="lazy"
                  />
                ) : null}
              </div>
              <p className="select-day">Selecciona la fecha para ver las horas disponibles en {branch.Suc_Nombre} </p>
              <div className="container-date" style={open && showCalendar ? undefined : { display: 'none' }}>
                <input className="datepicker" readOnly />
                <div className="content-picker">
                  {open && showCalendar ? (
                    loadingTimes ? (
                      <Spinner />
                    ) : (
                      <DatePicker
                        minDate={minDate}
                        maxDate={maxDate}
                        value={picked}
                        onPick={(date) => {
                          setPicked(date)
                          setShowCalendar(false)
                          onDate(branch, date)
                        }}
                        month={month}
                        onMonth={setMonth}
                      />
                    )
                  ) : null}
                </div>
                <span className="indicator-days">
                  <i />
                  Fechas disponibles
                </span>
              </div>
              <div className="container-times" style={open && !showCalendar ? { display: 'block' } : undefined}>
                <span className="selected-day">{picked ? formatDayName(picked) : ''}</span>
                <a
                  className="editDate"
                  onClick={() => {
                    setShowCalendar(true)
                  }}
                >
                  EDITAR FECHA
                </a>
                {noTimes && timesFor === key ? (
                  <p id="no-disponible" style={{ textAlign: 'center' }}>
                    No hay horas disponibles para el día seleccionado
                  </p>
                ) : (
                  <div className="time-wrapper" style={noTimes ? { display: 'none' } : undefined}>
                    <p>
                      <span>HORA CITA</span>
                    </p>
                    <span className="title-times morning">En la mañana</span>
                    <ul className="timesMorning">
                      {times.am.map((t) => (
                        <li key={t.value} data-hour={t.value} className={selectedHour === t.value ? 'select-hour' : ''} onClick={() => onHour(t.value, t.label)}>
                          {t.label}
                        </li>
                      ))}
                    </ul>
                    <span className="title-times afternoon">En la tarde</span>
                    <ul className="timesAfternoon">
                      {times.pm.map((t) => (
                        <li key={t.value} data-hour={t.value} className={selectedHour === t.value ? 'select-hour' : ''} onClick={() => onHour(t.value, t.label)}>
                          {t.label}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <a className="btn btn--primary send-hour" aria-disabled={confirmDisabled} onClick={confirmDisabled ? undefined : onConfirm}>
                  CONFIRMAR
                </a>
              </div>
            </article>
          </div>
        )
      })}
    </div>
  )
}

function Spinner() {
  return (
    <div className="sk-circle">
      {Array.from({ length: 12 }, (_, i) => (
        <div key={i} className={`sk-circle${i + 1} sk-child`} />
      ))}
    </div>
  )
}
