# Carve — Product Overview

## What is Carve

One AI that knows your entire life — health, money, travel, inbox — and connects the dots you miss.

Not a chatbot. A personal operating system with an AI coach at its core.

## The Ecosystem

| Platform | Role | Status |
|----------|------|--------|
| **iOS App** (`carve-ai`) | Primary product. Real data, real users. | Production — health domain fully built |
| **Web App** (`carve-wiki`) | Companion platform. Chat-first layout + wiki. | Early — chat shell with mock data |
| **Supabase** | Shared backend. Auth, data, edge functions. | Production — shared between iOS and web |

## Core Thesis

Existing apps silo your life. MyFitnessPal knows your food but not your budget. YNAB knows your money but not that you're spending €200/month on takeout because your meal prep collapsed. Carve's AI sees all domains and connects patterns across them.

## Domains

| Domain | iOS Status | Web Status |
|--------|-----------|------------|
| **Health** | Full: workouts, food logging (FatSecret + photo), HealthKit steps, coach with memory | Chat works, context panel is mock data |
| **Money** | Feature-flagged, architecture ready | Mock context panel only |
| **Life/Travel** | Feature-flagged, architecture ready | Mock context panel only |
| **Inbox** | Feature-flagged, architecture ready | Mock context panel only |

## Competitive Position

| | Generic Fitness Apps | ChatGPT | Carve |
|---|---|---|---|
| Real data integration | Yes (siloed) | No | Yes (cross-domain) |
| AI coach with memory | No | Partial (no structured memory) | Yes (50 facts, categorized, persistent) |
| Gamification tied to behavior | XP/badges (cosmetic) | No | Carve Score (designed, not yet active) |
| Multi-domain intelligence | No | Yes (but no data) | Yes (with real data) |

## Revenue Model

- **Free tier**: 10 AI messages/day, basic features
- **Pro tier**: Unlimited messages, GPT-4o (vs 4o-mini), premium tools (week analysis, progress prediction, month report)
- **Bonus credits**: Premium tools cost 3-10 credits. Earned through engagement.
