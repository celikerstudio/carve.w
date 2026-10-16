# TDR-0016: de wiki is weer publiek

- **Status:** Voorgesteld
- **Datum:** 2026-10-16
- **Beslisser:** Furkan
- **Gerelateerd:** overrulet beslissing 6 van [TDR-0005](./0005-carve-wiki-is-een-marketingpagina.md) (de wiki dicht) · haalt de Wiki-modus uit de cockpit van [TDR-0008](./0008-de-cockpit-is-de-homepage.md)
- **Raakt:** `app/wiki/` (nieuw), `components/wiki/public/` (nieuw), `lib/wiki/` (artikelen, renderer, rekenhulp), `app/(cockpit)/wiki/` (weg), `components/chat/CockpitShell.tsx`, `app/sitemap.ts`, `lib/flags.ts` (`SHOW_WIKI` weg), `public/wiki/`

## Context

TDR-0005 sloot de wiki op 2026-09-05: zeventien artikelen, organisch verkeer dat pas over maanden komt, en een site die één ding moest doen. Sindsdien is er iets veranderd. Betaalde advertenties zijn op 2026-09-27 gestopt, dus groei moet uit vindbaarheid en gedeelde links komen. Search Console gaf over de laatste 90 dagen 59 vertoningen en 0 klikken, allemaal op de merknaam. De database heeft 97 Engelse artikelen in plaats van zeventien, en die worden nu herschreven tot volle artikelen met bronnen.

Het ontwerp is in acht rondes in de visual companion gekozen (2026-10-16): één leeskolom in de stijl van de app (monochroom, systeemfont, eiwit groen), met de structuur van een naslagwerk (categorieën, zijlijst, inhoud, links in de tekst, bronnen, "see also") en rechts het Carve-personage als enige speelse en verkopende plek.

## Beslissing

**De wiki is publiek en door zoekmachines te lezen, en hij verkoopt de app door de bezoeker eerst zijn antwoord te geven.**

1. **Adressen:** `/wiki` (overzicht), `/wiki/<categorie>` en `/wiki/<categorie>/<artikel>`. De categorie staat in het adres, voor de broodkruimel in zoekresultaten. `/wiki/<artikel>` (zonder categorie) stuurt permanent door naar het volledige adres, zodat de chat en gedeelde korte links alleen de slug hoeven te kennen.
2. **Statisch gebouwd uit `wiki_articles`,** met een verversing per uur. Lezen gaat met de anon-sleutel: de RLS-policy "Public can view published articles" bestaat al. Geen sessie op deze pagina's, anders worden ze per verzoek gerenderd.
3. **De markdown wordt hier gerenderd.** `content_html` is voor alle 97 artikelen leeg. De renderer kent de blokken die in de inhoud staan (`:::takeaway`, `:::checklist`) en `[[slug]]`-links, en maakt van elke `##` een anker voor de inhoudsopgave.
4. **Het antwoord staat bovenaan.** Waar een artikel een getal heeft dat van de lezer afhangt, staat er een rekenhulp (eiwit: 1,6 tot 2,2 g per kilo). Die rekenhulpen staan per slug in code, niet in de database: het zijn er weinig en ze zijn formules, geen tekst.
5. **Twee verkoopmomenten, niet meer.** Onder het antwoord een wazige blik op wat een gebruiker in de app ziet, en rechts het personage. Geen muur: de volledige tekst blijft voor iedereen leesbaar.
6. **De Wiki-modus verdwijnt uit de cockpit.** Twee wiki's op hetzelfde adres kan niet, en de publieke is de echte. De zijbalk van de cockpit linkt naar `/wiki`.
7. **Engels eerst.** Alle bruikbare inhoud is Engels. Nederlands blijft voor de vraagpagina's onder `/nl/` (TDR-0014).

## Alternatieven afgewogen

| Alternatief | Waarom niet |
|---|---|
| Alles op `/wiki/<artikel>` zonder categorie | Korter, maar de broodkruimel in Google verdwijnt, en een categoriepagina moet dan een ander voorvoegsel krijgen. De korte vorm blijft bestaan als doorverwijzing. |
| `content_html` vullen in het sync-script en dat tonen | Dan bestaan er twee renderers (sync en web) en twee waarheden over hoe een blok eruitziet. Eén renderer op de plek die het toont. |
| De wiki achter een login, alleen voor gebruikers | Dan vindt niemand hem, en dat is de reden om hem te openen. |
| De persoonlijke laag (jouw eiwit, jouw week) meteen bouwen | Vraagt een sessie op de pagina, en dan is hij niet meer statisch. Komt later als losse client-laag; zie Consequenties. |

## Consequenties

- **De persoonlijke laag ontbreekt nog.** Ingelogd zie je nu hetzelfde als een bezoeker. Het ontwerp (jouw doel, je weekgemiddelde, waar je gat zit) vraagt een client-component die na het laden je gegevens ophaalt, zodat de pagina zelf statisch blijft.
- **De bronnenlijst is leeg tot de artikelen herschreven zijn.** `wiki_citations` heeft nul rijen; het component toont niets zolang er niets is.
- **Dunne artikelen staan publiek.** Tot de herschrijving klaar is, staan er artikelen van ~250 woorden online. Wil je dat niet, dan is `noindex` per artikel de volgende stap, niet de wiki weer dicht.
- **De home is het lichaam als navigatie** (richting C uit de companion): tik op hoofd, spieren, buik, hand of benen voor de categorie, met Him/Her. Daaronder "Start here" en de categorielijsten als gewone links, zodat Google elk artikel vanaf `/wiki` vindt.
- **Eén kop voor de hele site** (`components/site/SiteHeader.tsx`, 2026-10-16): logo, Wiki en de vijf categorieën, "What's Carve?" naar `/app`, zoeken, inloggen en Apple's App Store-badge. Hij vervangt de inschuivende balk van de marketingpagina en de koppen van de juridische pagina's, de vraagpagina's en de wiki.
