import nodemailer from 'nodemailer'
import { env } from './env'

/**
 * Envío de correo con la misma cuenta del Symfony (SendGrid por SMTP, usuario "apikey").
 * EMAIL_OVERRIDE_TO desvía todo a un buzón de pruebas.
 * Desarrollo: SMTP_HOST=__file__ guarda cada correo como .eml en ./data/mail en lugar de enviarlo.
 */
let transport: nodemailer.Transporter | null = null

function getTransport() {
  if (env.SMTP_HOST === '__file__') {
    transport ??= nodemailer.createTransport({ streamTransport: true, buffer: true })
    return transport
  }
  if (!env.SMTP_HOST || !env.SMTP_PASSWORD) return null
  transport ??= nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: { user: env.SMTP_USER || 'apikey', pass: env.SMTP_PASSWORD },
    connectionTimeout: 10_000,
    socketTimeout: 20_000,
  })
  return transport
}

export type Mail = {
  to: string
  subject: string
  html: string
  bcc?: string | null
  fromName?: string
  replyTo?: string
  attachments?: { filename: string; content: Buffer | string; contentType?: string }[]
}

export async function sendMail(mail: Mail): Promise<{ sent: boolean; to: string; reason?: string }> {
  const t = getTransport()
  const to = env.EMAIL_OVERRIDE_TO || mail.to
  if (!t || !env.EMAIL_FROM) return { sent: false, to, reason: 'SMTP no configurado' }
  const split = (s: string) => s.split(',').map((x) => x.trim()).filter(Boolean)
  const info = await t.sendMail({
    from: { name: mail.fromName || env.EMAIL_FROM_NAME, address: env.EMAIL_FROM },
    to: split(to),
    bcc: !env.EMAIL_OVERRIDE_TO && mail.bcc ? split(mail.bcc) : undefined,
    subject: mail.subject,
    html: mail.html,
    replyTo: mail.replyTo,
    attachments: mail.attachments,
  })
  if (env.SMTP_HOST === '__file__') {
    const { mkdir, writeFile } = await import('node:fs/promises')
    await mkdir('data/mail', { recursive: true })
    await writeFile(`data/mail/${Date.now()}-${mail.subject.replace(/[^\w-]+/g, '_')}.eml`, (info as any).message)
  }
  return { sent: true, to }
}

/** Plantilla dinámica de SendGrid para la confirmación de test drive (SendGridTemplateMailer.php). */
export async function sendTestDriveTemplate(toEmail: string, name: string, subject: string): Promise<{ sent: boolean; reason?: string }> {
  const apiKey = process.env.SENDGRID_API_KEY || env.SMTP_PASSWORD
  const templateId = process.env.SENDGRID_TEST_DRIVE_TEMPLATE_ID
  if (!apiKey || !templateId || !env.EMAIL_FROM) return { sent: false, reason: 'Plantilla de SendGrid no configurada' }
  const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: env.EMAIL_OVERRIDE_TO || toEmail }], dynamic_template_data: { name: name || 'Cliente' }, ...(subject ? { subject } : {}) }],
      from: { email: env.EMAIL_FROM, name: env.EMAIL_FROM_NAME },
      template_id: templateId,
    }),
    signal: AbortSignal.timeout(30_000),
  })
  if (!res.ok) throw new Error(`SendGrid ${res.status}: ${await res.text()}`)
  return { sent: true }
}
