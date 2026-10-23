import { useState, type FormEvent, type KeyboardEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { A } from '@/components/ui/A'
import { useTabs } from '@/hooks/useTabs'
import { api, ApiError } from '@/lib/api'
import { CitasModal, MSG, serviceErrorMessage } from '@/components/citas/CitasModal'
import type { ModalState } from '@/components/citas/types'

const closed: ModalState = { open: false, message: null }

export function CitasIndex() {
  const tabs = useTabs(0)
  const navigate = useNavigate()
  const [plate, setPlate] = useState('')
  const [dni, setDni] = useState('')
  const [loading, setLoading] = useState(false)
  const [modal, setModal] = useState<ModalState>(closed)

  function blockKeys(e: KeyboardEvent<HTMLInputElement>) {
    if (e.keyCode === 32 || e.keyCode === 45 || e.keyCode === 95) e.preventDefault()
  }

  async function search(type: 'PLATE' | 'DNI') {
    const id = (type === 'PLATE' ? plate : dni).trim()
    if (!id) {
      setModal({ open: true, message: MSG.required })
      return
    }
    setLoading(true)
    try {
      const response = await api.post<{ status?: boolean; Lista_Vehiculos?: unknown[]; custom_error?: unknown }>('/api/citas/user-vehicles', { type, id })
      if (response.status) {
        navigate('/citas/step1')
        return
      }
      if (response.custom_error && !Array.isArray(response.custom_error)) {
        const text = typeof response.custom_error === 'string' ? response.custom_error : JSON.stringify(response.custom_error)
        setModal({ open: true, message: <p>{text}</p> })
      } else {
        setModal({ open: true, message: type === 'PLATE' ? MSG.plateNotFound : MSG.dniNotFound })
      }
    } catch (err) {
      if (err instanceof ApiError) setModal({ open: true, message: serviceErrorMessage(err.status, err.message) })
      else setModal({ open: true, message: MSG.noConnection })
    } finally {
      setLoading(false)
    }
  }

  function onSubmit(type: 'PLATE' | 'DNI') {
    return (e: FormEvent) => {
      e.preventDefault()
      void search(type)
    }
  }

  const continueLabel = loading ? 'CARGANDO...' : 'Continuar'

  return (
    <main id="main-content" tabIndex={-1}>
      <div className="wrapper">
        <div className="wrapper-btn-cancel">
          <div>
            <A href="/servicios" className="text--primary">
              <i className="icon icon-arrow-left" /> <span>Cancelar</span>
            </A>
          </div>
        </div>
        <div className="container margin--top">
          <h1 className="titulo_agendar text-center">Agendar cita de mantenimiento</h1>
          <p className="margin-custom_cita">Ingresá tu número de cédula o placa de vehículo para agendar cita</p>
        </div>
        <div className="container custom_margin_citas">
          <ul className="tabs custom_tabs_margin">
            <li className={`tab ${tabs.tabClass(0)}`}>
              <a
                href="#PLATE"
                role="tab"
                onClick={(e) => {
                  e.preventDefault()
                  tabs.select(0)
                }}
              >
                Número de Placa
              </a>
            </li>
            <li className={`tab custom_tab_margin ${tabs.tabClass(1)}`}>
              <a
                href="#DNI"
                role="tab"
                onClick={(e) => {
                  e.preventDefault()
                  tabs.select(1)
                }}
              >
                Número de Cédula
              </a>
            </li>
          </ul>
          <div className="appointment-tabs tab-content">
            <div className={`tab-pane fade ${tabs.paneClass(0)}`} role="tabpanel" id="PLATE">
              <form className="cons-document" onSubmit={onSubmit('PLATE')}>
                <div className="input-wrap-container">
                  <div className="input-wrap custom_wrap">
                    <input
                      data-type="PLATE"
                      type="text"
                      className="input user-car"
                      placeholder="Digite número de placa"
                      value={plate}
                      onChange={(e) => setPlate(e.target.value.replace(/[\s\-_]/g, ''))}
                      onKeyDown={blockKeys}
                    />
                  </div>
                </div>
                <div className="buttons-options">
                  <A href="/servicios" className="btn__cancelar_cita">
                    Cancelar
                  </A>
                  <a
                    href="#"
                    className="btn__continuar_cita btn--ford searchUser"
                    onClick={(e) => {
                      e.preventDefault()
                      void search('PLATE')
                    }}
                  >
                    {continueLabel}
                  </a>
                </div>
              </form>
            </div>
            <div className={`tab-pane fade ${tabs.paneClass(1)}`} role="tabpanel" id="DNI">
              <form className="cons-document" onSubmit={onSubmit('DNI')}>
                <div className="input-wrap-container">
                  <div className="input-wrap custom_wrap">
                    <input
                      data-type="DNI"
                      type="text"
                      className="input user-car"
                      placeholder="Número de identificación"
                      value={dni}
                      onChange={(e) => setDni(e.target.value.replace(/[\s\-_]/g, ''))}
                      onKeyDown={blockKeys}
                    />
                  </div>
                  <p className="small">Ingresá tu cédula jurídica, física o extranjera sin guiones ni espacios</p>
                </div>
                <div className="buttons-options">
                  <A href="/servicios" className="btn__cancelar_cita">
                    Cancelar
                  </A>
                  <a
                    href="#"
                    className="btn__continuar_cita btn--ford searchUser"
                    onClick={(e) => {
                      e.preventDefault()
                      void search('DNI')
                    }}
                  >
                    {continueLabel}
                  </a>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <CitasModal open={modal.open} title={modal.title} message={modal.message} optionOne={modal.optionOne} optionTwo={modal.optionTwo} onClose={() => setModal(closed)} />
    </main>
  )
}
