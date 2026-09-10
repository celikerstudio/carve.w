/**
 * GA4: bezoekers en de doorklik naar de App Store.
 *
 * @ai-why: De REST-kant van de Data API met een zelf ondertekende service-account-JWT,
 * niet `@google-analytics/data`. Die SDK trekt gRPC en protobuf mee voor twee
 * rapportaanroepen. Zie lib/admin/sources/jwt.ts voor het ondertekenen.
 *
 * @ai-sync: lib/analytics.ts — de eventnaam `app_store_click` staat aan beide kanten
 * @ai-sync: docs/tdr/0006-admin-is-de-cockpit.md
 * @ai-sync: docs/tdr/0009-campagnerendement-komt-uit-ga4.md
 */

import { signRS256 } from './jwt'
import { missingEnv } from './source'
import type { Ga4Campaign } from '../ads'

export const GA4_ENV = ['GA4_PROPERTY_ID', 'GA4_CLIENT_EMAIL', 'GA4_PRIVATE_KEY'] as const

/** De naam die `track('app_store_click')` in GA4 wegschrijft. */
const APP_STORE_EVENT = 'app_store_click'

export interface Ga4Data {
  visitors: number
  appStoreClicks: number
}

export function ga4Missing(): string[] {
  return missingEnv(process.env, [...GA4_ENV])
}

async function accessToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  const assertion = signRS256(
    { alg: 'RS256', typ: 'JWT' },
    {
      iss: process.env.GA4_CLIENT_EMAIL,
      scope: 'https://www.googleapis.com/auth/analytics.readonly',
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600,
    },
    process.env.GA4_PRIVATE_KEY!,
  )

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  })

  if (!res.ok) {
    // @ai-why: De fouttekst van Google meenemen. "invalid_grant" betekent bijna altijd
    // dat de service-account geen leesrechten op de property heeft, en dat wil je op het
    // scherm zien in plaats van een kale 400.
    throw new Error(`Google gaf geen token (${res.status}): ${await res.text()}`)
  }

  const json = (await res.json()) as { access_token?: string }
  if (!json.access_token) throw new Error('Google gaf een antwoord zonder access_token.')
  return json.access_token
}

async function runReport(token: string, body: unknown): Promise<number> {
  const res = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${process.env.GA4_PROPERTY_ID}:runReport`,
    {
      method: 'POST',
      headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store',
    },
  )

  if (!res.ok) throw new Error(`GA4 gaf ${res.status}: ${await res.text()}`)

  const json = (await res.json()) as { rows?: { metricValues?: { value?: string }[] }[] }
  // @ai-gotcha: Zonder dimensies geeft GA4 één rij terug, en géén rij als er nul verkeer
  // was. Dat laatste is geen fout maar een nul.
  const waarde = json.rows?.[0]?.metricValues?.[0]?.value
  return waarde ? Number(waarde) : 0
}

export async function loadGa4(days: number): Promise<Ga4Data> {
  const token = await accessToken()
  const dateRanges = [{ startDate: `${days}daysAgo`, endDate: 'today' }]

  const [visitors, appStoreClicks] = await Promise.all([
    runReport(token, { dateRanges, metrics: [{ name: 'activeUsers' }] }),
    runReport(token, {
      dateRanges,
      metrics: [{ name: 'eventCount' }],
      dimensionFilter: {
        filter: {
          fieldName: 'eventName',
          stringFilter: { matchType: 'EXACT', value: APP_STORE_EVENT },
        },
      },
    }),
  ])

  return { visitors, appStoreClicks }
}

/** De vorm van een `runReport`-antwoord, voor zover wij hem lezen. */
interface Rapport {
  rows?: { dimensionValues?: { value?: string }[]; metricValues?: { value?: string }[] }[]
}

async function runReportRows(token: string, body: unknown): Promise<Rapport> {
  const res = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${process.env.GA4_PROPERTY_ID}:runReport`,
    {
      method: 'POST',
      headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store',
    },
  )

  if (!res.ok) throw new Error(`GA4 gaf ${res.status}: ${await res.text()}`)
  return (await res.json()) as Rapport
}

function perCampagne(rapport: Rapport): Map<string, number> {
  const uit = new Map<string, number>()
  for (const rij of rapport.rows ?? []) {
    const id = rij.dimensionValues?.[0]?.value
    if (!id) continue
    uit.set(id, Number(rij.metricValues?.[0]?.value ?? 0))
  }
  return uit
}

/**
 * Twee rapporten samengevoegd tot één rij per campagne.
 *
 * @ai-why: Twee aanroepen en niet één rapport met beide metrics. `activeUsers` naast een
 * gefilterde `eventCount` zetten verandert bij GA4 zowel het aantal rijen als de andere
 * metric, want het filter geldt dan voor allebei. Je krijgt dan "gebruikers die het event
 * vuurden" terwijl er "bezoekers" boven de kolom staat.
 *
 * @ai-gotcha: Bezoekers is een telling van gebruikers tegen een dimensie die per sessie
 * geldt. Wie via twee campagnes binnenkomt telt in beide rijen, dus deze kolom telt niet
 * op tot het bezoekerstotaal op het Overzicht. Het scherm zegt dat erbij.
 */
export function parseCampaignRows(bezoekers: Rapport, klikken: Rapport): Ga4Campaign[] {
  const perBezoeker = perCampagne(bezoekers)
  const perKlik = perCampagne(klikken)

  return [...new Set([...perBezoeker.keys(), ...perKlik.keys()])].map((campaignId) => ({
    campaignId,
    visitors: perBezoeker.get(campaignId) ?? 0,
    appStoreClicks: perKlik.get(campaignId) ?? 0,
  }))
}

/**
 * Bezoek en doorklik per campagne, gesleuteld op `utm_id`.
 *
 * @ai-gotcha: De sleutel is `sessionCampaignId` en dus de waarde van `utm_id`, niet de
 * campagnenaam. Advertenties zonder die parameter komen hier binnen onder `(not set)` en
 * vinden nooit een campagne om bij te horen. Zie TDR-0009 beslissing 4.
 */
export async function loadGa4Campaigns(days: number): Promise<Ga4Campaign[]> {
  const token = await accessToken()
  const dateRanges = [{ startDate: `${days}daysAgo`, endDate: 'today' }]
  const dimensions = [{ name: 'sessionCampaignId' }]

  const [bezoekers, klikken] = await Promise.all([
    runReportRows(token, { dateRanges, dimensions, metrics: [{ name: 'activeUsers' }] }),
    runReportRows(token, {
      dateRanges,
      dimensions,
      metrics: [{ name: 'eventCount' }],
      dimensionFilter: {
        filter: {
          fieldName: 'eventName',
          stringFilter: { matchType: 'EXACT', value: APP_STORE_EVENT },
        },
      },
    }),
  ])

  return parseCampaignRows(bezoekers, klikken)
}
