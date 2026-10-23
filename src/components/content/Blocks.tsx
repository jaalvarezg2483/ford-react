import { useState } from 'react'
import { A } from '@/components/ui/A'
import { Carousel, ChevronArrows } from '@/components/ui/Carousel'
import { EqualHeight } from '@/components/ui/EqualHeight'
import { HeroSlider } from '@/components/home/HeroSlider'
import { ContactFormSnippet } from '@/components/forms/ContactFormSnippet'
import { useContent } from '@/data/content'
import { useTabs } from '@/hooks/useTabs'
import { money } from '@/lib/format'
import type { ContentBlock } from '@/data/types'
import { HydratedHtml } from './HydratedHtml'

function youtubeId(url: string) {
  const m = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/.exec(url)
  return m?.[1] ?? ''
}

function BackLink({ floating = false }: { floating?: boolean }) {
  return (
    <button type="button" className={floating ? 'hidden-md floating-back-link' : 'text--primary'} onClick={() => window.history.back()}>
      <strong>
        <i className="icon icon-arrow-left" /> Volver
      </strong>
    </button>
  )
}

function HtmlBlock({ html }: { html: string }) {
  return <HydratedHtml html={html} />
}

function SliderBlock({ slides, showContainer, showBackLink }: Extract<ContentBlock, { type: 'slider' }>) {
  const inner = (
    <>
      {showBackLink ? (
        <div className="hidden-xs bg-muted padding-1 text-left">
          <div className="container">
            <BackLink />
          </div>
        </div>
      ) : null}
      <HeroSlider
        slides={showBackLink ? slides.map((s) => ({ ...s })) : slides}
      />
    </>
  )
  return showContainer ? <div className="slider--hero-wrap">{inner}</div> : inner
}

function CardsBlock({ items }: Extract<ContentBlock, { type: 'cards' }>) {
  return (
    <div className="container">
      <EqualHeight className="row row-margin js-equal-height-parent" minWidth={768}>
        {items.map((c) => (
          <div className="col-sm-6" key={c.href + c.title}>
            <A href={c.href} className="card--link-responsive js-equal-height" title={c.alt || c.title}>
              <div className="card-img">{c.image ? <img src={c.image} alt={c.alt || c.title} /> : null}</div>
              <div className="card__content">
                <h3 className="title">{c.title}</h3>
                <span className="btn btn--clear">
                  Ver más <i className="icon icon-arrow-right" />
                </span>
              </div>
            </A>
          </div>
        ))}
      </EqualHeight>
    </div>
  )
}

