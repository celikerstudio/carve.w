# TDR-0015: de wortel kiest de taal

- **Status:** Voorgesteld
- **Datum:** 2026-09-27
- **Beslisser:** Furkan
- **Gerelateerd:** overrulet beslissing 1 van [TDR-0012](./0012-de-marketingpagina-krijgt-een-nederlandse-variant.md) · volgt uit [TDR-0014](./0014-drie-vraagpaginas-voor-ai-antwoorden.md)
- **Raakt:** `middleware.ts`, `middleware.test.ts`, `lib/taalvoorkeur.ts` (nieuw), `lib/taalvoorkeur.test.ts` (nieuw)

## Context

Wie `carve.wiki` intikt en niet is ingelogd, ging naar `/app`, de Engelse pagina. Ook met een Nederlandse browser. Op `/app` staat geen zichtbare wissel naar `/nl/app`, dus een Nederlandse bezoeker bleef in het Engels en zag ook de links naar de drie Nederlandse vraagpagina's van TDR-0014 niet.

TDR-0012 koos daar bewust voor, met twee redenen. Een advertentieklik moest altijd op dezelfde pagina landen, en Googlebot moest hetzelfde zien als een bezoeker. De advertenties zijn op 2026-09-27 gestopt, dus de eerste reden is weg. De tweede is op te lossen zonder de keuze terug te draaien.

## Beslissing

**Alleen de wortel kijkt naar de browsertaal. Nederlands gaat naar `/nl/app`, alle andere talen en geen voorkeur naar `/app`.**

1. Het gaat om `Accept-Language`, gewogen op `q`. Alleen `nl` en `en` tellen, want alleen die pagina's bestaan.
2. Zonder taalvoorkeur gaat het naar `/app`. Crawlers sturen er meestal geen mee, dus zij zien wat de hreflang als `x-default` opgeeft.
3. `/app` en `/nl/app` sturen nooit door. Een gedeelde link levert op wat er gedeeld werd.
4. De omleiding blijft een 307 (TDR-0008) en krijgt `Vary: Accept-Language`, zodat een cache de ene bezoeker niet de taal van de vorige geeft.
5. Een ingelogde bezoeker blijft op de wortel, waar de cockpit staat.

## Alternatieven afgewogen

| Alternatief | Waarom niet |
|---|---|
| **Alleen een zichtbare "Nederlands"-link op `/app`** | Kost bijna niets, maar elke Nederlandse bezoeker moet de wissel zelf vinden, en de meesten zien hem niet voordat ze weg zijn. |
| **Ook `/app` laten doorsturen op taal** | Dan komt een gedeelde Engelse link bij een Nederlander in het Nederlands uit, en ziet Googlebot op `/app` iets anders dan een bezoeker. Precies het bezwaar uit TDR-0012. |
| **Taal onthouden in een cookie** | Er is nog geen taalwissel waar een keuze vandaan kan komen. Komt die er, dan hoort de cookie vóór `Accept-Language` te gaan. |

## Consequenties

- Nederlandse bezoekers van de wortel zien `/nl/app` en daarmee de links naar de vraagpagina's.
- Iemand met een Nederlandse browser die toch Engels wil, moet `/app` intikken. Er is nog geen wissel.
- GA4 ziet meer verkeer op `/nl/app` en minder op `/app`. Dat is een verschuiving en geen groei.

## Hoe overrulen

Een opvolger zou moeten laten zien dat Nederlandse bezoekers op `/nl/app` niet vaker op de App Store-knop tikken dan ze op `/app` deden. Dan heeft de omleiding geen zin en gaat de wortel terug naar alleen `/app`.

## Synchronisatie

- `lib/taalvoorkeur.ts` ↔ `lib/marketing-seo.ts` (MARKETING_PADEN): een nieuwe taal hoort in beide
- `middleware.ts` ↔ `middleware.test.ts`: de cookie én de `Vary` moeten de omleiding overleven
