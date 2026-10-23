'use client'

import { useRef } from 'react'
import { Carousel, IconArrows } from '../Carousel'
import { useEqualHeight } from '../useEqualHeight'

const twoUp = [{ breakpoint: 768, settings: { arrows: false, slidesToShow: 1 } }]

export type TechItem = { title: string; text: string; image: string }

/** Sección de tecnología (renderTechnology del Symfony). */
export function TechnologySection({ kicker, title, text, items }: { kicker: string; title: string; text: string; items: TechItem[] }) {
  return (
    <div className="technology-section">
      <div className="container">
        <div className="row">
          <div className="col-md-3">
            <h3 className="subtitle">{kicker}</h3>
            <h2 className="title">{title}</h2>
            <p className="text--light margin--top">{text}</p>
          </div>
          <div className="col-md-9">
            <Carousel as="ul" className="technology-slider" slidesToShow={2} prevArrow={IconArrows.prev} nextArrow={IconArrows.next} responsive={twoUp}>
              {items.map((item) => (
                <li className="technology-card" key={item.title}>
                  <div className="technology-card-img" style={{ backgroundImage: `url('${item.image}')` }} role="img" aria-label={item.title} />
                  <h3 className="title text--light">{item.title}</h3>
                  <p className="text--light">{item.text}</p>
                </li>
              ))}
            </Carousel>
          </div>
        </div>
      </div>
    </div>
  )
}

export type NewsItem = { title: string; path: string; image: string }

/** Noticias recientes (renderRecentBlog del Symfony). */
export function RecentNews({ posts }: { posts: NewsItem[] }) {
  const root = useRef<HTMLDivElement>(null)
  useEqualHeight(root)
  return (
    <div className="container" ref={root}>
      <div className="row">
        <div className="col-md-3">
          <h3 className="subtitle">Noticias recientes</h3>
          <h2 className="title news-title">FORD</h2>
          <a className="btn hidden-xs text--bold" href="/blog">
            Ir a blog
          </a>
        </div>
        <div className="col-md-9">
          <Carousel
            className="news-slider js-equal-height-parent"
            slidesToShow={3}
            prevArrow={IconArrows.prev}
            nextArrow={IconArrows.next}
            responsive={[{ breakpoint: 768, settings: { arrows: false, slidesToShow: 1 } }]}
          >
            {posts.map((p) => (
              <div className="card--link" key={p.path}>
                <div className="news-card-img" style={{ backgroundImage: `url('${p.image}')` }} role="img" aria-label={p.title} />
                <div className="card__content js-equal-height">
                  <h4 className="title">{p.title}</h4>
                  <a className="btn btn--clear" href={p.path}>
                    Ver más <i className="icon icon-arrow-right" />
                  </a>
                </div>
              </div>
            ))}
          </Carousel>
        </div>
        <div className="col-md-2 hidden-md text-center">
          <a className="btn btn--wider margin--top text--bold" href="/blog">
            Ir a blog
          </a>
        </div>
      </div>
    </div>
  )
}
