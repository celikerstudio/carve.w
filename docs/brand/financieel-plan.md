# Carve AI -- Financieel Plan

**Datum:** 3 maart 2026
**Status:** Levend document -- maandelijks bijwerken
**Context:** Solo developer, app live op App Store, vertrek naar Azie aanstaande

---

## 1. Vaste Kosten per Maand

| Kostenpost | Bedrag/maand | Toelichting |
|---|---|---|
| Apple Developer Program | ~€8,25 | €99/jaar, verplicht voor App Store |
| Supabase (Pro) -- Carve AI | €25 | 8GB database, 250GB bandwidth, 100GB storage. Free tier (500MB DB) is te krap met food database + coach memory. |
| Supabase (Pro) -- Carve Travel (70%) | ~€17,50 | Gedeeld Supabase project met Burak. Jouw deel (70%): ~€17,50/maand. |
| OpenAI API (basis) | ~€15-30 | Zie variabele kosten -- dit is de vaste "bodem" bij lage gebruikersaantallen |
| Claude API (development) | ~€50-100 | Claude Code voor development van twee apps (Carve AI + Carve Travel). Realistisch bij dagelijks gebruik. |
| RevenueCat | €0 | Gratis tot $2.500 MRR (~€2.300). Daarna 1% van tracked revenue. |
| Sentry | €0 | Free tier: 5K errors/maand. Ruim voldoende tot 1.000+ DAU. |
| Domain (carve.wiki) | ~€2,50 | ~€30/jaar (als actief). Anders €0. |
| Zorgverzekering | ~€80-130 | NL ingeschreven: ~€130/maand. Internationaal (reisverzekering met elektronica): ~€80-120/maand. Verplicht, ook in het buitenland. |
| Coworking / betrouwbaar internet | ~€50-100 | Coworking spaces of cafes met stabiel internet in Azie. Essentieel voor development. |
| Visakosten | ~€20-30 | Gemiddeld over het jaar (visa on arrival, extensions, visa runs). Varieert per land. |
| **Totaal vaste kosten** | **~€164-239** | **Zonder marketing, zonder personeelskosten** |

### Eenmalige kosten

| Kostenpost | Bedrag | Toelichting |
|---|---|---|
| Juridische review contracten | €300-600 | Review van contractor-overeenkomst met Batuhan, eventueel privacy policy. Doe dit voor je iemand laat werken. |

### Noodfonds (apart van runway)

**€1.500 apart zetten** als noodfonds. Dit is geen onderdeel van je runway-berekening. Dit geld is voor echte noodgevallen: gestolen laptop, medische noodgeval, noodvlucht naar huis. Raak dit geld niet aan voor operationele kosten.

### Opmerkingen

- **Supabase:** Je zit nu op Pro. Downgraden naar free tier is mogelijk maar risicovol -- 500MB database limiet is krap. Houd Pro aan.
- **RevenueCat:** Pas relevant bij serieuze revenue. Tot €2.300 MRR is het gratis. Bij €5.000 MRR betaal je ~€50/maand. Verwaarloosbaar.
- **Sentry:** Free tier is genoeg. Pas upgraden als je 5.000+ errors/maand krijgt (dat is een ander probleem).
- **Zorgverzekering:** Dit is een reele kostenpost die makkelijk vergeten wordt. Bij uitschrijving uit BRP (>6 maanden buitenland) vervalt je NL zorgverzekering. Je hebt dan een internationale reisverzekering nodig die ook elektronica dekt.
- **Claude API:** Met twee apps in actieve development is €20/maand niet realistisch. Reken op €50-100.

---

## 2. Variabele Kosten (schalen met gebruikers)

### OpenAI API -- de grootste variabele

| Feature | Model | Input tokens | Output tokens | Kosten per aanvraag |
|---|---|---|---|---|
| Food scan (foto) | gpt-4o-mini | ~1.500 (incl. image) | ~300 | ~€0,003 |
| Food scan (tekst) | gpt-4o-mini | ~800 | ~300 | ~€0,0004 |
| Coach chat | gpt-4o-mini | ~2.000 (context + history) | ~400 | ~€0,001 |
| Weekly report | gpt-4o-mini | ~3.000 | ~800 | ~€0,002 |
| Trainer card | gpt-4o-mini | ~1.500 | ~500 | ~€0,001 |

