# TDR-0009 — Campagnerendement komt uit GA4, niet uit Meta's pixel

- **Status:** Voorgesteld
- **Datum:** 2026-09-10
- **Beslisser:** Furkan
- **Gerelateerd:** bouwt voort op [TDR-0006](./0006-admin-is-de-cockpit.md)
- **Raakt:** `lib/admin/sources/meta.ts`, `lib/admin/sources/ga4.ts`, `lib/admin/ads.ts` (nieuw), `app/actions/admin/ads.ts` (nieuw), `components/admin/chat/AdminAdsPane.tsx` (nieuw), `components/admin/chat/AdminOverviewPane.tsx`, `components/chat/ChatSidebar.tsx`, `components/chat/ChatLayout.tsx`, `lib/utils.ts`, `components/carve/AppStoreButton.tsx`

## Context

Advertenties zitten nu als één kaart op het Overzicht: uitgaven en klikken over de hele Meta-account, plus kosten per download en per account. Dat beantwoordt hoeveel er weggaat, maar niet waar het heen moet. Zodra er meer dan één campagne loopt is dat de enige vraag die telt.

Het probleem is dat de vier bronnen uit TDR-0006 niet dezelfde dingen weten. Meta kent campagnes en kosten. GA4 kent bezoek en de doorklik naar de App Store, en kan dat per campagne uitsplitsen zolang de link UTM's draagt. Apple's SALES-rapport kent alleen downloads per dag, zonder herkomst. Supabase kent accounts, ook zonder herkomst. Er is dus geen bron die vandaag "deze campagne leverde dit account op" kan zeggen.

Feitelijke stand op het moment van schrijven: het advertentieaccount (`1043541031849588`) heeft nul campagnes over de hele historie en geen betaalmethode. Deze keuze wordt dus gemaakt vóór de eerste campagne, niet erna. Dat is precies het goede moment, want geen enkele partij attribueert met terugwerkende kracht. Wat er niet in de link stond toen er geklikt werd, is achteraf niet meer te herstellen. Dat geldt voor GA4 en het geldt net zo goed voor Apple.

## Beslissing

**Kosten komen per campagne uit Meta, resultaat komt per campagne uit GA4, en ze worden gekoppeld op campagne-ID.**

1. **Ads wordt een eigen sectie** in de Admin-modus, naast Overzicht, Gebruikers, Inhoud, Feedback en Geld. Het Overzicht houdt de uitgaven als topregel; het detail verhuist hierheen.
2. **Meta levert per campagne** de uitgaven, impressies en klikken.
3. **GA4 levert per campagne** bezoekers en het event `app_store_click`.
4. **De sleutel is het campagne-ID, niet de naam.** Advertenties dragen in hun `url_tags`:
   - `utm_id={{campaign.id}}` — dit is de sleutel. GA4 geeft hem terug als `sessionCampaignId`.
   - `utm_campaign={{campaign.name}}` — alleen zodat GA4's eigen rapporten leesbaar blijven.
   - `utm_source=facebook` en `utm_medium=paid` — zodat GA4 het verkeer onder Paid Social hangt. Niet `meta`: dat staat niet in GA4's lijst met sociale bronnen, en dan landt het onder Unassigned in GA4 zelf.

   De weergavenaam in de tabel komt van Meta, niet uit de UTM. Hernoemen in Ads Manager breekt de koppeling daarmee niet.
5. **Downloads en accounts blijven een accountbreed totaal.** Ze worden niet naar rato over campagnes verdeeld.
6. **De App Store-link draagt vanaf nu Apple's campagneparameters** (`pt` en `ct`), gevuld uit de campagne die in de landings-URL staat. De cockpit leest die cijfers niet: downloads per campagne zitten alleen in Apple's detailed Analytics-rapporten, en die asynchrone API is in TDR-0006 beslissing 2 al afgewezen voor dit scherm. Het gaat er hier alleen om dat de historie ontstaat, zodat je het in App Store Connect kunt lezen en het later alsnog kunt ophalen. De parameters gaan **niet** mee in `installUrl` en `sameAs` van de structured data: dat is de canonieke URL voor zoekmachines en die hoort schoon te blijven.
7. **Meta's eigen pixel-conversies blijven eruit.** Dit trekt de afweging uit `lib/admin/sources/meta.ts` door naar campagneniveau.
8. **Of een campagne getagd is, lezen we uit Meta zelf.** De `url_tags` van de advertenties worden opgehaald en gecontroleerd op `utm_id`. Alleen dan mag het scherm "geen UTM" zeggen. Zonder die controle is een lege GA4-rij niet te onderscheiden van een campagne die geen verkeer kreeg, en dan is het label een gok die eruitziet als een diagnose.
9. **Meta-klikken en GA4-bezoekers staan niet naast elkaar alsof ze gelijk horen te zijn.** Ze lopen structureel uiteen, want een deel van de klikkers haakt af voordat de pagina laadt, een deel blokkeert GA4 en een deel weigert de cookiebanner. Het scherm zegt dat erbij.

## Alternatieven afgewogen

