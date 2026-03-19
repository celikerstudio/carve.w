# Chat-First Layout Refactor

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform Carve's dashboard from a traditional sidebar+content layout into a ChatGPT-style interface: chat history + apps in left sidebar, AI chat center, context panel right — per domain.

**Architecture:** New `/chat` route with a `ChatLayout` component that replaces the current `DashboardHub`. Left sidebar has chat history + app switcher (Health/Money/Life/Inbox) + Wiki link. Center is the existing `CarveChat` with minor tweaks. Right panel is the existing `WidgetSidebar` made section-aware. Root `/` becomes marketing for unauthenticated users, redirects to `/chat` for authenticated. Wiki stays at `/wiki`. Build alongside existing routes, switch over when ready.

**Tech Stack:** Next.js App Router, React, Tailwind CSS, `@ai-sdk/react` (useChat), Framer Motion, existing Supabase backend

---

## File Structure

### New files
- `app/(protected)/chat/layout.tsx` — Chat route layout (no header, no old sidebar)
- `app/(protected)/chat/page.tsx` — Default chat page
- `components/chat/ChatLayout.tsx` — Main 3-column layout shell
- `components/chat/ChatSidebar.tsx` — Left sidebar: new chat, chat history, app switcher
- `components/chat/ChatContextPanel.tsx` — Right panel: section-aware widgets
- `components/chat/AppSwitcher.tsx` — App list (Health/Money/Life/Inbox) with active state + mini stats
- `components/chat/types.ts` — Shared `AppId` type (single source of truth)

### Modified files
- `components/dashboard/hub/chat/CarveChat.tsx` — Accept `activeApp` prop, pass to API
- `components/dashboard/hub/chat/CarveEmptyState.tsx` — Update greeting for unified coach persona
- `components/dashboard/hub/mock-data.ts` — Add `inboxConfig`, `lifeConfig`, `homeConfig`
- `lib/ai/carve-ai-prompts.ts` — Update system prompt for 4 domains (add Inbox + Life)
- `app/api/carve-ai/chat/route.ts` — Accept `activeApp` in body, pass as context to prompt
- `components/app/layout-wrapper.tsx` — Add `/chat` route handling (no old sidebar/header chrome)
- `middleware.ts` — Protect `/chat` routes + update redirects to `/chat`

### Unchanged (reused as-is)
- `components/dashboard/hub/chat/ChatBubble.tsx`
- `components/dashboard/hub/chat/CarveInputBar.tsx`
- `components/dashboard/hub/chat/SuggestionChips.tsx`
- `components/dashboard/hub/widgets/*` — All existing widget components

---

## Chunk 1: Layout Shell + Left Sidebar

Build the 3-column layout and the left sidebar with chat history and app switcher. No functionality yet — just the visual structure.

### Task 0: Shared types + middleware

**Files:**
- Create: `components/chat/types.ts`
- Modify: `middleware.ts`

- [ ] **Step 1: Create shared AppId type**

`components/chat/types.ts`:

```ts
export type AppId = 'home' | 'health' | 'money' | 'life' | 'inbox'
```

All chat components import `AppId` from here. Single source of truth.

- [ ] **Step 2: Protect /chat in middleware**

In `middleware.ts`, add `/chat` to the protected route check and update all redirects from `/dashboard` to `/chat`:

```ts
// Redirect unauthenticated users away from protected routes
if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin') || pathname.startsWith('/chat')) {
  if (!user) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(redirectUrl)
  }
}

// Redirect authenticated users away from auth pages
if (pathname === '/login' || pathname === '/signup') {
  if (user) {
    return NextResponse.redirect(new URL('/chat', request.url))
  }
}

// Redirect authenticated users from /carve to chat
if (pathname === '/carve') {
  if (user) {
    return NextResponse.redirect(new URL('/chat', request.url))
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add components/chat/types.ts middleware.ts
git commit -m "feat(chat): add shared AppId type and protect /chat route in middleware"
```

### Task 1: Create chat route layout

**Files:**
- Create: `app/(protected)/chat/layout.tsx`
- Create: `app/(protected)/chat/page.tsx`
- Modify: `components/app/layout-wrapper.tsx`

- [ ] **Step 1: Create chat route layout**

`app/(protected)/chat/layout.tsx` — Minimal layout that skips the old AppShell. Children get the full viewport below the header.

```tsx
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function ChatLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  return <>{children}</>
}
```

- [ ] **Step 2: Create chat page**

