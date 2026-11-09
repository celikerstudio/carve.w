# TDR-0019: de wiki krijgt een winkelblok uit Shopify

- **Status:** Voorgesteld
- **Datum:** 2026-11-09
- **Beslisser:** Furkan
- **Gerelateerd:** overrulet beslissing 5 van [TDR-0016](./0016-de-wiki-is-weer-publiek.md) (twee verkoopmomenten, niet meer)
- **Raakt:** `lib/shop/` (nieuw), `components/wiki/public/ShopProducts.tsx` (nieuw), `app/wiki/[category]/[slug]/page.tsx`, `app/wiki/wiki.css`, `lib/analytics.ts`; voor §7 ook `app/shop/` en `components/shop/` (nieuw), `components/site/SiteHeader.tsx`, `app/sitemap.ts`, `components/wiki/public/GetCarveLink.tsx`

## Context

Naast de app gaat Carve fysieke spullen verkopen: push-up bars, pull-up bars en ander gereedschap voor thuis. Een partner van Furkan doet de verkoop: leveranciers, inkoop, prijzen, voorraad, verzending, retouren en klantcontact. De wiki levert het verkeer.

Twee dingen volgen daaruit. De partner moet de winkel kunnen runnen zonder developer, dus de winkel woont niet in deze repo. En de wiki moet zijn producten tonen zonder dat er ooit een oude prijs of een uitverkocht product in een artikel staat.

TDR-0016 §5 stond twee verkoopmomenten per artikel toe, allebei voor de app. Een productblok is een derde.

## Beslissing

1. **De winkel is Shopify, beheerd door de partner.** Producten, prijzen, voorraad, betaling en bestellingen leven daar. Deze repo bouwt geen winkelwagen, geen checkout en geen producttabel.
2. **De wiki leest via de Storefront API.** Server-side, bij het renderen van het artikel, met een verversing per kwartier. Wat niet `availableForSale` is, verschijnt niet. Valt Shopify weg, dan verdwijnt het blok en blijft het artikel staan.
3. **Welk product bij welk artikel hoort, staat in code** (`lib/shop/article-products.ts`), per slug, net als de rekenhulpen (TDR-0016 §4). Furkan tekent als auteur voor wat er onder zijn artikel staat, dus die koppeling gaat via hem. De partner beheert alles wat het product zelf is.
4. **Het blok staat onder de bronnen, nooit in de uitleg.** Het heet zichtbaar een winkel ("From the Carve shop"), zodat niemand een productaanbeveling voor een bevinding aanziet. Dit is het derde verkoopmoment en het laatste: een vierde vraagt een nieuwe TDR.
5. **Een klik gaat naar de productpagina in Shopify**, met `utm_source=carve.wiki`, `utm_medium=wiki` en `utm_campaign=<slug>`, en wordt in GA gemeten als `shop_click` met `article_slug`. Zo ziet de partner in Shopify welk artikel een verkoop opleverde, en Furkan in GA welk artikel klikken oplevert.
6. **Zonder `SHOPIFY_STOREFRONT_URL` is er geen blok.** Productie blijft ongewijzigd tot de echte winkel bestaat. Tot dan wordt er gebouwd en getest tegen een openbare testcatalogus van Shopify (`fitness-dropship.mock.shop`). Hetzelfde geldt voor `/shop` (§7): zonder winkel een 404, geen link in de kop en niet in de sitemap.
7. **`/shop` is opgebouwd rond de camera challenges van de app** (aangevuld dezelfde dag, companion `shop-b-v3-challenges`; Furkan: "moet hand in hand gaan"). Elke rij is een challenge uit Carve-AI ADR-129 met dezelfde sterren, en heeft drie vakken: gratis (zonder spullen), met spullen (uit Shopify), en tellen in Carve AI met "Free · iPhone". Een challenge zonder zinnig product zegt dat ook. Een challenge die de app nog niet voor iedereen heeft (pull-ups) staat er als "coming". De lijst staat in `lib/shop/challenges.ts`; klikken heten `shop_click` met `challenge`, de App Store-link draagt `ct=shop<challenge>`.

## Alternatieven afgewogen

| Alternatief | Waarom niet |
|---|---|
| Eigen winkel in de wiki (Supabase + Stripe Checkout) | Het bouwen is klein, het beheer niet. Elke prijswijziging, retour of btw-vraag wordt dan developerwerk, terwijl de partner de verkoop draagt. |
| Koppeling in Shopify (tag of metafield per artikel) | De partner kan dan zelf producten onder artikelen hangen, maar dan staat er iets onder Furkans naam dat hij niet gekozen heeft. Dat botst met TDR-0017. |
| Koppeling in de database (`wiki_articles`) | Vraagt een migratie en een sync-stap voor een lijstje van een paar regels per artikel. |
| Prijs en voorraad in de browser ophalen | Echt live, maar het blok springt na het laden in beeld en de pagina doet per bezoek een verzoek naar Shopify. Een kwartier oud is voor deze producten goed genoeg; Shopify zelf weigert een uitverkocht product alsnog. |
| `/shop` als catalogus per productsoort (companion richting A) | Dezelfde producten als de Shopify-winkel van de partner, in andere kleuren. Geen reden om te kopen, en geen weg naar de app. |
| `/shop` met een starterset bovenaan (richting C) | Kan later bovenop §7 als de partner bundels verkoopt. Niet als structuur van de pagina. |
| Eerst affiliate-links (bol.com, Amazon) | Was het eerste advies, toen het nog om het testen van vraag ging. Met een partner die de verkoop doet is een eigen winkel de bedoeling. |

## Consequenties

- **De wiki krijgt een commerciële laag.** Het blok moet zichtbaar los staan van de inhoud; een product halverwege de tekst of een "aanbevolen"-label is wat deze TDR uitsluit.
- **De test-handles moeten weg** zodra de echte winkel er is. Een handle die niet bestaat toont niets, dus vergeten levert een leeg blok op en geen fout product.
- **De wiki is Engels, de winkel waarschijnlijk Nederlands of Europees.** Prijzen komen in de valuta die Shopify teruggeeft. Wie buiten het verzendgebied leest, ziet het blok wel; Shopify Markets kan dat later per land regelen.
- **Geld en aansprakelijkheid liggen buiten deze repo.** Hoe Furkan en de partner de opbrengst delen, en wie importeur is onder de Europese productveiligheidsregels (GPSR), moet geregeld zijn voordat het blok in productie aan gaat.

## Hoe overrulen

Met cijfers: klikken per artikel uit GA (`shop_click`) tegen het effect op `app_store_click` op dezelfde artikelen. Drukt het blok de app-klikken, dan is minder blokken of een andere plek het argument. Wil de partner zelf de koppeling beheren, dan is dat een afspraak tussen hem en Furkan die eerst hier vastgelegd wordt.

## Synchronisatie

- `lib/shop/article-products.ts` ↔ de handles in de Shopify-winkel
- `components/wiki/public/ShopProducts.tsx` ↔ `lib/analytics.ts` (`shop_click`)
- `lib/shop/challenges.ts` ↔ Carve-AI `Carve AI/App/Services/Workout/ChallengeStars.swift` (de drempels; andere repo, dus niet gevalideerd)
- `components/shop/ShopChallenge.tsx` ↔ `lib/marketing-copy.ts` ("Free · iPhone")
