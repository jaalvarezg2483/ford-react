import { useRef, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Captcha, type CaptchaHandle } from '@/components/forms/Captcha'
import { SelectField, TextField } from '@/components/forms/Field'
import { A } from '@/components/ui/A'
import { api, ApiError } from '@/lib/api'

const AREAS = [
  'Ventas Vehículos Nuevos',
  'Ventas Vehículos Usados',
  'Repuestos',
  'Accesorios',
  'Citas de Taller',
  'Carrocería y Pintura',
  'Seguros',
  'Quejas o Reclamos',
]

const SUCURSALES = ['Aleste', 'Escazú', 'La Uruca', 'Liberia', 'Pérez Zeledón', 'San Carlos']

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const LETTERS = /^[\p{L}\s'´`.+-]+$/u

const areaOptions = AREAS.map((value) => ({ value, label: value }))
const sucursalOptions = SUCURSALES.map((value) => ({ value, label: value }))

function required(value: string) {
  return value.trim() ? '' : 'Este campo es obligatorio'
}

function validate(fields: Record<string, string>): Record<string, string> {
  const errors: Record<string, string> = {}
  const first = required(fields.first_name)
  if (first) errors.first_name = first
  else if (!LETTERS.test(fields.first_name.trim())) errors.first_name = 'Escriba solo letras'
  const last = required(fields.last_name)
  if (last) errors.last_name = last
  else if (!LETTERS.test(fields.last_name.trim())) errors.last_name = 'Escriba solo letras'
  const email = required(fields.email)
  if (email) errors.email = email
  else if (!EMAIL.test(fields.email.trim())) errors.email = 'Formato de correo inválido'
  const mobile = required(fields.mobile)
  if (mobile) errors.mobile = mobile
  else if (!/^\d+$/.test(fields.mobile.trim())) errors.mobile = 'Por favor, escribe sólo números'
  const comment = required(fields.comment)
  if (comment) errors.comment = comment
  const area = required(fields.area)
  if (area) errors.area = area
  const sucursal = required(fields.sucursal)
  if (sucursal) errors.sucursal = sucursal
  return errors
}

/** Página /contacto: datos de la agencia y formulario de mensaje. */
export function Contacto() {
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
    const next = validate(data)
    setErrors(next)
    setFormError('')
    if (Object.keys(next).length) return
    setSending(true)
    try {
      const res = await api.post<{ ok: boolean; redirect?: string }>('/api/forms/contacto', data)
      navigate(res.redirect || '/contacto/gracias')
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
        <div className="container margin--top margin--bottom">
          <h1 className="title">Contactanos</h1>
          <p>
            Nuestro equipo de asesores y profesionales están aquí para ayudarte con cualquier duda o para asesorarte sobre nuestros servicios de venta de
            vehículos nuevos, seguros, planes de mantenimiento y servicios mecánicos en general.
          </p>
          <ul className="tabs tabs--opacity margin--top">
            <li className="tab active">
              <A href="/contacto">
                <i className="icon icon-phone text--primary" /> Contacto
              </A>
            </li>
            <li className="tab">
              <A href="/sucursales">
                <i className="icon icon-home text--primary" /> Sucursales
              </A>
            </li>
            <li className="tab">
              <A href="/talleres">
                <i className="icon icon-wrench text--primary" /> Talleres
              </A>
            </li>
          </ul>
          <div className="row">
            <div className="col-md-6">
              <div className="card__contact--details">
                <h3 className="title hidden-xs">Contacto</h3>
                <a href="tel:+50625197777" className="title-icon title-icon--responsive margin--top">
                  <div className="icon-box">
                    <i className="icon icon-phone" />
                  </div>
                  <div>
                    <p>Ventas nuevos y citas taller</p>
                    <p>(506) 2519-7777</p>
                  </div>
                </a>
                <a href="tel:+50624597615" className="title-icon title-icon--responsive margin--top">
                  <div className="icon-box">
                    <i className="icon icon-phone" />
                  </div>
                  <div>
                    <p>Repuestos</p>
                    <p>(506) 2459-7615</p>
                  </div>
                </a>
                <a href="mailto:ventas@grupopurdy.com" className="title-icon title-icon--responsive margin--top">
                  <div className="icon-box">
                    <i className="icon icon-mail" />
                  </div>
                  <div>
                    <p>Correo electrónico</p>
                    <p>ventas@grupopurdy.com</p>
                  </div>
                </a>
                <a href="http://purdygo.com/" className="title-icon title-icon--responsive margin--top">
                  <div className="icon-box">
                    <i className="icon icon-purdygo" />
                  </div>
                  <div>
                    <p>App Digital</p>
                    <p>purdygo.com</p>
                  </div>
                </a>
                <ul className="social-icons-contact">
                  <li>
                    <a href="https://www.facebook.com/FordCostaRica" target="_blank">
                      <span className="icon icon-facebook" />
                      /FordCostaRica
                    </a>
                  </li>
                  <li>
                    <a href="https://www.youtube.com/channel/UC9dvZm4Gt1ggI428hfulSDQ" target="_blank">
                      <span className="icon icon-youtube" />
                      Ford Costa Rica
                    </a>
                  </li>
                  <li>
                    <a href="https://www.instagram.com/fordcostarica/" target="_blank">
                      <span className="icon icon-instagram" />
                      @fordcostarica
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="col-md-6">
              <h4 className="title text-center-xs">¿Tiene alguna duda o consulta?</h4>
              <small>
                <span className="text--primary">*</span> Campos Obligatorios
              </small>
              <form id="contactForm" className="form--contact margin--top margin--bottom verify-captcha" noValidate onSubmit={onSubmit}>
                <div className="row">
                  <div className="col-sm-12">
                    <SelectField id="area" name="area" label="Área o Departamento" required options={areaOptions} error={errors.area} />
                  </div>
                  <div className="col-sm-12">
                    <SelectField id="sucursal" name="sucursal" label="Sucursal" required options={sucursalOptions} error={errors.sucursal} />
                  </div>
                  <div className="col-sm-12">
                    <TextField id="first_name" name="first_name" label="Nombre " required placeholder="Juan" autoComplete="given-name" maxLength={255} error={errors.first_name} />
                  </div>
                  <div className="col-sm-12">
                    <TextField id="last_name" name="last_name" label="Apellidos " required placeholder="Rodríguez" autoComplete="family-name" maxLength={255} error={errors.last_name} />
                  </div>
                  <div className="col-sm-12">
                    <TextField id="email" name="email" type="email" label="Correo electrónico " required placeholder="ejemplo@mail.com" autoComplete="email" error={errors.email} />
                  </div>
                  <div className="col-sm-12">
                    <TextField id="mobile" name="mobile" label="Número telefónico " required placeholder="88888888" autoComplete="tel" inputMode="tel" maxLength={255} error={errors.mobile} />
                  </div>
                  <div className="col-sm-12">
                    <div className="input-field">
                      <label className="label--black" htmlFor="plate">
                        Número de Placa
                      </label>
                      <input className="textarea" name="plate" id="plate" placeholder="ABC123" />
                    </div>
                  </div>
                  <div className="col-sm-12">
                    <div className={`input-field ${errors.comment ? 'has-error' : ''}`}>
                      <label className="label--black" htmlFor="comment">
                        <span className="text--primary">*</span> Mensaje
                      </label>
                      <textarea className="textarea" name="comment" id="comment" placeholder="Describe tu duda o consulta" required aria-invalid={errors.comment ? true : undefined} aria-describedby={errors.comment ? 'comment-error' : undefined} />
                      {errors.comment ? (
                        <span id="comment-error" className="error text--primary" role="alert">
                          {errors.comment}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
                <div className="input-field">
                  <Captcha ref={captcha} />
                  <span id="keycode" className="error-captcha hidden">
                    Por favor active el CAPTCHA
                  </span>
                </div>
                {formError ? <p className="text--primary margin--top">{formError}</p> : null}
                <div className="row">
                  <div className="col-sm-12 text-center">
                    <button id="btn-submit" type="submit" className="btn btn--primary btn--wider" disabled={sending}>
                      Enviar Mensaje
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
