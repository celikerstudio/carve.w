# Dashboard Hub Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rebuild the dashboard page into an AI-first hub with coach chat (70%) and widget sidebar (30%), using mock data.

**Architecture:** Replace `HealthDashboardClient` with a new `DashboardHub` component that contains two panels: `CoachChat` (left) and `WidgetSidebar` (right). All data is mock. The existing `HealthCard` pattern is reused as `DashboardCard`. The page fills the fixed-height `AppContent` container (no page scroll — the chat and sidebar scroll independently).

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind CSS v4 (hardcoded hex tokens), Framer Motion v12, Lucide React icons.

**Design reference:** See `docs/plans/2026-03-03-dashboard-hub-design.md` for full design spec.

**Key constraints:**
- Content renders inside `AppContent padded={false} useFixedHeight={true}` — the dashboard is a fixed-height pane, not a scrolling page
- Dark theme uses hardcoded hex values, NOT CSS variables or `dark:` prefix
- Color palette: card bg `#1c1f27`, page bg `#111318`, gold `#c8b86e`, text `white`, secondary `#9da6b9`, muted `#7a8299`
- Existing `HealthCard` is at `components/dashboard/shared/HealthCard.tsx`: `rounded-xl p-5 bg-[#1c1f27] border border-white/[0.06]`

---

### Task 1: Create mock data and types

**Files:**
- Create: `components/dashboard/hub/mock-data.ts`

**Step 1: Create the mock data file**

```typescript
// All mock data for the dashboard hub — types and sample data

export interface ChatMessage {
  id: string
  role: 'coach' | 'user'
  content: string
  timestamp: Date
}

export interface UserRankData {
  rankName: string
  currentXp: number
  nextLevelXp: number
  level: number
  streak: number
}

export interface TodayStat {
  icon: string // lucide icon name
  label: string
  value: string
  detail?: string
}

export interface MoneySnapshot {
  monthlyBudget: number
  spent: number
  currency: string
  recentExpenses: { label: string; amount: number }[]
}

export interface Challenge {
  id: string
  label: string
  type: 'daily' | 'weekly'
  current: number
  target: number
}

export interface LeaderboardEntry {
  rank: number
  name: string
  xp: number
  isYou?: boolean
}

export interface SuggestionChip {
  id: string
  icon: string // lucide icon name
  label: string
}

// --- Mock Data ---

export const mockRankData: UserRankData = {
  rankName: 'Intermediate',
  currentXp: 2450,
  nextLevelXp: 5000,
  level: 7,
  streak: 12,
}

export const mockTodayStats: TodayStat[] = [
  { icon: 'Dumbbell', label: 'Workouts', value: '3', detail: 'this week' },
  { icon: 'Footprints', label: 'Steps', value: '8,241', detail: 'today' },
  { icon: 'Flame', label: 'Calories', value: '1,840', detail: '/ 2,200' },
]

export const mockMoneySnapshot: MoneySnapshot = {
  monthlyBudget: 2000,
  spent: 1240,
  currency: '€',
  recentExpenses: [
    { label: 'Groceries', amount: 67.40 },
    { label: 'Spotify', amount: 10.99 },
  ],
}

export const mockChallenges: Challenge[] = [
  { id: '1', label: 'Log 3 meals', type: 'daily', current: 2, target: 3 },
  { id: '2', label: '4 workouts', type: 'weekly', current: 3, target: 4 },
  { id: '3', label: 'Hit step goal', type: 'daily', current: 8241, target: 10000 },
]

export const mockLeaderboard: LeaderboardEntry[] = [
  { rank: 1, name: 'Alex', xp: 12400 },
  { rank: 2, name: 'You', xp: 2450, isYou: true },
  { rank: 3, name: 'Sarah', xp: 2100 },
  { rank: 4, name: 'Mike', xp: 1800 },
]

export const mockSuggestionChips: SuggestionChip[] = [
  { id: '1', icon: 'TrendingUp', label: "What's my progress?" },
  { id: '2', icon: 'Dumbbell', label: 'Plan my workout' },
  { id: '3', icon: 'Wallet', label: "How's my budget?" },
  { id: '4', icon: 'BarChart3', label: 'Analyze my week' },
]

export const mockChatMessages: ChatMessage[] = []

export const mockStatusPills = [
  { icon: 'Flame', label: '12-day streak' },
  { icon: 'Dumbbell', label: '47 workouts' },
  { icon: 'Trophy', label: 'Level 7' },
]
```

