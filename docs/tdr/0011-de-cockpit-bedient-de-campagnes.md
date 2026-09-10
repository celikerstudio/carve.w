# TDR-0011 — De cockpit bedient de campagnes, maar beslist ze niet

- **Status:** Voorgesteld, review verwerkt 2026-09-10
- **Datum:** 2026-09-10
- **Beslisser:** Furkan
- **Gerelateerd:** bouwt voort op [TDR-0009](./0009-campagnerendement-komt-uit-ga4.md) en op de waaklagen uit `d5d656e`
- **Raakt:** `lib/admin/meta-write.ts` (nieuw), `lib/admin/sources/meta.ts`, `lib/admin/journal.ts`, `app/actions/admin/ads-control.ts` (nieuw), `components/admin/chat/AdsWatchPanel.tsx`, `components/admin/chat/AdminAdsPane.tsx`, `lib/admin/journal-store.ts`, `.env.example`

## Context

Sinds `d5d656e` staan er vier lagen op het advertentiejournaal: de meting controleren, afwijkingen signaleren, tests afsluiten en voorstellen doen. Wat er nog niet is, is de handeling zelf. Een voorstel zegt "pauzeer deze campagne", en dan ga je naar Ads Manager en doe je het daar.

Dat werkt, maar het breekt precies de aanname waarop het hele journaal rust. De `wijziging`-regel bestaat om vast te leggen wat je veranderde en wat je ervan verwachtte, en die regel komt er alleen als je hem zelf typt. Dat ga je niet doen. Niet uit onwil, maar omdat de handeling in Ads Manager gebeurt en het formulier in de cockpit staat, en niemand wisselt van scherm om iets op te schrijven wat op dat moment vanzelfsprekend voelt.

De zwakste schakel in het systeem is dus niet de analyse. Het is dat de gebeurtenis en de vastlegging op twee verschillende plekken leven. Alles wat we in de lagen eromheen hebben ingebouwd om eerlijk te blijven over ruis en over niet-gemeten campagnes, is waardeloos als de tijdlijn leeg blijft.

De tegenkracht is dat schrijfrechten op een advertentieaccount van een andere orde zijn dan alles wat de cockpit tot nu toe deed. Elk ander foutgeval in dit systeem is "een verkeerd getal op een scherm". Hier is het "een campagne staat uit" of "het dagbudget staat honderd keer te hoog". Die twee ontdek je niet door beter te lezen; die ontdek je aan het eind van de week op de factuur.

Feitelijke stand: het advertentieaccount heeft nog geen campagnes. Deze keuze wordt dus opnieuw vóór de eerste euro gemaakt, en dat is het goede moment, want de gewoonte om je verwachting op te schrijven ontstaat bij campagne één of hij ontstaat nooit.

## Beslissing

**De cockpit krijgt twee handelingen en één formulier. De handelingen zitten achter een knop die jij indrukt, het formulier legt vast wat je elders deed, en alle drie eisen een verwachting die meteen in het journaal komt. Het systeem grijpt nooit uit zichzelf in.**

1. **Twee acties, en de lijst is gesloten.** Een campagne pauzeren of hervatten, en het dagbudget aanpassen. Campagnes aanmaken, creatives, doelgroepen en targeting horen hier niet: dat is bij Meta zelf beter en elke knop die we hier bijbouwen loopt uit de pas zodra Meta zijn API verandert. Beslissing 11 vangt die wijzigingen op een andere manier op.

   **Het dagbudget staat bij Meta op de ad set, niet op de campagne**, tenzij de campagne Advantage Campaign Budget gebruikt (`campaign_budget_optimization`). De budgetknop verschijnt daarom alleen bij campagnes met een campagnebudget; bij de rest staat er waarom hij ontbreekt. Zo blijft de sleutel in het journaal het campagne-ID, gelijk aan TDR-0009 beslissing 4. Verder: een campagne met een looptijdbudget accepteert geen dagbudget, en Meta weigert een verlaging onder wat er die dag al is uitgegeven. Allebei komen als melding van Meta letterlijk op het scherm.

2. **Schrijven leeft in `lib/admin/meta-write.ts`, buiten `sources/`.** Die map betekent in deze codebase "leesbron met `SourceResult` en failure-isolatie" (`lib/admin/sources/source.ts`), en een schrijfmodule ertussen verwatert precies de helderheid die deze beslissing wil. `lib/admin/sources/meta.ts` blijft lezen en niets anders. Er is dan precies één bestand dat geld kan uitgeven en je vindt het met één grep.

   De module exporteert **exact twee functies** en `ads-control.ts` neemt een union met twee varianten. Dat is wat de gesloten lijst uit beslissing 1 gesloten houdt; zonder die grens is het over een half jaar een lijst van vijf.

   Het token gaat in de `Authorization: Bearer`-header en niet in de query-string. `lib/admin/sources/meta.ts` doet dat laatste vandaag op twee plekken; voor lezen is dat matig, voor een token met `ads_management` is het slechter, want URL's landen in proxy-, edge- en foutlogs.

