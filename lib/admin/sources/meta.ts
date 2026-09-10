/**
 * Meta Marketing API: wat de advertenties kosten en opleveren.
 *
 * @ai-why: Alleen het advertentieaccount, niet de pixel-events. De pixel meet
 * `AppStoreClick` en dat cijfer heb je al beter uit GA4, waar hetzelfde event met een
 * `source` per knop binnenkomt. Twee metingen van dezelfde klik naast elkaar zetten
 * levert alleen een verschil op dat je niet kunt verklaren.
 *
 * @ai-sync: lib/meta-pixel.ts
 * @ai-sync: docs/tdr/0006-admin-is-de-cockpit.md
 * @ai-sync: docs/tdr/0009-campagnerendement-komt-uit-ga4.md
 */

import { missingEnv } from './source'
import type { MetaCampaign } from '../ads'

export const META_ENV = ['META_ACCESS_TOKEN', 'META_AD_ACCOUNT_ID'] as const

// @ai-gotcha: Vastgezette API-versie. Meta zet oude versies na ongeveer twee jaar uit;
// een niet-vastgezette aanroep verandert stilletjes van gedrag bij hun volgende release.
const API_VERSION = 'v21.0'

export interface MetaData {
  /** Uitgaven in euro over het venster. */
  spend: number
  clicks: number
  impressions: number
}

export function metaMissing(): string[] {
  return missingEnv(process.env, [...META_ENV])
}

// @ai-gotcha: Het account-ID hoort met `act_` ervoor. Mensen plakken het nummer zonder
// prefix uit de Ads Manager-URL, dus we zetten hem hier neer als hij ontbreekt.
function accountId(): string {
  const rauw = process.env.META_AD_ACCOUNT_ID!.trim()
  return rauw.startsWith('act_') ? rauw : `act_${rauw}`
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

export async function loadMeta(days: number, now: Date = new Date()): Promise<MetaData> {
  const until = isoDate(now)
  const since = isoDate(new Date(now.getTime() - days * 24 * 60 * 60 * 1000))

  const url = new URL(`https://graph.facebook.com/${API_VERSION}/${accountId()}/insights`)
  url.searchParams.set('fields', 'spend,clicks,impressions')
  url.searchParams.set('time_range', JSON.stringify({ since, until }))
  url.searchParams.set('access_token', process.env.META_ACCESS_TOKEN!)

  const res = await fetch(url, { cache: 'no-store' })

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: { message?: string } } | null
    throw new Error(body?.error?.message ?? `Meta gaf ${res.status}.`)
  }

  const json = (await res.json()) as {
    data?: { spend?: string; clicks?: string; impressions?: string }[]
  }

  // @ai-gotcha: Geen advertenties in het venster betekent een lege `data`-array, geen
  // rij met nullen. Dat is geen fout; het is een account dat even stilligt.
  const rij = json.data?.[0]

  return {
    spend: Number(rij?.spend ?? 0),
    clicks: Number(rij?.clicks ?? 0),
    impressions: Number(rij?.impressions ?? 0),
  }
}

/**
 * @ai-why: Eén plek voor de URL, de fout en het lezen van het antwoord. De campagne- en
 * advertentie-aanroepen hieronder falen op precies dezelfde manier als `loadMeta`, en
 * die drie los uitschrijven levert drie kansen om de foutmelding te laten verwateren.
 */
async function metaGet<T>(
  pad: string,
  params: Record<string, string>,
  signal?: AbortSignal,
): Promise<T> {
  const url = new URL(`https://graph.facebook.com/${API_VERSION}/${pad}`)
  for (const [sleutel, waarde] of Object.entries(params)) url.searchParams.set(sleutel, waarde)
  url.searchParams.set('access_token', process.env.META_ACCESS_TOKEN!)

  const res = await fetch(url, { cache: 'no-store', signal })

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: { message?: string } } | null
    throw new Error(body?.error?.message ?? `Meta gaf ${res.status}.`)
  }

  return (await res.json()) as T
}

