import { useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'

export type LightboxImage = { src: string; title?: string }

const share = (base: string) => () => window.open(base + encodeURIComponent(window.location.href), '_blank', 'noopener')

/** Visor de imágenes a pantalla completa (mismas clases visuales que el visor del sitio anterior). */
export function Lightbox({ images, index, onIndex, onClose }: { images: LightboxImage[]; index: number; onIndex: (i: number) => void; onClose: () => void }) {
  const count = images.length
  const go = useCallback((delta: number) => onIndex((index + delta + count) % count), [index, count, onIndex])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowLeft') go(-1)
      else if (e.key === 'ArrowRight') go(1)
    }
    document.addEventListener('keydown', onKey)
    const overflow = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.documentElement.style.overflow = overflow
    }
  }, [go, onClose])

  const image = images[index]
  if (!image) return null

  return createPortal(
    <>
      <div className="mfp-bg mfp-fade mfp-ready" />
      <div
        className="mfp-wrap mfp-close-btn-in mfp-auto-cursor mfp-fade mfp-ready"
        tabIndex={-1}
        style={{ overflow: 'hidden auto' }}
        role="dialog"
        aria-modal="true"
        aria-label="Galería de imágenes"
        onClick={(e) => {
          if (!(e.target as HTMLElement).closest('.mfp-figure, .mfp-arrow')) onClose()
        }}
      >
        <div className="mfp-container mfp-s-ready mfp-image-holder">
          <div className="mfp-content">
            <div className="mfp-figure">
              <button type="button" title="Cerrar (Esc)" className="mfp-close" onClick={onClose}>
                ×
              </button>
              <figure>
                <img className="mfp-img" src={image.src} alt={image.title ?? ''} style={{ maxHeight: 'calc(100vh - 120px)' }} />
                <figcaption>
                  <div className="mfp-bottom-bar">
                    <div className="mfp-title">{image.title}</div>
                    <div className="mfp-message">* Imágenes con fines ilustrativos</div>
                    <div className="mfp-share">
                      <p>Compartir</p>
                      <a className="external-share" onClick={share('https://www.facebook.com/sharer/sharer.php?u=')} aria-label="Facebook">
                        <i className="mdi mdi-facebook" />
                      </a>
                      <a className="external-share" onClick={share('https://twitter.com/home?status=')} aria-label="X">
                        <i className="mdi mdi-twitter" />
                      </a>
                      <a className="external-share" onClick={share('https://wa.me/?text=')} aria-label="WhatsApp">
                        <i className="mdi mdi-whatsapp" />
                      </a>
                    </div>
                    {count > 1 && (
                      <div className="mfp-counter">
                        {index + 1} / {count}
                      </div>
                    )}
                  </div>
                </figcaption>
              </figure>
            </div>
          </div>
          {count > 1 && (
            <>
              <button type="button" title="Anterior" className="mfp-arrow mfp-arrow-left mfp-prevent-close" onClick={() => go(-1)} />
              <button type="button" title="Siguiente" className="mfp-arrow mfp-arrow-right mfp-prevent-close" onClick={() => go(1)} />
            </>
          )}
        </div>
      </div>
    </>,
    document.body,
  )
}
