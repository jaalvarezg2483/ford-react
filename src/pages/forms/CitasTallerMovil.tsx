import { useRef, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Captcha, type CaptchaHandle } from '@/components/forms/Captcha'
import { TextField } from '@/components/forms/Field'
import { A } from '@/components/ui/A'
import { api, ApiError } from '@/lib/api'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function required(value: string) {
  return value.trim() ? '' : 'Este campo es obligatorio'
}

function validate(fields: Record<string, string>): Record<string, string> {
  const errors: Record<string, string> = {}
  const first = required(fields.first_name)
  if (first) errors.first_name = first
  const last = required(fields.last_name)
  if (last) errors.last_name = last
  const plate = required(fields.plate)
  if (plate) errors.plate = plate
  else if (fields.plate.trim().length < 5) errors.plate = 'La placa debe tener al menos 5 caracteres'
  const email = required(fields.email)
  if (email) errors.email = email
  else if (!EMAIL.test(fields.email.trim())) errors.email = 'Formato de correo inválido'
  const phone = required(fields.phone_number)
  if (phone) errors.phone_number = phone
  else if (!/^\d+$/.test(fields.phone_number.trim())) errors.phone_number = 'Por favor, escribe sólo números'
  return errors
}

/** Formulario de citas de taller móvil: mismos campos que ford.cr. */
export function CitasTallerMovil() {
  const navigate = useNavigate()
  const captcha = useRef<CaptchaHandle>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState('')
  const [sending, setSending] = useState(false)

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form).entries()) as Record<string, string>
    data['g-recaptcha-response'] = captcha.current?.token() || ''
    data.mobile = data.phone_number || data.mobile
    const next = validate(data)
    setErrors(next)
    setFormError('')
    if (Object.keys(next).length) return
    setSending(true)
    try {
      const res = await api.post<{ ok: boolean; redirect?: string }>('/api/forms/citas-taller-movil', data)
      navigate(res.redirect || '/contacto/citas-taller-movil/gracias')
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'No se pudo enviar el mensaje. Intente de nuevo.')
      captcha.current?.reset()
    } finally {
      setSending(false)
    }
  }

  return (
    <main id="main-content" tabIndex={-1}>
      <div className="wrapper">
        <div className="container container--breadcrumb">
          <A href="/" className="btn--back">
            <span className="icon icon-arrow-left" />
            Volver
          </A>
        </div>
        <div className="section">
          <div className="container">
            <h1 className="title text-center">Citas Taller Móvil</h1>
          </div>
          <div className="container container--full-mobile">
            <div className="card card--form">
              <form id="contactForm" className="form verify-captcha" noValidate onSubmit={onSubmit}>
                <div className="card__content bg--gray">
                  <div className="container">
                    <h3 className="card__title">ESCRIBINOS AQUÍ</h3>
                    <p>
                      En Purdy Motor estamos para servirte, llená todos los campos de este formulario y muy pronto uno de nuestros asesores te contactará para coordinar tu cita de
                      taller móvil.
                    </p>
                  </div>
                </div>
                <div className="card__content">
                  <div className="container">
                    <p className="text--gray">
                      <small>* Campos obligatorios</small>
                    </p>
                    <TextField id="first_name" name="first_name" label="Nombre" required placeholder="Juan" autoComplete="given-name" maxLength={255} error={errors.first_name} />
                    <TextField id="last_name" name="last_name" label="Apellido" required placeholder="Rodríguez" autoComplete="family-name" maxLength={255} error={errors.last_name} />
                    <TextField id="placa" name="plate" label="Placa" required minLength={5} maxLength={255} error={errors.plate} />
                    <TextField id="email" name="email" type="email" label="Correo Electrónico" required placeholder="ejemplo@mail.com" autoComplete="email" maxLength={255} error={errors.email} />
                    <TextField
                      id="phone_number"
                      name="phone_number"
                      label="Teléfono"
                      required
                      placeholder="88888888"
                      autoComplete="tel"
                      inputMode="tel"
                      maxLength={8}
                      error={errors.phone_number}
                    />
                    <div className="input-field">
                      <Captcha ref={captcha} />
                    </div>
                    {formError ? <p className="text--primary margin--top">{formError}</p> : null}
                    <button id="send-button" type="submit" className="btn btn--black btn--block" disabled={sending}>
                      {sending ? 'Enviando…' : 'ENVIAR'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
