# TDR-0001 — De homepage is een keuzescherm, geen marketingpagina

- **Status:** Voorgesteld
- **Datum:** 2026-08-23
- **Beslisser:** Furkan
- **Review:** onafhankelijk getoetst 2026-08-23, vóór de bouw. Dertien feitelijke correcties en vijf blokkades; alle verwerkt. De zwaarste: de domeinlijst was niet deelbaar, en het referentie-ontwerp werd omgekeerd geciteerd. Zie "Wat de review rechtzette".
- **Gerelateerd:** [TDR-0002](./0002-de-demo-achter-de-klik.md) beslist wat er achter de kaartklik gebeurt.
- **Raakt:** `app/(landing)/page.tsx`, `components/landing/*`, `lib/domains.ts` (nieuw), `components/chat/AppSwitcher.tsx`, `lib/analytics.ts`, `middleware.ts`, `components/app/app-header.tsx`, `app/hiscores/page.tsx`, `app/sitemap.ts` (nieuw), `docs/landing-page-brief.md`, nieuwe route `/how-it-works`

## Context

`carve.wiki/` is vandaag vier blokken: `LandingNav`, `LandingHero`, `LandingDemo` (een chatdemo die zichzelf afspeelt) en `LandingCTA`. Daarna houdt de pagina op. `docs/landing-page-brief.md` beschrijft elf secties; drie daarvan staan er.

Zeven van de veertien componenten in `components/landing/` zijn dood. `ActivityFeed`, `DetailedFeatureSection`, `FeatureCard`, `Footer`, `HeroSection` en `HiscoresWidget` hebben nul lezers; `WaitlistForm` heeft er één (`HeroSection.tsx:1`) en is daarmee transitief dood. De hele importketen vanaf `app/(landing)/page.tsx` loopt via `LandingPage` en raakt die zeven niet.

Los daarvan is de site uit de pas gaan lopen met het product. De gerenderde pagina verkoopt een **Inbox die in de app uitstaat**: `components/landing/demo-steps.ts:22-25` laat de coach live "Scanning inbox..." doen, `app/(landing)/page.tsx:6` zet "health, money, life, and inbox" in de OG-description, terwijl de inbox-regel in `components/chat/AppSwitcher.tsx:19` is uitgecommentarieerd met een `@ai-todo`. De brief gaat verder en beschrijft een character sheet met de stats Body, Wealth, Mind en Discipline (`landing-page-brief.md:193`); die stats bestaan nergens in de code.

Carve AI (`~/Developer/Carve-AI`, native iOS, zelfde Supabase-project `siuvfclwtfhrpfjuhmtx`) heeft vier tabs: Health, Money, Life en Vrienden, met de coach als thuisbasis zodra geen tab geselecteerd is. Mail bestaat wel (`mail-poll`, `mail-process`, `mail-sync`) maar draait op de achtergrond en vult de domeinen; het is geen scherm. De munt van de sociale laag is de **Weekscore**: de som van tien hypertrofiebalken over een rollend venster (ADR-020), sinds ADR-021 §1 in beeld gebracht als percentage (31 wordt 62%). Money en Life zijn omgekeerd juist onderverkocht: er is een echte bankkoppeling via Enable Banking, AI-categorisatie, een uitgavenkaart tegen je eigen bestedingspatroon, en Life is sinds ADR-018 opgebouwd rond "Komt eraan" en "Beleefd".

Twee kanttekeningen bij dat referentiepunt, want de web-taxonomie gaat erop leunen. De vierde tab staat in code (`MainScreenContent.swift:1088-1095`) maar `TODO.md` meldt "gebouwd, niets geverifieerd op een toestel" met eenenvijftig tests die nooit gedraaid zijn. En ADR-020 §5 noemt de Life-tab in dezelfde adem "zelf nog een placeholder (ADR-018)", terwijl ADR-018 hem juist herbouwt. De iOS-app ligt dus minder vast dan een spiegeling suggereert.

De aanleiding is `ilvlup.ai`. Die homepage is geen marketingpagina maar een keuzescherm: één vraag, drie kaarten, één regel bewijs, een login-link. Twee dingen om daarbij te zeggen, want beide worden hieronder gebruikt.

