import pg from 'pg'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const { Pool } = pg
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required')
const root = path.dirname(fileURLToPath(import.meta.url))
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : undefined,
})
try {
  await pool.query(await readFile(path.join(root, 'migrations/001_contact_leads.sql'), 'utf8'))
  console.log('Ford PostgreSQL schema is up to date.')
} finally {
  await pool.end()
}
