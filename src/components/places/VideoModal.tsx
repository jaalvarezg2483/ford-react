import { useEffect } from 'react'
import { createPortal } from 'react-dom'

/** Modal de YouTube con las mismas clases magnific-popup (mfp) del visor anterior. */
export function VideoModal({ youtubeId, title, onClose }: { youtubeId: string; title: string; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const overflow = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.documentElement.style.overflow = overflow
    }
  }, [onClose])

  return createPortal(
    <>
      <div className="mfp-bg mfp-fade mfp-ready" />
      <div
        className="mfp-wrap mfp-close-btn-in mfp-auto-cursor mfp-fade mfp-ready"
        tabIndex={-1}
        style={{ overflow: 'hidden auto' }}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => {
          if (!(e.target as HTMLElement).closest('.mfp-iframe-scaler')) onClose()
        }}
      >
        <div className="mfp-container mfp-s-ready mfp-iframe-holder">
          <div className="mfp-content">
            <div className="mfp-iframe-scaler" style={{ position: 'relative' }}>
              <button type="button" title="Cerrar (Esc)" className="mfp-close" onClick={onClose}>
                ×
              </button>
              <iframe
                className="mfp-iframe"
                src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1`}
                title={title}
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body,
  )
}
