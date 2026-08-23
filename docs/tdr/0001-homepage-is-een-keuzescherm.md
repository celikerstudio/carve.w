# TDR-0001 — De homepage is een keuzescherm, geen marketingpagina

- **Status:** Voorgesteld
- **Datum:** 2026-08-23
- **Beslisser:** Furkan
- **Raakt:** `app/(landing)/page.tsx`, `components/landing/*`, `app/demo/page.tsx`, `components/chat/AppSwitcher.tsx`, `docs/landing-page-brief.md`, nieuwe route `/how-it-works`

## Context

`carve.wiki/` is vandaag vier blokken: `LandingNav`, `LandingHero`, `LandingDemo` (een animerende chatdemo die zichzelf afspeelt) en `LandingCTA`. Daarna houdt de pagina op. `docs/landing-page-brief.md` beschrijft elf secties; drie daarvan staan er. De componenten voor de rest (`Footer`, `WaitlistForm`, `HiscoresWidget`, `ActivityFeed`, `DetailedFeatureSection`, `HeroSection`) staan ongebruikt in `components/landing/` en worden nergens geïmporteerd.

Los daarvan is de copy uit de pas gaan lopen met het product. De site verkoopt vier apps waaronder een **Inbox**, en een character sheet met de stats Body, Wealth, Mind en Discipline. Carve AI (`~/Developer/Carve-AI`, native iOS, zelfde Supabase-project `siuvfclwtfhrpfjuhmtx`) heeft vier tabs: Health, Money, Life en Vrienden, met de coach als thuisbasis zodra geen tab geselecteerd is. Mail bestaat wel (`mail-poll`, `mail-process`, `mail-sync`) maar draait op de achtergrond en vult de domeinen; het is geen scherm. De munt van de sociale laag is de **Weekscore** (som van tien hypertrofiebalken over een rollend venster, ADR-020/021 in die repo), niet vier levensstats. Money en Life zijn omgekeerd juist onderverkocht: er is een echte bankkoppeling via Enable Banking, AI-categorisatie, een uitgavenkaart tegen je eigen bestedingspatroon, en Life is sinds ADR-018 opgebouwd rond "Komt eraan" en "Beleefd".

De aanleiding is `ilvlup.ai`. Die homepage is geen marketingpagina maar een keuzescherm: één vraag, drie kaarten, één regel bewijs, een login-link. Dat werkt daar omdat de klik binnen zestig seconden gratis een score oplevert zonder account.

Twee dingen liggen daarmee voor. Wat is de vorm van de homepage, en waar gaan de kaarten over.

## Beslissing

### 1. De homepage is een keuzescherm

`/` toont een kop, een set kaarten, één regel bewijs en een login-link. Geen scrollende marketingpagina. Wie hier landt kiest een richting en gaat de demo in.

### 2. De kaarten spiegelen de domeinen van de app, niet de pijn van de bezoeker

Kop: "Where do you want to start?". De kaarten heten zoals de app ze noemt (Health, Money, Life), met een feitelijke ondertitel in plaats van een probleemstelling.

De reden is de drift hierboven. Een homepage die de app spiegelt kan alleen verouderen als de app verandert, en dan is de correctie zichtbaar op één plek. Een homepage die pijnpunten benoemt is een tweede product-verhaal dat naast het echte gaat staan, en dat is precies wat er de afgelopen maanden is gebeurd.

### 3. De kaarten komen uit dezelfde bron als de AppSwitcher

`components/chat/AppSwitcher.tsx` draagt vandaag de lijst domeinen (`health`, `money`, `life`, met `inbox` uitgecommentarieerd). Die lijst wordt de bron voor beide oppervlakken. Een domein toevoegen of hernoemen raakt dan de app en de homepage tegelijk, en kan niet half gebeuren.

### 4. Drie kaarten, niet vier

Vrienden is een tab in de iOS-app maar staat niet in de web-AppSwitcher; `/social` bestaat wel als losse route. De homepage toont wat de web-client kan waarmaken. De vierde kaart komt zodra Vrienden een domein in de switcher is.

### 5. De klik gaat naar een interactieve demo, niet naar signup

`/demo?d=<id>` opent de echte chat-shell op demo-data: het gekozen domein actief, het rechterpaneel op dat domein, en je kunt zelf typen. Signup komt pas als je iets wilt bewaren.

Zonder deze stap is het keuzescherm een CTA-knop met drie labels. Carve vraagt bij signup om een bankkoppeling en gezondheidsdata, wat het tegenovergestelde is van "gratis in zestig seconden". De demo is wat dat gat dicht.

### 6. De uitleg verhuist naar `/how-it-works`

