/**
 * App Store Connect: downloads, sterren en reviews.
 *
 * @ai-why: Downloads komen uit het SALES/SUMMARY-dagrapport en niet uit de Analytics
 * Reports API. Die laatste geeft Apple's echte Installations-metric, maar werkt
 * asynchroon: je maakt eerst een `analyticsReportRequest` aan en haalt daarna via
 * reports → instances → segments de bestanden op. Dat zijn zes tot zeven aanroepen per
 * dag, de eerste data komt pas 24 tot 48 uur ná het aanmaken van de request, en
 * instances verlopen. Dat past niet op een pagina die live ophaalt.
 *
 * @ai-gotcha: Wat je hier telt zijn dus Apple's **Units**, niet zijn Installations. Het
 * verschil: Units telt eerste downloads per Apple-ID, Installations telt installaties op
 * apparaten (inclusief herinstallaties en meerdere apparaten per account). De getallen
 * lopen structureel uiteen. Noem dit op het scherm daarom "Downloads" en zet het niet
 * naast een cijfer uit App Store Connect's eigen Analytics-tab; die twee horen niet
 * gelijk te zijn.
 *
 * @ai-gotcha: Eén rapportbestand per dag betekent dat dertig dagen trend dertig aanroepen
 * zijn. Afgesloten dagen worden daarom in de fetch-cache gezet (TDR-0006 beslissing 3).
 *
 * @ai-sync: docs/tdr/0006-admin-is-de-cockpit.md
 */

import { gunzipSync } from 'node:zlib'
import { APP_STORE_ID } from '@/lib/utils'
import { signES256 } from './jwt'
import { missingEnv } from './source'

// @ai-why: Het app-id staat hier niet bij. Het verschilt niet per omgeving en is niet
// geheim, dus als env-variabele was het een tweede plek waar hetzelfde nummer kon gaan
// afwijken van lib/utils.ts. Dat nummer is daar al een keer fout geweest.
// @ai-sync: lib/utils.ts (APP_STORE_ID)
export const APPSTORE_ENV = [
  'APPSTORE_ISSUER_ID',
  'APPSTORE_KEY_ID',
  'APPSTORE_PRIVATE_KEY',
  'APPSTORE_VENDOR_NUMBER',
] as const

const API = 'https://api.appstoreconnect.apple.com/v1'

export function appstoreMissing(): string[] {
  return missingEnv(process.env, [...APPSTORE_ENV])
}

/**
 * @ai-gotcha: Apple weigert een token dat langer dan 20 minuten geldig is, met een 401
 * die niets over de looptijd zegt. Vandaar 15 minuten en niet een uur.
 */
function token(): string {
  const now = Math.floor(Date.now() / 1000)
  return signES256(
    { alg: 'ES256', kid: process.env.APPSTORE_KEY_ID, typ: 'JWT' },
    {
      iss: process.env.APPSTORE_ISSUER_ID,
      iat: now,
      exp: now + 15 * 60,
      aud: 'appstoreconnect-v1',
    },
    process.env.APPSTORE_PRIVATE_KEY!,
  )
}

export interface SalesReport {
  downloads: number
  updates: number
}

/**
 * Telt de eerste downloads uit een SALES/SUMMARY-rapport.
 *
 * @ai-why: Product Type Identifier bepaalt wat een regel is. Alles wat met 1 begint
 * (1, 1F voor iPad, 1T voor universal) is een eerste download; alles met 7 is een update
 * van een bestaande installatie; IA-codes zijn in-app aankopen. Updates meetellen maakt
 * van je bestaande gebruikers dagelijkse "nieuwe" downloads, en dat is precies het getal
 * waarop je advertentiebudget zou beoordelen.
 *
 * @ai-gotcha: Apple voegt kolommen toe zonder aankondiging, dus we zoeken op kolomnaam
 * en niet op index. Komt er ooit een producttype bij dat ook een eerste download is, dan
 * is dit de plek: de prefix-lijst hieronder.
 */
