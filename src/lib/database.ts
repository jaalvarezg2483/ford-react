import type { PoolConfig } from 'pg'
import { env } from './env'

const POSTGRES_SCOPE = 'https://ossrdbms-aad.database.windows.net/.default'
let cached: { value: string; expiresAt: number } | undefined

/** Azure: token de Microsoft Entra como contraseña (identidad administrada, sin secretos). */
async function azurePostgresPassword(): Promise<string> {
  if (cached && cached.expiresAt - 5 * 60_000 > Date.now()) return cached.value
  const { DefaultAzureCredential } = await import('@azure/identity')
  const token = await new DefaultAzureCredential().getToken(POSTGRES_SCOPE)
  if (!token) throw new Error('No se pudo obtener el token de Entra para PostgreSQL')
  cached = { value: token.token, expiresAt: token.expiresOnTimestamp }
  return cached.value
}

function sslFor(uri: string): PoolConfig['ssl'] {
  const url = new URL(uri)
  const host = url.hostname
  const mode = (url.searchParams.get('sslmode') || '').toLowerCase()
  if (mode === 'disable') return undefined
  if (host.endsWith('.postgres.database.azure.com')) return { rejectUnauthorized: true }
  // Proxy público de Railway: TLS con certificado propio.
  if (host.endsWith('.proxy.rlwy.net') || mode === 'require' || process.env.PGSSL === 'true') return { rejectUnauthorized: false }
  return undefined
}

export function getPoolConfig(): PoolConfig {
  if (env.DATABASE_AUTH_MODE === 'managed_identity' && env.POSTGRES_HOST && env.POSTGRES_DATABASE && env.POSTGRES_USER) {
    return {
      host: env.POSTGRES_HOST,
      port: 5432,
      database: env.POSTGRES_DATABASE,
      user: env.POSTGRES_USER,
      password: azurePostgresPassword,
      ssl: { rejectUnauthorized: true },
      max: 10,
    }
  }
  const uri = env.DATABASE_URL || 'postgresql://ford:ford@127.0.0.1:5432/ford'
  const clean = new URL(uri)
  clean.searchParams.delete('sslmode')
  return { connectionString: clean.toString(), ssl: sslFor(uri), max: 10 }
}
