# TDR-0011 — De cockpit bedient de campagnes, maar beslist ze niet

- **Status:** Voorgesteld
- **Datum:** 2026-09-10
- **Beslisser:** Furkan
- **Gerelateerd:** bouwt voort op [TDR-0009](./0009-campagnerendement-komt-uit-ga4.md) en op de waaklagen uit `d5d656e`
- **Raakt:** `lib/admin/sources/meta-write.ts` (nieuw), `lib/admin/sources/meta.ts`, `app/actions/admin/ads-control.ts` (nieuw), `components/admin/chat/AdsWatchPanel.tsx`, `components/admin/chat/AdminAdsPane.tsx`, `lib/admin/journal-store.ts`, `.env.example`

## Context

Sinds `d5d656e` staan er vier lagen op het advertentiejournaal: de meting controleren, afwijkingen signaleren, tests afsluiten en voorstellen doen. Wat er nog niet is, is de handeling zelf. Een voorstel zegt "pauzeer deze campagne", en dan ga je naar Ads Manager en doe je het daar.

Dat werkt, maar het breekt precies de aanname waarop het hele journaal rust. De `wijziging`-regel bestaat om vast te leggen wat je veranderde en wat je ervan verwachtte, en die regel komt er alleen als je hem zelf typt. Dat ga je niet doen. Niet uit onwil, maar omdat de handeling in Ads Manager gebeurt en het formulier in de cockpit staat, en niemand wisselt van scherm om iets op te schrijven wat op dat moment vanzelfsprekend voelt.

De zwakste schakel in het systeem is dus niet de analyse. Het is dat de gebeurtenis en de vastlegging op twee verschillende plekken leven. Alles wat we in de lagen eromheen hebben ingebouwd om eerlijk te blijven over ruis en over niet-gemeten campagnes, is waardeloos als de tijdlijn leeg blijft.

De tegenkracht is dat schrijfrechten op een advertentieaccount van een andere orde zijn dan alles wat de cockpit tot nu toe deed. Elk ander foutgeval in dit systeem is "een verkeerd getal op een scherm". Hier is het "een campagne staat uit" of "het dagbudget staat honderd keer te hoog". Die twee ontdek je niet door beter te lezen; die ontdek je aan het eind van de week op de factuur.

Feitelijke stand: het advertentieaccount heeft nog geen campagnes. Deze keuze wordt dus opnieuw vóór de eerste euro gemaakt, en dat is het goede moment, want de gewoonte om je verwachting op te schrijven ontstaat bij campagne één of hij ontstaat nooit.

## Beslissing

**De cockpit krijgt twee handelingen, allebei achter een knop die jij indrukt, en allebei met een verplichte verwachting die meteen in het journaal komt. Het systeem grijpt nooit uit zichzelf in.**

1. **Twee acties, en de lijst is gesloten.** Een campagne pauzeren of hervatten, en het dagbudget aanpassen. Campagnes aanmaken, creatives, doelgroepen en targeting horen hier niet. Dat is bij Meta zelf beter en elke knop die we hier bijbouwen loopt uit de pas zodra Meta zijn API verandert.

2. **Schrijven leeft in een eigen module: `lib/admin/sources/meta-write.ts`.** `lib/admin/sources/meta.ts` blijft lezen en niets anders. Er is dan precies één bestand dat geld kan uitgeven en je vindt het met één grep. Zou schrijven ertussen staan, dan is "raakt deze wijziging iets dat kan uitgeven" een vraag die je per functie moet beantwoorden.

3. **Een eigen omgevingsvariabele: `META_WRITE_TOKEN`.** Niet de scope van `META_ACCESS_TOKEN` uitbreiden. Staat de variabele er niet, dan zijn de knoppen uit met de melding erbij, precies zoals de bronnen dat vandaag al doen. Daarmee is "mag deze omgeving geld uitgeven" een controle van één regel, en krijgen lokale draaisels en preview-deploys standaard geen schrijfrechten.

   **Dit beperkt niet wat het token kan.** Scopes zitten op het token, niet op de variabele. Als `META_ACCESS_TOKEN` vandaag al `ads_management` draagt, dan draait elke leesaanroep nu al met een sleutel die campagnes kan pauzeren. Daarom hoort hierbij de aanbeveling van beslissing 4.

