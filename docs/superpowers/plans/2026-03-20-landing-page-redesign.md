# Landing Page Redesign — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a chat-first landing page at `/` with animated product demo, redesign the chat empty state with domain-path selection, and update routing so authenticated users go to `/chat` and wiki moves to `/wiki`.

**Architecture:** Three deliverables: (1) Landing page with an auto-playing animated chat demo showing tool calls + context panel switching, (2) Chat empty state redesigned with ilvlup-style domain paths, (3) Routing changes in middleware + layout-wrapper. The landing page is a new route group `(landing)` at the root. Existing `(wiki-home)` content stays but serves at `/wiki` only.

**Tech Stack:** Next.js 15 App Router, Tailwind CSS v4, Framer Motion, Lucide React. Existing components: `ScrollReveal`, `ChatContextPanel` panels, mock data from `mock-data.ts`.

---

## Chunk 1: File Structure & Routing

### Files Overview

**Create:**
- `app/(landing)/page.tsx` — Landing page server component (metadata + export)
- `app/(landing)/layout.tsx` — Dark theme layout wrapper (no sidebar, no header)
- `components/landing/LandingPage.tsx` — Main landing page client component (orchestrates sections)
- `components/landing/LandingNav.tsx` — Minimal sticky nav (CARVE logo + Get Started)
- `components/landing/LandingHero.tsx` — Hero text + CTA buttons
- `components/landing/LandingDemo.tsx` — Animated chat demo container (left chat + right context)
- `components/landing/LandingDemoChat.tsx` — Animated chat messages + tool calls + typing
- `components/landing/LandingDemoContext.tsx` — Animated context panel that switches between domain views
- `components/landing/LandingCTA.tsx` — Bottom CTA section
- `components/landing/demo-steps.ts` — Animation timeline data (message sequence, delays, panel switches)

**Modify:**
- `middleware.ts` — Add root `/` redirect for authenticated users → `/chat`
- `components/app/layout-wrapper.tsx` — Add landing route detection, wiki route update
- `app/(wiki-home)/page.tsx` → Move to `app/wiki/page.tsx` (or adjust routing)
- `components/dashboard/hub/chat/CarveEmptyState.tsx` — Redesign with domain paths
- `app/globals.css` — Add `--color-life` and `--color-inbox` tokens

**No test files** — These are presentational UI components with no business logic. Testing is visual (browser verification).

---

### Task 1: Update routing — middleware + layout-wrapper

**Files:**
- Modify: `middleware.ts`
- Modify: `components/app/layout-wrapper.tsx`

- [ ] **Step 1: Update middleware to redirect authenticated users from root**

In `middleware.ts`, add a redirect for `/` when authenticated:

```typescript
// After the existing /carve redirect block (line 28), add:
// Redirect authenticated users from landing page to chat
if (pathname === '/') {
  if (user) {
    return NextResponse.redirect(new URL('/chat', request.url))
  }
}
```

- [ ] **Step 2: Update layout-wrapper to handle landing route**

In `components/app/layout-wrapper.tsx`:

1. Add landing route detection:
```typescript
const isLandingRoute = path === '/'
```

2. Add landing route handler (after `isChatRoute` block, before `isMarketingRoute`):
```typescript
if (isLandingRoute) {
  return (
    <div className="min-h-screen bg-[#0A0A0B]">
      {children}
    </div>
  )
}
```

3. Update wiki route detection — remove `path === '/'` from `isWikiRoute`:
```typescript
const isWikiRoute = path.startsWith('/wiki')
```

- [ ] **Step 3: Verify routing works**

Run: `pnpm dev`
- Visit `/` → should show landing page layout (currently empty, just dark bg)
- Visit `/` while logged in → should redirect to `/chat`
- Visit `/wiki` → should show wiki homepage
- Visit `/chat` while logged out → should redirect to `/login`

- [ ] **Step 4: Commit**

```bash
git add middleware.ts components/app/layout-wrapper.tsx
git commit -m "feat(routing): add landing page route, update wiki path detection"
```

---

### Task 2: Add design tokens for new domain colors

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: Add life and inbox color tokens**

In `app/globals.css`, inside `@theme { ... }`, add after `--color-travel`:

```css
--color-life: #a855f7;
--color-inbox: #f59e0b;
```

Note: `--color-health` stays `#D4A843` in the token system (used by existing dashboard/marketing).
The landing page will use the literal colors `#22c55e` (health green), `#3b82f6` (money), `#a855f7` (life), `#f59e0b` (inbox) directly in its components since these are landing-page-specific and match the chat interface.

- [ ] **Step 2: Commit**

```bash
git add app/globals.css
git commit -m "feat(tokens): add life and inbox color tokens"
```

---

## Chunk 2: Landing Page Components

### Task 3: Create landing page route + layout

**Files:**
- Create: `app/(landing)/layout.tsx`
- Create: `app/(landing)/page.tsx`

- [ ] **Step 1: Create landing layout**

