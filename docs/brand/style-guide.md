# Carve - Style Guide

> Source of truth for exact token values: `Carve AI/App/Design/Tokens/`
> Reference for dark premium card styling: `WelcomeContent.swift` rankLadderCard
> Always check existing views for reference before building new ones.

---

## Brand DNA

- **Premium means less, not more** - restraint is the flex
- **Data is the visual** - real numbers are more compelling than illustrations
- **Dark-first, always** - the entire app lives in a dark environment
- **Monochrome + accent** - white text hierarchy on black, gold for ranking elements only
- **Gamify the system, not the language** - UI mechanics feel game-like, copy is smart and factual
- **If it could be on any other fitness app, it's too generic for Carve**

---

## Visual Identity

### Color Philosophy

The app uses a **two-layer token system** (`ColorPrimitives` + `ColorSemantics`). Use semantic tokens via `@Environment(\.carveTheme)` with `.dark` theme injection at the tab level.

**The entire app is dark.** Near-black background, glass-morphism cards, white text at varying opacities. There is no separate light mode for the main app experience. Onboarding and in-app share the same dark premium aesthetic.

**Text opacity hierarchy:**
- Primary content: high opacity white (~90%)
- Secondary/supporting: medium opacity (~40%)
- Labels and headers: low opacity (~25%)
- Stats and numbers: slightly brighter (~85%) with `.rounded` font design

**Accent colors:**
- Gold for ranking, progression, and achievement highlights
- Green for completion and success states
- Orange for warnings and claimable rewards
- Feedback colors stay consistent: green success, orange warning, red error, blue info

### Typography

SF Pro throughout. Bold weights for hierarchy, `.rounded` design variant for numbers and stats.

**Hierarchy:**
- Screen/section titles: small, uppercase, letter-tracked (1.5), very low opacity. Think engraved labels, not headlines.
- Hero numbers (LVL, rank): large, bold, `.rounded` design, high contrast white
- Body text: medium weight, readable opacity
- Supporting labels: small, medium weight, low opacity

The logo "CARVE" uses extra-black weight with wide letter tracking.

### Card Headers (The Premium Pattern)

Every card header follows the same pattern: small icon + uppercase tracked label. This is the signature of the dark premium style. Never use large bold titles on card headers - that feels like a light-mode app. The content inside the card speaks for itself.

### Spacing

Generous whitespace is non-negotiable. Content always has consistent horizontal margins. Cards have internal padding (16pt). Sections breathe with vertical gaps (12pt between cards). Touch targets never go below 44pt.

### Corner Radius

Moderate rounding (16pt for cards, 14pt for compact elements) with `.continuous` corner style. Pills/capsules use full rounding.

### Shadows & Borders

Cards use **borders, not shadows.** A thin white opacity border (~7%) defines card edges on the dark background. Shadows are reserved only for the floating tab bar. The glass-morphism card style (very low white opacity fill + thin border) is the standard for all cards.

---

## Component Patterns

### Cards

**Glass card (standard for all cards):** Very low white opacity fill (~4%) with thin white opacity border (~7%). This is the only card style used in the app. All content cards, from habits to leaderboard to diary entries, use this treatment.

**Compact button card:** Same glass treatment but smaller, used for secondary actions (like "3 Challenges" navigation). Contains icon + label + chevron.

**Dark hero card:** Near-black solid background. Reserved for the single most important actionable element on a screen (e.g., workout start card). One per screen maximum.

### Card Content Layout

- Header: icon + uppercase tracked label (low opacity)
- Thin divider separating sections within a card
- Stat rows: centered columns with vertical separators between them
- Progress: thin capsule bars (4pt height)
- Actions: minimal, text-only or icon-only, no heavy button styling inside cards

### Buttons

**Primary:** Full-width, solid white background, black text. 54pt height, 14pt corner radius.
**Secondary/Outlined:** Transparent background with thin white border.
**In-card action:** Minimal - just an icon or text link, very low opacity. No button chrome.
**Disabled:** Reduced opacity on both background and text. Never fully invisible.

