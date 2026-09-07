# Analytics instellen (Google Analytics 4)

Sinds 2026-09-08 meet carve.wiki met Google Analytics 4. Daarvoor liep het op Plausible.
De reden voor de overstap staat als `@ai-context` bovenaan `lib/analytics.ts`: GA4 kan
aan Google Ads gekoppeld worden, zodat `app_store_click` daar als conversie binnenkomt
en de biedstrategie er iets aan heeft. De prijs is een cookiebanner.

## Wat er in de code zit

| Onderdeel | Waar |
|---|---|
| De tag en Consent Mode | `app/layout.tsx` |
| `track()` naar gtag | `lib/analytics.ts` |
| Toestemming lezen, schrijven en melden | `lib/consent.ts` |
| De banner | `components/analytics/cookie-consent.tsx` |
| Keuze terugdraaien | `components/analytics/cookie-settings.tsx`, staat op `/privacy` |

## Stap 1: property aanmaken

1. Ga naar [analytics.google.com](https://analytics.google.com) en maak een property aan
   voor carve.wiki.
2. Kies als platform **Web** en vul `https://carve.wiki` in.
3. Noteer het measurement ID. Dat begint met `G-`.

## Stap 2: het ID in de omgeving zetten

Lokaal in `.env.local`:

```
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

En in Vercel onder Settings, Environment Variables, voor Production en Preview.
Vergeet de herdeploy niet: `NEXT_PUBLIC_`-variabelen worden in de build ingebakken, dus
een variabele toevoegen zonder opnieuw te deployen verandert niets aan de live site.

Zonder dit ID laadt de tag helemaal niet. `lib/analytics.ts` schrijft dan één
waarschuwing per sessie naar de console in plaats van stil te vallen.

## Stap 3: controleren dat het werkt

1. Open carve.wiki in een privévenster.
2. Accepteer de cookiebanner. Weiger je, dan hoort GA4 niets en dat is de bedoeling.
3. Ga in GA4 naar Reports, Realtime. Je bezoek hoort er binnen een halve minuut te staan.
4. Klik op een App Store-knop en kijk of `app_store_click` in Realtime verschijnt.

Zie je niets, loop dan deze drie na, in deze volgorde:

- Staat er een `<script src="…googletagmanager.com/gtag/js?id=G-…">` in de HTML van de
  pagina? Zo niet, dan is het measurement ID niet in de build meegekomen.
- Blokkeert je adblocker de tag? Test in een venster zonder extensies.
- Staat Consent Mode nog op `denied`? Kijk in de console naar `dataLayer` en zoek de
  laatste `consent`-regel.

## Stap 4: koppelen aan Google Ads

Dit is waar de overstap voor gedaan is.

1. Markeer `app_store_click` in GA4 onder Admin, Events als **key event**.
2. Koppel onder Admin, Product links je Google Ads-account.
3. Importeer in Google Ads het key event als conversie.
4. Zet in Google Ads het veld "Final URL-achtervoegsel" op iets als
   `utm_source=google&utm_medium=cpc&utm_campaign={campaignid}`. Auto-tagging levert
   alleen een `gclid`, en GA4 begrijpt die wel, maar met expliciete utm-parameters kun je
   in de rapportage per campagne uitsplitsen zonder op de Ads-koppeling te leunen.

## Wat er gemeten wordt

De volledige lijst staat als union type in `lib/analytics.ts`. Het event dat er voor
advertenties toe doet is `app_store_click`, met een `source`-prop die vertelt welke knop
het was: `hero`, `close`, `dock`, `header`, `pricing`, `marketing_hero` of `showcase`.

## Privacy

De cookiebanner is geen keuze maar een voorwaarde: GA4 zet `_ga`-cookies en die mogen in
de EU pas na toestemming. Consent Mode staat standaard op `denied`, in
`app/layout.tsx`, vóór de tag laadt. Wat er in de privacyverklaring over staat, staat in
`app/privacy/page.tsx` onder kop 8 en moet meeveranderen als hier iets wijzigt.

## Kosten

GA4 is gratis tot 10 miljoen events per maand. Daar loop je met een marketingpagina niet
tegenaan.

## Bewaartermijn

GA4 zet de bewaartermijn van gebruikers- en eventdata standaard op 2 maanden. Zet 'm
onder Admin, Data settings, Data retention op 14 maanden, anders kun je dit jaar niet
met vorig jaar vergelijken. Veertien maanden is het maximum voor een gratis property, en
`app/privacy/page.tsx` noemt die termijn, dus verhoog je 'm niet dan klopt de
verklaring nog steeds.
