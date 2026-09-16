# Carve ad-pijplijn

Maakt een ad uit een recept-JSON: clips knippen, normaliseren, aan elkaar
plakken, ondertitelen met whisper en exporteren naar 9:16, 1:1 of 16:9.

Alles draait lokaal. Geen abonnement, geen upload van je materiaal.

## Waar staat wat

| Map | Inhoud | In git |
|---|---|---|
| `scripts/ads/` | het gereedschap: script, recepten, templates | ja |
| `scripts/ads/recipes/templates/` | de formats als herbruikbaar recept | ja |
| `scripts/ads/recipes/creatives/` | één bestand per gemaakte ad, mét resultaat | ja |
| `scripts/ads/frames/` | HTML-templates voor hook, ondertitel en eindkaart | ja, de `.html` |
| `scripts/ads/styles/` | de stijlen: CSS die de templates overschrijft | ja |
| `scripts/ads/brand/` | logo en merkmateriaal voor overlays | ja |
| `scripts/ads/concat-templates/` | herbruikbare Concat-montages, zonder beeld | ja |
| `scripts/ads/frames/outro-anim.html` | de bewegende outro; één functie van de tijd | ja |
| `~/Developer/celiker-studio/carve/materiaal/1-schermopnames/` | echte opnames van de app, het bewijs | nee |
| `~/Developer/celiker-studio/carve/materiaal/2-echt-beeld/` | gefilmd materiaal, per opnamedag een submap | nee |
| `~/Developer/celiker-studio/carve/materiaal/3-ai-gegenereerd/` | AI-beeld, apart omdat het gelabeld moet worden | nee |
| `~/Developer/celiker-studio/carve/materiaal/4-audio/` | voice-overs en muziek | nee |
| `~/Developer/celiker-studio/carve/export/ads/` | export van betaalde advertenties | nee |
| `~/Developer/celiker-studio/carve/export/socials/` | export van organische posts | nee |
| `~/Developer/celiker-studio/carve/_werk/` | tussenbestanden, mag je altijd weggooien | nee |

Het recept is de bron van waarheid, de mp4 is wegwerpbaar. Wil je de ad
aanpassen, pas dan het recept aan en draai opnieuw. Video's van tientallen MB
horen niet in een repo, vandaar de scheiding.

Met `"transition": 0.6` vloeit de montage in de outro over, beeld en geluid
tegelijk. Zonder dat veld sluit hij hard aan.

Een recept sluit af met `"outro": "nl"` (of `en`, `nl-kort`, `en-kort`) in plaats
van een eigen `endcard`. Het bestand komt uit `export/outro/` en wordt gebouwd met
`build-outro.sh`. Staan ze allebei in een recept, dan wint de outro.

Een andere mediamap gebruiken kan met `CARVE_ADS_ROOT=/pad/naar/map`.

Hoe we hiermee werken van idee tot gepubliceerde ad staat in
[`docs/marketing/video/README.md`](../../docs/marketing/video/README.md), de formats
in [`formats.md`](../../docs/marketing/video/formats.md) ernaast.

## Gebruiken

```bash
scripts/ads/build-ad.sh scripts/ads/recipes/demo.json --ratio 9:16
scripts/ads/build-ad.sh scripts/ads/recipes/demo.json --ratio 1:1 --style clean
scripts/ads/build-ad.sh scripts/ads/recipes/demo.json --ratio 16:9 --no-captions
```

Een recept ziet er zo uit:

```json
{
  "name": "app-launch",
  "style": "bold",
  "fps": 30,
  "language": "nl",
  "captions": true,
  "hook": {
    "kicker": "Zonder handmatig tellen",
    "text": "Foto van je bord.\nMacro's in 2 seconden.",
    "duration": 1.8
  },
  "channel": "ads",
  "clips": [
    { "src": "2-echt-beeld/2026-09-16-restaurant/shot-01.mp4", "start": 0, "end": 2.5 },
    { "src": "1-schermopnames/scan.mov", "start": 1.2 }
  ],
  "endcard": {
    "text": "Carve",
    "sub": "Scan je eten, zie je macro's",
    "cta": "Gratis in de App Store",
    "duration": 2.5,
    "logo": "brand/carve-logo.png"
  }
}
```