export function parseSalesReport(tsv: string): SalesReport {
  const regels = tsv.split('\n').filter((r) => r.trim() !== '')
  if (regels.length === 0) return { downloads: 0, updates: 0 }

  const kop = regels[0].split('\t').map((k) => k.trim())
  const iType = kop.indexOf('Product Type Identifier')
  const iUnits = kop.indexOf('Units')

  if (iUnits === -1) {
    throw new Error(
      `Rapport zonder kolom "Units". Gevonden kolommen: ${kop.join(', ')}. Apple heeft het formaat gewijzigd.`,
    )
  }

  let downloads = 0
  let updates = 0

  for (const regel of regels.slice(1)) {
    const velden = regel.split('\t')
    const units = Number(velden[iUnits]?.trim() ?? 0)
    if (!Number.isFinite(units)) continue

    const type = (iType === -1 ? '' : (velden[iType]?.trim() ?? '')).toUpperCase()

    if (type.startsWith('7')) updates += units
    else if (type.startsWith('1') || type === 'F1') downloads += units
  }

  return { downloads, updates }
}

function reportDate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

/**
 * @ai-why: Een dag is pas definitief als hij minstens twee dagen oud is. Apple zet het
 * rapport van gisteren de volgende ochtend rond 08:00 Pacific klaar, en tot dat moment
 * geeft de API een 404. Zou je die 404 als nul in een eeuwige cache zetten, dan staat er
 * permanent een nul voor een dag waarop wel gedownload is, en je ziet dat nooit meer
 * terug. Alleen oudere dagen zijn dus veilig om vast te houden.
 */
const DEFINITIEF_NA_DAGEN = 2

async function salesForDay(day: Date, jwt: string, signal: AbortSignal): Promise<SalesReport> {
  const url = new URL(`${API}/salesReports`)
  url.searchParams.set('filter[frequency]', 'DAILY')
  url.searchParams.set('filter[reportType]', 'SALES')
  url.searchParams.set('filter[reportSubType]', 'SUMMARY')
  // @ai-gotcha: DAILY SALES vereist versie 1_1. Oudere documentatie noemt 1_0; die geeft
  // een 400 waarin de versie niet genoemd wordt.
  url.searchParams.set('filter[version]', '1_1')
  url.searchParams.set('filter[vendorNumber]', process.env.APPSTORE_VENDOR_NUMBER!)
  url.searchParams.set('filter[reportDate]', reportDate(day))

  const ouderdomDagen = (Date.now() - day.getTime()) / 86_400_000
  const definitief = ouderdomDagen >= DEFINITIEF_NA_DAGEN

  const res = await fetch(url, {
    headers: { authorization: `Bearer ${jwt}`, accept: 'application/a-gzip' },
    signal,
    // Afgesloten dag: onbeperkt vasthouden. Verse dag: elk half uur opnieuw proberen,
    // want het rapport kan er nog niet zijn.
    next: definitief ? { revalidate: false } : { revalidate: 1800 },
  })

  // @ai-gotcha: 404 betekent "geen rapport voor deze dag", niet "kapot". Apple maakt geen
  // bestand aan voor een dag zonder verkeer, en het rapport van gisteren is er 's ochtends
  // nog niet. Een 404 als fout behandelen zou het hele blok laten wegvallen.
  if (res.status === 404) return { downloads: 0, updates: 0 }
  if (!res.ok) throw new Error(`App Store Connect gaf ${res.status} voor ${reportDate(day)}.`)

  const gz = Buffer.from(await res.arrayBuffer())
  return parseSalesReport(gunzipSync(gz).toString('utf8'))
}

export interface Review {
  id: string
  rating: number
  title: string
  body: string
  createdDate: string
  answered: boolean
}

export interface AppStoreData {
  /** Apple's Units over het venster: eerste downloads, geen updates. */
  downloads: number
  updates: number
  daysCounted: number
  /** Het sterrengemiddelde van de storepagina, inclusief beoordelingen zonder tekst. */
  averageRating: number | null
  ratingCount: number | null
  /** Alleen geschreven reviews; beoordelingen zonder tekst zitten hier niet in. */
  reviews: Review[]
  unanswered: number
}

