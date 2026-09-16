# AI-beeld genereren

Hoe we gegenereerd beeld inzetten voor Carve, wat je in een prompt zet, en waar de
grens ligt. Hoort bij [de videowerkwijze](./README.md) en
[de formats](./formats.md).

## Waar AI-beeld voor is, en waarvoor niet

Gegenereerd beeld levert de **context**: een restaurant, een keuken, een
sportschool, een bord eten op tafel, iemand die zijn telefoon pakt. Situaties die
duur of traag zijn om te filmen.

Het levert nooit het **bewijs**. Het scherm van de app is altijd een echte
schermopname. Dat is geen smaakkwestie: nagemaakte UI valt op, en zodra iemand
doorheeft dat het scherm verzonnen is, gelooft hij de rest van je advertenties ook
niet meer. De winst van één mooie shot weegt daar niet tegenop.

Praktisch: genereer de scène, knip naar het echte scherm.

## Harde grenzen

1. **Geen app-UI in gegenereerd beeld.** Ook geen vage telefoon in de verte waar
   iets op lijkt te staan. Vraag in de prompt expliciet om een leeg of afgewend
   scherm, en composite het echte scherm er later overheen.
2. **Geen logo's, geen leesbare tekst.** Generatoren maken verwrongen letters. Zet
   het in de constraints van je prompt.
3. **Geen resultaten die Carve niet levert.** Geen afvalcijfers, geen
   voor-en-na-lichamen, geen medische uitkomsten.
4. **Geen synthetische testimonials.** Een gegenereerd persoon die zegt dat Carve
   zijn leven veranderde is een verzonnen klant. Dat is een andere categorie dan
   een gegenereerd restaurant.
5. **Labelen bij publicatie.** TikTok verplicht een label voor realistische
   AI-content en de Ads Manager heeft daar een eigen instelling voor. Controleer de
   regels per platform vóór een campagne live gaat.

## Een prompt schrijven

Geen bijvoeglijke naamwoorden op een hoop. Beschrijf wat een filmploeg zou moeten
weten. Tien onderdelen, in deze volgorde:

**onderwerp + actie + omgeving + compositie + camera + licht + textuur + timing +
geluid + beperkingen**

Voorbeeld:

> Verticale 9:16 smartphone-opname. Een man van eind twintig zit aan een tafel in
> een casual restaurant met een burger en friet voor zich. Hij kijkt licht geïrriteerd
> naar zijn telefoon en legt hem dan neer. Medium close-up, natuurlijke handheld
> beweging, subtiele push-in. Realistisch restaurantlicht, warme practicals op de
> achtergrond. Geloofwaardige huidtextuur, licht imperfecte telefooncamera-belichting,
> ondiepe scherptediepte met beweging op de achtergrond. De actie is klaar binnen vijf
> seconden. Natuurlijke ruimtegeluiden en bestek. Geen zichtbare logo's, geen leesbare
> tekst, geen interface op het telefoonscherm, geen vervormde handen.

Wat die prompt goed maakt: er staat een gebeurtenis in, geen sfeer. "Licht geïrriteerd
naar zijn telefoon kijken en hem neerleggen" is te filmen. "Frustratie met
calorieën tellen" niet.

Drie regels die het meeste verschil maken:

- Schrijf de fysieke gebeurtenis vóór de esthetiek.
- Eén hoofdactie van het onderwerp plus één camerabeweging. Meer wordt rommel.
- Voor UGC-gevoel: gewone locatie, imperfecte kadrering, natuurlijke belichting.
  "Cinematic" levert precies de gelikte look die mensen als advertentie herkennen.

Splits ingewikkelde choreografie op in aparte shots. Genereer shots, geen complete
reclame; de montage doet `scripts/ads/build-ad.sh`.

## Verbeteren in stappen

Verander één laag per keer, anders weet je niet waar de verbetering vandaan kwam.

| Versie | Wat je aanpast |
|---|---|
| V1 | onderwerp en actie |
| V2 | compositie en camera |
| V3 | licht en textuur |
| V4 | continuïteit en referentiebeelden |
| V5 | geluid en montage |

## Waar je op controleert voordat je iets goedkeurt

- Handen en vingers, vooral rond de telefoon
- Tanden en ogen bij close-ups
- Eten dat van vorm verandert tijdens de shot
- Bestek en glazen die door elkaar heen gaan
- Tekst of logo's die alsnog opduiken
- Beweging die te vloeiend is voor een telefoonopname

Twijfel je, dan is het antwoord nee. `03-afgekeurd` is er precies voor.

