# Carve AI Chat Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the mock Coach Chat with a real AI-powered unified chat called "Carve AI", integrating the existing Travel AI chat engine into the dashboard hub.

**Architecture:** Unified chat using `useChat` from `@ai-sdk/react` → new `/api/carve-ai/chat` route → Claude API with streaming. Domain tabs (health/money/travel) only change suggestion chips and status pills in the empty state. Conversations saved to Supabase.

**Tech Stack:** Next.js App Router, AI SDK (`ai`, `@ai-sdk/react`, `@ai-sdk/anthropic`), Supabase, Zod, framer-motion

---

### Task 1: Create Carve AI system prompt

**Files:**
- Create: `lib/ai/carve-ai-prompts.ts`

**Step 1: Create the unified system prompt file**

```typescript
export const CARVE_AI_SYSTEM_PROMPT = `You are Carve AI, a personal life coach that helps users with health, finances, and travel planning. You're friendly, knowledgeable, and concise — like a smart friend who genuinely cares.

DOMAINS:
- Health & Fitness: workout advice, nutrition tips, habit tracking guidance, goal setting
- Money & Finance: budgeting advice, spending analysis, savings strategies, subscription management
- Travel: trip planning with the generate_trip_plan tool when you have enough info

CONVERSATION STYLE:
- Keep responses concise (2-4 sentences unless detail is needed)
- Be actionable — give specific advice, not generic platitudes
- Ask follow-up questions to understand context before giving advice
- Use a warm but direct tone

TRAVEL PLANNING FLOW:
When a user wants to plan a trip:
1. Ask about destination, duration, and budget
2. Ask UP TO 3 follow-up questions (travel style, accommodation preference, must-sees)
3. Once you have enough context, use the generate_trip_plan tool

IMPORTANT RULES:
- Always respond in the same language the user writes in
- Never make up user data — if you don't have access to their health/money data, be honest about it and give general advice
- For health and money, provide coaching based on the conversation context
- For travel, use the generate_trip_plan tool when ready to create a plan

BUDGET GUIDELINES (for travel):
- Break down costs into: accommodation, food, activities, transport, other
- Use realistic prices for the destination
- Account for accommodation preference when estimating costs`

export const CARVE_AI_REPLAN_PROMPT = `You are Carve AI. The user has an existing trip plan and wants to modify it.

RULES:
- Only modify the specific part the user mentions
- Keep the rest of the plan intact
- Respond in the same language the user writes in
- Use the generate_trip_plan tool with the COMPLETE plan (all days), with your modifications applied
- Explain briefly what you changed and why`
```

**Step 2: Commit**

```bash
git add lib/ai/carve-ai-prompts.ts
git commit -m "feat(carve-ai): add unified system prompt"
```

---

### Task 2: Create the unified API route

**Files:**
- Create: `app/api/carve-ai/chat/route.ts`
- Reference: `app/api/travel/chat/route.ts` (pattern to follow)

**Step 1: Create the API route**

```typescript
import { streamText, tool, stepCountIs } from "ai"
import { anthropic } from "@ai-sdk/anthropic"
import { createClient } from "@/lib/supabase/server"
import { CARVE_AI_SYSTEM_PROMPT } from "@/lib/ai/carve-ai-prompts"
import { tripPlanSchema } from "@/lib/ai/travel-schemas"
import { checkRateLimit } from "@/lib/ai/rate-limit"

export const maxDuration = 60

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return new Response("Unauthorized", { status: 401 })
  }

  const { allowed, retryAfterMs } = checkRateLimit(user.id, "carve-ai-chat", 30)
  if (!allowed) {
    return new Response("Rate limit exceeded", {
      status: 429,
      headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) },
    })
  }

  const body = await req.json()
  const { messages, conversationId } = body as {
    messages: Array<{ role: string; content: string }>
    conversationId?: string
  }

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return new Response("Messages required", { status: 400 })
  }

  const modelMessages = messages.map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }))

  const result = streamText({
    model: anthropic("claude-sonnet-4-20250514"),
    system: CARVE_AI_SYSTEM_PROMPT,
    messages: modelMessages,
    tools: {
      generate_trip_plan: tool({
        description:
          "Generate a complete trip plan with daily activities, accommodations, and budget breakdown. Call this when you have enough information to create the plan.",
        inputSchema: tripPlanSchema,
      }),
    },
    stopWhen: stepCountIs(2),
  })

  return result.toUIMessageStreamResponse()
}
```

**Step 2: Commit**

```bash
git add app/api/carve-ai/chat/route.ts
git commit -m "feat(carve-ai): add unified API route with Claude streaming"
```

---

### Task 3: Update mock-data.ts — remove coachReplies, keep UI config

