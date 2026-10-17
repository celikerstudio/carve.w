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
| `~/Developer/content/carve/ads/projecten/` | Concat-projecten, als je met de hand monteert | nee |
| `~/Developer/content/carve/materiaal/1-schermopnames/` | echte opnames van de app | nee |
| `~/Developer/content/carve/materiaal/2-echt-beeld/` | gefilmd materiaal, per opnamedag een submap | nee |
| `~/Developer/content/carve/materiaal/3-ai-gegenereerd/` | AI-beeld, apart omdat het gelabeld moet worden | nee |
| `~/Developer/content/carve/materiaal/4-audio/` | voice-overs en muziek | nee |
| `~/Developer/content/carve/ads/export/ads/` en `6-klaar-socials/` | de exports | nee |

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

## De outro

Elke video sluit af met hetzelfde slotstuk: de kop wisselt mee met wat je ziet, de
spieren lichten op per trainingsdag, en het figuur landt in een echte schermopname.

```bash
scripts/ads/build-outro.sh beide     # nl en en, 1080x1920, 8,1s
scripts/ads/build-outro.sh nl        # alleen Nederlands
```

De teksten staan in [`scripts/ads/outro.json`](../../../scripts/ads/outro.json), de
beweging in [`frames/outro-anim.html`](../../../scripts/ads/frames/outro-anim.html).
Die pagina heeft geen eigen animaties: je roept `setTime(t)` aan en krijgt het kader
op seconde `t`. Daardoor levert elk frame altijd hetzelfde plaatje op, en dat is wat
de renderer nodig heeft.

**Waarom niet in Concat gemonteerd.** Een Concat-project bewaart per clip één waarde
voor schaal, positie en opacity; er zijn geen keyframes. De landing is juist een
schaal die over anderhalve seconde verandert, en de spiertint is een mask met
`mix-blend-mode`. Allebei bestaan ze niet in dat formaat. Concat is voor het monteren
van beeld dat er al is; dit slotstuk wordt gemaakt, niet gemonteerd.

**Waarom niet in ffmpeg.** Zelfde antwoord van de andere kant: de fades zou ffmpeg
prima doen, maar de landing met eigen easing en de gemaskeerde tint niet zonder een
filtergraph die niemand meer leest.

## Met de hand monteren in Concat

Naast de pijplijn kun je een ad met de hand bouwen in Concat. Projecten horen in
`~/Developer/content/carve/ads/projecten/`, dus in dezelfde hoofdmap als het beeld.

**Concat slaat absolute paden op naar je bestanden.** Verplaats je een map nadat je
materiaal hebt geïmporteerd, dan is het project stuk: hij zoekt op het oude pad en
vindt niets. Zet materiaal op zijn plek vóór je importeert. Is het toch misgegaan:

```bash
scripts/ads/concat-project.py repareer <projectnaam>
```

Die zoekt elk zoekgeraakt bestand op naam terug binnen de mediamap, zet het pad recht
en leest de technische gegevens opnieuw uit. Vindt hij een naam twee keer, dan laat hij
hem staan en zegt dat erbij.

### Een montage hergebruiken

Een montage die werkt wil je opnieuw kunnen doen met ander beeld. Dat gaat niet door de
projectmap te kopiëren: het project bewaart naast het pad ook de duur, framerate en
afmeting van elk bestand, en die blijven na een kopie op de oude waarden staan. Concat
rekent dan met een duur die het nieuwe bestand niet heeft, zonder te klagen.

Daarom een sjabloon. Dat is hetzelfde project met de paden eruit en benoemde *slots*
ervoor in de plaats:

```bash
scripts/ads/concat-project.py sjabloon scanfantasie-v1 scanfantasie   # maak er een
scripts/ads/concat-project.py lijst                                   # welke zijn er
scripts/ads/concat-project.py nieuw scanfantasie herfst-v1 \
  context=.../AI-20260915-01-burger-friet.mp4 \
  scherm=.../2026-09-11-hamburger-loggen.mp4 \
  scanlaag=... endcard=...
```

De slotnamen komen uit de clipnamen in de tijdlijn, dus noem je clips naar hun rol
("Scherm: foto kiezen") en niet naar het bestand. Zit er een naam naast, dan zet
`hernoem <sjabloon> <oud> <nieuw>` hem in één keer op beide plekken goed.

Bij `nieuw` wordt elk bestand opnieuw uitgelezen, en je krijgt een waarschuwing als de
tijdlijn verder loopt dan het nieuwe materiaal duurt. Dat is geen fout: je trekt de clip
daarna in Concat goed. Stil doorgaan zou het probleem zijn, want dan zie je het pas in
de export, als een bevroren laatste frame.

Een sjabloon open je niet in Concat, want de paden erin zijn geen bestanden. Wil je het
sjabloon zelf veranderen, maak er dan een project van, pas dat in Concat aan en draai
`sjabloon` opnieuw onder een nieuwe naam.

Sjablonen staan in `scripts/ads/concat-templates/` en gaan dus mee in git; het beeld
waar ze naar wijzen niet.

Niet op het bureaublad opslaan, en niet in iCloud Drive: iCloud kan bestanden van je
Mac verwijderen om ruimte te besparen, en dan breekt een project midden in het werk.
