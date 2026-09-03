# TDR-0002 — De demo achter de klik

- **Status:** Geaccepteerd. Optie A gekozen en gebouwd 2026-09-03.
- **Datum:** 2026-08-23
- **Beslisser:** Furkan
- **Volgt op:** [TDR-0001](./0001-homepage-is-een-keuzescherm.md), beslissing 5
- **Raakt:** `app/demo/page.tsx`, `components/chat/ChatLayout.tsx`, `components/chat/ChatContextPanel.tsx`, `app/api/carve-ai/chat/route.ts`, `lib/demo/sample-data.ts`, `components/landing/LandingDemo*`, een nieuwe rate-limiter

## Context

TDR-0001 maakt van `/` een keuzescherm met drie kaarten. Waar die klik heen gaat bepaalt of het keuzescherm werkt of een opgeleukte CTA-knop is.

De aanleiding was `ilvlup.ai`, waar de klik een gratis uitslag oplevert. Bij nader inzien is die belofte daar smaller dan hij leest: de wizard loopt `proof → action → analyzing → teaser → signup` (`ilvlup/app/wizard/page.tsx:33`), gratis is een teaser, en de tekstvarianten hebben helemaal geen analyse-endpoint (`:82-87` springt bij niet-fotoinvoer direct naar sjabloontekst). Het enige dat er écht draait is GPT-vision op een geüploade foto, en dat is meteen het duurste stuk.

Carve heeft het omgekeerde probleem van ilvlup. Daar geef je een foto en krijg je een oordeel. Hier vraagt signup om een bankkoppeling en gezondheidsdata, dus er is nog minder te geven en tegelijk meer te bewijzen.

### Wat er in de weg staat

Vier dingen, alle vier geverifieerd in de repo:

1. **Er is geen endpoint waar een uitgelogde bezoeker tegen kan praten.** `app/api/carve-ai/chat/route.ts:15-17` geeft `401 Unauthorized` zonder Supabase-sessie. De quota zit in de edge function via `check_chat_quota`, per gebruiker.
2. **Er is geen rem.** Nul treffers op `ratelimit`, `upstash` of `429` in de hele repo. ilvlup heeft daar wel `lib/ratelimit.ts` voor, met aparte limiters per pad. Een publiek AI-oppervlak zonder rem is een open rekening.
3. **De chat-shell eist een gebruiker.** `ChatLayout.tsx:39` neemt `userId: string` verplicht, regel 58 draait `useChatHistory(userId)`, en regel 244 geeft hem door aan `ChatContextPanel`. Het is 286 regels, dus de ingreep is overzichtelijk, maar "de echte shell hergebruiken" is wel een refactor naar een user-loze variant en geen import.
4. **Op mobiel is er geen rechterpaneel.** `ChatLayout.tsx:241` is `hidden lg:block` met een vaste `w-[280px]` op 243. Onder 1024px bestaat het niet. Koud verkeer van ads en social landt overwegend op mobiel, dus juist daar valt het contextpaneel weg dat het hele "hij kent jouw data"-verhaal moet dragen.

### Wat er wél ligt

`lib/demo/sample-data.ts` bestaat, en `components/landing/LandingDemoContext.tsx` (182 regels) rendert al de vier domeinpanelen met verzonnen data. `demo-steps.ts` bevat twee volledig uitgeschreven gesprekken. De inhoud van een demo is dus grotendeels geschreven; wat ontbreekt is dat de bezoeker zelf iets mag typen.

## Beslissing

**Optie A: scripted, geen LLM.** De simulatie die tot TDR-0001 op de homepage stond wordt de bestemming van de kaartklik, met één script per domein.

Wat zit er achter het invoerveld? Drie opties lagen voor.

### A. Scripted, geen LLM  ← gekozen

Vaste vervolgvragen als chips onder het antwoord ("En mijn budget deze maand?"), elk met een voorgeschreven antwoord. De bezoeker klikt zich door een gesprek dat al geschreven is. Het invoerveld staat er wel maar accepteert alleen die chips, of is uitgeschakeld met een uitleg.

Kosten: nul. Misbruikrisico: nul. Bouwt voort op `demo-steps.ts` dat er al is.

Nadeel: het is een betere versie van wat er nu staat, geen echte demo. Wie doorheeft dat het op rails loopt, voelt zich niet overtuigd maar bespeeld.

### B. Echte LLM achter anonieme auth

