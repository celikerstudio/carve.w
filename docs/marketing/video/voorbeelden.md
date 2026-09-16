# Voorbeelden uit de Meta Ad Library

Ads van concurrenten die het waard zijn om te bekijken voor je zelf iets maakt.
Bijgehouden met de hand; de lijst hoort kort te blijven.

## Hoe deze lijst tot stand komt

De Ad Library geeft geen cijfers. Geen vertoningen, geen CTR, niets waaruit je kunt
aflezen of een ad werkt. Twee dingen kun je wel zien, en die zijn samen het enige
bruikbare signaal:

1. **Hoe lang een ad al loopt.** Een creative die vier maanden aan staat, is de
   winnaar van honderd die stilletjes zijn uitgezet. Dit is het sterkste signaal.
2. **Hoeveel varianten ervan draaien.** Twintig ad-ids met dezelfde kop en dezelfde
   aanmaaktijd is niet twintig creatives; dat is één creative die over veel
   doelgroepen is uitgerold. Ook dat betekent: hier gaat budget naartoe.

Wat je er níét uit haalt is of de ad goed is. De API levert alleen de kop en een
link naar de snapshot, geen video. Kijken moet je zelf.

## De lijst

Stand van 2026-09-16. Alle vier de pagina's samen hadden op dat moment 977 actieve
ads in de library.

| Adverteerder | Kop | Loopt sinds | Waarom kijken | Link |
|---|---|---|---|---|
| Cal AI | AI Counts Your Calories for You | 2026-05-18 | Vier maanden actief, veruit de oudste in deze set. Dit is hun winnaar. | [snapshot](https://www.facebook.com/ads/library/?id=982746777500092) |
| Cal AI | Limited Time Free Trial 👉 | 2026-09-14 | Dezelfde creative op tientallen ad-ids binnen één seconde aangemaakt. Zo ziet opschalen eruit. | [snapshot](https://www.facebook.com/ads/library/?id=966686979789036) |
| FoodAmigo | 🍳 Same Egg. Big Difference. | 2026-09-14 | Hook die met het eten begint en niet met de app. Dichtst bij onze "scanfantasie". | [snapshot](https://www.facebook.com/ads/library/?id=2537351683356436) |
| FoodAmigo | 🍔 Your Food Has Numbers | 2026-09-14 | Zelfde idee, andere formulering. Ze testen de hook, niet de montage. | [snapshot](https://www.facebook.com/ads/library/?id=1569367148297462) |
| FoodAmigo | Scan Your Food in Seconds ✨ | 2026-09-14 | De snelheidsbelofte kaal. Vergelijk met onze `snelheid.json`. | [snapshot](https://www.facebook.com/ads/library/?id=1408075394853829) |
| Calife | Pierde peso / Gå ner i vikt / Tab dig | 2026-09-15 | Eén creative, per taal opnieuw uitgezet. Interessant als we buiten Nederland gaan. | [snapshot](https://www.facebook.com/ads/library/?id=1514012887149665) |

## Wat opvalt

**Iedereen test de hook, niemand test de montage.** FoodAmigo draait vijf koppen op
wat er verder hetzelfde uitziet. Dat is precies de volgorde die wij ook aanhouden:
de eerste anderhalve seconde beslist, de rest volgt.

**De weg naar binnen is gewicht, niet gemak.** Cal AI en Calife beloven allebei
afvallen. Dat pad is voor ons dicht: geen claims over gewicht of gezondheid, zie de
regels in [`README.md`](./README.md). Onze hoek is de moeite die eraf gaat, en dat
is een smallere belofte. Het is ook een eerlijkere.

**Geen enkele van deze ads laat de app lang zien.** Het eten is in beeld, de telefoon
maar heel kort. Onze regel dat het bewijs een echte schermopname moet zijn, botst
daar niet mee, maar hij zegt wel: hou dat stuk kort.

## Bijwerken

```
mcp__meta-ads__ads_library_search, page_ids:
  311353912066626   Cal AI
  1271969485995148  Cal AI (tweede pagina)
  1310955675427522  AI Calorie Tracker: FoodAmigo
  1144060022134098  Calife: AI Calorie Tracker
```

Zoeken op trefwoord levert vooral rommel op: de library matcht breed en je krijgt
advertenties voor romannetjes terug. Zoek op `page_ids`.
