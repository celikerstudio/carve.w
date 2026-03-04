> **SUPERSEDED:** De marketing-gerelateerde secties van dit document zijn vervangen door `docs/plans/2026-03-04-marketing-strategy-design.md`. Het financieel plan en de business roadmap in dit document zijn nog steeds actueel.

# Carve — Van App naar Business

**Datum:** 3 maart 2026
**Status:** Roadmap — levend document
**Startpunt:** Live app, 902 commits, 0 bewezen revenue, solo developer

---

## De Harde Waarheid

Je hebt een product maar nog geen business. Een business heeft klanten die betalen. Alles wat je doet moet gericht zijn op die eerste betalende gebruikers. Downloads zijn ijdelheid. Retentie is waarheid. Revenue is bewijs.

---

## Fase 0: De Basis (nu — voor vertrek naar Azie)

**Status:** App is live, geen bewezen revenue, geen bewezen groei.

### Acties
- [ ] App Store listing optimaliseren — eerste 3 regels verkopen, niet beschrijven. "50kg afgevallen. Toen bouwde ik de app die ik zelf nodig had." slaat harder dan "AI fitness tracker."
- [ ] Eerste 10-20 gebruikers persoonlijk werven (vrienden, sportschool, Reddit)
- [ ] Eerste Pro conversie realiseren — ook al is het er maar 1
- [ ] Marketing samenwerking starten (contractor, proefperiode)
- [ ] Feedback loop activeren — feature request board is al gebouwd, gebruik het
- [ ] Analytics inrichten — weet wat gebruikers doen in de app (welke tabs, hoe lang, waar ze afhaken)

### Milestone
Eerste betaalde gebruiker die je niet persoonlijk kent.

---

## Fase 1: Product-Market Fit (maand 1-6)

**De test:** Als je morgen stopt met marketing, blijven mensen de app gebruiken? Vertellen ze het aan vrienden? Dat is product-market fit. Zonder dit is alles wat volgt zinloos.

### Kernmetrics

| Metric | Wat het vertelt | Doel |
|--------|----------------|------|
| Day 1 retentie | Eerste indruk | >40% |
| Day 7 retentie | Gewoonte-vorming | >20% |
| Day 30 retentie | Echte waarde | >10% |
| Trial → Pro conversie | Betalingsbereidheid | 10-15% |
| Churn rate | Waarom mensen weggaan | <8%/maand |

### Acties
- [ ] Retentie meten per cohort (week over week)
- [ ] Elke nieuwe gebruiker persoonlijk benaderen — "Wat vind je ervan? Wat mis je?" Niet via survey. DM of chat.
- [ ] Churn analyseren — waarom stoppen mensen? Na hoeveel dagen? Na welke actie?
- [ ] Itereren op wat werkt — als workout tracker populairder is dan food scanner, bouw daar meer van
- [ ] Pricing testen — probeer €2.99, €4.99, €7.99. Kijk wat converteert.
- [ ] Onboarding optimaliseren — elke stap waar gebruikers afhaken is een lek

### Milestone
100 actieve gebruikers, 10% Pro conversie, 30-day retentie boven 20%.

---

## Fase 2: Groei Engine (maand 6-12)

**De vraag:** Je hebt bewezen dat mensen je app willen. Hoe vind je er meer?

### Groei-engines

| Engine | Hoe het werkt | Kost geld? | Past bij Carve? |
|--------|--------------|------------|-----------------|
| Viral | Gebruikers brengen andere gebruikers | Nee | Ja — recap cards, leaderboards, referrals |
| Content | SEO, social media, video's | Nee | Ja — jouw verhaal, build in public |
| Betaald | Ads op Instagram/TikTok | Ja | Later — pas als CAC < LTV bewezen is |

**Strategie:** Viral + Content eerst. Betaald pas als de unit economics kloppen.

### Acties
- [ ] Delen makkelijk maken — recap cards, workout summaries, streak milestones naar Instagram Stories
- [ ] Content routine vanuit Azie — 3x per week, rauw en echt
- [ ] Influencer programma opschalen via marketing vriend
- [ ] Referral systeem bouwen — "Nodig een vriend uit, jullie krijgen allebei 1 maand Pro"
- [ ] CAC meten (cost per acquisition) — hoeveel kost het om 1 gebruiker te krijgen?
- [ ] LTV meten (lifetime value) — hoeveel is 1 gebruiker gemiddeld waard?
- [ ] ASO (App Store Optimization) — keywords, screenshots, beschrijving A/B testen
- [ ] Reddit strategie uitvoeren — 5 subreddits, 5 verschillende angles van hetzelfde verhaal

### Unit Economics

```
LTV moet > 3x CAC zijn, anders verlies je geld bij groei.

Voorbeeld:
- Pro = €4.99/maand
- Gemiddelde levensduur Pro user = 6 maanden
- LTV = €4.99 x 6 = €29.94
- CAC moet dan < €10 zijn

Als CAC = €5 → gezond, schaal op
Als CAC = €25 → probleem, fix retentie of pricing eerst
```

### Milestone
1.000 actieve gebruikers, €500+ MRR (monthly recurring revenue).

---

## Fase 3: Revenue Machine (maand 12-18)

**Focus:** Groei zonder revenue is een hobby. Nu maak je er een machine van.

### Acties
- [ ] Monetisatie optimaliseren — paywall timing, pricing tiers, annual vs monthly
- [ ] Annual subscription pushen — €39.99/jaar vs €4.99/maand. Annual = minder churn + cash upfront.
- [ ] Tweede revenue stream overwegen:
  - Premium workout templates/plans (eenmalige aankoop)
  - Coaching tier (hoger dan Pro, met meer AI features)
  - Nutrition plans