**Files:**
- Modify: `components/dashboard/hub/mock-data.ts`

**Step 1: Remove `coachReplies` from `SectionConfig` and all configs**

Remove the `coachReplies` field from the `SectionConfig` interface.
Remove the `coachReplies` property from `healthConfig`, `moneyConfig`, and `travelConfig`.
Remove the `ChatMessage` interface (will be replaced by AI SDK types).
Keep everything else — `SuggestionChip`, `SectionConfig` (minus coachReplies), status pills, suggestion chips.

Updated `SectionConfig`:
```typescript
export interface SectionConfig {
  subtitle: string
  statusPills: { icon: string; label: string }[]
  suggestionChips: SuggestionChip[]
}
```

**Step 2: Commit**

```bash
git add components/dashboard/hub/mock-data.ts
git commit -m "refactor(carve-ai): remove mock coachReplies from section configs"
```

---

### Task 4: Rename and refactor ChatBubble for AI SDK messages

**Files:**
- Modify: `components/dashboard/hub/chat/ChatBubble.tsx`

**Step 1: Update ChatBubble to accept role as 'user' | 'assistant' instead of 'coach' | 'user'**

Replace the import of `ChatMessage` from mock-data with a local interface:

```typescript
'use client'

import { iconMap } from '../mock-data'

interface ChatBubbleProps {
  role: 'user' | 'assistant'
  content: string
}

export function ChatBubble({ role, content }: ChatBubbleProps) {
  const isAssistant = role === 'assistant'
  const BrainIcon = iconMap['Brain']

  return (
    <div className={`flex items-start gap-2 px-4 ${isAssistant ? 'justify-start' : 'justify-end'}`}>
      {isAssistant && (
        <div className="w-7 h-7 rounded-full bg-[#1c1f27] border border-white/[0.06] flex items-center justify-center shrink-0 mt-1">
          {BrainIcon && <BrainIcon className="w-3.5 h-3.5 text-[#9da6b9]" />}
        </div>
      )}

      <div
        className={`max-w-[80%] px-3 py-2.5 rounded-2xl ${
          isAssistant
            ? 'bg-[#1c1f27] border border-white/[0.06]'
            : 'bg-[#c8b86e]/[0.08] border border-[#c8b86e]'
        }`}
      >
        <p className="text-[15px] text-white leading-relaxed whitespace-pre-wrap">{content}</p>
      </div>

      {isAssistant && <div className="min-w-[40px]" />}
    </div>
  )
}
```

