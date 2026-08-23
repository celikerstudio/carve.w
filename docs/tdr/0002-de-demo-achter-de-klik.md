# TDR-0002 — De demo achter de klik

- **Status:** Concept. De kernkeuze (§ "De open beslissing") ligt bij Furkan; de rest van dit document is de context die daarvoor nodig is.
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

## De open beslissing

Wat zit er achter het invoerveld? Drie reële opties.

### A. Scripted, geen LLM

Vaste vervolgvragen als chips onder het antwoord ("En mijn budget deze maand?"), elk met een voorgeschreven antwoord. De bezoeker klikt zich door een gesprek dat al geschreven is. Het invoerveld staat er wel maar accepteert alleen die chips, of is uitgeschakeld met een uitleg.

Kosten: nul. Misbruikrisico: nul. Bouwt voort op `demo-steps.ts` dat er al is.

Nadeel: het is een betere versie van wat er nu staat, geen echte demo. Wie doorheeft dat het op rails loopt, voelt zich niet overtuigd maar bespeeld.

### B. Echte LLM achter anonieme auth

Supabase anonymous sign-in, een per-IP-limiet, een harde tokenbegroting per sessie en een kort systeemprompt dat op de demo-data zit. De bezoeker typt wat hij wil.

Kosten: reëel en moeilijk vooraf te begroten. Vereist een rate-limiter die er nog niet is, en een aparte quota-route naast `check_chat_quota`.

Nadeel: het is het duurste en het enige met een misbruikprofiel. Een publiek AI-endpoint is een gratis GPT-proxy tot je het dichttimmert.

### C. Hybride: scripted eerste beurt, LLM daarna

De eerste uitwisseling is geschreven (en dus altijd goed), daarna mag de bezoeker één of twee vrije vragen stellen tegen de echte modelaanroep, met dezelfde rem als B maar een veel kleinere begroting.

Dit is mijn aanbeveling. De eerste indruk is gegarandeerd sterk omdat hij geschreven is, en de vrije vraag is precies het moment waarop het kwartje valt dat hij jouw data leest. Twee vragen per bezoeker is te begroten; onbeperkt typen niet.

## Wat er hoe dan ook in zit

Onafhankelijk van A, B of C:

1. **Een user-loze variant van de chat-shell.** `ChatLayout` krijgt een demo-modus zonder `userId` en zonder `useChatHistory`.
2. **Het rechterpaneel op mobiel.** Onder `lg` komt het contextpaneel als blok ónder de chat, niet weg. Zonder dat mist de helft van het verkeer het bewijs.
3. **`app/demo/page.tsx` wordt vervangen.** Nu is het een fitness-dashboard in lichte kleuren met `robots: noindex`.
4. **De overgang naar signup.** Na de demo, niet ervoor, en met de bankkoppeling eerlijk benoemd.
5. **`demo_message_sent` en `demo_to_signup`** uit TDR-0001 beslissing 8.

## Hoe overrulen

Bij optie B of C: als de kosten per bezoeker de waarde van een signup naderen, of als het endpoint als gratis proxy gevonden wordt. Beide zijn meetbaar vanaf dag één, dus leg de tokenkosten per demo-sessie vast in de logs.

Bij optie A: als `demo_to_signup` structureel onder de doorloop van de oude zelf-afspelende animatie blijft. Dan is de demo geen verbetering en hoort de klik naar `/signup?start=<id>` zoals het terugvalpad in TDR-0001 beslissing 5.
