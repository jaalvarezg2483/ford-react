import { useState } from 'react'
import { createPortal } from 'react-dom'
import { money } from '@/lib/format'
import { accessoryImage, type Accessory } from '@/data/accessories'

type Props = {
  items: Accessory[]
  selected: number[]
  onToggle: (id: number) => void
  emptyText: string
  detailLabel?: string
}

/** Cards .card-accesories con checkbox y modal de detalle (marcado del sitio original). */
export function AccessoryCards({ items, selected, onToggle, emptyText, detailLabel = 'Ver detalle' }: Props) {
  const [detail, setDetail] = useState<Accessory | null>(null)
  if (!items.length) {
    return (
      <div className="col-xs-12">
        <div className="card-stacked">
          <div className="card-content">
            <span>{emptyText}</span>
          </div>
        </div>
      </div>
    )
  }
  return (
    <>
      {items.map((item) => {
        const checked = selected.includes(item.id)
        const img = accessoryImage(item)
        return (
          <section className="col-md-6" key={item.id}>
            <div className={`card-accesories card-filter${checked ? ' ele-checked' : ''}`}>
              {img ? (
                <div className="card-accesories-img">
                  <img src={img} alt={item.name} />
                </div>
              ) : null}
              <div className="card-accesories-content">
                <div>
                  <p className="js-name accessory-name">{item.name}</p>
                  <p className="text--bold">${money(item.price)}</p>
                  {item.description ? (
                    <button type="button" className="text--primary btn-modal-acc" onClick={() => setDetail(item)}>
                      {detailLabel}
                    </button>
                  ) : null}
                </div>
                <div className="add-accesory">
                  <input
                    value={item.id}
                    type="checkbox"
                    className="checkbox control-resume"
                    id={`accesory${item.id}`}
                    checked={checked}
                    onChange={() => onToggle(item.id)}
                  />
                  <label htmlFor={`accesory${item.id}`} />
                </div>
              </div>
            </div>
          </section>
        )
      })}
      {detail
        ? createPortal(
            <div className="modal fade in show" role="dialog" aria-modal="true" aria-label={detail.name} style={{ display: 'block' }} onClick={(e) => e.target === e.currentTarget && setDetail(null)}>
              <div className="modal-dialog" role="document">
                <div className="content-accesories-car content-cards-car">
                  <div className="card-accesories-modal">
                    <button type="button" className="modal__close" onClick={() => setDetail(null)} aria-label="Cerrar">
                      <i className="mdi mdi-close" />
                    </button>
                    {accessoryImage(detail) ? (
                      <div className="card-accesories-img">
                        <img src={accessoryImage(detail)} alt={detail.name} />
                      </div>
                    ) : null}
                    <div className="modal-accesories-content">
                      <p>
                        <strong>{detail.name}</strong>
                      </p>
                      <h3 className="text--bold text--primary">${money(detail.price)}</h3>
                      <p className="modal-accesories-description">{detail.description}</p>
                      <div className="add-accesory">
                        <button type="button" className="btn btn--transparent" onClick={() => setDetail(null)}>
                          Volver
                        </button>
                        <button
                          type="button"
                          className="btn btn--check"
                          onClick={() => {
                            if (!selected.includes(detail.id)) onToggle(detail.id)
                            setDetail(null)
                          }}
                        >
                          <i className="mdi mdi-plus" /> Agregar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  )
}
