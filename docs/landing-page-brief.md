# Carve — Landing Page Design Brief

> A comprehensive prompt for designing and building the marketing landing page at `carve.wiki/`

---

## 1. Product Overview

Carve is a ChatGPT-style AI chat interface that manages your entire life. It is not a generic chatbot — it is connected to YOUR real data across four domains:

- **Health** — workouts, nutrition, calories, steps, body stats (synced from iOS app)
- **Money** — budget, transactions, subscriptions, bills, savings goals
- **Life** — trips, appointments, calendar, planning, deadlines
- **Inbox** — email processing where AI categorizes, routes, and handles emails automatically

The tagline: **"ChatGPT knows everything. Carve knows YOU."**

### Interface Architecture (three-panel layout)
- **Left sidebar:** Chat history + 4 "Apps" (Health / Money / Life / Inbox) — similar to how ChatGPT has GPTs, but these are connected to your actual life data
- **Center:** AI chat — the primary interaction surface. You talk to Carve like you'd talk to a personal assistant who has context on everything
- **Right panel:** Contextual data that changes per app:
  - **Home** → RPG character sheet: Level, XP bar, stats (Body / Wealth / Mind / Discipline), current objectives with XP rewards, leaderboard rank
  - **Health** → Today's workout, weekly overview, steps/calories/protein/water targets, active challenges
  - **Money** → Monthly budget with progress bar, recent transactions, active subscriptions, open bills
  - **Life** → Next trip details, upcoming appointments/deadlines, travel stats
  - **Inbox** → Emails needing attention (with AI annotation like "route to Money?"), auto-handled count, inbox stats

### Key Product Behaviors
- Your emails become actions: invoice received → logged in budget. Flight confirmation → added to trip. Newsletter → auto-archived.
- Cross-domain intelligence: "Your groceries are 20% up this month, and you have a €847 bill due Friday. Want me to adjust your budget?"
- Gamification: Level up your real life. XP for completing workouts, staying under budget, clearing your inbox. Stats that reflect your actual habits. A leaderboard to compete with friends.

---

## 2. Target Audience

Young professionals, 22-35. The kind of person who:
- Already uses ChatGPT or Claude daily
- Tracks workouts (or wants to start)
- Cares about their finances but doesn't want to stare at spreadsheets
- Travels 2-5 times per year
- Has an overflowing inbox they wish someone would just handle
- Wants optimization without the spreadsheet-bro energy
- Is NOT a developer — normal, design-conscious people

They're already convinced that AI is useful. The pitch isn't "AI is cool." The pitch is: "Your AI should know you, not just the internet."

---

## 3. Design Direction

### Philosophy
Think: **what if Apple made a personal AI life coach.** Restraint over decoration. Confidence over flashiness. Every pixel intentional.

### Specifics
- **Dark mode only.** Background: `#0A0A0B` (near-black). No light mode on the landing page.
- **White as the accent color.** White text, white borders, white CTAs. No amber, no gold, no rainbow gradients. The product itself uses subtle color per domain (green for health, blue for money, purple for life, amber for inbox) — the landing page should hint at these but never let them dominate.
- **Typography-driven.** Large, confident headlines. Generous whitespace. Let the words breathe.
- **Font:** SF Pro / system font stack (`-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', system-ui, sans-serif`). No custom decorative fonts.
- **Borders:** Ultra-subtle. `border-white/[0.06]` to `border-white/[0.08]`. Cards use `bg-white/[0.03]` to `bg-white/[0.04]`. No heavy boxes, no drop shadows, no glows.
- **Motion:** Framer Motion. Scroll-triggered reveals (`fade-up`, stagger children). Subtle, purposeful — elements arrive once as you scroll, they don't dance. No parallax, no floating elements, no particle effects.
- **Spacing:** Sections use `py-24 md:py-32`. Generous — each section feels like its own moment. Content maxes out at `max-w-5xl` (occasional `max-w-6xl` for the hero).
- **Icons:** Lucide React. Thin, geometric, 1.5px stroke. Sized at `w-4 h-4` to `w-5 h-5`. Never decorative — always functional.

