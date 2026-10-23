import type { Site } from '@/data/types'

/** Botón flotante de WhatsApp (antes HTML pegado al final de cada página). */
export function WhatsAppButton({ whatsapp }: Pick<Site, 'whatsapp'>) {
  if (!whatsapp) return null
  const href = `https://api.whatsapp.com/send?phone=${encodeURIComponent(whatsapp.phone)}&text=${encodeURIComponent(whatsapp.message)}`
  return (
    <div className="car--buying__tools tools--open whatsapp-background small-square">
      <ul className="icons--list shorter">
        <li>
          <a target="_blank" rel="noopener" href={href}>
            <span>{whatsapp.label} </span> <i className="icon icon-whatsapp whatsapp-background big-icon" />
          </a>
        </li>
      </ul>
    </div>
  )
}
