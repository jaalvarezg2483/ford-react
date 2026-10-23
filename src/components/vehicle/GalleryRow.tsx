import { useState } from 'react'
import { Carousel, IconArrows } from '@/components/ui/Carousel'
import { Lightbox } from '@/components/ui/Lightbox'

export type GalleryItem = { image: string; caption: string }

/** Fila de imágenes en carrusel (3 por vista) que abre el visor al hacer clic. */
export function GalleryRow({ items, alt, as = 'ul', className = '' }: { items: GalleryItem[]; alt: string; as?: 'ul' | 'div'; className?: string }) {
  const [open, setOpen] = useState<number | null>(null)
  const images = items.map((i) => ({ src: i.image, title: i.caption }))
  return (
    <>
      <Carousel as={as} className={`gallery-slider ${className}`.trim()} slidesToShow={3} prevArrow={IconArrows.prev} nextArrow={IconArrows.next} responsive={[{ breakpoint: 768, settings: { arrows: false, slidesToShow: 1 } }]}>
        {items.map((item, i) => {
          const Tag = as === 'ul' ? 'li' : 'div'
          return (
            <Tag className="gallery__item filtr-item" key={i}>
              <a
                href={item.image}
                className="js-popup-img img-container"
                title={item.caption}
                onClick={(e) => {
                  e.preventDefault()
                  setOpen(i)
                }}
              >
                <img src={item.image} alt={item.caption || alt} className="gallery__img" loading="lazy" />
              </a>
              <p>{item.caption}</p>
            </Tag>
          )
        })}
      </Carousel>
      {open !== null && <Lightbox images={images} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />}
    </>
  )
}
