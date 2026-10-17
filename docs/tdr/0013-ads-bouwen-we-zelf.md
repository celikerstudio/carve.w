# TDR-0013 — Ads bouwen we zelf, op ffmpeg

**Status:** Voorgesteld
**Datum:** 2026-09-15
**Beslisser:** Furkan
**Gerelateerd:** TDR-0009 (campagnerendement komt uit GA4), TDR-0011 (de cockpit bedient de campagnes)

## Context

Voor Carve moeten er verticale video-advertenties komen, en niet één maar tientallen:
per voordeel meerdere hooks, per hook meerdere openingsbeelden, en van elke winnaar
weer varianten. Handmatig monteren schaalt daar niet in mee. De tiende ad kost dan
evenveel werk als de eerste.

De aanleiding was de open-source video-editor Concat, met de gedachte die te forken
tot een Carve-videogenerator. Twee dingen spraken daartegen. Het project is drie
weken oud met één ontwikkelaar, dus een fork is een gok op iemands vrije tijd. En
het staat onder AGPL-3.0: zodra zoiets een functie ín Carve wordt of achter een
webinterface komt, verplicht §13 je de broncode van het samengestelde werk vrij te
geven. Voor een app met een mogelijke exit is dat geen detail.

Belangrijker: Concat is zelf een schil om ffmpeg. De schil is precies het deel dat
niet automatiseerbaar is, want het bestaat uit knoppen.

## Beslissing

We bouwen de advertenties met een eigen pijplijn op ffmpeg en whisper, in
`scripts/ads/`. Concrete vorm:

1. **Een ad is een recept-JSON**, geen tijdlijn. Het recept beschrijft de clips met
   hun in- en uitpunten, de hook, de eindkaart en de stijl. De mp4 is een afdruk
   ervan en wordt niet bewaard in git.
2. **Alle tekst in beeld wordt door Chrome uit HTML gerenderd**, niet door ffmpeg
   getekend. De templates in `scripts/ads/frames/` gebruiken dezelfde tokens als de
   app. Directe aanleiding: de Homebrew-build van ffmpeg is zonder libfreetype en
   libass gebouwd, dus `drawtext` en `subtitles` bestaan er niet. Maar ook met die
   filters zou HTML de betere keuze zijn, want het geeft echte font-weights,
   letterspacing en afgeronde hoeken.
3. **Opmaak zit in stijlen, niet in templates.** Een stijl is één CSS-bestand in
   `scripts/ads/styles/` dat na de basisopmaak wordt ingespoten. Een nieuwe stijl
   is dus een bestand, geen wijziging aan de pijplijn.
4. **Ondertiteling draait lokaal** met whisper op de gemonteerde audio, niet per
   losse clip, zodat timestamps niet verschuiven bij het trimmen.
5. **Het resultaat van een ad woont in het recept**, onder `results`. Er komt geen
   apart logboek en geen CSV naast.
6. **Beeld staat buiten de repo**, in `~/Developer/content/carve/` (`materiaal/` en `ads/`; tot 2026-10-17 `~/Developer/celiker-studio/carve/`). Tekst en recepten in
   git, media erbuiten.

## Alternatieven afgewogen

**Concat forken.** Afgewezen om de AGPL-verplichting, de leeftijd van het project
(drie weken, één ontwikkelaar) en omdat de schil om ffmpeg juist het niet-
automatiseerbare deel is. Concat blijft geïnstalleerd als handmatige editor.

**CapCut of Premiere blijven gebruiken.** Prima voor één ad, en voor bijsturen op
gevoel nog steeds beter. Maar elke volgende ad kost hetzelfde werk, en dat is
precies wat we willen wegnemen. De twee sluiten elkaar niet uit: het recept ontstaat
door eerst één ad met de hand te maken.

**Een betaalde ad-generator.** Niet onderzocht omdat de montage hier het simpele
deel is; de kennis zit in welke hook werkt, en die koop je niet in.

**Tekst met ffmpeg's `drawtext`.** Kan niet met deze build, en zou ook met een
volledige build slechtere typografie geven. Een ffmpeg met libass bouwen uit een tap
kost een halfuur compileren en levert minder op dan de HTML-route.

**Ondertiteling via een clouddienst.** Afgewezen: whisper draait lokaal, kost niets
per minuut, en ongepubliceerd marketingmateriaal hoeft niet naar een externe server.

## Consequenties

- Nieuwe map `scripts/ads/` met het script, de recepten, de templates en de stijlen.
- Nieuwe map `docs/marketing/video/` met de werkwijze en de formats.
- Nieuwe afhankelijkheden op de werkplek, niet in de app: ffmpeg, whisper-cpp, jq,
  een whisper-model en Google Chrome. Dit raakt de build van carve.wiki niet.
- De bestandsnaam van een export (`datum-naam-stijl-ratio.mp4`) wordt de identiteit
  van een creative, ook richting de cijfers uit TDR-0009.
- Wie de opmaak van ads wil wijzigen, wijzigt CSS. Dat is bewust: de drempel om een
  variant te proberen moet laag zijn.

## Hoe overrulen

Een opvolger zou moeten aantonen dat de pijplijn in de praktijk niet gebruikt wordt
omdat het recept te ver van het monteren af staat, óf dat de handmatige route per
ad sneller blijkt zodra er echt materiaal doorheen gaat. Dat is een meting, geen
mening: tel hoeveel ads er via het script zijn gemaakt versus met de hand.

## Synchronisatie

- `scripts/ads/README.md` — het recept-schema en de resultaten
- `docs/marketing/video/README.md` — de werkwijze en de regels
- `docs/marketing/video/formats.md` — de formats en hun templates
- `DESIGN_SYSTEM.md` — de tokens die de HTML-templates gebruiken
