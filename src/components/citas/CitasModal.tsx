import { useEffect, type ReactNode } from 'react'
import type { ModalOption } from './types'

type Props = {
  open: boolean
  title?: string
  message: ReactNode
  optionOne?: ModalOption
  optionTwo?: ModalOption
  onClose: () => void
}

export function CitasModal({ open, title, message, optionOne, optionTwo, onClose }: Props) {
  useEffect(() => {
    document.body.classList.toggle('modal-open', open)
    return () => document.body.classList.remove('modal-open')
  }, [open])

  return (
    <>
      {open ? <div className="modal-backdrop fade in" onClick={onClose} /> : null}
      <div
        id="dates-modal"
        className={`modal fade dates-modal${open ? ' in' : ''}`}
        tabIndex={-1}
        role="dialog"
        aria-labelledby="datesModalLabel"
        aria-hidden={!open}
        style={{ display: open ? 'flex' : 'none' }}
      >
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <img src="/img/icons/alert-icon.png" alt="" />
              <h5 className="modal-title" id="exampleModalCenterTitle">
                {title || ''}
              </h5>
              <button type="button" className="close" aria-label="Close" onClick={onClose}>
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">
              <div className="modal-message">{message}</div>
            </div>
            <div className="modal-footer">
              <a
                id="close-dates-modal"
                className="modal-action modal-close modal-option-one"
                style={{ display: optionOne ? undefined : 'none' }}
                onClick={optionOne?.onClick}
              >
                {optionOne?.title}
              </a>
              <a
                id="close-dates-modal-two"
                className="modal-action modal-close modal-option-two"
                style={{ display: optionTwo ? undefined : 'none' }}
                onClick={optionTwo?.onClick}
              >
                {optionTwo?.title}
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export const MSG = {
  required: <p>Es requerido completar el número de placa o el número de cédula para proceder.</p>,
  plateNotFound: (
    <>
      <p>
        Tu placa no fue encontrada en nuestro sistema, por favor llamá al <a href="tel:+50625197777">(506) 2519-7777</a> para obtener tu cita.
      </p>
      <p>Si tu vehículo tiene menos de 1000 km, por favor buscá tu Ford por número de cédula</p>
    </>
  ),
  dniNotFound: (
    <p>
      No encontramos ningún vehículo asociado a tu cédula en nuestro sistema, por favor llamá al <a href="tel:+50625197777">(506) 2519-7777</a> para
      obtener tu cita.
    </p>
  ),
  noConnection: <p>Lo sentimos, parece que no tenés conexión a internet, por favor probá de nuevo.</p>,
  unavailable: <p>Servicio de citas no disponible</p>,
  noMaintenance: (
    <p>
      Tu placa no posee un plan de mantenimiento asociado en nuestro sistema, por favor llamá al <a href="tel:+50625297777">2529-7777</a> para más
      información
    </p>
  ),
  odometer: <p>El valor ingresado es inválido. Por favor ingrese un valor numérico de al menos 3 dígitos.</p>,
  pickVehicle: <p>Por favor seleccione un vehículo antes de continuar.</p>,
  error: <p>Ha ocurrido un error, por favor intentelo mas tarde.</p>,
  taken: <p>Parece que alguien mas tomó este espacio, por favor intentá con otro.</p>,
  retry: <p>Lo sentimos, parece que hubo un error, por favor probá de nuevo.</p>,
  emailRequired: <p>Debes agregar un correo</p>,
  emailInvalid: <p>No es un formato válido de correo electrónico</p>,
  cancelled: <p>Su cita ha sido cancelada exitosamente</p>,
  editDisclaimer: (
    <p>
      La edición de la cita contempla solamente el cambio de taller, fecha u hora. Para cambiar el servicio es necesario cancelar la cita.
      <br />
      <br />
      <br />
      ¿Está seguro que desea editar su cita actual?
    </p>
  ),
}

export function serviceErrorMessage(status: number, text?: string) {
  if (status === 503) return text ? <p>{text}</p> : MSG.unavailable
  return MSG.error
}