4. **Twee System User-tokens, een smalle om te lezen en een met `ads_management` om te schrijven.** Dit is de enige vorm die ook standhoudt als er ooit iets uitlekt, en het kost een paar minuten in Business Manager. Het is een aanbeveling en geen blokkade: met één token werkt alles, alleen is de leesweg dan ruimer dan nodig.

5. **De verwachting is verplicht en zit in het formulier.** De knop opent geen kale bevestiging maar een klein formulier met wat er verandert en wat je verwacht dat er gebeurt. Het journaal weigert een `wijziging` zonder verwachting (`lib/admin/journal.ts`), dus de UI kan niet indienen zonder. Dit is de hele reden dat deze TDR bestaat.

6. **De bevestiging toont van-naar, letterlijk.** "Dagbudget van €10,00 naar €20,00", niet "weet je het zeker". Pauzeren gooit bovendien de leerfase weg die het platform heeft opgebouwd, en dat draai je niet terug door de campagne weer aan te zetten. Dat staat bij de bevestiging.

7. **Eerst Meta, dan het journaal.** Faalt Meta, dan staat er niets in het logboek over een wijziging die nooit gebeurde. Lukt Meta wel en het journaal niet, dan zegt het scherm dat luid: doorgevoerd, niet vastgelegd, noteer het zelf. Een regel die er staat maar niet klopt is erger dan een regel die ontbreekt; dat is dezelfde redenering als de comment-conventie.

8. **Budgetten gaan in centen, met één omrekenplek en een harde bovengrens.** Meta rekent in de minor unit van de accountvaluta. Een factor honderd de verkeerde kant op is het verschil tussen vijftig cent per dag en vijfhonderd euro per dag, en geen van beide geeft een foutmelding. De veldnaam draagt de eenheid, de omrekening staat op één plek met tests eromheen, en er staat een plafond in dat je bewust moet verhogen. Dit is het enige punt in het hele systeem waar een rekenfout direct geld kost.

9. **Geen automatisch ingrijpen.** `lib/admin/proposals.ts` blijft voorstellen en niets uitvoeren. Met nul campagnes en dertien accounts zou een drempelregel beslissen op ruis, en dat is dezelfde reden waarom laag C geen winnaar aanwijst.

## Alternatieven afgewogen

| Alternatief | Waarom niet |
|---|---|
| **In Ads Manager blijven werken, cockpit blijft lezen** | Kost niets te bouwen en heeft geen schrijfrechten nodig. Valt af om de reden in de Context: dan blijft het journaal leeg, en zonder tijdlijn is elk van de vier lagen een momentopname zonder geheugen. Dit is het alternatief dat je kiest als je besluit dat het journaal het niet waard is. |
| **De scope van `META_ACCESS_TOKEN` uitbreiden** | Eén token minder om te beheren. Maar dan draait ook elke leesaanroep met schrijfrechten, en er is geen omgeving meer waar schrijven onmogelijk is. Het onderscheid tussen "kan kijken" en "kan uitgeven" is dan nergens meer af te dwingen. |
| **Automatisch pauzeren zodra een voorstel aan een drempel voldoet** | Het enige dat echt zonder jou draait, en het einddoel van laag D. Nu niet: er is geen volume, dus de drempel vuurt op ruis, en de fout kost je een campagne die wel werkte. Wordt interessant zodra er tientallen accounts per maand binnenkomen en de voorstellen aantoonbaar vaker gelijk hadden dan niet, wat je uit het journaal kunt aflezen. |
| **Alleen pauzeren, geen budget** | Kleinste schrijfrecht dat nog nut heeft, en pauzeren is de actie die direct uit een voorstel volgt. Afgewezen omdat budget aanpassen de wijziging is die je in de praktijk het vaakst doet; laat je die eruit, dan blijft juist de meest voorkomende wijziging buiten het journaal en heb je het probleem half opgelost. |
| **Het journaal eerst schrijven, dan Meta** | Dan mis je nooit een vastlegging. Maar je legt dan wijzigingen vast die niet zijn doorgevoerd, in een tabel zonder DELETE-policy. Een tijdlijn met verzonnen gebeurtenissen is erger dan een met gaten, want de eerste stuurt je actief de verkeerde kant op. |
| **Een generieke "voer dit voorstel uit"-knop** | Ziet er eleganter uit dan twee losse acties. Maar dan bepaalt de tekst van een voorstel wat er gebeurt, en die tekst wordt gegenereerd. Twee expliciete acties met eigen parameters zijn saaier en veel makkelijker te controleren. |