| Alternatief | Waarom niet |
|---|---|
| **Meta's eigen conversies per campagne** (`actions`, `cost_per_action_type`) | Werkt zonder UTM's, maar zet een tweede meting van dezelfde klik naast die van GA4. Als de twee uiteenlopen, en dat doen ze, is er geen manier om uit te maken welke klopt. Het is bovendien de partij die de advertentie verkoopt die zijn eigen resultaat rapporteert. |
| **Campagnenaam als sleutel** | Een naam is muteerbaar en wordt rauw in de URL gesubstitueerd. Hernoemen splitst de koppeling, en een `&` of `?` in een campagnenaam breekt de link. Het ID kost één extra parameter en heeft geen van beide problemen. |
| **Downloads en accounts naar rato van klikken over campagnes verdelen** | Levert een getal dat eruitziet als een meting maar een aanname is. Precies bij het cijfer waar budgetbeslissingen op rusten is dat het gevaarlijkst. |
| **Apple's Analytics Reports API live in de cockpit lezen** voor downloads per campagne | Dat is de asynchrone API die TDR-0006 al afwees: je vraagt een rapport aan, de eerste data komt 24 tot 48 uur later, en instances verlopen. Vandaar beslissing 6: de `ct` wél meesturen, de cijfers voorlopig in App Store Connect lezen. |
| **De UTM bij aanmelding in Supabase opslaan** | Dit is de enige manier om accounts écht per campagne te tellen, en het is de logische opvolger van deze TDR. Nu niet: het vraagt een kolom, een migratie en een cookie die de aanmeldflow overleeft, terwijl er nog geen enkele campagne loopt. |

## Consequenties

- **Elke nieuwe advertentie moet de `url_tags` dragen.** Vergeet je dat, dan blijft de campagne in de tabel staan met het label uit beslissing 8 en zonder resultaatcijfers.
- **Campagnenamen krijgen een conventie:** kleine letters, geen spaties, alleen `[a-z0-9_-]`. De naam is niet de sleutel meer, maar hij gaat wel rauw de URL in via `{{campaign.name}}`, en een `&`, `?`, `#` of `=` erin breekt die link.
- **Bezoekers per campagne telt niet op tot het bezoekerstotaal op het Overzicht.** Het is een telling van gebruikers tegen een dimensie die per sessie geldt: wie via twee campagnes binnenkomt, telt in beide rijen. Zelfde soort voorbehoud als beslissing 9, en het scherm zegt het er net zo goed bij.
- **De GA4-cijfers zijn "wie de cookiebanner accepteerde".** De consent-standaard staat op `denied` voor alle vier de signalen (`app/layout.tsx:116`), en Google's modellering die dat terugrekent vraagt duizend gebruikers per dag. Dat haalt Carve voorlopig niet. Het geweigerde deel verschilt per publiek en dus per campagne, precies in de vergelijking waarvoor dit scherm bestaat.
- **Op klein volume kunnen rijen helemaal wegvallen.** GA4 houdt rijen met weinig gebruikers achter en vouwt de staart in een `(other)`-rij. Bij de eerste campagnes is een tabel vol streepjes het waarschijnlijkste beeld, en dat is geen storing.
- **Kosten per app-store-klik rangschikt campagnes op intentievolume, niet op waarde.** Het veronderstelt dat de stap van klik naar account per campagne gelijk is, en dat is nu juist wat tussen doelgroepen verschilt: een brede goedkope doelgroep wint op kosten per klik en verliest op kosten per account. Beslissing 6 is wat die aanname op termijn toetsbaar maakt.
- **De kaart "Kosten per download" verdwijnt van het Overzicht** en komt terug in Ads, waar de campagnedetails ernaast staan.
- **Valt GA4 uit, dan staan de kosten er nog wel en het rendement niet.** Zichtbaar via `SourceNote`, net als elders in de cockpit.
- **De sectie is voorlopig leeg.** Zonder campagnes toont hij een lege staat met de `url_tags`-instelling erin, zodat de eerste campagne meteen goed staat.

## Hoe overrulen

Een opvolger zou moeten laten zien dat de koppeling via GA4 in de praktijk niet houdt, bijvoorbeeld doordat te veel verkeer als `(not set)` binnenkomt of doordat de drempels de campagnerijen wegvagen. De voor de hand liggende opvolger is niet Meta's pixel maar eigen attributie: de UTM bewaren bij aanmelding, zodat accounts per campagne geteld worden in plaats van geschat. Die keuze wordt interessant zodra er genoeg campagnes naast elkaar lopen om te vergelijken.

## Synchronisatie

- `lib/admin/sources/meta.ts` en `lib/admin/sources/ga4.ts` halen de campagnecijfers op; `utm_id` is de sleutel aan beide kanten.
- `lib/admin/ads.ts` doet de koppeling en de afgeleide getallen, met tests ernaast.
- `lib/analytics.ts` houdt de eventnaam `app_store_click`, die aan beide kanten gelijk moet blijven.
- `lib/utils.ts` bouwt de App Store-link met `pt` en `ct`; `app/app/page.tsx` houdt de schone URL in zijn structured data.
- De `url_tags`-afspraak zelf leeft in Ads Manager, niet in de code. Deze TDR is de enige plek waar hij staat.

## Openstaand, te toetsen met de eerste campagne

- Rapporteert Meta historische rijen onder de huidige campagnenaam of onder de naam van toen? Voor de koppeling maakt het niet uit, want die gaat op ID, maar het bepaalt wat er in de tabel staat na een hernoeming.
- Overleven de campagnerijen GA4's drempels op Carve's volume? Dat is alleen met echt verkeer te weten.