async function loadReviews(jwt: string, signal: AbortSignal): Promise<Review[]> {
  const url = new URL(`${API}/apps/${APP_STORE_ID}/customerReviews`)
  url.searchParams.set('limit', '50')
  url.searchParams.set('sort', '-createdDate')
  url.searchParams.set('include', 'response')

  const res = await fetch(url, {
    headers: { authorization: `Bearer ${jwt}` },
    signal,
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`Reviews gaven ${res.status}.`)

  const json = (await res.json()) as {
    data?: {
      id: string
      attributes?: { rating?: number; title?: string; body?: string; createdDate?: string }
      relationships?: { response?: { data?: unknown } }
    }[]
  }

  return (json.data ?? []).map((r) => ({
    id: r.id,
    rating: r.attributes?.rating ?? 0,
    title: r.attributes?.title ?? '',
    body: r.attributes?.body ?? '',
    createdDate: r.attributes?.createdDate ?? '',
    // @ai-gotcha: `relationships.response.data` is null zolang er geen antwoord staat.
    // Dat veld is de enige manier om te zien of je al gereageerd hebt.
    answered: Boolean(r.relationships?.response?.data),
  }))
}

/**
 * Het sterrengemiddelde van de storepagina.
 *
 * @ai-why: Via de publieke iTunes-lookup en niet via App Store Connect, omdat daar
 * simpelweg geen endpoint voor bestaat. `customerReviews` geeft alleen geschreven
 * reviews, en verreweg de meeste mensen geven wel sterren maar schrijven niets. Het
 * gemiddelde uitrekenen over alleen de geschreven reviews geeft daarom een ander getal
 * dan er in de App Store staat, en dat is het getal waar je op afgerekend wordt.
 *
 * @ai-gotcha: Deze lookup heeft geen sleutel nodig en kent geen versienummer. Hij kan
 * dus zonder waarschuwing van vorm veranderen; vandaar dat een mislukking hier de rest
 * van het blok niet meeneemt.
 */
async function loadStoreRating(
  signal: AbortSignal,
): Promise<{ averageRating: number | null; ratingCount: number | null }> {
  try {
    const url = new URL('https://itunes.apple.com/lookup')
    url.searchParams.set('id', APP_STORE_ID)
    url.searchParams.set('country', 'nl')

    const res = await fetch(url, { signal, next: { revalidate: 3600 } })
    if (!res.ok) return { averageRating: null, ratingCount: null }

    const json = (await res.json()) as {
      results?: { averageUserRating?: number; userRatingCount?: number }[]
    }
    const app = json.results?.[0]
    if (!app) return { averageRating: null, ratingCount: null }

    return {
      averageRating:
        typeof app.averageUserRating === 'number'
          ? Math.round(app.averageUserRating * 10) / 10
          : null,
      ratingCount: app.userRatingCount ?? null,
    }
  } catch {
    return { averageRating: null, ratingCount: null }
  }
}

export async function loadAppStore(
  days: number,
  signal: AbortSignal,
  now: Date = new Date(),
): Promise<AppStoreData> {
  const jwt = token()

  // @ai-why: Gisteren is de laatste dag die we opvragen. Apple sluit een dagrapport pas
  // af als de dag in alle tijdzones voorbij is; vandaag opvragen geeft een 404, en dat
  // ziet er in een grafiek uit als een terugval naar nul.
  const dagen = Array.from({ length: days }, (_, i) => {
    const d = new Date(now)
    d.setUTCDate(d.getUTCDate() - (i + 1))
    return d
  })

  const [rapporten, reviews, rating] = await Promise.all([
    Promise.all(dagen.map((dag) => salesForDay(dag, jwt, signal))),
    loadReviews(jwt, signal),
    loadStoreRating(signal),
  ])

  return {
    downloads: rapporten.reduce((som, r) => som + r.downloads, 0),
    updates: rapporten.reduce((som, r) => som + r.updates, 0),
    daysCounted: dagen.length,
    averageRating: rating.averageRating,
    ratingCount: rating.ratingCount,
    reviews,
    unanswered: reviews.filter((r) => !r.answered).length,
  }
}
