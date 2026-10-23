import { useRef, useState, type FormEvent } from 'react'
import { api, ApiError } from '@/lib/api'
import { Captcha, type CaptchaHandle } from './Captcha'
import { TextAreaField, TextField } from './Field'

type Props = {
  type: string
  title?: string
  subject?: string
  mail?: string
  description?: string
  phone?: string
}

const digits = (v: string) => v.replace(/\D/g, '')

/**
 * Formulario de contacto embebido (SnippetController::renderDefaultFormSnippet).
 * Lo usan las páginas de contenido (repuestos, seguros, mantenimiento, carrocería…).
 * POST /api/forms/snippet/:type — lo atiende el módulo de formularios.
 */
export function ContactFormSnippet({ type, title = 'Contacto', phone = '(506) 2459-7615', mail = 'ventas@grupopurdy.com', subject, description }: Props) {
  const captcha = useRef<CaptchaHandle>(null)
  const [status, setStatus] = useState<'idle' | 'ok' | 'error'>('idle')
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form).entries()) as Record<string, string>
    data['g-recaptcha-response'] = captcha.current?.token() || ''
    if (subject) data.subject = subject
    if (mail) data.mail = mail
    if (description) data.description = description
    setSending(true)
    setError('')
    try {
      await api.post(`/api/forms/snippet/${encodeURIComponent(type)}`, data)
      setStatus('ok')
      form.reset()
      captcha.current?.reset()
    } catch (err) {
      setStatus('error')
      setError(err instanceof ApiError ? err.message : 'No se pudo enviar el mensaje. Intente de nuevo.')
      captcha.current?.reset()
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="section">
      <div className="container">
        <div className="row">
          <div className="col-md-6">
            <h2 className="title">{title || 'Contacto'}</h2>
            {phone ? (
              <a href={`tel:+${digits(phone)}`} className="title-icon title-icon--responsive">
                <div className="icon-box">
                  <i className="icon icon-phone" />
                </div>
                <div>
                  <p>Central telefónica</p>
                  <p>{phone}</p>
                </div>
              </a>
            ) : null}
            {mail ? (
              <a href={`mailto:${mail}`} className="title-icon title-icon--responsive">
                <div className="icon-box">
                  <i className="icon icon-mail" />
                </div>
                <div>
                  <p>Enviar correo</p>
                  <p>{mail}</p>
                </div>
              </a>
            ) : null}
            <a href="https://api.whatsapp.com/send?phone=50685891000&text=Hola%2C%20deseo%20cotizar%20un%20repuesto%20para%20mi%20Ford.%20" className="title-icon title-icon--responsive">
              <div className="icon-box">
                <i className="icon icon-whatsapp" />
              </div>
              <div>
                <p>Whatsapp</p>
                <p>(506) 8589-1000</p>
              </div>
            </a>
          </div>
          <div className="col-md-6">
            <div className="form-container">
              <h3 className="title">Enviar mensaje</h3>
              <p>
                <small>
                  <span className="text--primary">*</span> Campos Requeridos
                </small>
              </p>
              <form className="form snippet-contact-form verify-captcha" noValidate onSubmit={onSubmit}>
                <TextField id={`${type}-first_name`} name="first_name" label="Nombre" required placeholder="Juan" autoComplete="given-name" />
                <TextField id={`${type}-last_name`} name="last_name" label="Apellido" required placeholder="Rodríguez" autoComplete="family-name" />
                <TextField id={`${type}-email`} name="email" type="email" label="Correo Electrónico" required placeholder="ejemplo@mail.com" autoComplete="email" />
                <TextField id={`${type}-mobile`} name="mobile" label="Teléfono" required placeholder="88888888" autoComplete="tel" inputMode="tel" />
                <p className="label--black" id={`${type}-comment-label`}>
                  <small className="text--primary">*</small> Comentario
                </p>
                <TextAreaField id={`${type}-comment`} name="comment" label="" required placeholder="Describe tu duda o consulta" aria-labelledby={`${type}-comment-label`} />
                <div className="form__terms">
                  Ver{' '}
                  <a href="/article/terminos-condiciones" target="_blank" rel="noopener">
                    Términos y Condiciones
                  </a>
                </div>
                <Captcha ref={captcha} />
                {error ? <p className="text--primary margin--top">{error}</p> : null}
                <div className="center">
                  <button type="submit" className="btn btn--primary btn--wider" disabled={sending}>
                    {sending ? 'Enviando…' : 'Enviar mensaje'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      {status !== 'idle' ? (
        <div className="modal fade in show" role="dialog" aria-modal="true">
          <div className="modal-dialog" role="document">
            <button type="button" className="modal__close" aria-label="Cerrar" onClick={() => setStatus('idle')}>
              <i className="icon icon-close" />
            </button>
            <div className="modal-content text-center padding-2">
              <h3 className="text--bold text--primary">{status === 'ok' ? 'SU mensaje se ha enviado con éxito' : 'Ha ocurrido un error al enviar su mensaje'}</h3>
              <p>{status === 'ok' ? 'Pronto nos pondremos en contacto con usted' : error || 'Por favor intente más tarde'}</p>
              <div>
                <button type="button" className="btn btn--primary" onClick={() => setStatus('idle')}>
                  Aceptar
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
