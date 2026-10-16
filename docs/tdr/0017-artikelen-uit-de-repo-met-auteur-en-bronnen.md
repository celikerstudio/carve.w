# TDR-0017: de artikelen komen uit de repo, met een auteur en gecontroleerde bronnen

- **Status:** Voorgesteld
- **Datum:** 2026-10-16
- **Beslisser:** Furkan
- **Gerelateerd:** bouwt voort op [TDR-0016](./0016-de-wiki-is-weer-publiek.md) (vult de consequentie "dunne artikelen staan publiek" in) · [TDR-0014](./0014-drie-vraagpaginas-voor-ai-antwoorden.md) (dezelfde AI-meting) · [TDR-0009](./0009-campagnerendement-komt-uit-ga4.md) (Apple's `ct`)
- **Raakt:** `content/wiki/` (bron van alle artikelen), `scripts/sync-wiki-articles.ts`, `scripts/wiki-check.ts` (nieuw), `lib/wiki/seo.ts`, `app/sitemap.ts`, `app/wiki/[category]/[slug]/page.tsx`, `app/about/` (nieuw), `components/wiki/public/VisitorTease.tsx`, `components/wiki/public/GetCarveLink.tsx`, en in Carve-AI de wiki-lezer van de app

## Context

De audit van 2026-10-16 over de 97 Engelse artikelen in `wiki_articles`:

- Allemaal door AI geschreven op 2026-01-06, mediaan 213 woorden, de langste 348. Alle 97 volgen hetzelfde sjabloon.
- Geen enkele bron in de tekst. 44 artikelen hebben `citation_ids`, die verwijzen naar de 13 vaste bronnen in de app (`Carve AI/App/Models/HealthCitation.swift`, voor Apple-richtlijn 1.4.1). `wiki_citations` is leeg.
- 79 artikelen krijgen van geen ander artikel een link. Overlap: `sleep`/`sleep-hygiene`, `calorie-deficit`/`cutting`, `calorie-surplus`/`bulking`, `bmr`/`tdee`/`metabolism` en meer.
- `view_count` is seed-data (vijf ronde getallen, de rest nul).

De wiki heeft drie taken: gevonden worden in Google, genoemd worden door ChatGPT, Gemini en Perplexity, en lezers naar de App Store brengen. Voor gezondheidsinhoud wegen Google en de modellen vooral wie er schrijft, of die het zelf heeft meegemaakt, en of de beweringen een bron hebben. Negentig dunne AI-pagina's op een nieuw domein is het profiel dat Google sinds 2024 als massaal gemaakte inhoud behandelt, en dat signaal geldt voor de hele site.

Furkan heeft ongeveer een uur per week, dus twee à drie artikelen.

Twee beperkingen uit de app: de iOS-app toont dezelfde rijen met een eigen markdown-lezer (`WikiArticleDetailView.swift`, kent koppen, alinea's, opsommingen, vet, `:::takeaway`, `:::checklist`, `[[links]]`), en de coach linkt in de chat met `[[slug]]` naar artikelen.

## Beslissing

**Een artikel komt pas in Google als Furkan het heeft gelezen en aangevuld en het minstens één gecontroleerde bron heeft. De tekst leeft als markdown in deze repo; de database is een kopie.**

1. **Auteur.** Furkan Celiker staat onder elk beoordeeld artikel, met een link naar `/about`: zijn verhaal (130 naar 80 kilo), hoe de artikelen gemaakt worden (concept met AI, bronnen gecontroleerd, door hem gelezen en aangevuld) en `Person`-data met zijn publieke profielen. In de `Article`-data is hij de auteur en is de reviewdatum `dateModified`.
2. **Indexregel.** Indexeerbaar is `type = 'reviewed'` én minstens één bron. De rest blijft leesbaar met `noindex, follow` en staat niet in de sitemap. Eén functie in `lib/wiki/seo.ts` beslist dat voor de metadata en de sitemap. `/wiki` en de categoriepagina's blijven geïndexeerd.
3. **Bron.** `content/wiki/<categorie>/<slug>.md`. De 97 artikelen worden eenmalig uit de database geëxporteerd; de 17 bestanden van november 2025 vervallen. `pnpm sync-wiki` schrijft alleen van repo naar database.
4. **Bronnen worden gecontroleerd, niet herinnerd.** Elke bron heeft een DOI of PubMed-ID en de bewering die hij ondersteunt. `pnpm wiki:check` zoekt elke bron op bij Crossref of PubMed en vergelijkt de titel. Een bron die niet bestaat of niet klopt, gaat eruit, en de bewering wordt zachter of verdwijnt. Bronnen gaan naar `wiki_citations`.
5. **Opmaak.** Alleen wat de web- en de app-lezer allebei kennen. Verwijzingen als `[1]`. Geen tabellen tot de app ze toont. Furkans eigen stuk staat onder een gewone kop (`## What worked for me`), niet in een nieuw blok.
6. **Volgorde.** Eerst de kern van ongeveer twintig artikelen in clusters die op de app aansluiten: voeding (calories, tdee, calorie-deficit, protein, macros, bulking), dan training (progressive overload, volume, hypertrophy), dan creatine en slaap. Daarna kiest de meting het volgende artikel, niet de lijst.
7. **Samenvoegen wacht op de app.** Een samengevoegd artikel houdt zijn oude slug als alias, zodat een oude `[[slug]]` in de chat blijft werken. Tot de app aliassen kent, wordt alleen het hoofdartikel herschreven en blijft het andere ongemoeid (en `noindex`).
8. **Funnel.** De twee verkoopmomenten van TDR-0016 §5 blijven. De wazige blik kan per artikel een eigen `tease` krijgen in de frontmatter. De App Store-link uit de wiki draagt `ct=wiki<slug>` (zonder streepjes) en `app_store_click` krijgt `article_slug`, zodat klikken én downloads per artikel te zien zijn. Een campagne uit een advertentie gaat voor.
9. **Geen merkzin in elk artikel.** "Carve AI is an iPhone app that…" staat op `/about` en `/app`, niet tachtig keer in de wiki.

## Alternatieven afgewogen

| Alternatief | Waarom niet |
|---|---|
| Alle 80 artikelen in één ronde door AI herschrijven met bronnen, Furkan leest steekproeven | Snel, maar dan staan er weer tachtig AI-pagina's tegelijk online, en Furkans naam staat onder tekst die hij niet heeft gelezen. |
| Alles behalve twintig artikelen verwijderen | Voor Google gelijk aan `noindex`, maar lezers, de app en de coach-links verliezen inhoud die nog bruikbaar is. |
| "Carve Team" als auteur | Precies het huidige profiel. Ervaring uit de eerste hand is het enige wat een AI-tekst niet heeft. |
| Een betaalde diëtist als reviewer | Sterker, maar nu niet betaalbaar. Kan later als `reviewedBy` erbij zonder iets om te bouwen. |
| De database als bron houden en daar rechtstreeks schrijven | Geen geschiedenis, geen diff, niets terug te draaien, en reviewen kan alleen in een database-editor. |
| Bronnen uit het geheugen van het model | Modellen verzinnen studies die echt lijken. Onder Furkans naam is dat het grootste risico van dit hele plan. |

## Consequenties

- **De app heeft een update nodig** (Carve-AI, losse release): bronnen uit `wiki_citations` lezen in plaats van alleen `HealthCitation.swift`, en een slug via `aliases` opzoeken. Tot dan toont de app bij een artikel de bronnen van nu en het web de nieuwe. Er gaat niets stuk zolang er niet wordt samengevoegd.
- **De database krijgt een kolom `aliases text[]`** op `wiki_articles`, via een migratie in Carve-AI, pas als het eerste samenvoegen eraan komt.
- **Een wijziging direct in de database wordt bij de volgende sync overschreven.** Wie iets wil veranderen, verandert het markdown-bestand.
- **De wiki valt bijna helemaal uit de index** tot de eerste artikelen beoordeeld zijn. Dat is de bedoeling: nu staat er niets dat Google zou willen tonen.
- Buiten de repo: vermeldingen van Carve op sites die modellen citeren wegen voor "welke app"-vragen zwaarder dan de wiki (zie TDR-0014). De wiki zorgt dat er iets te citeren valt zodra die er zijn.

## Hoe overrulen

Na tien weken liggen per beoordeeld artikel drie cijfers naast elkaar: Google-klikken (Search Console), App Store-klikken (GA, `article_slug`) en downloads (App Store Connect, `ct`), plus de herhaalde AI-meting uit TDR-0014. Een opvolger moet laten zien dat beoordeelde artikelen niet beter scoren dan de rest. Dan is het uur per week elders beter besteed. Een opvolger die het tempo wil verhogen met minder review moet uitleggen hoe Furkans naam dan nog klopt.

## Synchronisatie

- `lib/wiki/seo.ts` en `app/sitemap.ts`: dezelfde indexregel.
- `scripts/wiki-check.ts` en `Carve AI/App/Views/Components/Wiki/WikiArticleDetailView.swift`: de toegestane opmaak.
- `components/wiki/public/GetCarveLink.tsx` en `lib/app-store-link.ts`: de `ct` uit de wiki.
