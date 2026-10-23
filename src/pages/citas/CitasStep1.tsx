import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { A } from '@/components/ui/A'
import { api, ApiError } from '@/lib/api'
import { CitasModal, MSG, serviceErrorMessage } from '@/components/citas/CitasModal'
import { CitasSteps } from '@/components/citas/CitasSteps'
import { VehicleCard } from '@/components/citas/VehicleCard'
import { useCitasSession } from '@/components/citas/useCitasSession'
import type { ModalState } from '@/components/citas/types'

const closed: ModalState = { open: false, message: null }

function invalidOdometer(value: string) {
  return !value || Number(value) < 100
}

export function CitasStep1() {
  const session = useCitasSession(1)
  const navigate = useNavigate()
  const [selected, setSelected] = useState<string>('')
  const [odometers, setOdometers] = useState<Record<string, string>>({})
  const [modal, setModal] = useState<ModalState>(closed)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!session) return
    if (session.vehicles.length === 1) setSelected(session.vehicles[0].Placa)
  }, [session])

  if (!session) return <main id="main-content" tabIndex={-1} />

  const vehicles = session.vehicles
  const many = vehicles.length > 1
  const grid = vehicles.length > 2
  const selectedVehicle = vehicles.find((v) => v.Placa === selected)
  const hasActive = Boolean(selectedVehicle?.Citas_Activas)

  async function validateAndGo() {
    if (!selectedVehicle) {
      setModal({ open: true, message: MSG.pickVehicle })
      return
    }
    const odometer = odometers[selectedVehicle.Placa] ?? ''
    if (invalidOdometer(odometer)) {
      setModal({ open: true, message: MSG.odometer })
      return
    }
    setLoading(true)
    try {
      const response = await api.post<{
        validated_odometer?: { Exitoso?: boolean; Mensaje_Error?: string }
        tasks?: unknown[]
      }>('/api/citas/validate-odometer', { plate: selectedVehicle.Placa, odometer })
      if (response.validated_odometer?.Exitoso) {
        if (response.tasks && response.tasks.length) navigate('/citas/step2')
        else setModal({ open: true, message: MSG.noMaintenance })
      } else {
        const msg = response.validated_odometer?.Mensaje_Error
        setModal({ open: true, message: msg ? <p>{msg}</p> : MSG.noMaintenance })
      }
    } catch (err) {
      if (err instanceof ApiError) setModal({ open: true, message: serviceErrorMessage(err.status, err.message) })
      else setModal({ open: true, message: MSG.noConnection })
    } finally {
      setLoading(false)
    }
  }

  function unlink(plate: string) {
    setModal({
      open: true,
      title: 'DESVINCULAR VEHÍCULO',
      message: <p className="center">¿Estás seguro que querés desvincular este auto?</p>,
      optionOne: {
        title: 'ACEPTAR',
        onClick: async () => {
          setModal(closed)
          try {
            const response = await api.post<{ msn?: string }>('/api/citas/delete_plate', { plate })
            if (response.msn === 'ok') {
              setModal({
                open: true,
                message: <p>Hemos enviado tu solicitud de desvinculación a nuestro Contact Center. Pronto te contactaremos para confirmarlo y hacerlo efectivo.</p>,
              })
              setTimeout(() => navigate('/citas'), 1300)
            } else setModal({ open: true, message: MSG.error })
          } catch (err) {
            if (err instanceof ApiError) setModal({ open: true, message: serviceErrorMessage(err.status, err.message) })
            else setModal({ open: true, message: MSG.noConnection })
          }
        },
      },
      optionTwo: { title: 'CANCELAR', onClick: () => setModal(closed) },
    })
  }

  function cancelAppointment(plate: string) {
    setModal({
      open: true,
      title: 'CANCELAR CITA',
      message: '¿Está seguro que desea cancelar la cita?',
      optionOne: {
        title: 'CANCELAR CITA',
        onClick: async () => {
          setModal(closed)
          try {
            const response = await api.post<{ status?: boolean }>('/api/citas/cancel-appointment', { plate, reloadTasks: true })
            if (response.status) {
              setModal({ open: true, message: MSG.cancelled })
              setTimeout(() => window.location.reload(), 750)
            } else setModal({ open: true, message: MSG.error })
          } catch (err) {
            if (err instanceof ApiError) setModal({ open: true, message: serviceErrorMessage(err.status, err.message) })
            else setModal({ open: true, message: MSG.error })
          }
        },
      },
      optionTwo: { title: 'REGRESAR', onClick: () => setModal(closed) },
    })
  }

  function editAppointment() {
    if (invalidOdometer(odometers[selected] ?? '')) {
      setModal({ open: true, message: MSG.odometer })
      return
    }
    setModal({
      open: true,
      title: 'EDITAR CITA',
      message: MSG.editDisclaimer,
      optionOne: {
        title: 'EDITAR CITA',
        onClick: () => {
          setModal(closed)
          void validateAndGo()
        },
      },
      optionTwo: { title: 'REGRESAR', onClick: () => setModal(closed) },
    })
  }

  return (
    <main id="main-content" tabIndex={-1}>
      <div className="wrapper load-step-1">
        <div className="padding-1 bg--accent-light">
          <div className="container">
            <A className="text--primary text--bold" href="/citas">
              <i className="icon icon-arrow-left" /> Volver
            </A>
          </div>
        </div>
        <div className="container margin--top separador_steps">
          <h1 className="titulo_agendar text-center">Agendar cita de mantenimiento</h1>
        </div>
        <CitasSteps activeStep={1} />
        <section className="citas-select">
          <p className="title">Hola {session.fullName || ''}</p>
          {many ? (
            <p className="change-text-many-cars">
              Seleccioná el <span>auto</span> y confirmá el <span>kilometraje</span>:
            </p>
          ) : (
            <p className="change-text-many-cars">
              Confirmá el <span>kilometraje</span> actual de tu <span>auto</span>:
            </p>
          )}
          <form className={`cards-select-vehicle insert-cars ${grid ? 'gridContainer' : 'flexContainer'}`} onSubmit={(e) => e.preventDefault()}>
            {vehicles.map((vehicle, i) => (
              <VehicleCard
                key={vehicle.Placa}
                vehicle={vehicle}
                index={i}
                selected={selected === vehicle.Placa}
                odometer={odometers[vehicle.Placa] ?? ''}
                onSelect={() => setSelected(vehicle.Placa)}
                onOdometer={(value) => setOdometers((cur) => ({ ...cur, [vehicle.Placa]: value }))}
                onUnlink={() => unlink(vehicle.Placa)}
                onEdit={editAppointment}
                onCancel={() => cancelAppointment(vehicle.Placa)}
                hideSelect={!many}
              />
            ))}
          </form>
          <div className="main-option-buttons">
            <div className="btns-steps text-center">
              <A className="btn__cancelar_cita" href="/citas">
                Anterior
              </A>
              <a
                id="continue-button"
                href="#"
                className={`btn__continuar_cita btn--ford btn-step1${selected ? ' select-car' : ''}${hasActive ? ' active-appointment' : ''}`}
                onClick={(e) => {
                  e.preventDefault()
                  if (hasActive) editAppointment()
                  else void validateAndGo()
                }}
              >
                {loading ? 'CARGANDO...' : hasActive ? 'EDITAR' : 'Continuar'}
              </a>
            </div>
          </div>
        </section>
        <CitasModal open={modal.open} title={modal.title} message={modal.message} optionOne={modal.optionOne} optionTwo={modal.optionTwo} onClose={() => setModal(closed)} />
      </div>
    </main>
  )
}