### What to AVOID
- Startup-y cliches: no gradient mesh backgrounds, no "Built by [founders] with love", no testimonial carousels from people who don't exist
- Generic AI aesthetic: no neural network visuals, no glowing brains, no "powered by AI" badges
- Childish gamification visuals: the RPG/leveling system is real and mature — no cartoon characters, no pixel art, no 8-bit fonts
- Color overload: the product has color per domain, but the landing page should be restrained. White + near-black + subtle hints.
- Cluttered sections: one idea per viewport. If you need a scroll to see the next thought, that's fine.

---

## 4. Copy Tone

**Confident. Direct. Slightly provocative. Not corporate. Not friendly-corporate.**

Think Apple keynote energy meets indie hacker who actually ships. Short sentences. Active voice. No filler words.

### Examples of the tone:
- "Your AI doesn't know you. Ours does." (not "We leverage advanced AI to personalize your experience")
- "One chat. Four domains. Your entire life." (not "An integrated platform for holistic personal management")
- "Emails become actions. Not just notifications." (not "Our AI-powered email processing engine automatically categorizes and routes incoming messages")
- "Level 23. Body: 75. Wealth: 38. You're not a user — you're a character." (not "Gamification elements make self-improvement fun and engaging")

### Rules:
- Headlines: max 6-8 words. Punchy. Often a statement, not a question.
- Body text: `text-white/40` to `text-white/50`. Short paragraphs. 2-3 sentences max per block.
- No exclamation marks. Confidence doesn't shout.
- Technical accuracy matters — the product descriptions should feel precise, not vague.
- English copy (the product is English-first, audience is international).

---

## 5. Page Structure — Section by Section

### 5.1 Navigation (sticky)
Minimal top bar. `CARVE` logo (tracked letters, `tracking-[0.3em]`, bold, white) on the left. Two links on the right: `Sign In` (text link, `text-white/50`) and `Get Started` (white pill button, `bg-white text-black rounded-xl`). Semi-transparent background on scroll (`bg-[#0A0A0B]/80 backdrop-blur-md`). No hamburger menu — on mobile, just logo + Get Started.

### 5.2 Hero Section
**Goal:** Immediately communicate what Carve is and create intrigue.

- Full viewport height (`min-h-[100dvh]`), centered content
- Headline: Large (`text-5xl md:text-7xl`), bold, white. Something like:
  - "ChatGPT knows everything. Carve knows you."
  - Or split into two lines: "Your AI knows the internet." / "This one knows you."
- Subheadline: `text-white/50`, lighter weight. One sentence: "One AI that manages your health, money, life, and inbox — because it's connected to all of them."
- Below: an interactive product screenshot/mockup showing the three-panel interface. This is the hero visual — not an illustration, not an abstract graphic. Show the actual product.
  - The mockup should show the chat interface with a realistic conversation, the sidebar with the 4 apps, and the right panel showing the character sheet (Home view)
  - Contained in a browser-chrome frame or a subtle rounded container with `border-white/[0.06]`
  - Optional: the mockup is slightly animated — a typing indicator appears, then an AI response fades in, showing Carve responding with cross-domain intelligence
- CTA below the mockup: `Get Started — It's Free` (primary, white button) + `Watch Demo` (secondary, ghost/outline button)
- Subtle scroll indicator at bottom (thin chevron or line, `text-white/20`, animated gentle bounce)

### 5.3 The Problem
**Goal:** Make the visitor feel the pain of fragmented tools.

- Section label: small caps, tracked, `text-white/20`: "THE PROBLEM"
- Headline: "Your life is split across 12 apps. None of them talk to each other."
- Visual: a grid or horizontal row of app category icons (fitness app, banking app, calendar, email, budget, etc.) in muted `white/[0.15]` — showing the fragmentation
- Body text (2-3 sentences): "Your gym app doesn't know about your budget. Your email doesn't update your calendar. Your budget tracker has never heard of your flight to Barcelona. Every app optimizes one thing. Nothing optimizes you."
- Transition line (slightly brighter, `text-white/70`): "Until now."

### 5.4 The Solution — "One AI. Your Whole Life."
**Goal:** Show how Carve unifies everything through chat.