**Step 2: Verify no import errors**

Run: `cd /Users/furkanceliker/Developer/carve-wiki && npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors related to the new file.

**Step 3: Commit**

```bash
git add components/dashboard/hub/mock-data.ts
git commit -m "feat(dashboard): add mock data and types for hub redesign"
```

---

### Task 2: Build DashboardCard base component

**Files:**
- Create: `components/dashboard/hub/DashboardCard.tsx`

**Step 1: Create the card component**

Based on existing `HealthCard` pattern but with widget-specific defaults (smaller padding for sidebar cards).

```tsx
'use client'

import { cn } from '@/lib/utils'

interface DashboardCardProps {
  children: React.ReactNode
  className?: string
  compact?: boolean
}

export function DashboardCard({ children, className, compact = false }: DashboardCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl bg-[#1c1f27] border border-white/[0.06]',
        compact ? 'p-4' : 'p-5',
        className
      )}
    >
      {children}
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add components/dashboard/hub/DashboardCard.tsx
git commit -m "feat(dashboard): add DashboardCard base component"
```

---

### Task 3: Build Coach Chat — Empty State

**Files:**
- Create: `components/dashboard/hub/chat/CoachEmptyState.tsx`

**Step 1: Create the empty state component**

This renders when there are no chat messages: coach avatar, welcome text, status pills, suggestion chips in 2-column grid.

```tsx
'use client'

import { motion } from 'framer-motion'
import { Brain, Flame, Dumbbell, Trophy, TrendingUp, Wallet, BarChart3 } from 'lucide-react'
import { mockStatusPills, mockSuggestionChips } from '../mock-data'

// Map string icon names to components
const iconMap: Record<string, React.ElementType> = {
  Flame, Dumbbell, Trophy, TrendingUp, Wallet, BarChart3, Brain,
}

interface CoachEmptyStateProps {
  userName?: string
  onChipClick: (label: string) => void
}

