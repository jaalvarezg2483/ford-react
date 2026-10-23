import { useState } from 'react'
import type { Family } from '@/data/types'
import { Carousel, IconArrows } from '@/components/ui/Carousel'

/** Visor de colores: imagen grande con fundido y selector de muestras sincronizado. */
export function ColorPicker({ family }: { family: Family }) {
  const colors = family.colors
  const [index, setIndex] = useState(0)
  if (!colors.length) return null
  const navSlides = colors.length <= 5 ? 3 : 5
  return (
    <section className="car__colors">
      <div className="container">
        <Carousel className="slider slider--colors js-slider-colors" arrows={false} fade index={index} onChange={setIndex}>
          {colors.map((color) => (
            <div key={color.name}>
              <img src={color.image} alt={`${family.name} ${color.name}${family.year ? ` ${family.year}` : ''}`} />
            </div>
          ))}
        </Carousel>
        <div id="colorSelect">
          <p className="text-center text--medium">Seleccione un color</p>
          <Carousel
            className="slider slider--nav slider--colors-nav js-slider-colors-nav"
            slidesToShow={navSlides}
            centerMode
            centerPadding="0px"
            index={index}
            onChange={setIndex}
            prevArrow={IconArrows.prev}
            nextArrow={IconArrows.next}
            responsive={[{ breakpoint: 480, settings: { slidesToShow: 3 } }]}
          >
            {colors.map((color, i) => (
              <div key={color.name} onClick={() => setIndex(i)} role="button" tabIndex={-1}>
                <span style={{ backgroundColor: color.hex.startsWith('#') ? color.hex : `#${color.hex}` }} data-colorname={color.name} data-colordisclaimer={color.disclaimer} />
                <p className="color-name text--bold">{color.name}</p>
              </div>
            ))}
          </Carousel>
          {colors[index]?.disclaimer ? <p className="text--small text-center">{colors[index].disclaimer}</p> : null}
        </div>
      </div>
    </section>
  )
}