### Input Fields

Low white opacity background fill with a subtle border. Border brightens on focus. Error state shows red border. Password fields include a visibility toggle.

### Status Indicators

- Completed items: dimmed text + green checkmark
- Active/current items: full opacity + accent highlight
- Locked/future items: very low opacity, stroke-only indicators
- Claimable rewards: small orange dot

### Dividers

Thin, barely visible. White at very low opacity (~6%). Inset from leading edge to align with content, not icons.

---

## Motion & Animation

### Philosophy

Animation serves **clarity**, not decoration. Every animation answers: "What just happened?" If it doesn't help the user understand a state change, it shouldn't exist.

The app should feel responsive and snappy. Only first-impression moments earn slower timing.

### Three Speed Tiers

**Instant (~0.2s)** - User-initiated state changes. Toggles, button presses, tab switches. Use `easeInOut`.

**Brisk (~0.3-0.5s)** - Navigation and content changes. Screen transitions, sheet presentations. Use `spring` with ~0.85 damping or `easeOut`.

**Cinematic (~0.6-1.5s)** - First impressions only. Welcome screen, onboarding reveals. Staggered delays. Use `easeOut`.

### When to Animate

- Screen entrances (staggered reveal, top to bottom)
- Navigation transitions (opacity crossfade, not slide)
- Selection state changes
- Content appearing/disappearing (fade + slight movement)
- Number changes (`.numericText()` content transition)

### When NOT to Animate

- Scrolling content
- Typing in text fields
- Data loading into existing layouts
- Repeated rapid interactions
- Anything that makes the user wait

### Haptic Feedback

- **Light impact:** Standard taps - selecting, toggling, navigating
- **Medium impact:** Meaningful completions - finishing a step, achieving something
- **Never:** Passive events like data loading, auto-scrolling

### Staggered Entrances

Elements reveal in reading order with increasing delay. Structural elements first, then content, then actions last.

Uses `View.staggeredEntrance(index:)` modifier. Background must already be in place before elements animate in.

### Transitions Between Screens

Use `.opacity` transitions, not slides. Background stays static during transitions - only content fades. All tabs share the same dark background, so tab switching should feel seamless with no color flash.

---

## UX Principles

### Progressive Disclosure

- Onboarding collects info one step at a time, never a long form
- Dashboard cards unlock progressively as the user logs more data
- Advanced options are hidden until needed
- Secondary content (challenges, detailed stats) accessible via compact navigation rows, not shown inline

### Feedback Loops

The user should never wonder "did that work?"

- **Immediate:** Haptic + visual state change on every tap
- **Confirmation:** Success indicators for async operations
- **Error:** Inline near the source, not generic alerts
- **Progress:** Show position in multi-step flows

### Loading States

- Inline spinners for small async checks
- Skeleton screens for content-heavy views
- Never block the entire screen with a full-screen spinner
- The user should always be able to go back during loading

### Empty States

Empty states are an opportunity, not a dead end.

- Explain what will appear and how to get started
- Use the brand voice - factual, not cheerful
- Include a clear action ("Log your first workout")
- No sad illustrations or emoji

### Error Handling

- Inline near the source of the problem
- Error banners for form-wide issues
- Never use iOS system alerts for expected errors
- Error messages are specific: "Email already in use" not "Something went wrong"

### Form Patterns

- One primary input per screen in onboarding
- Auto-focus after entrance animation completes
- Validate inline as the user types (debounced)
- Continue button visible but disabled until valid
- Keyboard-aware layouts

### Navigation

- Back is always available and always works
- Skip for optional steps - top-right, subtle
- CTA always at the bottom, full-width, fixed position
- Never trap the user in a flow without an exit

---

## App Structure

### One Visual Context: Dark Premium

The entire app shares a single dark aesthetic. Onboarding, dashboard, diary, workout, profile - all dark background, all glass-morphism cards, all white text at varying opacities.