export function CoachEmptyState({ userName = 'there', onChipClick }: CoachEmptyStateProps) {
  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="flex flex-col items-center gap-6 max-w-sm px-4">
        {/* Coach Avatar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-16 h-16 rounded-full bg-[#1c1f27] border border-white/[0.06] flex items-center justify-center"
        >
          <Brain className="w-7 h-7 text-[#9da6b9]" />
        </motion.div>

        {/* Welcome Text */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="text-center"
        >
          <p className="text-[10px] font-bold uppercase tracking-[1.5px] text-[#7a8299] mb-2">
            Carve Coach
          </p>
          <p className="text-[15px] text-[#9da6b9]">
            Hey {userName}, I&apos;m your Carve coach. Ask me anything about your health, finances, or goals.
          </p>
        </motion.div>

        {/* Status Pills */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="flex flex-wrap justify-center gap-2"
        >
          {mockStatusPills.map((pill) => {
            const Icon = iconMap[pill.icon]
            return (
              <div
                key={pill.label}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1c1f27] border border-white/[0.06] text-[12px] text-[#9da6b9]"
              >
                {Icon && <Icon className="w-3 h-3 text-[#c8b86e]" />}
                <span>{pill.label}</span>
              </div>
            )
          })}
        </motion.div>

        {/* Suggestion Chips - 2 column grid */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.45 }}
          className="grid grid-cols-2 gap-2 w-full"
        >
          {mockSuggestionChips.map((chip) => {
            const Icon = iconMap[chip.icon]
            return (
              <button
                key={chip.id}
                onClick={() => onChipClick(chip.label)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[#1c1f27] border border-white/[0.06] text-left hover:border-[#c8b86e]/30 transition-colors"
              >
                {Icon && <Icon className="w-4 h-4 text-[#c8b86e] shrink-0" />}
                <span className="text-[13px] text-white">{chip.label}</span>
              </button>
            )
          })}
        </motion.div>
      </div>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add components/dashboard/hub/chat/CoachEmptyState.tsx
git commit -m "feat(dashboard): add coach empty state with avatar, pills, suggestion chips"
```

---

### Task 4: Build Coach Chat — Message Bubbles

**Files:**
- Create: `components/dashboard/hub/chat/ChatBubble.tsx`

**Step 1: Create the chat bubble component**

Coach bubbles: glass card, left-aligned with avatar.
User bubbles: gold-tinted, right-aligned, no avatar.

```tsx
'use client'

import { Brain } from 'lucide-react'
import type { ChatMessage } from '../mock-data'

interface ChatBubbleProps {
  message: ChatMessage
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const isCoach = message.role === 'coach'

  return (
    <div className={`flex items-start gap-2 px-4 ${isCoach ? 'justify-start' : 'justify-end'}`}>
      {/* Coach avatar */}
      {isCoach && (
        <div className="w-7 h-7 rounded-full bg-[#1c1f27] border border-white/[0.06] flex items-center justify-center shrink-0 mt-1">
          <Brain className="w-3.5 h-3.5 text-[#9da6b9]" />
        </div>
      )}

      {/* Bubble */}
      <div
        className={`max-w-[80%] px-3 py-2.5 rounded-2xl ${
          isCoach
            ? 'bg-[#1c1f27] border border-white/[0.06]'
            : 'bg-[#c8b86e]/[0.08] border border-[#c8b86e]'
        }`}
      >
        <p className="text-[15px] text-white leading-relaxed">{message.content}</p>
        <p className="text-[11px] text-[#7a8299] mt-1">
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>

      {/* Spacer for coach messages */}
      {isCoach && <div className="min-w-[40px]" />}
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add components/dashboard/hub/chat/ChatBubble.tsx
git commit -m "feat(dashboard): add chat bubble component with coach/user variants"
```

---

### Task 5: Build Coach Chat — Input Bar + Suggestion Chips

**Files:**
- Create: `components/dashboard/hub/chat/CoachInputBar.tsx`
- Create: `components/dashboard/hub/chat/SuggestionChips.tsx`

**Step 1: Create suggestion chips (horizontal scroll)**

```tsx
'use client'

import { TrendingUp, Dumbbell, Wallet, BarChart3 } from 'lucide-react'
import type { SuggestionChip } from '../mock-data'

const iconMap: Record<string, React.ElementType> = {
  TrendingUp, Dumbbell, Wallet, BarChart3,
}

interface SuggestionChipsProps {
  chips: SuggestionChip[]
  onChipClick: (label: string) => void
}

export function SuggestionChips({ chips, onChipClick }: SuggestionChipsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide px-4 py-2">
      {chips.map((chip) => {
        const Icon = iconMap[chip.icon]
        return (
          <button
            key={chip.id}
            onClick={() => onChipClick(chip.label)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1c1f27] border border-white/[0.06] text-[13px] text-[#9da6b9] hover:border-[#c8b86e]/30 hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            {Icon && <Icon className="w-3 h-3 text-[#c8b86e]" />}
            <span>{chip.label}</span>
          </button>
        )
      })}
    </div>
  )
}
```

**Step 2: Create input bar**

```tsx
'use client'

import { useState } from 'react'
import { ArrowUp } from 'lucide-react'

interface CoachInputBarProps {
  onSend: (message: string) => void
}

export function CoachInputBar({ onSend }: CoachInputBarProps) {
  const [input, setInput] = useState('')
  const [isFocused, setIsFocused] = useState(false)

  const handleSend = () => {
    if (!input.trim()) return
    onSend(input.trim())
    setInput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="px-4 pb-4">
      <div
        className={`flex items-end gap-2 px-3 py-2 rounded-2xl bg-[#1c1f27] border transition-colors ${
          isFocused ? 'border-[#c8b86e]/50' : 'border-white/[0.06]'
        }`}
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder="Ask your coach..."
          rows={1}
          className="flex-1 bg-transparent text-[15px] text-white placeholder:text-[#7a8299] resize-none outline-none max-h-[120px] py-1"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim()}
          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${
            input.trim()
              ? 'bg-[#c8b86e] text-[#111318]'
              : 'bg-white/[0.06] text-[#7a8299]'
          }`}
        >
          <ArrowUp className="w-4 h-4" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  )
}
```

**Step 3: Commit**

```bash
git add components/dashboard/hub/chat/SuggestionChips.tsx components/dashboard/hub/chat/CoachInputBar.tsx
git commit -m "feat(dashboard): add input bar with gold focus border and suggestion chips"
```

---

### Task 6: Build Coach Chat — Main Container

**Files:**
- Create: `components/dashboard/hub/chat/CoachChat.tsx`

**Step 1: Create the main chat container**

Composes empty state, message list, suggestion chips, and input bar. Manages local mock chat state.

```tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CoachEmptyState } from './CoachEmptyState'
import { ChatBubble } from './ChatBubble'
import { SuggestionChips } from './SuggestionChips'
import { CoachInputBar } from './CoachInputBar'
import { mockSuggestionChips, type ChatMessage } from '../mock-data'

const MOCK_COACH_REPLIES: Record<string, string> = {
  "What's my progress?":
    "You're doing great! 3 workouts this week, 12-day streak going strong. Your XP puts you at Intermediate rank — 2,550 XP away from Advanced. Keep pushing!",
  'Plan my workout':
    "Based on your history, I'd suggest an upper body session today. You haven't hit chest/shoulders since Monday. Want me to build a quick plan?",
  "How's my budget?":
    "You've spent €1,240 of your €2,000 monthly budget. That's 62% with 12 days left. Your biggest category is groceries at €340. Looking solid!",
  'Analyze my week':
    "This week: 3 workouts (target 4), 8.2k avg steps, and nutrition is on point at 1,840 cal avg. Money-wise you're tracking under budget. One more workout and you'll hit all your goals!",
}

export function CoachChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = (content: string) => {
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])

    // Simulate coach reply after a short delay
    setTimeout(() => {
      const replyContent =
        MOCK_COACH_REPLIES[content] ||
        "That's a great question! In the full version, I'll have real-time insights from your health, nutrition, and financial data. For now, try one of the suggestion chips!"
      const coachMessage: ChatMessage = {
        id: `coach-${Date.now()}`,
        role: 'coach',
        content: replyContent,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, coachMessage])
    }, 800)
  }

  const hasMessages = messages.length > 0

  return (
    <div className="flex flex-col h-full">
      {/* Messages area or empty state */}
      {hasMessages ? (
        <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-hide py-4">
          <div className="flex flex-col gap-3">
            <AnimatePresence>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChatBubble message={msg} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      ) : (
        <CoachEmptyState userName="Furkan" onChipClick={handleSend} />
      )}

      {/* Suggestion chips (visible when messages exist) */}
      {hasMessages && (
        <SuggestionChips chips={mockSuggestionChips} onChipClick={handleSend} />
      )}

      {/* Input bar */}
      <CoachInputBar onSend={handleSend} />
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add components/dashboard/hub/chat/CoachChat.tsx
git commit -m "feat(dashboard): add CoachChat container with mock reply logic"
```

---

### Task 7: Build Widget Sidebar — XP/Rank Widget

**Files:**
- Create: `components/dashboard/hub/widgets/XpRankWidget.tsx`

**Step 1: Create the XP/Rank widget**

```tsx
'use client'

import { Flame } from 'lucide-react'
import { DashboardCard } from '../DashboardCard'
import { mockRankData } from '../mock-data'

export function XpRankWidget() {
  const { rankName, currentXp, nextLevelXp, level, streak } = mockRankData
  const progress = (currentXp / nextLevelXp) * 100

  return (
    <DashboardCard compact>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-bold uppercase tracking-[1.5px] text-[#7a8299]">Rank</p>
        <div className="flex items-center gap-1 text-[12px] text-[#c8b86e]">
          <Flame className="w-3 h-3" />
          <span>{streak} days</span>
        </div>
      </div>
      <p className="text-[20px] font-bold text-white mb-1">{rankName}</p>
      <div className="flex items-center gap-2 mb-2">
        <div className="flex-1 h-[3px] rounded-full bg-white/[0.05]">
          <div
            className="h-full rounded-full bg-[#c8b86e] transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-[11px] text-[#7a8299]">Lv {level}</span>
      </div>
      <p className="text-[12px] text-[#7a8299]">
        {currentXp.toLocaleString()} / {nextLevelXp.toLocaleString()} XP
      </p>
    </DashboardCard>
  )
}
```

**Step 2: Commit**

```bash
git add components/dashboard/hub/widgets/XpRankWidget.tsx
git commit -m "feat(dashboard): add XP/Rank sidebar widget"
```

---

### Task 8: Build Widget Sidebar — Today Overview

**Files:**
- Create: `components/dashboard/hub/widgets/TodayWidget.tsx`

**Step 1: Create the Today widget**

```tsx
'use client'

import { Dumbbell, Footprints, Flame } from 'lucide-react'
import { DashboardCard } from '../DashboardCard'
import { mockTodayStats } from '../mock-data'

const iconMap: Record<string, React.ElementType> = {
  Dumbbell, Footprints, Flame,
}

export function TodayWidget() {
  return (
    <DashboardCard compact>
      <p className="text-[10px] font-bold uppercase tracking-[1.5px] text-[#7a8299] mb-3">Today</p>
      <div className="flex flex-col gap-2.5">
        {mockTodayStats.map((stat) => {
          const Icon = iconMap[stat.icon]
          return (
            <div key={stat.label} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {Icon && <Icon className="w-3.5 h-3.5 text-[#9da6b9]" />}
                <span className="text-[13px] text-[#9da6b9]">{stat.label}</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-[14px] font-semibold text-white">{stat.value}</span>
                {stat.detail && (
                  <span className="text-[11px] text-[#7a8299]">{stat.detail}</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </DashboardCard>
  )
}
```

**Step 2: Commit**

```bash
git add components/dashboard/hub/widgets/TodayWidget.tsx
git commit -m "feat(dashboard): add Today overview sidebar widget"
```

---

### Task 9: Build Widget Sidebar — Money Snapshot

**Files:**
- Create: `components/dashboard/hub/widgets/MoneyWidget.tsx`

**Step 1: Create the Money widget**

```tsx
'use client'

import { DashboardCard } from '../DashboardCard'
import { mockMoneySnapshot } from '../mock-data'

export function MoneyWidget() {
  const { monthlyBudget, spent, currency, recentExpenses } = mockMoneySnapshot
  const remaining = monthlyBudget - spent
  const progress = (spent / monthlyBudget) * 100

  return (
    <DashboardCard compact>
      <p className="text-[10px] font-bold uppercase tracking-[1.5px] text-[#7a8299] mb-3">Budget</p>
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-[14px] font-semibold text-white">
          {currency}{spent.toLocaleString()}
        </span>
        <span className="text-[12px] text-[#7a8299]">
          / {currency}{monthlyBudget.toLocaleString()}
        </span>
      </div>
      <div className="h-[3px] rounded-full bg-white/[0.05] mb-2">
        <div
          className="h-full rounded-full bg-emerald-400 transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-[12px] text-emerald-400 mb-3">
        {currency}{remaining.toLocaleString()} remaining
      </p>
      <div className="flex flex-col gap-1.5">
        {recentExpenses.map((expense) => (
          <div key={expense.label} className="flex items-center justify-between">
            <span className="text-[12px] text-[#9da6b9]">{expense.label}</span>
            <span className="text-[12px] text-[#7a8299]">
              {currency}{expense.amount.toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    </DashboardCard>
  )
}
```

**Step 2: Commit**

```bash
git add components/dashboard/hub/widgets/MoneyWidget.tsx
git commit -m "feat(dashboard): add Money snapshot sidebar widget"
```

---

### Task 10: Build Widget Sidebar — Challenges

**Files:**
- Create: `components/dashboard/hub/widgets/ChallengesWidget.tsx`

**Step 1: Create the Challenges widget**

```tsx
'use client'

import { DashboardCard } from '../DashboardCard'
import { mockChallenges } from '../mock-data'

export function ChallengesWidget() {
  return (
    <DashboardCard compact>
      <p className="text-[10px] font-bold uppercase tracking-[1.5px] text-[#7a8299] mb-3">
        Challenges
      </p>
      <div className="flex flex-col gap-3">
        {mockChallenges.map((challenge) => {
          const progress = Math.min((challenge.current / challenge.target) * 100, 100)
          return (
            <div key={challenge.id}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[13px] text-white">{challenge.label}</span>
                <span className="text-[11px] text-[#7a8299]">
                  {challenge.current >= 1000
                    ? `${(challenge.current / 1000).toFixed(1)}k`
                    : challenge.current}
                  /{challenge.target >= 1000
                    ? `${(challenge.target / 1000).toFixed(0)}k`
                    : challenge.target}
                </span>
              </div>
              <div className="h-[2px] rounded-full bg-white/[0.05]">
                <div
                  className="h-full rounded-full bg-[#c8b86e] transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </DashboardCard>
  )
}
```

**Step 2: Commit**

```bash
git add components/dashboard/hub/widgets/ChallengesWidget.tsx
git commit -m "feat(dashboard): add Challenges sidebar widget"
```

---

### Task 11: Build Widget Sidebar — Leaderboard

**Files:**
- Create: `components/dashboard/hub/widgets/LeaderboardWidget.tsx`

**Step 1: Create the Leaderboard widget**

```tsx
'use client'

import { DashboardCard } from '../DashboardCard'
import { mockLeaderboard } from '../mock-data'

export function LeaderboardWidget() {
  return (
    <DashboardCard compact>
      <p className="text-[10px] font-bold uppercase tracking-[1.5px] text-[#7a8299] mb-3">
        Leaderboard
      </p>
      <div className="flex flex-col gap-2">
        {mockLeaderboard.map((entry) => (
          <div
            key={entry.rank}
            className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg ${
              entry.isYou ? 'bg-[#c8b86e]/[0.08] border border-[#c8b86e]/20' : ''
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span
                className={`text-[13px] font-semibold w-5 ${
                  entry.rank === 1 ? 'text-[#c8b86e]' : 'text-[#7a8299]'
                }`}
              >
                {entry.rank}
              </span>
              <span className={`text-[13px] ${entry.isYou ? 'text-white font-medium' : 'text-[#9da6b9]'}`}>
                {entry.name}
                {entry.isYou && (
                  <span className="text-[11px] text-[#c8b86e] ml-1">← you</span>
                )}
              </span>
            </div>
            <span className="text-[12px] text-[#7a8299]">
              {entry.xp.toLocaleString()} XP
            </span>
          </div>
        ))}
      </div>
    </DashboardCard>
  )
}
```

**Step 2: Commit**

```bash
git add components/dashboard/hub/widgets/LeaderboardWidget.tsx
git commit -m "feat(dashboard): add Leaderboard sidebar widget"
```

---

### Task 12: Build Widget Sidebar Container

**Files:**
- Create: `components/dashboard/hub/WidgetSidebar.tsx`

**Step 1: Create the sidebar container**

Stacks all 5 widgets with Framer Motion staggered entry.

```tsx
'use client'

import { motion } from 'framer-motion'
import { XpRankWidget } from './widgets/XpRankWidget'
import { TodayWidget } from './widgets/TodayWidget'
import { MoneyWidget } from './widgets/MoneyWidget'
import { ChallengesWidget } from './widgets/ChallengesWidget'
import { LeaderboardWidget } from './widgets/LeaderboardWidget'

export function WidgetSidebar() {
  const widgets = [
    { key: 'xp', Component: XpRankWidget },
    { key: 'today', Component: TodayWidget },
    { key: 'money', Component: MoneyWidget },
    { key: 'challenges', Component: ChallengesWidget },
    { key: 'leaderboard', Component: LeaderboardWidget },
  ]

  return (
    <div className="h-full overflow-y-auto scrollbar-hide py-4 pr-4 pl-2">
      <div className="flex flex-col gap-3">
        {widgets.map(({ key, Component }, i) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
          >
            <Component />
          </motion.div>
        ))}
      </div>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add components/dashboard/hub/WidgetSidebar.tsx
git commit -m "feat(dashboard): add WidgetSidebar container with staggered animations"
```

---

### Task 13: Build DashboardHub main component

**Files:**
- Create: `components/dashboard/hub/DashboardHub.tsx`

**Step 1: Create the main hub layout**

This is the root component that composes chat (70%) and sidebar (30%) in a responsive layout. It fills the full height of the `AppContent` container.

```tsx
'use client'

import { CoachChat } from './chat/CoachChat'
import { WidgetSidebar } from './WidgetSidebar'

export function DashboardHub() {
  return (
    <div className="flex h-full">
      {/* AI Coach Chat — 70% on desktop, full width on mobile */}
      <div className="flex-1 min-w-0 border-r border-white/[0.04]">
        <CoachChat />
      </div>

      {/* Widget Sidebar — 30% on desktop, hidden on mobile */}
      <div className="hidden lg:block w-[340px] shrink-0">
        <WidgetSidebar />
      </div>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add components/dashboard/hub/DashboardHub.tsx
git commit -m "feat(dashboard): add DashboardHub layout with chat + sidebar split"
```

---

### Task 14: Wire up the dashboard page

**Files:**
- Modify: `app/(protected)/dashboard/page.tsx`

**Step 1: Replace the current page content**

Replace the server component that fetches data and renders `HealthDashboardClient` with a simple render of `DashboardHub`. Keep it as a server component but just render the client hub.

```tsx
import { DashboardHub } from '@/components/dashboard/hub/DashboardHub'

export default function DashboardPage() {
  return <DashboardHub />
}
```

Note: The old `HealthDashboardClient` and its widgets are NOT deleted — they remain in `components/dashboard/` for reference and for when we wire up real data later. We just stop importing them from the page.

**Step 2: Verify the build compiles**

Run: `cd /Users/furkanceliker/Developer/carve-wiki && npm run build 2>&1 | tail -30`
Expected: Build succeeds or only has pre-existing warnings.

**Step 3: Verify dev server renders correctly**

Run: `cd /Users/furkanceliker/Developer/carve-wiki && npm run dev`
Then visit `http://localhost:3000/dashboard` and verify:
- Chat empty state renders with avatar, welcome text, pills, chips
- Widget sidebar renders with all 5 widgets
- Layout is 70/30 split on desktop
- Clicking a suggestion chip sends a message and gets a mock reply
- Input bar works with typing and sending

**Step 4: Commit**

```bash
git add app/\(protected\)/dashboard/page.tsx
git commit -m "feat(dashboard): wire DashboardHub as new dashboard page"
```

---

### Task 15: Add mobile responsive layout

**Files:**
- Modify: `components/dashboard/hub/DashboardHub.tsx`

**Step 1: Add mobile widget section below chat**

On screens < lg, the sidebar is hidden. Add a mobile-only widget section that shows as a horizontal scroll row or collapsible section below the chat.

Update `DashboardHub.tsx`:

```tsx
'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { CoachChat } from './chat/CoachChat'
import { WidgetSidebar } from './WidgetSidebar'
import { XpRankWidget } from './widgets/XpRankWidget'
import { TodayWidget } from './widgets/TodayWidget'
import { MoneyWidget } from './widgets/MoneyWidget'
import { ChallengesWidget } from './widgets/ChallengesWidget'
import { LeaderboardWidget } from './widgets/LeaderboardWidget'

export function DashboardHub() {
  const [mobileWidgetsOpen, setMobileWidgetsOpen] = useState(false)

  return (
    <div className="flex flex-col lg:flex-row h-full">
      {/* AI Coach Chat */}
      <div className="flex-1 min-w-0 lg:border-r lg:border-white/[0.04] min-h-0">
        <CoachChat />
      </div>

      {/* Widget Sidebar — desktop */}
      <div className="hidden lg:block w-[340px] shrink-0">
        <WidgetSidebar />
      </div>

      {/* Widget section — mobile */}
      <div className="lg:hidden border-t border-white/[0.06]">
        <button
          onClick={() => setMobileWidgetsOpen(!mobileWidgetsOpen)}
          className="flex items-center justify-between w-full px-4 py-3 text-[13px] text-[#9da6b9]"
        >
          <span>Widgets</span>
          {mobileWidgetsOpen ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
        {mobileWidgetsOpen && (
          <div className="px-4 pb-4 flex flex-col gap-3">
            <XpRankWidget />
            <TodayWidget />
            <MoneyWidget />
            <ChallengesWidget />
            <LeaderboardWidget />
          </div>
        )}
      </div>
    </div>
  )
}
```

**Step 2: Verify responsive behavior**

Check in dev tools:
- Desktop (>1024px): 70/30 split, sidebar visible
- Mobile (<1024px): Chat full width, "Widgets" toggle below

**Step 3: Commit**

```bash
git add components/dashboard/hub/DashboardHub.tsx
git commit -m "feat(dashboard): add responsive mobile layout with collapsible widgets"
```

---

### Task 16: Final polish and visual verification

**Files:**
- Possibly adjust: any hub component that needs visual tweaks

**Step 1: Run the build**

Run: `cd /Users/furkanceliker/Developer/carve-wiki && npm run build 2>&1 | tail -30`
Expected: Clean build.

**Step 2: Visual verification checklist**

Open `http://localhost:3000/dashboard` and verify:
- [ ] Empty state: coach avatar, welcome text, status pills, 4 suggestion chips (2x2 grid)
- [ ] Click suggestion chip → user bubble appears (gold-tinted, right-aligned)
- [ ] After ~800ms → coach reply bubble appears (glass, left-aligned with avatar)
- [ ] Suggestion chips move to horizontal scroll above input bar
- [ ] Input bar: glass border, gold border on focus, gold send button when text entered
- [ ] Enter key sends message
- [ ] Widget sidebar: all 5 widgets visible with staggered animation
- [ ] XP bar has gold fill, streak badge
- [ ] Money widget has green remaining amount, progress bar
- [ ] Challenges have gold progress bars
- [ ] Leaderboard has gold highlight on your row
- [ ] Mobile: sidebar hidden, "Widgets" toggle works

**Step 3: Final commit**

```bash
git add -A
git commit -m "feat(dashboard): complete dashboard hub with AI coach and widget sidebar"
```
