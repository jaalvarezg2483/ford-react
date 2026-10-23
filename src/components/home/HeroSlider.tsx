import { Carousel, ChevronArrows } from '@/components/ui/Carousel'
import { A } from '@/components/ui/A'
import type { HeroSlide } from '@/data/types'

/** Banner principal (renderSlider del CMS anterior) sobre el carrusel React. */
export function HeroSlider({ slides }: { slides: HeroSlide[] }) {
  return (
    <Carousel
      className="slider--hero"
      dots
      autoplay
      prevArrow={ChevronArrows.prev}
      nextArrow={ChevronArrows.next}
      responsive={[{ breakpoint: 768, settings: { arrows: false, dots: true } }]}
    >
      {slides.map((item, i) => {
        const alt = item.alt || `Banner ${i + 1}`
        return (
          <div className="hero-slide" key={i}>
            {item.video ? (
              <video className="hero-background" autoPlay muted loop playsInline poster={item.md}>
                <source src={item.video} type="video/mp4" />
              </video>
            ) : item.xs ? (
              <picture className="hero-background">
                <source media="(max-width: 599px)" srcSet={item.xs} />
                <source media="(min-width: 600px) and (max-width: 767px)" srcSet={item.md} />
                <source media="(min-width: 768px)" srcSet={item.lg} />
                <img src={item.xs} alt={alt} className="bannerimg" fetchPriority={i === 0 ? 'high' : undefined} />
              </picture>
            ) : (
              <picture className="hero-background">
                <source media="(min-width: 600px) and (max-width: 1199px)" srcSet={item.md} />
                <source media="(min-width: 768px)" srcSet={item.lg} />
                <img src={item.lg} alt={alt} className="bannerimg" fetchPriority={i === 0 ? 'high' : undefined} />
              </picture>
            )}
            <div className="title_container">
              <h1 className="title text--light">{item.title}</h1>
            </div>
            {item.link ? (
              <div className="button-container">
                <A className="btn btn--primary btn-banner" href={item.link} {...(item.link === 'https://purdyenlinea.com/' ? { target: '_blank', rel: 'noopener' } : {})}>
                  {item.btnText || 'Ver más'}
                </A>
              </div>
            ) : null}
          </div>
        )
      })}
    </Carousel>
  )
}
