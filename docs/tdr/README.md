# Technical Decision Records (TDR)

> Keuzes die duur zijn om terug te draaien, vastgelegd op het moment dat we ze maken zodat we ze later niet hoeven te raden. Een TDR overrulen kan, maar vereist een opvolger-TDR met expliciete argumentatie. Niet stilletjes omkeren in een PR.

## Index

| # | Titel | Wat het vastlegt | Status |
|---|---|---|---|
| [0001](./0001-homepage-is-een-keuzescherm.md) | De homepage is een keuzescherm | `/` is geen marketingpagina maar drie kaarten die de app-domeinen spiegelen, gevoed uit `lib/domains.ts`. Uitleg verhuist naar `/how-it-works`. | Vervangen door TDR-0005 (2026-09-05) |
| [0002](./0002-de-demo-achter-de-klik.md) | De demo achter de klik | De kaartklik opent `/demo?d=<id>`: de bestaande simulatie, één script per domein, zonder LLM en zonder account. | Geaccepteerd, gebouwd 2026-09-03 |
| [0003](./0003-carve-is-de-app-pagina.md) | `/carve` is de pagina van de iOS-app | De bestaande `/carve` is de app-pagina; `/how-it-works` blijft van het web-platform. Wat achter een uitgezette vlag staat, staat niet op de pagina. | Voorgesteld 2026-09-05 |
| [0004](./0004-de-site-verkoopt-nog-een-product.md) | De site verkoopt nog één product | `DOMAINS` houdt Workouts en Food over, allebei `appId: 'health'`. Money en Life zijn uit de aanbieding; hun routes en componenten blijven staan. Overruled de premisse van TDR-0001. | Voorgesteld 2026-09-05 |
| [0005](./0005-carve-wiki-is-een-marketingpagina.md) | carve.wiki is een marketingpagina | `/` toont de app-pagina; het web-platform staat achter `SHOW_WEB_APP` en is in productie uit. Inloggen blijft, signup dicht. Vervangt TDR-0001. | Voorgesteld 2026-09-05 |

## Wanneer schrijf je een TDR?

Niet bij elke design-keuze. Wel bij keuzes die aan minstens twee van deze voldoen:

- **Raakt 10+ files of de DB-schema-shape.** Omdraaien betekent een migratie, geen refactor.
- **Trekt toekomstige keuzes mee.** De ene keuze bepaalt de vorm van de volgende tien.
- **Sluit alternatieven uit die later relevant kunnen worden.**
- **Externe-systeem-afhankelijkheid** waar wisselen kostbaar is.

Implementatiedetails (welke library, hoe een formulier eruitziet) horen niet in een TDR. Die leven in de code, met een `@ai-why` erboven.

## Vorm

1. Status, datum, beslisser en gerelateerde TDR's in de kop
2. **Context** — waarom moet hier gekozen worden, welke krachten spelen
3. **Beslissing** — de keuze, in zo precies mogelijke taal
4. **Alternatieven afgewogen** — elk afgewezen alternatief met de reden
5. **Consequenties** — wat er in de codebase en het proces verandert
6. **Hoe overrulen** — welke argumenten een opvolger zou moeten leveren
7. **Synchronisatie** — welke files in sync moeten blijven met deze keuze

Niet elke TDR heeft elk veld nodig. Een TDR die niemand leest is geen TDR.

## Verhouding tot `docs/superpowers/specs/`

Die map bevat oudere specs. Er komen geen nieuwe bij: een beslissing hoort in een TDR, het waarom van een stuk code hoort als `@ai-why` op de code-site zelf, met een deeplink naar de TDR waar dat helpt.

## Index actueel houden

Bij een nieuwe TDR: rij toevoegen aan de tabel hierboven, chronologisch op nummer. Een TDR die overruled wordt houdt zijn rij, met status "Vervangen door TDR-00XX".
