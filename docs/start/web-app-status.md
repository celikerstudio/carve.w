# Web App — Current Status

Last updated: 2026-03-20
Branch: `feat/chat-first-layout`

## What exists

### Layout (working)
- Three-column: Sidebar (220px) → Chat (flex) → Context Panel (280px, hidden < lg)
- App switching: home, health, money, life, inbox
- `key={activeApp}` remounts chat on switch (resets conversation)
- Full viewport, no header — bypasses AppShell on /chat route

### Chat (working, limited)
- AI streaming via `/api/carve-ai/chat` (Claude Sonnet)
- useChat hook from @ai-sdk/react
- Empty state with suggestion chips
- Chat bubbles, typing indicator
- System prompt: health + money + travel (missing inbox, life)

### Context Panel (visual only, ALL MOCK)
- Home: fake XP, fake stats, fake leaderboard
- Health: fake workouts, fake metrics, fake challenges
- Money: fake budget, fake transactions
- Life: fake trips, fake appointments
- Inbox: fake email items

### Sidebar (visual only, partially mock)
- App switcher with accent colors (working)
- Chat history: 4 hardcoded items (not from Supabase)
- User section: hardcoded "Furkan" (userName prop ignored)
- Wiki link (working)

## What's missing vs iOS

| Feature | iOS | Web |
|---------|-----|-----|
| Real workout data in UI | Yes (Supabase) | No (mock) |
| Real nutrition data in UI | Yes (Supabase) | No (mock) |
| Real steps data | Yes (HealthKit → Supabase) | No (mock) |
| Real Carve Score | Yes (RPC calculation) | No (mock) |
| Chat history persistence | Yes (SwiftData + Supabase) | No (lost on refresh) |
| Coach memory | Yes (50 facts, categorized) | No |
| Coach tools (week analysis etc.) | Yes (with credits) | No |
| activeApp passed to AI | No (planned) | No |
| Photo food analysis | Yes (vision API) | No |
| Food logging | Yes (FatSecret + manual) | No |
| Workout tracking | Yes (templates + timer) | No |

## Known Issues

1. **Design system violated** — ChatContextPanel uses hardcoded colors (`text-white/[0.04]`, `bg-[#1c1f27]`) instead of semantic tokens
2. **activeApp not sent to API** — AI doesn't know which domain you're in
3. **Hardcoded username** in sidebar
4. **No mobile responsive design** — fixed pixel widths, no breakpoints
5. **Double auth check** in layout.tsx + page.tsx
6. **ChatContextPanel is 441 lines** — 5 panel variants inline, needs splitting

## Tech Stack

- Next.js 16.1 (App Router), React 19, TypeScript
- Tailwind CSS 4.1, @celikerstudio/ui (custom design system package)
- @ai-sdk/react + @ai-sdk/anthropic (Claude)
- Supabase (auth + data — SAME instance as iOS)
- Motion (animations)
- Lucide React (icons)