/**
 * @ai-gotcha: Meta pagineert álles, ook een lijst van drie campagnes. Zonder deze lus
 * mist de tabel stilletjes de campagnes voorbij de eerste pagina, en dat merk je pas als
 * de uitgaven op het Overzicht niet meer optellen tot wat hier staat. De limiet van vijf
 * pagina's is een noodrem tegen een cursor die naar zichzelf blijft wijzen.
 */
const MAX_PAGINAS = 5

async function metaGetAll<T>(
  pad: string,
  params: Record<string, string>,
  signal?: AbortSignal,
): Promise<T[]> {
  let json = await metaGet<{ data?: T[]; paging?: { next?: string } }>(pad, params, signal)
  const alles = [...(json.data ?? [])]

  for (let i = 1; i < MAX_PAGINAS && json.paging?.next; i++) {
    const res = await fetch(json.paging.next, { cache: 'no-store', signal })
    if (!res.ok) break
    json = (await res.json()) as { data?: T[]; paging?: { next?: string } }
    alles.push(...(json.data ?? []))
  }

  return alles
}

interface CampaignRow {
  campaign_id?: string
  campaign_name?: string
  spend?: string
  clicks?: string
  impressions?: string
}

export function parseCampaigns(json: { data?: CampaignRow[] }): Omit<MetaCampaign, 'tagged'>[] {
  return (json.data ?? []).map((rij) => ({
    id: String(rij.campaign_id ?? ''),
    name: rij.campaign_name ?? '',
    spend: Number(rij.spend ?? 0),
    clicks: Number(rij.clicks ?? 0),
    impressions: Number(rij.impressions ?? 0),
  }))
}

interface AdRow {
  campaign_id?: string
  creative?: { url_tags?: string }
}

/**
 * Welke campagnes hun advertenties met `utm_id` laten vertrekken.
 *
 * @ai-why: Zonder deze controle is een campagne zonder GA4-rijen niet te onderscheiden
 * van een campagne die geen verkeer kreeg. Beide tonen een streepje, en dan ga je in de
 * verkeerde hoek zoeken. Zie TDR-0009 beslissing 8.
 *
 * @ai-gotcha: Alleen `url_tags` wordt gelezen, niet de query-string die iemand met de
 * hand achter de link in de creative plakt. Die tweede plek werkt wel in de praktijk,
 * maar staat per creative-variant ergens anders in het object; `url_tags` is de plek
 * waar de afspraak uit TDR-0009 hoort te staan en de enige die betrouwbaar te lezen is.
 */
export function taggedCampaignIds(json: { data?: AdRow[] }): Set<string> {
  const ids = new Set<string>()
  for (const advertentie of json.data ?? []) {
    const tags = advertentie.creative?.url_tags
    if (advertentie.campaign_id && tags && tags.includes('utm_id=')) {
      ids.add(String(advertentie.campaign_id))
    }
  }
  return ids
}

/**
 * Campagnes met hun kosten, plus of ze getagd zijn.
 *
 * @ai-gotcha: Twee aanroepen en geen één. De insights-edge kent `url_tags` niet, want
 * dat is een veld van de creative en geen cijfer. Ze gaan parallel; de traagste bepaalt
 * of `fetchSource` zijn timeout haalt.
 */
export async function loadMetaCampaigns(
  days: number,
  signal?: AbortSignal,
  now: Date = new Date(),
): Promise<MetaCampaign[]> {
  const until = isoDate(now)
  const since = isoDate(new Date(now.getTime() - days * 24 * 60 * 60 * 1000))
  const account = accountId()

  const [rijen, advertenties] = await Promise.all([
    metaGetAll<CampaignRow>(
      `${account}/insights`,
      {
        level: 'campaign',
        fields: 'campaign_id,campaign_name,spend,clicks,impressions',
        time_range: JSON.stringify({ since, until }),
        limit: '200',
      },
      signal,
    ),
    metaGetAll<AdRow>(
      `${account}/ads`,
      { fields: 'campaign_id,creative{url_tags}', limit: '200' },
      signal,
    ),
  ])

  const getagd = taggedCampaignIds({ data: advertenties })

  return parseCampaigns({ data: rijen }).map((campagne) => ({
    ...campagne,
    tagged: getagd.has(campagne.id),
  }))
}
