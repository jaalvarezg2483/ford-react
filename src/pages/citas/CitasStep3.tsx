import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { A } from '@/components/ui/A'
import { api, ApiError } from '@/lib/api'
import { BranchList } from '@/components/citas/BranchList'
import { CitasModal, MSG, serviceErrorMessage } from '@/components/citas/CitasModal'
import { CitasSteps } from '@/components/citas/CitasSteps'
import { useCitasSession } from '@/components/citas/useCitasSession'
import type { CitaBranch, CitaTime, ModalState } from '@/components/citas/types'

const closed: ModalState = { open: false, message: null }
const emptyTimes = { am: [] as CitaTime[], pm: [] as CitaTime[] }

export function CitasStep3() {
  const session = useCitasSession(3)
  const navigate = useNavigate()
  const [branches, setBranches] = useState<CitaBranch[]>([])
  const [parameters, setParameters] = useState<{ minDate?: unknown; maxDate?: unknown } | null>(null)
  const [selected, setSelected] = useState<CitaBranch | null>(null)
  const [times, setTimes] = useState(emptyTimes)
  const [timesFor, setTimesFor] = useState('')
  const [loadingTimes, setLoadingTimes] = useState(false)
  const [noTimes, setNoTimes] = useState(false)
  const [hour, setHour] = useState('')
  const [saving, setSaving] = useState(false)
  const [modal, setModal] = useState<ModalState>(closed)

  const currentAppointment = Boolean(session?.currentAppointment)
  const plate = session?.vehicleSelected ? session.vehicleSelected.Placa : ''
  const workId = session?.taskSelected ? session.taskSelected.CTrabajo_Id : ''
  const selectedId = selected ? `${selected.Empresa}-${selected.Suc_Id}` : ''

  useEffect(() => {
    if (!session) return
    let cancelled = false
    api
      .post<{ Lista_Sucursales?: CitaBranch[]; Exitoso?: boolean }>('/api/citas/sucursals-list')
      .then((response) => {
        if (!cancelled && response.Exitoso) setBranches(response.Lista_Sucursales || [])
        else if (!cancelled && response.Exitoso === false) setModal({ open: true, message: MSG.error })
      })
      .catch((err) => {
        if (cancelled) return
        if (err instanceof ApiError) setModal({ open: true, message: serviceErrorMessage(err.status, err.message) })
        else setModal({ open: true, message: MSG.noConnection })
      })
    api
      .get<{ minDate?: unknown; maxDate?: unknown }>('/api/citas/getParameters')
      .then((data) => {
        if (!cancelled) setParameters(data)
      })
      .catch(() => {
        /* el calendario queda sin rango hasta que el gateway responda */
      })
    return () => {
      cancelled = true
    }
  }, [session])

  if (!session) return <main id="main-content" tabIndex={-1} />

  async function loadTimes(branch: CitaBranch, date: Date) {
    const key = `${branch.Empresa}-${branch.Suc_Id}`
    setLoadingTimes(true)
    setHour('')
    setNoTimes(false)
    setTimes(emptyTimes)
    try {
      const response = await api.post<{ Exitoso?: boolean; times?: { am: CitaTime[]; pm: CitaTime[] }; Mensaje_Error?: string }>('/api/citas/available-schedules', {
        plate,
        sucursal: String(branch.Suc_Id),
        empresa: String(branch.Empresa),
        date: `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`,
        work_id: workId,
        info: '',
      })
      if (response.Exitoso && (response.times?.am.length || response.times?.pm.length)) {
        setTimes(response.times || emptyTimes)
        setTimesFor(key)
        setNoTimes(false)
      } else {
        setTimes(emptyTimes)
        setTimesFor(key)
        setNoTimes(true)
        if (response.Mensaje_Error) setModal({ open: true, message: <p>{response.Mensaje_Error}</p> })
      }
    } catch (err) {
      if (err instanceof ApiError) setModal({ open: true, message: serviceErrorMessage(err.status, err.message) })
      else setModal({ open: true, message: MSG.noConnection })
    } finally {
      setLoadingTimes(false)
    }
  }

  async function confirm() {
    if (!selected || !hour || saving) return
    setSaving(true)
    try {
      const response = await api.post<{ status?: boolean }>('/api/citas/save/branch/date', {
        date: hour,
        branchId: String(selected.Suc_Id),
        companyId: String(selected.Empresa),
      })
      if (response.status) navigate('/citas/step4')
      else setModal({ open: true, message: MSG.retry })
    } catch (err) {
      if (err instanceof ApiError) setModal({ open: true, message: serviceErrorMessage(err.status, err.message) })
      else setModal({ open: true, message: MSG.noConnection })
    } finally {
      setSaving(false)
    }
  }

  return (
    <main id="main-content" tabIndex={-1}>
      <div className="wrapper load-step-3">
        <div className="padding-1 bg--accent-light">
          <div className="container">
            <A className="text--primary text--bold" href={currentAppointment ? '/citas/step1' : '/citas/step2'}>
              <i className="icon icon-arrow-left" /> Volver
            </A>
          </div>
        </div>
        <div className="container margin--top separador_steps">
          <h1 className="titulo_agendar text-center">Agendar cita de mantenimiento</h1>
        </div>
        <CitasSteps activeStep={3} blockStep={{ 2: currentAppointment }} />
        <section className="citas-select">
          <p className="title">Seleccioná el taller, fecha y la hora para llevar tu vehículo al mantenimiento preventivo.</p>
          <form className="cards-select-vehicle select-date" onSubmit={(e) => e.preventDefault()}>
            <BranchList
              branches={branches}
              parameters={parameters}
              selectedId={selectedId}
              onSelect={(branch) => {
                setSelected(branch)
                setTimes(emptyTimes)
                setHour('')
                setNoTimes(false)
              }}
              onDate={loadTimes}
              times={times}
              timesFor={timesFor}
              loadingTimes={loadingTimes}
              noTimes={noTimes}
              selectedHour={hour}
              onHour={(value) => setHour(value)}
              onConfirm={() => void confirm()}
              confirmDisabled={!hour || saving}
            />
          </form>
          <div className="main-option-buttons">
            <div className="btns-steps text-center">
              {currentAppointment ? (
                <A className="btn__cancelar_cita" href="/citas/step1">
                  Anterior
                </A>
              ) : (
                <A className="btn__cancelar_cita" href="/citas/step2">
                  Anterior
                </A>
              )}
            </div>
          </div>
        </section>
        <CitasModal open={modal.open} title={modal.title} message={modal.message} optionOne={modal.optionOne} optionTwo={modal.optionTwo} onClose={() => setModal(closed)} />
      </div>
    </main>
  )
}