> **gpt-4o-mini pricing (maart 2026):** Input: $0,15/1M tokens. Output: $0,60/1M tokens.
> Dit is extreem goedkoop. OpenAI is niet je bottleneck.

### Kosten per actieve gebruiker per maand

| Gebruikspatroon | Scans/maand | Chat/maand | Rapport | Totaal/maand |
|---|---|---|---|---|
| Light user (3x/week) | 12 foto scans | 5 chats | 1 | ~€0,04 |
| Regular user (5x/week) | 25 foto scans | 15 chats | 4 | ~€0,10 |
| Power user (dagelijks) | 60 foto scans | 40 chats | 4 | ~€0,22 |

### Geschatte API-kosten per schaal

| Actieve gebruikers | Mix | API kosten/maand |
|---|---|---|
| 50 | Meest light | ~€3-5 |
| 200 | Mix | ~€15-25 |
| 500 | Mix | ~€35-60 |
| 1.000 | Mix | ~€70-120 |
| 5.000 | Mix | ~€350-600 |

> **Conclusie:** API-kosten zijn verwaarloosbaar bij kleine schaal. Zelfs bij 1.000 actieve gebruikers is het ~€100/maand. Dit wordt pas relevant boven 5.000+ DAU.

### Supabase variabele kosten

| Resource | Pro tier limiet | Overage kosten |
|---|---|---|
| Database | 8GB | €0,125/GB extra |
| Bandwidth | 250GB | €0,09/GB extra |
| Storage | 100GB | €0,021/GB extra |
| Edge Functions | 2M invocations | €2/100K extra |

Bij <1.000 gebruikers zit je ruim binnen de Pro limieten. Pas bijsturen bij 5.000+ actieve gebruikers.

### Push notifications

APNs (Apple Push Notification service) is gratis. Geen kosten.

---

## 3. Personeelskosten

| Persoon | Rol | Vaste kosten | Variabel | Toelichting |
|---|---|---|---|---|
| **Batuhan** | Marketing lead (contractor) | €__/maand | €__ per influencer deal + download bonussen | Zie `samenwerken/batuhan.md`. Realistisch startpunt: €100-200/maand vast. |
| **Burak** | Developer (Carve Travel) | €0 | Gedeelde operationele kosten | 70/30 equity split. Geen directe kosten voor Carve AI. Gedeelde kosten: hosting, tools, etc. voor Carve Travel apart. |

### Batuhan -- realistisch budget

| Fase | Vast/maand | Bonus structuur | Totaal geschat |
|---|---|---|---|
| Proefrun (2 weken) | €0 | Geen | €0 |
| Maand 1-3 | €__/maand | €__ per influencer deal | €__-__/maand |
| Maand 3+ (bij resultaat) | Evalueren | Opschalen | Evalueren |

> **Eerlijk:** met backpacking budget is €100-200/maand vast het maximum. De bonus-component maakt het aantrekkelijk als het werkt. Vul de exacte bedragen in na jullie gesprek.

---

## 4. Revenue Model

### Pricing

#### Jaar 1: Apple neemt 30%

Apple neemt **standaard 30%** van elke transactie. Het Small Business Program (15%) geldt pas nadat een individuele abonnee **12+ maanden** onafgebroken een auto-renewing subscription heeft. In je eerste jaar betaal je dus 30% op alles.

| Plan | Prijs | Apple's cut (30%) | Netto per sub |
|---|---|---|---|
| Pro Maandelijks | €4,99/maand | €1,50 | **€3,49** |
| Pro Jaarlijks | €29,99/jaar (~€2,50/maand) | €9,00 | **€20,99** (~€1,75/maand) |

> **Alle break-even berekeningen hieronder gebruiken de 30% rate.** Dit is de realiteit voor jaar 1.

#### Jaar 2+: Apple neemt 15% (voor retained subscribers)

Na 12+ maanden doorlopend abonnement daalt Apple's cut naar 15% per individuele subscriber (Small Business Program, <$1M omzet). Nieuwe subscribers betalen nog steeds 30% in hun eerste jaar.

| Plan | Met 15% cut | Netto per sub |
|---|---|---|
| Pro Maandelijks | €0,75 cut | **€4,24** |
| Pro Jaarlijks | €4,50 cut | **€25,49** (~€2,12/maand) |

> **Let op:** dit is per subscriber, niet per app-jaar. Een subscriber die in maand 6 start, betaalt jij pas in maand 18 het 15%-tarief. Je break-even verbetert geleidelijk naarmate subscribers langer blijven.

