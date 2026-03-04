# Dashboard Hub Design — AI Coach + Widgets

## Overview

Rebuild the dashboard page into an AI-first hub. The AI coach chat is the primary interaction point (70% width), with contextual data widgets in a right sidebar (30%). Modern Apple aesthetic with glass cards, gold accents, generous whitespace.

## Layout

- **Desktop (>1024px)**: 70/30 split — chat left, widget sidebar right
- **Tablet (768-1024px)**: Chat full width, widgets collapse to horizontal scroll row above chat
- **Mobile (<768px)**: Chat full width, widgets as collapsible section below

## AI Coach Chat (Left Panel)

### Empty State
- Coach avatar (glass circle with brain icon) centered
- Welcome text: "Hey [name], I'm your Carve coach"
- Status pills: live data snippets in glass pills (streak, workouts, level)
- Suggestion chips in 2-column grid with gold icon + label:
  - "What's my progress?"
  - "Plan my workout"
  - "How's my budget?"
  - "Analyze my week"

### Chat State
- **Coach bubbles** (left-aligned): glass card bg-[#1c1f27], border-white/[0.06], rounded-2xl, avatar beside
- **User bubbles** (right-aligned): gold-tinted bg-[#c8b86e]/8, border-[#c8b86e], rounded-2xl
- **Suggestion chips**: horizontal scroll above input
- **Input bar**: glass card, gold border on focus, gold send button

## Widget Sidebar (Right Panel)

All widgets: bg-[#1c1f27], border-white/[0.06], rounded-xl, p-4, stacked with gap-3.

### Widget 1: XP / Rank
- Rank name bold (e.g. "Intermediate")
- XP progress bar: gold fill, track bg-white/5
- XP count label
- Streak badge

### Widget 2: Today Overview
- 3 compact rows: workouts this week, steps, calories with progress

### Widget 3: Money Snapshot
- Monthly budget mini-bar with remaining amount
- Top 2 recent expenses

### Widget 4: Challenges
- 2-3 active challenges with mini progress indicators
- Daily/weekly timeframes

### Widget 5: Leaderboard
- Top 3 friends + your position
- Gold highlight for #1
- Your row always visible

## Design Tokens

| Element | Value |
|---------|-------|
| Page bg | #111318 |
| Card bg | #1c1f27 |
| Card border | border-white/[0.06] |
| Gold accent | #c8b86e |
| User bubble bg | bg-[#c8b86e]/8 |
| User bubble border | border-[#c8b86e] |
| Text primary | white |
| Text secondary | #9da6b9 |
| Text muted | #7a8299 |
| Success | emerald-400 |
| Card radius | rounded-xl |
| Bubble radius | rounded-2xl |

## Mock Data Approach

All data hardcoded in components. No API calls, no Supabase. Pure visual:
- Mock chat messages array
- Mock user stats object
- Mock transactions array
- Mock challenges array
- Mock leaderboard array
