import express from 'express'
import pg from 'pg'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const { Pool } = pg
const root = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const port = Number(process.env.PORT || 4174)
const database = process.env.DATABASE_URL
const pool = database ? new Pool({
  connectionString: database,
  ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : undefined,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 8_000,
}) : null
let gatewayToken
let gatewayTokenUntil = 0

const integrationRoutes = {
  user_vehicles: new Set(['get', 'detach']),
  appointments: new Set(['has-appointment', 'validate-odometer', 'get-tasks', 'create-appointment', 'cancel-appointment']),
  branch_offices: new Set(['get', 'available-schedules']),
  configuration_store: new Set(['getDateRange', 'isHighNoon']),
  'microservice-informed-consent': new Set(['subscribe']),
}

app.disable('x-powered-by')
app.use(express.json({ limit: '64kb' }))

async function getGatewayToken() {
  if (!process.env.MICROSERVICES_GATEWAY_URL || !process.env.MICROSERVICES_CLIENT_ID || !process.env.MICROSERVICES_CLIENT_SECRET) {
    throw new Error('Microservice gateway is not configured')
  }
  if (gatewayToken && Date.now() < gatewayTokenUntil) return gatewayToken
  const endpoint = new URL('/oauth/token', process.env.MICROSERVICES_GATEWAY_URL)
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.MICROSERVICES_CLIENT_ID,
      client_secret: process.env.MICROSERVICES_CLIENT_SECRET,
      grant_type: process.env.MICROSERVICES_GRANT_TYPE || 'client_credentials',
    }),
    signal: AbortSignal.timeout(12_000),
  })
  if (!response.ok) throw new Error(`Gateway auth returned ${response.status}`)
  const data = await response.json()
  gatewayToken = data.accessToken || data.access_token
  if (!gatewayToken) throw new Error('Gateway auth response did not contain an access token')
  gatewayTokenUntil = Date.now() + Math.min(Number(data.expires_in || 10_800) - 60, 10_740) * 1_000
  return gatewayToken
}

app.get('/api/health', async (_req, res) => {
  if (!pool) return res.status(503).json({ status: 'unconfigured', database: false })
  try {
    await pool.query('SELECT 1')
    return res.json({ status: 'ok', database: true })
  } catch {
    return res.status(503).json({ status: 'unavailable', database: false })
  }
})

app.post('/api/microservices/:service/:action', async (req, res) => {
  const { service, action } = req.params
  if (!integrationRoutes[service]?.has(action)) return res.status(404).json({ error: 'Unknown integration route' })
  try {
    const token = await getGatewayToken()
    const gateway = process.env.MICROSERVICES_GATEWAY_URL.replace(/\/$/, '')
    const endpoint = `${gateway}/${encodeURIComponent(service)}/api/${encodeURIComponent(action)}`
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...req.body, brand: process.env.MICROSERVICES_BRAND || 'ford_citas' }),
      signal: AbortSignal.timeout(20_000),
    })
    const body = await response.text()
    res.setHeader('Content-Type', response.headers.get('content-type') || 'application/json')
    res.status(response.status).send(body)
  } catch (error) {
    console.error('Microservice request failed:', error.message)
    res.status(502).json({ error: 'No se pudo completar la solicitud al servicio.' })
  }
})

app.post('/api/contact', async (req, res) => {
  const { firstName, lastName, email, phone, plate, department, branch, message } = req.body || {}
  if (![firstName, lastName, email, phone, department, message].every(value => typeof value === 'string' && value.trim())) {
    return res.status(400).json({ error: 'Completá los campos obligatorios.' })
  }
  if (!pool) return res.status(503).json({ error: 'El servicio de contacto no está configurado.' })
  try {
    if (!process.env.SENDGRID_API_KEY || !process.env.CONTACT_TO_EMAIL || !process.env.SENDGRID_FROM_EMAIL) {
      return res.status(503).json({ error: 'El envío de correo todavía no está configurado.' })
    }
    await pool.query(
      'INSERT INTO contact_leads (first_name,last_name,email,phone,plate,department,branch,message) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',
      [firstName.trim(),lastName.trim(),email.trim(),phone.trim(),plate?.trim() || null,department.trim(),branch?.trim() || null,message.trim()],
    )
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: process.env.CONTACT_TO_EMAIL }], subject: `Consulta Ford: ${department}` }],
        from: { email: process.env.SENDGRID_FROM_EMAIL, name: 'Ford Costa Rica' },
        reply_to: { email: email.trim(), name: `${firstName.trim()} ${lastName.trim()}` },
        content: [{ type: 'text/plain', value: `Nombre: ${firstName.trim()} ${lastName.trim()}\nCorreo: ${email.trim()}\nTeléfono: ${phone.trim()}\nPlaca: ${plate?.trim() || 'No indicada'}\nDepartamento: ${department.trim()}\nSucursal: ${branch?.trim() || 'No indicada'}\n\n${message.trim()}` }],
      }),
      signal: AbortSignal.timeout(12_000),
    })
    if (!response.ok) throw new Error(`Email provider returned ${response.status}`)
    return res.status(201).json({ ok: true })
  } catch (error) {
    console.error('Ford contact submission failed:', error.message)
    return res.status(502).json({ error: 'No se pudo enviar el mensaje.' })
  }
})

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(root, 'dist'), { index: false, maxAge: '1y', immutable: true }))
  app.get('*splat', (_req, res) => res.sendFile(path.join(root, 'dist', 'index.html')))
} else {
  app.get('/', (_req, res) => res.send('Ford React API disponible. Iniciá Vite en el puerto 5173.'))
}

app.listen(port, '0.0.0.0', () => console.log(`Ford React API listening on ${port}`))