### Free vs Pro

| Feature | Free | Pro |
|---|---|---|
| Workout tracking | Onbeperkt | Onbeperkt |
| Diary / food logging | Onbeperkt | Onbeperkt |
| Social / leaderboard | Onbeperkt | Onbeperkt |
| Carve Rank | Onbeperkt | Onbeperkt |
| AI interacties | 3/dag | Onbeperkt |
| Persoonlijk dagelijks advies | Niet beschikbaar | Dagelijks AI advies |
| AI Trainer card | Alleen basistips | Volledig gepersonaliseerd |

> **Pro dagen verdienen:** Actieve gebruikers verdienen gratis Pro dagen via streaks en rank-ups. Dit verlaagt de effectieve conversie maar verhoogt retentie en engagement. De meest actieve gebruikers betalen het minst -- dat is de filosofie.

### Break-even berekening (Jaar 1 -- 30% Apple cut)

**Vaste kosten (infra):** ~€164-239/maand (zie sectie 1, incl. nieuwe kostenposten)
**Vaste + Batuhan:** ~€314-439/maand
**Vaste + Batuhan + backpacking:** ~€1.500-1.900/maand (alles-in)

| Break-even op... | Monthly subs nodig (netto €3,49) | Annual subs nodig (netto €1,75/maand) |
|---|---|---|
| Alleen infra (~€200) | 58 | 115 |
| Infra + marketing (~€400) | 115 | 229 |
| Alles-in incl. leven (~€1.700) | 487 | 972 |

> **Realiteit (jaar 1):** break-even op "alles inclusief leven" met alleen monthly subs = ~487 abonnees bij 30% Apple cut. Dat is fors. Een mix van monthly en annual, plus het bereiken van de 15% rate na jaar 1 voor retained subscribers, maakt het haalbaarder. Plan je runway op 18+ maanden.

---

## 5. Runway Berekening

### Beschikbaar budget

| Post | Bedrag |
|---|---|
| Spaargeld beschikbaar voor Carve | €__ |
| Andere inkomsten (freelance, etc.) | €__/maand |
| **Totaal beschikbaar** | **€__** |

### Monthly burn rate

> **"Minimum" scenario is verwijderd.** Als je met Batuhan werkt, is marketing geen optionele kostenpost. Het "Realistisch" scenario is je baseline.

| Kostenpost | Realistisch | Maximum |
|---|---|---|
| Infra (Supabase x2, Apple, API, Claude) | €164 | €239 |
| Marketing (Batuhan) | €150 | €250 |
| Backpacking Azie (incl. verzekering, coworking, visa) | €1.100 | €1.500 |
| Onverwacht (buffer 10%) | €141 | €199 |
| **Totaal burn rate** | **€1.555** | **€2.188** |

### Backpacking kosten Azie -- breakdown

| Post | Geschat/maand |
|---|---|
| Accommodatie (hostels/guesthouses) | €300-500 |
| Eten | €200-350 |
| Transport (lokaal) | €50-100 |
| Activiteiten | €50-100 |
| SIM/data | €15-25 |
| Zorgverzekering / reisverzekering | €80-130 |
| Coworking / betrouwbaar internet | €50-100 |
| Visakosten (gemiddeld) | €20-30 |
| Buffer | €100 |
| **Totaal** | **€1.100-1.500** |

> **Azie is goedkoop maar niet gratis.** Thailand/Vietnam/Indonesie: €1.000-1.200 is realistisch als je bewust leeft. Bali of toeristische hotspots: eerder €1.500+. Koop lokaal, eet lokaal, vermijd de westerse bubbel. Vergeet verzekering en coworking niet -- dat zijn reele maandelijkse kosten die snel oplopen.

### Runway

```
Runway (maanden) = (Spaargeld - €1.500 noodfonds) / Monthly burn rate

BELANGRIJK: Trek eerst €1.500 noodfonds af. Dat geld is NIET
beschikbaar voor operationele kosten. Zie "Noodfonds" in sectie 1.

Bij €10.000 spaargeld (€8.500 beschikbaar):
  Realistisch: €8.500 / €1.555 = ~5,5 maanden
  Maximum:     €8.500 / €2.188 = ~4 maanden

Bij €15.000 spaargeld (€13.500 beschikbaar):
  Realistisch: €13.500 / €1.555 = ~9 maanden
  Maximum:     €13.500 / €2.188 = ~6 maanden

Bij €20.000 spaargeld (€18.500 beschikbaar):
  Realistisch: €18.500 / €1.555 = ~12 maanden
  Maximum:     €18.500 / €2.188 = ~8,5 maanden

Vul je eigen bedrag in: (€__ - €1.500) / €1.555 = __ maanden
```

