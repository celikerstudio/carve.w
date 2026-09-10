# TDR-0009 — Campagnerendement komt uit GA4, niet uit Meta's pixel

- **Status:** Voorgesteld
- **Datum:** 2026-09-10
- **Beslisser:** Furkan
- **Gerelateerd:** bouwt voort op [TDR-0006](./0006-admin-is-de-cockpit.md)
- **Raakt:** `lib/admin/sources/meta.ts`, `lib/admin/sources/ga4.ts`, `lib/admin/ads.ts` (nieuw), `app/actions/admin/ads.ts` (nieuw), `components/admin/chat/AdminAdsPane.tsx` (nieuw), `components/admin/chat/AdminOverviewPane.tsx`, `components/chat/ChatSidebar.tsx`, `components/chat/ChatLayout.tsx`

## Context

Advertenties zitten nu als één kaart op het Overzicht: uitgaven en klikken over de hele Meta-account, plus kosten per download en per account. Dat beantwoordt hoeveel er weggaat, maar niet waar het heen moet. Zodra er meer dan één campagne loopt is dat de enige vraag die telt.

Het probleem is dat de vier bronnen uit TDR-0006 niet dezelfde dingen weten. Meta kent campagnes en kosten. GA4 kent bezoek en de doorklik naar de App Store, en kan dat per campagne uitsplitsen zolang de link UTM's draagt. Apple's SALES-rapport kent alleen downloads per dag, zonder herkomst. Supabase kent accounts, ook zonder herkomst. Er is dus geen bron die "deze campagne leverde dit account op" kan zeggen, en er komt er ook geen bij zonder dat we zelf iets opslaan.

Feitelijke stand op het moment van schrijven: het advertentieaccount (`1043541031849588`) heeft nul campagnes over de hele historie en geen betaalmethode. Deze keuze wordt dus gemaakt vóór de eerste campagne, niet erna. Dat is precies het goede moment, want de UTM-afspraak moet in Ads Manager staan vóórdat er geld doorheen loopt. Data die zonder UTM binnenkomt is achteraf niet meer toe te wijzen.

## Beslissing

**Kosten komen per campagne uit Meta, resultaat komt per campagne uit GA4, en ze worden gekoppeld op campagnenaam.**

1. **Ads wordt een eigen sectie** in de Admin-modus, naast Overzicht, Gebruikers, Inhoud, Feedback en Geld. Het Overzicht houdt de uitgaven als topregel; het detail verhuist hierheen.
2. **Meta levert per campagne** uitgaven, impressies, klikken, CTR, CPC en CPM, via dezelfde insights-aanroep als nu maar met `level=campaign`.
3. **GA4 levert per campagne** bezoekers en `app_store_click`, via de dimensie `sessionCampaignName`.
4. **De sleutel is de campagnenaam.** Advertenties dragen `utm_campaign={{campaign.name}}`, `utm_source=meta` en `utm_medium=paid` in hun `url_tags`. Meta vult die dynamische parameter zelf in, dus de sleutel blijft vanzelf gelijk aan wat er in Ads Manager staat.
5. **Downloads en accounts blijven een accountbreed totaal.** Ze worden niet naar rato over campagnes verdeeld.
6. **Meta's eigen pixel-conversies blijven eruit.** Dit trekt de afweging uit `lib/admin/sources/meta.ts` door naar campagneniveau.
7. **Een campagne zonder GA4-tegenhanger krijgt het label "geen UTM", geen nul.** Nul betekent dat er niemand kwam; het label betekent dat we het niet weten. Die twee mogen niet op elkaar lijken.
8. **Meta-klikken en GA4-bezoekers staan niet naast elkaar alsof ze gelijk horen te zijn.** Ze lopen structureel uiteen, want een deel van de klikkers haakt af voordat de pagina laadt en een deel blokkeert GA4. Het scherm zegt dat erbij.

## Alternatieven afgewogen

| Alternatief | Waarom niet |
|---|---|
| **Meta's eigen conversies per campagne** (`actions`, `cost_per_action_type`) | Werkt zonder UTM's, maar zet een tweede meting van dezelfde klik naast die van GA4. Als de twee uiteenlopen, en dat doen ze, is er geen manier om uit te maken welke klopt. Het is bovendien de partij die de advertentie verkoopt die zijn eigen resultaat rapporteert. |
| **Downloads en accounts naar rato van klikken over campagnes verdelen** | Levert een getal dat eruitziet als een meting maar een aanname is. Precies bij het cijfer waar budgetbeslissingen op rusten is dat het gevaarlijkst. |
| **De UTM bij aanmelding in Supabase opslaan** | Dit is de enige manier om accounts écht per campagne te tellen, en het is de logische opvolger van deze TDR. Nu niet: het vraagt een kolom, een migratie en een cookie die de aanmeldflow overleeft, terwijl er nog geen enkele campagne loopt. Bouwen voor nul campagnes is de verkeerde volgorde. |
| **Campagnenaam vervangen door campagne-ID als sleutel** | `{{campaign.id}}` overleeft hernoemen, maar maakt de GA4-rapporten onleesbaar: je ziet dan rijen met een nummer in plaats van een naam, ook in GA4 zelf. De naam is de sleutel die beide kanten kunnen lezen. |

## Consequenties

- **Elke nieuwe advertentie moet de UTM's dragen.** Vergeet je dat, dan blijft de campagne zichtbaar in de tabel maar zonder resultaatcijfers. Het label "geen UTM" is de herinnering.
- **Een campagne hernoemen breekt zijn geschiedenis.** GA4 heeft de oude naam vastgelegd bij het bezoek; Meta rapporteert vanaf dat moment de nieuwe. De rijen splitsen. Hernoem dus niet halverwege, of accepteer de knip.
- **De kaart "Kosten per download" verdwijnt van het Overzicht** en komt terug in Ads, waar de campagnedetails ernaast staan.
- **GA4 blijft de bron voor de bovenkant van de trechter.** Valt GA4 uit, dan valt ook het rendement per campagne weg, terwijl de kosten er nog wel staan. Dat is zichtbaar via `SourceNote`, net als elders in de cockpit.
- **De sectie is voorlopig leeg.** Zonder campagnes toont hij een lege staat met de UTM-instelling erin, zodat de eerste campagne meteen goed staat.

## Hoe overrulen

Een opvolger zou moeten laten zien dat de koppeling op campagnenaam in de praktijk niet houdt, bijvoorbeeld doordat campagnes vaak hernoemd worden of doordat GA4 te veel verkeer als `(not set)` wegschrijft. De voor de hand liggende opvolger is niet Meta's pixel maar eigen attributie: de UTM bewaren bij aanmelding, zodat accounts per campagne geteld worden in plaats van geschat. Die keuze wordt pas interessant als er genoeg campagnes naast elkaar lopen om ze te vergelijken.

## Synchronisatie

- `lib/admin/sources/meta.ts` en `lib/admin/sources/ga4.ts` halen de campagnecijfers op; de UTM-sleutel staat aan de GA4-kant.
- `lib/admin/ads.ts` doet de koppeling en de afgeleide getallen, met tests ernaast.
- `lib/analytics.ts` houdt de eventnaam `app_store_click`, die aan beide kanten gelijk moet blijven.
- De UTM-afspraak zelf leeft in Ads Manager, niet in de code. Deze TDR is de enige plek waar hij staat.
