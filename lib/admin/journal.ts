/**
 * Het advertentiejournaal: wat er gebeurde, wat we verwachtten, en wat eruit kwam.
 *
 * @ai-why: De cockpit haalt zijn cijfers live op (TDR-0006 beslissing 3), en dat blijft
 * zo. Hier staat alleen wat een bron je later níét kan teruggeven: dat jij het budget
 * verhoogde, wat je daarvan verwachtte, dat de tracking-check rood stond. Meta bewaart
 * ~37 maanden aan cijfers, maar geen enkele partij bewaart waaróm een getal bewoog.
 *
 * @ai-why: Append-only, en de tabel heeft geen update- of delete-policy. Een logboek dat
 * je achteraf kunt bijstellen is precies zoveel waard als je geheugen, en dat is nul.
 * De levenscyclus loopt daarom via `ref`: een test die afloopt krijgt een tweede regel
 * (`afsluiting`) die naar de eerste wijst, in plaats van dat de eerste wordt gemuteerd.
 * `openTests` leidt de stand daaruit af; er is geen statuskolom die uit de pas kan lopen.
 *
 * @ai-gotcha: `body` is jsonb en dus vormloos in de database. De vorm wordt hier
 * afgedwongen met zod, aan de schrijfkant. Schrijf nooit rechtstreeks met de Supabase
 * client naar deze tabel; ga via `validateEvent`, anders staat er over een half jaar een
 * regel in waarvan niemand de vorm kent en die geen enkele lezer meer aankan.
 *
 * @ai-sync: supabase/migrations/20260910000001_create_ads_journal.sql
 * @ai-sync: lib/admin/ads.ts
 */

import { z } from 'zod'

const nietLeeg = z.string().trim().min(1)

/**
 * Een kalenderdag als `YYYY-MM-DD`.
 *
 * @ai-gotcha: De vormcontrole alléén is niet genoeg. `2026-13-45` past op het patroon,
 * en `Date.parse` maakt daar een NaN of stilzwijgend een andere dag van. Zonder de
 * tweede controle hieronder kwam zo'n datum door en viel hij pas om op de looptijdregel,
 * met de melding "een test loopt minstens 7 dagen". Dan zoek je in de verkeerde hoek.
 */
const datum = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'verwacht YYYY-MM-DD')
  .refine(
    (v) => {
      // @ai-gotcha: Eerst op NaN controleren. `new Date('2026-13-45T00:00:00Z')` is een
      // Invalid Date, en `.toISOString()` gooit daar een RangeError op in plaats van een
      // string terug te geven. Die vlucht dwars door zod heen en komt bij de aanroeper
      // als een crash aan, precies waar een nette weigering hoorde te staan.
      const dag = new Date(`${v}T00:00:00Z`)
      if (Number.isNaN(dag.getTime())) return false
      // Terugvergelijken vangt de dagen die JavaScript stilzwijgend doorrolt: 31 februari
      // wordt 3 maart en zou zonder deze controle als geldig passeren.
      return dag.toISOString().startsWith(v)
    },
    { message: 'die datum bestaat niet' },
  )

/**
 * @ai-why: Zeven dagen is de ondergrens voor een test, niet vijf en niet drie. Een
 * kortere test valt binnen de leerfase waarin het platform zijn eigen bezorging nog
 * verschuift, en hij mist bovendien het weekend. Wat je dan meet is de leerfase en de
 * dag van de week, niet je variabele. Dit is een ondergrens en geen garantie: op Carve's
 * volume is zeven dagen nog steeds weinig, en dat is een reden om de uitkomst
 * voorzichtig te lezen, geen reden om korter te testen.
 */
const MINIMALE_LOOPTIJD_DAGEN = 7

const DAG_IN_MS = 24 * 60 * 60 * 1000

function dagenTussen(van: string, tot: string): number {
  return (Date.parse(tot) - Date.parse(van)) / DAG_IN_MS
}

/**
 * @ai-why: `verwacht` is verplicht. Dat veld is de hele reden dat dit journaal bestaat:
 * zonder verwachting vooraf is elke uitkomst achteraf te verklaren, en dan leer je er
 * niets van. Een wijziging die je niet kunt onderbouwen hoort niet gemaakt te worden,
 * dus hoort hij ook niet vastgelegd te kunnen worden.
 */
const wijziging = z.object({
  /** Wat er feitelijk veranderde, in gewone taal. */
  wat: nietLeeg,
  /** Waarom je het deed. */
  waarom: nietLeeg,
  /** Wat je verwachtte dat er zou gebeuren. */
  verwacht: nietLeeg,
})

/**
 * @ai-why: `criterium` staat los van `verwacht` en is óók verplicht. "Ik verwacht meer
 * doorklikken" is geen besluitregel; "minstens een kwart hoger" wel. Zonder de tweede
 * beslis je achteraf op het cijfer dat je toevallig ziet, en dan bevestigt elke test
 * zichzelf.
 */
const test = z
  .object({
    hypothese: nietLeeg,
    /** Het ene ding dat verandert. Twee variabelen tegelijk is geen test. */
    variabele: nietLeeg,
    verwacht: nietLeeg,
    /** De besluitregel, vooraf vastgelegd. */
    criterium: nietLeeg,
    startte: datum,
    /**
     * @ai-gotcha: `loopttot` is exclusief: het is de eerste dag waarop de test níét meer
     * loopt. `startte: 2026-09-01` met `loopttot: 2026-09-08` betekent dus zeven volle
     * dagen, 1 tot en met 7 september. buildTestConclusions sluit af zodra vandaag
     * `loopttot` bereikt, en dat klopt alleen bij deze lezing. Zou je hem als inclusief
     * lezen, dan sluit elke test een dag te vroeg af.
     */
    loopttot: datum,
  })
  .refine((v) => dagenTussen(v.startte, v.loopttot) > 0, {
    path: ['loopttot'],
    message: 'de einddatum ligt vóór de startdatum',
  })
  .refine((v) => dagenTussen(v.startte, v.loopttot) >= MINIMALE_LOOPTIJD_DAGEN, {
    path: ['loopttot'],
    message: `een test loopt minstens ${MINIMALE_LOOPTIJD_DAGEN} dagen`,
  })