**De kaarten daar zijn pijnpunten, geen productdomeinen.** De constante heet letterlijk `STRUGGLE_OPTIONS` (`ilvlup/lib/wizard/constants.ts:34-38`), de kop is "What do you want to fix?" (`features/homepage/data/get-homepage-live.ts:17`), en er staat een `@ai-why` boven die het motiveert: *"Emotionele intake, de gebruiker herkent z'n eigen probleem in een kaart, voelt zich begrepen en is gemotiveerder om de wizard af te maken."* Wij nemen de vorm over en keren de inhoud om. Dat is een bewuste afwijking van het voorbeeld en geen steun eruit; zie de alternatieventabel.

**En "gratis binnen zestig seconden zonder account" is daar de belofteregel, niet de flow.** De wizard loopt `proof → action → analyzing → teaser → signup` (`app/wizard/page.tsx:33`). Wat gratis is, is een teaser; de volle uitslag zit achter signup.

## Beslissing

### 1. De homepage is een keuzescherm

`/` toont een kop, een set kaarten, één regel bewijs en een login-link. Geen scrollende marketingpagina. Wie hier landt kiest een richting en gaat verder.

### 2. De kaarten spiegelen de domeinen van de app, niet de pijn van de bezoeker

Kop: "Where do you want to start?", met een subtitel die de vraag afmaakt zoals ilvlup dat doet ("Pick a direction. We'll take it from there."). Zonder die subtitel vraagt de kop om een intentie terwijl de kaarten een categorie geven, en dat wringt.

De reden voor domeinen boven pijn is de drift hierboven: een homepage die de app spiegelt kan alleen verouderen als de app verandert, en dan is de correctie zichtbaar op één plek. Wees eerlijk over hoe ver dat argument draagt, zie consequenties.

### 3. De domeinlijst wordt een gedeelde dataconstante

De lijst zit vandaag als niet-geëxporteerde `const apps` in `AppSwitcher.tsx:13-20`, in een `'use client'`-bestand, met `LucideIcon`-componenten als veldwaarde. Een publieke, server-gerenderde homepage kan die zo niet lezen.

Hij verhuist naar `lib/domains.ts` als pure data: `id`, `label`, `color`, en de icoonnaam als string in plaats van een componentreferentie. `AppSwitcher` en de homepage worden allebei lezer. Model: `ilvlup/lib/wizard/constants.ts`, waar de homepage (`get-homepage-live.ts:14`) en de wizard (`app/wizard/page.tsx:47`) uit dezelfde constante lezen zonder dat er een component in het pad zit.

### 4. Drie kaarten, niet vier

Health, Money, Life. Vrienden komt erbij zodra het een domein in `lib/domains.ts` is, en dat kan pas als het op web een oppervlak heeft. Voorwaarden die eerst waar moeten zijn, naar het model van de `@ai-todo` in `ilvlup/lib/wizard/constants.ts:41-47`:

1. Vrienden staat in `lib/domains.ts` en in de AppSwitcher.
2. Er is een web-scherm dat de Weekscore en het bord toont, niet alleen `/social` achter login.
3. De demo kan een vierde verhaal vertellen zonder dat de bezoeker vrienden heeft.

### 5. De klik gaat naar `/demo?d=<id>`

Wat daar gebeurt is een eigen beslissing met een eigen kosten- en misbruikprofiel; die staat in [TDR-0002](./0002-de-demo-achter-de-klik.md). Landt 0002 niet, dan gaat de klik naar `/signup?start=<id>` en is dit keuzescherm alsnog af, alleen zwakker.

### 6. De uitleg verhuist naar `/how-it-works`

De inhoud van `docs/landing-page-brief.md` hoort op een eigen pagina, bereikbaar vanaf de proof-regel en de nav. Reken niet op een middagje: bij ilvlup is `features/how-it-works/` een pagina van ruim duizend regels met negen secties en eigen metadata. De bestaande `/carve/*`-pagina's zijn deels basis, maar minder dan het lijkt: er is `health`, `money` en `travel`, geen `life`.

### 7. De site beschrijft alleen wat de web-client kan

HealthKit, de barcodescanner, foto-loggen, de Live Activity, de widget en de hele sociale laag (crews, porren, push) bestaan niet in een browser. Waar een functie iOS-only is, draagt hij één vaste markering ("iPhone only"), en de volledige lijst leeft op één plek op `/how-it-works`, zodat het niet per pagina opnieuw geïnterpreteerd wordt.

### 8. De instrumentatie hoort bij de bouw, niet erna

