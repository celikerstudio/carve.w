# Videowerkwijze

Van idee tot gepubliceerde ad, en wat we ervan bewaren. De pijplijn zelf staat in
[`scripts/ads/`](../../../scripts/ads/README.md).

## Waar staat wat

| Plek | Inhoud | In git |
|---|---|---|
| `docs/marketing/video/` | hoe we werken, de formats, de regels | ja |
| `docs/marketing/video/rondes/` | per ronde: hypothese, opnamelijst, prompts, hooks | ja |
| `scripts/ads/recipes/templates/` | herbruikbare formats als recept | ja |
| `scripts/ads/recipes/creatives/` | één bestand per gemaakte ad, mét resultaat | ja |
| `scripts/ads/styles/` | de stijlen | ja |
| `~/Developer/celiker-studio/carve/projecten/` | Concat-projecten, als je met de hand monteert | nee |
| `~/Developer/celiker-studio/carve/materiaal/1-schermopnames/` | echte opnames van de app | nee |
| `~/Developer/celiker-studio/carve/materiaal/2-echt-beeld/` | gefilmd materiaal, per opnamedag een submap | nee |
| `~/Developer/celiker-studio/carve/materiaal/3-ai-gegenereerd/` | AI-beeld, apart omdat het gelabeld moet worden | nee |
| `~/Developer/celiker-studio/carve/materiaal/4-audio/` | voice-overs en muziek | nee |
| `~/Developer/celiker-studio/carve/export/ads/` en `6-klaar-socials/` | de exports | nee |

Tekst en recepten in git, beeld erbuiten. Een recept van twee kilobyte beschrijft
een ad volledig; de mp4 van veertig megabyte is er een afdruk van en kan altijd
opnieuw gemaakt worden.

## De vorm van een ad

Vijf beats, in deze volgorde. Wijk er bewust van af, niet per ongeluk.

| Beat | Duur | Wat het moet doen |
|---|---|---|
| Hook | 0 - 2s | nieuwsgierigheid, herkenning of verrassing. Geen opbouw, geen sfeer |
| Context | 2 - 5s | het probleem begrijpelijk maken zonder uitleg |
| Proof | 5 - 10s | het product laten doen wat je belooft |
| Payoff | 10 - 15s | het resultaat tonen |
| CTA | slot | één actie, in verhouding tot wat je vroeg |

Een zwakke ad begint met sfeer. Een sterke begint bij het probleem van de kijker.

## Drie regels die niet ter discussie staan

1. **Het bewijs is echt.** De context mag gebouwd of gegenereerd zijn, het scherm
   van de app nooit. Nagemaakte UI, verzonnen getallen of een resultaat dat Carve
   niet oplevert: niet doen. Niet omdat het niet mag, maar omdat één kijker die het
   doorheeft de rest van je advertenties ook niet meer gelooft.
2. **Gegenereerd beeld wordt gelabeld.** TikTok verplicht een label voor realistische
   AI-content en de Ads Manager heeft daar een eigen instelling voor. Controleer de
   regels per platform vóór een campagne live gaat; ze veranderen. Daarom staat AI-beeld
   in een eigen map: zo kun je bij elke ad terugzien of er gegenereerd materiaal in zit.
3. **Geen gezondheidsclaims.** Geen beloftes over gewichtsverlies, spiergroei of
   medische uitkomsten. Carve schat en administreert, het behandelt niets.

## Verhouding echt tegenover gegenereerd

Ongeveer de helft van wat we publiceren is echt beeld: echte mensen, echt eten,
de echte app. Dat is de laag die vertrouwen draagt. Daarnaast mag een deel
gegenereerde context zijn die naar echt productbeeld toe werkt, en een klein deel
mag experimenteel zijn om te zien wat blijft hangen.

De verdeling is een richting, geen quotum. De regel eronder is wel hard: wat er ook
omheen zit, het bewijs in het midden is echt.

## Van idee tot ad

1. Schrijf de hypothese in één zin. Wat denk je dat werkt, en waarom.
2. Kies een format uit [`formats.md`](./formats.md).
3. Kopieer het bijbehorende recept uit `recipes/templates/` naar `recipes/creatives/`.
4. Film of verzamel het materiaal: schermopnames in `1-schermopnames/`, gefilmd
   beeld in `2-echt-beeld/<datum-onderwerp>/`, AI-beeld in `3-ai-gegenereerd/`.
5. Bouw: `scripts/ads/build-ad.sh scripts/ads/recipes/creatives/<naam>.json`.
6. Publiceer, en vul het `results`-blok in het recept in.

## Wat we bijhouden, en wat niet

Per ad houden we het resultaat bij in het recept zelf, onder `results`. Eén bestand
per creative, met zowel wat het was als wat het deed. Geen aparte logboeken, geen
CSV ernaast: twee plekken voor dezelfde informatie lopen gegarandeerd uit de pas.

`scripts/ads/report.sh` zet alle creatives met hun cijfers in één tabel.

Leerpunten schrijven we pas op als er iets te leren valt. Met minder dan een stuk of
vijf gepubliceerde ads met echte vertoningen is elk patroon toeval. Tot die tijd is
het invullen van conclusies erger dan geen conclusies, want je gaat erop sturen.

## Met de hand monteren in Concat

Naast de pijplijn kun je een ad met de hand bouwen in Concat. Projecten horen in
`~/Developer/celiker-studio/carve/projecten/`, dus in dezelfde hoofdmap als het beeld.

**Concat slaat absolute paden op naar je bestanden.** Verplaats je een map nadat je
materiaal hebt geïmporteerd, dan is het project stuk: hij zoekt op het oude pad en
vindt niets. Repareren kan door in `concat.json` de `path`-waarden onder `media` aan
te passen, maar voorkomen is makkelijker. Zet materiaal op zijn plek vóór je importeert.

Niet op het bureaublad opslaan, en niet in iCloud Drive: iCloud kan bestanden van je
Mac verwijderen om ruimte te besparen, en dan breekt een project midden in het werk.