- Headline: "One chat. Every domain."
- Show a live AI chat demo (similar to the existing `MarketingHero` component) that cycles through real conversations:
  1. **Health:** "What should I eat for dinner? I'm 40g short on protein." → AI responds with a meal suggestion using your logged food data
  2. **Money:** "How much did I spend on food this month?" → AI responds with actual budget breakdown
  3. **Life:** "When's my next trip?" → AI responds with Barcelona trip details from your calendar
  4. **Inbox:** "Anything important in my email today?" → AI responds with 2 items needing attention, 14 auto-handled
- The demo should show the right panel changing context as the conversation topic shifts — when talking about money, the budget panel appears; when talking about health, the workout panel appears
- Below the demo: four mini-cards in a row, one per domain, each with an icon, domain name, and a one-liner:
  - Health: "Workouts, meals, body stats — coached daily."
  - Money: "Budget, bills, subscriptions — managed automatically."
  - Life: "Trips, calendar, planning — organized by AI."
  - Inbox: "Email that handles itself. You approve, AI executes."

### 5.5 The Four Domains (expanded)
**Goal:** Deep-dive into each domain with concrete examples.

Four sections stacked vertically, each with:
- A domain-colored accent label (small, tracked, uppercase)
- A punchy headline
- A realistic screenshot/mockup of that domain's right panel
- 3-4 bullet points showing specific capabilities

**Health:**
- Label: `text-[#22c55e]` "HEALTH"
- Headline: "Your body, quantified. Your coach, always on."
- Bullets: AI workout suggestions based on your split/recovery | Meal scanning & macro tracking | Steps, calories, protein targets | Weekly performance analysis
- Show: the Health right panel with workout plan, weekly dots, daily targets

**Money:**
- Label: `text-[#3b82f6]` "MONEY"
- Headline: "See where it goes. Fix what doesn't work."
- Bullets: Automatic transaction categorization | Subscription audit ("3 streaming services, 1 unused") | Bill reminders with smart timing | Budget AI that adjusts with your spending
- Show: the Money right panel with budget bar, transactions, subscriptions

**Life:**
- Label: `text-[#a855f7]` "LIFE"
- Headline: "Trips planned. Calendar managed. Nothing forgotten."
- Bullets: AI trip planning with budget | Automatic flight/hotel confirmations from email | Appointment reminders with context | Cross-referencing deadlines across domains
- Show: the Life right panel with Barcelona trip, upcoming events

**Inbox:**
- Label: `text-[#f59e0b]` "INBOX"
- Headline: "Emails become actions. Not just notifications."
- Bullets: AI categorizes every email automatically | Invoices → budget, confirmations → calendar | Newsletters auto-archived, promotions dismissed | You handle 2 emails. AI handles 14.
- Show: the Inbox right panel with "Needs attention" and "Handled by AI" sections

### 5.6 Cross-Domain Intelligence
**Goal:** Show the unique power of having all data in one place.

- Headline: "The magic happens between domains."
- This is the "wow" section. Show 3-4 concrete cross-domain scenarios:
  1. Email → Money: "Coolblue invoice received → €847 added to open bills → budget adjusted → you're notified only once"
  2. Email → Life: "KLM flight confirmation → trip dates extracted → Barcelona added to calendar → packing list suggested"
  3. Health × Money: "Grocery spending up 20% this month. Eating out down 40%. Net savings: €120. Your diet change is actually saving money."
  4. Life × Health × Money: "Barcelona in 3 days. Here's your packing list, a local gym near your hotel, and a trip budget of €1,200 based on your usual spending patterns."
- Visual treatment: each scenario as a card with a subtle left border in the relevant domain color. Or a flow diagram showing data moving between domains.
- Closing line: "Other AI assistants answer questions. Carve connects the dots."

### 5.7 The Character Sheet (Gamification)
**Goal:** Present the RPG element maturely — this is real-life gamification, not a game.

- Headline: "You're not a user. You're a character."
- Subheadline: "Stats that reflect your actual habits. A level that means something."
- Show the character sheet (Home right panel) prominently:
  - Player name, level, rank
  - XP bar with progress
  - Four stats: Body / Wealth / Mind / Discipline — each with a progress bar
  - Current objectives with XP rewards
  - Leaderboard position
