# Web App — Current Status

Last updated: 2026-03-20
Branch: `main`

## What exists

### Layout (working)
- Three-column: Collapsible sidebar (220px ↔ 60px icon rail) → Chat (flex) → Context Panel (280px, on demand)
- App switching: home, health, money, life (inbox hidden for now)
- `key={activeApp}` remounts chat on switch (resets conversation)
- Full viewport, dark bg (#191a1c) — bypasses AppShell on /chat route
- Smooth animated transitions (sidebar collapse, context panel slide-in)

### Chat (working)
- AI via Supabase edge function proxy (`/api/carve-ai/chat` → `coach-chat` edge fn)
- useChat hook from @ai-sdk/react with activeApp in request body
- SSE stream from edge function translated to AI SDK protocol
- Home empty state: contextual greeting + life prompts ("Push Day at 17:00", "Coolblue €847 due friday")
- Domain empty state: "carve" brand + domain-specific pill chips
- Input bar with toolbar row (attach, mic, send)
- Chat bubbles, typing indicator

### Context Panel (card-based, on demand)
- Starts empty on home, opens with 1 default card per app
- Cards load via chip clicks — each chip has a `cardType` mapping to a card component
- Card registry pattern: components registered by type string, rendered dynamically
- Cards accumulate as user interacts (chips add more cards)
- Interactive cards: subscriptions expand/collapse with brand icons
- Health cards connected to real Supabase data via useHealthData hook
- Money/Life cards still mock

### Sidebar (working)
- Apps as primary navigation (Health, Money, Life — no Inbox for now)
- Collapsible to icon rail with smooth framer-motion animation
- Chat history: 4 mock items (not from Supabase)
- User section with settings/sign-out popover
- CARVE logo → homepage navigation
- + button → new chat (reset to home)

## What's missing vs iOS

| Feature | iOS | Web |
|---------|-----|-----|
| Real workout data in UI | Yes (Supabase) | Health cards connected |
| Real nutrition data in UI | Yes (Supabase) | Health cards connected |
| Real steps data | Yes (HealthKit → Supabase) | Health cards connected |
| Chat history persistence | Yes (SwiftData + Supabase) | No (lost on refresh) |
| Coach memory | Yes (50 facts) | Via edge function (shared) |
| Coach tools (week analysis etc.) | Yes (with credits) | Via edge function (shared) |
| Quota management | Yes (RPC) | Via edge function (shared) |
| Photo food analysis | Yes (vision API) | Not yet |
| Food logging | Yes (FatSecret + manual) | Not yet |
| Workout tracking | Yes (templates + timer) | Not yet |
| Money real data | Yes (planned) | Mock |

## Known Issues

1. **Chips from Home lose message** — clicking a home chip switches activeApp → remounts CarveChat → message lost
2. **No way to dismiss cards** — cards accumulate but can't be closed individually
3. **No mobile responsive design** — fixed pixel widths, no breakpoints
4. **Chat history mock** — sidebar shows hardcoded items
5. **Username hardcoded** in home greeting ("Furkan")
6. **Context payload minimal** — edge function receives basic context, not enriched with user profile data

## Tech Stack

- Next.js 16.1 (App Router), React 19, TypeScript
- Tailwind CSS 4.1, @celikerstudio/ui (custom design system package)
- @ai-sdk/react (chat UI) + Supabase edge function (AI backend, shared with iOS)
- Supabase (auth + data + edge functions — SAME instance as iOS)
- Motion / Framer Motion (animations)
- Lucide React (icons)