Remove the timestamp display (AI SDK messages don't have timestamps by default, cleaner without).

**Step 2: Commit**

```bash
git add components/dashboard/hub/chat/ChatBubble.tsx
git commit -m "refactor(carve-ai): update ChatBubble for AI SDK message format"
```

---

### Task 5: Rename CoachInputBar → CarveInputBar with disabled prop

**Files:**
- Rename: `components/dashboard/hub/chat/CoachInputBar.tsx` → `components/dashboard/hub/chat/CarveInputBar.tsx`

**Step 1: Rename the file and add `disabled` prop**

```typescript
'use client'

import { useState, useRef } from 'react'
import { ArrowUp } from 'lucide-react'

interface CarveInputBarProps {
  onSend: (message: string) => void
  disabled?: boolean
}

export function CarveInputBar({ onSend, disabled }: CarveInputBarProps) {
  const [input, setInput] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }

  const handleSend = () => {
    if (!input.trim() || disabled) return
    onSend(input.trim())
    setInput('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
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
          ref={textareaRef}
          value={input}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Carve AI..."
          disabled={disabled}
          rows={1}
          className="flex-1 bg-transparent text-[15px] text-white placeholder:text-[#7a8299] resize-none outline-none max-h-[120px] py-1 disabled:opacity-50"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || disabled}
          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${
            input.trim() && !disabled
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

**Step 2: Commit**

```bash
git add components/dashboard/hub/chat/CarveInputBar.tsx
git rm components/dashboard/hub/chat/CoachInputBar.tsx
git commit -m "refactor(carve-ai): rename CoachInputBar → CarveInputBar with disabled prop"
```

---

### Task 6: Rename CoachEmptyState → CarveEmptyState

**Files:**
- Rename: `components/dashboard/hub/chat/CoachEmptyState.tsx` → `components/dashboard/hub/chat/CarveEmptyState.tsx`

**Step 1: Rename file and update branding**

Change the label from "Carve Coach" to "Carve AI" and update the default subtitle. Keep all other functionality identical (status pills, suggestion chips, animations).

Key changes:
- Component name: `CoachEmptyState` → `CarveEmptyState`
- Label text: `"Carve Coach"` → `"Carve AI"`
- Default subtitle: `"Hey there, I'm your Carve coach..."` → `"Hey, I'm Carve AI — your personal coach for health, money, and travel."`

**Step 2: Commit**

```bash
git add components/dashboard/hub/chat/CarveEmptyState.tsx
git rm components/dashboard/hub/chat/CoachEmptyState.tsx
git commit -m "refactor(carve-ai): rename CoachEmptyState → CarveEmptyState"
```

---

### Task 7: Refactor CoachChat → CarveChat with real AI

**Files:**
- Rename: `components/dashboard/hub/chat/CoachChat.tsx` → `components/dashboard/hub/chat/CarveChat.tsx`

This is the main refactor. Replace mock `setTimeout` with `useChat` hook from `@ai-sdk/react`.

**Step 1: Create the new CarveChat component**

```typescript
'use client'

import { useEffect, useRef, useMemo } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { motion } from 'framer-motion'
import { CarveEmptyState } from './CarveEmptyState'
import { ChatBubble } from './ChatBubble'
import { SuggestionChips } from './SuggestionChips'
import { CarveInputBar } from './CarveInputBar'
import { iconMap, healthConfig, type SectionConfig } from '../mock-data'

function TypingIndicator() {
  const BrainIcon = iconMap['Brain']
  return (
    <div className="flex items-start gap-2 px-4">
      <div className="w-7 h-7 rounded-full bg-[#1c1f27] border border-white/[0.06] flex items-center justify-center shrink-0 mt-1">
        {BrainIcon && <BrainIcon className="w-3.5 h-3.5 text-[#9da6b9]" />}
      </div>
      <div className="px-4 py-3 rounded-2xl bg-[#1c1f27] border border-white/[0.06]">
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-[#c8b86e]"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

interface CarveChatProps {
  config?: SectionConfig
}

export function CarveChat({ config = healthConfig }: CarveChatProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const transport = useMemo(
    () => new DefaultChatTransport({ api: '/api/carve-ai/chat' }),
    []
  )

  const { messages, sendMessage, status } = useChat({
    transport,
  })

  const isLoading = status === 'streaming' || status === 'submitted'

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isLoading])

  const getMessageText = (message: typeof messages[0]) => {
    return message.parts
      .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
      .map((p) => p.text)
      .join('')
  }

  const handleSend = (content: string) => {
    sendMessage({ text: content })
  }

  const hasMessages = messages.length > 0

  return (
    <div className="flex flex-col h-full">
      {hasMessages ? (
        <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-hide py-4">
          <div className="flex flex-col gap-3">
            {messages.map((msg) => {
              const text = getMessageText(msg)
              if (!text) return null
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChatBubble
                    role={msg.role as 'user' | 'assistant'}
                    content={text}
                  />
                </motion.div>
              )
            })}
            {isLoading && <TypingIndicator />}
          </div>
        </div>
      ) : (
        <CarveEmptyState
          onChipClick={handleSend}
          subtitle={config.subtitle}
          statusPills={config.statusPills}
          suggestionChips={config.suggestionChips}
        />
      )}

      {hasMessages && (
        <SuggestionChips chips={config.suggestionChips} onChipClick={handleSend} />
      )}

      <CarveInputBar onSend={handleSend} disabled={isLoading} />
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add components/dashboard/hub/chat/CarveChat.tsx
git rm components/dashboard/hub/chat/CoachChat.tsx
git commit -m "feat(carve-ai): refactor CoachChat → CarveChat with real AI streaming"
```

---

### Task 8: Update DashboardHub imports

**Files:**
- Modify: `components/dashboard/hub/DashboardHub.tsx`

**Step 1: Update imports**

Change:
```typescript
import { CoachChat } from './chat/CoachChat'
```
To:
```typescript
import { CarveChat } from './chat/CarveChat'
```

And update the JSX:
```typescript
<CarveChat config={config} />
```

Also update the comment from `{/* AI Coach Chat */}` to `{/* Carve AI */}`.

**Step 2: Commit**

```bash
git add components/dashboard/hub/DashboardHub.tsx
git commit -m "refactor(carve-ai): update DashboardHub to use CarveChat"
```

---

### Task 9: Update trip-detail-client to use Carve AI

**Files:**
- Modify: `app/(protected)/dashboard/travel/[id]/trip-detail-client.tsx`

**Step 1: Replace TravelChat import with CarveChat or inline useChat**

Since the trip detail page uses TravelChat with `tripId` and `onPlanGenerated` props, and our new CarveChat doesn't have those — the simplest approach is to use `useChat` directly inline here with the Carve AI route, passing the tripId and using `onToolCall` for plan generation. This keeps the trip detail page self-contained.

Replace:
```typescript
import { TravelChat } from "@/components/travel/chat/TravelChat"
```

With inline `useChat` usage pointing to `/api/carve-ai/chat`:

```typescript
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
```

In the component, replace the `<TravelChat>` JSX with a minimal inline chat panel using `useChat`:
```typescript
const replanTransport = useMemo(
  () => new DefaultChatTransport({ api: '/api/carve-ai/chat', body: { tripId: props.trip.id } }),
  [props.trip.id]
)

const { messages: chatMessages, sendMessage, status: chatStatus } = useChat({
  transport: replanTransport,
  onToolCall({ toolCall }: any) {
    if (toolCall.toolName === 'generate_trip_plan') {
      setPlan(toolCall.args as TripPlan)
    }
  },
})
```

Replace the `<TravelChat>` block with a simple chat UI using ChatBubble and CarveInputBar from the hub components.

**Step 2: Commit**

```bash
git add app/(protected)/dashboard/travel/[id]/trip-detail-client.tsx
git commit -m "refactor(carve-ai): use Carve AI in trip detail replanning"
```

---

### Task 10: Remove old travel chat files and update travel/new page

**Files:**
- Delete: `components/travel/chat/TravelChat.tsx`
- Delete: `components/travel/chat/ChatMessage.tsx`
- Delete: `components/travel/chat/ChatInput.tsx`
- Delete: `app/api/travel/chat/route.ts`
- Modify: `app/(protected)/dashboard/travel/new/page.tsx` — redirect to dashboard or use CarveChat

**Step 1: Update travel/new page**

Since Carve AI replaces the travel/new flow, update this page to use CarveChat instead of TravelChat:

```typescript
"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { CarveChat } from "@/components/dashboard/hub/chat/CarveChat"
import { PlanDashboard } from "@/components/travel/plan/PlanDashboard"
import { travelConfig } from "@/components/dashboard/hub/mock-data"
import type { TripPlan } from "@/lib/ai/travel-schemas"

export default function NewTripPage() {
  const [plan, setPlan] = useState<TripPlan | null>(null)
  const [chatCollapsed, setChatCollapsed] = useState(false)

  return (
    <div className="h-full flex">
      <motion.div
        animate={{ width: chatCollapsed ? 0 : 400 }}
        transition={{ duration: 0.3 }}
        className="shrink-0 border-r border-white/[0.06] overflow-hidden bg-[#0c0e14]"
      >
        <div className="w-[400px] h-full">
          <CarveChat config={travelConfig} />
        </div>
      </motion.div>

      <button
        onClick={() => setChatCollapsed(!chatCollapsed)}
        className="shrink-0 w-6 flex items-center justify-center hover:bg-white/[0.04] transition-colors border-r border-white/[0.06]"
      >
        <svg
          className="w-3 h-3 text-[#555d70]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          style={{ transform: chatCollapsed ? "rotate(180deg)" : "none" }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <div className="flex-1 min-w-0">
        {plan ? (
          <PlanDashboard plan={plan} />
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <p className="text-[#555d70] text-sm">
                Your trip plan will appear here
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
```

**Step 2: Delete old travel chat files**

```bash
git rm components/travel/chat/TravelChat.tsx
git rm components/travel/chat/ChatMessage.tsx
git rm components/travel/chat/ChatInput.tsx
git rm app/api/travel/chat/route.ts
```

**Step 3: Commit**

```bash
git add app/(protected)/dashboard/travel/new/page.tsx
git commit -m "refactor(carve-ai): replace TravelChat with CarveChat, remove old travel chat files"
```

---

### Task 11: Remove old travel prompts file

**Files:**
- Delete: `lib/ai/travel-prompts.ts`

The travel-specific prompts are now absorbed into `CARVE_AI_SYSTEM_PROMPT` and `CARVE_AI_REPLAN_PROMPT` in `lib/ai/carve-ai-prompts.ts`.

Note: Keep `lib/ai/travel-schemas.ts`, `lib/ai/save-trip-plan.ts`, and `lib/ai/rate-limit.ts` — they're still used.

**Step 1: Delete and commit**

```bash
git rm lib/ai/travel-prompts.ts
git commit -m "chore(carve-ai): remove old travel-prompts.ts (absorbed into carve-ai-prompts)"
```

---

### Task 12: Verify build

**Step 1: Run TypeScript check**

```bash
npx tsc --noEmit
```

Expected: No errors. Fix any import issues if found.

**Step 2: Run dev server and test**

```bash
npm run dev
```

- Navigate to `/dashboard` — Carve AI chat should load with health suggestion chips
- Type a message — should stream a real AI response
- Switch domain tabs — suggestion chips should change
- Navigate to `/dashboard/travel/new` — CarveChat with travel config should work

**Step 3: Commit any fixes**

```bash
git commit -m "fix(carve-ai): resolve build issues"
```
