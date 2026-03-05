# Brand Story Update — Design

## Overview

Update the three most visible marketing sections to shift brand positioning from "gamified fitness tracker" to "AI life coach that grew from a personal transformation story." Carve AI becomes the core proposition; fitness is the origin story; gamification is the mechanism.

## Brand Narrative Shift

**Before:** "Track Everything. Level Up. Win." — fitness gamification app
**After:** "One AI. Your whole life." — AI life coach for health, money, travel

The founder's 4-year, 50kg transformation is the proof. The tone is minimal and direct — no victim narrative, no "I tried every app." Just facts, forward motion, and ambition. Carve AI is the product.

## Sections to Update

### 1. Hero Section (`components/landing/HeroSection.tsx`)

**Current:**
- Headline: "Track Everything. Level Up. Win."
- Sub: "The fitness app that gamifies your progress. Track PRs, earn XP, compete with friends."

**New:**
- Headline: "One AI. Your whole life."
- Sub: "Carve AI coaches you on fitness, finances, and travel — because life isn't just one thing."
- CTA: Keep "Get Started — It's Free"

### 2. Founder Story (`components/carve/FounderStory.tsx`)

**Current:**
- Visual: "130kg → 80kg"
- Story about trying every app, building it himself
- Stats: 50kg lost, 900+ commits, 1 developer

**New:**
- Visual: "130kg → 80kg" (keep, large and central)
- Add: Two animated progress bars next to the weight visual
  - Fat percentage going down (e.g., 38% → 15%)
  - Muscle percentage going up (e.g., 28% → 42%)
  - Animated on scroll into view
- Story copy (minimal, #2 style):
  "130kg → 80kg. 4 years. Built the app that got me there. Now it does more than fitness. So do I."
- Stats: 50kg lost · 4 years · 1 developer

### 3. AI Chat Demo (`components/carve/AIChatDemo.tsx`)

**Current:**
- Headline: "A coach that knows you."
- Sub: "Not a generic answer. A coach that knows what you trained this morning, what your budget is, and where your next trip goes."

**New:**
- Headline: "A coach that actually knows you."
- Sub: "Not a chatbot with canned answers. An AI that sees your workouts, your spending, and your plans — and connects the dots."
- Chat examples per tab: keep as-is (already good)

## Out of Scope

- Footer tagline update (later)
- Feature section updates (later)
- SEO metadata (later)
- /carve page copy (later)
- HowItWorks section (later)
