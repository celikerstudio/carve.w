# TDR-0003 — `/carve` is de pagina van de iOS-app, `/how-it-works` blijft van het platform

- **Status:** Voorgesteld
- **Datum:** 2026-09-05
- **Beslisser:** Furkan
- **Gerelateerd:** verduidelijkt de routing uit [TDR-0001](./0001-homepage-is-een-keuzescherm.md) · [TDR-0002](./0002-de-demo-achter-de-klik.md) ongewijzigd
- **Raakt:** `app/carve/page.tsx`, `components/carve/MarketingHero.tsx`, `components/carve/PricingHub.tsx`, `lib/analytics.ts`

## Context

TDR-0001 legde vast dat `/` een keuzescherm is en dat de uitleg naar `/how-it-works` gaat. Die route is nooit gebouwd. Wat wél bestaat, en wat in TDR-0001 niet genoemd wordt, is **`app/carve/page.tsx`**: een volledige marketingpagina voor de iOS-app van ruim negenhonderd regels, met een hero, een animerende AI-scan-demo, een trainingssectie, hiscores, rewards, pricing, `PhoneShowcase` en drie App Store-knoppen via `APP_STORE_URL` (`lib/utils.ts:7`).

De app-pagina was er dus al. De vraag was nooit of hij gebouwd moest worden, maar of hij klopte. Dat deed hij op drie punten niet.

**De belofte liep achter op het product.** De kop boven de waardepropositie was "Health. Money. Travel." met kaarten voor Money en Travel. Op 2026-09-04 zijn die domeinen in de iOS-app achter een vlag gezet (`FeatureFlags.showMoneyTab`, `showLegacyLifeTab`, `showSportHub`). De pagina verkocht schermen die je na het downloaden niet vindt. Dat is dezelfde drift die TDR-0001 zelf al constateerde bij de inbox-demo, één product verderop.

**De rewards-sectie adverteerde een beloning die niet wordt uitgekeerd.** XP, rangen, streaks en "unlock Pro days" horen bij `FeatureFlags.showProDaysRewards`, dat uit staat. Verdiende dagen komen in de server-side tier-resolver wel als getal terug maar zitten niet in de ladder, dus ze geven geen Pro.

**De trial-lengte klopte niet.** De pagina zei zeven dagen; de trigger in de database zet `INTERVAL '30 days'` (`20260903170000_restore_signup_trial_trigger.sql:21`).

Daarbovenop was er een meetgat: op geen van de drie App Store-knoppen zat een analytics-event, terwijl `lib/analytics.ts` de helper klaar had staan. De klikratio naar de store is precies het cijfer waarop een advertentie beoordeeld wordt, en dat cijfer bestond niet.

## Beslissing

1. **`/carve` is de pagina van de iOS-app.** Er komt geen nieuwe route. De pagina verkoopt één ding: de app zoals hij vandaag in de App Store staat.
2. **`/how-it-works` blijft gereserveerd voor het web-platform.** Dat is een ander product met eigen domeinen (chat, hiscores, wiki, demo); het mag een eigen uitlegpagina houden. Dit is de expliciete keuze voor twee marketing-oppervlakken in plaats van één.
3. **Wat achter een uitgezette vlag staat, staat niet op `/carve`.** Money, Life en de sport-hub zijn eruit; de rewards-sectie staat achter een constante die de iOS-vlag spiegelt in plaats van dat hij verwijderd is.
4. **Elke App Store-knop vuurt `app_store_click`** met een `source`-prop. Eén event met een prop, geen drie losse events, zodat het totaal klopt zonder optellen.

## Alternatieven afgewogen

| Alternatief | Waarom niet |
|---|---|
| **Nieuwe route `/app` bouwen** | Was het oorspronkelijke voorstel in deze TDR, geschreven op de aanname dat er nog geen app-pagina bestond. Die aanname was fout: de eerste versie van dit document beweerde dat er nergens een `apps.apple.com`-link in de codebase stond, terwijl `lib/utils.ts:7` hem al had. Een tweede pagina naast `/carve` zou twee app-verhalen opleveren in plaats van één. |
| **`/how-it-works` wordt de app-pagina** (het plan uit TDR-0001) | Eén pagina, één doel, minder onderhoud. Afgewezen omdat het web-platform daarmee geen eigen uitlegpagina houdt terwijl het een eigen product is. De prijs is bekend en geaccepteerd: twee oppervlakken die bij elke productwijziging allebei nagelopen moeten worden. |
| **De rewards-sectie weghalen in plaats van uitschakelen** | Uitgecommentarieerde of verwijderde secties verouderen stil mee met de rest van het bestand. Achter een constante blijft de sectie meecompileren en is hij in één regel terug. |

## Consequenties

- Er zijn twee marketing-oppervlakken met een eigen belofte. Wijzigt de app van vorm, dan moeten `/carve` én de App Store-listing mee. Daarom de synchronisatie-sectie hieronder.
- `SHOW_REWARDS` in `app/carve/page.tsx` is een tweede plek waar een iOS-vlag gespiegeld wordt. Gaat `showProDaysRewards` ooit aan, dan moet deze mee.
- De screenshots in `public/screenshots/` heten nog `dashboard`, `diary` en `profile` en dateren van vóór de huidige tabs. Ze moeten vervangen worden door de zes uit de App Store-set.

## Hoe overrulen

Een opvolger zou moeten laten zien dat het platform en de app hetzelfde product zijn geworden, bijvoorbeeld doordat de app de domeinen terugkrijgt die nu achter een vlag staan, of doordat het platform stopt. Dan kan `/carve` opgaan in `/how-it-works` en vervalt de reden voor twee pagina's.

## Synchronisatie

- `app/carve/page.tsx` ↔ `~/Developer/Carve-AI/docs/marketing/app-store-listing.md` — dezelfde belofte, dezelfde features, dezelfde screenshots
- `app/carve/page.tsx` (`SHOW_REWARDS`) ↔ `~/Developer/Carve-AI/Carve AI/App/Config/FeatureFlags.swift` (`showProDaysRewards`, `showMoneyTab`, `showLegacyLifeTab`)
- pricing-sectie ↔ `~/Developer/Carve-AI/supabase/migrations/20260903170000_restore_signup_trial_trigger.sql` — de trial-lengte staat daar, niet in de copy
- `lib/analytics.ts` ↔ de drie App Store-knoppen — komt er een vierde ingang bij, dan vuurt die hetzelfde event
