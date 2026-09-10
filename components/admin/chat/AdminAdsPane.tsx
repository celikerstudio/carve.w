'use client'

import { useEffect, useState } from 'react'
import { fetchAds, type AdsResult } from '@/app/actions/admin/ads'
import type { AdCampaignRow } from '@/lib/admin/ads'
import { SourceNote } from '@/components/admin/source-note'
import { StatsCard } from '@/components/admin/stats-card'

const PERIODES = [7, 30] as const

/**
 * De `url_tags` die elke advertentie hoort te dragen.
 *
 * @ai-why: Letterlijk op het scherm, zodat je 'm kunt kopiëren naar Ads Manager. De
 * volgorde doet er niet toe, `utm_id` wel: dat is de sleutel waarop deze tabel koppelt.
 * @ai-sync: docs/tdr/0009-campagnerendement-komt-uit-ga4.md
 */
const URL_TAGS =
  'utm_source=facebook&utm_medium=paid&utm_id={{campaign.id}}&utm_campaign={{campaign.name}}'

function getal(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—'
  return new Intl.NumberFormat('nl-NL').format(value)
}

function euro(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—'
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(value)
}

function procent(value: number | null): string {
  return value === null ? '—' : `${new Intl.NumberFormat('nl-NL').format(value)}%`
}

const LABEL: Record<AdCampaignRow['attribution'], { tekst: string; uitleg: string } | null> = {
  gemeten: null,
  'geen-utm': {
    tekst: 'geen UTM',
    uitleg: 'De advertenties van deze campagne sturen geen utm_id mee, dus GA4 kan het verkeer niet aan de campagne koppelen.',
  },
  'geen-gegevens': {
    tekst: 'geen gegevens',
    uitleg: 'De tag staat er wel, maar GA4 gaf geen rij terug. Dat kan betekenen dat er niemand kwam, of dat het er te weinig waren om te rapporteren.',
  },
}

function Badge({ attribution }: { attribution: AdCampaignRow['attribution'] }) {
  const label = LABEL[attribution]
  if (!label) return null

  return (
    <span
      title={label.uitleg}
      className="ml-2 shrink-0 rounded border border-[#FF9500]/30 bg-[#FF9500]/10 px-1.5 py-0.5 text-[10.5px] text-[#FF9500]"
    >
      {label.tekst}
    </span>
  )
}

/**
 * Wat elke campagne kostte en wat eruit kwam.
 *
 * @ai-why: Een eigen sectie en geen kaart op het Overzicht. Advertenties zijn het enige
 * scherm waar je een bedrag per campagne tegen een resultaat afzet, en dat past niet in
 * één kaart naast de app-cijfers. Zie docs/tdr/0009-campagnerendement-komt-uit-ga4.md.
 *
 * @ai-gotcha: De kolom Bezoekers telt niet op tot het bezoekerstotaal op het Overzicht.
 * Het is een telling van gebruikers tegen een dimensie die per sessie geldt, dus wie via
 * twee campagnes binnenkwam staat in beide rijen. Het scherm zegt dat er onderaan bij.
 *
 * @ai-sync: app/actions/admin/ads.ts
 * @ai-sync: components/chat/ChatLayout.tsx
 */
