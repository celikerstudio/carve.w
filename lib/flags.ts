/**
 * Feature flags voor carve.wiki.
 *
 * @ai-why: Dezelfde vorm als `FeatureFlags.swift` in de iOS-app, bewust. Beide
 * producten zetten dezelfde domeinen aan en uit, en een vlag die er aan twee kanten
 * anders uitziet wordt aan één kant vergeten. Elke vlag draagt zijn reden hier ter
 * plekke; een verwijzing naar een doc dat kan verdwijnen stuurt de lezer actiever de
 * verkeerde kant op dan geen verwijzing.
 *
 * @ai-gotcha: Dit zijn build-time constanten, geen runtime-schakelaars. Ze bestaan om
 * een domein uit de aanbieding te halen zonder de code te slopen, niet om per gebruiker
 * iets aan of uit te zetten. Wie dat laatste nodig heeft bouwt iets anders.
 *
 * @ai-sync: ~/Developer/Carve-AI/Carve AI/App/Config/FeatureFlags.swift
 */

/**
 * Het Geld-domein op de site: de app onder `/money`, de marketingpagina `/carve/money`
 * en de Money-ingang in de carve-navigatie.
 *
 * @ai-why: Uit sinds 2026-09-05, tegelijk met `FeatureFlags.showMoneyTab` in de iOS-app.
 * Niet omdat het stuk is (de schermen werken en er staan echte transacties in), maar
 * omdat Carve één product verkoopt: eten loggen en zien welke spieren je overslaat.
 * Een tweede domein aanbieden dat je na het downloaden niet vindt is dezelfde drift die
 * TDR-0001 al opruimde bij de inbox-demo.
 *
 * Wat er gebeurt als hij uit staat: `/money` en `/carve/money` geven een 404 en de
 * Money-ingang verdwijnt uit de navigatie. De routes, componenten en data blijven staan.
 *
 * @ai-why: Aan in development, uit in productie. Zo blijft het domein voor jou bruikbaar
 * op `pnpm dev` (er staan echte transacties in) terwijl een bezoeker het niet ziet. Wil
 * je het op een preview- of productie-deploy tóch aan, zet dan `NEXT_PUBLIC_SHOW_MONEY=true`
 * in de omgeving; dat vraagt geen codewijziging en geen nieuwe build van de flag zelf.
 *
 * @ai-gotcha: Dit is géén autorisatie. `NEXT_PUBLIC_*` en `NODE_ENV` staan in de client-
 * bundle, dus dit verbergt de ingang en beveiligt niets. De data achter `/money` blijft
 * beschermd door RLS en de `(protected)`-layout; dat is de echte grens.
 *
 * @ai-sync: docs/tdr/0004-de-site-verkoopt-nog-een-product.md
 */
export const SHOW_MONEY =
  process.env.NEXT_PUBLIC_SHOW_MONEY === 'true' || process.env.NODE_ENV !== 'production'

/**
 * Het Life/Travel-domein op de site: de marketingpagina `/carve/travel`.
 *
 * @ai-why: Uit sinds 2026-09-05, tegelijk met `FeatureFlags.showLegacyLifeTab` in de
 * iOS-app. Zelfde reden als Money: het domein bestaat nog in code en data, maar niet in
 * het product dat je downloadt, en een marketingpagina voor iets dat je daarna niet
 * vindt is een belofte die je niet nakomt.
 *
 * @ai-sync: docs/tdr/0004-de-site-verkoopt-nog-een-product.md
 */
export const SHOW_LIFE =
  process.env.NEXT_PUBLIC_SHOW_LIFE === 'true' || process.env.NODE_ENV !== 'production'

/**
 * De publieke wiki op `/wiki`: de fitness-encyclopedie met 17 artikelen.
 *
 * @ai-why: Uit sinds 2026-09-05. De redenering in TDR-0005 was dat de wiki publiek
 * blijft voor organisch verkeer, maar dat verkeer komt over maanden en er staan
 * zeventien artikelen. Zolang carve.wiki één ding doet — de app verkopen — is een
 * tweede leesoppervlak alleen een tweede plek om bij te houden.
 *
 * @ai-gotcha: Dit raakt de app niet. De artikelen staan in Supabase (`wiki_articles`)
 * en de Encyclopedie-tab in de iOS-app leest ze daar rechtstreeks; dit verbergt alleen
 * de web-weergave. `scripts/sync-wiki-articles.ts` blijft ook gewoon werken.
 *
 * @ai-sync: docs/tdr/0005-carve-wiki-is-een-marketingpagina.md
 */
export const SHOW_WIKI =
  process.env.NEXT_PUBLIC_SHOW_WIKI === 'true' || process.env.NODE_ENV !== 'production'

/**
 * De rewards-sectie op `/carve`: XP, rangen, streaks en "unlock Pro days".
 *
 * @ai-why: Spiegelt `FeatureFlags.showProDaysRewards` in de iOS-app, die uit staat.
 * Verdiende dagen komen in de server-side tier-resolver wél als getal terug maar zitten
 * niet in de ladder, dus ze geven geen Pro. Een beloning adverteren die niet wordt
 * uitgekeerd is erger dan hem verzwijgen.
 */
export const SHOW_REWARDS = false

/**
 * Het web-platform: de ingelogde app (`/chat`, `/dashboard`, `/workouts`, `/food`,
 * `/social`, `/profile`, `/settings`, `/health`, `/travel`), plus `/hiscores`, `/demo`
 * en `/lab`.
 *
 * @ai-why: Uit sinds 2026-09-05. carve.wiki is vanaf nu een marketingpagina voor de
 * iOS-app, en niets anders. Het platform is niet stuk — het is 68 bestanden die niemand
 * gebruikt: van de dertien accounts in de gedeelde database zijn er zeven testaccounts,
 * en het verkeer komt via de App Store binnen, niet via het web. Twee producten
 * onderhouden terwijl er één gebruikt wordt is precies de breedte die in de iOS-app op
 * 2026-09-04 is teruggesnoeid.
 *
 * @ai-gotcha: `(auth)` valt hier bewust NIET onder. Inloggen blijft werken, anders komt
 * een bestaand account er niet meer in en jij niet meer bij `/admin`. Signup staat wel
 * dicht: geen nieuwe web-accounts zolang het platform uit is. `/admin` blijft open, dat
 * is jouw gereedschap en het hangt aan de rol, niet aan deze vlag.
 *
 * @ai-sync: docs/tdr/0005-carve-wiki-is-een-marketingpagina.md
 */
export const SHOW_WEB_APP =
  process.env.NEXT_PUBLIC_SHOW_WEB_APP === 'true' || process.env.NODE_ENV !== 'production'
