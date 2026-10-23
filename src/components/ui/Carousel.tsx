import {
  Children,
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type ReactElement,
  type ReactNode,
} from 'react'

/**
 * Carrusel en React que reemplaza a slick (jQuery). Genera las mismas clases
 * (slick-slider, slick-list, slick-track, slick-slide, slick-dots…) para que el
 * CSS original del sitio se aplique igual, pero sin jQuery.
 *
 * Los anchos y desplazamientos se calculan en porcentajes: el servidor entrega
 * el carrusel ya armado y no hay salto de diseño al cargar.
 */
export type CarouselSettings = {
  slidesToShow?: number
  slidesToScroll?: number
  infinite?: boolean
  dots?: boolean
  arrows?: boolean
  autoplay?: boolean
  autoplaySpeed?: number
  speed?: number
  fade?: boolean
  centerMode?: boolean
  centerPadding?: string
}

export type CarouselProps = CarouselSettings & {
  as?: ElementType
  className?: string
  style?: CSSProperties
  prevArrow?: ReactElement<{ className?: string }>
  nextArrow?: ReactElement<{ className?: string }>
  /** Igual que `responsive` de slick: se aplica por debajo del ancho indicado. */
  responsive?: { breakpoint: number; settings: CarouselSettings }[]
  /** Índice inicial y control externo (p. ej. un carrusel de navegación). */
  index?: number
  onChange?: (index: number) => void
  children: ReactNode
}

const DEFAULTS: Required<CarouselSettings> = {
  slidesToShow: 1,
  slidesToScroll: 1,
  infinite: true,
  dots: false,
  arrows: true,
  autoplay: false,
  autoplaySpeed: 3000,
  speed: 300,
  fade: false,
  centerMode: false,
  centerPadding: '50px',
}

function useBreakpointSettings(base: CarouselSettings, responsive: CarouselProps['responsive']) {
  const [width, setWidth] = useState<number | null>(null)
  useEffect(() => {
    if (!responsive?.length) return
    const update = () => setWidth(window.innerWidth)
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [responsive])
  return useMemo(() => {
    const defined = <T extends object>(o: T) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined)) as Partial<T>
    const settings = { ...DEFAULTS, ...defined(base) }
    if (width == null || !responsive?.length) return settings
    // slick (mobileFirst: false): gana el breakpoint más chico que sea mayor al ancho.
    const match = [...responsive].sort((a, b) => a.breakpoint - b.breakpoint).find((r) => width < r.breakpoint)
    return match ? { ...settings, ...defined(match.settings) } : settings
  }, [base, responsive, width])
}