Drie events in `lib/analytics.ts`, mee in dezelfde PR als het keuzescherm: `home_card_click` (met domein), `demo_message_sent`, `demo_to_signup`. Reden staat onder "Hoe overrulen": zonder deze drie is deze TDR in de praktijk onomkeerbaar.

### 9. Toegankelijkheid is hier de pagina, niet de afwerking

Een pagina die uit drie klikdoelen bestaat heeft geen ruimte voor slordigheid. Eén `h1` (de kop), kaarten als `button` en niet als `div` met `onClick`, een zichtbare focusring, en het domeinaccent nooit het enige onderscheid tussen de kaarten. `ilvlup/features/homepage/ui/homepage-screen.tsx` doet dit al goed en is de referentie.

## Alternatieven afgewogen

| Alternatief | Waarom afgevallen |
|---|---|
| **De brief afbouwen** (elf secties, hero met productmockup, cross-domain, character sheet, waitlist) | De meeste bouw van alle opties, en het levert het verhaal op dat nu al niet klopt. De character sheet erin bestaat niet in het product. |
| **Kaarten als pijnpunten in de ik-vorm** ("I don't know where my money goes") | Dit is wat het referentie-ontwerp zelf doet, mét een uitgeschreven motivering (zie context). Het is sterker voor koud verkeer en past beter bij een kop die een vraag stelt. Afgevallen op smaak en op onderhoud: domeinlabels komen uit één constante, pijncopy is handwerk dat opnieuw kan verlopen. Dat is een reëel maar bescheiden verschil, en het is de eerste kandidaat zodra `home_card_click` tegenvalt. Overweeg het als A/B in plaats van als terugvalpad; Plausible staat er al. |
| **Vier kaarten inclusief Vrienden** | De Weekscore en crews zijn het enige dat geen concurrent heeft. Afgevallen omdat het op web nog geen enkel oppervlak heeft (zie de drie voorwaarden bij beslissing 4). De modelbreuk zelf is uitdrukkelijk géén argument: ADR-020 §5 maakte in de iOS-app precies de omgekeerde afweging ("Ontdekbaarheid weegt zwaarder dan modelzuiverheid") en zette de tab er toch neer. |
| **Kaart gaat direct naar `/signup?start=<id>`** | Goedkoopst. Afgevallen als eerste keus omdat de bezoeker dan blind koopt: hij moet zijn bank koppelen voordat hij iets gezien heeft. Blijft staan als terugvalpad, zie beslissing 5. |
| **Kaart gaat naar `/carve/<domein>`** | Afgevallen omdat het het probleem verplaatst: dan moeten die pagina's overtuigen en daar zijn ze niet voor geschreven. Bovendien bestaan ze maar half: `/carve/life` is een 404 waar `components/app/app-header.tsx:37` vandaag al naartoe linkt. |
| **De site als etalage voor de App Store** | De diepte zit aantoonbaar op iOS: bankkoppeling, HealthKit, camera, Live Activity, widget, en de complete sociale laag. `Carve-AI/CLAUDE.md` §0 beschrijft het product zelf als "native iOS-app". Afgevallen omdat web-signup vandaag de enige route is die zonder App Store-review live kan, en omdat beide clients al op dezelfde backend draaien. Dit is de zwakste afwijzing in deze tabel; zie de kanttekening onder consequenties. |

## Consequenties

