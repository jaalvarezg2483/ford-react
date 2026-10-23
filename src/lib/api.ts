import { useSyncExternalStore } from 'react'

/**
 * Cliente de los endpoints del sitio (/api/...). Mismo origen, con cookie de sesión.
 * Mientras hay una petición en curso se muestra el indicador de carga (ver Spinner).
 */
let pending = 0
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())
export const useBusy = () =>
  useSyncExternalStore(
    (cb) => (listeners.add(cb), () => listeners.delete(cb)),
    () => pending > 0,
    () => false,
  )

export class ApiError extends Error {
  constructor(public status: number, message: string, public body?: unknown) {
    super(message)
  }
}

type Options = { silent?: boolean; signal?: AbortSignal }

async function request<T>(method: 'GET' | 'POST', path: string, body: unknown, opts: Options = {}): Promise<T> {
  if (!opts.silent) { pending += 1; emit() }
  try {
    const res = await fetch(path.startsWith('/') ? path : `/api/${path}`, {
      method,
      credentials: 'same-origin',
      signal: opts.signal,
      headers: { Accept: 'application/json', ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}) },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
    const data = await res.json().catch(() => null)
    if (!res.ok) throw new ApiError(res.status, (data && (data.error || data.message)) || `Error ${res.status}`, data)
    return data as T
  } finally {
    if (!opts.silent) { pending -= 1; emit() }
  }
}

export const api = {
  /** GET /api/<path> (o una ruta absoluta que empiece con "/"). */
  get: <T = any>(path: string, opts?: Options) => request<T>('GET', path, undefined, opts),
  /** POST JSON a /api/<path>. */
  post: <T = any>(path: string, body: unknown = {}, opts?: Options) => request<T>('POST', path, body, opts),
}