export function AdminAdsPane() {
  const [days, setDays] = useState<(typeof PERIODES)[number]>(7)
  const [result, setResult] = useState<AdsResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let afgebroken = false
    setLoading(true)
    setError(null)

    fetchAds(days)
      .then((d) => !afgebroken && setResult(d))
      .catch((e: unknown) => !afgebroken && setError(e instanceof Error ? e.message : String(e)))
      .finally(() => !afgebroken && setLoading(false))

    // @ai-why: Dezelfde vlag als op het Overzicht: een traag antwoord van de vorige
    // periode mag het verse antwoord niet overschrijven.
    return () => {
      afgebroken = true
    }
  }, [days])

  const ads = result?.ads.ok ? result.ads.data : null
  const totalen = ads?.totals

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-5xl space-y-5 p-6 lg:p-8">
        <header className="flex flex-wrap items-end justify-between gap-4 border-b border-white/[0.06] pb-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white">Ads</h1>
            <p className="mt-1 text-[13px] text-white/45">
              Kosten per campagne uit Meta, resultaat per campagne uit GA4. Downloads en
              accounts blijven een totaal: die kennen geen herkomst.
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

        {loading && !result && (
          <p className="py-10 text-center text-[13px] text-white/40">Bezig met ophalen…</p>
        )}

        {error && (
          <div className="rounded-xl border border-[#FF3B30]/30 bg-[#FF3B30]/[0.07] p-5">
            <p className="text-[13px] text-[#FF3B30]">{error}</p>
          </div>
        )}

        {result && (
          <div className={loading ? 'space-y-5 opacity-50 transition-opacity' : 'space-y-5 transition-opacity'}>
            {result.ads.ok ? (
              <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <StatsCard
                  title={`Uitgaven, ${days} dagen`}
                  value={euro(totalen?.spend ?? 0)}
                  icon="Zap"
                  description={`${getal(ads?.rows.length ?? 0)} campagnes`}
                  index={0}
                />
                <StatsCard
                  title="Klikken"
                  value={getal(totalen?.clicks ?? 0)}
                  icon="Activity"
                  description={`CTR ${procent(totalen?.ctr ?? null)} · CPC ${euro(totalen?.cpc ?? null)}`}
                  index={1}
                />
                <StatsCard
                  title="Per App Store-klik"
                  value={euro(totalen?.costPerAppStoreClick ?? null)}
                  icon="BookOpen"
                  description={
                    totalen && totalen.untaggedSpend > 0
                      ? `Alleen over ${euro(totalen.measuredSpend)} gemeten uitgaven`
                      : `${getal(totalen?.measuredAppStoreClicks ?? 0)} klikken naar de App Store`
                  }
                  index={2}
                />
                <StatsCard
                  title="Per account"
                  value={euro(result.costPerAccount)}
                  icon="Users"
                  description={`Per download ${euro(result.costPerDownload)}`}
                  index={3}
                />
              </section>
            ) : (
              <SourceNote failure={result.ads.failure} title="Campagnes" />
            )}

            {result.ga4Failure && (
              <SourceNote failure={result.ga4Failure} title="Resultaat per campagne" />
            )}

            {totalen && totalen.untaggedSpend > 0 && (
              <div className="rounded-xl border border-[#FF9500]/25 bg-[#FF9500]/[0.06] p-4">
                <p className="text-[13px] text-[#FF9500]">
                  {euro(totalen.untaggedSpend)} ging naar campagnes zonder{' '}
                  <code className="font-mono text-[12px]">utm_id</code>. Die tellen niet mee in de
                  kosten per App Store-klik, want hun resultaat is nergens te zien.
                </p>
              </div>
            )}

            {ads && ads.rows.length > 0 && (
              <section className="rounded-xl border border-white/[0.06] bg-white/[0.02]">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px] text-[12.5px]">
                    <thead>
                      <tr className="border-b border-white/[0.06] text-left text-[11px] uppercase tracking-[0.08em] text-white/35">
                        <th className="px-4 py-3 font-medium">Campagne</th>
                        <th className="px-4 py-3 text-right font-medium">Uitgaven</th>
                        <th className="px-4 py-3 text-right font-medium">Vertoningen</th>
                        <th className="px-4 py-3 text-right font-medium">Klikken</th>
                        <th className="px-4 py-3 text-right font-medium">CTR</th>
                        <th className="px-4 py-3 text-right font-medium">CPC</th>
                        <th className="px-4 py-3 text-right font-medium">Bezoekers</th>
                        <th className="px-4 py-3 text-right font-medium">App Store</th>
                        <th className="px-4 py-3 text-right font-medium">Per klik</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ads.rows.map((rij) => (
                        <tr key={rij.id} className="border-b border-white/[0.04] last:border-0">
                          <td className="px-4 py-3">
                            <div className="flex items-center">
                              <span className="truncate text-white/85">{rij.name}</span>
                              <Badge attribution={rij.attribution} />
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right tabular-nums text-white/80">
                            {euro(rij.spend)}
                          </td>
                          <td className="px-4 py-3 text-right tabular-nums text-white/55">
                            {getal(rij.impressions)}
                          </td>
                          <td className="px-4 py-3 text-right tabular-nums text-white/55">
                            {getal(rij.clicks)}
                          </td>
                          <td className="px-4 py-3 text-right tabular-nums text-white/55">
                            {procent(rij.ctr)}
                          </td>
                          <td className="px-4 py-3 text-right tabular-nums text-white/55">
                            {euro(rij.cpc)}
                          </td>
                          <td className="px-4 py-3 text-right tabular-nums text-white/55">
                            {getal(rij.visitors)}
                          </td>
                          <td className="px-4 py-3 text-right tabular-nums text-white/55">
                            {getal(rij.appStoreClicks)}
                          </td>
                          <td className="px-4 py-3 text-right tabular-nums text-white/80">
                            {euro(rij.costPerAppStoreClick)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {result.ads.ok && ads?.rows.length === 0 && (
              <section className="rounded-xl border border-dashed border-white/[0.08] bg-white/[0.01] p-6">
                <h2 className="text-[15px] font-medium text-white/70">
                  Geen campagnes in deze periode
                </h2>
                <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-white/40">
                  Zodra je er een start: zet deze regel bij elke advertentie in Ads Manager onder
                  Tracking → URL-parameters. Meta vult de accolades zelf in. Zonder{' '}
                  <code className="font-mono text-[12px] text-white/60">utm_id</code> blijft de
                  campagne hier zichtbaar, maar zonder resultaatcijfers, en achteraf is dat niet
                  meer te herstellen.
                </p>
                <pre className="mt-3 overflow-x-auto rounded-lg border border-white/[0.06] bg-black/30 px-4 py-3 font-mono text-[11.5px] text-white/70">
                  {URL_TAGS}
                </pre>
              </section>
            )}

            {result.failures.length > 0 && (
              <div className="space-y-3">
                {result.failures
                  .filter((f) => f.source !== 'meta')
                  .map((failure) => (
                    <SourceNote key={failure.source} failure={failure} />
                  ))}
              </div>
            )}

            <p className="text-[11.5px] leading-relaxed text-white/30">
              Klikken komen van Meta, bezoekers van GA4. Die twee horen niet gelijk te zijn: een
              deel van de klikkers haakt af voor de pagina laadt, een deel blokkeert GA4 en een
              deel weigert de cookiebanner. Bezoekers telt bovendien per campagne en niet per
              persoon, dus de kolom telt niet op tot het bezoekerstotaal op het Overzicht.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
