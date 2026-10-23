'use client'
import { useEffect, useState } from 'react'

type State = { running: boolean; startedAt?: string; finishedAt?: string; error?: string; log: string[] }

/** Panel del escritorio del CMS para traer el contenido actual de ford.cr. */
export function ImportFordPanel() {
  const [state, setState] = useState<State | null>(null)
  const [busy, setBusy] = useState(false)
  const load = () => fetch('/api/import-ford', { credentials: 'include' }).then((r) => (r.ok ? r.json() : null)).then(setState).catch(() => null)
  useEffect(() => {
    load()
    const t = setInterval(load, 4000)
    return () => clearInterval(t)
  }, [])
  if (!state) return null
  const start = async () => {
    if (!confirm('Se va a leer www.ford.cr y actualizar páginas, archivos, vehículos, banners y blog. ¿Continuar?')) return
    setBusy(true)
    await fetch('/api/import-ford', { method: 'POST', credentials: 'include' })
    setBusy(false)
    load()
  }
  return (
    <div style={{ border: '1px solid var(--theme-elevation-150)', borderRadius: 6, padding: 16, marginBottom: 24 }}>
      <h4 style={{ margin: '0 0 8px' }}>Importar contenido de ford.cr</h4>
      <p style={{ margin: '0 0 12px', opacity: 0.8 }}>Copia páginas, archivos de /uploads, vehículos, banners, blog y calculadora del sitio actual. Se puede repetir: actualiza sin duplicar.</p>
      <button type="button" className="btn btn--style-primary btn--size-small" disabled={busy || state.running} onClick={start}>
        {state.running ? 'Importando…' : 'Importar ahora'}
      </button>
      {state.error && <p style={{ color: 'var(--theme-error-500)' }}>{state.error}</p>}
      {state.log.length > 0 && (
        <pre style={{ maxHeight: 220, overflow: 'auto', fontSize: 12, marginTop: 12 }}>{state.log.slice(-40).join('\n')}</pre>
      )}
    </div>
  )
}
