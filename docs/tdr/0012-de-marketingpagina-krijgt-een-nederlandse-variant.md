# TDR-0012 — de marketingpagina krijgt een Nederlandse variant op `/nl/app`

- **Status:** Voorgesteld
- **Datum:** 2026-09-14
- **Beslisser:** Furkan
- **Gerelateerd:** bouwt voort op [TDR-0007](./0007-de-marketingpagina-verhuist-naar-app.md) (de pagina staat op `/app`) · raakt de meting uit [TDR-0009](./0009-campagnerendement-komt-uit-ga4.md)
- **Raakt:** `lib/marketing-copy.ts` (nieuw), `lib/marketing-copy.test.ts` (nieuw), `app/nl/app/page.tsx` (nieuw), `app/app/page.tsx`, `app/sitemap.ts`, `components/carve/CarveMarketingPage.tsx`, `components/carve/PhoneStory.tsx`, `components/carve/MarketingHeader.tsx`, `components/carve/AppStoreDock.tsx`, `components/carve/CarveFooter.tsx`, `components/carve/muscle-week.ts`

## Context

De Google Ads-campagnes staan op Nederland. Op 2026-09-14 bleek uit het zoektermenrapport dat een flink deel van de zoekopdrachten Nederlands is (`gratis app om af te vallen`, `kcal teller app gratis`, `gratis calorieteller`), terwijl zowel de advertenties als de landingspagina Engels waren. De advertenties gaan daarom naar het Nederlands; een Nederlandse advertentie die op een Engelse pagina uitkomt houdt de helft van dat probleem in stand, en de kwaliteitsscore rekent de landingspagina mee.

De pagina heeft nu geen enkele voorziening voor een tweede taal. Alle copy staat hardcoded in de JSX van vijf componenten, en `app/layout.tsx` zet één `<html lang="en">` voor de hele site.

Tegelijk is Nederland niet de enige markt. carve.wiki staat in de App Store-listing en in de bio-link, en dat verkeer is internationaal. De Engelse pagina moet blijven staan waar hij staat.

## Beslissing

**Er komt een Nederlandse variant van de marketingpagina op `/nl/app`. De Engelse pagina blijft op `/app` en verandert van adres niet.**

1. **Geen automatische taaldetectie.** `/app` blijft Engels, ook voor een bezoeker met een Nederlandse browser. Wie naar `/nl/app` moet, wordt daar door de advertentie naartoe gestuurd. Een redirect op `Accept-Language` maakt de bestemming van een betaalde klik onvoorspelbaar en laat Googlebot iets anders zien dan een bezoeker.
2. **De copy verhuist uit de JSX naar `lib/marketing-copy.ts`**, met één object per taal onder een gedeeld type. De vijf componenten krijgen hun teksten als parameter en bevatten zelf geen tekst meer. Een taal toevoegen is daarna één object.
3. **Een test bewaakt de vorm**, niet de opmaak: beide talen hebben dezelfde sleutels en geen enkele waarde is leeg. Een ontbrekende vertaling geeft anders geen fout, alleen een lege kop op de pagina waar het advertentiegeld landt.
4. **`<html lang>` blijft `en`; de Nederlandse pagina draagt `lang="nl"` op zijn buitenste element.** Per route een ander `lang` op `<html>` kan in Next alleen door de hele app onder een `[lang]`-segment te hangen, en dat is voor twee pagina's te veel. De `hreflang`-verwijzingen doen het werk voor Google.
5. **Beide pagina's verwijzen met `alternates.languages` naar elkaar**, en de sitemap noemt `/nl/app` naast `/app`.
6. **De screenshots en de nagebouwde telefoon-UI blijven Engels**, want de iOS-app is Engels. Een Nederlands bijschrift naast een Engels scherm is eerlijker dan een nagebouwd scherm dat doet alsof de app Nederlands is.

## Alternatieven afgewogen

