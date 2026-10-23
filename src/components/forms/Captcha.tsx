import { forwardRef, useEffect, useId, useImperativeHandle, useRef } from 'react'
import { useContent } from '@/data/content'

type Grecaptcha = {
  render: (el: HTMLElement, opts: { sitekey: string; callback?: (t: string) => void; 'expired-callback'?: () => void }) => number
  getResponse: (id?: number) => string
  reset: (id?: number) => void
  ready?: (cb: () => void) => void
}
declare global {
  interface Window {
    grecaptcha?: Grecaptcha
  }
}

export type CaptchaHandle = { token: () => string; reset: () => void }

let loading: Promise<void> | null = null
function loadScript(): Promise<void> {
  if (window.grecaptcha?.render) return Promise.resolve()
  loading ??= new Promise<void>((resolve, reject) => {
    const s = document.createElement('script')
    s.src = 'https://www.google.com/recaptcha/api.js?render=explicit'
    s.async = true
    s.onload = () => (window.grecaptcha?.ready ? window.grecaptcha.ready(() => resolve()) : resolve())
    s.onerror = () => {
      loading = null
      reject(new Error('No se pudo cargar reCAPTCHA'))
    }
    document.head.appendChild(s)
  })
  return loading
}

/**
 * Casilla "No soy un robot" (reCAPTCHA v2). `ref.current.token()` devuelve la respuesta
 * (vacía si no se resolvió) y `reset()` la reinicia tras un envío fallido.
 */
export const Captcha = forwardRef<CaptchaHandle>(function Captcha(_props, ref) {
  const { site } = useContent()
  const host = useRef<HTMLDivElement>(null)
  const widget = useRef<number | null>(null)
  const id = useId()
  useImperativeHandle(ref, () => ({
    token: () => (widget.current !== null ? window.grecaptcha?.getResponse(widget.current) ?? '' : ''),
    reset: () => {
      if (widget.current !== null) window.grecaptcha?.reset(widget.current)
    },
  }))
  useEffect(() => {
    let cancelled = false
    loadScript()
      .then(() => {
        if (cancelled || !host.current || widget.current !== null || !window.grecaptcha) return
        widget.current = window.grecaptcha.render(host.current, { sitekey: site.recaptchaSiteKey })
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [site.recaptchaSiteKey])
  return <div id={id} ref={host} className="g-recaptcha margin--top margin--bottom" />
})