```typescript
// app/(landing)/layout.tsx
export default function LandingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white">
      {children}
    </div>
  )
}
```

- [ ] **Step 2: Create landing page**

```typescript
// app/(landing)/page.tsx
import { LandingPage } from '@/components/landing/LandingPage'

export const metadata = {
  title: 'Carve — Your AI Life Coach',
  description: 'One AI that manages your health, money, life, and inbox. ChatGPT knows everything. Carve knows you.',
  openGraph: {
    title: 'Carve — Your AI Life Coach',
    description: 'One AI that manages your health, money, life, and inbox.',
  },
}

export default function Landing() {
  return <LandingPage />
}
```

- [ ] **Step 3: Commit**

```bash
git add app/\(landing\)/layout.tsx app/\(landing\)/page.tsx
git commit -m "feat(landing): add route group and page"
```

---

### Task 4: LandingNav component

**Files:**
- Create: `components/landing/LandingNav.tsx`

- [ ] **Step 1: Build the nav**

Minimal nav: CARVE logo left, Sign In + Get Started right. Semi-transparent on scroll. No hamburger on mobile — just logo + CTA.

```tsx
// components/landing/LandingNav.tsx
'use client'

import Link from 'next/link'

export function LandingNav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 py-4 bg-[#0A0A0B]/70 backdrop-blur-xl border-b border-white/[0.03]">
      <span className="text-[12px] font-bold tracking-[0.35em] uppercase text-white/85">
        CARVE
      </span>
      <div className="flex items-center gap-4">
        <Link
          href="/login"
          className="hidden sm:inline text-[13px] text-white/30 hover:text-white/60 transition-colors"
        >
          Sign In
        </Link>
        <Link
          href="/signup"
          className="bg-white text-[#0A0A0B] px-5 py-2 rounded-full text-[12px] font-semibold hover:opacity-85 transition-opacity"
        >
          Get Started
        </Link>
      </div>
    </nav>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/landing/LandingNav.tsx
git commit -m "feat(landing): add minimal nav component"
```

---

### Task 5: LandingHero component

**Files:**
- Create: `components/landing/LandingHero.tsx`

- [ ] **Step 1: Build hero with headline + CTAs**

```tsx
// components/landing/LandingHero.tsx
'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

export function LandingHero() {
  return (
    <div className="text-center pt-28 pb-8 md:pt-32 md:pb-10 px-6">
      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        className="text-4xl md:text-5xl lg:text-[56px] font-bold tracking-tight leading-[1.1] mb-4"
      >
        ChatGPT knows everything.
        <br />
        <span className="text-white/25">Carve knows you.</span>
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
        className="text-white/30 text-[15px] md:text-base mb-8"
      >
        Watch it work.
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
        className="flex items-center justify-center gap-3"
      >
        <Link
          href="/signup"
          className="bg-white text-[#0A0A0B] px-7 py-3.5 rounded-full text-[14px] font-semibold hover:shadow-[0_4px_24px_rgba(255,255,255,0.1)] hover:-translate-y-0.5 transition-all"
        >
          Get Started — It's Free
        </Link>
        <a
          href="#demo"
          className="border border-white/[0.08] text-white/50 px-7 py-3.5 rounded-full text-[14px] font-medium hover:border-white/[0.15] hover:text-white/70 transition-all"
        >
          See how it works
        </a>
      </motion.div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/landing/LandingHero.tsx
git commit -m "feat(landing): add hero component with headline and CTAs"
```

---

### Task 6: Demo animation data

**Files:**
- Create: `components/landing/demo-steps.ts`

- [ ] **Step 1: Define the animation timeline**

This file defines the sequence of events in the animated demo. Each step has a type, delay (ms before this step), and content. The `panel` field tells the context panel which view to show.

