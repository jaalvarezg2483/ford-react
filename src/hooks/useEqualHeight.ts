import { useEffect, type RefObject } from 'react'

/**
 * Iguala la altura de los elementos `.js-equal-height` dentro del contenedor
 * (reemplaza equalHeight() de main.js). Se recalcula al cambiar el tamaño.
 */
export function useEqualHeight(ref: RefObject<HTMLElement | null>, selector = '.js-equal-height', deps: unknown[] = [], minWidth = 0) {
  useEffect(() => {
    const root = ref.current
    if (!root) return
    const apply = () => {
      const items = Array.from(root.querySelectorAll<HTMLElement>(selector))
      items.forEach((el) => (el.style.height = ''))
      if (window.innerWidth < minWidth) return
      const max = Math.max(0, ...items.map((el) => el.offsetHeight))
      if (max) items.forEach((el) => (el.style.height = `${max}px`))
    }
    apply()
    const imgs = Array.from(root.querySelectorAll('img'))
    imgs.forEach((img) => img.addEventListener('load', apply))
    const ro = new ResizeObserver(() => requestAnimationFrame(apply))
    ro.observe(root)
    window.addEventListener('load', apply)
    return () => {
      ro.disconnect()
      imgs.forEach((img) => img.removeEventListener('load', apply))
      window.removeEventListener('load', apply)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
