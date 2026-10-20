import { payloadClient } from '@/site/payload'

export const dynamic = 'force-dynamic'

/** Railway / Azure: comprueba la conexión real a PostgreSQL. */
export async function GET() {
  const started = Date.now()
  try {
    const payload = await payloadClient()
    await (payload.db as any).pool.query('SELECT 1')
    return Response.json({ status: 'ok', database: 'ok', latencyMs: Date.now() - started })
  } catch {
    return Response.json({ status: 'degraded', database: 'error', latencyMs: Date.now() - started }, { status: 503 })
  }
}
