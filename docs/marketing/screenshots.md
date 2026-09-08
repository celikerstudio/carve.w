# Screenshot-brief voor de marketingpagina

**Datum:** 2026-09-07
**Voor:** `components/carve/PhoneStory.tsx` — de vier schermen in de telefoon op carve.wiki

> Dit document zegt wélke schermen je exporteert en wat erop moet staan. Het bestaat omdat
> de set die er nu ligt de app tegenverkoopt: Nederlandse UI op een Engelse pagina, een
> dagboek dat 0 kcal toont terwijl er maaltijden onder staan, een scanscherm waarop de
> uitkomst net buiten beeld valt, en twee bestanden met een ingebakken telefoonrand die de
> pagina er een tweede keer omheen zet.

## Exportinstellingen (voor alle vier)

| | |
|---|---|
| Formaat | 1290 × 2796 (iPhone 16 Pro Max) of 1206 × 2622 (16 Pro). Allebei 9:19,5, precies de verhouding van de telefoon in de pagina. |
| Rand | **Geen.** Kaal schermbeeld, geen mockup-frame, geen schaduw, geen achtergrond. De pagina tekent de telefoon zelf. |
| Taal | **Engels.** Zet het toestel op Engels vóór je exporteert, niet alleen de app. De pagina is Engels; Nederlandse knoppen erin zeggen "dit is niet af". |
| Thema | Donker. |
| Statusbalk | Volle batterij, geen belletje met rood bolletje, geen "niet storen"-maantje. Tijd maakt niet uit, hij valt onder de dynamic island. |

**Waarom kaal en niet met rand:** `barcode.png` en `ask.png` hebben nu hun eigen iPhone-rand.
De pagina zoomt daar 12% op in om die weg te snijden (`framed` in `PhoneStory.tsx`), en dat
snijdt aan alle kanten scherm weg — onder andere de balk waar de gevonden macro's staan, de
hele belofte van dat scherm. Zodra de vier hieronder er zijn, gaat `framed` eruit.

## De vier schermen

### 1 · `log.png` — het dagboek
> Bijschrift op de pagina: *"Snap it. / Logged. — Take a picture of your plate. The AI works out the calories and macros."*

- Een dag die **gelogd is**. De teller mag níét op 0 staan, en de macro's ook niet.
- Minstens drie regels in de timeline, waarvan er één zichtbaar **van een foto** komt: met het
  fotominiatuurtje erbij, niet met een gekleurd vierkantje.
- Wat er nu misgaat: `dark-diary.png` zegt "0 of 2,200 kcal" en "0g / 0g / 0g" terwijl er
  1.050 kcal aan maaltijden onder staat. Het eerste dat een bezoeker van de app ziet is dus
  een lege app die zichzelf tegenspreekt.

### 2 · `scan.png` — de scanner op het moment dat hij raak is
> Bijschrift: *"Packet in your hand? / Scan it. — Point at the barcode. The product and its macros are filled in before you've put the packet down."*

- Het moment **ná** de herkenning: de balk met de productnaam in beeld, onderaan volledig
  zichtbaar. Nu zie je een camera op een blikje en niet de uitkomst, want die balk valt weg.
- Een gewoon boodschappenproduct. Geen energiedrank op een fitnesspagina, en liefst geen
  verpakking waar één groot vreemd merk het beeld vult.
- Het blikje recht in beeld en scherp; de scanrand van de app zichtbaar.

### 3 · `coach.png` — de chat die iets doet
> Bijschrift: *"Ask anything. / Carve adds it. — Type 'add chest and shoulders today' and it lands in the log."*

- De vraag in het Engels, en het antwoord met de **gevulde** workout-kaart: oefeningen
  erin. `ask.png` zegt nu letterlijk "Gelogd, geen oefeningen", wat leest als een lege
  workout.
- Geen leeg zwart onderaan. Scroll zo dat de kaart het scherm vult, of maak de export op
  het moment dat het toetsenbord net weg is.
- Zonder de debug-regel ("4/-1 DIT UUR") onderin.

### 4 · `week.png` — het thuisscherm met de week
> Nieuw scherm; het bijschrift schrijf ik erbij zodra de export er is.

- Het thuisscherm met het weekschema, zoals iemand het elke dag opent.
- **Zonder** Season, rang en wereldranglijst. Die staan bewust niet op de pagina (zie de
  `@ai-why` in `CarveMarketingPage.tsx`), en een screenshot die ze wél toont verkoopt weer
  iets anders dan de rest van de pagina.
- Dit is het slot van het telefoonverhaal, dus het mag het rustigste beeld van de vier zijn.

## Ook nog nodig: de twee foto's

`public/photos/before.jpg` is 720 × 960 en `now.jpg` is 528 × 704. Op een telefoon worden ze
op 60vw getoond, wat op een 3x-scherm neerkomt op ruim 770 fysieke pixels: `now.jpg` is daar
te klein voor en oogt zacht op precies het apparaat waar de bio-link geopend wordt. Lever ze
aan op **minimaal 1200px aan de lange zijde**. Dezelfde twee foto's, alleen groter.

## Wat er in de code gebeurt zodra ze er zijn

1. De vier bestanden in `public/screenshots/`.
2. In `PhoneStory.tsx`: de `image`-paden vervangen, `framed: true` bij alle twee weghalen,
   en het vierde scherm uit de `@ai-todo` erbij.
3. `object-cover` mag blijven staan: met 9:19,5 valt er niets meer weg.
4. De oude bestanden (`ask.png`, `barcode.png`, `dark-*.png`, `food-photo.png`, `legs.png`)
   kunnen dan weg. Ze staan in de git-historie als je ze terug wilt.

@ai-sync: components/carve/PhoneStory.tsx (de `SCREENS`-lijst en de `@ai-todo` daarboven)
@ai-sync: ~/Developer/Carve-AI/docs/marketing/app-store-listing.md (dezelfde schermen horen in de store-set)
