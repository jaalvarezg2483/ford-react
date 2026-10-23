import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Pestañas con la misma transición que las de Bootstrap 3 (`.tab-pane.fade`):
 * la pestaña saliente pierde `in`, a los 150 ms se cambia `active` y la nueva
 * recibe `in`. Así el CSS original anima igual, sin jQuery ni Bootstrap JS.
 */
export function useTabs(initial = 0, onShown?: (index: number) => void) {
  const [active, setActive] = useState(initial)
  const [visible, setVisible] = useState(initial)
  const timer = useRef<number | undefined>(undefined)

  const select = useCallback(
    (index: number) => {
      if (index === active) return
      window.clearTimeout(timer.current)
      setVisible(-1)
      timer.current = window.setTimeout(() => {
        setActive(index)
        requestAnimationFrame(() => {
          setVisible(index)
          onShown?.(index)
        })
      }, 150)
    },
    [active, onShown],
  )

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const tabClass = (i: number) => (i === active ? 'active' : '')
  const paneClass = (i: number) => [i === active && 'active', i === visible && 'in'].filter(Boolean).join(' ')
  return { active, select, tabClass, paneClass }
}