This creates:
- Zero visual disconnect between onboarding and the app
- Seamless tab switching with no color flash
- A consistent premium feel throughout
- Clear brand identity that stands out from light-mode fitness apps

### Dashboard

The dashboard is the home screen. Its job is to answer two questions:
1. **What should I do today?** (habits, next action)
2. **How am I doing?** (level, XP, streaks)

Components: hero section (season label, level, XP, progress bar), habit checklist (daily routine), ranking card (leaderboard position with stats), compact challenge navigation, social activity.

The dashboard design follows the scoreboard principle: information at a glance, actions one tap away.

### Floating Tab Bar

Dark solid pill shape at the bottom. Center FAB (black circle with plus) for quick-add. White filled icons when selected, gray when not. The tab bar color is slightly lighter than the background for subtle separation.

### Header Bar

Fixed top bar with three columns: left action (hamburger), center content (date capsule), right action (social). Always white icons and text against the dark background. No scroll-based color transitions.

### Side Panels

Hamburger menu from left, social panel from right. Push main content with spring animation. Utility drawers, not primary navigation.

---

## Data Display

### Numbers & Stats

Numbers are the hero of Carve. Prominent, easy to scan, `.rounded` font variant. Large stats get bold rounded typography with high white opacity. Supporting labels: small, medium weight, low opacity, positioned below the number.

Stat groups use vertical separator lines between columns (very low opacity, 1pt wide).

### Progress Indicators

**Linear bars:** Capsule-shaped, thin (4pt). White fill on very low opacity track. Used for XP, habit completion, recovery. Green when complete.
**Completion:** Show as fraction ("3/5"), never decimal. Pair with a mini progress bar.

### Timeline & Lists

Diary uses time-of-day grouping (Breakfast, Lunch, Dinner, Snacks). Lists follow the dark card conventions: glass background, subtle dividers between rows, icons in low-opacity circle containers.

---

## Gamification

Gamification is in the UI mechanics, not the language.

### Levels & XP

Thin progress bar toward next level. Level displayed as "LVL X" in large bold rounded type. XP count shown subtly alongside. Always visible but ambient - never screaming for attention.

### Seasons & Tiers

Monthly cycles. Season label is uppercase, tracked, low opacity - same style as card headers. Tiers color-coded as small badges on profile.

### Streaks

Small flame icon + number. "7 days" not "Amazing 7-day streak!"

### Daily Habits (The Grind)

Habits appear as a glass card checklist. Clean rows: icon circle, habit name, checkbox. No emoji indicators or extra decorations. Completing a habit triggers ring-fill animation + haptic. Completing all habits unlocks a chest reward.

**Key principle:** Gamification creates desire to return daily. Scoreboard, not carnival.

---

## Workout Patterns

**Split chips:** Horizontally scrolling. Filled when selected, transparent when not. Recovery bar underneath.
**Recovery status:** Green (recovered), orange (moderate), gray (no data).
**Exercise rows:** Name, sets x reps, weight. Grouped by muscle group.
**The workout start card is the one dark hero card** - near-black solid, highest visual priority.

---

## Sheet & Modal Patterns

Sheets use `.presentationDetents` with medium and large sizes. Dark background matching the app. Header + scrollable content + optional sticky footer.

Full-screen covers reserved for: active workout tracking, onboarding, camera/scanner views.

**Quick-add input:** Pill-shaped text field with AI icon, rotating placeholder suggestions, send button. Type "2 eggs with toast" and it works.

---

## Voice in UI

- No cheerleader language ("Great job!", "You're amazing!")
- No RPG/fantasy language ("Enter the arena!")
- No generic motivational fluff ("Your journey starts here")
- Let data motivate: ranks, percentiles, streaks, climb indicators
- Short, factual, confident - like a teammate who's one step ahead

---

## Benchmarks

Design decisions get compared against: **WHOOP**, **Strava**, **Nike Training**, **Apple Fitness+**.

If a design element could exist on any of these apps unchanged, it's not distinctive enough for Carve.
