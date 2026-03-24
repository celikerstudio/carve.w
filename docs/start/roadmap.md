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
- **Open:** bank API, CSV import, money coach tools

### 3.2 — Cross-domein intelligence ✅
- `activeDomains` auto-detectie in API route: detecteert welke domeinen data hebben (health, money), stuurt alle actieve domeinen mee
- System prompt met cross-domein coaching logica: coach legt verbanden tussen domeinen wanneer relevant, zonder te forceren
- Apple-aanpak: geen "cross-domain feature" in de UI, de coach is gewoon slimmer — verbindt dots als een mens dat ook zou doen
- Thinking steps tonen "Domeinen actief: health, money" wanneer cross-domein actief is
- Edge function v11 live met cross-domein gedragsregels + goede/slechte voorbeelden
- **Open:** cross-domein insight cards in context panel, travel/social context builders, cross-domein coach tools

### 3.3 — Life/travel domein
- Trip planning, bucketlist, afspraken
- Coach tools: trip planner (al deels gebouwd in web)
- **Waarom later:** Minder frequente interactie dan health/money

**Resultaat Phase 3:** De belofte wordt waargemaakt — één AI die meerdere levensdomeinen verbindt.

---

## Phase 4: Personal OS
> Doel: Carve wordt een echt besturingssysteem voor je leven.

### 4.1 — Navigatie herstructurering
- 3 top-level modi (Perplexity-stijl): Coach (chat) / Dashboard (data) / Brein (memory)
- Domain-switching (health/money/life) verschuift naar binnen Coach en Dashboard
- Sidebar: modi bovenaan, utility items (nieuwe chat, geschiedenis, instellingen), recente chats onderaan

### 4.2 — Coach Brein (upgraded 2.2)
- Memory facts: bekijken, bewerken, archiveren, reactiveren per categorie
- Coach profile secties: inline editbaar (doelen, schema, beperkingen, voeding, coaching)
- Logbook timeline: observaties, milestones, zorgen — read-only vanuit coach
- Geïntegreerd in de Brein-modus, niet als losse pagina

### 4.3 — Taken systeem
- Coach geeft taken: "Deze week 4x 130g+ eiwit"
- Scheduled/recurring tasks: "Elke zondag: weeg jezelf"
- Automatische tracking via bestaande data (diary_entries, workouts, transacties)
- Cross-domein taken: "Meal prep 4x deze week" tracked via food logs + money
- Supabase: `coach_tasks`, `task_completions` tabellen nodig
- Overzicht in sidebar utility items

### 4.4 — Smart Inbox / Email integratie
- Email binnenkomst → AI parsed → automatisch taak, transactie, of trip-update
- Factuur → money transactie, vluchtbevestiging → trip update, afspraak → taak
- De AI als triage-laag op je hele leven
- **Waarom:** Dit maakt Carve het centrale punt — je hoeft niet meer zelf te loggen

### 4.5 — Social op web
- Leaderboard, friend profiles, activity feed

### 4.6 — Carve Score activeren
- Score berekening live zetten (RPC bestaat al)
- Ranking pagina, score history met trends

### 4.7 — Onboarding flow
- Nieuwe gebruiker → profiel setup → eerste chat → eerste data sync

### 4.8 — Performance & SEO
- SSR optimalisatie, public wiki pagina's, load time

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
2.1  Health dashboard view               ✅ done (/health route, 4 charts, time range)
2.2  Coach memory management
2.3  Wiki / kennisbank
2.4  Mobile responsive
3.1  Money domein                       ✅ done
3.2  Cross-domein intelligence          ✅ done (prompt-side, auto-detect)
3.3  Life/travel domein                 ← NEXT
4.x  Social, Carve Score, onboarding, performance
```

---

## Hoe te werken

Eén item per sessie. Begin met "ik wil 2.1 bouwen" en we gaan.
Elk item is af als het echte data toont en productie-klaar aanvoelt.
Geen nieuwe health mock-first features meer na Phase 1. Bestaande money/life placeholders blijven tot Phase 3.
