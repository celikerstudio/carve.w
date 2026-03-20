# Web App Roadmap

Last updated: 2026-03-20

## De kernvraag

De iOS-app is waar je traint, logt en coached wordt. Wat doet de web-app dat iOS niet doet?

**Antwoord: Command center.** Overzicht, analyse, diepte. Grotere scherm = meer context tegelijk. Keyboard = betere chat. Wiki = kennisbank. De web-app is waar je je leven *overziet*, de iOS-app is waar je het *leeft*.

---

## Phase 1: Maak het echt ✅
> Doel: De web-app toont echte health data uit Supabase. Geen nieuwe health mock-first work meer.

### 1.1 — Context panel op echte health data ✅
- `useHealthData` hook fetcht workouts, diary_entries, daily_steps, profiles parallel uit Supabase
- WorkoutCard, WeekCard, TodayCard, StreakCard tonen echte data met loading skeletons
- HealthDataContext deelt data tussen cards (één fetch)
- Money/Life cards nog mock — worden echt in Phase 3

### 1.2 — activeApp + echte context naar AI ✅
- API route proxyt naar dezelfde `coach-chat` edge function als iOS
- `buildCoachContext()` bouwt een echte health-focused context payload uit Supabase-data
- Zelfde AI entrypoint als iOS voor personality, quota, tool routing en streaming
- **Remaining gap:** web injecteert nog niet de nieuwste iOS-contextvelden (key facts, profile/logbook, rijkere workout/meal velden)
- SSE stream vertaald naar AI SDK protocol

### 1.3 — Chat history persistence ✅
- `ai_conversations` + `ai_messages` tabellen in Supabase (RLS, indexes, auto-update trigger)
- `useChatHistory` hook voor conversation CRUD (list, create, load, delete)
- CarveChat maakt conversation aan bij eerste bericht, slaat messages op per exchange
- Sidebar toont echte conversation lijst met timestamps, klikbaar om te hervatten
- Conversations overleven page refresh

### 1.4 — Design system cleanup ✅ (mostly done)
- Warm palette (#191a1c bg), higher text opacities throughout
- ChatContextPanel refactored to card registry pattern (individual card components)
- Sidebar restructured: apps as primary nav, collapsible icon rail
- Input bar with toolbar row
- **Remaining:** Hardcoded username in greeting, semantic token migration

**Resultaat Phase 1:** Een werkende chat-app die echte health data toont, onthoudt, en dezelfde AI backend-entrypoint gebruikt als iOS.

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
- Toon de 50 coach memory facts + coach profile sections
- Bewerk, archiveer, categoriseer facts via web UI
- Coach logbook: browse observations, milestones, concerns
- Trek web `buildCoachContext()` dichter naar de nieuwste iOS `CoachContext` shape
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

### 3.1 — Money domein (als eerste) ✅
- Supabase: `money_transactions`, `money_budgets`, `money_subscriptions` + profiles uitgebreid
- `useMoneyData` hook met error handling en refetch
- Context panel cards op echte data (budget, transactions, subscriptions, bills)
- `buildMoneyContext()` stuurt financiële data naar coach edge function
- Edge function toont conditioneel money context + financieel GEDRAG
- Add Transaction / Add Subscription modals vanuit context panel
- 12 canonical categorieën door hele codebase
- **Open:** bank API, CSV import, money coach tools, cross-domein koppeling

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
1.1  Context panel → echte data          ✅ done
1.2  activeApp + context → AI            ✅ done
1.3  Chat history persistence            ✅ done
1.4  Design system cleanup               ✅ mostly done
2.1  Health dashboard view               ← NEXT
2.2  Coach memory management
2.3  Wiki / kennisbank
2.4  Mobile responsive
3.1  Money domein                       ✅ done
3.2  Cross-domein intelligence          ← NEXT
3.3  Life/travel domein
4.x  Social, Carve Score, onboarding, performance
```

---

## Hoe te werken

Eén item per sessie. Begin met "ik wil 2.1 bouwen" en we gaan.
Elk item is af als het echte data toont en productie-klaar aanvoelt.
Geen nieuwe health mock-first features meer na Phase 1. Bestaande money/life placeholders blijven tot Phase 3.
