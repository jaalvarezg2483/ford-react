import { A } from '@/components/ui/A'
import { EqualHeight } from '@/components/ui/EqualHeight'
import { useContent } from '@/data/content'

/** Mapa del sitio: mismas secciones y enlaces que /sitemap de ford.cr. */
export function Sitemap() {
  const { site } = useContent()
  return (
    <main id="main-content" tabIndex={-1}>
      <div className="wrapper">
        <div className="sitemap">
          <h1 className="title text-center margin--top">MAPA DE SITIO</h1>
          <section className="sitemap__section container">
            <h2 className="title sitemap__title">AUTOS</h2>
            <EqualHeight className="row js-equal-height-parent" minWidth={992}>
              {site.familyTypes.map((type) => (
                <div className="col-md-4 sitemap__list js-equal-height" key={type.id}>
                  <h3>{type.name}</h3>
                  <ul>
                    {type.families.map((family) => (
                      <li key={family.slug}>
                        <A href={`/autos/${family.slug}`}>{family.name}</A>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <div className="col-md-4 sitemap__list">
                <h3>
                  <a href="https://www.purdyusados.com" target="_blank" rel="noopener noreferrer">
                    Vehículos usados <i className="mdi mdi-open-in-new text--primary" />
                  </a>
                </h3>
              </div>
            </EqualHeight>
          </section>
          <section className="sitemap__section container">
            <h2 className="title sitemap__title">Servicios</h2>
            <EqualHeight className="row js-equal-height-parent" minWidth={992}>
              <div className="col-md-4 sitemap__list js-equal-height">
                <h3>
                  <A href="/servicio/accesorios">Accesorios</A>
                </h3>
              </div>
              <div className="col-md-4 sitemap__list js-equal-height">
                <h3>
                  <A href="/servicios/repuestos">Repuestos</A>
                </h3>
              </div>
              <div className="col-md-4 sitemap__list js-equal-height">
                <h3>
                  <A href="/mantenimiento-y-talleres">Mantenimiento y talleres</A>
                </h3>
                <ul>
                  <li>
                    <A href="/planes-mantenimiento">Planes de mantenimiento</A>
                  </li>
                  <li>
                    <A href="/carroceria-pintura">Carrocería y pintura</A>
                  </li>
                </ul>
              </div>
              <div className="col-md-4 sitemap__list js-equal-height">
                <h3>
                  <A href="/seguros">Seguros</A>
                </h3>
                <ul>
                  <li>
                    <A href="/seguros/coberturas">Coberturas</A>
                  </li>
                  <li>
                    <A href="/seguros/condiciones">Condiciones</A>
                  </li>
                </ul>
              </div>
            </EqualHeight>
          </section>
          <section className="sitemap__section container">
            <h2 className="title sitemap__title">BLOG</h2>
            <div className="row">
              <div className="col-md-4 sitemap__list">
                <ul>
                  <li>
                    <A href="/blog">Sitio Principal</A>
                  </li>
                </ul>
              </div>
            </div>
          </section>
          <section className="sitemap__section container">
            <h2 className="title sitemap__title">Ford</h2>
            <div className="row">
              <div className="col-md-4 sitemap__list">
                <h3>Sobre nosotros</h3>
                <ul>
                  <li>
                    <A href="/sobre-nosotros">Sobre Nosotros</A>
                  </li>
                </ul>
              </div>
            </div>
          </section>
          <section className="sitemap__section container">
            <h2 className="title sitemap__title">ADICIONALES</h2>
            <EqualHeight className="row js-equal-height-parent" minWidth={992}>
              <div className="col-md-4 sitemap__list js-equal-height">
                <h3>
                  <A href="/calcular">Calcular Financiamiento</A>
                </h3>
              </div>
              <div className="col-md-4 sitemap__list js-equal-height">
                <h3>
                  <A href="/videos">Videos</A>
                </h3>
              </div>
              <div className="col-md-4 sitemap__list js-equal-height">
                <h3>
                  <A href="/herramientas-de-compra">Herramientas de compra</A>
                </h3>
                <ul>
                  <li>
                    <A href="/comparador">Comparación y precios</A>
                  </li>
                  <li>
                    <A href="/fichas-tecnicas-precios">Precios y fichas técnicas</A>
                  </li>
                  <li>
                    <A href="/reserva">Solicitar reserva de vehículo</A>
                  </li>
                </ul>
              </div>
              <div className="col-md-4 sitemap__list js-equal-height">
                <h3>
                  <A href="/article/terminos-condiciones" target="_blank" rel="noopener noreferrer">
                    Términos y condiciones
                  </A>
                </h3>
              </div>
              <div className="col-md-4 sitemap__list js-equal-height">
                <h3>
                  <a href="/documents/Garantía-de-vehículos.pdf" target="_blank" rel="noopener noreferrer">
                    Reglamento
                  </a>
                </h3>
              </div>
              <div className="col-md-4 sitemap__list js-equal-height">
                <h3>
                  <a href="/documents/politica-de-cookies.pdf">Cookies</a>
                </h3>
              </div>
            </EqualHeight>
          </section>
        </div>
      </div>
    </main>
  )
}
