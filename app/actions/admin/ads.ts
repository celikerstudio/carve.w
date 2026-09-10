'use server'

import { requireAdmin } from '@/lib/admin/auth'
import { buildAds, type Ads } from '@/lib/admin/ads'
import { getAppMetrics } from '@/lib/admin/app-metrics'
import { fetchSource, type SourceFailure, type SourceResult } from '@/lib/admin/sources/source'
import { appstoreMissing, loadAppStore } from '@/lib/admin/sources/appstore'
import { ga4Missing, loadGa4Campaigns } from '@/lib/admin/sources/ga4'
import { loadMetaCampaigns, metaMissing } from '@/lib/admin/sources/meta'

/**
 * Alles wat de Ads-tab nodig heeft, in één aanroep.
 *
 * @ai-why: Meta en GA4 staan hier los van elkaar in het resultaat, anders dan in
 * lib/admin/overview.ts waar alles in één `failures`-lijst valt. Reden: als GA4 uitvalt
 * kloppen de kosten per campagne nog steeds, en die wil je dan gewoon zien. Zou
 * `buildAds` een lege GA4-lijst krijgen zonder dat het scherm weet dat GA4 stuk is, dan
 * kreeg elke campagne het label "geen-gegevens" en dat is een diagnose die niet klopt.
 *
 * @ai-sync: components/admin/chat/AdminAdsPane.tsx
 * @ai-sync: docs/tdr/0009-campagnerendement-komt-uit-ga4.md
 */
export interface AdsResult {
  days: number
  /** Kosten per campagne, gekoppeld aan GA4 waar dat lukte. Faalt alleen als Meta faalt. */
  ads: SourceResult<Ads>
  /** Staat hier iets, dan zijn de resultaatkolommen leeg om deze reden en niet om een andere. */
  ga4Failure: SourceFailure | null
  downloads: number | null
  accounts: number | null
  costPerDownload: number | null
  costPerAccount: number | null
  /** Bronnen die niets gaven, voor de melding onder de tabel. */
  failures: SourceFailure[]
}

function afgerond(spend: number, deler: number | null): number | null {
  if (deler === null || deler === 0) return null
  return Math.round((spend / deler) * 100) / 100
}

export async function fetchAds(days: number): Promise<AdsResult> {
  const { supabase } = await requireAdmin()

  const [campagnes, ga4, appstore, app] = await Promise.all([
    fetchSource('meta', (signal) => loadMetaCampaigns(days, signal), { missing: metaMissing() }),
    fetchSource('ga4', () => loadGa4Campaigns(days), { missing: ga4Missing() }),
    // @ai-gotcha: Ruimer budget, net als op het Overzicht. Dertig dagrapporten bij Apple
    // zijn dertig aanroepen en die halen de standaard acht seconden niet.
    fetchSource('appstore', (signal) => loadAppStore(days, signal), {
      missing: appstoreMissing(),
      timeoutMs: 20_000,
    }),
    fetchSource('supabase', () => getAppMetrics(supabase, days)),
  ])

  const ads: SourceResult<Ads> = campagnes.ok
    ? { ok: true, data: buildAds(campagnes.data, ga4.ok ? ga4.data : []) }
    : { ok: false, failure: campagnes.failure }

  const spend = ads.ok ? ads.data.totals.spend : null
  const downloads = appstore.ok ? appstore.data.downloads : null
  const accounts = app.ok ? app.data.accounts : null

  return {
    days,
    ads,
    ga4Failure: ga4.ok ? null : ga4.failure,
    downloads,
    accounts,
    // @ai-why: Deze twee staan bewust niet per campagne. Apple en Supabase kennen geen
    // herkomst; naar rato verdelen zou een aanname opleveren die eruitziet als een
    // meting. Zie TDR-0009 beslissing 5.
    costPerDownload: spend === null ? null : afgerond(spend, downloads),
    costPerAccount: spend === null ? null : afgerond(spend, accounts),
    failures: [campagnes, appstore, app].flatMap((r) => (r.ok ? [] : [r.failure])),
  }
}
