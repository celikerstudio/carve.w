# Carve AI Chat — Design

## Overview

Replace the mock Coach Chat with a real AI-powered unified chat called "Carve AI". Uses Claude API via AI SDK with streaming responses. One chat that handles all domains (health, money, travel), with domain tabs that only change suggestion chips and status pills in the empty state.

## Architecture

### Unified Chat Engine
- `useChat` hook from `@ai-sdk/react` replaces mock `setTimeout` replies
- Single API route `/api/carve-ai/chat` with streaming
- One system prompt: "Carve AI" — personal coach for health, money, travel
- Tool: `generate_trip_plan` (existing). Extensible for future health/money tools

### Domain Tabs (UI only)
- Health / Money / Travel tabs change suggestion chips + status pills in empty state
- Once conversation starts, tabs are irrelevant — AI is unified
- Tab selection can hint domain context to the AI via the first message

### Persistence
- Conversations saved to Supabase `conversations` table
- Each conversation has a user_id and messages array
- Chat history can be retrieved for returning users

## Component Changes

### Renames
- `CoachChat.tsx` → `CarveChat.tsx` — replace mock with `useChat` hook
- `CoachInputBar.tsx` → `CarveInputBar.tsx`
- `CoachEmptyState.tsx` → `CarveEmptyState.tsx`
- `ChatBubble.tsx` — keep, update role from 'coach' to 'assistant'
- `SuggestionChips.tsx` — keep as-is
- `DashboardHub.tsx` — update imports, rename references

### mock-data.ts
- Keep `SectionConfig`, suggestion chips, status pills (used for empty state UI)
- Remove `coachReplies` (no longer needed — real AI handles responses)
- Remove `ChatMessage` type (replaced by AI SDK message type)

## API Route: `/api/carve-ai/chat/route.ts`

Based on existing `/api/travel/chat/route.ts`:
- Auth via Supabase
- Rate limiting (reuse `checkRateLimit`)
- Unified system prompt (new `CARVE_AI_SYSTEM_PROMPT`)
- `generate_trip_plan` tool available
- `streamText` → `toUIMessageStreamResponse()`
- Save conversation to Supabase after completion

## System Prompt

Single "Carve AI" prompt covering:
- Personal coach persona (friendly, knowledgeable, concise)
- Health coaching (general advice, fitness, nutrition)
- Money coaching (budgeting, spending analysis, savings tips)
- Travel planning (with `generate_trip_plan` tool when enough info gathered)
- Responds in user's language
- No fake data — honest about what it can/can't access

## Cleanup

- Remove `/api/travel/chat/route.ts` (replaced by unified route)
- Remove `components/travel/chat/` (TravelChat, ChatMessage, ChatInput)
- Remove travel chat references from travel pages
- Update travel/[id] trip detail to use Carve AI for replanning
