---
name: wiki-artikel
description: Use when writing, rewriting, reviewing or publishing a Carve Wiki article (content/wiki/), adding a source or guideline, or editing the learning goals (leerdoelen). Covers the source-of-truth rules, the verification of every source against Crossref/PubMed, the learning goals that decide what gets written, the :::check marker, the review before publication, and the mistakes already made once.
---

# Een wiki-artikel schrijven

De Carve Wiki staat op carve.wiki/wiki en in de iOS-app. Furkan Celiker staat met zijn naam onder elk beoordeeld artikel, en het gaat over gezondheid. Een verzonnen studie of een fout getal kost zijn geloofwaardigheid en die van de app. De regels hieronder over bronnen zijn daarom geen stijlvoorkeur.

Beslissingen: [TDR-0016](../../../docs/tdr/0016-de-wiki-is-weer-publiek.md) (publieke wiki), [TDR-0017](../../../docs/tdr/0017-artikelen-uit-de-repo-met-auteur-en-bronnen.md) (repo als bron, auteur, indexregel), [TDR-0018](../../../docs/tdr/0018-de-wiki-krijgt-eindtermen.md) (leerdoelen uit richtlijnen). Overgenomen uit de werkwijze van `~/Developer/naslagwerken/.claude/skills/naslagwerk/SKILL.md`.

## Waar alles staat

| Pad | Wat |
| --- | --- |
| `content/wiki/<categorie>/<slug>.md` | De artikelen. De bron; de database is een kopie |
| `content/wiki/leerdoelen.yaml` | Wat de wiki moet uitleggen, in vier lagen. Bepaalt wat er geschreven wordt |
| `content/wiki/bronnen/richtlijnen/` | De richtlijnen waar de leerdoelen uit komen, als tekst |
| `content/wiki/bronnen/studies/` | De bronnen onder de artikelen, als tekst |
| `content/wiki/README.md` | Het bestandsformaat en de opmaak |
| `docs/wiki-review-prompt.md` | De review vóór publicatie |

## Wat schrijf je

Niet wat je zelf bedenkt: wat in `leerdoelen.yaml` staat. `pnpm wiki:dekking` laat zien welke leerdoelen nog geen artikel hebben. Volgorde: eerst `fundament`, dan `vet-verliezen` en `spier-opbouwen`, dan `naslag`.

Een leerdoel erbij? Alleen met een passage die letterlijk in een richtlijn in `bronnen/richtlijnen/` staat. Staat de richtlijn er niet, haal hem dan eerst op: `pnpm wiki:bron <doi> --richtlijn <id>`. `wiki:dekking` faalt op elke passage die niet letterlijk in de brontekst te vinden is.

Een artikel dat geen leerdoel dient, is een kandidaat om samen te voegen of uit de index te houden. Niet weggooien: de coach in de app linkt met `[[slug]]`, en samenvoegen wacht tot de app aliassen kent (TDR-0017 §7).

## Bronnen: opzoeken, niet onthouden

**Elke bewering met een getal, elke studie, elke DOI haal je eerst op.** Niet uit je geheugen, hoe zeker het ook voelt. Taalmodellen verzinnen studies die er echt uitzien: bestaande auteurs, een plausibel tijdschrift, een titel die niet bestaat. Op 2026-10-16 gaf één van de acht DOI's die ik voor `calories` uit mijn hoofd had niets terug.

1. Zet bij de bron alleen `doi` (of `pmid`) en `claim`: welke zin in de tekst hij draagt.
2. `pnpm wiki:check <slug> --fill` zoekt hem op bij Crossref/PubMed en vult titel, auteurs, tijdschrift en jaar in. Bestaat hij niet, dan blijft het een fout.
3. `pnpm wiki:check <slug> --abstracts` zet de samenvatting naast de `claim`. **Lees ze.** Bestaan is niet hetzelfde als dragen.
4. Haal van elke bron de tekst op in `bronnen/studies/` met `pnpm wiki:bron <doi>`, zodat een review tegen dezelfde tekst kijkt.

**Schrijf op wat de studie zegt, niet wat je hoopt dat hij zegt.** Twee fouten die de review van 2026-10-16 ving in `calories`:

- "Losing fast costs muscle" bij Garthe 2011. In die studie bleef de vetvrije massa van de snelle groep gelijk; de langzame groep won erbij. Geschreven: "can mean keeping less muscle".
- "Protein is what protects your muscle" bij de ISSN. Die zegt "may be required", en alleen bij getrainde, slanke mensen in een tekort. Geschreven: "helps you keep".

**Kun je iets niet verifiëren, zet het dan in `:::check`.** Die tekst gaat niet naar database, web of app, maar staat op de redactielijst van `wiki:check`. Een onzeker getal in de lopende tekst zetten is de enige echt onvergeeflijke fout: het ziet er even betrouwbaar uit als de rest. Dat geldt ook voor je eigen inschattingen ("de meeste mensen...").

**`:::check` omhult de bewering zelf, niet een notitie erover.** De schrijver van `progressive-overload` (2026-10-16) zette in een check "dit is algemene coachkennis" en liet de bewering in de tekst staan; dan gaat de onzekere zin gewoon live. Zonder bron: maak er advies van ("try a smaller step") in plaats van een feit ("stalls come sooner the longer you train"), of zet de zin zelf in de check.