`app/(protected)/chat/page.tsx` — Renders the ChatLayout component (built in Task 2).

```tsx
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ChatLayout } from "@/components/chat/ChatLayout"

export default async function ChatPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  return <ChatLayout userId={user.id} />
}
```

- [ ] **Step 3: Add /chat route handling to layout-wrapper**

In `components/app/layout-wrapper.tsx`, add a check for `/chat` routes. The chat layout manages its own chrome — only render the header, no sidebar.

Add before the wiki route check:

```tsx
// Note: usePathname() returns URL path, not file-system path.
// Route groups like (protected) are invisible in URLs, so /chat is correct.
const isChatRoute = path.startsWith('/chat')

// ...in the render section, before isWikiRoute check:
if (isChatRoute) {
  return (
    <div className="min-h-screen bg-[#0a0a0b]">
      <div className="fixed top-0 left-0 right-0 z-50">
        <AppHeader
          isAuthenticated={isAuthenticated}
          userEmail={userEmail}
          userName={userName}
          userAvatar={userAvatar}
          userRole={userRole}
        />
      </div>
      <div className="fixed top-16 left-0 right-0 bottom-0">
        {children}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Verify route loads**

Run: `pnpm dev` → navigate to `localhost:3002/chat`
Expected: Empty page with header, no sidebar, dark background.

- [ ] **Step 5: Commit**

```bash
git add app/(protected)/chat/ components/app/layout-wrapper.tsx
git commit -m "feat(chat): add /chat route with minimal layout"
```

### Task 2: Build ChatLayout shell

**Files:**
- Create: `components/chat/ChatLayout.tsx`

- [ ] **Step 1: Create the 3-column layout component**

```tsx
'use client'

import { useState } from 'react'
import { ChatSidebar } from './ChatSidebar'
import { CarveChat } from '@/components/dashboard/hub/chat/CarveChat'
import { ChatContextPanel } from './ChatContextPanel'
import { type SectionConfig, healthConfig, moneyConfig, travelConfig } from '@/components/dashboard/hub/mock-data'
import type { AppId } from './types'

const appConfigs: Record<AppId, SectionConfig> = {
  home: healthConfig,   // Will be replaced with allConfig later
  health: healthConfig,
  money: moneyConfig,
  life: travelConfig,   // Will be replaced with lifeConfig later
  inbox: healthConfig,  // Will be replaced with inboxConfig later
}

interface ChatLayoutProps {
  userId: string
}

