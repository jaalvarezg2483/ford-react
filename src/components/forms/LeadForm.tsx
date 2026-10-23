import { useRef, useState, type FormEvent, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, ApiError } from '@/lib/api'
import { Captcha, type CaptchaHandle } from './Captcha'
import { SelectField, TextAreaField, TextField } from './Field'

export const LEAD_SUCURSALES = ['Aleste', 'Escazú', 'La Uruca', 'Liberia', 'Pérez Zeledón', 'San Carlos'] as const

export function matchSucursal(value: string) {
  const n = value.trim().toLowerCase()
  return LEAD_SUCURSALES.find((s) => s.toLowerCase() === n) ?? ''
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const sucursalOptions = LEAD_SUCURSALES.map((value) => ({ value, label: value }))

function required(value: string) {
  return value.trim() ? '' : 'Este campo es obligatorio'
}

function validate(fields: Record<string, string>, opts: { sucursal?: boolean; comment?: boolean }): Record<string, string> {
  const errors: Record<string, string> = {}
  const first = required(fields.first_name)
  if (first) errors.first_name = first
  const last = required(fields.last_name)
  if (last) errors.last_name = last
  const email = required(fields.email)
  if (email) errors.email = email
  else if (!EMAIL.test(fields.email.trim())) errors.email = 'Formato de correo inválido'
  const mobile = required(fields.mobile)
  if (mobile) errors.mobile = mobile
  else if (!/^\d+$/.test(fields.mobile.trim())) errors.mobile = 'Por favor, escribe sólo números'
  if (opts.sucursal) {
    const sucursal = required(fields.sucursal)
    if (sucursal) errors.sucursal = sucursal
  }
  if (opts.comment) {
    const comment = required(fields.comment)
    if (comment) errors.comment = comment
  }
  return errors
}

export type LeadFormProps = {
  type: string
  submitLabel?: string
  /** Muestra el selector de sucursal (obligatorio al enviar). */
  sucursal?: boolean
  sucursalDefault?: string
  /** Muestra el campo de mensaje. */
  comment?: boolean
  commentRequired?: boolean
  commentLabel?: string
  family?: string
  model?: string
  slug?: string
  code?: string
  children?: ReactNode
}

/**
 * Formulario reutilizable de leads (test drive, reserva, asesor, cotización por correo).
 * POST /api/forms/:type y navega a la ruta que devuelve el servidor.
 */
export function LeadForm({
  type,
  submitLabel = 'Enviar solicitud',
  sucursal = false,
  sucursalDefault = '',
  comment = false,
  commentRequired = false,
  commentLabel = 'Mensaje',
  family,
  model,
  slug,
  code,
  children,
}: LeadFormProps) {
  const navigate = useNavigate()
  const captcha = useRef<CaptchaHandle>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState('')
  const [sending, setSending] = useState(false)
  const prefix = type.replace(/[^a-z0-9_-]/gi, '') || 'lead'

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form).entries()) as Record<string, string>
    data['g-recaptcha-response'] = captcha.current?.token() || ''
    const next = validate(data, { sucursal, comment: comment && commentRequired })
    setErrors(next)
    setFormError('')
    if (Object.keys(next).length) return
    setSending(true)
    try {
      const res = await api.post<{ ok: boolean; redirect?: string }>(`/api/forms/${encodeURIComponent(type)}`, data)
      navigate(res.redirect || '/contacto/gracias')
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'No se pudo enviar el mensaje. Intente de nuevo.')
      captcha.current?.reset()
    } finally {
      setSending(false)
    }
  }

  return (
    <form className="form--contact margin--top margin--bottom verify-captcha" noValidate onSubmit={onSubmit}>
      {children}
      {family ? <input type="hidden" name="family" value={family} /> : null}
      {model ? <input type="hidden" name="model" value={model} /> : null}
      {slug ? <input type="hidden" name="slug" value={slug} /> : null}
      {code ? <input type="hidden" name="code" value={code} /> : null}
      <small>
        <span className="text--primary">*</span> Campos obligatorios
      </small>
      <div className="row">
        <div className="col-sm-12">
          <TextField id={`${prefix}-first_name`} name="first_name" label="Nombre" required placeholder="Juan" autoComplete="given-name" maxLength={255} error={errors.first_name} />
        </div>
        <div className="col-sm-12">
          <TextField id={`${prefix}-last_name`} name="last_name" label="Apellidos" required placeholder="Rodríguez" autoComplete="family-name" maxLength={255} error={errors.last_name} />
        </div>
        <div className="col-sm-12">
          <TextField id={`${prefix}-email`} name="email" type="email" label="Correo electrónico" required placeholder="ejemplo@mail.com" autoComplete="email" error={errors.email} />
        </div>
        <div className="col-sm-12">
          <TextField id={`${prefix}-mobile`} name="mobile" label="Número telefónico" required placeholder="88888888" autoComplete="tel" inputMode="tel" maxLength={255} error={errors.mobile} />
        </div>
        {sucursal ? (
          <div className="col-sm-12">
            <SelectField
              id={`${prefix}-sucursal`}
              name="sucursal"
              label="Sucursal"
              required
              options={sucursalOptions}
              placeholder="Seleccione una sucursal"
              defaultValue={sucursalDefault}
              error={errors.sucursal}
            />
          </div>
        ) : null}
        {comment ? (
          <div className="col-sm-12">
            <TextAreaField id={`${prefix}-comment`} name="comment" label={commentLabel} required={commentRequired} placeholder="Describe tu duda o consulta" error={errors.comment} />
          </div>
        ) : null}
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
          <button type="submit" className="btn btn--primary btn--wider" disabled={sending}>
            {sending ? 'Enviando…' : submitLabel}
          </button>
        </div>
      </div>
    </form>
  )
}