const bevinding = z.object({
  /** Stabiele sleutel, zodat een bevinding over de tijd te volgen is. */
  code: nietLeeg,
  ernst: z.enum(['blokkerend', 'waarschuwing']),
  boodschap: nietLeeg,
})

/**
 * @ai-why: Status `fout` zonder bevindingen is geweigerd. Een rode lamp zonder reden
 * eronder is niet te repareren en wordt daarna genegeerd, en dan is de hele controle
 * waardeloos. Dit is dezelfde redenering als de leesbare foutmeldingen in
 * lib/admin/sources/source.ts: dit scherm heeft één lezer en die moet het zelf kunnen
 * oplossen.
 */
const controle = z
  .object({
    status: z.enum(['goed', 'waarschuwing', 'fout']),
    bevindingen: z.array(bevinding),
  })
  .refine((v) => v.status === 'goed' || v.bevindingen.length > 0, {
    path: ['bevindingen'],
    message: 'een controle die niet goed is, moet zeggen wat er mis is',
  })

/**
 * @ai-why: `onderbouwing` is verplicht en draagt de cijfers waarop het voorstel rust,
 * bevroren op het moment van voorstellen. Zonder dat is een voorstel van vorige week
 * niet meer te beoordelen, want de live cijfers zijn dan al opgeschoven. Dit is ook wat
 * een voorstel achteraf toetsbaar maakt: had het gelijk.
 */
const voorstel = z.object({
  actie: nietLeeg,
  motivatie: nietLeeg,
  onderbouwing: z.record(z.string(), z.unknown()).refine((v) => Object.keys(v).length > 0, {
    message: 'een voorstel draagt de cijfers waarop het rust',
  }),
})

const afsluiting = z.object({
  uitkomst: nietLeeg,
  besluit: nietLeeg,
  /** De cijfers bij afsluiting, zodat de uitkomst later herleesbaar is. */
  cijfers: z.record(z.string(), z.unknown()).optional(),
})

/**
 * @ai-why: De vorm van een controle leeft híér en niet in lib/admin/tracking-check.ts.
 * Die module had eerst zijn eigen `Bevinding` en `TrackingCheck`, los van dit schema, en
 * dan typecheckt een derde ernstgraad prima om vervolgens bij het wegschrijven door zod
 * geweigerd te worden. Eén bron, en de producent leidt zijn type hiervan af.
 */
export type Bevinding = z.infer<typeof bevinding>
export type ControleBody = z.infer<typeof controle>
export type BevindingErnst = Bevinding['ernst']

const schemas = {
  wijziging,
  test,
  controle,
  voorstel,
  afsluiting,
} as const

export type JournalKind = keyof typeof schemas

export interface JournalEvent {
  id: string
  /** Wanneer het gebeurde, niet wanneer je het vastlegde. */
  at: string
  kind: JournalKind
  /** Meta's campagne-ID, of null voor iets dat het hele account raakt. */
  campaignId: string | null
  body: unknown
  /** De gebeurtenis die deze afsluit. Alleen gevuld bij `afsluiting`. */
  ref: string | null
}

export type ParseResult = { ok: true; body: unknown } | { ok: false; problemen: string[] }

export function parseJournalBody(kind: JournalKind, body: unknown): ParseResult {
  const uitkomst = schemas[kind].safeParse(body)
  if (uitkomst.success) return { ok: true, body: uitkomst.data }
  return {
    ok: false,
    problemen: uitkomst.error.issues.map((i) => `${i.path.join('.') || kind}: ${i.message}`),
  }
}

/**
 * @ai-gotcha: Dit is de enige poort naar de tabel. `parseJournalBody` controleert alleen
 * de inhoud; de regel dat een afsluiting ergens naar moet wijzen leeft op het niveau van
 * de gebeurtenis en zou anders nergens staan. Een afsluiting zonder `ref` sluit niets af
 * en maakt `openTests` stil verkeerd: de test blijft dan eeuwig open terwijl er wel een
 * conclusie ligt.
 */
export function validateEvent(event: JournalEvent): ParseResult {
  if (event.kind === 'afsluiting' && !event.ref) {
    return { ok: false, problemen: ['ref: een afsluiting wijst naar de gebeurtenis die hij afsluit'] }
  }
  if (event.kind !== 'afsluiting' && event.ref) {
    return { ok: false, problemen: [`ref: alleen een afsluiting verwijst, niet een ${event.kind}`] }
  }
  return parseJournalBody(event.kind, event.body)
}

/**
 * De tests die nog lopen: alles van soort `test` waar geen afsluiting naar wijst.
 *
 * @ai-why: Afgeleid en niet opgeslagen. Een statuskolom zou een tweede waarheid zijn
 * naast de afsluitregel, en die twee lopen vroeg of laat uit de pas. Dit is de reden dat
 * de tabel geen update-policy nodig heeft.
 */
export function openTests(events: JournalEvent[]): JournalEvent[] {
  const afgesloten = new Set(
    events.filter((e) => e.kind === 'afsluiting' && e.ref).map((e) => e.ref as string),
  )
  return events.filter((e) => e.kind === 'test' && !afgesloten.has(e.id))
}