## Waar het landt

Ruw naar `~/Developer/celiker-studio/carve/materiaal/3-ai-gegenereerd/01-ruw/`, goedgekeurde takes naar
`02-goedgekeurd/`, mislukkingen die iets leren naar `03-afgekeurd/`. Alleen uit
`02-goedgekeurd` haal je clips voor een recept.

Naamgeving: `AI-JJJJMMDD-NN-korte-omschrijving.mp4`, waarbij `NN` verwijst naar het
promptnummer hieronder. Zo hoort de prompt bij de clip zonder dat je hem twee keer
opschrijft.

## Promptbibliotheek

Deze zijn geschreven voor Carve. Pas ze aan, maar houd de beperkingen aan het eind
staan.

### 01 — Restaurant, irritatie vóór de oplossing
> Verticale 9:16 smartphone-opname. Een man van eind twintig zit aan een tafel in een
> casual restaurant met een volle maaltijd voor zich. Hij scrolt kort door zijn
> telefoon, kijkt licht geïrriteerd, legt hem neer en pakt zijn vork. Medium
> close-up, handheld, subtiele push-in. Warm avondlicht met practicals op de
> achtergrond. Geloofwaardige huidtextuur, ondiepe scherptediepte, zachte
> achtergrondbeweging van andere gasten. Actie klaar binnen vijf seconden.
> Ruimtegeluid en bestek. Geen zichtbare logo's, geen leesbare tekst, geen interface
> op het scherm, geen vervormde handen.

### 02 — Bord van bovenaf, telefoon komt in beeld
> Verticale 9:16 opname recht van boven op een houten tafel met een bord eten. Een
> hand komt van rechts in beeld met een telefoon en houdt hem boven het bord alsof er
> een foto gemaakt wordt. Locked camera, lichte handbeweging. Daglicht van opzij, zachte
> schaduwen. Realistische voedseltextuur, damp zichtbaar. Drie seconden. Keukengeluid
> op de achtergrond. Geen logo's, geen leesbare tekst, telefoonscherm afgewend van de
> camera, geen vervormde vingers.

### 03 — Keuken, meal prep
> Verticale 9:16 opname in een gewone thuiskeuken. Vier bakjes met gekookte maaltijden
> staan op het aanrecht; een vrouw van rond de dertig sluit het laatste deksel. Medium
> shot, lichte handheld beweging, geen camerabeweging tijdens de actie. Koel
> ochtendlicht door een raam links. Realistische materialen, condens op het plastic.
> Vier seconden. Zacht keukengeluid. Geen logo's, geen leesbare tekst, geen telefoon in
> beeld, geen vervormde handen.

### 04 — Sportschool, kort en rustig
> Verticale 9:16 opname in een gewone sportschool, geen designstudio. Een man vult
> tussen twee sets door iets in op zijn telefoon en legt hem weg. Medium close-up,
> handheld, ademhaling zichtbaar. Gemengd kunstlicht, wat lensvervuiling. Realistisch
> zweet en huidtextuur. Drie seconden. Ruimtegeluid van gewichten op afstand. Geen
> logo's op kleding of apparaten, geen leesbare tekst, geen interface op het scherm.

### 05 — Surreële scan, alleen als opening
> Verticale 9:16 opname van een bord eten op een tafel, waarbij een zacht blauw
> rasterlicht over het eten trekt alsof het gescand wordt. Locked camera, het eten
> blijft stil. Donkere omgeving, het rasterlicht is de enige beweging. Realistische
> voedseltextuur onder het licht. Twee seconden. Lage elektronische toon. Geen tekst,
> geen cijfers, geen interface, geen logo's.
>
> Alleen bruikbaar als hook van twee seconden, direct gevolgd door de echte
> schermopname. Zonder die knip suggereert het een functie die zo niet werkt.

## Welke tool

We hebben er nog geen. De playbook leunt op Google Flow met Veo, wat een betaald
abonnement vereist. Er zijn alternatieven, en ze verschuiven snel.

Kies er één en blijf er een maand bij. Elke generator heeft zijn eigen zwaktes en
zijn eigen manier om erop te reageren; wisselen betekent opnieuw beginnen met leren.
Begin pas als er een format is dat organisch al iets doet, want gegenereerd beeld is
de duurste manier om te ontdekken dat je hook niet werkt.

Wat je zonder tool al kunt: schermopnames maken, met je telefoon filmen, en de
pijplijn gebruiken. Dat dekt de formats 1, 2, 4, 6, 7, 8, 10 en 11 volledig.