- Below, explain the system in 3 brief cards:
  1. **Stats** — "Body goes up when you train consistently. Wealth rises when you stay under budget. These aren't arbitrary numbers — they're computed from your real data."
  2. **Objectives** — "Daily and weekly challenges. Pay that bill: +120 XP. Complete leg day: +80 XP. Clear your inbox: +50 XP."
  3. **Leaderboard** — "Compete with friends or the world. Monthly seasons. Rankings based on XP earned, not hours spent."
- Tone: mature, confident. This is not Duolingo. This is an RPG layer on your actual life. The numbers mean something because the data is real.

### 5.8 What Makes Us Different
**Goal:** Position against ChatGPT and generic assistants.

- Headline: "Not another chatbot."
- Comparison layout (subtle, not a heavy table):

| | Generic AI (ChatGPT, etc.) | Carve |
|---|---|---|
| Knowledge | Knows the internet | Knows YOUR data |
| Health | "Here's a generic meal plan" | "You're 40g short on protein today. Here's what to eat based on what you like." |
| Money | "Here's how to budget" | "You spent €847 at Coolblue. Bill due Friday. Want me to adjust this month's budget?" |
| Email | Can't access your inbox | Already archived 14 emails. 2 need your attention. |
| Memory | Forgets between conversations | Remembers everything. Gets smarter over time. |

- Keep this clean and scannable. No heavy borders. Subtle row dividers. Generic AI column muted (`text-white/25`), Carve column brighter (`text-white/70`).

### 5.9 How It Works
**Goal:** Reduce friction. Show it's easy.

- Headline: "Set up in 2 minutes. Let it learn in 2 days."
- Three steps, horizontal on desktop, stacked on mobile:
  1. **Connect** — "Sign up and connect your data sources. Bank, email, health app. One-time setup."
  2. **Chat** — "Ask anything. Carve responds with your data as context. The more you use it, the smarter it gets."
  3. **Level Up** — "Complete objectives, hit targets, earn XP. Watch your stats grow as your life improves."
- Each step: a number (large, `text-white/10`), a short title, and one sentence of body text.

### 5.10 Social Proof / Waitlist
**Goal:** Build credibility and capture leads.

- If there are real users/testers, show 2-3 brief quotes. Real names, real photos if possible. No fake testimonials.
- If not ready for testimonials yet, use a waitlist approach:
  - Headline: "Built for people who take their life seriously."
  - Subheadline: "Join the waitlist. Be first in."
  - Email input + "Join Waitlist" button (white, same style as primary CTA)
  - Below: small counter ("1,247 people ahead of you" — or however many have signed up)
  - Optional: "Or try it now" link to `/chat` for immediate access if the product is live

### 5.11 Final CTA
**Goal:** Close with confidence.

- Full-width section, minimal
- Headline: large, centered. "Your AI. Your data. Your life."
- Two buttons: `Get Started — It's Free` (primary) + `Sign In` (secondary/ghost)
- Below: small text links: Privacy, Terms, carve.wiki/wiki
- No footer bloat. No social media icons. No "Made with love" energy.

---

## 6. Responsive Behavior

- **Desktop (1280px+):** Full three-column product mockups. Horizontal layouts for step-by-step and comparison sections.
- **Tablet (768-1279px):** Two-column where it makes sense, stacked otherwise. Product mockups scale down but remain visible.
- **Mobile (< 768px):** Single column. Product mockups shown as phone-frame screenshots instead of desktop frames. Headlines scale down (`text-3xl` instead of `text-5xl`). Sections get less vertical padding (`py-16` instead of `py-32`). All horizontal layouts become stacked.

---

## 7. Technical Specifications

- **Framework:** Next.js 15 (App Router) — this is what the product uses
- **Styling:** Tailwind CSS v4 with the existing design tokens defined in `globals.css`
- **Animation:** Framer Motion — `motion` components, `useInView` for scroll triggers, `AnimatePresence` for transitions
- **Components:** Use the existing `ScrollReveal` component for scroll-triggered animations
- **Images:** Product screenshots/mockups should be built with actual components where possible (the product itself is the visual, not static images). Where static images are needed, use Next.js `Image` component with WebP format.
- **Performance:** The page should score 95+ on Lighthouse. Lazy-load below-fold sections. Use `motion.div` with `once: true` for scroll animations so they don't re-trigger.