De inhoud van `docs/landing-page-brief.md` (de domeinen uitgebreid, cross-domain-voorbeelden, hoe het werkt) hoort op een eigen pagina, bereikbaar vanaf de proof-regel en de nav. De `/carve/*`-pagina's die er al staan zijn daarvoor de basis.

### 7. De site beschrijft alleen wat de web-client kan

HealthKit, de barcodescanner, foto-loggen, de Live Activity en de widget bestaan niet in een browser. Web en iOS zijn gelijkwaardige clients op één backend, dus de site mag geen belofte doen die alleen op de telefoon waar is. Waar een functie iOS-only is, staat dat erbij.

## Alternatieven afgewogen

| Alternatief | Waarom afgevallen |
|---|---|
| **De brief afbouwen** (elf secties, hero met productmockup, cross-domain, character sheet, waitlist) | Het is de meeste bouw van alle opties en het levert het verhaal op dat nu al niet meer klopt. De character sheet in de brief bestaat niet in het product. |
| **Kaarten als pijnpunten in de ik-vorm** ("I don't know where my money goes") | Sterker voor koud verkeer, en het past beter bij de vraag in de kop. Afgevallen omdat het een tweede vocabulaire introduceert naast dat van de app, en dat is de bron van de drift die deze TDR opruimt. Blijft de eerste kandidaat als blijkt dat advertentieverkeer op de domeinnamen niet converteert. |
| **Vier kaarten inclusief Vrienden** | De Weekscore en crews zijn het enige dat geen concurrent heeft. Afgevallen omdat Vrienden geen domein is maar een blik op je training (ADR-020 §5 in Carve-AI), en die modelbreuk staat dan meteen op de homepage. Bovendien bestaat het op web nog niet. |
| **Kaart gaat direct naar `/signup?start=<id>`** | Goedkoopst. Afgevallen omdat de bezoeker dan blind koopt: hij moet zijn bank koppelen voordat hij iets gezien heeft. |
| **Kaart gaat naar `/carve/<domein>`** | Die pagina's bestaan al. Afgevallen omdat het het probleem alleen verplaatst; dan moeten die pagina's overtuigen en die zijn niet daarvoor geschreven. |
| **De site als etalage voor de App Store** | Het eerlijkst tegenover waar de diepte zit. Afgevallen: web is bewust een volwaardige client op dezelfde backend, en dan is web-signup de hoofdroute. |

## Consequenties

- ✅ De homepage kan alleen nog verouderen als de app verandert, en dan op één plek.
- ✅ De animerende chatdemo verhuist van de homepage naar achter de klik. Daar is hij bewijs in plaats van decoratie, en daar mag hij interactief worden.
- ✅ De ongebruikte componenten in `components/landing/` krijgen een bestemming of gaan weg. Nu is niet te zien welke van de veertien nog leven.
- ⚠️ Koud verkeer krijgt geen enkele uitleg vóór de klik. Eén regel bewijs onder de kaarten moet dragen wat elf secties droegen. Dit is de zwakste plek van deze keuze en het eerste dat je zou meten.
- ⚠️ De demo is nieuw werk en het meeste van deze TDR. Een demo die minder overtuigt dan de huidige zelf-afspelende animatie maakt de pagina slechter, niet beter.
- ⚠️ `app/demo/page.tsx` is nu een fitness-dashboard in lichte kleuren met `robots: noindex`. Dat wordt vervangen, dus wie die URL ooit ergens gedeeld heeft landt op iets anders.
- ⚠️ SEO: `/` draagt straks vrijwel geen tekst. De vindbaarheid verhuist mee naar `/how-it-works` en `/wiki`.

## Hoe overrulen

Een opvolger-TDR zou moeten laten zien dat het keuzescherm koud verkeer niet vasthoudt: bezoekers die op `/` landen en klikken zonder de demo af te maken, of die helemaal niet klikken. De meting is de klikratio op de kaarten en de doorloop van demo naar signup. Blijkt de bezoeker uitleg nodig te hebben vóór de keuze, dan is de weg terug niet de brief van elf secties maar de pijn-variant uit de alternatieventabel, met dezelfde vorm.

## Synchronisatie

- `components/chat/AppSwitcher.tsx` is de bron van de domeinlijst. Elke lezer daarvan draagt een `@ai-sync` naar die file.
- `docs/landing-page-brief.md` beschrijft een pagina die niet meer gebouwd wordt. De brief blijft staan als bron voor `/how-it-works`, met een verwijzing naar deze TDR bovenaan.
- De domeinnamen en accentkleuren op de site moeten gelijk blijven aan `L10n.DomainTitle.*` in Carve-AI. Loopt dat uiteen, dan heten dezelfde dingen op twee plekken anders.
