# Web App — Current Status

Last updated: 2026-03-20
Branch: `main`

## Route Structure

All user-facing pages live as top-level routes within `(protected)`:

```
/chat          — Main app (chat-first hub with AI coach)
/health        — Health dashboard (weight, nutrition, training, steps charts)
/money/*       — Money pages (analytics, subscriptions, transactions, budgeting, insights)
/travel/*      — Travel pages (trips, map, budget, trip detail)
/social/*      — Social pages (activity feed, friends)
/food/*        — Food logging
/workouts/*    — Workout logging
/profile       — User profile
/settings      — User settings
/dashboard     — Redirects to /chat (reserved for admin)
```

## What exists

### Layout (working)
- Three-column: Collapsible sidebar (220px ↔ 60px icon rail) → Chat (flex) → Context Panel (280px, on demand)
- App switching: home, health, money, life (inbox hidden for now)
- `CarveChat` remount key changes on app switch or conversation change
- Full viewport, dark bg (#191a1c) — bypasses AppShell on /chat route
- Smooth animated transitions (sidebar collapse, context panel slide-in)

### Chat (working)
- AI via Supabase edge function proxy (`/api/carve-ai/chat` → `coach-chat` edge fn)
- useChat hook from @ai-sdk/react with activeApp in request body
- SSE stream from edge function translated to AI SDK protocol
- Real user data sent to edge function via `buildCoachContext` + `buildMoneyContext` (health metrics, financial data)
- **Cross-domain intelligence**: `activeDomains` auto-detected from actual data presence, coach prompt includes cross-domain coaching logic when multiple domains active
- Coach memory, profile sections, and logbook entries injected into context
- Home empty state: contextual greeting + life prompts
- Domain empty state: "carve" brand + domain-specific pill chips
- Input bar with toolbar row (attach, mic, send)
- Chat bubbles, typing indicator
- **Chat history persistence**: conversations saved to `ai_conversations` + `ai_messages` in Supabase
- Sidebar shows real conversation list, clickable to reload

### Context Panel (card-based, on demand)
- Starts empty on home, opens with default cards per app (health shows all 4)
- Cards load via chip clicks — each chip has a `cardType` mapping to a card component
- Card registry pattern: components registered by type string, rendered dynamically
- Cards accumulate as user interacts (chips add more cards)
- Interactive cards: subscriptions expand/collapse with brand icons
- **Health cards connected to real Supabase data** via `useHealthData` hook
  - WorkoutCard: last workout name, muscle groups, time ago
  - WeekCard: Mon–Sun dots based on real workout dates
  - TodayCard: real calories, protein, steps, water vs goals
  - StreakCard: calculated workout streak + week count
- **Money cards connected to real Supabase data** via `useMoneyData` hook
  - BudgetCard: real budget vs spending with progress bar
  - TransactionsCard: real transactions with expense/income coloring
  - SubscriptionsCard: real subscriptions with monthly equivalent
  - BillsCard: dynamic next billing date calculation
  - Add Transaction / Add Subscription modals from context panel
- Life cards still mock

### Sidebar (working)
- Apps as primary navigation (Health, Money, Life — no Inbox for now)
- Collapsible to icon rail with smooth framer-motion animation
- **Real chat history** from `ai_conversations` table (sorted by updated_at)
- Clicking a conversation loads its messages and resumes the chat
- User section with settings/sign-out popover
- CARVE logo → homepage navigation
- + button → new chat (reset conversation)

## What's missing vs iOS

| Feature | iOS | Web |
|---------|-----|-----|
| Real workout data in UI | Yes (Supabase) | Yes (health cards) |
| Real nutrition data in UI | Yes (Supabase) | Yes (health cards) |
| Real steps data | Yes (HealthKit → Supabase) | Yes (health cards) |
| Chat history persistence | Yes (SwiftData) | Yes (Supabase ai_conversations) |
| Coach context with real data | Yes (CoachContextBuilder) | Yes (buildCoachContext, health-focused subset) |
| Latest CoachContext shape (profile/logbook, richer workout + meal fields) | Yes | Partial |
| Coach memory / profile / logbook context | Yes | Partial — shared edge fn exists, but web does not yet inject latest fields |
| Coach tools (week analysis etc.) | Yes (shared tool prompts) | Via edge function (shared) |
| Quota management | Yes (RPC, hourly) | Via edge function (shared RPC, hourly) |
| Photo food analysis | Yes (vision API) | Not yet |
| Food logging | Yes (FatSecret + manual) | Not yet |
| Workout tracking | Yes (templates + timer) | Not yet — web doesn't do this |
| Money real data | Planned | Yes (transactions, budgets, subscriptions) |

## Known Issues

1. **Chips from Home lose message** — clicking a home chip switches activeApp → remounts CarveChat → message lost
2. **No way to dismiss cards** — cards accumulate but can't be closed individually
3. **No mobile responsive design** — fixed pixel widths, no breakpoints
4. **Username hardcoded** in home greeting ("Furkan")
5. **Context parity with iOS is incomplete** — web still sends a slimmer payload than the latest iOS coach context
6. **`activeApp` is forwarded, but the shared prompt is still mostly health-oriented** — domain-specific behavior is not fully branched server-side yet

## Tech Stack

- Next.js 16.1 (App Router), React 19, TypeScript
- Tailwind CSS 4.1, @celikerstudio/ui (custom design system package)
- @ai-sdk/react (chat UI) + Supabase edge function (AI backend, shared with iOS)
- Supabase (auth + data + edge functions — SAME instance as iOS)
- Motion / Framer Motion (animations)
- Lucide React (icons)
