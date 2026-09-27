# TDR-0014: drie vraagpagina's, zodat AI-modellen Carve kunnen aanraden

- **Status:** Voorgesteld
- **Datum:** 2026-09-27
- **Beslisser:** Furkan
- **Gerelateerd:** bouwt voort op [TDR-0012](./0012-de-marketingpagina-krijgt-een-nederlandse-variant.md) (copy in `lib/`, niet in de JSX) · raakt de premisse van TDR-0009, 0011 en 0013 (die gaan uit van lopende advertenties)
- **Raakt:** `lib/vraagpaginas.ts` (nieuw), `lib/vraagpaginas.test.ts` (nieuw), `components/carve/VraagPagina.tsx` (nieuw), `app/nl/[vraag]/page.tsx` (nieuw), `lib/marketing-seo.ts`, `lib/marketing-copy.ts`, `components/carve/CarveMarketingPage.tsx`, `app/sitemap.ts`

## Context

Op 2026-09-27 is Furkan gestopt met betaalde advertenties, omdat ze te duur waren. Groei moet nu organisch komen, en een groeiend deel van "welke app moet ik nemen" wordt aan ChatGPT, Gemini en Perplexity gevraagd in plaats van aan Google.

Nulmeting dezelfde dag, tien Nederlandse vragen aan Gemini (Pro-account, handmatig ingetypt omdat Gemini geautomatiseerde invoer weigerde):

- Carve kwam in geen enkel antwoord voor.
- Op "ken je de app Carve AI" antwoordde Gemini met een enterprise-AI-platform, een datatool, een notulen-app en een ski-coach. De fitness-app bestaat voor het model niet.
- Algemene vragen ("welke app om calorieën te tellen", "alternatief voor MyFitnessPal") gaan naar Mijn Eetmeter, MacroFactor, Cronometer, FatSecret, YAZIO en MyFitnessPal. Daar win je niet van als kleine app.
- Specifieke vragen laten wel ruimte. Op "eten en workouts in één app" antwoordde Gemini dat zo'n app niet goed bestaat en dat je er twee moet combineren. Op "AI-coach die mijn eetdagboek leest" noemde hij kleine apps als Cora en FitnessGrid. Op "welke spieren sla ik over" Fitbod, Hevy en SmartGym.
- Als bron citeerde Gemini onder meer blogs van Odido en Ben.

Search Console gaf over 90 dagen 24 vertoningen, waarvan 18 op "carve ai" op gemiddelde positie 7. De site heeft één pagina met inhoud (`/app`, plus `/nl/app`).

## Beslissing

**Er komen drie Nederlandse pagina's, elk het antwoord op één vraag waarop Carve iets te zeggen heeft. Niet meer.**

1. De paden zijn de vraag in gewone woorden: `/nl/eten-en-training-in-een-app`, `/nl/welke-spieren-sla-ik-over`, `/nl/ai-coach-die-je-eetdagboek-leest`.
2. Elke pagina opent met de vraag als kop en het antwoord in de eerste zin, met de vaste omschrijving "Carve AI is een iPhone-app die je eten en je training bijhoudt". Een model citeert vooral de alinea onder een kop die op de vraag lijkt.
3. Elke pagina noemt eerlijk welke andere apps hetzelfde doen en waar die beter zijn. Een claim over een concurrent komt er alleen in als hij op diens eigen site of in de App Store te controleren is.
4. Elke pagina heeft vijf vragen met antwoorden als `FAQPage`-structured data.
5. De teksten staan in `lib/vraagpaginas.ts`, één object per pagina onder een gedeeld type, zoals TDR-0012 dat voor de marketingpagina deed. Eén component rendert ze; één route (`app/nl/[vraag]`) met `dynamicParams = false` serveert alleen de paden die in die lijst staan.
6. De structured data van alle pagina's, ook `/app` en `/nl/app`, gebruikt dezelfde omschrijving uit één constante. Dat is het antwoord op het naamprobleem: een model moet Carve AI de fitness-app kunnen loskoppelen van de andere Carves.
7. `/nl/app` linkt onderaan naar de drie pagina's en de sitemap noemt ze.