- [ ] Churn verlagen — push notifications, streak mechanics, community engagement
- [ ] KvK inschrijving als eenmanszaak
- [ ] Boekhouder regelen — BTW, inkomstenbelasting, administratie
- [ ] Trademark afronden — EUIPO registratie compleet, "Carve" breed beschermd
- [ ] Privacy/AVG compliance checken — je verwerkt gezondheidsdata, dat is extra gevoelig

### Wanneer BV oprichten

| Omzet | Advies |
|-------|--------|
| < €20K/jaar | Eenmanszaak is prima |
| €20-50K/jaar | Bespreek met boekhouder, kan nog eenmanszaak |
| > €50K/jaar | BV wordt fiscaal voordeliger, bespreek met boekhouder |
| Investeerders of partners | BV is noodzakelijk |

### Milestone
€2.000+ MRR, positieve unit economics (LTV > 3x CAC).

---

## Fase 4: Team & Structuur (maand 18-30)

**Focus:** Als de revenue er is, investeer in mensen. Niet eerder.

### Team opbouwen

| Rol | Wanneer | Hoe |
|-----|---------|-----|
| Marketing (al gestart) | Nu | Contractor, vast + bonus |
| Developer (Carve Travel) | Maand 3-6 | Partnership, 60/40 |
| Customer support | Bij 1.000+ users | Freelancer, per uur |
| Community manager | Bij 2.000+ users | Part-time, content + engagement |
| Eerste echte hire | Bij €5K+ MRR | Afhankelijk van bottleneck |

### Acties
- [ ] Developer vriend inzetten voor Carve AI features (als contractor) als Carve Travel samenwerking bewezen is
- [ ] Marketing vriend opschalen als resultaten er zijn
- [ ] Processen documenteren — hoe release je een update? Hoe handle je bugs? Hoe onboard je iemand?
- [ ] Kennis delen — niet alles in je hoofd houden. Documenteer architectuur, deployment, credentials (veilig).
- [ ] Eerste customer support workflow opzetten (in-app feedback, email, reactietijd)

### Milestone
Team van 3-5 mensen (mix vast en freelance), €5.000+ MRR.

---

## Fase 5: Schaal (maand 30+)

### Twee paden

| Pad | Voordelen | Nadelen |
|-----|-----------|---------|
| **Bootstrap** | Jouw tempo, jouw regels, geen druk, volledige controle | Langzamer, beperkt budget, alles zelf |
| **Funding** | Sneller, groter team, meer marketing budget | Verlies van controle, druk om te groeien, investeerders praten mee |

### Aanbeveling: Bootstrap

Het past bij wie je bent. Solo builder, eigen tempo, eigen visie. Investeerders veranderen dat. Ze willen sneller, groter, en ze willen meepraten.

### Het Carve Ecosysteem als Strategie

```
Carve AI      → Fitness (live)
Carve Travel  → Reizen (in development met partner)
Carve Money   → Financien (gepland)
Carve Mind    → Mentale gezondheid (idee)
Carve Habits  → Gewoontes (idee)
```

Elk product voedt het merk. Elk product is een aparte revenue stream. Cross-selling tussen apps. Gedeelde gebruikersbasis.

Als drie Carve apps elk €3K MRR doen = €108K/jaar zonder investeerders.

### Milestone
Meerdere Carve producten live, €10K+ MRR totaal, zelfvoorzienend team.

---

## De Realiteit

| Feit | Waarom het ertoe doet |
|------|----------------------|
| 95% van apps verdient niks | Je moet in de 5% komen. Dat vereist retentie, niet downloads. |
| Eerste €1.000 MRR is het moeilijkst | Daarna heb je bewijs, data, en momentum. |
| Het duurt langer dan je denkt | Plan op 18-24 maanden tot serieuze revenue, niet 3. |
| Je gaat twijfelen | Vooral maand 4-8 als groei langzaam is. Dat is normaal. Iedereen heeft dat. |
| De app is 20% van het werk | Marketing, support, community, en doorzetten zijn de andere 80%. |
| Perfectie is de vijand | Ship fast, iterate faster. Je v1.1 is al beter dan v1.0. Blijf dat doen. |

---

## Jouw Oneerlijke Voordelen

Wat je hebt dat anderen niet hebben:

1. **Het verhaal** — 130kg naar 80kg naar app bouwen naar solo Azie. Niet te faken. Niet te kopieren.
2. **Het product** — het bestaat, het is live, het werkt. Je bent voorbij het punt waar 90% van de mensen stopt.
3. **De skills** — je kunt in 2 weken een hele feature bouwen. Snelheid die geld niet kan kopen.
4. **De discipline** — 364 commits in december. Niemand hoeft je te motiveren.
5. **De reis** — bouwen vanuit Azie is content, verhaal, en inspiratie tegelijk.
6. **De vrienden** — mensen die willen helpen. Dat is zeldzaam. Gebruik het goed.

---

## Quarterly Check-in Template

Elke 3 maanden, eerlijk invullen:

```
Datum: __
Actieve gebruikers: __
MRR: €__
Pro conversie rate: __%
30-day retentie: __%
CAC: €__
LTV: €__
Team grootte: __
Grootste win: __
Grootste probleem: __
Focus komende 3 maanden: __
```

---

## De Simpele Versie

```
Stap 1: Krijg mensen die betalen (product-market fit)
Stap 2: Vind meer van die mensen (groei)
Stap 3: Hou ze langer (retentie)
Stap 4: Huur hulp in (team)
Stap 5: Herhaal met meer producten (ecosysteem)
```

Alles daartussen is details. En details zijn belangrijk — maar verlies het simpele plaatje niet uit het oog.

---

*Dit document wordt elke 3 maanden bijgewerkt met de quarterly check-in. Het is een kompas, geen GPS — de route kan veranderen, de richting niet.*
