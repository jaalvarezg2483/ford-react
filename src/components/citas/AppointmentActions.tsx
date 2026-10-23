import type { CitaTask, CitaVehicle, CitasSession } from './types'

const EMAIL_RE = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

export function validEmail(email: string) {
  return EMAIL_RE.test(email.toLowerCase())
}

type Props = {
  session: CitasSession
  completed: boolean
  email: string
  onEmail: (value: string) => void
  hour: string
  hours: { value: string; label: string }[]
  onHour: (value: string) => void
}

export function AppointmentActions({ session, completed, email, onEmail, hour, hours, onHour }: Props) {
  const vehicle = session.vehicleSelected as CitaVehicle | false
  const task = session.taskSelected as CitaTask | false
  const data = session.appointmentData || {}
  if (completed) {
    return (
      <div className="appointment-actions">
        <h2>¡Tu cita está confirmada!</h2>
        <p>
          Hemos enviado la confirmación a <strong>{email || data.email || ''}</strong>, si tienes alguna duda comunicate al número{' '}
          <a target="_blank" rel="noreferrer" href="tel:+50625197777">
            2519-7777
          </a>
        </p>
      </div>
    )
  }
  const showHourSelect = hours.length > 1
  return (
    <div className="appointment-actions">
      <p className="email-action">Correo electrónico:</p>
      <p>
        Por favor <span>ingresa un correo electrónico</span> al que deseas que se te envíe la información de la cita.
      </p>
      <div className="inputs-wrapper">
        <div className="email-form">
          <input id="client-email" type="email" className="input" placeholder="ejemplo@email.com" value={email} onChange={(e) => onEmail(e.target.value)} />
        </div>
        {showHourSelect ? (
          <div className="email-form">
            <select id="hour-selected" className="input hour-selected" value={hour} onChange={(e) => onHour(e.target.value)}>
              {hours.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <input id="hour-selected" type="hidden" value={hour} readOnly />
        )}
      </div>
      <input id="company" type="hidden" value={String(data.branch?.Empresa ?? '')} readOnly />
      <input id="branch" type="hidden" value={String(data.branch?.Suc_Id ?? '')} readOnly />
      <input id="plate" type="hidden" value={vehicle ? vehicle.Placa : ''} readOnly />
      <input id="task" type="hidden" value={task ? task.CTrabajo_Id : ''} readOnly />
      <input id="odometer" type="hidden" value={String(session.odometer ?? '')} readOnly />
    </div>
  )
}
