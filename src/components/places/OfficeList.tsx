import { useMemo, useState } from 'react'
import { A } from '@/components/ui/A'
import { useContent } from '@/data/content'

export type Place = {
  kind: string
  lat: number
  lng: number
  id: string
  name: string
  image: string
  phone: string
  address: string
  hours: string
  testDrive: string | null
}

const norm = (v: string) => v.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

function mapsEmbed(lat: number, lng: number, key: string) {
  if (key) return `https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(key)}&q=${lat},${lng}&zoom=16`
  return `https://maps.google.com/maps?q=${lat},${lng}&z=16&output=embed`
}

/** Lista colapsable de sucursales o talleres, con filtro y mapa de la oficina abierta. */
export function OfficeList({ places, noun }: { places: Place[]; noun: string }) {
  const { site } = useContent()
  const [query, setQuery] = useState('')
  const [openId, setOpenId] = useState<string | null>(places[0]?.id ?? null)

  const filtered = useMemo(() => {
    const term = norm(query.trim())
    if (!term) return places
    return places.filter((p) => norm(`${p.name} ${p.address} ${p.phone} ${p.hours}`).includes(term))
  }, [places, query])

  const open = filtered.find((p) => p.id === openId) ?? filtered[0] ?? null
  const currentId = open?.id ?? null

  return (
    <>
      <div className="row">
        <div className="col-md-4">
          <h2 className="title">{noun}</h2>
          <form className="find-us__filter" onSubmit={(e) => e.preventDefault()}>
            <div className="find-us__search">
              <div className="input-field">
                <input type="text" id="search" className="input" placeholder={`Buscar ${noun === 'Talleres' ? 'Taller' : 'Sucursal'}`} value={query} onChange={(e) => setQuery(e.target.value)} />
              </div>
            </div>
          </form>
        </div>
      </div>
      <div className="row collapsible find-us__office" id="results">
        <div className="col-md-4">
          {filtered.map((place) => {
            const isOpen = place.id === currentId
            const prefix = place.kind === 'taller' ? 'taller' : 'sucursal'
            const target = `${prefix}-${place.id}`
            return (
              <div key={place.id}>
                <button
                  type="button"
                  className={`collapsible__header js-collapse-id items--list-js${isOpen ? ' is-open' : ''}`}
                  data-lat={place.lat}
                  data-long={place.lng}
                  data-id-target={target}
                  onClick={() => setOpenId(isOpen ? null : place.id)}
                >
                  {place.name} <strong /> <i className="icon icon-chevron-down" />
                </button>
                <div className={`collapsible__body sucursal-card${isOpen ? ' is-open' : ''}`} id={target}>
                  {place.image ? <img className="img-responsive" src={place.image} alt={place.name} /> : null}
                  <div className="collapsible__padding">
                    <div className="row">
                      {place.phone ? (
                        <div className="col-sm-6">
                          <div className="title-icon title-icon--small">
                            <div className="icon-box icon-box--secondary">
                              <i className="icon icon-phone" />
                            </div>
                            <p>{place.phone}</p>
                          </div>
                        </div>
                      ) : null}
                      {place.address ? (
                        <div className="col-sm-6">
                          <div className="title-icon title-icon--small">
                            <div className="icon-box icon-box--secondary">
                              <i className="icon icon-location" />
                            </div>
                            <p>{place.address}</p>
                          </div>
                        </div>
                      ) : null}
                      {place.hours ? (
                        <div className="col-sm-6">
                          <div className="title-icon title-icon--small">
                            <div className="icon-box icon-box--secondary">
                              <i className="icon icon-clock" />
                            </div>
                            <p>{place.hours}</p>
                          </div>
                        </div>
                      ) : null}
                    </div>
                    <div className="sucursal-card-btns">
                      <a href={`https://www.waze.com/es/livemap?zoom=15&lat=${place.lat}&lon=${place.lng}`} target="_blank" rel="noopener noreferrer" className="btn">
                        <i className="icon icon-waze" /> Waze
                      </a>
                      <a href={`http://maps.google.com/maps?q=${place.lat},${place.lng}&navigate=yes`} target="_blank" rel="noopener noreferrer" className="btn">
                        <i className="icon icon-gmaps" /> Google Maps
                      </a>
                      {place.testDrive ? (
                        <>
                          <div className="break" />
                          <A className="btn btn--primary" href={place.testDrive}>
                            <i className="icon icon-car" /> Solicitar TestDrive
                          </A>
                        </>
                      ) : null}
                    </div>
                    {isOpen ? (
                      <div className="map margin--top">
                        <iframe title={`Mapa de ${place.name}`} src={mapsEmbed(place.lat, place.lng, site.googleMapsKey)} width="100%" height="192" style={{ border: 0 }} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            )
          })}
          {!filtered.length ? <p className="margin--top">No se encontraron resultados.</p> : null}
        </div>
      </div>
    </>
  )
}
