# TDR-0004 — De site verkoopt nog één product: Health is de app

- **Status:** Voorgesteld
- **Datum:** 2026-09-05
- **Beslisser:** Furkan
- **Gerelateerd:** overruled de premisse van [TDR-0001](./0001-homepage-is-een-keuzescherm.md) · maakt [TDR-0002](./0002-de-demo-achter-de-klik.md) grotendeels leeg · bouwt voort op [TDR-0003](./0003-carve-is-de-app-pagina.md)
- **Raakt:** `lib/domains.ts`, `components/landing/DomainCardLink.tsx`, `components/chat/AppSwitcher.tsx` (verwijderd), `app/demo/page.tsx`, `components/landing/demo-steps.ts`, `components/landing/LandingDemo.tsx`

## Context

TDR-0001 maakte van `/` een keuzescherm met vier kaarten uit `lib/domains.ts`: Workouts, Food, Money en Life. De aanname eronder was dat Carve één coach over meerdere levensgebieden is, en dat de bezoeker een richting kiest.

Die aanname is op 2026-09-04 in het product zelf vervallen. In de iOS-app staan Money achter `FeatureFlags.showMoneyTab`, Life achter `showLegacyLifeTab` en de sport-hub achter `showSportHub`. De aanleiding was gemeten, niet esthetisch: van de dertien accounts in de database zijn er zeven testaccounts, van de zes echte mensen logden er vier precies één ding, en één kwam terug. Met 166 openstaande verificaties over 22 feature-blokken was de breedte niet te onderhouden, laat staan te verifiëren.

De site bood daarmee twee domeinen aan die je na het downloaden niet vindt. Dat is dezelfde drift die TDR-0001 zelf opruimde bij de inbox-demo, nu een niveau hoger: niet één demo-stap die te veel belooft, maar de helft van het keuzescherm.

## Beslissing

**`DOMAINS` bevat nog twee kaarten, Workouts en Food, en die delen allebei `appId: 'health'`.**

1. Money en Life zijn uit de domeinlijst. De publieke site biedt ze niet meer aan.
2. **De routes en componenten blijven staan.** `app/(protected)/money`, `app/(protected)/travel`, `components/money/` (6 files) en `components/travel/` (3 files) zijn niet verwijderd. Dit is een keuze over wat de site aanbíédt, niet over wat er bestaat. Wie de URL kent komt er nog.
3. De homepage is daarmee **geen keuze tussen producten meer maar twee ingangen naar hetzelfde**. Dat is de kern van wat TDR-0001 vastlegde, en dat vervalt hier.
4. `DEMO_SCRIPTS` staat geparkeerd. Money en Life waren de enige twee scripts, dus het scriptsysteem uit TDR-0002 heeft geen lezer meer. `ScriptedDomain` is losgekoppeld van `DomainId` zodat het blijft compileren; `LandingDemo` en `DemoSignupCta` zijn uit de demo-route gehaald omdat hun tak onbereikbaar was.

## Alternatieven afgewogen

| Alternatief | Waarom niet |
|---|---|
| **Money en Life laten staan tot het web-platform ze echt draagt** | De site zou blijven beloven wat de app niet doet, en dat is precies wat we op drie andere plekken vandaag hebben gecorrigeerd (App Store-beschrijving, `/carve`, de screenshots). |
| **Ook de protected routes en componenten verwijderen** | Dat is negen componentbestanden en twee routegroepen slopen die werken. Er is geen reden om code weg te gooien die niemand in de weg zit; de aanbieding stoppen is genoeg. Bij een volgende opruimronde kan dit alsnog, met `git log -S` en een tag ervoor. |
| **De demo-scripts meteen weggooien** | Ze zijn het onderwerp van TDR-0002 en twee dagen oud. Parkeren houdt ze compileerbaar; verwijderen is een aparte beslissing die deze niet nodig heeft. |

## Consequenties

- De homepage toont twee kaarten in plaats van vier. De grid-layout van `DomainPicker` is niet aangepast; controleer op een breed scherm of twee kaarten daar niet verloren staan.
- `components/chat/AppSwitcher.tsx` is verwijderd. Hij had al geen enkele importeur (alleen zijn eigen definitie en verwijzingen in comments), en met twee kaarten die allebei op `appId: 'health'` ontdubbelen hield hij één optie over. Tag `archive/appswitcher` bewaart hem; `activeApp` in `ChatLayout` en de chat-API blijft ongemoeid, dat is een ander begrip.
- Het scriptsysteem (`demo-steps.ts`, `LandingDemo`, `DemoSignupCta`) heeft nul lezers. Het compileert, maar het is dood gewicht tot een domein terugkomt.
- Eén bestand is wél echt weg (`AppSwitcher.tsx`), de rest is alleen uit de aanbieding. Weg terug: `git log -S` voor de wijzigingen, tag `archive/appswitcher` voor het verwijderde bestand.

## Hoe overrulen

Een opvolger zou moeten laten zien dat een tweede domein in de iOS-app weer aanstaat en geverifieerd is, of dat het web-platform op eigen benen een publiek heeft. Dan komt het domein terug in `DOMAINS`, wordt `ScriptedDomain` weer afgeleid van `DomainId`, en keert de LandingDemo-tak terug in de demo-route.

## Synchronisatie

- `lib/domains.ts` ↔ `~/Developer/Carve-AI/Carve AI/App/Config/FeatureFlags.swift` — een domein achter een uitgezette vlag hoort niet in de lijst
- `lib/domains.ts` ↔ `components/landing/demo-steps.ts` — elk domein in de lijst hoort een demo te hebben, en elk script hoort een domein te hebben