| Alternatief | Waarom niet |
|---|---|
| **`next-intl` erbij** | Het standaardgereedschap, met routing en formattering inbegrepen. Voor één extra taal op één pagina is dat meer machinerie dan probleem, plus een dependency die jaren meegaat. De keuze staat open: komt er een derde en vierde taal met datums en getallen bij, dan is dit de opvolger. |
| **Een tweede component, `CarveMarketingPageNL.tsx`** | Vandaag het snelst en het raakt de bestaande pagina niet. Prijs: elke opmaakwijziging moet daarna twee keer, en dat gaat een keer niet gebeuren zonder dat iets het merkt. Precies de drift die de `@ai-sync`-conventie in deze repo moet voorkomen. |
| **`/app` detecteert de taal en stuurt door** | Vriendelijker voor organisch verkeer, maar het maakt de bestemming van een advertentieklik afhankelijk van een browserinstelling, en een redirect tussen advertentie en pagina is precies wat TDR-0007 al als prijs heeft geboekt. Eén hop is genoeg. |
| **`/app-nl` als losse pagina zonder taalstructuur** | Snelst te bouwen en niets breekt. Maar het is een doodlopend patroon: bij een derde taal begint het gerommel en `hreflang` wordt handwerk. |
| **De hele publieke site tweetalig** | De nette eindtoestand, maar `privacy` en `terms` in twee talen zijn een juridische verplichting erbij, niet een vertaling. De marketingpagina is waar het advertentiegeld landt; daar begint het. |
| **`/app` wordt Nederlands, Engels verdwijnt** | Dan verliest de App Store-listing en de bio-link hun taal. De doelgroep van de app is niet alleen Nederland. |

## Consequenties

- **De bestemming van de Google Ads-campagnes moet mee.** De uiteindelijke URL van de advertenties gaat van `carve.wiki/app` naar `carve.wiki/nl/app`. Zolang dat niet gebeurt landt Nederlandstalig advertentieverkeer op de Engelse pagina en heeft deze TDR geen effect.
- **Nederlandse bijschriften naast Engelse schermafbeeldingen.** Zichtbaar, en bewust: de app zelf is Engels. Wordt de app ooit gelokaliseerd, dan horen hier Nederlandse exports bij en vervalt punt 6.
- **`<html lang="en">` liegt op `/nl/app`.** Het buitenste element corrigeert het voor screenreaders en voor Google, maar wie de HTML leest ziet een tegenspraak. Dit is de prijs van niet herstructureren; een `[lang]`-segment lost het op zodra er een derde taal komt.
- **De copy staat niet meer in de componenten.** Wie de pagina aanpast opent voortaan twee bestanden. In ruil daarvoor is de tekst leesbaar op één plek en kan een test erbij.
- **GA4 ziet een tweede pad.** Rapporten die op `/app` filteren missen het Nederlandse verkeer. De trechter uit TDR-0009 moet beide paden meenemen.
- **De weekdagen in de scrolldemo worden vertaald** (`Mon` → `ma`), de trainingslabels (`Push`, `Pull`, `Legs`) niet: die staan zo in de app.

## Hoe overrulen

Een opvolger zou moeten laten zien dat de splitsing niet betaalt: Nederlands advertentieverkeer dat op `/nl/app` niet beter converteert naar App Store-klik dan het op `/app` deed, over genoeg klikken om niet toevallig te zijn. Dan gaat `/nl/app` weg met een 301 naar `/app` en blijft er één pagina over.

Voor de omgekeerde kant, een derde en vierde taal: dan vervalt punt 4 en gaat de hele app onder een `[lang]`-segment, met `next-intl` als serieuze kandidaat.

## Synchronisatie

- `lib/marketing-copy.ts` ↔ `lib/marketing-copy.test.ts` — de test is de enige die een ontbrekende vertaling ziet
- `app/app/page.tsx` ↔ `app/nl/app/page.tsx` — dezelfde structured data, dezelfde `hreflang`, andere taal
- `app/sitemap.ts` ↔ beide pagina's — geen taal in de sitemap die niet bestaat
- `app/layout.tsx` ↔ `app/nl/app/page.tsx` — de root zegt `en`, de pagina corrigeert dat
- De uiteindelijke URL van de Google Ads-campagnes ↔ `app/nl/app/page.tsx` — buiten deze repo, en de reden dat deze TDR bestaat
