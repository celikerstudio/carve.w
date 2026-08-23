# Technical Decision Records (TDR)

> Keuzes die duur zijn om terug te draaien, vastgelegd op het moment dat we ze maken zodat we ze later niet hoeven te raden. Een TDR overrulen kan, maar vereist een opvolger-TDR met expliciete argumentatie. Niet stilletjes omkeren in een PR.

## Index

| # | Titel | Wat het vastlegt | Status |
|---|---|---|---|
| [0001](./0001-homepage-is-een-keuzescherm.md) | De homepage is een keuzescherm | `/` is geen marketingpagina maar drie kaarten die de app-domeinen spiegelen, gevoed uit `lib/domains.ts`. Uitleg verhuist naar `/how-it-works`. | Voorgesteld 2026-08-23, review verwerkt |
| [0002](./0002-de-demo-achter-de-klik.md) | De demo achter de klik | Wat er gebeurt na een kaartklik, en wat er achter het invoerveld zit (scripted, LLM, of hybride). | Concept 2026-08-23, kernkeuze open |

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
