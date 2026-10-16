# TDR-0018: de wiki krijgt eindtermen, afgeleid van officiële richtlijnen

- **Status:** Voorgesteld
- **Datum:** 2026-10-16
- **Beslisser:** Furkan
- **Gerelateerd:** vult [TDR-0017](./0017-artikelen-uit-de-repo-met-auteur-en-bronnen.md) aan (wat er geschreven wordt; 0017 regelt hoe) · overgenomen uit de werkwijze van `~/Developer/naslagwerken` (`.claude/skills/naslagwerk/SKILL.md`)
- **Raakt:** `content/wiki/bronnen/` (nieuw), `content/wiki/leerdoelen.yaml` (nieuw), `scripts/wiki/` (bron ophalen, dekking), `lib/wiki/source-file.ts` (`:::check`), `scripts/wiki/sync.ts`, `.claude/skills/wiki-artikel/SKILL.md` (nieuw), `docs/wiki-review-prompt.md` (nieuw)

## Context

De naslagwerken voor de academies zijn betrouwbaar omdat drie dingen vastliggen: de indeling volgt de eindtermen van het CBR, de brontekst staat in de repo, en wat niet te controleren is gaat niet naar buiten. Carve heeft geen examen en dus geen eindtermen. De 97 artikelen zijn ooit door AI bedacht; niemand kan zeggen wat er ontbreekt of wat overbodig is.

Furkan wil een uitgebreide wiki, met de fundamenten als basis. Er is gekozen voor een leerlijn die met AI wordt opgesteld (2026-10-16), en niet voor de vragen aan de coach (privacyvraag, chatgesprekken van gebruikers) of zoekdata (te weinig: 59 vertoningen in 90 dagen).

## Beslissing

**De wiki krijgt een vaste lijst leerdoelen. Elk leerdoel komt uit een officiële richtlijn die als tekst in de repo staat, en elk artikel dient minstens één leerdoel.**

1. **Drie lagen.** *Fundamenten* (energiebalans, eiwit en macro's, trainingsprincipes, slaap en herstel, volhouden): wat iedereen moet weten. *Doelen*: vet verliezen en spier opbouwen, elk een route langs de fundamenten plus wat alleen daar geldt. *Naslag*: de breedte (supplementen, schema's, technieken), om op te zoeken.
2. **De richtlijnen zijn het CBR.** Position stands van de ISSN, ACSM, de WHO en vergelijkbare instanties staan als platte tekst in `content/wiki/bronnen/richtlijnen/`, met DOI, URL, licentie en ophaaldatum. Volledige tekst waar de licentie dat toelaat (open access), anders de samenvatting.
3. **Leerdoelen in `content/wiki/leerdoelen.yaml`.** Per leerdoel: laag, tekst, de richtlijn en de passage waar het uit komt, en het artikel dat het uitlegt. De AI stelt ze op uit de richtlijnen; Furkan keurt de lijst goed.
4. **Dekking wordt gemeten.** `pnpm wiki:dekking` meldt leerdoelen zonder artikel en artikelen zonder leerdoel. Een artikel zonder leerdoel is een kandidaat om samen te voegen of uit de index te houden.
5. **Ook studies staan in de repo.** Bij `wiki:check --fill` wordt van elke bron de samenvatting opgeslagen in `content/wiki/bronnen/studies/`, zodat een review tegen dezelfde tekst kijkt als de schrijver.
6. **`:::check` om wat niet te verifiëren is.** Die zin gaat niet mee naar database, web of app, maar staat op de redactielijst van `wiki:check`. De rest van het artikel kan live.
7. **De werkwijze staat in een skill** (`.claude/skills/wiki-artikel/SKILL.md`), met de fouten die we echt gemaakt hebben. Vóór `status: reviewed` gaat een artikel door de reviewprompt (`docs/wiki-review-prompt.md`) op een model met internettoegang.

## Alternatieven afgewogen

| Alternatief | Waarom niet |
|---|---|
| Vragen aan de coach als eindtermen | De echte vragen van gebruikers, maar het zijn chatgesprekken; dat vraagt eerst een privacyafweging. Kan later als aanvulling. |
| Zoekvragen uit Search Console | Publiek, maar er is bijna geen data. Wordt een meetinstrument zodra er artikelen in de index staan. |
| De AI de leerlijn vrij laten bedenken | Zo zijn de huidige 97 artikelen ontstaan. Dan is de lijst zo goed als de prompt, en niet te controleren. |
| Een trainerscursus (NASM, ACE) overnemen | Geschreven voor wie anderen coacht, niet voor wie zelf wil afvallen; en er zit auteursrecht op. |
| Leerlijnen per categorie van de site | Categorieën zijn navigatie. Ze tonen wat er is, niet wat er mist. |

## Consequenties

- De categorieën op de site blijven zoals ze zijn. Lagen en leerdoelen zijn redactioneel, niet zichtbaar voor de lezer.
- Artikelen die geen leerdoel dienen, verdwijnen niet automatisch. Ze blijven `noindex` tot er een besluit over is.
- Een richtlijn die vernieuwd wordt (een nieuwe ISSN-position stand) betekent: nieuwe tekst ophalen, leerdoelen nalopen. De ophaaldatum laat zien hoe oud elke bron is.
- `:::check` is een vierde blok naast `takeaway` en `checklist`. De app ziet hem nooit, want de sync haalt hem eruit.

## Hoe overrulen

Als de leerdoelen na een halfjaar niet meer sturen wat er geschreven wordt (artikelen ontstaan buiten de lijst om, of `wiki:dekking` wordt niet gedraaid), dan is de lijst ceremonie. Een opvolger kiest dan een andere bron voor de indeling, bijvoorbeeld de zoekvragen zodra die er zijn.

## Synchronisatie

- `content/wiki/leerdoelen.yaml` en de slugs in `content/wiki/<categorie>/`: `wiki:dekking` controleert ze.
- `lib/wiki/source-file.ts` (`stripChecks`) en `scripts/wiki/sync.ts`: wat niet naar buiten gaat.