PubMed geeft soms een lege samenvatting als je te snel achter elkaar vraagt (limiet van ongeveer drie per seconde). Een lege samenvatting betekent dus niet dat er geen is: probeer het opnieuw voor je concludeert.

## De opmaak

Alleen wat web én app kunnen tonen; `pnpm wiki:check` weigert de rest. Zie `content/wiki/README.md`. Waarom zo streng: de app heeft een eigen lezer (`Carve AI/App/Views/Components/Wiki/WikiArticleDetailView.swift` in Carve-AI) die alleen `#`, `##`, `###`, `-`, `*` en de blokken kent. Een tabel stond op 2026-10-16 live in `calories` en `hypertrophy` als losse streepjes, en `[[-volume]]` in `citrulline` werd "higher- volume". Een regel met "Key Takeaways" verbergt in de app alles tot de volgende kop.

## Schrijfstijl

Engels, voor iemand die wil afvallen of sterker worden, niet voor een sportwetenschapper.

- Koppen als vragen ("How many calories do you need?"). Google en de taalmodellen citeren vooral de alinea onder een kop die op de vraag lijkt.
- Het antwoord staat bovenaan in `:::takeaway`, met het getal erin.
- Leg uit waarom, niet alleen dat. Eén gedachte per alinea.
- Geen em-dash als stijlmiddel, geen "not X, but Y" als vast ritme, geen opsomming van drie als stijlmiddel, geen gladde marketingwoorden.
- Geen merkzin over Carve in de tekst (TDR-0017 §9). Carve komt alleen voor in Furkans eigen stuk, als hij dat wil.

## Furkans stuk

Furkan **leest** elk artikel voordat zijn naam eronder komt; dat is niet optioneel. Zijn **eigen stuk** (`## What worked for me`) wel (besloten 2026-10-16): alleen waar hij echt iets te vertellen heeft. Bij calorieën, tekort, eiwit, volhouden en plateaus ligt het voor de hand; bij de halfwaardetijd van cafeïne niet.

Waar het past: zet `## What worked for me` met een `<!-- FURKAN: ... -->`-notitie met de vragen die hij kan beantwoorden. Waar het niet past: laat de kop weg. Verzin nooit zelf zijn ervaring. Zolang er een notitie staat, slaat `pnpm sync-wiki` het artikel over: de app zou de notitie als tekst tonen. Wil hij bij een artikel toch niets schrijven, haal dan kop en notitie samen weg.

## Van concept naar live

Werk per cluster van ongeveer vijf artikelen uit dezelfde laag, zodat Furkan ze in één keer leest.

1. Concept schrijven, bronnen `--fill`, samenvattingen lezen, teksten bewaren met `pnpm wiki:bron`.
2. `pnpm wiki:check <slug>`: schoon op de notitie na.
3. Review met `docs/wiki-review-prompt.md`, door een agent met internettoegang. Pak bij elke bevinding eerst zelf de bron erbij voordat je iets wijzigt.
4. **Hooguit twee reviewrondes.** Na de tweede moeten *fout*, *onveilig* en *te sterk* weg zijn; *onduidelijk* en *stijl* zijn optioneel. Vindt ronde twee nog een feitelijke fout, zet die zin dan in `:::check` in plaats van een derde ronde te draaien. Waarom: een reviewer vindt altijd iets, en na twee rondes poets je stijl in plaats van feiten, tot alle artikelen hetzelfde klinken.
5. Furkan leest, schrijft eventueel zijn stuk en zegt "akkoord". Dan: `status: reviewed`.
6. `pnpm sync-wiki` (proefrun, anon-sleutel) en daarna `pnpm sync-wiki --write`. Schrijven naar de productiedatabase start Furkan zelf (`! pnpm sync-wiki --write`).

Een artikel komt alleen in Google met `status: reviewed` én minstens één bron (`lib/wiki/seo.ts`, `isIndexable`). De rest is leesbaar maar `noindex`.

## Valkuilen

- **De database niet direct bewerken.** De volgende sync overschrijft het.
- **Een slug niet hernoemen.** Dat is het adres en wat de coach gebruikt.
- **`updated_at` is de datum onder het artikel.** Elke wijziging aan tekst, titel, tags of status verzet hem; de sync schrijft daarom alleen wat echt veranderde.
- **De repo is publiek.** Volledige teksten alleen bij CC BY of CC0 (`allowsFullText`); CC BY-NC is ook "open access" maar mag er niet in. Anders de samenvatting, of een kort letterlijk citaat onder `## Passages (handmatig geciteerd)` met de URL (zoals in `aasm-srs-sleep-2015.md`). Die sectie blijft staan bij `wiki:bron --force`.
- **Dezelfde aanbeveling kan in twee tijdschriften staan.** De AASM-slaaprichtlijn verscheen in SLEEP én in JCSM. Het citaat kwam uit SLEEP terwijl het bestand de DOI van JCSM had. Controleer bij een handmatig citaat dat de DOI in de kop dezelfde publicatie is.
- **Een leerdoel mag niet meer zeggen dan zijn passage.** `wiki:dekking` controleert alleen dat de passage er staat, niet dat het `doel` er klopt mee. De review van 2026-10-16 vond zes leerdoelen die de doelgroep weglieten ("bij getrainde mensen") of iets toevoegden ("ook na slaaptekort").
- **De tags waren Nederlands** in de Engelse artikelen (voeding, spiermassa). Ze voeden de Engelse zoekvector; vervang ze bij het herschrijven door Engelse.