## Alternatieven afgewogen

| Alternatief | Waarom niet |
|---|---|
| **Veel pagina's, één per zoekterm** | Google straft massaal gemaakte pagina's sinds 2024 af, en een model citeert de pagina met het beste antwoord, niet de site met de meeste. Drie goede pagina's zijn meer waard dan dertig dunne. |
| **Pagina's over algemene vragen** ("hoeveel calorieën moet ik eten") | Daar staan het Voedingscentrum en de grote apps. De nulmeting laat zien dat een kleine app alleen in het antwoord komt als de vraag specifiek genoeg is. |
| **De publieke wiki terugzetten** (zie TDR-0005, punt 6) | Een wiki bouwt autoriteit op het onderwerp, maar dat duurt maanden en beantwoordt "welke app" niet. Er komt later een nieuwe wiki; die is een eigen beslissing. |
| **Engels eerst** | Grotere markt, maar in het Engels concurreer je met jaren aan lijstjes en reviews. In het Nederlands zijn er maar een handvol bronnen die een model kan citeren. |
| **De teksten per pagina in de JSX** | Sneller voor drie pagina's, maar dan is er geen plek voor een test die ziet dat een antwoord leeg is of de merkzin mist, en de Engelse variant wordt een kopie. |

## Consequenties

- Dit is een meting en geen gok alleen als de meting herhaald wordt. Dezelfde tien vragen gaan over een maand opnieuw naar Gemini, en liefst ook naar ChatGPT en Perplexity. De vragen staan in `docs/marketing/ai-vindbaarheid.md`.
- `/nl/` bevat nu meer dan de marketingpagina. Een latere `[lang]`-herstructurering (TDR-0012, "hoe overrulen") moet deze pagina's meenemen.
- **Verhouding tot de wiki die later komt.** Vraagpagina's gaan over de app ("welke app doet X"), wiki-artikelen over kennis ("hoeveel eiwit heb ik nodig"). De vraagpagina's blijven onder `/nl/` en schuiven niet onder `/wiki/`. Wiki-artikelen mogen naar een vraagpagina linken waar het onderwerp overlapt.
- Buiten deze repo: de App Store-ondertitel hoort dezelfde omschrijving te dragen, en vermeldingen op sites die modellen citeren (Odido- en Ben-blogs, lijstjes, Reddit) wegen waarschijnlijk zwaarder dan deze pagina's. Dat is werk voor Furkan, geen code.
- TDR-0012 punt 6 ("screenshots blijven Engels omdat de app dat is") klopt niet meer: de iOS-app heeft een volledige Nederlandse vertaling. De vraagpagina's gebruiken voorlopig de bestaande screenshots; Nederlandse exports kunnen erbij zodra ze er zijn.

## Hoe overrulen

Een opvolger zou moeten laten zien dat de pagina's na drie maanden niets opleveren: geen vertoningen in Search Console op hun vragen en geen vermelding in de herhaalde meting. Dan zijn ze onderhoud zonder opbrengst en kunnen ze weg met een 301 naar `/nl/app`.

Een vierde pagina hoort alleen bij te komen met een vraag uit een meting waarop Carve een specifiek antwoord heeft, niet omdat het patroon er nu eenmaal is.

## Synchronisatie

- `lib/vraagpaginas.ts` ↔ `app/sitemap.ts`: de sitemap leest de paden uit de lijst, niet uit een eigen kopie
- `lib/vraagpaginas.ts` ↔ `lib/vraagpaginas.test.ts`: de test is de enige die een lege of merkloze pagina ziet
- `lib/marketing-seo.ts` (`APP_OMSCHRIJVING`) ↔ alle pagina's met structured data
- Claims over concurrenten ↔ hun eigen site: bij een herziening opnieuw nakijken