export function ChatLayout({ userId }: ChatLayoutProps) {
  const [activeApp, setActiveApp] = useState<AppId>('home')
  const config = appConfigs[activeApp]

  return (
    <div className="flex h-full">
      {/* Left sidebar */}
      <ChatSidebar activeApp={activeApp} onAppChange={setActiveApp} />

      {/* Center chat — key forces remount on app switch to reset chat state */}
      <div className="flex-1 min-w-0">
        <CarveChat key={activeApp} config={config} />
      </div>

      {/* Right context panel */}
      <div className="hidden lg:block w-[280px] shrink-0 border-l border-white/[0.04]">
        <ChatContextPanel activeApp={activeApp} />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: Errors for missing ChatSidebar and ChatContextPanel (expected — created next)

- [ ] **Step 3: Commit**

```bash
git add components/chat/ChatLayout.tsx
git commit -m "feat(chat): add ChatLayout 3-column shell"
```

### Task 3: Build ChatSidebar

**Files:**
- Create: `components/chat/ChatSidebar.tsx`
- Create: `components/chat/AppSwitcher.tsx`

- [ ] **Step 1: Create AppSwitcher component**

```tsx
'use client'

import { cn } from '@/lib/utils'
import { Dumbbell, Wallet, Plane, Mail } from 'lucide-react'
import type { AppId } from './types'

interface AppDef {
  id: AppId
  label: string
  icon: React.ElementType
  color: string
  activeBg: string
  stat?: string
  badge?: number
}

const apps: AppDef[] = [
  { id: 'health', label: 'Health', icon: Dumbbell, color: '#22c55e', activeBg: 'rgba(34,197,94,0.12)', stat: '2/4 workouts' },
  { id: 'money', label: 'Money', icon: Wallet, color: '#3b82f6', activeBg: 'rgba(59,130,246,0.12)', stat: '€760 remaining' },
  { id: 'life', label: 'Life', icon: Plane, color: '#a855f7', activeBg: 'rgba(168,85,247,0.12)', stat: 'Barcelona in 3d' },
  { id: 'inbox', label: 'Inbox', icon: Mail, color: '#f59e0b', activeBg: 'rgba(245,158,11,0.12)', stat: '2 need attention', badge: 2 },
]

interface AppSwitcherProps {
  activeApp: AppId
  onAppChange: (app: AppId) => void
}

export function AppSwitcher({ activeApp, onAppChange }: AppSwitcherProps) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-[9px] font-semibold uppercase tracking-widest text-white/25 px-3 mb-1">Apps</p>
      {apps.map((app) => {
        const isActive = activeApp === app.id
        const Icon = app.icon
        return (
          <button
            key={app.id}
            onClick={() => onAppChange(app.id)}
            className={cn(
              'flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all relative',
              isActive
                ? 'border border-white/[0.08]'
                : 'hover:bg-white/[0.03]'
            )}
            style={isActive ? { background: app.activeBg } : undefined}
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: isActive ? `${app.color}20` : 'rgba(255,255,255,0.06)' }}
            >
              <Icon
                className="w-3.5 h-3.5"
                style={{ color: isActive ? app.color : 'rgba(255,255,255,0.4)' }}
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className={cn(
                'text-[11px] font-medium truncate',
                isActive ? 'text-white' : 'text-white/60'
              )}
                style={isActive ? { color: app.color } : undefined}
              >
                {app.label}
              </p>
              {app.stat && (
                <p className="text-[9px] text-white/25 truncate">{app.stat}</p>
              )}
            </div>
            {app.badge && app.badge > 0 && (
              <div
                className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                style={{ background: app.color }}
              >
                <span className="text-[9px] font-bold text-black">{app.badge}</span>
              </div>
            )}
          </button>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 2: Create ChatSidebar component**

```tsx
'use client'

import { Plus, Search } from 'lucide-react'
import { AppSwitcher } from './AppSwitcher'
import type { AppId } from './types'

interface ChatSidebarProps {
  activeApp: AppId
  onAppChange: (app: AppId) => void
}

// Mock chat history — will be replaced with real data later
const mockChats = [
  { id: '1', title: 'Budget analyse maart', time: 'Vandaag' },
  { id: '2', title: 'Workout plan aanpassen', time: 'Vandaag' },
  { id: '3', title: 'Barcelona trip planning', time: 'Gisteren' },
  { id: '4', title: 'Subscriptions opschonen', time: 'Gisteren' },
]

export function ChatSidebar({ activeApp, onAppChange }: ChatSidebarProps) {
  return (
    <div className="w-[220px] shrink-0 bg-white/[0.02] border-r border-white/[0.06] flex flex-col h-full">
      {/* New chat button */}
      <div className="p-3">
        <button className="flex items-center gap-2 w-full px-3 py-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.08] transition-colors">
          <Plus className="w-4 h-4 text-white/60" />
          <span className="text-[12px] font-medium text-white/70">New chat</span>
        </button>
      </div>

      {/* Chat history */}
      <div className="flex-1 overflow-y-auto px-3 pb-2">
        <p className="text-[9px] font-semibold uppercase tracking-widest text-white/25 px-3 mb-2">Recent</p>
        <div className="flex flex-col gap-0.5">
          {mockChats.map((chat, i) => (
            <button
              key={chat.id}
              className={`text-left px-3 py-1.5 rounded-md transition-colors ${
                i === 0 ? 'bg-white/[0.05] text-white/70' : 'text-white/35 hover:bg-white/[0.03] hover:text-white/50'
              }`}
            >
              <p className="text-[11px] truncate">{chat.title}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="mx-3 h-px bg-white/[0.06]" />

      {/* App switcher */}
      <div className="p-3">
        <AppSwitcher activeApp={activeApp} onAppChange={onAppChange} />
      </div>

      {/* User */}
      <div className="p-3 border-t border-white/[0.06]">
        <div className="flex items-center gap-2 px-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center">
            <span className="text-[8px] font-semibold text-white">FC</span>
          </div>
          {/* @ai-todo: wire up userName from server component instead of hardcoding */}
          <span className="text-[11px] text-white/40">Furkan</span>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Verify compile**

Run: `npx tsc --noEmit`
Expected: Error only for missing ChatContextPanel (created next)

- [ ] **Step 4: Commit**

```bash
git add components/chat/ChatSidebar.tsx components/chat/AppSwitcher.tsx
git commit -m "feat(chat): add ChatSidebar with app switcher and chat history"
```

### Task 4: Build ChatContextPanel

**Files:**
- Create: `components/chat/ChatContextPanel.tsx`

- [ ] **Step 1: Create section-aware context panel**

```tsx
'use client'

import { motion } from 'framer-motion'
import { XpRankWidget } from '@/components/dashboard/hub/widgets/XpRankWidget'
import { TodayWidget } from '@/components/dashboard/hub/widgets/TodayWidget'
import { MoneyWidget } from '@/components/dashboard/hub/widgets/MoneyWidget'
import { ChallengesWidget } from '@/components/dashboard/hub/widgets/ChallengesWidget'
import { LeaderboardWidget } from '@/components/dashboard/hub/widgets/LeaderboardWidget'
import type { AppId } from './types'

interface ChatContextPanelProps {
  activeApp: AppId
}

const panelConfigs: Record<AppId, { title: string; widgets: { key: string; Component: React.ComponentType }[] }> = {
  home: {
    title: 'Overview',
    widgets: [
      { key: 'xp', Component: XpRankWidget },
      { key: 'today', Component: TodayWidget },
      { key: 'money', Component: MoneyWidget },
      { key: 'challenges', Component: ChallengesWidget },
    ],
  },
  health: {
    title: 'Health',
    widgets: [
      { key: 'xp', Component: XpRankWidget },
      { key: 'today', Component: TodayWidget },
      { key: 'challenges', Component: ChallengesWidget },
      { key: 'leaderboard', Component: LeaderboardWidget },
    ],
  },
  money: {
    title: 'Money',
    widgets: [
      { key: 'money', Component: MoneyWidget },
      { key: 'challenges', Component: ChallengesWidget },
    ],
  },
  life: {
    title: 'Life',
    widgets: [
      { key: 'challenges', Component: ChallengesWidget },
    ],
  },
  inbox: {
    title: 'Inbox',
    widgets: [
      { key: 'challenges', Component: ChallengesWidget },
    ],
  },
}

export function ChatContextPanel({ activeApp }: ChatContextPanelProps) {
  const config = panelConfigs[activeApp]

  return (
    <div className="h-full overflow-y-auto scrollbar-hide py-4 px-3">
      <p className="text-[9px] font-semibold uppercase tracking-widest text-white/25 px-1 mb-3">
        {config.title}
      </p>
      <div className="flex flex-col gap-3">
        {config.widgets.map(({ key, Component }, i) => (
          <motion.div
            key={`${activeApp}-${key}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.06 }}
          >
            <Component />
          </motion.div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify full compile**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Verify visually**

Run: `pnpm dev` → navigate to `localhost:3002/chat`
Expected: 3-column layout — left sidebar with apps, center chat with empty state, right panel with widgets. Clicking apps in sidebar should switch the right panel widgets and chat suggestions.

- [ ] **Step 4: Commit**

```bash
git add components/chat/ChatContextPanel.tsx
git commit -m "feat(chat): add section-aware ChatContextPanel"
```

- [ ] **Step 5: Commit full layout shell**

Verify everything works together, then:

```bash
git add -A
git commit -m "feat(chat): complete chat-first layout shell with sidebar, chat, and context panel"
```

---

## Chunk 2: Section Configs + AI Context

Add inbox/life/home configs and make the AI backend section-aware.

### Task 5: Add section configs for all apps

**Files:**
- Modify: `components/dashboard/hub/mock-data.ts`

- [ ] **Step 1: Add inbox and home configs**

Add to the end of `mock-data.ts`, before the closing:

```ts
import { Inbox, CheckCircle } from 'lucide-react'

// Add to iconMap:
// Inbox, CheckCircle,

export const inboxConfig: SectionConfig = {
  subtitle: "I manage your inbox. I categorize, summarize, and route emails to the right place.",
  statusPills: [
    { icon: 'Inbox', label: '2 need attention' },
    { icon: 'CheckCircle', label: '14 auto-handled' },
  ],
  suggestionChips: [
    { id: 'i1', icon: 'Inbox', label: "What's in my inbox?" },
    { id: 'i2', icon: 'CheckCircle', label: 'What did you handle today?' },
    { id: 'i3', icon: 'Receipt', label: 'Any bills or invoices?' },
    { id: 'i4', icon: 'Calendar', label: 'Upcoming appointments?' },
  ],
}

export const lifeConfig: SectionConfig = {
  subtitle: "I'm your life planner. Trips, appointments, and everything in between.",
  statusPills: [
    { icon: 'Plane', label: 'Barcelona in 3 days' },
    { icon: 'MapPin', label: '3 trips planned' },
    { icon: 'Globe', label: '5 countries visited' },
  ],
  suggestionChips: [
    { id: 'l1', icon: 'Calendar', label: "What's coming up?" },
    { id: 'l2', icon: 'Wallet', label: 'Trip budget status' },
    { id: 'l3', icon: 'Compass', label: 'Suggest a destination' },
    { id: 'l4', icon: 'MapPin', label: 'Review my itinerary' },
  ],
}

export const homeConfig: SectionConfig = {
  subtitle: "I'm your Carve coach. I know your health, money, trips, and inbox. Ask me anything.",
  statusPills: [
    { icon: 'Flame', label: '12-day streak' },
    { icon: 'Wallet', label: '€760 remaining' },
    { icon: 'Plane', label: 'Barcelona in 3d' },
  ],
  suggestionChips: [
    { id: 'h1', icon: 'TrendingUp', label: "How's my week?" },
    { id: 'h2', icon: 'Dumbbell', label: 'Plan my workout' },
    { id: 'h3', icon: 'Wallet', label: "How's my budget?" },
    { id: 'h4', icon: 'Inbox', label: 'Check my inbox' },
  ],
}
```

- [ ] **Step 2: Update ChatLayout to use new configs**

In `components/chat/ChatLayout.tsx`, import the new configs and update `appConfigs`:

```ts
import { healthConfig, moneyConfig, lifeConfig, inboxConfig, homeConfig } from '@/components/dashboard/hub/mock-data'

const appConfigs: Record<AppId, SectionConfig> = {
  home: homeConfig,
  health: healthConfig,
  money: moneyConfig,
  life: lifeConfig,
  inbox: inboxConfig,
}
```

- [ ] **Step 3: Add new icons to mock-data iconMap**

Add `Inbox` and `CheckCircle` imports and to the `iconMap` in `mock-data.ts`.

- [ ] **Step 4: Verify compile + visually check**

Run: `npx tsc --noEmit` then `pnpm dev` → `/chat`
Expected: Switching apps changes the empty state subtitle, pills, and suggestion chips.

- [ ] **Step 5: Commit**

```bash
git add components/dashboard/hub/mock-data.ts components/chat/ChatLayout.tsx
git commit -m "feat(chat): add inbox, life, and home section configs"
```

### Task 6: Make AI backend section-aware

**Files:**
- Modify: `app/api/carve-ai/chat/route.ts`
- Modify: `lib/ai/carve-ai-prompts.ts`
- Modify: `components/dashboard/hub/chat/CarveChat.tsx`

- [ ] **Step 1: Update CarveChat to pass activeApp to API**

In `CarveChat.tsx`, add an `activeApp` prop and pass it as extra body data:

```tsx
interface CarveChatProps {
  config?: SectionConfig
  activeApp?: string
}

export function CarveChat({ config = healthConfig, activeApp = 'home' }: CarveChatProps) {
  const transport = useMemo(
    () => new DefaultChatTransport({
      api: '/api/carve-ai/chat',
      body: { activeApp },
    }),
    [activeApp]
  )
  // ... rest unchanged
}
```

- [ ] **Step 2: Update API route to read activeApp**

In `app/api/carve-ai/chat/route.ts`, extract `activeApp` from the body and prepend a context message:

```ts
const { messages, conversationId, activeApp } = body as {
  messages: Array<{ role: string; content: string }>
  conversationId?: string
  activeApp?: string
}

// Build context-aware system prompt
const activeAppContext = activeApp && activeApp !== 'home'
  ? `\n\nACTIVE CONTEXT: The user is currently viewing the "${activeApp}" section. Prioritize ${activeApp}-related responses, but still answer cross-domain questions naturally.`
  : ''

const result = streamText({
  model: anthropic("claude-sonnet-4-20250514"),
  system: CARVE_AI_SYSTEM_PROMPT + activeAppContext,
  messages: modelMessages,
  // ...
})
```

- [ ] **Step 3: Update system prompt for 4 domains**

In `lib/ai/carve-ai-prompts.ts`, add Inbox and rename Travel to Life in the DOMAINS section. Add:

```
4. INBOX MANAGEMENT
   - You process incoming emails: categorize, summarize, and suggest actions.
   - You can route items to other domains: invoices → Money, flight confirmations → Life.
   - Be proactive: "I noticed a bill from Coolblue for €847, deadline Friday. Want me to add it to your budget?"
   - You handle the mundane so the user can focus on what matters.

5. LIFE PLANNING (formerly Travel)
   - Everything about the user's life: trips, appointments, calendar, planning.
   - Travel planning remains a core strength (same as before).
   - Also help with scheduling, reminders, and life admin.
```

- [ ] **Step 4: Pass activeApp from ChatLayout to CarveChat**

In `ChatLayout.tsx`:

```tsx
<CarveChat config={config} activeApp={activeApp} />
```

- [ ] **Step 5: Verify compile + test**

Run: `npx tsc --noEmit` then `pnpm dev`
Test: Go to `/chat`, select Money app, ask "how's my budget?" → AI should respond with Money-focused answer.

- [ ] **Step 6: Commit**

```bash
git add app/api/carve-ai/chat/route.ts lib/ai/carve-ai-prompts.ts components/dashboard/hub/chat/CarveChat.tsx components/chat/ChatLayout.tsx
git commit -m "feat(chat): make AI backend section-aware with activeApp context"
```

---

## Chunk 3: Polish + Redirect

Final polish and redirect `/dashboard` to `/chat`.

### Task 7: Polish empty state for chat-first feel

**Files:**
- Modify: `components/dashboard/hub/chat/CarveEmptyState.tsx`

- [ ] **Step 1: Update greeting to unified coach**

Change the default subtitle to reflect the all-in-one coach persona:

```tsx
subtitle = "Hey Furkan, I'm your Carve coach. Health, money, trips, inbox — ask me anything."
```

- [ ] **Step 2: Center the CARVE brand in the header area**

In `ChatLayout.tsx`, add a minimal top bar between sidebar and chat:

```tsx
{/* Top bar */}
<div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.04]">
  <div className="flex items-center gap-2">
    <span className="text-white font-bold text-sm tracking-[0.15em]">CARVE</span>
    {activeApp !== 'home' && (
      <span className="text-[10px] font-semibold px-2 py-0.5 rounded"
        style={{ background: appAccentBg, color: appAccentColor }}>
        {activeApp.toUpperCase()}
      </span>
    )}
  </div>
</div>
```

- [ ] **Step 3: Verify visually**

Check that the empty state looks right for each app context.

- [ ] **Step 4: Commit**

```bash
git add components/dashboard/hub/chat/CarveEmptyState.tsx components/chat/ChatLayout.tsx
git commit -m "feat(chat): polish empty state and add CARVE branding to chat header"
```

### Task 8: Redirect dashboard to chat

**Files:**
- Modify: `app/(protected)/dashboard/page.tsx`

Note: The middleware (updated in Task 0) already redirects `/login` and `/carve` to `/chat`. This task handles the `/dashboard` entry point.

- [ ] **Step 1: Add redirect from /dashboard to /chat**

In `app/(protected)/dashboard/page.tsx`, add a redirect. The old sub-pages (`/dashboard/money/transactions` etc.) still work at their routes — we're only redirecting the entry point.

```tsx
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  redirect("/chat")
}
```

Rollback: revert this one file to restore the old dashboard.

- [ ] **Step 2: Test the full flow**

1. Go to `localhost:3002/dashboard` → should redirect to `/chat`
2. Go to `localhost:3002/login` (while authenticated) → should redirect to `/chat`
3. Go to `localhost:3002/carve` (while authenticated) → should redirect to `/chat`
4. Chat should work with all apps
5. Right panel should switch per app
6. App switcher should highlight active app

- [ ] **Step 3: Commit**

```bash
git add app/(protected)/dashboard/page.tsx
git commit -m "feat(chat): redirect /dashboard to /chat"
```

---

## Summary

After all 9 tasks (Task 0–8), you have:
- A ChatGPT-style layout at `/chat`
- Left sidebar with chat history + app switcher (Health/Money/Life/Inbox)
- Center: AI chat with section-aware suggestions
- Right: Context panel with section-specific widgets
- AI backend that knows which app is active
- `/dashboard` redirects to `/chat`
- All old pages still exist and work — no destructive changes

### What comes next (not in this plan):
- Real chat history (persist conversations in Supabase)
- Real-time data in widget panels (replace mock data)
- Custom widgets per domain (Inbox email list, Life calendar, etc.)
- Mobile responsive layout
- Rich AI responses (inline charts, transaction lists, etc.)