function AboutTabsBlock({ tabs }: Extract<ContentBlock, { type: 'aboutTabs' }>) {
  const { select, tabClass, paneClass } = useTabs(0)
  return (
    <>
      <div className="container">
        <ul className="tabs js-tabs-about-us">
          {tabs.map((t, i) => (
            <li className={`tab ${tabClass(i)}`} key={t.title}>
              <button type="button" data-toggle="tab" className={tabClass(i)} onClick={() => select(i)}>
                {t.title}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="bg--accent-dark">
        <div className="tab-content container padding-2">
          {tabs.map((t, i) => (
            <div key={t.title} className={`tab-pane fade ${paneClass(i)}`}>
              <div className="row">
                <div className="col-md-6">
                  <h2 className="title text--light">{t.title}</h2>
                  <p className="text--light margin--top">{t.text}</p>
                </div>
              </div>
              <Carousel className="slider-about-us" slidesToShow={Math.min(3, t.images.length || 1)} arrows={t.images.length > 1} prevArrow={ChevronArrows.prev} nextArrow={ChevronArrows.next}>
                {t.images.map((src) => (
                  <div key={src} className="about-us-img" style={{ backgroundImage: `url('${src}')` }} />
                ))}
              </Carousel>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

function TimelineBlock({ title, items }: Extract<ContentBlock, { type: 'timeline' }>) {
  return (
    <section className="section section--slider">
      <div className="timeline-container margin--top">
        <div className="container">
          {title ? <h2 className="title">{title}</h2> : null}
          <Carousel className="timeline-slider" slidesToShow={4} infinite={false} prevArrow={ChevronArrows.prev} nextArrow={ChevronArrows.next} responsive={[{ breakpoint: 1200, settings: { slidesToShow: 3 } }, { breakpoint: 992, settings: { slidesToShow: 2 } }, { breakpoint: 768, settings: { slidesToShow: 1 } }]}>
            {items.map((it) => (
              <div className="timeline-item" key={it.year + it.text.slice(0, 12)}>
                <div className="timeline-img" style={it.image ? { backgroundImage: `url('${it.image}')` } : undefined} />
                <h4 className="title">{it.year}</h4>
                <p>{it.text}</p>
              </div>
            ))}
          </Carousel>
        </div>
      </div>
    </section>
  )
}

function SimpleBannerBlock({ slides }: Extract<ContentBlock, { type: 'simpleBanner' }>) {
  return (
    <section className="slider slider--home js-slider-home banner-slider-margin">
      {slides.map((s, i) => (
        <div key={i}>
          <picture>
            {s.xs ? <source media="(max-width: 767px)" srcSet={s.xs} /> : null}
            {s.md ? <source media="(min-width: 768px) and (max-width: 991px)" srcSet={s.md} /> : null}
            <img src={s.lg || s.md || s.xs} alt={s.alt || s.title} />
          </picture>
          <div className="slider__inner slider__technology">
            {s.title ? <p>{s.title}</p> : null}
            {s.text ? <p>{s.text}</p> : null}
          </div>
        </div>
      ))}
    </section>
  )
}

function TechCardsBlock({ anchor, title, cards }: Extract<ContentBlock, { type: 'techCards' }>) {
  const [open, setOpen] = useState<Record<number, boolean>>({})
  return (
    <div className="container technology-container" id={anchor || undefined}>
      <h1 className="category-name">{title}</h1>
      <div className="simple-card-container">
        {cards.map((c, i) => (
          <div className="content-container" key={c.title}>
            <div className="card-description">
              <p className="card-title card-title-desktop">{c.title}</p>
              <div className={`card-description-p ${open[i] ? 'unzipped-paragraph' : 'zipped-paragraph'}`} dangerouslySetInnerHTML={{ __html: c.html }} />
              <button type="button" onClick={() => setOpen((s) => ({ ...s, [i]: !s[i] }))}>
                <span className="see-more-span">{open[i] ? 'Ver menos' : 'Ver más'}</span>
                <i className={`mdi ${open[i] ? 'mdi-minus' : 'mdi-plus'}`} />
              </button>
            </div>
            <p className="card-title card-title-mobile">{c.title}</p>
            {c.image ? <img src={c.image} alt={c.title} /> : null}
          </div>
        ))}
      </div>
    </div>
  )
}

function TechHotspotsBlock({ anchor, title, image, dots }: Extract<ContentBlock, { type: 'techHotspots' }>) {
  const [active, setActive] = useState(0)
  return (
    <div className="container technology-container" id={anchor || undefined}>
      <h1 className="category-name">{title}</h1>
      <section className="section scrollspy text-center">
        <div className="hotspots">
          {image ? <img src={image} alt={title} /> : null}
          <aside className="content-hotspots">
            {dots.map((d, i) => (
              <button
                type="button"
                key={d.title}
                className={`hotspot js-hotspot-dot ${i === active ? 'hotspot-selected' : ''}`}
                style={{ top: d.top, left: d.left }}
                aria-label={d.title}
                onClick={() => setActive(i)}
              />
            ))}
          </aside>
        </div>
      </section>
      {dots.map((d, i) => (
        <div key={d.title} className={`dots-block-container ${i === active ? 'visible-block' : 'hidden-block'}`}>
          <div className="img-container">{d.image ? <img src={d.image} alt={d.title} /> : null}</div>
          <div className="content-container">
            <p>{d.title}</p>
            <div className="description-styles" dangerouslySetInnerHTML={{ __html: d.html }} />
          </div>
        </div>
      ))}
    </div>
  )
}

function TechTabsBlock({ anchor, title, tabs }: Extract<ContentBlock, { type: 'techTabs' }>) {
  const [active, setActive] = useState(0)
  const [video, setVideo] = useState<string | null>(null)
  const yt = video ? youtubeId(video) : ''
  return (
    <div className="container technology-container" id={anchor || undefined}>
      <h1 className="category-name">{title}</h1>
      <div className="innovation-tabs-container">
        <div className="buttons-container">
          {tabs.map((t, i) => (
            <div className="tab-button" key={t.label}>
              <button type="button" className={`js-innovation-tab ${i === active ? 'tab-active' : ''}`} onClick={() => setActive(i)}>
                <span className="border-bottom-mobile">{t.label}</span>
                <p className="border-bottom-desktop">{t.label}</p>
              </button>
            </div>
          ))}
        </div>
        {tabs.map((t, i) => (
          <div key={t.label} className={`tabs-body ${i === active ? 'shown-tab-content' : 'hidden-tab-content'}`}>
            <div className="tab-content">
              {t.image ? (
                <div className="card card--video card-no-hover">
                  {t.videoUrl ? (
                    <button type="button" className="card__image tabs-js-video" onClick={() => setVideo(t.videoUrl)}>
                      <img src={t.image} alt={t.title || t.label} />
                      <div className="see-video-button">
                        <i className="icon icon-play" />
                        <span>Ver video</span>
                      </div>
                    </button>
                  ) : (
                    <img src={t.image} alt={t.title || t.label} />
                  )}
                </div>
              ) : null}
              <div className="texts-content">
                <p className="title">{t.title || t.label}</p>
                <div dangerouslySetInnerHTML={{ __html: t.html }} />
                {t.videoUrl ? (
                  <button type="button" className="watch-video-button tabs-js-video" onClick={() => setVideo(t.videoUrl)}>
                    VER VIDEO
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        ))}
      </div>
      {yt ? (
        <div className="modal fade in show" role="dialog" aria-modal="true" aria-label="Video">
          <div className="modal-dialog" role="document">
            <button type="button" className="modal__close" aria-label="Cerrar" onClick={() => setVideo(null)}>
              <i className="icon icon-close" />
            </button>
            <div className="modal-content padding-2">
              <div className="embed-responsive" style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
                <iframe title={tabs[active]?.title || 'Video'} src={`https://www.youtube-nocookie.com/embed/${yt}?autoplay=1`} allow="autoplay; encrypted-media" allowFullScreen style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }} />
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function VehiclePickerBlock({ title, intro, aside, linkBase }: Extract<ContentBlock, { type: 'vehiclePicker' }>) {
  const { site } = useContent()
  const { select, tabClass, paneClass } = useTabs(0)
  const base = linkBase.endsWith('/') ? linkBase : `${linkBase}/`
  return (
    <>
      {intro ? (
        <div className="container margin--top hidden-xs">
          <div className="col-md-6">
            <h2 className="title">{aside || title}</h2>
            <p>{intro}</p>
          </div>
        </div>
      ) : null}
      <div className="container">
        <div className="row row-margin">
          {aside ? (
            <div className="col-md-2 hidden-xs">
              <div className="accessories-aside">
                <span className="active">
                  <i className="icon icon-plus-circle text--secondary" /> {aside}
                </span>
              </div>
            </div>
          ) : null}
          <div className={aside ? 'col-md-10 padding-0' : 'col-md-12'}>
            <h4 className="title container container--full-mobile">{title}</h4>
            <div className="menu--mock">
              <ul className="tabs tabs-gray-fc">
                {site.familyTypes.map((t, i) => (
                  <li className={`tab ${tabClass(i)}`} key={t.id}>
                    <button type="button" onClick={() => select(i)}>
                      {t.name}
                    </button>
                  </li>
                ))}
              </ul>
              <ul className="collapsible tab-content">
                {site.familyTypes.map((t, i) => (
                  <li className={`tab-pane fade ${paneClass(i)}`} key={t.id}>
                    <div className="collapsible__body container-fluid is-open">
                      <div className="row row--flex">
                        {t.families.map((f) => (
                          <div className="col-sm-6" key={f.slug}>
                            <A href={`${base}${f.slug}`} className="calculate-card calculate-card-link">
                              <div className="calculate-card-content">
                                {f.homeImage ? <img src={f.homeImage} alt={f.name} className="calculate-card-img" /> : null}
                                <div className="calculate-card-text">
                                  <h4 className="title">{f.name}</h4>
                                  {f.hidePrice || f.startPrice == null ? null : (
                                    <>
                                      <p>Desde</p>
                                      <h4 className="title">${money(f.startPrice)}</h4>
                                    </>
                                  )}
                                </div>
                              </div>
                            </A>
                          </div>
                        ))}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

function DownloadsBlock({ breadcrumb, title, items }: Extract<ContentBlock, { type: 'downloads' }>) {
  return (
    <>
      {breadcrumb ? (
        <div className="container container--breadcrumb">
          <ol className="breadcrumb">
            <li>
              <A href="/">
                <i className="icon icon-arrow-left breadcrumb-back" />
              </A>
            </li>
            <li>
              <A href="/">Inicio</A>
            </li>
            <li>{breadcrumb}</li>
          </ol>
        </div>
      ) : null}
      <section className="container">
        <h4 className="title text-center">{title}</h4>
        <div className="container-custom-cards">
          {items.map((it) => (
            <a key={it.url} href={it.url} className="card card--pdf" target="_blank" rel="noopener">
              <div className="card__content">
                <p>{it.title}</p>
              </div>
              <div className="card__action">
                <p>
                  Descargar PDF <i className="mdi mdi-download" />
                </p>
              </div>
            </a>
          ))}
        </div>
      </section>
    </>
  )
}

/** Dibuja un bloque de página de contenido con el marcado del sitio original. */
export function ContentBlockView({ block }: { block: ContentBlock }) {
  switch (block.type) {
    case 'html':
      return <HtmlBlock html={block.html} />
    case 'slider':
      return <SliderBlock {...block} />
    case 'cards':
      return <CardsBlock {...block} />
    case 'contactForm':
      return <ContactFormSnippet type={block.formType} title={block.title} phone={block.phone} mail={block.mail} subject={block.subject} description={block.description} />
    case 'aboutTabs':
      return <AboutTabsBlock {...block} />
    case 'timeline':
      return <TimelineBlock {...block} />
    case 'simpleBanner':
      return <SimpleBannerBlock {...block} />
    case 'techCards':
      return <TechCardsBlock {...block} />
    case 'techHotspots':
      return <TechHotspotsBlock {...block} />
    case 'techTabs':
      return <TechTabsBlock {...block} />
    case 'vehiclePicker':
      return <VehiclePickerBlock {...block} />
    case 'downloads':
      return <DownloadsBlock {...block} />
    default:
      return null
  }
}