3. **Een eigen omgevingsvariabele: `META_WRITE_TOKEN`.** Staat de variabele er niet, dan zijn de knoppen uit met de melding erbij, precies zoals de bronnen dat vandaag al doen. Daarmee is "mag deze omgeving schrijven" een controle van één regel, en krijgen lokale draaisels en preview-deploys standaard geen knoppen.

   **Dit beperkt niet wat het token kan.** Scopes zitten op het token, niet op de variabele. Zolang beslissing 4 niet is uitgevoerd, is deze scheiding een deploy-schakelaar in de kleren van een rechtenmodel, en niet meer dan dat.

4. **Twee System User-tokens, en dit is een voorwaarde en geen aanbeveling.** Controleer met `GET /debug_token` welke scopes `META_ACCESS_TOKEN` draagt. Staat `ads_management` erin, dan wordt hij vervangen door een token met alleen `ads_read` vóórdat er één knop live gaat. `.env.example` documenteert `ads_read`, maar dat is een comment en geen controle.

   Reden dat dit blokkerend is: draagt het leestoken schrijfrechten, dan draait elke paginarender van de cockpit met een sleutel die campagnes kan pauzeren, en dan is er geen omgeving meer waar schrijven onmogelijk is. Dat risico bestaat dan vandaag al, zonder dat er een knop is.

5. **De verwachting is verplicht, en de server bewaakt dat.** Het formulier vraagt drie dingen: wat er verandert, waarom, en wat je verwacht dat er gebeurt. Dat zijn exact de velden die `lib/admin/journal.ts` eist.

   **De server valideert de body met `parseJournalBody('wijziging', …)` vóórdat Meta wordt aangeroepen, en weigert bij een fout.** Leunen op de clientvalidatie zou betekenen dat een body die zod niet haalt een doorgevoerde budgetwijziging plus een lege tijdlijn oplevert. Een server action is bovendien een publiek HTTP-endpoint, dus de knop is niet de enige ingang.

6. **De bevestiging toont van-naar, en die "van" wordt geverifieerd.** "Dagbudget van €10,00 naar €20,00", niet "weet je het zeker".

   Het formulier stuurt de huidige waarde mee; de server leest die vlak vóór de write opnieuw bij Meta en weigert bij verschil, met de actuele waarde in de melding. Meta kent geen conditionele update, dus dit is de enige werkende vorm. Zonder die controle legt het journaal een van-naar vast die nooit heeft bestaan, bijvoorbeeld omdat er ondertussen in Ads Manager of in een tweede tab iets veranderde.

   Bij pauzeren staat erbij dat je de leerfase weggooit die het platform heeft opgebouwd. **Bij een budgetwijziging van meer dan grofweg twintig procent staat dat er ook**, want dat zet de ad set eveneens terug in de leerfase. Die leerfase leeft op ad-setniveau, wat opnieuw naar beslissing 1 wijst.

7. **Eerst Meta, dan het journaal.** Faalt Meta met een nette fout, dan staat er niets in het logboek over een wijziging die nooit gebeurde.

   Lukt Meta wel en het journaal niet, dan probeert de actie de insert nog één keer en zegt het scherm het daarna luid: doorgevoerd, niet vastgelegd. Een regel die er staat maar niet klopt is erger dan een regel die ontbreekt; dat is dezelfde redenering als de comment-conventie.

8. **Budgetten gaan in de minor unit van de accountvaluta, met één omrekenplek en een hard plafond.** De omrekenfactor wordt afgeleid uit `currency` van het advertentieaccount en niet aangenomen: er zijn valuta's zonder decimalen (JPY, KRW) waar een factor honderd juist de fout is. Een valuta die we niet kennen faalt luid in plaats van te gokken.

   Het veld heet `daily_budget_minor` zodat de eenheid in de naam zit. Een factor honderd de verkeerde kant op is het verschil tussen vijftig cent per dag en vijfhonderd euro per dag, en geen van beide geeft een foutmelding. **Het plafond is €50 per dag.** Dat is bewust laag: de eerste keer dat het in de weg zit is een codewijziging en dus een moment waarop iemand ernaar kijkt.

9. **Geen automatisch ingrijpen.** `lib/admin/proposals.ts` blijft voorstellen en niets uitvoeren. Met nul campagnes en dertien accounts zou een drempelregel beslissen op ruis, en dat is dezelfde reden waarom laag C geen winnaar aanwijst.

