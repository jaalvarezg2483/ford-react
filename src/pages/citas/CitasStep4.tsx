import { useMemo, useState } from 'react'
import { A } from '@/components/ui/A'
import { api, ApiError } from '@/lib/api'
import { money } from '@/lib/format'
import { AppointmentActions, validEmail } from '@/components/citas/AppointmentActions'
import { CitasModal, MSG, serviceErrorMessage } from '@/components/citas/CitasModal'
import { CitasSteps } from '@/components/citas/CitasSteps'
import { formatFullDate, formatHour } from '@/components/citas/dates'
import { useCitasSession } from '@/components/citas/useCitasSession'
import type { ModalState } from '@/components/citas/types'

const closed: ModalState = { open: false, message: null }

export function CitasStep4() {
  const session = useCitasSession(4)
  const [email, setEmail] = useState('')
  const [hour, setHour] = useState('')
  const [completed, setCompleted] = useState(false)
  const [modal, setModal] = useState<ModalState>(closed)
  const [saving, setSaving] = useState(false)

  const hourOptions = useMemo(() => {
    if (!session) return []
    const am = session.timesAvailable?.am || []
    const pm = session.timesAvailable?.pm || []
    return [...am, ...pm].map((iso) => {
      const d = new Date(iso)
      let h = d.getHours()
      const suffix = h >= 12 ? 'pm' : 'am'
      h = h % 12 || 12
      const label = `${h}:${String(d.getMinutes()).padStart(2, '0')} ${suffix}`
      const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${label}`
      return { value, label }
    })
  }, [session])

  if (!session) return <main id="main-content" tabIndex={-1} />

  const data = session.appointmentData || {}
  const vehicle = session.vehicleSelected
  const task = session.taskSelected
  const currentAppointment = Boolean(session.currentAppointment)
  const selectedHour = hour || data.date || (hourOptions[0]?.value ?? '')
  const done = completed || Boolean(data.completed)

  async function create() {
    if (!email) {
      setModal({ open: true, message: MSG.emailRequired })
      return
    }
    if (!validEmail(email)) {
      setModal({ open: true, message: MSG.emailInvalid })
      return
    }
    setSaving(true)
    try {
      const response = await api.post<{ Exitoso?: boolean }>('/api/citas/create-appointment', {
        plate: vehicle ? vehicle.Placa : '',
        sucursal: String(data.branch?.Suc_Id ?? ''),
        empresa: String(data.branch?.Empresa ?? ''),
        date_time: selectedHour,
        work_id: task ? task.CTrabajo_Id : '',
        odometer: session?.odometer ?? 1,
        email,
      })
      if (response.Exitoso === false) setModal({ open: true, message: MSG.taken })
      else {
        setCompleted(true)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    } catch (err) {
      if (err instanceof ApiError) setModal({ open: true, message: serviceErrorMessage(err.status, err.message) })
      else setModal({ open: true, message: MSG.noConnection })
    } finally {
      setSaving(false)
    }
  }

  return (
    <main id="main-content" tabIndex={-1}>
      <div className="wrapper load-step-4">
        <div className="padding-1 bg--accent-light">
          <div className="container">
            <A className="text--primary text--bold" href="/citas/step3">
              <i className="icon icon-arrow-left" /> Volver
            </A>
          </div>
        </div>
        <div className="container margin--top separador_steps">
          <h1 className="titulo_agendar text-center">Agendar cita de mantenimiento</h1>
        </div>
        <CitasSteps activeStep={4} blockStep={{ 2: currentAppointment }} />
        <section className="container load-step-4">
          <form className="form-confirmation" onSubmit={(e) => e.preventDefault()}>
            <AppointmentActions
              session={session}
              completed={done}
              email={email || data.email || ''}
              onEmail={setEmail}
              hour={selectedHour}
              hours={hourOptions}
              onHour={setHour}
            />
            <div className="form-element title header-desk">
              <p className="margin--bottom">CONFIRMÁ LOS DATOS DE TU CITA</p>
            </div>
            <div className="info-wrapper">
              <div className="form-element title header-mobile">
                <p className="margin--bottom">CONFIRMÁ LOS DATOS DE TU CITA</p>
              </div>
              <div className="info-desk-left">
                <div className="form-element">
                  <div className="input-wrap margin--bottom">
                    <p>Taller</p>
                    <p className="input">
                      <span className="name-suc regular-txt">{data.branch?.Suc_Nombre || ''}</span>
                    </p>
                  </div>
                </div>
                <div className="form-element">
                  <div className="input-wrap margin--bottom">
                    <p>Fecha</p>
                    <p className="input">
                      <span className="day-suc regular-txt">{formatFullDate(data.date)}</span>
                    </p>
                  </div>
                </div>
                <div className="form-element">
                  <div className="input-wrap margin--bottom">
                    <p>Hora</p>
                    <p className="input">
                      <span className="hour-suc regular-txt">{formatHour(data.date)}</span>
                    </p>
                  </div>
                </div>
              </div>
              <div className="info-desk-right">
                <div className="form-element">
                  <div className="input-wrap margin--bottom">
                    <p>Vehículo</p>
                    <p className="input">
                      <span className="title-car-maintenance regular-txt">
                        {vehicle ? vehicle.Modelo : ''} {data.branch?.Anio || ''}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="form-element">
                  <div className="input-wrap margin--bottom">
                    <p>Placa</p>
                    <p className="input">
                      <span className="print-plate regular-txt">{vehicle ? vehicle.Placa : ''}</span>
                    </p>
                  </div>
                </div>
                <div className="form-element">
                  {currentAppointment ? null : (
                    <div className="input-wrap margin--bottom">
                      <p>*Costo</p>
                      <p className="input">
                        <span className="appointment-cost regular-txt">₡{money(Number(task ? task.Precio_CT_Sugerido : 0) || 0)}</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <div className="form-element footer-mobile">
                {currentAppointment ? null : (
                  <p className="text--disclaimer">
                    {task && task.disclaimer ? (
                      <>
                        {task.disclaimer}
                        <br />
                      </>
                    ) : null}
                    * Este es un valor de aproximado del servicio y puede estar sujeto a cambios sin previo aviso. El mismo no incluye cambios o reparaciones adicionales
                    al mantenimiento.
                  </p>
                )}
              </div>
            </div>
          </form>
          <div className="btns-steps">
            <A className="btn__cancelar_cita back-step3" href="/citas/step3" style={done ? { display: 'none' } : undefined}>
              Anterior
            </A>
            {done ? null : (
              <a
                className="btn__continuar_cita btn--ford create-appointment"
                onClick={(e) => {
                  e.preventDefault()
                  if (!saving) void create()
                }}
              >
                {saving ? 'CARGANDO...' : 'Confirmar Cita'}
              </a>
            )}
            <A className="btn__cancelar_cita back-services" href="/servicios" style={done ? undefined : { display: 'none' }}>
              Volver a servicios
            </A>
            <A className="btn__continuar_cita btn--ford another-appointment" href="/citas" style={done ? undefined : { display: 'none' }}>
              Solicitar otra cita
            </A>
          </div>
        </section>
        <CitasModal open={modal.open} title={modal.title} message={modal.message} optionOne={modal.optionOne} optionTwo={modal.optionTwo} onClose={() => setModal(closed)} />
      </div>
    </main>
  )
}