```typescript
// components/landing/demo-steps.ts

export type DemoStepType =
  | 'user-msg'
  | 'tool-start'
  | 'tool-done'
  | 'typing'
  | 'ai-msg'

export interface DemoStep {
  type: DemoStepType
  delay: number // ms to wait before executing this step
  text?: string
  html?: string
  toolId?: string
  toolIcon?: string
  panel?: 'empty' | 'health' | 'money' | 'inbox' | 'life'
}

export const DEMO_STEPS: DemoStep[] = [
  // User asks
  { type: 'user-msg', delay: 1000, text: "What's my week looking like?" },

  // Tool calls — each one switches the context panel
  { type: 'tool-start', delay: 800, toolId: 'health', toolIcon: '♥', text: 'Reading health data...', panel: 'health' },
  { type: 'tool-done', delay: 1000, toolId: 'health' },
  { type: 'tool-start', delay: 350, toolId: 'money', toolIcon: '$', text: 'Checking budget & bills...', panel: 'money' },
  { type: 'tool-done', delay: 1000, toolId: 'money' },
  { type: 'tool-start', delay: 350, toolId: 'inbox', toolIcon: '✉', text: 'Scanning inbox...', panel: 'inbox' },
  { type: 'tool-done', delay: 800, toolId: 'inbox' },
  { type: 'tool-start', delay: 350, toolId: 'life', toolIcon: '◆', text: 'Loading calendar & trips...', panel: 'life' },
  { type: 'tool-done', delay: 800, toolId: 'life' },

  // Typing → AI response
  { type: 'typing', delay: 500 },
  { type: 'ai-msg', delay: 2000, html: `<span class="tag-health">♥ Health</span> Push Day today, Pull tomorrow, Legs Thursday. <strong>12-day streak</strong> — don't break it.<br/><br/><span class="tag-money">$ Money</span> <strong>€847 Coolblue bill</strong> due Friday. Budget at 63% with 11 days left.<br/><br/><span class="tag-inbox">✉ Inbox</span> 2 emails need you: Coolblue invoice and KLM confirmation. <strong>14 auto-handled</strong> this morning.<br/><br/><span class="tag-life">◆ Life</span> <strong>Barcelona in 3 days.</strong> Flight KL1677 at 09:40. Hotel confirmed.<br/><br/><span class="text-white/35">Grocery budget is tight. Want me to replan meals to stay within budget?</span>` },

  // Second exchange
  { type: 'user-msg', delay: 3500, text: 'Yes, keep protein above 150g' },
  { type: 'tool-start', delay: 700, toolId: 'meals', toolIcon: '♥', text: 'Analyzing meal history & prices...', panel: 'health' },
  { type: 'tool-done', delay: 1200, toolId: 'meals' },
  { type: 'tool-start', delay: 300, toolId: 'budget', toolIcon: '$', text: 'Recalculating grocery budget...', panel: 'money' },
  { type: 'tool-done', delay: 900, toolId: 'budget' },
  { type: 'typing', delay: 500 },
  { type: 'ai-msg', delay: 2000, html: `Done. 4-day meal plan — all within budget:<br/><br/><strong>Today</strong> — Chicken stir-fry, rice, broccoli <span class="text-[#22c55e]/50">(52g protein)</span><br/><strong>Thu</strong> — Greek yogurt + tuna wrap <span class="text-[#22c55e]/50">(61g protein)</span><br/><strong>Fri</strong> — Eggs, oats + leftover chicken <span class="text-[#22c55e]/50">(48g protein)</span><br/><strong>Sat</strong> — Travel day — airport meal: €15 <span class="text-[#a855f7]/50">(Barcelona)</span><br/><br/>Grocery cost: <strong>€31</strong>. Each day hits 150g+ with your regular breakfast.<br/><span class="tag-money">Saved to budget</span> <span class="tag-health">Logged to meal plan</span>` },
]
```

- [ ] **Step 2: Commit**

```bash
git add components/landing/demo-steps.ts
git commit -m "feat(landing): add demo animation timeline data"
```

---

### Task 7: LandingDemoChat — animated chat messages

**Files:**
- Create: `components/landing/LandingDemoChat.tsx`

- [ ] **Step 1: Build the animated chat component**

This component receives the current demo state and renders messages, tool calls, and typing indicators with fade-in animations. It does NOT manage the animation timing — that's handled by the parent.

Key elements:
- User messages: right-aligned, subtle bg
- Tool calls: monospace, with spinner → checkmark transition
- Typing indicator: 3-dot pulse animation
- AI messages: left-aligned, rendered from HTML with domain-colored tags
- Auto-scroll to bottom on new content

```tsx
// components/landing/LandingDemoChat.tsx
'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useRef } from 'react'

interface ChatMessage {
  id: string
  type: 'user' | 'ai' | 'tool' | 'typing'
  text?: string
  html?: string
  toolId?: string
  toolIcon?: string
  toolDone?: boolean
}

interface LandingDemoChatProps {
  messages: ChatMessage[]
}

