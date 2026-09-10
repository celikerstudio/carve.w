'use client'

import { useEffect, useState } from 'react'
import { fetchOverview } from '@/app/actions/admin/overview'
import type { Overview } from '@/lib/admin/overview'
import { Funnel } from '@/components/admin/funnel'
import { SourceNote } from '@/components/admin/source-note'
import { StatsCard } from '@/components/admin/stats-card'

const PERIODES = [7, 30] as const

function getal(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—'
  return new Intl.NumberFormat('nl-NL').format(value)
}

function euro(value: number | null): string {
  if (value === null) return '—'
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(value)
}

/**
 * Het overzicht binnen het chatvenster.
 *
 * @ai-why: Client component met een server action. De chat houdt zijn modus in
 * React-state en navigeert niet, dus er is geen server render om op mee te liften.
 *
 * @ai-gotcha: Bij elke wisseling van periode wordt opnieuw opgehaald, en dat gaat langs
 * vier externe bronnen. Vandaar de expliciete laadstaat: zonder die staat lijkt het
 * scherm bevroren terwijl Apple dertig dagrapporten uitlevert.
 *
 * @ai-sync: app/actions/admin/overview.ts
 */
export function AdminOverviewPane() {
  const [days, setDays] = useState<(typeof PERIODES)[number]>(7)
  const [overview, setOverview] = useState<Overview | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let afgebroken = false
    setLoading(true)
    setError(null)

    fetchOverview(days)
      .then((data) => {
        if (!afgebroken) setOverview(data)
      })
      .catch((e: unknown) => {
        if (!afgebroken) setError(e instanceof Error ? e.message : String(e))
      })
      .finally(() => {
        if (!afgebroken) setLoading(false)
      })

    // @ai-why: De vlag voorkomt dat een traag antwoord van de vorige periode het
    // verse antwoord overschrijft. Wissel je snel tussen 7 en 30 dagen, dan komt
    // Apple's trage aanroep anders ná de nieuwe binnen.
    return () => {
      afgebroken = true
    }
  }, [days])

  const app = overview?.app.ok ? overview.app.data : null
  const vorige = overview?.appPrevious.ok ? overview.appPrevious.data : null
  const store = overview?.appstore.ok ? overview.appstore.data : null

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-5xl space-y-5 p-6 lg:p-8">
        <header className="flex flex-wrap items-end justify-between gap-4 border-b border-white/[0.06] pb-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white">Overzicht</h1>
            <p className="mt-1 text-[13px] text-white/45">
              Van bezoeker tot eerste log, over GA4, App Store Connect, Meta en Supabase.
              {app ? ` ${app.testAccounts} testaccounts tellen niet mee.` : ''}
            </p>
          </div>

          <div className="flex rounded-lg border border-white/[0.06] bg-white/[0.02] p-0.5">
            {PERIODES.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setDays(p)}
                className={`rounded-md px-3 py-1 text-[12.5px] transition-colors ${
                  p === days ? 'bg-white/[0.07] text-white' : 'text-white/40 hover:text-white/70'
                }`}
              >
                {p} dagen
              </button>
            ))}
          </div>
        </header>

        {loading && !overview && (
          <p className="py-10 text-center text-[13px] text-white/40">
            Bezig met ophalen bij vier bronnen…
          </p>
        )}

        {error && (
          <div className="rounded-xl border border-[#FF3B30]/30 bg-[#FF3B30]/[0.07] p-5">
            <p className="text-[13px] text-[#FF3B30]">{error}</p>
          </div>
        )}

        {overview && (
          <div className={loading ? 'opacity-50 transition-opacity' : 'transition-opacity'}>
            <div className="space-y-5">
              <Funnel steps={overview.funnel} failures={overview.failures} />

              {/* @ai-why: Alleen het bedrag, geen kosten per download meer. Dat cijfer staat
                  nu op de Ads-tab, naast de campagnes die het verklaren; hier was het een
                  getal zonder context. Zie docs/tdr/0009-campagnerendement-komt-uit-ga4.md.
                  @ai-sync: components/admin/chat/AdminAdsPane.tsx */}
              <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {overview.meta.ok ? (
                  <StatsCard
                    title={`Advertentie-uitgaven, ${days} dagen`}
                    value={euro(overview.meta.data.spend)}
                    icon="Zap"
                    description={`${getal(overview.meta.data.clicks)} klikken · per campagne op Ads`}
                    index={0}
                  />
                ) : (
                  <SourceNote failure={overview.meta.failure} title="Advertentie-uitgaven" />
                )}

                {overview.appstore.ok ? (
                  <StatsCard
                    title="App Store"
                    value={store?.averageRating === null ? '—' : `${store?.averageRating} ★`}
                    icon="BookOpen"
                    description={`${getal(store?.ratingCount)} beoordelingen · ${getal(store?.unanswered)} zonder antwoord`}
                    index={1}
                  />
                ) : (
                  <SourceNote failure={overview.appstore.failure} title="App Store" />
                )}
              </section>

              <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <StatsCard
                  title="Echte accounts"
                  value={getal(app?.totalRealAccounts)}
                  icon="Users"
                  description={`${getal(app?.testAccounts)} testaccounts uitgesloten`}
                  index={0}
                />
                <StatsCard
                  title="Actief"
                  value={getal(app?.activeUsers)}
                  previousValue={vorige?.activeUsers}
                  icon="Activity"
                  description={`Laatste ${days} dagen`}
                  index={1}
                />
                <StatsCard
                  title="Maaltijden gelogd"
                  value={getal(app?.meals)}
                  previousValue={vorige?.meals}
                  icon="UtensilsCrossed"
                  description={`Laatste ${days} dagen`}
                  index={2}
                />
                <StatsCard
                  title="Workouts"
                  value={getal(app?.workouts)}
                  previousValue={vorige?.workouts}
                  icon="Dumbbell"
                  description={`Laatste ${days} dagen`}
                  index={3}
                />
              </section>


              <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {overview.subscriptions.ok ? (
                  <StatsCard
                    title="Betalend"
                    value={getal(overview.subscriptions.data.betalend)}
                    icon="Zap"
                    description={`${getal(overview.subscriptions.data.proef)} in proef · ${getal(overview.subscriptions.data.opzeggend)} opzeggend`}
                    index={0}
                  />
                ) : (
                  <SourceNote failure={overview.subscriptions.failure} title="Abonnementen" />
                )}

                {overview.ai.ok ? (
                  <StatsCard
                    title={`AI-kosten, ${days} dagen`}
                    value={euro(overview.ai.data.total)}
                    previousValue={overview.aiPrevious.ok ? overview.aiPrevious.data.total : undefined}
                    icon="Activity"
                    description={`${getal(overview.ai.data.calls)} aanroepen`}
                    index={1}
                  />
                ) : (
                  <SourceNote failure={overview.ai.failure} title="AI-kosten" />
                )}

                {overview.ai.ok && overview.ai.data.byModel.length > 0 ? (
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
                    <h3 className="text-[12.5px] font-medium text-white/45">Kosten per model</h3>
                    <ul className="mt-3 space-y-1.5">
                      {overview.ai.data.byModel.slice(0, 4).map((m) => (
                        <li key={m.model} className="flex items-baseline justify-between gap-3">
                          <span className="truncate font-mono text-[11.5px] text-white/55">
                            {m.model}
                          </span>
                          <span className="shrink-0 text-[12.5px] tabular-nums text-white/80">
                            {euro(m.cost)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-white/[0.08] bg-white/[0.01] p-5">
                    <p className="text-[12.5px] text-white/30">
                      Geen AI-verbruik in deze periode.
                    </p>
                  </div>
                )}
              </section>

              {!overview.app.ok && (
                <SourceNote
                  failure={overview.app.failure}
                  title="Cijfers uit de eigen database"
                />
              )}

              {store && store.reviews.length > 0 && (
                <section className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
                  <h2 className="text-[15px] font-semibold text-white">Laatste reviews</h2>
                  <ul className="mt-3 space-y-3">
                    {store.reviews.slice(0, 5).map((review) => (
                      <li
                        key={review.id}
                        className="border-b border-white/[0.06] pb-3 last:border-0 last:pb-0"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-[#D4A843]">{'★'.repeat(review.rating)}</span>
                          <span className="text-[13px] font-medium text-white">{review.title}</span>
                          {!review.answered && (
                            <span className="rounded border border-[#FF9500]/30 bg-[#FF9500]/10 px-1.5 py-0.5 text-[10.5px] text-[#FF9500]">
                              geen antwoord
                            </span>
                          )}
                        </div>
                        <p className="mt-1 line-clamp-2 text-[12.5px] text-white/45">{review.body}</p>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

            </div>
          </div>
        )}
      </div>
    </div>
  )
}
