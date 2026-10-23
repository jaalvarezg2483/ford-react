import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '@/lib/api'
import type { CitasSession } from './types'

export function useCitasSession(step: number) {
  const navigate = useNavigate()
  const [session, setSession] = useState<CitasSession | null>(null)

  useEffect(() => {
    let cancelled = false
    api
      .get<CitasSession>('/api/citas/session')
      .then((data) => {
        if (cancelled) return
        if (step > 0 && (!data.vehicles || data.vehicles.length === 0)) {
          navigate('/citas', { replace: true })
          return
        }
        if (step === 2 && data.currentAppointment) {
          navigate('/citas/step3', { replace: true })
          return
        }
        setSession(data)
      })
      .catch(() => {
        if (!cancelled && step > 0) navigate('/citas', { replace: true })
      })
    return () => {
      cancelled = true
    }
  }, [step, navigate])

  return session
}