export function Carousel(props: CarouselProps) {
  const { as: Tag = 'div', className = '', style, prevArrow, nextArrow, responsive, children, onChange } = props
  const base = useMemo<CarouselSettings>(
    () => ({
      slidesToShow: props.slidesToShow,
      slidesToScroll: props.slidesToScroll,
      infinite: props.infinite,
      dots: props.dots,
      arrows: props.arrows,
      autoplay: props.autoplay,
      autoplaySpeed: props.autoplaySpeed,
      speed: props.speed,
      fade: props.fade,
      centerMode: props.centerMode,
      centerPadding: props.centerPadding,
    }),
    [props.slidesToShow, props.slidesToScroll, props.infinite, props.dots, props.arrows, props.autoplay, props.autoplaySpeed, props.speed, props.fade, props.centerMode, props.centerPadding],
  )
  const s = useBreakpointSettings(base, responsive)
  const slides = Children.toArray(children).filter(isValidElement) as ReactElement<any>[]
  const count = slides.length
  const show = Math.min(s.slidesToShow, Math.max(count, 1))
  const scrollable = count > s.slidesToShow
  const infinite = s.infinite && scrollable && !s.fade
  const pre = infinite ? (s.centerMode ? show + 1 : show) : 0

  // `position` puede salir del rango [0, count) mientras anima hacia un clon.
  const [position, setPosition] = useState(props.index ?? 0)
  const [animate, setAnimate] = useState(false)
  const current = ((position % count) + count) % (count || 1)

  useEffect(() => {
    if (props.index != null && props.index !== current) {
      setAnimate(true)
      setPosition(props.index)
    }
    // Solo reacciona a cambios externos del índice.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.index])

  const goTo = useCallback(
    (target: number) => {
      if (!scrollable) return
      let next = target
      if (!infinite) next = Math.max(0, Math.min(target, count - (s.centerMode ? 1 : show)))
      setAnimate(true)
      setPosition(next)
      onChange?.(((next % count) + count) % count)
    },
    [scrollable, infinite, count, show, s.centerMode, onChange],
  )

  // Al terminar de animar hacia un clon, salta sin animación a la diapositiva real.
  useEffect(() => {
    if (!animate) return
    const t = window.setTimeout(() => {
      setAnimate(false)
      if (position !== current) setPosition(current)
    }, s.speed)
    return () => window.clearTimeout(t)
  }, [animate, position, current, s.speed])

  // Reproducción automática (se pausa con el mouse encima o con la pestaña oculta).
  const [paused, setPaused] = useState(false)
  useEffect(() => {
    if (!s.autoplay || !scrollable || paused) return
    const t = window.setInterval(() => {
      if (!document.hidden) goTo(position + s.slidesToScroll)
    }, s.autoplaySpeed)
    return () => window.clearInterval(t)
  }, [s.autoplay, s.autoplaySpeed, s.slidesToScroll, scrollable, paused, position, goTo])

  // Arrastre con dedo o mouse.
  const drag = useRef<{ x: number; width: number } | null>(null)
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!scrollable) return
    drag.current = { x: e.clientX, width: e.currentTarget.offsetWidth }
  }
  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current
    drag.current = null
    if (!d) return
    const dx = e.clientX - d.x
    if (Math.abs(dx) > d.width / 5) goTo(position + (dx < 0 ? s.slidesToScroll : -s.slidesToScroll))
  }

  // slick resta el margen horizontal de cada diapositiva a su ancho: se mide en el navegador.
  const trackRef = useRef<HTMLDivElement>(null)
  const [marginH, setMarginH] = useState(0)
  useLayoutEffect(() => {
    const first = trackRef.current?.querySelector<HTMLElement>('.slick-slide')
    if (!first) return
    const cs = getComputedStyle(first)
    const m = (parseFloat(cs.marginLeft) || 0) + (parseFloat(cs.marginRight) || 0)
    if (m !== marginH) setMarginH(m)
  })

  // Ancho del área visible: en el navegador se trabaja en píxeles con las mismas
  // fórmulas de slick (Math.ceil); en el servidor, en porcentajes equivalentes.
  const listRef = useRef<HTMLDivElement>(null)
  const [listWidth, setListWidth] = useState(0)
  useLayoutEffect(() => {
    const el = listRef.current
    if (!el) return
    const measure = () => {
      const cs = getComputedStyle(el)
      setListWidth(el.clientWidth - (parseFloat(cs.paddingLeft) || 0) - (parseFloat(cs.paddingRight) || 0))
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const total = pre * 2 + count
  const slots = s.fade ? count : total
  const offset = s.centerMode && !infinite ? 0 : s.centerMode ? Math.floor(show / 2) : 0
  const steps = s.fade || !scrollable ? 0 : pre + position - offset
  const px = listWidth > 0 ? Math.ceil(listWidth / show) : 0
  const slideWidth = 100 / slots
  const trackStyle: CSSProperties = {
    opacity: 1,
    width: px ? `${Math.ceil(px * slots)}px` : `${(slots / (s.fade ? 1 : show)) * 100}%`,
    transform: px ? `translate3d(${-steps * px}px, 0px, 0px)` : `translate3d(${-steps * slideWidth}%, 0px, 0px)`,
    transition: animate && !s.fade ? `transform ${s.speed}ms ease` : undefined,
  }
  const slideCss = (index: number): CSSProperties => {
    const width = px ? `${px - marginH}px` : marginH ? `calc(${slideWidth}% - ${marginH}px)` : `${slideWidth}%`
    if (!s.fade) return { width }
    const real = ((index % count) + count) % count
    return {
      width,
      position: 'relative',
      left: px ? `${-index * px}px` : `${-index * slideWidth}%`,
      top: 0,
      zIndex: real === current ? 999 : 998,
      opacity: real === current ? 1 : 0,
      transition: `opacity ${s.speed}ms ease`,
    }
  }

  const isActive = (i: number) => {
    if (s.centerMode) {
      const half = Math.floor(show / 2)
      return i >= current - half && i <= current + half
    }
    return i >= current && i < current + show
  }

  const renderSlide = (el: ReactElement<any>, index: number, cloned: boolean, key: string) => {
    const real = ((index % count) + count) % count
    const visible = !cloned && isActive(index)
    const classes = [el.props.className, 'slick-slide', cloned && 'slick-cloned', !cloned && real === current && 'slick-current', visible && 'slick-active', s.centerMode && !cloned && real === current && 'slick-center']
      .filter(Boolean)
      .join(' ')
    return cloneElement(el, {
      key,
      className: classes,
      'data-slick-index': index,
      'aria-hidden': visible ? 'false' : 'true',
      tabIndex: visible ? 0 : -1,
      style: { ...el.props.style, ...slideCss(index) },
    })
  }

  const trackChildren: ReactElement[] = []
  if (infinite) for (let i = count - pre; i < count; i++) trackChildren.push(renderSlide(slides[i], i - count, true, `pre-${i}`))
  slides.forEach((el, i) => trackChildren.push(renderSlide(el, i, false, `s-${i}`)))
  if (infinite) for (let i = 0; i < pre; i++) trackChildren.push(renderSlide(slides[i], i + count, true, `post-${i}`))

  const arrow = (el: ReactElement<{ className?: string }> | undefined, dir: -1 | 1) => {
    if (!s.arrows || !el) return null
    const disabled = !scrollable || (!infinite && (dir < 0 ? current === 0 : current >= count - show))
    return cloneElement(el as ReactElement<any>, {
      className: [el.props.className, 'slick-arrow', !scrollable && 'slick-hidden', disabled && scrollable && 'slick-disabled'].filter(Boolean).join(' '),
      'aria-label': dir < 0 ? 'Anterior' : 'Siguiente',
      'aria-disabled': disabled ? 'true' : 'false',
      onClick: () => goTo(position + dir * s.slidesToScroll),
    })
  }

  const dotCount = s.dots && scrollable ? Math.ceil((infinite ? count : count - show + 1) / s.slidesToScroll) : 0

  return (
    <Tag
      className={[className, 'slick-initialized', 'slick-slider', s.dots && 'slick-dotted'].filter(Boolean).join(' ')}
      style={style}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {arrow(prevArrow, -1)}
      <div
        className="slick-list draggable"
        ref={listRef}
        style={s.centerMode ? { padding: `0px ${s.centerPadding}` } : undefined}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => (drag.current = null)}
      >
        <div className="slick-track" style={trackStyle} ref={trackRef}>
          {trackChildren}
        </div>
      </div>
      {arrow(nextArrow, 1)}
      {dotCount > 0 && (
        <ul className="slick-dots" role="tablist">
          {Array.from({ length: dotCount }, (_, i) => (
            <li key={i} className={Math.floor(current / s.slidesToScroll) === i ? 'slick-active' : undefined} role="presentation">
              <button type="button" role="tab" aria-label={`${i + 1} de ${dotCount}`} onClick={() => goTo(i * s.slidesToScroll)}>
                {i + 1}
              </button>
            </li>
          ))}
        </ul>
      )}
    </Tag>
  )
}

/** Flechas con el mismo marcado que el sitio anterior. */
export const IconArrows = {
  prev: (
    <button type="button" className="slick-prev">
      {' '}
      <i className="icon icon-arrow-left" />{' '}
    </button>
  ),
  next: (
    <button type="button" className="slick-next">
      {' '}
      <i className="icon icon-arrow-right" />{' '}
    </button>
  ),
}
export const ChevronArrows = {
  prev: (
    <button type="button" className="slick-prev">
      {' '}
      <i className="mdi mdi-chevron-left" />{' '}
    </button>
  ),
  next: (
    <button type="button" className="slick-next">
      {' '}
      <i className="mdi mdi-chevron-right" />{' '}
    </button>
  ),
}