### Apple uitbetalingsvertraging

> **Apple betaalt met ~2 maanden vertraging.** Revenue die je in maart verdient, wordt pas in mei uitbetaald. Dit betekent dat je eerste 2-3 maanden geen inkomsten ontvangt, zelfs als je dag 1 subscribers hebt. Plan je runway hierop. De eerste revenue op je rekening komt pas ~3 maanden na launch.

---

## 6. Break-even Scenarios

### Scenario A: Alleen maandelijkse Pro (€4,99) -- Jaar 1 (30% Apple cut)

| Subscribers | Bruto revenue | Netto (na Apple 30%) | Min kosten gedekt? | Alles gedekt? |
|---|---|---|---|---|
| 10 | €50 | €35 | Nee | Nee |
| 25 | €125 | €87 | Nee | Nee |
| 50 | €250 | €175 | Ja (infra) | Nee |
| 100 | €500 | €349 | Ja (infra + marketing) | Nee |
| 200 | €998 | €698 | Ja | Nee |
| 350 | €1.747 | €1.222 | Ja | Bijna |
| 430 | €2.146 | €1.502 | Ja | **Ja (incl. leven)** |
| 500 | €2.495 | €1.747 | Ja | Ja + buffer |

> **Let op:** bij 30% Apple cut heb je ~430 monthly subs nodig voor break-even incl. levenskosten, niet 350. Het verschil is significant.

### Scenario B: Mix van monthly en annual -- Jaar 1 (30% Apple cut)

Aanname: 60% monthly, 40% annual (realistisch na eerste jaar)

| Total subs | Monthly (60%) | Annual (40%) | Bruto/maand | Netto/maand (70%) |
|---|---|---|---|---|
| 50 | 30 x €4,99 = €150 | 20 x €2,50 = €50 | €200 | €140 |
| 100 | 60 x €4,99 = €300 | 40 x €2,50 = €100 | €400 | €280 |
| 200 | 120 x €4,99 = €599 | 80 x €2,50 = €200 | €799 | €559 |
| 350 | 210 x €4,99 = €1.048 | 140 x €2,50 = €350 | €1.398 | €979 |
| 500 | 300 x €4,99 = €1.497 | 200 x €2,50 = €500 | €1.997 | **€1.398** |
| 600 | 360 x €4,99 = €1.796 | 240 x €2,50 = €600 | €2.396 | **€1.677** |

> **Break-even (alles-in, jaar 1):** ~500-550 subscribers bij een 60/40 monthly/annual mix met 30% Apple cut. Dat is meer dan de eerder berekende 350-400. Na jaar 2, als retained subscribers naar 15% cut gaan, verbetert dit richting ~400.

### De eerlijke realiteit

```
Gemiddelde fitness app:
- Conversie free → trial:    ~10-15%
- Conversie trial → paid:    ~3-8%
- Effectieve conversie:      ~0,5-2% van downloads

Wat dat betekent voor Carve (jaar 1, 30% Apple cut):
- ~430-550 paid subs nodig voor break-even (afhankelijk van mix)
- Bij 2% conversie = 21.500-27.500 downloads nodig
- Bij 5% conversie = 8.600-11.000 downloads nodig
- Bij 10% conversie (optimistisch, niche) = 4.300-5.500 downloads nodig

Na jaar 2 (15% cut voor retained subscribers):
- Break-even daalt naar ~350-400 subs
- Maar alleen voor subscribers die 12+ maanden actief zijn

De "earn Pro" mechanic maakt dit complexer:
- Actieve users verdienen Pro gratis → minder betaalders
- MAAR: hogere retentie → langere LTV → minder churn
- MAAR: meer actieve users → meer API kosten
- Netto effect: waarschijnlijk positief, maar moeilijk te voorspellen
```

---

## 7. Financiele Milestones

Gekoppeld aan de fases uit `groeiplan.md`:

