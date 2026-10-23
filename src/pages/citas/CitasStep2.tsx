import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { A } from '@/components/ui/A'
import { api, ApiError } from '@/lib/api'
import { CitasModal, MSG, serviceErrorMessage } from '@/components/citas/CitasModal'
import { CitasSteps } from '@/components/citas/CitasSteps'
import { ExtraServiceCards, TaskCard } from '@/components/citas/TaskCard'
import { useCitasSession } from '@/components/citas/useCitasSession'
import type { ModalState } from '@/components/citas/types'

const closed: ModalState = { open: false, message: null }

export function CitasStep2() {
  const session = useCitasSession(2)
  const navigate = useNavigate()
  const [selected, setSelected] = useState('')
  const [expanded, setExpanded] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [modal, setModal] = useState<ModalState>(closed)

  if (!session) return <main id="main-content" tabIndex={-1} />

  const plate = session.vehicleSelected ? session.vehicleSelected.Placa : ''
  const hasAppointment = Boolean(session.currentAppointment)
  const canContinue = Boolean(selected)

  async function continueToStep3() {
    if (!selected) return
    setLoading(true)
    try {
      await api.post('/api/citas/save/details', { details: selected, info: '' })
      navigate('/citas/step3')
    } catch (err) {
      if (err instanceof ApiError) setModal({ open: true, message: serviceErrorMessage(err.status, err.message) })
      else setModal({ open: true, message: MSG.error })
    } finally {
      setLoading(false)
    }
  }

  function cancelForService() {
    setModal({
      open: true,
      title: 'CANCELAR CITA',
      message: '¿Está seguro que desea cancelar la cita?',
      optionOne: {
        title: 'SÍ, CANCELAR',
        onClick: async () => {
          setModal(closed)
          try {
            const response = await api.post<{ status?: boolean }>('/api/citas/cancel-appointment', { plate, reloadTasks: true })
            if (response.status) {
              setModal({ open: true, message: MSG.cancelled })
              setTimeout(() => window.location.reload(), 750)
            } else setModal({ open: true, message: MSG.error })
          } catch {
            setModal({ open: true, message: MSG.error })
          }
        },
      },
      optionTwo: { title: 'NO', onClick: () => setModal(closed) },
    })
  }

  return (
    <main id="main-content" tabIndex={-1}>
      <div className="wrapper load-step-2">
        <div className="padding-1 bg--accent-light">
          <div className="container">
            <A className="text--primary text--bold" href="/citas/step1">
              <i className="icon icon-arrow-left" /> Volver
            </A>
          </div>
        </div>
        <div className="container margin--top separador_steps">
          <h1 className="titulo_agendar text-center">Agendar cita de mantenimiento</h1>
        </div>
        <CitasSteps activeStep={2} />
        <section className="citas-select">
          <p className="title">Seleccioná el servicio que te gustaría recibir</p>
          <form className="cards-select-vehicle type-maintenance" onSubmit={(e) => e.preventDefault()}>
            {session.tasks.map((task, i) => (
              <TaskCard
                key={task.CTrabajo_Id || i}
                task={task}
                index={i}
                selected={selected === String(task.CTrabajo_Id)}
                plate={plate}
                expanded={expanded === i}
                onToggleExpand={() => setExpanded((cur) => (cur === i ? null : i))}
                onSelect={() => setSelected(String(task.CTrabajo_Id))}
              />
            ))}
            <ExtraServiceCards hasAppointment={hasAppointment} onCancel={cancelForService} />
            <div className="container">
              <p className="text--disclaimer">
                * Este es un valor aproximado del servicio seleccionado y puede estar sujeto a cambios sin previo aviso. Así mismo, el valor no refleja el costo de
                cambios o reparaciones adicionales al mantenimiento o cambio de aceite.
              </p>
            </div>
          </form>
          <div className="main-option-buttons">
            <div className="btns-steps text-center">
              <A className="btn__cancelar_cita" href="/citas/step1">
                Anterior
              </A>
              <a
                href="#"
                id="continue"
                className={`btn__continuar_cita btn--ford ${canContinue ? 'select-maintenance' : 'next-step-citas disabled'}`}
                onClick={(e) => {
                  e.preventDefault()
                  if (canContinue) void continueToStep3()
                }}
              >
                {loading ? 'CARGANDO...' : 'Continuar'}
              </a>
            </div>
          </div>
        </section>
        <CitasModal open={modal.open} title={modal.title} message={modal.message} optionOne={modal.optionOne} optionTwo={modal.optionTwo} onClose={() => setModal(closed)} />
      </div>
    </main>
  )
}