## Consequenties

- **De leesweg is vandaag mogelijk al te ruim.** Als `META_ACCESS_TOKEN` al `ads_management` draagt, bestaat het risico dat deze TDR beheerst nu al, zonder dat er een knop is. Beslissing 4 is daarmee geen toekomstige verbetering maar een openstaande correctie op de huidige situatie.
- **Er komt een omgevingsvariabele bij die per omgeving verschilt.** Productie krijgt hem, preview en lokaal niet. Dat betekent dat de knoppen op je eigen machine uit staan, en dat is opzet: je test hier niet mee tegen een echt account.
- **Een mislukte journaalregel wordt jouw handeling.** Het scherm zegt het, maar de correctie is met de hand. Dat is de prijs van beslissing 7 en er is geen automatische reparatie voor, want de tabel kent geen UPDATE.
- **Het budgetplafond gaat een keer in de weg zitten.** Dat is de bedoeling. Verhogen is een codewijziging en dus een moment waarop iemand ernaar kijkt.
- **Meta's API kan gedeeltelijk falen.** Een statuswijziging die Meta accepteert maar pas seconden later doorvoert, betekent dat de tabel na een verversing nog de oude waarde toont. Het scherm gaat niet zelf pollen; de journaalregel is de waarheid over wat je deed, de tabel is de waarheid over wat Meta rapporteert, en die twee mogen even uit de pas lopen.
- **Elke knop is een reden om Ads Manager niet te openen.** Dat is winst voor de vastlegging en verlies voor wat je toevallig ziet als je er tóch bent. Bewuste ruil.

## Hoe overrulen

Een opvolger die automatisch ingrijpen wil toestaan, zou uit het journaal moeten laten zien dat de voorstellen over een reeks campagnes vaker gelijk hadden dan niet, en dat er genoeg volume is dat een drempel niet op ruis vuurt. Dat is precies wat het journaal meet en het is de reden dat beslissing 9 nu een "nog niet" is en geen "nooit".

Een opvolger die de knoppen weer weghaalt, zou moeten laten zien dat de `wijziging`-regels in de praktijk tóch met de hand worden geschreven, of dat de handelingen zo zeldzaam zijn dat de schrijfrechten de moeite niet waard zijn.

## Synchronisatie

- `lib/admin/sources/meta-write.ts` is de enige plek die naar Meta schrijft; `lib/admin/sources/meta.ts` blijft lezen.
- `app/actions/admin/ads-control.ts` bewaakt de volgorde uit beslissing 7 en is de enige aanroeper van beide.
- `lib/admin/journal.ts` houdt de verplichte `verwacht` op `wijziging`; verdwijnt die eis, dan vervalt de reden voor deze TDR.
- `.env.example` documenteert `META_WRITE_TOKEN` en waar hij vandaan komt.
- De aanbeveling van twee tokens leeft in Business Manager, niet in code. Deze TDR is de enige plek waar hij staat.

## Openstaand, te toetsen bij de eerste handeling

- Draagt `META_ACCESS_TOKEN` vandaag al `ads_management`? Dat bepaalt of beslissing 4 een verbetering is of een correctie.
- Wat is de minor unit en het minimale dagbudget van dit advertentieaccount? Het plafond uit beslissing 8 moet daarboven liggen en de ondergrens van Meta zelf is per valuta anders.
