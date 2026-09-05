# TDR-0005 — carve.wiki is een marketingpagina voor de app, de rest staat achter een vlag

- **Status:** Voorgesteld
- **Datum:** 2026-09-05
- **Beslisser:** Furkan
- **Gerelateerd:** vervangt [TDR-0001](./0001-homepage-is-een-keuzescherm.md) · maakt [TDR-0002](./0002-de-demo-achter-de-klik.md) onbereikbaar · bouwt voort op [TDR-0003](./0003-carve-is-de-app-pagina.md) en [TDR-0004](./0004-de-site-verkoopt-nog-een-product.md)
- **Raakt:** `app/(landing)/page.tsx`, `app/carve/page.tsx`, `components/carve/CarveMarketingPage.tsx` (verplaatst), `app/(protected)/layout.tsx`, `app/hiscores/page.tsx`, `app/demo/page.tsx`, `app/lab/page.tsx`, `app/wiki/layout.tsx`, `app/sitemap.ts`, `middleware.ts`, `lib/flags.ts`

## Context

TDR-0001 maakte van `/` een keuzescherm, TDR-0004 haalde twee van de vier kaarten daaruit weg. Wat overbleef was een keuzescherm met twee kaarten die allebei naar hetzelfde domein wijzen. Dat is geen keuze meer.

Ondertussen is het meetbare beeld niet veranderd: dertien accounts in de gedeelde Supabase, waarvan zeven testaccounts van de bouwer. Vier van de zes echte mensen logden één ding en kwamen niet terug. Het verkeer dat er is komt via de App Store, niet via het web. Het web-platform (`(protected)`, 68 bestanden over elf secties, plus `/hiscores`, `/demo` en `/lab`) is niet stuk, maar het wordt niet gebruikt en het moet wel onderhouden worden.

De iOS-app is op 2026-09-04 om dezelfde reden teruggesnoeid naar één ding: eten loggen en zien welke spieren je overslaat. De site liep daarop achter en verkocht een breder product dan er bestaat.

## Beslissing

**carve.wiki is een marketingpagina voor de iOS-app. Het web-platform staat achter `SHOW_WEB_APP` en is in productie uit.**

1. `/` rendert `CarveMarketingPage`, dezelfde component als `/carve`. Geen redirect: `/` is de URL die mensen intikken en waar advertenties en de bio-link naartoe wijzen.
2. `SHOW_WEB_APP` gaat over `(protected)` (chat, dashboard, workouts, food, social, profile, settings, health, travel, money, admin), plus `/hiscores`, `/demo` en `/lab`. Eén poort in `app/(protected)/layout.tsx` dekt alle 68 bestanden.
3. **Inloggen blijft werken.** `(auth)` valt er niet onder: een bestaand account moet erin kunnen en `/admin` hangt eraan. **Signup staat wel dicht** zolang de vlag uit is; er komen geen nieuwe web-accounts bij.
4. De drie middleware-redirects naar `/chat` (vanaf `/`, `/carve` en na inloggen) gelden alleen nog als de vlag aanstaat. Anders zou een ingelogde bezoeker zijn eigen marketingpagina nooit zien en na inloggen tegen een 404 lopen.
5. Publiek blijven: de marketingpagina, `/privacy`, `/terms` en `/support`. De eerste is het doel, de laatste drie eist Apple.
6. **Ook `/wiki` gaat dicht** (`SHOW_WIKI`, bijgesteld op 2026-09-05, dezelfde dag). De eerdere redenering was dat de wiki publiek blijft voor organisch verkeer. Dat verkeer komt over maanden en het zijn zeventien artikelen; zolang de site één ding doet is een tweede leesoppervlak alleen een tweede plek om bij te houden. De artikelen zelf staan in Supabase en voeden de Encyclopedie in de iOS-app; die blijft ongemoeid.

De vlag is aan in development en uit in productie, met `NEXT_PUBLIC_SHOW_WEB_APP=true` als ontsnapping voor een preview-deploy.

## Alternatieven afgewogen

| Alternatief | Waarom niet |
|---|---|
| **`/` laten redirecten naar `/carve`** | Eén regel minder werk, maar de root is de URL die telt voor advertenties en SEO. Een redirect kost daar snelheid en duidelijkheid. |
| **Het platform verwijderen in plaats van uitzetten** | 68 bestanden slopen die werken, terwijl niemand er last van heeft. Uitzetten is omkeerbaar en kost niets; opruimen kan later, met een tag ervoor. |
| **Ook `(auth)` achter de vlag** | Dan kan een bestaand account niet meer inloggen en is `/admin` onbereikbaar. De prijs van openhouden is een loginpagina waar bijna niemand komt; de prijs van dichtzetten is iemand buitensluiten. |
| **Het keuzescherm houden met twee kaarten** | Twee kaarten die naar hetzelfde domein wijzen zijn geen keuze. Dan is de vraag "wat wil je doen" een formaliteit vóór het antwoord dat toch al vaststond. |

## Consequenties

- `LandingPage`, `DomainPicker`, `DomainCardLink`, `LandingNav` en `lib/domains.ts` hebben geen lezer meer. Bewust niet verwijderd: TDR-0001 en TDR-0004 zijn er twee weken respectievelijk één dag oud, en het scheelt niets om ze te laten staan. Bij een volgende opruimronde horen ze bovenaan de lijst.
- `components/landing/demo-steps.ts` en `LandingDemo` waren al geparkeerd (TDR-0004) en zijn nu ook via `/demo` onbereikbaar in productie.
- `/admin` gaat in productie mee dicht, want het zit in `(protected)`. Werk je lokaal, dan merk je dat niet. Moet admin live bereikbaar zijn, dan is dat een eigen uitzondering in die layout of `NEXT_PUBLIC_SHOW_WEB_APP=true`.
- De sitemap is meegegaan: `/carve/money`, `/carve/travel`, `/hiscores`, `/signup` en `/wiki` staan er niet meer in. Een route die een 404 geeft kost je de crawl van de pagina's die er wél zijn.

## Hoe overrulen

Een opvolger zou moeten laten zien dat het web-platform een eigen publiek heeft: mensen die zich op het web aanmelden en terugkomen zonder de app. Dan gaat `SHOW_WEB_APP` aan, keren de redirects terug en krijgt `/` weer een keuze in plaats van een belofte.

## Synchronisatie

- `lib/flags.ts` ↔ `middleware.ts` — elke redirect naar een gate-route moet dezelfde vlag lezen
- `app/(landing)/page.tsx` ↔ `app/carve/page.tsx` — dezelfde component, en de metadata hoort hetzelfde te beloven
- `app/sitemap.ts` ↔ `lib/flags.ts` — geen route in de sitemap die achter een uitgezette vlag staat
- `components/carve/CarveMarketingPage.tsx` ↔ `~/Developer/Carve-AI/docs/marketing/app-store-listing.md`
