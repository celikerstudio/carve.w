# Web App Roadmap

Last updated: 2026-03-20

## De kernvraag

De iOS-app is waar je traint, logt en coached wordt. Wat doet de web-app dat iOS niet doet?

**Antwoord: Command center.** Overzicht, analyse, diepte. Grotere scherm = meer context tegelijk. Keyboard = betere chat. Wiki = kennisbank. De web-app is waar je je leven *overziet*, de iOS-app is waar je het *leeft*.

---

## Phase 1: Maak het echt
> Doel: De web-app toont echte data uit Supabase. Geen mock meer.

### 1.1 — Context panel op echte health data ✅ (partially done)
- Health cards connected to Supabase via useHealthData hook
- Workout, week, today, streak cards show real data when available
- Money/Life cards still mock — need real data connections
- **Status:** Health done, other domains need same treatment

### 1.2 — activeApp doorgeven aan AI ✅ (done)
- activeApp sent in chat API request body via Supabase edge function proxy
- Web app now uses same edge function as iOS (coach-chat)
- Edge function handles: model selection, personality, memory, quota, tools
- **Remaining:** Enrich context payload with real user profile data from Supabase

### 1.3 — Chat history persistence
- Sla conversaties op in Supabase (of gebruik bestaande iOS-tabel als die er is)
- Sidebar toont echte chat history, niet hardcoded items
- Conversations overleven page refresh
- **Waarom:** Zonder persistence voelt chat als een wegwerptool

### 1.4 — Design system cleanup ✅ (mostly done)
- Warm palette (#191a1c bg), higher text opacities throughout
- ChatContextPanel refactored to card registry pattern (individual card components)
- Sidebar restructured: apps as primary nav, collapsible icon rail
- Input bar with toolbar row
- **Remaining:** Hardcoded username in greeting, semantic token migration

**Resultaat Phase 1:** Een werkende chat-app die je echte health data toont en onthoudt.

---

## Phase 2: Web-native kracht
> Doel: Features die web beter doet dan iOS. De reden om de web-app te openen.

### 2.1 — Health dashboard view
- Naast chat: een dashboard-modus voor health
- Grafieken: gewichtstrend, macro's over tijd, trainingsvolume, stappen
- Grotere scherm = meer data tegelijk dan iOS Progress tab
- Week/maand vergelijkingen naast elkaar
- **Waarom:** Dit is wat web beter doet — overzicht en analyse

### 2.2 — Coach memory management
- Toon de 50 coach memory facts
- Bewerk, archiveer, categoriseer facts via web UI
- Op iOS is dit compact; op web kun je het uitgebreid tonen
- **Waarom:** Power user feature die beter werkt met keyboard en groot scherm

### 2.3 — Wiki / kennisbank
- Persoonlijke kennisbank: artikelen, notities, opgeslagen coach inzichten
- Coach kan verwijzen naar wiki-artikelen in antwoorden
- Doorzoekbaar, getagd per domein
- **Waarom:** Uniek web-voordeel. iOS is niet ideaal voor langere content.

### 2.4 — Mobile responsive
- Sidebar → hamburger menu op mobile
- Context panel → sheet/drawer op mobile
- Touch-friendly input
- **Waarom:** Niet iedereen zit achter desktop. Maar dit is bewust ná de desktop-ervaring.

**Resultaat Phase 2:** Een web-app waar je naartoe gaat voor overzicht en diepte die iOS niet biedt.

---

## Phase 3: Multi-domein
> Doel: Tweede domein live. Cross-domein intelligence begint.

### 3.1 — Money domein (als eerste)
- Wat: budget overview, uitgaven, spaardoelen
- Integratie: afhankelijk van wat beschikbaar is (bank API, handmatig, CSV import)
- Context panel: echte financiële data
- Coach: money-specifieke tools en prompts
- **Waarom money eerst:** Meetbaar, concrete feedback loop (net als health)

### 3.2 — Cross-domein intelligence
- Coach ziet health + money data tegelijk
- Eerste connecties: "€180 aan bezorgeten deze maand → impact op voedingsdoelen"
- Context panel kan cross-domein inzichten tonen
- **Waarom:** Dit is de USP. Zonder dit ben je gewoon twee losse apps.

### 3.3 — Life/travel domein
- Trip planning, bucketlist, afspraken
- Coach tools: trip planner (al deels gebouwd in web)
- **Waarom later:** Minder frequente interactie dan health/money

**Resultaat Phase 3:** De belofte wordt waargemaakt — één AI die meerdere levensdomeinen verbindt.

---

## Phase 4: Groei & polish
> Doel: Klaar voor meer gebruikers.

### 4.1 — Social op web
- Leaderboard, friend profiles, activity feed
- Web-voordeel: meer ruimte voor vergelijking en detail

### 4.2 — Carve Score activeren
- Score berekening live zetten (RPC bestaat al)
- Ranking pagina op web
- Score history met trends

### 4.3 — Onboarding flow
- Nieuwe gebruiker → profiel setup → eerste chat → eerste data sync
- Werkt voor web-only users (zonder iOS app)

### 4.4 — Performance & SEO
- SSR optimalisatie
- Public wiki pagina's (SEO traffic)
- Load time optimalisatie

---

## Wat we NIET doen op web

- Workout tracking met timer (iOS doet dit beter met haptics/touch)
- Barcode scanning voor food (camera = native)
- HealthKit sync (alleen iOS)
- Food foto analyse (kan, maar iOS camera is natuurlijker)

De web-app vervangt iOS niet. Ze vullen elkaar aan.

---

## Prioriteitsvolgorde (kort)

```
1.1  Context panel → echte data          ✅ health done, others mock
1.2  activeApp → AI via edge function    ✅ done
1.3  Chat history persistence            ← NEXT
1.4  Design system cleanup               ✅ mostly done
2.1  Health dashboard view
2.2  Coach memory management
2.3  Wiki / kennisbank
2.4  Mobile responsive
3.1  Money domein
3.2  Cross-domein intelligence
3.3  Life/travel domein
4.x  Social, Carve Score, onboarding, performance
```

---

## Hoe te werken

Eén item per sessie. Begin met "ik wil 1.1 bouwen" en we gaan.
Elk item is af als het echte data toont en productie-klaar aanvoelt.
Geen mock data meer na Phase 1.
