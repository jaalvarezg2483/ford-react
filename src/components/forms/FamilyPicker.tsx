import type { FamilyCard } from '@/data/types'
import { useContent } from '@/data/content'
import { money } from '@/lib/format'
import { useTabs } from '@/hooks/useTabs'
import { A } from '@/components/ui/A'

/** Tarjetas calculate-card por familia, agrupadas por tipo (igual que el selector de accesorios). */
export function FamilyPicker({ hrefFor }: { hrefFor: (family: FamilyCard) => string }) {
  const { site } = useContent()
  const { select, tabClass, paneClass } = useTabs(0)
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
                  <div className="col-sm-6 col-md-4" key={f.slug}>
                    <A href={hrefFor(f)} className="calculate-card calculate-card-link">
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