Supabase anonymous sign-in, een per-IP-limiet, een harde tokenbegroting per sessie en een kort systeemprompt dat op de demo-data zit. De bezoeker typt wat hij wil.

Kosten: reëel en moeilijk vooraf te begroten. Vereist een rate-limiter die er nog niet is, en een aparte quota-route naast `check_chat_quota`.

Nadeel: het is het duurste en het enige met een misbruikprofiel. Een publiek AI-endpoint is een gratis GPT-proxy tot je het dichttimmert.

### C. Hybride: scripted eerste beurt, LLM daarna

De eerste uitwisseling is geschreven (en dus altijd goed), daarna mag de bezoeker één of twee vrije vragen stellen tegen de echte modelaanroep, met dezelfde rem als B maar een veel kleinere begroting.

Dit was de aanbeveling. Afgevallen ten gunste van A omdat A nul kosten en nul misbruikrisico heeft en het script er al lag, en omdat C zonder rate-limiter alsnog eerst B's infrastructuur vraagt. C blijft de logische volgende stap: het invoerveld staat er al, alleen doet het nog niets.

## Wat er gebouwd is

1. **`/demo?d=<id>`** vervangt het oude fitness-dashboard. Een onbekend domein geeft 404 en geen stille terugval op health.
2. **Eén script per domein** in `demo-steps.ts`, elk kruisend naar een tweede domein binnen twee beurten. Zonder dat is de keuze op de homepage betekenisloos en draagt de demo het cross-domain-bewijs niet dat TDR-0001 van de homepage afhaalde.
3. **De inbox is uit het script.** De oude simulatie liet de coach "Scanning inbox..." doen en meldde "14 auto-handled"; dat was het meest zichtbare stuk van de drift die TDR-0001 opruimt, dus het kon niet terugkomen op de pagina waar die TDR naartoe wijst. `InboxView` is uit `LandingDemoContext` verwijderd.
4. **Het contextpaneel op mobiel.** Stond op `hidden lg:block` en bestond onder 1024px niet; het staat daar nu onder de chat.
5. **De overgang naar signup** met de bankkoppeling expliciet benoemd, en `demo_to_signup` erop.
6. **`ChatLayout` is niet aangeraakt.** De user-loze variant daarvan was nodig voor B en C; A gebruikt de bestaande demo-componenten, die nooit een `userId` kenden. Dat werk verschuift naar de TDR die het invoerveld levend maakt.

`demo_message_sent` bestaat als event maar wordt niet gevuurd: er is niets om te versturen zolang het invoerveld dood is.

## Wat de bouw aan het licht bracht

**Framer-motion bevriest in een achtergrondtab.** De browser knijpt daar `requestAnimationFrame` terwijl de `setTimeout`-keten van de demo gewoon doorloopt. Elementen die op `opacity: 0` beginnen blijven dan permanent onzichtbaar, ook nadat je terugklikt: het contextpaneel bleef hangen op `opacity: 0; translateX(-8px)` en toonde eeuwig de lege staat, en de chatberichten vanaf de vierde bleven staan op `translateY(5.5783px)`. De kaarten op de homepage zijn links, dus `/demo` in een nieuw tabblad openen is normaal gedrag. Alle drie de animaties (kaarten, paneel, berichten) draaien nu op CSS met fill-mode `both`, wat hoe dan ook op de eindstand landt. Dat is dezelfde afweging als bij het keuzescherm zelf: een JS-animatie mag niet bepalen of de inhoud zichtbaar wordt.

**`/demo` viel in de standaardtak van `layout-wrapper.tsx`** en kreeg daardoor de wiki-chrome met zoekbalk en zijbalk over de simulatie heen. `/` en `/demo` zijn nu samen één tak. De hardgecodeerde routelijst daarboven blijft een driftbron, maar dat is een eigen opruiming.

## Hoe overrulen

Bij optie B of C: als de kosten per bezoeker de waarde van een signup naderen, of als het endpoint als gratis proxy gevonden wordt. Beide zijn meetbaar vanaf dag één, dus leg de tokenkosten per demo-sessie vast in de logs.

Voor A, dat nu draait: als `demo_to_signup` structureel onder de doorloop van de oude zelf-afspelende animatie blijft. Dan is de demo geen verbetering en hoort de klik naar `/signup?start=<id>`, het terugvalpad uit TDR-0001 beslissing 5. Het tweede signaal is zachter en komt niet uit de cijfers: een script dat herkenbaar op rails loopt overtuigt niet maar voelt bespeeld. Dat is het moment voor C.