| Milestone | Fase | Revenue | Wat het betekent |
|---|---|---|---|
| Eerste betaalde user | Fase 0 | €4,99/maand | Bewijs dat iemand wil betalen. Psychologisch enorm. |
| 10 betaalde users | Fase 0-1 | ~€50/maand | Infra kosten bijna gedekt. Eerste echte validatie. |
| €100 MRR | Fase 1 | €100/maand | Alle infra kosten gedekt. De app betaalt voor zichzelf. |
| €500 MRR | Fase 1-2 | €500/maand | Marketing budget gedekt. Eerste serieuze mijlpaal. |
| €1.000 MRR | Fase 2 | €1.000/maand | Bijna break-even inclusief levenskosten (Azie). |
| €1.500 MRR | Fase 2-3 | €1.500/maand | **Break-even inclusief alles.** Zelfvoorzienend. |
| €2.000 MRR | Fase 3 | €2.000/maand | Buffer. Ruimte voor groei-investeringen. |
| €2.300 MRR | Fase 3 | €2.300/maand | RevenueCat begint 1% te rekenen. Nog steeds verwaarloosbaar. |
| €5.000 MRR | Fase 4 | €5.000/maand | Eerste hire mogelijk. Serieus bedrijf. |
| €10.000 MRR | Fase 5 | €10.000/maand | Meerdere mensen, meerdere producten. €120K/jaar. |

### Tijdsinschatting (eerlijk)

| Milestone | Optimistisch | Realistisch | Pessimistisch |
|---|---|---|---|
| Eerste betaalde user | Week 1 | Maand 1 | Maand 3 |
| €100 MRR | Maand 2 | Maand 4-6 | Maand 8 |
| €500 MRR | Maand 4 | Maand 8-12 | Maand 15 |
| €1.500 MRR (break-even) | Maand 8 | Maand 14-18 | Maand 24+ |
| €5.000 MRR | Maand 14 | Maand 24-30 | 36+ maanden |

> **Eerlijk:** de meeste indie apps doen er 12-24 maanden over om break-even te draaien. Plan je runway daarop. Als het sneller gaat, mooi. Als het langer duurt, moet je het overleven.

---

## 8. Fiscaal (kort)

### KvK inschrijving

| Situatie | Actie |
|---|---|
| Nu (geen/minimale revenue) | Technisch verplicht als je commercieel actief bent. Maar handhaving bij <€1.000/jaar is minimaal. |
| Eerste serieuze revenue (>€100/maand) | **Schrijf je in als eenmanszaak.** Kost ~€75 eenmalig. Doe het. |
| >€50K/jaar omzet | Bespreek BV met boekhouder. |

### Eenmanszaak vs BV

| | Eenmanszaak | BV |
|---|---|---|
| Oprichting | €75 (KvK) | €500-1.000 (notaris + KvK) |
| Administratie | Simpel | Jaarrekening verplicht |
| Belasting | IB (tot 49,5%) | VPB 19% tot €200K + DGA-salaris |
| Omslagpunt | - | Rond €80-100K winst/jaar |
| Aansprakelijkheid | Privevermogen | Beperkt tot BV |
| **Advies nu** | **Dit.** | Pas bij €50K+ winst/jaar. |

### BTW

| Situatie | Actie |
|---|---|
| App Store verkopen (B2C, EU) | Apple handelt BTW af. Jij ontvangt netto. **Geen actie nodig.** |
| Diensten aan bedrijven (B2B) | BTW-registratie nodig. Niet relevant nu. |
| KOR (Kleine Ondernemers Regeling) | Bij <€20.000 omzet/jaar: vrijstelling van BTW. Aanvragen bij Belastingdienst. |

### Belasting op App Store inkomsten

```
Apple betaalt je netto uit (na hun 30% cut in jaar 1, 15% na 12+ maanden per subscriber).
Wat jij ontvangt is je omzet.

Als eenmanszaak:
- Inkomsten = omzet
- Kosten aftrekbaar (Supabase, Apple fee, OpenAI, laptop, etc.)
- Winst = omzet - kosten
- Belasting: progressief IB-tarief (tot 36,97% onder ~€76K, daarna 49,5%)
- Startersaftrek: ~€2.123 (eerste 3 jaar)
- Zelfstandigenaftrek: ~€3.750 (2026, daalt jaarlijks) -- LET OP: vereist urencriterium!
- MKB-winstvrijstelling: 12,7% van resterende winst
- Inkomensafhankelijke bijdrage Zvw: ~5,32% over bijdrage-inkomen (niet vergeten!)

Voorbeeld bij €2.000 MRR (€24.000/jaar omzet):
- Omzet: €24.000
- Kosten: ~€5.000 (infra, marketing, laptop afschrijving)
- Winst: €19.000
- Zelfstandigenaftrek: -€3.750
- Startersaftrek: -€2.123
- MKB-vrijstelling: -€1.667
- Belastbaar inkomen: ~€11.460
- Belasting (box 1): ~€4.230
- Zvw-bijdrage (~5,32% over €11.460): ~€610
- Totaal belasting + Zvw: ~€4.840
- Netto: ~€14.160

Disclaimer: dit zijn schattingen. Neem een boekhouder als je boven
€10.000/jaar omzet komt. Kost ~€100-150/maand maar bespaart fouten.
```

