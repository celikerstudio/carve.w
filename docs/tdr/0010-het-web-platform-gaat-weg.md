# TDR-0010 — het web-platform wordt verwijderd

- **Status:** Voorgesteld
- **Datum:** 2026-09-10
- **Beslisser:** Furkan
- **Gerelateerd:** overrulet de "niet verwijderen"-afweging van [TDR-0005](./0005-carve-wiki-is-een-marketingpagina.md) · maakt [TDR-0002](./0002-de-demo-achter-de-klik.md) definitief onbereikbaar · volgt op [TDR-0008](./0008-de-cockpit-is-de-homepage.md)
- **Raakt:** `app/(protected)/`, `app/hiscores/`, `app/demo/`, `app/lab/`, `components/travel/`, `components/social/`, `components/money/`, `components/dashboard/`, `components/landing/`, `components/app/sidebars/`, `lib/travel/`, `lib/demo/`, `lib/navigation/`, `lib/flags.ts`, `middleware.ts`

## Context

TDR-0005 zette het web-platform uit achter `SHOW_WEB_APP` en koos bewust voor uitzetten in plaats van opruimen: *"68 bestanden slopen die werken, terwijl niemand er last van heeft. Uitzetten is omkeerbaar en kost niets; opruimen kan later, met een tag ervoor."* Dat was vijf dagen geleden en het klopte toen.

Er is sindsdien iets veranderd. TDR-0006 tot en met 0008 hebben de cockpit gebouwd, hem de homepage gemaakt, en de beheerschermen erin getrokken. Het platform is daarmee niet alleen uit, het is ook vervangen: wat je van `/money` gebruikte staat in de Geld-tab, wat je van `/admin` gebruikte staat in de Admin-modus. Wat overblijft zijn schermen die niemand opent en die bij elke wijziging aan de gedeelde componenten meeverhuizen.

De concrete aanleiding: bij het bouwen van de cockpit bleek drie keer dat de code niet meer klopte met de database (`feature_requests.type` bestaat niet, de admin-rol-UUID was verouderd, `profiles.is_test` ontbrak). Code die niemand draait, vertelt je dat soort dingen nooit; hij ligt er alleen maar en ziet er correct uit.

## Beslissing

**Het web-platform wordt verwijderd, niet uitgezet.**

1. **Weg:** `app/(protected)/` in zijn geheel (dashboard, money, travel, food, workouts, health, social, profile, settings), plus `app/hiscores/`, `app/demo/` en `app/lab/`.
2. **Weg:** de componenten die daar exclusief bij horen. `components/travel/` (17) en `components/social/` (2) hebben nul lezers buiten het platform; van `components/dashboard/` (25), `components/money/` (19) en `components/landing/` (25) blijft alleen wat de cockpit en de auth-schermen importeren.
3. **Blijft:** de cockpit op `/`, de marketingpagina op `/app`, `/wiki`, de drie juridische pagina's die Apple eist, en de auth-schermen. Plus wat die importeren: het chatvenster uit `components/dashboard/hub/chat/`, `mock-data.ts` voor de domeinknoppen in de zijbalk, `components/coach/` voor de Brein-modus, en `AuthCard`/`InlineAuth`.
4. **`SHOW_WEB_APP` verdwijnt.** De vlag bestond om het platform te verbergen; zonder platform verbergt hij niets. `SHOW_MONEY` en `SHOW_LIFE` blijven zolang `/carve/money` en `/carve/travel` bestaan.
5. **De middleware-lijst van beschermde routes wordt teruggebracht** tot wat er nog is.
6. **`/lab` gaat mee.** Dat was het proefproject met het `@celikerstudio/ui`-pakket; het werkte niet en er hangt niets aan.

## Alternatieven afgewogen

| Alternatief | Waarom niet |
|---|---|
| **Uitgezet laten staan zoals TDR-0005 besloot** | Werkte zolang het platform nog een mogelijke toekomst had. Die is er niet meer: het is vervangen, niet geparkeerd. Ondertussen betaalt elke refactor aan gedeelde componenten de prijs van bestanden die niemand opent. |
| **Alleen de duidelijk dode domeinen (travel, social)** | Halveert de opruiming en laat de vraag staan. Bovendien is `travel` juist het makkelijkste deel; wat blijft liggen is precies het deel dat verwarring geeft, zoals twee schermen die allebei "money" heten. |
| **Naar een archief-branch in plaats van verwijderen** | Git ís het archief. Een branch die niemand uitcheckt is een map die niemand opent, met de extra belofte dat hij onderhouden wordt. |

## Consequenties

- **De data blijft staan.** Er verdwijnt geen enkele tabel en geen enkele rij. `money_transactions` (520 rijen), `meals`, `completed_workouts`, `monthly_leaderboard_snapshots`: allemaal ongemoeid. Alleen de web-weergave verdwijnt; de iOS-app en de cockpit lezen dezelfde database.
- **`/hiscores` verdwijnt terwijl de Hiscores-modus in de cockpit nog leeg is.** Dat is bewust: de oude implementatie is de referentie en die staat in git. Bij het bouwen van de nieuwe is `git show <commit>^:app/hiscores/page.tsx` het startpunt, samen met de RPC uit `supabase/migrations/20251112000004_create_leaderboard_function.sql`.
- **De demo uit TDR-0002 verdwijnt.** Hij was sinds TDR-0005 al onbereikbaar en gaf zonder `?d=`-parameter een 404. Wil je ooit weer een demo, dan is dat een nieuwe keuze en geen restauratie.
- **Bestaande links breken.** `/money`, `/workouts` en de rest geven een 404. Dat raakt niemand behalve jouw eigen bladwijzers; het platform stond in productie al uit en die URL's stonden niet in de sitemap.
- **`components/dashboard` blijft half staan.** De chat-onderdelen wonen daar, terwijl er geen dashboard meer is. Dat is een verkeerde naam voor de plek waar ze staan; verhuizen naar `components/chat/` is een aparte opruiming en hoort niet in dezelfde commit als een verwijdering.

## Hoe overrulen

Er valt niets te overrulen: dit is een verwijdering, geen richting. Wil je een webversie van een domein terug, dan is dat een nieuwe TDR met een eigen reden, en git heeft de oude code nog.

## Synchronisatie

- `lib/flags.ts` ↔ `middleware.ts` — `SHOW_WEB_APP` verdwijnt aan beide kanten tegelijk
- `components/app/layout-wrapper.tsx` ↔ de routes die overblijven — de zijbalk-tak is op 2026-09-10 verwijderd, samen met `/carve/updates` (de laatste pagina die hem gebruikte), `AppSidebarController`, `AppShell`, `lib/navigation/` en `components/icons/`. Wat geen eigen tak heeft draagt nu geen chrome, en dat is alleen nog de 404
- `components/dashboard/hub/` ↔ `components/chat/ChatLayout.tsx` — wat hier blijft staan, blijft omdat de cockpit het importeert
