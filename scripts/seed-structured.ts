// Pasa el contenido ya importado a los campos estructurados (portada, pie, redes…).
// Uso: npx payload run scripts/seed-structured.ts
import { getPayload } from 'payload'
import config from '../src/payload.config'
import { seedStructured } from '../src/import/structured'

const payload = await getPayload({ config })
await seedStructured(payload, (m) => console.log(m))
process.exit(0)