### Fiscale blinde vlekken -- lees dit voor je vertrekt

#### Belastingplicht bij verblijf buitenland

Als je >6 maanden in het buitenland verblijft en je uitschrijft bij de BRP (Basisregistratie Personen), verlies je mogelijk:
- **Zelfstandigenaftrek** (~€3.750/jaar)
- **Startersaftrek** (~€2.123/jaar)
- Recht op KOR (Kleine Ondernemers Regeling)

Dit kan duizenden euro's per jaar schelen. **Raadpleeg een belastingadviseur VOOR je vertrekt**, niet erna. Kosten: ~€150-300 voor een consult. Dat verdient zich terug.

#### Urencriterium

Om in aanmerking te komen voor zelfstandigenaftrek moet je minimaal **1.225 uur per jaar** aan je onderneming besteden. Dat is ~24 uur per week. Bij fulltime development is dit realistisch, maar je moet het **aantoonbaar bijhouden**. Gebruik een simpele urenregistratie (spreadsheet of app).

#### ZZP/schijnzelfstandigheid risico met Batuhan

Als Batuhan geen eigen KvK-inschrijving heeft en alleen voor jou werkt, kan de Belastingdienst de relatie herclassificeren als **dienstverband**. Consequenties:
- Naheffing loonbelasting
- Boetes
- Werkgeverspremies alsnog verschuldigd

**Oplossing:** Zorg dat Batuhan zich **inschrijft bij KvK** als zelfstandige. Maak een opdrachtovereenkomst (geen arbeidsovereenkomst). Zorg dat hij ook voor andere opdrachtgevers werkt of kan werken.

#### Inkomensafhankelijke bijdrage Zvw

Bovenop je IB-belasting betaal je ~**5,32%** inkomensafhankelijke bijdrage voor de Zorgverzekeringswet (Zvw) over je bijdrage-inkomen. Dit wordt vaak vergeten in berekeningen. Bij €19.000 winst is dat ~€1.010 extra per jaar. Zie het rekenvoorbeeld hierboven.

#### Zorgverzekering in het buitenland

Bij uitschrijving uit BRP vervalt je Nederlandse zorgverzekering. Je hebt dan een internationale reisverzekering nodig. Dit is **geen optionele kostenpost** -- zonder verzekering ben je een medisch noodgeval verwijderd van financiele ramp. Zorg dat je verzekering ook elektronica dekt (laptop = je bedrijf).

### Actielijst fiscaal