10. **Na de schrijfactie lezen we terug.** Na de POST wordt het object opnieuw opgehaald (`status`, `effective_status`, `daily_budget`) en gaat de **waargenomen** waarde het journaal in, niet de bedoelde.

    Een timeout, een afgebroken request of een 500 ná toepassing zijn niet te onderscheiden van "niet gebeurd". Bij een netwerkschrijfactie is dat onbepaalde geval de norm en niet de uitzondering, en zonder terugleesstap produceert beslissing 7 daar stelselmatig het omgekeerde van wat hij belooft. Lukt ook de terugleesstap niet, dan zegt het scherm dat de uitkomst onbekend is en toont het de volledige journaalregel om over te nemen.

    Het scherm toont `effective_status` en niet `status`. Een campagne op `ACTIVE` waarvan alle ad sets gepauzeerd staan, of waarvan een advertentie is afgekeurd, draait niet. "Hervat" zien staan terwijl er niets gebeurt kost je een week.

11. **Er komt ook een kaal wijzigingsformulier, zonder schrijfrechten.** Eén knop "ik heb iets veranderd", met dezelfde drie velden, die alleen het journaal schrijft.

    Beslissing 1 sluit creatives, doelgroepen en targeting uit, en juist een creatief is de wijziging met de grootste uitslag op rendement. Zonder dit formulier lost deze TDR zijn eigen premisse maar half op. Het kost geen token, geen scope en draagt geen risico, en het is daarmee het goedkoopste deel van het hele voorstel.

12. **Dubbel indienen wordt tegengehouden.** De knop staat uit tijdens verzending, en de server weigert een identieke `wijziging` op dezelfde campagne binnen vijf minuten. Bij Meta is de schade nul (status en budget zetten is idempotent), maar in een tabel zonder DELETE-policy is een dubbele regel permanent. De ontdubbeling in `lib/admin/watch.ts` geldt voor voorstellen en controles, niet hiervoor.

## Alternatieven afgewogen

| Alternatief | Waarom niet |
|---|---|
| **In Ads Manager blijven werken, cockpit blijft lezen** | Kost niets te bouwen en heeft geen schrijfrechten nodig. Valt af om de reden in de Context: dan blijft het journaal leeg, en zonder tijdlijn is elk van de vier lagen een momentopname zonder geheugen. Dit is het alternatief dat je kiest als je besluit dat het journaal het niet waard is. |
| **Alleen het formulier uit beslissing 11, geen knoppen** | Sterk alternatief en het scheelt de hele tokenkwestie. Het dekt bovendien élke wijziging, ook creatives en targeting, tegen nul risico. Er komen tóch knoppen bij omdat een los formulier op precies dezelfde manier vergeten wordt als een Ads Manager-wijziging: je moet er apart naartoe. Een handeling die je in de cockpit zelf doet, log je wél. Het formulier blijft er dus naast staan en niet in plaats van. |
| **De scope van `META_ACCESS_TOKEN` uitbreiden** | Eén token minder om te beheren. Maar dan draait ook elke leesaanroep met schrijfrechten, en er is geen omgeving meer waar schrijven onmogelijk is. Het onderscheid tussen "kan kijken" en "kan uitgeven" is dan nergens meer af te dwingen. |
| **Automatisch pauzeren zodra een voorstel aan een drempel voldoet** | Het enige dat echt zonder jou draait, en het einddoel van laag D. Nu niet: er is geen volume, dus de drempel vuurt op ruis, en de fout kost je een campagne die wel werkte. Wordt interessant zodra er tientallen accounts per maand binnenkomen en de voorstellen aantoonbaar vaker gelijk hadden dan niet, wat je uit het journaal kunt aflezen. |
| **Alleen pauzeren, geen budget** | Kleinste schrijfrecht dat nog nut heeft, en pauzeren is de actie die direct uit een voorstel volgt. Afgewezen omdat budget aanpassen de wijziging is die je in de praktijk het vaakst doet; laat je die eruit, dan blijft juist de meest voorkomende wijziging buiten het journaal. |
| **Het journaal eerst schrijven, dan Meta** | Dan mis je nooit een vastlegging. Maar je legt dan wijzigingen vast die niet zijn doorgevoerd, in een tabel zonder DELETE-policy. Een tijdlijn met verzonnen gebeurtenissen is erger dan een met gaten, want de eerste stuurt je actief de verkeerde kant op. Beslissing 10 lost het echte probleem hierachter op zonder die prijs. |
| **Een generieke "voer dit voorstel uit"-knop** | Ziet er eleganter uit dan twee losse acties. Maar dan bepaalt de tekst van een voorstel wat er gebeurt, en die tekst wordt gegenereerd. Twee expliciete acties met eigen parameters zijn saaier en veel makkelijker te controleren. |

