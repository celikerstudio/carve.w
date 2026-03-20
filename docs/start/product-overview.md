# Carve — Product Overview

## What is Carve

One AI that knows your entire life — health, money, travel — and connects the dots you miss.

Not a chatbot. A personal operating system with an AI coach at its core.

## The Ecosystem

| Platform | Role | Status |
|----------|------|--------|
| **iOS App** (`carve-ai`) | Primary product. Real data, real users. | Production — health domain fully built |
| **Web App** (`carve-wiki`) | Command center. Chat-first with contextual cards. | Active development — premium UI, shared backend |
| **Supabase** | Shared backend. Auth, data, edge functions, AI. | Production — shared between iOS and web |

## Core Thesis

Existing apps silo your life. MyFitnessPal knows your food but not your budget. YNAB knows your money but not that you're spending €200/month on takeout because your meal prep collapsed. Carve's AI sees all domains and connects patterns across them.

## Domains

| Domain | iOS Status | Web Status |
|--------|-----------|------------|
| **Health** | Full: workouts, food logging, HealthKit steps, coach with memory | Cards with real Supabase data, AI via edge function |
| **Money** | Feature-flagged, architecture ready | Interactive mock cards (subscriptions, budget, transactions) |
| **Life/Travel** | Feature-flagged, architecture ready | Mock cards (trip, upcoming, stats) |
| **Inbox** | Feature-flagged, architecture ready | Hidden for now, re-enable later |

## AI Architecture

Both platforms share the same Supabase edge function (`coach-chat`):
- **Model**: GPT-5 (pro) / GPT-4o-mini (free) — selected by subscription tier
- **Memory**: 50 persistent facts per user, categorized
- **Personality**: Direct, opinionated, Dutch language, adjustable intensity
- **Tools**: Week analysis, workout review, nutrition check, progress prediction, month report
- **Quota**: 10 free messages/day + bonus credits for premium tools

## Revenue Model

- **Free tier**: 10 AI messages/day, GPT-4o-mini, basic features
- **Pro tier**: Unlimited messages, GPT-5, premium tools
- **Bonus credits**: Premium tools cost 3-10 credits. Earned through engagement.