- [ ] KvK inschrijven als eenmanszaak (doe dit voor of vlak na eerste serieuze revenue)
- [ ] KOR aanvragen bij Belastingdienst (als omzet <€20K/jaar)
- [ ] **Belastingadviseur raadplegen VOOR vertrek naar Azie** (kosten: ~€150-300, bespaart duizenden)
- [ ] Urenregistratie opzetten en bijhouden (1.225 uur/jaar vereist voor zelfstandigenaftrek)
- [ ] Batuhan laten inschrijven bij KvK + opdrachtovereenkomst opstellen
- [ ] Internationale reisverzekering regelen (met elektronica dekking)
- [ ] Boekhouding bijhouden (Moneybird, e-Boekhouden, of Excel is ook prima bij laag volume)
- [ ] Boekhouder zoeken bij >€10.000/jaar omzet
- [ ] Alle zakelijke kosten bewaren (bonnetjes/facturen: Supabase, Apple, API's, laptop, etc.)

---

## 9. Maandelijks Tracking Template

Kopieer dit elke maand en vul in:

```
## Maand: [maand jaar]

### Revenue
- MRR: €__
- Nieuwe subscribers: __
- Churned subscribers: __
- Netto subscriber groei: __
- Monthly subs: __ (€__)
- Annual subs: __ (€__)
- Apple uitbetaling ontvangen: €__

### Kosten
- Supabase (Carve AI): €__
- Supabase (Carve Travel, 70%): €__
- OpenAI API: €__
- Claude API: €__
- Apple Developer: €8,25
- Batuhan: €__
- Overige: €__
- **Totaal kosten: €__**

### Levenskosten
- Accommodatie: €__
- Eten: €__
- Transport: €__
- Zorgverzekering: €__
- Coworking/internet: €__
- Visakosten: €__
- Overig: €__
- **Totaal levenskosten: €__**

### Samenvatting
- Bruto revenue: €__
- Totaal kosten (infra + team): €__
- Totaal levenskosten: €__
- **Netto resultaat: €__**
- Resterend spaargeld: €__
- Resterende runway: __ maanden

### Metrics
- Downloads deze maand: __
- Actieve gebruikers (DAU): __
- Actieve gebruikers (MAU): __
- Trial starts: __
- Trial → Pro conversie: __%
- Free → Trial conversie: __%
- Churn rate: __%
- Gemiddelde sessieduur: __

### Marketing
- Influencers benaderd: __
- Influencers akkoord: __
- Reddit posts: __
- Content geplaatst: __
- Beste kanaal: __

### Notities
[Wat ging goed, wat ging slecht, wat verandert er volgende maand]
```

### Maandelijkse cashflow tracking (spreadsheet)

> **Maak een simpele spreadsheet** (Google Sheets of Numbers) met maand-voor-maand cashflow. Dit document is goed voor planning, maar een spreadsheet is beter voor tracking. Belangrijke kolommen:

```
| Maand | Spaargeld begin | Revenue verdiend | Apple uitbetaling ontvangen | Kosten | Spaargeld eind |
|-------|-----------------|------------------|-----------------------------|--------|----------------|
| Mrt   | €__             | €__              | €0 (nog niet)               | €__    | €__            |
| Apr   | €__             | €__              | €0 (nog niet)               | €__    | €__            |
| Mei   | €__             | €__              | €__ (maart revenue)         | €__    | €__            |
```

> **Waarom apart van dit document?** Apple betaalt ~2 maanden vertraagd. In een spreadsheet kun je de kolom "revenue verdiend" en "uitbetaling ontvangen" naast elkaar zetten. Zo zie je het verschil tussen wat je verdient en wat er daadwerkelijk op je rekening staat. Je eerste 2-3 maanden draai je puur op spaargeld, ongeacht je subscriber count.

---

## 10. Belangrijkste Inzichten

1. **API-kosten zijn niet je probleem.** gpt-4o-mini is zo goedkoop dat je je er geen zorgen over hoeft te maken tot 5.000+ gebruikers. Focus op groei, niet op optimalisatie.

2. **Apple's 30% cut is je grootste "kostenpost" in jaar 1.** Elke euro die binnenkomt, Apple pakt er 30 cent van. Na 12+ maanden per subscriber daalt dat naar 15%. Reken in jaar 1 altijd met 30%.

3. **De eerste €100 MRR is het belangrijkst.** Niet financieel, maar psychologisch. Het bewijst dat mensen willen betalen.

4. **Runway is alles.** Weet precies hoeveel maanden je hebt. Houd €1.500 noodfonds apart. Als je runway onder 3 maanden komt zonder revenue-groei, moet je een plan B hebben (freelance werk, terug naar NL, etc.).

5. **Apple betaalt 2 maanden vertraagd.** Je eerste revenue op je rekening komt pas ~3 maanden na launch. Plan hier expliciet voor.

6. **Houd het simpel, maar track het echt.** Dit document + een simpele cashflow spreadsheet is genoeg. Geen fancy financial tools nodig tot je boven €5.000 MRR zit.

7. **Backpacking + bootstrapping is een goedkope combo.** €1.100-1.500/maand all-in is minder dan een kamer huren in Amsterdam. Gebruik dat voordeel. Maar vergeet de verborgen kosten niet (verzekering, coworking, visa).

8. **Regel je fiscale zaken VOOR vertrek.** Belastingadviseur, urenregistratie, Batuhan's KvK-inschrijving, internationale verzekering. Dit zijn geen nice-to-haves.

---

*Dit document wordt maandelijks bijgewerkt. Laatste update: maart 2026.*
*Vul alle __ velden in met je eigen cijfers. Print dit niet -- het is een levend document.*
