import { Navigate, useParams } from 'react-router-dom'
import { useFamily } from '@/data/content'
import { A } from '@/components/ui/A'
import { VehicleHero } from '@/components/vehicle/VehicleHero'
import { GalleryRow } from '@/components/vehicle/GalleryRow'

/** Galería completa del vehículo, por secciones (Exterior, Interior…), con visor ampliado. */
export function VehicleGallery() {
  const { slug } = useParams()
  const family = useFamily(slug)
  if (!family) return <Navigate to="/404" replace />
  const base = `/autos/${family.slug}`
  return (
    <main id="main-content" tabIndex={-1}>
      <div className="wrapper--car wrapper-car-gallery">
        <VehicleHero family={family} current="galeria" />
        <section>
          <div className="car-profile-description container">
            <div className="car-profile-text">
              <h1 className="title">
                <span>Ford</span> {family.name}
              </h1>
              <h3 className="title">Galería</h3>
            </div>
            <div className="car-profile-text">
              {family.tagline ? <p className="text">{family.tagline}</p> : null}
              {family.showCalculate ? (
                <A href={`${base}/modelos`} className="btn btn--primary">
                  <i className="icon icon-calculator" /> Calcular Financiamiento
                </A>
              ) : null}{' '}
              <A href={`/test-drive/${family.slug}`} className="btn">
                <i className="icon icon-car-alt" /> Solicitar Test Drive
              </A>
            </div>
          </div>
        </section>
        <div className="container">
          {family.gallery
            .filter((section) => section.items.length > 0)
            .map((section) => (
              <div key={section.title}>
                <h2 className="title">{section.title}</h2>
                <GalleryRow items={section.items} alt={`galería ${family.name}`} className="margin--bottom" />
              </div>
            ))}
        </div>
      </div>
    </main>
  )
}