### Existing Design Tokens (from globals.css)
```
Background: #0A0A0B
Surface: #141415
Surface raised: #1a1a1b
Subtle: #262626
Ink (primary text): #fafafa
Ink secondary: #a3a3a3
Ink tertiary: #737373
Ink muted: #404040
Health accent: #22c55e (but existing marketing uses #D4A843 gold — discuss)
Money accent: #3b82f6
Travel/Life accent: #a855f7 (existing uses #F97316 orange on travel marketing)
Action blue: #3B82F6
```

### Existing Interaction Patterns
```
Card: rounded-2xl border border-white/[0.08] bg-white/[0.03]  (or bg-white/[0.04])
Hover: hover:bg-white/[0.05] transition-colors
Section label: text-[11px] font-semibold uppercase tracking-[0.2em] text-[color]/mb-3
Heading: text-3xl md:text-5xl font-bold text-white tracking-tight
Body: text-white/40 text-sm md:text-base leading-relaxed
Primary button: bg-white text-black rounded-xl font-semibold py-3.5 px-6 text-sm hover:bg-white/90
Ghost button: border border-white/[0.1] text-white/70 rounded-xl font-medium py-3.5 px-6 text-sm hover:bg-white/[0.04]
Divider: h-px bg-white/[0.04] or border-white/[0.06]
```

---

## 8. Key Visual: The Product Mockup

The hero section and several other sections need a realistic product mockup. This is how it should be constructed:

### Desktop Mockup (hero)
Three-panel layout in a browser-like frame:
- **Left (220px):** Dark sidebar with `CARVE` branding, chat history list (4-5 truncated titles), a divider, the 4 app icons (Health/Money/Life/Inbox) with labels and mini stats, and a user avatar at the bottom
- **Center (flexible):** A chat conversation showing 2-3 exchanges. The most recent message should demonstrate cross-domain intelligence, e.g.:
  - User: "What's my week looking like?"
  - AI: "You have a Push Day workout scheduled, €847 Coolblue bill due Friday, and Barcelona in 3 days. Your grocery budget is 62% spent. Want me to plan meals for the rest of the week to stay within budget?"
- **Right (280px):** The Home/character sheet panel. Player name, level 23, rank "Advanced", XP bar at 65%, four stat bars (Body: 75, Wealth: 38, Mind: 62, Discipline: 84), three objectives with XP values, leaderboard position "#2 worldwide"

### Mobile Mockup (used in domain sections)
A phone frame (rounded corners, notch) showing individual panels or chat conversations relevant to each domain section.

---

## 9. Content Priorities

In order of importance — if the page gets long, cut from the bottom:

1. Hero (headline + product mockup) — MUST HAVE
2. The four domains overview — MUST HAVE
3. Cross-domain intelligence examples — MUST HAVE (this is the USP)
4. Character sheet / gamification — SHOULD HAVE
5. "What makes us different" comparison — SHOULD HAVE
6. How it works — NICE TO HAVE
7. Social proof / waitlist CTA — NICE TO HAVE
8. The problem section — NICE TO HAVE (can be merged into hero subtext)

---

## 10. URLs and Links

- Landing page: `carve.wiki/` (this page)
- App (logged in): `carve.wiki/chat`
- Wiki: `carve.wiki/wiki`
- Sign up: `carve.wiki/signup` (or `/signup`)
- Sign in: `carve.wiki/login` (or `/login`)
- Privacy: `carve.wiki/privacy`
- Terms: `carve.wiki/terms`
- Existing marketing subpages (for reference, not linked from landing): `/carve/health`, `/carve/money`, `/carve/travel`, `/carve/vision`, `/carve/roadmap`

---

## 11. One-Sentence Brief

Design a dark, typography-driven, Apple-restrained landing page for Carve — an AI life coach that connects to your health, money, life, and inbox data — positioned as "ChatGPT knows everything, Carve knows YOU", with the product interface itself as the hero visual and a mature RPG character sheet as the gamification hook.