`channel` bepaalt waar de export landt: `ads` in `5-klaar-ads/`, `social` in
`6-klaar-socials/`. Standaard `ads`.

`src` is relatief aan de mediamap, dus inclusief submap
(`1-schermopnames/scan.mov`), of een absoluut pad. `end` weglaten
betekent: tot het eind van de clip.

## De drie schermen

| Scherm | Wanneer | Waarvoor |
|---|---|---|
| `hook` | eerste ~1,8s, als laag over het beeld | de kijker vasthouden voordat hij wegscrolt |
| ondertitels | de hele montage | meekijken zonder geluid, dat is de meerderheid |
| `endcard` | laatste ~2,5s, eigen kaart | logo, belofte en de call to action |

De hook is bewust een doorzichtige laag en geen eigen kaart: zo zie je meteen
beweging in plaats van een stilstaand scherm. Hij vervaagt vanzelf aan het eind.

## Stijlen

| Stijl | Karakter | Wanneer |
|---|---|---|
| `bold` | dikke hoofdletters, harde contour | standaard, houdt stand op druk beeld |
| `clean` | gewone zinnen, geen contour, wit accent | rustig beeld, publiek dat schreeuwerige ads wegklikt |
| `punch` | ondertitel in een gekleurd blok | maximale leesbaarheid op licht of onrustig beeld |

Een stijl is één CSS-bestand in `styles/` dat na de basisopmaak wordt ingespoten
en alles kan overschrijven. Een vierde stijl toevoegen is dus een bestand
aanmaken, niet de pijplijn aanpassen.

Schaal tekst met `--cap-scale`, `--title-scale`, `--kicker-scale`, `--sub-scale`
en `--cta-scale`, nooit met `em`. De basismaten worden uit de hoogte van het
doelformaat berekend, zodat 9:16 en 16:9 dezelfde verhoudingen houden.

## De schermen zijn HTML

Hook, ondertitels en eindkaart worden niet door ffmpeg getekend maar door Chrome
gerenderd uit `frames/*.html`, en daarna als PNG over het beeld gelegd. Zo
gebruiken de ads dezelfde tokens als de app (zie `DESIGN_SYSTEM.md`) en krijg je
echte font-weights, letterspacing en afgeronde hoeken.

Wil je een scherm anders, pas dan de HTML aan. `__PLACEHOLDER__`-waarden worden
door `render-screen.py` en `render-overlays.py` ingevuld.

## Benodigdheden

```bash
brew install ffmpeg whisper-cpp jq
curl -L -o ~/.cache/whisper-cpp/ggml-small.bin \
  https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-small.bin
```

Plus Google Chrome, voor het renderen van de schermen.

De Homebrew-build van ffmpeg is gebouwd zonder libfreetype en libass, dus
`drawtext` en `subtitles` bestaan er niet. Daarom loopt alle tekst via HTML.
Dat is hier geen noodgreep: het resultaat is beter dan wat die filters geven.

## Resultaten bijhouden

Het resultaat van een ad woont in het recept zelf, onder `results`. Zo staat wat een
ad wás en wat hij déed in één bestand, en kan het niet uit de pas lopen.

```json
{
  "name": "voor-na-v1",
  "results": {
    "published": "2026-09-20",
    "platform": "tiktok",
    "placement": "paid",
    "hypothesis": "De oude route lang laten duren maakt de frustratie voelbaar",
    "spend": 25,
    "impressions": 8400,
    "hold_3s": 31.2,
    "ctr": 1.8,
    "installs": 12,
    "verdict": "winnaar",
    "note": "Wat er gebeurde, in je eigen woorden"
  }
}
```

`./report.sh` zet alle creatives met hun cijfers in één tabel. Alles onder `results`
is optioneel: wat je niet invult, toont hij als streepje.

Er is bewust geen apart logboek en geen CSV. Twee plekken voor dezelfde informatie
lopen uit de pas, en dan is de vraag welke klopt.
