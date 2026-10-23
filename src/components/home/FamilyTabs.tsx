import { useRef } from 'react'
import type { FamilyType } from '@/data/types'
import { money } from '@/lib/format'
import { Carousel, IconArrows } from '@/components/ui/Carousel'
import { A } from '@/components/ui/A'
import { useTabs } from '@/hooks/useTabs'
import { useEqualHeight } from '@/hooks/useEqualHeight'
import { spaced } from '@/components/ui/spaced'

/** Pestañas de vehículos de la portada (familyList del Symfony). */
export function FamilyTabs({ types }: { types: FamilyType[] }) {
  const tabs = useTabs(0)
  const root = useRef<HTMLDivElement>(null)
  useEqualHeight(root, '.tab-pane.active .js-equal-height', [tabs.active])
  return (
    <div className="container" ref={root}>
      <ul className="tabs tabs-home js-tabs-car" role="tablist">
        {spaced(types.map((t, i) => (
          <li
            key={t.id}
            className={`tab ${tabs.tabClass(i)} ${t.textColor.toLowerCase() !== '#000000' ? 'custom-color' : ''}`}
            style={{ ['--category-text-color' as string]: t.textColor, ['--underlined-text-color' as string]: t.underlineColor }}
          >
            <A
              href={`#slider${i + 1}`}
              role="tab"
              aria-selected={tabs.active === i}
              onClick={(e) => {
                e.preventDefault()
                tabs.select(i)
              }}
            >
              {t.name}
            </A>
          </li>
        )))}
      </ul>
      <ul className="collapsible tab-content js-collapse-car">
        {types.map((t, i) => {
          const cardStyles = new Map(t.cardStyles.map((card) => [card.slug, card]))
          return (
            <li key={t.id} className={`tab-pane fade tab--find-car ${tabs.paneClass(i)}`} id={`slider${i + 1}`} role="tabpanel">
              <div className="row">
                <Carousel
                  className="slider slider--car js-slider-car js-equal-height-parent"
                  slidesToShow={4}
                  prevArrow={IconArrows.prev}
                  nextArrow={IconArrows.next}
                  responsive={[{ breakpoint: 768, settings: { arrows: false, slidesToShow: 1 } }]}
                >
                  {t.families.map((f) => {
                    const style = cardStyles.get(f.slug)
                    return (
                      <div key={f.slug} style={{ ['--linear-gradient-custom' as string]: style?.gradient || f.homeGradient }}>
                        <div className="model-bg" style={{ backgroundColor: style?.color || f.homeColor }} />
                        <A href={`/autos/${f.slug}`} className="slider__link js-equal-height">
                          <div className="slider__details">
                            <p>Ford</p>
                            <h2>{f.name}</h2>
                            {f.hidePrice ? null : (
                              <>
                                <p>desde</p>
                                <h3>${money(f.startPrice)}</h3>
                              </>
                            )}
                          </div>
                          {f.homeImage || style?.image ? <img src={f.homeImage || style?.image} alt={f.name} loading="lazy" /> : null}
                          <span className="btn btn--clear btn-like">
                      <span>
                        Ver más <i className="icon icon-arrow-right" />
                      </span>
                    </span>
                        </A>
                      </div>
                    )
                  })}
                </Carousel>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
