/** Correo al asesor: mismo contenido que Accessories/mail.html.twig, sin Twig. */

export type ContactMail = {
  firstName: string
  lastName?: string
  mobile: string
  email: string
  extra?: Record<string, string>
}

const STYLE_A = 'font-family: arial,  helvetica, sans-serif;font-size: 15px;color: #666666;'
const STYLE_B = 'font-family: arial,  helvetica, sans-serif;font-size: 12px;color: #666666;'

const EXTRA_LABELS: Record<string, string> = {
  area: 'Área',
  sucursal: 'Sucursal',
  plate: 'Placa',
  comment: 'Mensaje',
}

function esc(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function pair(title: string, value: string): string {
  if (!value) return ''
  return `<p style="${STYLE_A}">${esc(title)}</p>
                                <p style="${STYLE_B}">${esc(value)}</p>`
}

function extraRows(extra: Record<string, string> | undefined): string {
  if (!extra) return ''
  const keys = ['area', 'sucursal', 'plate', 'comment', ...Object.keys(extra).filter((k) => !['area', 'sucursal', 'plate', 'comment'].includes(k))]
  const seen = new Set<string>()
  let html = ''
  for (const key of keys) {
    if (seen.has(key)) continue
    seen.add(key)
    const value = extra[key]
    if (!value) continue
    const label = EXTRA_LABELS[key] ?? key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')
    html += pair(label, value)
  }
  return html
}

export function asesorMail(contact: ContactMail, description?: string | null): string {
  const name = [contact.firstName, contact.lastName].filter(Boolean).join(' ').trim()
  return `<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
    <head>
        <title>Purdy Accesorios - Contacto</title>
        <style>
            a:link {
                color:#046380;
                text-decoration:underline;
            }
            a:visited {
                color:#A7A37E;
                text-decoration:none;
            }
            a:hover {
                color:#002F2F;
                text-decoration:underline;
            }
            a:active {
                color:#046380;
                text-decoration:none;
            }
        </style>
    </head>
    <body>
        <table align="center" width="600" style="border: #666666 1px solid;" cellpadding="0" cellspacing="0">
            <tr>
                <td bgcolor="#efefef" style="border-bottom: #666666 1px solid;" ><br>
                    <TABLE border="0" align="center">
                        <TR>
                            <TD>
                                ${esc(description || 'Cotización Ford')}
                            </TD>
                        </TR>
                    </TABLE>
                    <br>
                </td>
            </tr>
            <tr>
                <td><TABLE width="510" border="0" cellpadding="0" cellspacing="0" align="center">
                        <TR>
                            <TD>
                                <p style="${STYLE_A}">&nbsp;</p>
                            </TD>
                        </TR>
                        <TR>
                            <TD>
                                ${pair('Nombre', name)}
                                ${pair('Teléfono', contact.mobile)}
                                ${pair('Correo', contact.email)}
                                ${extraRows(contact.extra)}
                            </TD>
                        </TR>
                        <TR>
                            <TD>
                                <p style="${STYLE_A}">&nbsp;</p>
                            </TD>
                        </TR>
                    </TABLE>
                </td>
            </tr>
        </table>
    </body>
</html>`
}