## Consequenties

- **De leesweg is mogelijk vandaag al te ruim, en dat is nu een blokkade.** Beslissing 4 is daarmee geen toekomstige verbetering maar een openstaande correctie op de huidige situatie, die af moet vóór de eerste knop.
- **De budgetknop is er niet voor elke campagne.** Alleen campagnes met Advantage Campaign Budget krijgen hem. Dat is een zichtbaar gat in de UI en het scherm legt uit waarom, in plaats van de knop stil weg te laten.
- **Het plafond in code is niet de bindende bovengrens.** Het beschermt alleen deze twee knoppen; één verkeerde invoer in Ads Manager loopt er dwars langs. De enige grens die ongeacht het pad bindt is het **account spending limit** bij Meta zelf. Zet die, en behandel het codeplafond als tweede net.
- **Een mislukte journaalregel wordt jouw handeling.** De reparatie is een nieuwe regel met de tijd van de handeling (`NieuweRegel` accepteert een eigen `at`), niet een correctie op de oude. Het scherm toont de volledige body om over te nemen en probeert de insert eerst zelf nog één keer.
- **Terugdraaien is een tweede `wijziging`, geen mutatie.** Met een eigen verwachting erbij, want een correctie is ook een besluit.
- **Er komt een omgevingsvariabele bij die per omgeving verschilt.** De knoppen staan op je eigen machine uit, en dat is opzet: je test hier niet mee tegen een echt account.
- **Meta's foutmeldingen worden letterlijk doorgegeven en niet weggeslikt.** Een verdwenen of gearchiveerde campagne, een geweigerde verlaging, een bereikt spending limit: allemaal in de lijn van `lib/admin/sources/source.ts`, één lezer die het zelf moet kunnen repareren. Schrijfacties tellen bij Meta bovendien zwaarder in `X-Business-Use-Case-Usage` dan leesacties; op dit volume geen risico, wel een reden om die melding niet te verbergen.
- **Elke knop is een reden om Ads Manager niet te openen.** Dat is winst voor de vastlegging en verlies voor wat je toevallig ziet als je er tóch bent. Bewuste ruil.

## Hoe overrulen

Een opvolger die automatisch ingrijpen wil toestaan, zou uit het journaal moeten laten zien dat de voorstellen over een reeks campagnes vaker gelijk hadden dan niet, en dat er genoeg volume is dat een drempel niet op ruis vuurt. Dat is precies wat het journaal meet en het is de reden dat beslissing 9 nu een "nog niet" is en geen "nooit".

Een opvolger die de knoppen weer weghaalt, zou moeten laten zien dat het formulier uit beslissing 11 de tijdlijn in de praktijk net zo goed vult. Dat is meetbaar: tel de `wijziging`-regels die uit een knop kwamen tegen die uit het formulier.

## Synchronisatie

- `lib/admin/meta-write.ts` is de enige plek die naar Meta schrijft, exporteert exact twee functies, en stuurt het token in de `Authorization`-header. `lib/admin/sources/meta.ts` blijft lezen.
- `app/actions/admin/ads-control.ts` draait `requireAdmin()` als eerste regel, net als `app/actions/admin/ads-watch.ts`, bewaakt de volgorde uit beslissing 5, 7 en 10, en vult `createdBy` met de user-id. Een server action is een publiek HTTP-endpoint; zonder die eerste regel is de knop niet de enige ingang.
- `lib/admin/journal.ts` houdt de verplichte `verwacht` op `wijziging`; verdwijnt die eis, dan vervalt de reden voor deze TDR.
- `lib/admin/journal-store.ts` levert `createdBy` en de eigen `at` waarop de reparatie uit de Consequenties leunt.
- `.env.example` documenteert `META_WRITE_TOKEN` en scherpt de scope-regel bij `META_ACCESS_TOKEN` aan.
- De twee tokens leven in Business Manager, niet in code. Deze TDR is de enige plek waar die afspraak staat.

## Openstaand, te toetsen vóór de bouw

- **Draagt `META_ACCESS_TOKEN` vandaag al `ads_management`?** Te beantwoorden met `GET /debug_token`. Dit is beslissing 4 en blokkeert de knoppen.
- **Wat is de valuta en het minimale dagbudget van dit advertentieaccount?** Het plafond van €50 moet boven Meta's eigen ondergrens liggen, en die verschilt per valuta.
- **Gebruiken de eerste campagnes Advantage Campaign Budget?** Zo niet, dan is de budgetknop er bij de start niet, en dan is beslissing 11 voorlopig de enige weg waarop budgetwijzigingen in het journaal komen.
