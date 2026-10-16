# Wiki-artikelen

De bron van de artikelen op carve.wiki/wiki en in de app ([TDR-0017](../../docs/tdr/0017-artikelen-uit-de-repo-met-auteur-en-bronnen.md)). De database is een kopie: wat je daar rechtstreeks aanpast, overschrijft de volgende sync.

Eén bestand per artikel: `<categorie>/<slug>.md`. De slug is het adres (`/wiki/nutrition/protein`) en wat de coach gebruikt in `[[protein]]`. Een slug hernoem je dus niet.

## Een artikel

```markdown
---
title: Protein
category: Nutrition            # Nutrition | Training | Recovery | Supplements | Mindset
summary: How much protein you need to build muscle, and when it matters.   # max 160 tekens
evidence: well-established     # well-established | expert-consensus | emerging-research
status: draft                  # draft | reviewed
tags: [protein, muscle]
citation_ids: [issn-protein-2017]   # de vaste bronnen in de app; laten staan
tease:                         # optioneel: de wazige blik onder het antwoord
  title: Do you get enough?
  line: Log your meals. Carve shows your protein for the day.
  preview: "Protein today: 96 of 144 g"
sources:
  - doi: 10.1186/s12970-017-0177-8
    claim: 1.4 to 2.0 g per kg a day is enough for most people who train.
---

## What is protein?

Protein is ... [1]

:::takeaway
Eat **1.6 to 2.2 g per kg** a day to build muscle.
:::
```

## Opmaak

Alleen wat het web en de app allebei kunnen tonen:

- `##` en `###`, alinea's, `-`-lijsten, **vet**
- `:::takeaway` (verplicht, het antwoord bovenaan) en `:::checklist` met regels als `- Label | tekst`
- `[[slug]]` of `[[slug|tekst]]` naar een ander artikel
- `[1]` voor bron 1 uit `sources`

Niet: tabellen, afbeeldingen, HTML, een `#`-kop, externe links in de tekst, andere `:::`-blokken. Je eigen ervaring komt onder een gewone kop, bijvoorbeeld `## What worked for me`.

## Van concept naar live

1. Concept schrijven. Bij elke bron alleen `doi` (of `pmid`) en `claim`.
2. `pnpm wiki:check <slug> --fill` zoekt elke bron op bij Crossref of PubMed en vult titel, auteurs, tijdschrift en jaar in. Een bron die niet bestaat blijft een fout.
3. `pnpm wiki:check <slug> --abstracts` zet per bron de bewering naast de samenvatting. Lees ze: draagt de studie wat de tekst zegt? Zo niet, dan gaat de bron eruit en wordt de zin zachter.
4. Furkan leest, past aan en schrijft zijn eigen stuk. Bij akkoord: `status: reviewed`.
5. `pnpm sync-wiki` laat zien wat er verandert, `pnpm sync-wiki --write` schrijft het. Binnen het uur staat het live, en met `status: reviewed` en een bron ook in Google.
