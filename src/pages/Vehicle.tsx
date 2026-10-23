import { Navigate, useParams } from 'react-router-dom'
import { useContent, useFamily } from '@/data/content'
import { money } from '@/lib/format'
import { A } from '@/components/ui/A'
import { Carousel, IconArrows } from '@/components/ui/Carousel'
import { VehicleHero } from '@/components/vehicle/VehicleHero'
import { ColorPicker } from '@/components/vehicle/ColorPicker'
import { ModelsSection } from '@/components/vehicle/ModelsSection'

const purdyGoStyle = { backgroundColor: '#00095B', color: 'white' }

/** Ficha de un vehículo: banner, descripción, colores, características, modelos, galería y descargas. */
export function Vehicle() {
  const { slug } = useParams()
  const family = useFamily(slug)
  const { site } = useContent()
  if (!family) return <Navigate to="/404" replace />

  const price = family.startPrice != null && !family.hidePrice ? `$${money(family.startPrice)}` : ''
  const phone = site.whatsapp?.phone.replace(/\D/g, '')
  const whatsapp = phone ? `https://api.whatsapp.com/send?phone=+${phone}&text=${encodeURIComponent(`¡Quiero RESERVAR el ${family.name}!`)}` : ''
  const base = `/autos/${family.slug}`

  return (
    <main id="main-content" tabIndex={-1}>
      <div className="wrapper--car">
        <VehicleHero family={family} current="perfil" />
        <section>
          <div className="car-profile-description">
            <div className="car-profile-text">
              <h1 className="title">
                <span>Ford</span> {family.name}
              </h1>
              {price ? (
                <h3 className="title">
                  <span>desde:</span> {price}
                </h3>
              ) : null}
            </div>
            <div className="car-profile-text">
              {family.tagline ? <p className="text text--medium">{family.tagline}</p> : null}
              <div className="container" style={{ marginLeft: 20 }}>
                {family.purdyGoUrl ? (
                  <a href={family.purdyGoUrl} className="btn btn--icon" target="_blank" rel="noopener noreferrer" style={purdyGoStyle}>
                    Ir a PURDY GO y Reservar en Línea
                  </a>
                ) : null}
                {whatsapp ? (
                  <a href={whatsapp} className="btn btn--wa-green btn--icon" target="_blank" rel="noopener noreferrer">
                    <i className="icon icon-whatsapp" /> Negociá con un Asesor
                  </a>
                ) : null}
                {family.showCalculate ? (
                  <A href={`${base}/modelos`} className="btn btn--primary btn--icon">
                    <i className="icon icon-calculator" /> Calcular Financiamiento
                  </A>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        {family.leadTitle || family.leadText ? (
          <section className="car-profile-lead bg--accent-light">
            <div className="container">
              <h3 className="title">{family.leadTitle}</h3>
              <p className="text text-medium">{family.leadText}</p>
            </div>
          </section>
        ) : null}

        <ColorPicker family={family} />

        {family.highlights.length > 0 && (
          <section className="car-profile-features">
            <div className="container">
              <h2 className="title">Características destacadas</h2>
              <Carousel
                className="car-profile-features-slider"
                slidesToShow={3}
                prevArrow={<button type="button" className="slick-arrow slick-prev"><i className="icon icon-arrow-left" aria-hidden="true" /></button>}
                nextArrow={<button type="button" className="slick-arrow slick-next"><i className="icon icon-arrow-right" aria-hidden="true" /></button>}
                responsive={[{ breakpoint: 768, settings: { slidesToShow: 1, centerMode: false, arrows: false } }]}
              >
                {family.highlights.map((h) => (
                  <div className="features-slide" key={h.title}>
                    <div className="car-profile-feature-card">
                      <div className="car-profile-feature-img">
                        <img src={h.image} alt={h.title} loading="lazy" />
                      </div>
                      <div className="car-profile-feature-text">
                        <h3 className="title text--light">{h.title}</h3>
                        <div className="text--light" dangerouslySetInnerHTML={{ __html: h.text }} />
                      </div>
                    </div>
                  </div>
                ))}
              </Carousel>
            </div>
          </section>
        )}

        <ModelsSection family={family} />

        {family.gallery.some((g) => g.items.length > 0) && (
          <section className="container">
            <h2 className="title">Galería</h2>
            <div className="margin--top">
              <Carousel
                className="gallery-slider"
                slidesToShow={3}
                prevArrow={IconArrows.prev}
                nextArrow={IconArrows.next}
                responsive={[{ breakpoint: 768, settings: { arrows: false, slidesToShow: 1 } }]}
              >
                {family.gallery
                  .flatMap((g) => g.items)
                  .slice(0, 3)
                  .map((item, i) => (
                    <div className="gallery__item" key={i}>
                      <div className="profile-img-container" style={{ backgroundImage: `url('${item.image}')` }} />
                      <p className="margin-top">{item.caption}</p>
                    </div>
                  ))}
              </Carousel>
            </div>
            <div className="message-box">
              <p>* Imágenes con fines ilustrativos</p>
            </div>
            <div className="text-center margin--top">
              <A className="btn" href={`${base}/galeria`}>
                Ver todas
              </A>
            </div>
          </section>
        )}

        {family.showCalculate && (
          <div className="bg--accent-light">
            <div className="container">
              <div className="row row-margin">
                <div className="col-md-6">
                  <div className="title-icon">
                    <div className="icon-box">
                      <i className="icon icon-calculator" />
                    </div>
                    <div>
                      <p>Calcule su</p>
                      <h3 className="title">financiamiento</h3>
                    </div>
                  </div>
                  <p>Cotizar tu FORD es muy fácil. Elegí el modelo y extras y obtené un estimado de la cuota.</p>
                  <A href={`${base}/modelos`} className="btn btn--clear">
                    Calcular <i className="icon icon-arrow-right" />
                  </A>
                </div>
              </div>
            </div>
          </div>
        )}

        {family.dataSheets.length > 0 && (
          <section className="section scrollspy car__downloads" id="descargas">
            <div className="container">
              <div className="center">
                <p className="subtitle">Descargas:</p>
                <div className="link--icon-container">
                  {family.dataSheets.map((d) => (
                    <a className="link--icon" href={d.url} target="_blank" rel="noopener noreferrer" key={d.url}>
                      {' '}
                      <i className="mdi mdi-download" /> {d.title}
                    </a>
                  ))}
                </div>
              </div>
              <div className="center">
                <p className="subtitle">Ver en línea:</p>
                <div className="link--icon-container">
                  {family.dataSheets
                    .filter((d) => d.id != null)
                    .map((d) => (
                      <a className="link--icon" href={`/view-pdf/${family.slug}/${d.id}`} target="_blank" rel="noopener noreferrer" key={d.url}>
                        {' '}
                        <i className="mdi mdi-eye" /> {d.title}
                      </a>
                    ))}
                </div>
              </div>
            </div>
          </section>
        )}
        <div className="message-box">
          <p>* Imágenes con fines ilustrativos</p>
        </div>
      </div>
    </main>
  )
}