export function LandingDemoChat({ messages }: LandingDemoChatProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-5 py-3 border-b border-white/[0.04]">
        <div className="w-[6px] h-[6px] rounded-full bg-[#22c55e]" />
        <span className="text-[13px] font-semibold text-white/50">Carve</span>
        <span className="ml-auto text-[11px] text-white/20">Connected to your data</span>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-hide px-5 py-5 flex flex-col gap-3.5">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
            >
              {msg.type === 'user' && (
                <div className="flex justify-end">
                  <span className="inline-block bg-white/[0.06] px-3.5 py-2.5 rounded-[14px] rounded-br-[4px] text-[13px] text-white/75 max-w-[85%]">
                    {msg.text}
                  </span>
                </div>
              )}

              {msg.type === 'tool' && (
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[11px] font-mono ${
                  msg.toolDone
                    ? 'bg-white/[0.01] border-[#22c55e]/10 text-white/25'
                    : 'bg-white/[0.02] border-white/[0.04] text-white/25'
                }`}>
                  <span className="text-[12px]">{msg.toolIcon}</span>
                  {msg.text}
                  {msg.toolDone ? (
                    <span className="text-[#22c55e] text-[9px] ml-auto">✓</span>
                  ) : (
                    <div className="w-[10px] h-[10px] border-[1.5px] border-white/10 border-t-white/30 rounded-full animate-spin ml-auto" />
                  )}
                </div>
              )}

              {msg.type === 'typing' && (
                <div className="flex gap-1 py-1">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-[5px] h-[5px] rounded-full bg-[#c8b86e]/30"
                      style={{
                        animation: `typingPulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                      }}
                    />
                  ))}
                </div>
              )}

              {msg.type === 'ai' && msg.html && (
                <div
                  className="text-[13px] leading-[1.65] text-white/55 max-w-[90%] landing-demo-ai"
                  dangerouslySetInnerHTML={{ __html: msg.html }}
                />
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Input bar */}
      <div className="px-5 py-3 border-t border-white/[0.04]">
        <div className="flex items-center bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3">
          <span className="text-[13px] text-white/15 flex-1">Ask anything about your life...</span>
          <div className="w-7 h-7 rounded-lg bg-white/[0.06] flex items-center justify-center text-white/20 text-[12px]">
            ↑
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Add CSS for domain tags and typing animation to globals.css**

Add at the end of the `@layer utilities` block in `globals.css`:

```css
/* Landing demo domain tags */
.landing-demo-ai .tag-health {
  display: inline-flex; padding: 1px 6px; border-radius: 4px; font-size: 11px; font-weight: 500;
  background: rgba(34,197,94,0.08); color: #22c55e;
}
.landing-demo-ai .tag-money {
  display: inline-flex; padding: 1px 6px; border-radius: 4px; font-size: 11px; font-weight: 500;
  background: rgba(59,130,246,0.08); color: #3b82f6;
}
.landing-demo-ai .tag-inbox {
  display: inline-flex; padding: 1px 6px; border-radius: 4px; font-size: 11px; font-weight: 500;
  background: rgba(245,158,11,0.08); color: #f59e0b;
}
.landing-demo-ai .tag-life {
  display: inline-flex; padding: 1px 6px; border-radius: 4px; font-size: 11px; font-weight: 500;
  background: rgba(168,85,247,0.08); color: #a855f7;
}
.landing-demo-ai strong {
  color: rgba(255,255,255,0.65); font-weight: 600;
}

@keyframes typingPulse {
  0%, 100% { opacity: 0.3; transform: scale(0.85); }
  50% { opacity: 1; transform: scale(1); }
}
```

- [ ] **Step 3: Commit**

```bash
git add components/landing/LandingDemoChat.tsx app/globals.css
git commit -m "feat(landing): add animated chat demo component"
```

---

### Task 8: LandingDemoContext — animated context panel

**Files:**
- Create: `components/landing/LandingDemoContext.tsx`

- [ ] **Step 1: Build context panel with domain views**

This component shows the right-side panel that transitions between domain views. Reuses the visual structure from the existing `ChatContextPanel` but styled specifically for the landing page demo (slightly more compact).

Each panel view slides in from the right when activated. The `activePanel` prop controls which view is shown.

```tsx
// components/landing/LandingDemoContext.tsx
'use client'

import { motion, AnimatePresence } from 'framer-motion'

type PanelId = 'empty' | 'health' | 'money' | 'inbox' | 'life'

interface LandingDemoContextProps {
  activePanel: PanelId
}

export function LandingDemoContext({ activePanel }: LandingDemoContextProps) {
  return (
    <div className="h-full bg-[#0c0c0d] overflow-hidden relative">
      <AnimatePresence mode="wait">
        <motion.div
          key={activePanel}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -8 }}
          transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
          className="absolute inset-0 p-4 overflow-y-auto scrollbar-hide"
        >
          {activePanel === 'empty' && <EmptyView />}
          {activePanel === 'health' && <HealthView />}
          {activePanel === 'money' && <MoneyView />}
          {activePanel === 'inbox' && <InboxView />}
          {activePanel === 'life' && <LifeView />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

// ─── Shared primitives ──────────────────────────────

function Label({ children, color }: { children: React.ReactNode; color?: string }) {
  return (
    <div className="flex items-center gap-1.5 mb-3">
      {color && <div className="w-[5px] h-[5px] rounded-full" style={{ background: color }} />}
      <span className="text-[10px] font-semibold uppercase tracking-[0.12em]" style={{ color: color || 'rgba(255,255,255,0.15)' }}>
        {children}
      </span>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-[11px] py-1">
      <span className="text-white/30">{label}</span>
      <span className="text-white/50">{value}</span>
    </div>
  )
}

function Bar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="h-[3px] bg-white/[0.04] rounded-full mt-1 overflow-hidden">
      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
    </div>
  )
}

// ─── Panel views ────────────────────────────────────

function EmptyView() {
  return (
    <div className="flex items-center justify-center h-full">
      <p className="text-[11px] text-white/10 text-center leading-relaxed">
        Context from your<br />data appears here
      </p>
    </div>
  )
}

function HealthView() {
  return (
    <div className="flex flex-col gap-4">
      <Label color="#22c55e">Health</Label>
      <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-3">
        <p className="text-[13px] font-semibold text-white/60 mb-1">Push Day</p>
        <p className="text-[11px] text-white/20 mb-3">Today · 55 min · 5 exercises</p>
        <div className="flex flex-col gap-1">
          <Row label="Bench Press" value="4×8 · 80kg" />
          <Row label="OHP" value="3×10 · 45kg" />
          <Row label="Incline DB" value="3×12 · 28kg" />
          <Row label="Lateral Raise" value="4×15 · 12kg" />
        </div>
      </div>
      <div>
        <Label>Targets</Label>
        <Row label="Protein" value="110/150g" />
        <Bar pct={73} color="#22c55e" />
        <div className="mt-2" />
        <Row label="Calories" value="1,450/2,500" />
        <Bar pct={58} color="#22c55e" />
        <div className="mt-2" />
        <Row label="Steps" value="4,200/10K" />
        <Bar pct={42} color="#22c55e" />
      </div>
    </div>
  )
}

function MoneyView() {
  return (
    <div className="flex flex-col gap-4">
      <Label color="#3b82f6">Money</Label>
      <div>
        <p className="text-[24px] font-bold text-white/75 mb-0.5">€2,140</p>
        <p className="text-[11px] text-white/20 mb-2">of €3,400 remaining</p>
        <div className="h-[5px] bg-white/[0.04] rounded-full overflow-hidden">
          <div className="h-full rounded-full bg-[#3b82f6]" style={{ width: '63%' }} />
        </div>
      </div>
      <div>
        <Label>Open Bills</Label>
        <div className="rounded-xl bg-white/[0.02] border border-[#f59e0b]/10 p-3">
          <p className="text-[13px] font-semibold text-white/60">Coolblue — €847</p>
          <p className="text-[11px] text-white/20">Due Friday · From email</p>
        </div>
      </div>
      <div>
        <Label>Recent</Label>
        <Row label="Albert Heijn" value="-€23.40" />
        <Row label="Shell" value="-€62.10" />
        <Row label="Spotify" value="-€10.99" />
      </div>
    </div>
  )
}

function InboxView() {
  return (
    <div className="flex flex-col gap-4">
      <Label color="#f59e0b">Inbox</Label>
      <div className="grid grid-cols-2 gap-2">
        <div className="p-3 rounded-lg bg-[#f59e0b]/5 text-center">
          <p className="text-[20px] font-bold text-[#f59e0b]">2</p>
          <p className="text-[9px] text-[#f59e0b]/40">Need you</p>
        </div>
        <div className="p-3 rounded-lg bg-[#22c55e]/5 text-center">
          <p className="text-[20px] font-bold text-[#22c55e]">14</p>
          <p className="text-[9px] text-[#22c55e]/40">Handled</p>
        </div>
      </div>
      <div>
        <Label>Needs Attention</Label>
        <div className="rounded-lg bg-white/[0.02] border border-white/[0.04] p-3 mb-2">
          <p className="text-[12px] font-semibold text-white/50">Coolblue — Invoice</p>
          <p className="text-[10px] text-[#3b82f6] mt-1">→ Route to Money</p>
        </div>
        <div className="rounded-lg bg-white/[0.02] border border-white/[0.04] p-3">
          <p className="text-[12px] font-semibold text-white/50">KLM — Booking AMS→BCN</p>
          <p className="text-[10px] text-[#a855f7] mt-1">→ Route to Life</p>
        </div>
      </div>
      <div>
        <Label>Auto-Handled</Label>
        <Row label="Newsletters archived" value="8" />
        <Row label="Promotions dismissed" value="4" />
        <Row label="Receipts → Money" value="2" />
      </div>
    </div>
  )
}

function LifeView() {
  return (
    <div className="flex flex-col gap-4">
      <Label color="#a855f7">Life</Label>
      <div className="rounded-xl bg-white/[0.02] border border-[#a855f7]/10 p-3">
        <p className="text-[16px] font-bold text-white/70 mb-0.5">Barcelona 🇪🇸</p>
        <p className="text-[11px] text-white/20 mb-2">Mar 22–26 · In 3 days</p>
        <Row label="Flight" value="KL1677 · 09:40" />
        <Row label="Hotel" value="Hotel Arts · 4n" />
        <Row label="Budget" value="€1,200" />
      </div>
      <div>
        <Label>Upcoming</Label>
        <Row label="Dentist" value="Apr 2" />
        <Row label="Car insurance" value="Apr 14" />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/landing/LandingDemoContext.tsx
git commit -m "feat(landing): add animated context panel with domain views"
```

---

### Task 9: LandingDemo — orchestrator with animation engine

**Files:**
- Create: `components/landing/LandingDemo.tsx`

- [ ] **Step 1: Build the demo orchestrator**

This is the main component that runs the animation timeline. It manages state for the chat messages and active panel, then passes them down to `LandingDemoChat` and `LandingDemoContext`.

It uses `useEffect` + `setTimeout` chain to execute each step from `DEMO_STEPS`. It auto-starts on mount and supports replay via a callback. Uses `useInView` to only start when the demo scrolls into view.

```tsx
// components/landing/LandingDemo.tsx
'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useInView } from 'framer-motion'
import { LandingDemoChat } from './LandingDemoChat'
import { LandingDemoContext } from './LandingDemoContext'
import { DEMO_STEPS, type DemoStep } from './demo-steps'

type PanelId = 'empty' | 'health' | 'money' | 'inbox' | 'life'

interface ChatMessage {
  id: string
  type: 'user' | 'ai' | 'tool' | 'typing'
  text?: string
  html?: string
  toolId?: string
  toolIcon?: string
  toolDone?: boolean
}

export function LandingDemo() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [activePanel, setActivePanel] = useState<PanelId>('empty')
  const [hasPlayed, setHasPlayed] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })
  const timeoutsRef = useRef<NodeJS.Timeout[]>([])

  const runDemo = useCallback(() => {
    // Clear previous state
    timeoutsRef.current.forEach(clearTimeout)
    timeoutsRef.current = []
    setMessages([])
    setActivePanel('empty')

    let elapsed = 0
    let msgCounter = 0

    DEMO_STEPS.forEach((step) => {
      elapsed += step.delay
      const timeout = setTimeout(() => {
        msgCounter++
        const id = `msg-${msgCounter}`

        switch (step.type) {
          case 'user-msg':
            // Remove any typing indicator first
            setMessages(prev => prev.filter(m => m.type !== 'typing'))
            setMessages(prev => [...prev, { id, type: 'user', text: step.text }])
            break

          case 'tool-start':
            setMessages(prev => [...prev, {
              id: `tool-${step.toolId}`,
              type: 'tool',
              text: step.text,
              toolId: step.toolId,
              toolIcon: step.toolIcon,
              toolDone: false,
            }])
            if (step.panel) setActivePanel(step.panel)
            break

          case 'tool-done':
            setMessages(prev => prev.map(m =>
              m.toolId === step.toolId ? { ...m, toolDone: true } : m
            ))
            break

          case 'typing':
            setMessages(prev => [...prev, { id, type: 'typing' }])
            break

          case 'ai-msg':
            setMessages(prev => prev.filter(m => m.type !== 'typing'))
            setMessages(prev => [...prev, { id, type: 'ai', html: step.html }])
            break
        }
      }, elapsed)
      timeoutsRef.current.push(timeout)
    })
  }, [])

  // Auto-start when in view
  useEffect(() => {
    if (isInView && !hasPlayed) {
      setHasPlayed(true)
      runDemo()
    }
  }, [isInView, hasPlayed, runDemo])

  // Cleanup on unmount
  useEffect(() => {
    return () => timeoutsRef.current.forEach(clearTimeout)
  }, [])

  return (
    <div ref={ref} id="demo" className="max-w-[1100px] mx-auto px-4 md:px-6">
      <div className="rounded-2xl border border-white/[0.06] overflow-hidden bg-[#111112] shadow-[0_24px_80px_rgba(0,0,0,0.4)]">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] h-[480px] md:h-[520px]">
          {/* Chat side */}
          <div className="border-r border-white/[0.04]">
            <LandingDemoChat messages={messages} />
          </div>

          {/* Context panel — hidden on mobile */}
          <div className="hidden lg:block">
            <LandingDemoContext activePanel={activePanel} />
          </div>
        </div>
      </div>

      {/* Replay button */}
      <div className="flex justify-center mt-4">
        <button
          onClick={() => { setHasPlayed(false); runDemo() }}
          className="text-[11px] text-white/20 hover:text-white/40 transition-colors"
        >
          ↻ Replay demo
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/landing/LandingDemo.tsx
git commit -m "feat(landing): add demo orchestrator with animation engine"
```

---

### Task 10: LandingCTA + LandingPage assembly

**Files:**
- Create: `components/landing/LandingCTA.tsx`
- Create: `components/landing/LandingPage.tsx`

- [ ] **Step 1: Build CTA component**

```tsx
// components/landing/LandingCTA.tsx
import Link from 'next/link'
import { ScrollReveal } from '@/components/ui/scroll-reveal'

export function LandingCTA() {
  return (
    <section className="text-center py-24 md:py-32 px-6">
      <ScrollReveal animation="fade-up" once>
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
          Your AI. Your data.{' '}
          <span className="text-white/20">Your life.</span>
        </h2>
        <p className="text-white/25 text-[14px] mb-8">
          Start free. No credit card. Just chat.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/signup"
            className="bg-white text-[#0A0A0B] px-7 py-3.5 rounded-full text-[13px] font-semibold hover:opacity-85 transition-opacity"
          >
            Get Started — It's Free
          </Link>
          <Link
            href="/login"
            className="border border-white/[0.08] text-white/40 px-7 py-3.5 rounded-full text-[13px] hover:border-white/[0.15] hover:text-white/60 transition-all"
          >
            Sign In
          </Link>
        </div>
      </ScrollReveal>
    </section>
  )
}
```

- [ ] **Step 2: Assemble the landing page**

```tsx
// components/landing/LandingPage.tsx
'use client'

import { LandingNav } from './LandingNav'
import { LandingHero } from './LandingHero'
import { LandingDemo } from './LandingDemo'
import { LandingCTA } from './LandingCTA'

export function LandingPage() {
  return (
    <>
      <LandingNav />
      <main>
        <LandingHero />
        <LandingDemo />
        <LandingCTA />
      </main>
    </>
  )
}
```

- [ ] **Step 3: Verify the landing page renders**

Run: `pnpm dev`
Visit `http://localhost:3000/`

Expected:
- Nav with CARVE logo + Get Started
- Hero headline with CTAs
- Animated demo that plays when scrolled into view
- Bottom CTA section
- Context panel switches between domains during demo

- [ ] **Step 4: Commit**

```bash
git add components/landing/LandingCTA.tsx components/landing/LandingPage.tsx
git commit -m "feat(landing): assemble landing page with all sections"
```

---

## Chunk 3: Chat Empty State Redesign

### Task 11: Redesign CarveEmptyState with domain paths

**Files:**
- Modify: `components/dashboard/hub/chat/CarveEmptyState.tsx`

- [ ] **Step 1: Rewrite the empty state component**

Replace the current chip grid with ilvlup-style domain paths. Keep the existing `onChipClick` interface — each path triggers a predefined first message.

The new design:
- Heading: "What do you want to improve?"
- Subtitle: "Pick a direction. Carve leads the way."
- 5 path cards: Health, Money, Life, Inbox, All of the above
- Divider: "or just ask"
- The input field is handled by the parent `CarveChat` component, so we don't duplicate it here.

```tsx
// components/dashboard/hub/chat/CarveEmptyState.tsx
'use client'

import { motion } from 'framer-motion'

interface DomainPath {
  id: string
  emoji: string
  title: string
  subtitle: string
  color: string
  message: string
}

const DOMAIN_PATHS: DomainPath[] = [
  {
    id: 'health',
    emoji: '💪',
    title: 'Get in shape',
    subtitle: 'Workouts, nutrition, body stats — coached by AI',
    color: 'rgba(34,197,94,0.08)',
    message: 'I want to get in shape. Help me build a plan.',
  },
  {
    id: 'money',
    emoji: '💰',
    title: 'Fix my finances',
    subtitle: 'Budget, spending, subscriptions — managed automatically',
    color: 'rgba(59,130,246,0.08)',
    message: "Help me get my finances in order. What's my budget looking like?",
  },
  {
    id: 'life',
    emoji: '✈️',
    title: 'Organize my life',
    subtitle: 'Trips, calendar, deadlines — nothing forgotten',
    color: 'rgba(168,85,247,0.08)',
    message: 'Help me organize my upcoming plans and trips.',
  },
  {
    id: 'inbox',
    emoji: '📧',
    title: 'Tame my inbox',
    subtitle: 'AI reads, sorts, and handles your email — you approve',
    color: 'rgba(245,158,11,0.08)',
    message: "What's in my inbox? Handle what you can.",
  },
  {
    id: 'all',
    emoji: '⚡',
    title: 'All of the above',
    subtitle: 'Connect everything. Let Carve optimize your whole life.',
    color: 'rgba(200,184,110,0.08)',
    message: "Give me a full overview — health, money, life, inbox. What's my week looking like?",
  },
]

interface CarveEmptyStateProps {
  onChipClick: (label: string) => void
  subtitle?: string
  statusPills?: { icon: string; label: string }[]
  suggestionChips?: { id: string; icon: string; label: string }[]
}

export function CarveEmptyState({ onChipClick }: CarveEmptyStateProps) {
  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="flex flex-col items-center w-full max-w-[560px] px-4">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="text-center mb-10"
        >
          <h1 className="text-[28px] md:text-[32px] font-bold text-white tracking-tight mb-2">
            What do you want to improve?
          </h1>
          <p className="text-[14px] text-white/30">
            Pick a direction. Carve leads the way.
          </p>
        </motion.div>

        {/* Domain paths */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="flex flex-col gap-2 w-full mb-6"
        >
          {DOMAIN_PATHS.map((path) => (
            <button
              key={path.id}
              onClick={() => onChipClick(path.message)}
              className="flex items-center gap-4 px-5 py-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] text-left hover:bg-white/[0.04] hover:border-white/[0.08] hover:-translate-y-0.5 transition-all group"
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center text-[20px] shrink-0"
                style={{ background: path.color }}
              >
                {path.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-semibold text-white/80">{path.title}</p>
                <p className="text-[13px] text-white/30">{path.subtitle}</p>
              </div>
              <span className="text-white/10 group-hover:text-white/30 group-hover:translate-x-0.5 transition-all text-[16px]">
                →
              </span>
            </button>
          ))}
        </motion.div>

        {/* Divider */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="flex items-center gap-4 w-full"
        >
          <div className="flex-1 h-px bg-white/[0.04]" />
          <span className="text-[11px] text-white/15 uppercase tracking-[0.1em]">or just ask</span>
          <div className="flex-1 h-px bg-white/[0.04]" />
        </motion.div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify the chat empty state renders**

Run: `pnpm dev`
Log in and visit `http://localhost:3000/chat`

Expected:
- "What do you want to improve?" heading
- 5 domain path cards with emoji, title, subtitle, arrow
- Hover: card lifts slightly, arrow becomes visible
- Click a path → triggers a chat message
- "or just ask" divider above the input

- [ ] **Step 3: Commit**

```bash
git add components/dashboard/hub/chat/CarveEmptyState.tsx
git commit -m "feat(chat): redesign empty state with domain path selection"
```

---

## Chunk 4: Final Polish & Verification

### Task 12: Handle wiki-home route migration

**Files:**
- Modify: `app/(wiki-home)/page.tsx` (may need to ensure it still works at `/wiki`)

- [ ] **Step 1: Verify wiki routing**

The `(wiki-home)` route group currently serves the root `/`. With our layout-wrapper change (`isWikiRoute` no longer matches `/`), we need to verify:

1. The `app/(wiki-home)/page.tsx` file still matches the `/` URL at the file-system level (route groups are invisible in URLs)
2. But our layout-wrapper now treats `/` as a landing route, not wiki

This means the `(wiki-home)` route group will conflict with the `(landing)` route group at `/`. We need to move wiki-home content to `/wiki`.

Check if `app/wiki/page.tsx` already exists:
```bash
ls app/wiki/
```

If there's already wiki content there, we need to merge. If not, we can either:
- Move `app/(wiki-home)/page.tsx` content to `app/wiki/page.tsx`
- Or add a redirect from the wiki-home route group

The simplest approach: rename `(wiki-home)` to serve at `/wiki` by moving its files.

- [ ] **Step 2: Move wiki-home to wiki route**

```bash
# Check current wiki structure
ls app/wiki/
```

The wiki route already exists with `[category]/` and `(learn)/` routes. The wiki homepage (`app/(wiki-home)/page.tsx`) needs to become `app/wiki/page.tsx`.

Move the files:
```bash
cp app/\(wiki-home\)/page.tsx app/wiki/page.tsx
cp app/\(wiki-home\)/wiki-home-content.tsx app/wiki/wiki-home-content.tsx
```

Update imports in the copied `app/wiki/page.tsx` if the `wiki-home-content` import path changed.

Then handle the layout: create `app/wiki/layout.tsx` that applies `.wiki-light` (copy from `app/(wiki-home)/layout.tsx`). But check if `app/wiki/layout.tsx` already exists first — if so, merge the `.wiki-light` class into it.

Finally, remove or empty the `(wiki-home)` route group to prevent conflicts.

- [ ] **Step 3: Remove old wiki-home route group**

```bash
rm -rf app/\(wiki-home\)/
```

- [ ] **Step 4: Verify everything works**

Run: `pnpm dev`

- `http://localhost:3000/` → Landing page
- `http://localhost:3000/wiki` → Wiki homepage
- `http://localhost:3000/wiki/nutrition/creatine` → Wiki article (should still work)
- `http://localhost:3000/chat` → Chat (when logged in)
- `http://localhost:3000/` when logged in → Redirects to `/chat`

- [ ] **Step 5: Commit**

```bash
git add app/wiki/ app/\(wiki-home\)/
git commit -m "refactor(routing): move wiki homepage to /wiki, free up root for landing page"
```

---

### Task 13: Build verification & final commit

- [ ] **Step 1: Run the build**

```bash
pnpm build
```

Fix any TypeScript errors or build issues.

- [ ] **Step 2: Visual verification checklist**

Open `http://localhost:3000/` in browser and verify:

- [ ] Nav: CARVE logo left, Get Started button right
- [ ] Hero: headline renders correctly, CTAs link to `/signup` and `#demo`
- [ ] Demo: auto-plays when scrolled into view
- [ ] Demo: tool calls appear with spinners, then checkmarks
- [ ] Demo: context panel switches between Health → Money → Inbox → Life
- [ ] Demo: AI response renders with colored domain tags
- [ ] Demo: second exchange plays after first
- [ ] Demo: replay button works
- [ ] CTA: bottom section renders with buttons
- [ ] Mobile: context panel hidden, chat demo still works
- [ ] Chat empty state: domain paths render correctly
- [ ] Chat empty state: clicking a path sends the message
- [ ] Wiki: `/wiki` shows the wiki homepage correctly

- [ ] **Step 3: Final commit**

```bash
git add .
git commit -m "feat(landing): complete landing page with animated demo and chat empty state redesign"
```