- ✅ De drie kaartlabels en hun kleuren kunnen alleen nog verouderen als de app verandert, en dan op één plek (`lib/domains.ts`).
- ✅ De zelf-afspelende chatdemo verhuist van de homepage naar achter de klik. Daar is hij bewijs in plaats van decoratie, en daar mag hij interactief worden.
- ✅ De zeven dode componenten in `components/landing/` krijgen een bestemming of gaan weg. Nu is niet te zien welke van de veertien nog leven.
- ⚠️ **De rest van de tekst blijft even driftgevoelig als nu**: de kop, de proof-regel, `/how-it-works`, de `/carve/*`-pagina's, `docs/landing-page-brief.md` en de OG-metadata op `app/(landing)/page.tsx:6` die nog steeds "and inbox" zegt. Sterker: door de uitleg naar `/how-it-works` te verplaatsen verhuist die tekst naar een minder bekeken pagina, waar verval lánger onopgemerkt blijft. Deze TDR lost de driftklasse dus niet op, alleen het meest zichtbare deel ervan.
- ⚠️ Koud verkeer krijgt geen enkele uitleg vóór de klik. Eén regel bewijs moet dragen wat elf secties droegen, en hij moet drie vragen tegelijk beantwoorden: wat kost dit, moet ik een account maken, en moet ik mijn bank koppelen.
- ⚠️ **De waitlist blijft ongebruikt achter.** De keten staat er compleet (`app/api/waitlist/route.ts` met Turnstile en GDPR-consent, `verify/route.ts`, eigen tabel met RLS) en `app/hiscores/page.tsx:202` linkt naar het anker `/#waitlist` dat op een kaartenscherm niet meer kan bestaan. Beslis of hij meeverhuist naar `/how-it-works` of weggaat; laat hem niet stil breken.
- ⚠️ `middleware.ts:33-37` stuurt ingelogde bezoekers op `/` door naar `/chat`. `home_card_click` meet dus per definitie alleen uitgelogd verkeer. `/demo` valt buiten de protected-lijst en is voor ingelogde gebruikers gewoon bereikbaar.
- ⚠️ SEO: er is geen `sitemap.ts` en geen `robots.txt` in deze repo. "De vindbaarheid verhuist mee naar `/how-it-works`" is zonder die twee een aanname zonder mechanisme. Een sitemap hoort bij deze bouw.
- ⚠️ `app/demo/page.tsx` is nu een fitness-dashboard in lichte kleuren met `robots: noindex`. Dat wordt vervangen (TDR-0002).
- 🔧 `components/app/app-header.tsx:37` linkt naar `/carve/life`, dat niet bestaat. Staande 404 in de hoofdnavigatie, hoort bij deze opruiming.

## Hoe overrulen

Een opvolger-TDR zou moeten laten zien dat het keuzescherm koud verkeer niet vasthoudt. De meting is de klikratio op de kaarten en de doorloop van demo naar signup.

Die meting bestaat vandaag niet: `lib/analytics.ts:12-27` kent alleen `waitlist_*`, `wiki_*` en `dashboard_*` events, en de Plausible-tag laadt alleen als `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` gezet is (`app/layout.tsx:56-64`). Daarom staat de instrumentatie als beslissing 8 in de bouw en niet in de nazorg. Een TDR die zichzelf alleen laat overrulen met cijfers die niemand verzamelt is in de praktijk onomkeerbaar, en dat is het tegenovergestelde van waar `docs/tdr/README.md` voor bedoeld is.

De drempel wordt vastgesteld zodra er twee weken data is; tot die tijd is er geen honest getal om op te schrijven. De weg terug is niet de brief van elf secties maar de pijn-variant uit de alternatieventabel, in dezelfde vorm.

## Synchronisatie

- `lib/domains.ts` wordt de bron van de domeinlijst. Elke lezer draagt een `@ai-sync` naar die file.
- `docs/landing-page-brief.md` beschrijft een pagina die niet meer gebouwd wordt. De brief blijft als bron voor `/how-it-works`, met een verwijzing naar deze TDR bovenaan.
- De domeinnamen op de site moeten gelijk blijven aan `L10n.DomainTitle.*` in Carve-AI (`Carve AI/Generated/Strings+Generated.swift`, met health, inbox, life en money). Loopt dat uiteen, dan heten dezelfde dingen op twee plekken anders.
- De Weekscore staat sinds ADR-021 §1 in procenten. Komt hij ooit op de site, dan als percentage; de opslag blijft 0 t/m 50.

## Wat de review rechtzette

De onafhankelijke review (2026-08-23, vóór de bouw) vond dertien feitelijke fouten en vijf blokkades. De belangrijkste, omdat ze de vorm van dit document veranderd hebben:

1. **De domeinlijst was niet deelbaar.** De eerste versie zei "die lijst wordt de bron voor beide oppervlakken" alsof dat gratis was. Hij is niet geëxporteerd, zit in een client-component en draagt componentreferenties. Werd beslissing 3.
2. **Het referentie-ontwerp werd omgekeerd geciteerd.** ilvlup doet pijn-first; deze TDR voerde het op als steun voor domein-first. Nu expliciet als bewuste afwijking benoemd.
3. **De demo had geen endpoint.** `/api/carve-ai/chat` geeft 401 zonder sessie en er is nul rate-limiting in de repo. Afgesplitst naar TDR-0002.
4. **De overrule-meting bestond niet.** Werd beslissing 8.
5. **De waitlist, het `/#waitlist`-anker en de `/carve/life`-404** ontbraken volledig. Staan nu in consequenties.
