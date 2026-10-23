import { A } from '@/components/ui/A'
import { useContent } from '@/data/content'
import { money } from '@/lib/format'
import { useTabs } from '@/hooks/useTabs'

/** Selector de familia por pestañas (mismo calculate-card que VehiclePickerBlock / ford.cr). */
export function VehiclePicker({
  linkBase,
  columns = 3,
  hrefFor,
}: {
  linkBase: string
  columns?: 3 | 2
  hrefFor?: (slug: string) => string
}) {
  const { site } = useContent()
  const { select, tabClass, paneClass } = useTabs(0)
  const base = linkBase.endsWith('/') ? linkBase : `${linkBase}/`
  const href = (slug: string) => hrefFor?.(slug) ?? `${base}${slug}`
  const col = columns === 3 ? 'col-sm-4' : 'col-sm-6'
  return (
    <div className="menu--mock">
      <ul className="tabs tabs-gray-fc">
        {site.familyTypes.map((t, i) => (
          <li className={`tab ${tabClass(i)}`} key={t.id}>
            <button type="button" onClick={() => select(i)}>
              {t.name}
            </button>
          </li>
        ))}
      </ul>
      <ul className="collapsible tab-content">
        {site.familyTypes.map((t, i) => (
          <li className={`tab-pane fade ${paneClass(i)}`} key={t.id}>
            <div className="collapsible__body container-fluid is-open">
              <div className="row row--flex">
                {t.families.map((f) => (
                  <div className={col} key={f.slug}>
                    <A href={href(f.slug)} className="calculate-card calculate-card-link">
                      <div className="calculate-card-content">
                        {f.homeImage ? <img src={f.homeImage} alt={f.name} className="calculate-card-img" /> : null}
                        <div className="calculate-card-text">
                          <h4 className="title">{f.name}</h4>
                          {f.hidePrice || f.startPrice == null ? null : (
                            <>
                              <p>Desde</p>
                              <h4 className="title">${money(f.startPrice)}</h4>
                            </>
                          )}
                        </div>
                      </div>
                    </A>
                  </div>
                ))}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
