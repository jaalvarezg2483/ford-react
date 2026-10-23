import type { Cta } from '@/data/types'
import { useContent } from '@/data/content'
import { A } from '@/components/ui/A'
import { HeroSlider } from '@/components/home/HeroSlider'
import { FamilyTabs } from '@/components/home/FamilyTabs'
import { RecentNews, TechnologySection } from '@/components/home/HomeSliders'
import { SizmekTracking } from '@/components/layout/Tracking'
import { EqualHeight } from '@/components/ui/EqualHeight'

function CtaBox({ cta, icon, small }: { cta: Cta; icon: string; small?: boolean }) {
  return (
    <div className="col-md-6">
      <div className="title-icon">
        <div className="icon-box">
          <i className={`icon icon-${icon}`} />
        </div>
        <div className="hidden-xs">
          <h5 className="title">{cta.kicker}</h5>
          <h2 className="title">{cta.title}</h2>
        </div>
        <div className="hidden-md">
          <h3 className="title">{`${cta.kicker} ${cta.title}`.trim()}</h3>
        </div>
      </div>
      <p className={small ? 'text--small' : undefined}>{cta.text}</p>
      <A href={cta.href} className="btn btn--clear">
        {cta.linkLabel} <i className="icon icon-arrow-right" />
      </A>
    </div>
  )
}

function ContactBox({ cta, mobile }: { cta: Cta; mobile?: boolean }) {
  return (
    <div className="col-md-6">
      <div className="title-icon">
        <div className="icon-box">
          <i className="icon icon-chat-alt" />
        </div>
        <div>
          <h2 className="title">{mobile ? cta.titleMobile : cta.title}</h2>
        </div>
      </div>
      <p className={mobile ? 'text--small' : undefined}>{cta.text}</p>
      <A href={cta.href} className="btn btn--clear">
        {cta.linkLabel} <i className="icon icon-arrow-right" />
      </A>
    </div>
  )
}

/** Portada. Cada sección es un componente; el contenido sale del CMS. */
export function Home() {
  const { home, site } = useContent()
  const app = home.app
  return (
    <main id="main-content" tabIndex={-1} className="cms_home">
      <h1 style={{ display: 'none' }}>Ford CR | Grupo Purdy | Vehículos Nuevos en Costa Rica</h1>
      <div className="stats container" />
      <div>
        <HeroSlider slides={home.slides} />
      </div>

      <div className="container">
        <h2 className="title title-margin">{home.vehiclesTitle}</h2>
      </div>
      <FamilyTabs types={site.familyTypes} />

      <div className="container">
        <h2 className="title title-margin">{home.servicesTitle}</h2>
        <p>{home.servicesText}</p>
      </div>
      {home.serviceRows.map((row, r) => (
        <div className="container" key={r}>
          <EqualHeight className="row margin--top js-equal-height-parent">
            {row.map((card) => (
              <div className="col-sm-4" key={card.href}>
                <A href={card.href} className="card--link-responsive js-equal-height">
                  <div className="card-img">
                    <img src={card.image} alt={card.alt || card.title} loading="lazy" />
                  </div>
                  <div className="card__content">
                    <h3 className="title">{card.title}</h3>
                    <span className="btn btn--clear btn-like">
                      <span>
                        Ver más <i className="icon icon-arrow-right" />
                      </span>
                    </span>
                  </div>
                </A>
              </div>
            ))}
          </EqualHeight>
        </div>
      ))}

      <div>
        <TechnologySection {...home.tech} />
      </div>

      <div className="container">
        <div className="row row-margin hidden-md">
          <CtaBox cta={home.financing} icon="calculator" small />
          <hr className="hidden-md" />
          <CtaBox cta={home.compare} icon="car" small />
        </div>
      </div>
      <div className="bg--accent-light">
        <div className="container hidden-xs margin--bottom">
          <div className="row row-margin">
            <CtaBox cta={home.financing} icon="calculator" />
            <hr className="hidden-md" />
            <CtaBox cta={home.compare} icon="car" />
          </div>
        </div>
      </div>

      <div>
        <RecentNews posts={home.news} />
      </div>

      <div className="container">
        <div className="container hidden-md">
          <div className="row margin--top margin--bottom">
            <ContactBox cta={home.contact} mobile />
          </div>
        </div>
      </div>
      <div className="bg--accent-light">
        <div className="container hidden-xs">
          <div className="row margin--top margin--bottom">
            <ContactBox cta={home.contact} />
          </div>
        </div>
      </div>

      {app.title ? (
        <div className="bg--accent-light">
          <div className="banner--full banner--full--apps-promo">
            <div className="info-container">
              <img src={app.logo} className="logo" alt="Logo Purdy Go" />
              <h3 className="title">{app.title}</h3>
              <p>{app.text}</p>
              <div className="buttons-container">
                <a target="_blank" rel="noopener" href={app.registerUrl} className="btn btn--red">
                  {app.buttonLabel}
                </a>
                <div className="store-links">
                  <a href={app.appStoreUrl} title="App Store">
                    <img src="/img/banners/promo-purdy-go/app-store@2x.png" alt="App Store" />
                  </a>
                  <a href={app.playStoreUrl} title="Google Play">
                    <img src="/img/banners/promo-purdy-go/google-play@2x.png" alt="Google Play" />
                  </a>
                </div>
              </div>
              <img className="phone-img hidden-sm hidden-md hidden-lg" src={app.phoneMobile} alt="Purdy Go App" />
              <img className="phone-img hidden-xs" src={app.phoneDesktop} alt="Purdy Go App" />
            </div>
          </div>
        </div>
      ) : null}
      <SizmekTracking rb={home.sizmek.rb} ca={home.sizmek.ca} />
    </main>
  )
}
