# Design System Migration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Migrate carve-wiki to a consistent design system with semantic tokens, centralized motion config, animated primitives, and `motion/react` imports — modeled after the academie repo's approach.

**Architecture:** Foundation-first, then page-by-page migration. Semantic color tokens defined in `globals.css` (dark-first, wiki overrides to light). All animations use centralized spring/ease constants from `lib/motion-config.ts`. Two new animated primitives (`AnimatedList`, `AnimatedNumber`) added to `components/ui/`. Every file importing `framer-motion` switches to `motion/react`. Hardcoded hex/gray colors replaced with semantic tokens.

**Tech Stack:** Next.js App Router, Tailwind CSS v4, `motion/react` (bundled in framer-motion v12+), shadcn/ui

---

## Task 1: Create motion-config.ts

**Files:**
- Create: `lib/motion-config.ts`

**Step 1: Create the motion config file**

```ts
// @ai-why: Centralized animation constants for the entire app.
// Matches Apple HIG feel — snappy springs, subtle easing.
// All components import from here for consistency.

export const SPRING = { type: 'spring' as const, stiffness: 400, damping: 30 }
export const SPRING_GENTLE = { type: 'spring' as const, stiffness: 260, damping: 20 }
export const EASE = [0.25, 0.1, 0.25, 1] as const
export const STAGGER = 0.04 // 40ms per item
```

**Step 2: Commit**

```bash
git add lib/motion-config.ts
git commit -m "feat: add centralized motion config constants"
```

---

## Task 2: Add semantic design tokens to globals.css

**Files:**
- Modify: `app/globals.css`

**Step 1: Add semantic tokens to the `@theme` block**

Add these tokens alongside the existing shadcn tokens in the `@theme` block. These are the dark-first defaults (carve's primary theme):

```css
/* Semantic tokens — dark-first */
--color-ink: #fafafa;
--color-ink-secondary: #a3a3a3;
--color-ink-tertiary: #737373;
--color-ink-muted: #404040;
--color-surface: #141415;
--color-surface-raised: #1a1a1b;
--color-subtle: #262626;
--color-action: #3B82F6;
--color-action-hover: #2563EB;
--color-health: #D4A843;
--color-money: #3B82F6;
--color-travel: #F97316;
--color-wiki-accent: #10B981;
--color-success: #34C759;
--color-warning: #FF9500;
--color-danger: #FF3B30;

--shadow-card: 0 1px 3px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.08);
--shadow-card-hover: 0 2px 8px rgba(0,0,0,0.16), 0 8px 24px rgba(0,0,0,0.12);
```

**Step 2: Add wiki light-mode override class**

After the `@theme` blocks, add:

```css
.wiki-light {
  --color-ink: #1d1d1f;
  --color-ink-secondary: #86868b;
  --color-ink-tertiary: #aeaeb2;
  --color-ink-muted: #d1d1d6;
  --color-surface: #f5f5f7;
  --color-surface-raised: #ffffff;
  --color-subtle: #e5e5ea;

  --shadow-card: 0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03);
  --shadow-card-hover: 0 2px 8px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.05);
}
```

**Step 3: Commit**

```bash
git add app/globals.css
git commit -m "feat: add semantic design tokens (dark-first + wiki-light overrides)"
```

---

## Task 3: Create AnimatedList primitive

**Files:**
- Create: `components/ui/animated-list.tsx`

**Step 1: Create the component**

```tsx
'use client'

// @ai-why: Staggered fade-up entry for list items.
// Wraps each child in a motion.div with delay based on index.
// Respects prefers-reduced-motion — renders children directly when enabled.

import { Children, type ReactNode, useId } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { SPRING_GENTLE, STAGGER } from '@/lib/motion-config'

interface AnimatedListProps {
  children: ReactNode
  staggerDelay?: number
  className?: string
}

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0 },
}

export function AnimatedList({ children, staggerDelay = STAGGER, className }: AnimatedListProps) {
  const prefersReduced = useReducedMotion()
  const id = useId()
  const items = Children.toArray(children)

  if (prefersReduced) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      transition={{ staggerChildren: staggerDelay }}
    >
      {items.map((child, i) => (
        <motion.div key={`${id}-${i}`} variants={itemVariants} transition={SPRING_GENTLE}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  )
}
```

**Step 2: Commit**

```bash
git add components/ui/animated-list.tsx
git commit -m "feat: add AnimatedList primitive with staggered entry"
```

---

## Task 4: Create AnimatedNumber primitive

**Files:**
- Create: `components/ui/animated-number.tsx`

**Step 1: Create the component**

```tsx
'use client'

// @ai-why: Count-up animation for stat card numbers (0 → 847).
// Uses motion/react useSpring for physics-based interpolation.
// Triggered on viewport entry. Respects prefers-reduced-motion.

import { useEffect, useRef } from 'react'
import { useInView, useMotionValue, useSpring, useReducedMotion } from 'motion/react'

interface AnimatedNumberProps {
  value: number
  prefix?: string
  suffix?: string
  duration?: number
  decimals?: number
  className?: string
}

export function AnimatedNumber({
  value,
  prefix = '',
  suffix = '',
  duration = 0.8,
  decimals = 0,
  className,
}: AnimatedNumberProps) {
  const prefersReduced = useReducedMotion()
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-20px' })
  const motionValue = useMotionValue(0)
  const spring = useSpring(motionValue, {
    stiffness: 100,
    damping: 30,
    duration: duration * 1000,
  })

  useEffect(() => {
    if (isInView && !prefersReduced) {
      motionValue.set(value)
    } else if (prefersReduced) {
      motionValue.jump(value)
    }
  }, [isInView, value, prefersReduced, motionValue])

  useEffect(() => {
    const unsubscribe = spring.on('change', (latest) => {
      if (ref.current) {
        const formatted = decimals > 0 ? latest.toFixed(decimals) : Math.round(latest).toString()
        ref.current.textContent = `${prefix}${formatted}${suffix}`
      }
    })
    return unsubscribe
  }, [spring, prefix, suffix, decimals])

  const display = decimals > 0 ? value.toFixed(decimals) : Math.round(value).toString()

  return (
    <span ref={ref} className={className}>
      {prefersReduced ? `${prefix}${display}${suffix}` : `${prefix}0${suffix}`}
    </span>
  )
}
```

**Step 2: Commit**

```bash
git add components/ui/animated-number.tsx
git commit -m "feat: add AnimatedNumber primitive with spring count-up"
```

---

## Task 5: Write DESIGN_SYSTEM.md

**Files:**
- Create: `DESIGN_SYSTEM.md` (project root)

**Step 1: Write the design system doc**

Content should cover (use the academie DESIGN_SYSTEM.md as template):

1. **Tokens** — full table of all semantic tokens with hex values and usage descriptions
2. **Typography** — pixel-based scale: page title `text-[28px]`, section title `text-[15px]`, body `text-[13px]`, labels `text-[12px]`, micro `text-[11px]`, badge `text-[10px]`, stat numbers `text-[22px]`
3. **Spacing** — page padding `px-6 md:px-8`, section gaps `gap-5`/`space-y-6`, card padding `p-5`/`p-6`
4. **Shadows** — `shadow-card` for cards, `shadow-card-hover` for hover states
5. **Animations** — reference `lib/motion-config.ts`, explain `SPRING` vs `SPRING_GENTLE`, stagger principles, `prefers-reduced-motion` requirement
6. **Component patterns** — how to use AnimatedList, AnimatedNumber, ScrollReveal
7. **Wiki light mode** — explain `.wiki-light` class usage
8. **Token migration mapping** — find/replace table (same as design doc)
9. **What NOT to replace** — gradients, SVG strokes, dynamic per-entity colors
10. **Per-page checklist** — the 6-item checklist from the design doc
11. **Common mistakes** — shadow-card vergeten, rounded-lg ipv rounded-2xl, hardcoded grays, ad-hoc animation values, missing useReducedMotion

**Step 2: Commit**

```bash
git add DESIGN_SYSTEM.md
git commit -m "docs: add design system reference document"
```

---

## Task 6: Migrate components/ui/scroll-reveal.tsx

**Files:**
- Modify: `components/ui/scroll-reveal.tsx`

**Step 1: Replace imports and add motion-config**

Change:
```tsx
import { motion, useInView, Variants } from 'framer-motion';
```
To:
```tsx
import { motion, useInView, useReducedMotion, type Variants } from 'motion/react';
import { EASE } from '@/lib/motion-config';
```

**Step 2: Add `@ai-why` comment at top (after 'use client')**

```tsx
// @ai-why: Scroll-triggered reveal animations for marketing/landing pages.
// Supports fade-up, fade, slide-left, slide-right, scale variants.
// Uses IntersectionObserver for in/out/exit states.
```

**Step 3: Replace hardcoded ease values**

Replace all instances of `ease: [0.25, 0.1, 0.25, 1]` with `ease: EASE`.

**Step 4: Add useReducedMotion to ScrollReveal component**

Inside `ScrollReveal`, add:
```tsx
const prefersReduced = useReducedMotion();
```
And wrap the motion.div: if `prefersReduced`, render a plain `<div>` with `className` instead.

**Step 5: Same for StaggerContainer and StaggerItem**

Add `useReducedMotion` and plain div fallback.

**Step 6: Commit**

```bash
git add components/ui/scroll-reveal.tsx
git commit -m "refactor: migrate scroll-reveal to motion/react with reduced-motion support"
```

---

## Task 7: Migrate components/wiki/ (12 files)

**Files:**
- Modify: `components/wiki/ArticleLayout.tsx`
- Modify: `components/wiki/Citation.tsx`
- Modify: `components/wiki/CitationEnhancer.tsx`
- Modify: `components/wiki/EvidenceRating.tsx`
- Modify: `components/wiki/ExpertReviewBadge.tsx`
- Modify: `components/wiki/PopularToday.tsx`
- Modify: `components/wiki/ReadingProgress.tsx`
- Modify: `components/wiki/RelatedArticles.tsx`
- Modify: `components/wiki/SearchBar.tsx`
- Modify: `components/wiki/SourcesList.tsx`
- Modify: `components/wiki/TableOfContents.tsx`

**Step 1: For each file, apply this mapping:**

Wiki components render in light-mode context (`.wiki-light` wrapper). Replace gray classes with semantic tokens:

| Find | Replace |
|------|---------|
| `text-gray-900` | `text-ink` |
| `text-gray-800` | `text-ink` |
| `text-gray-700` | `text-ink` |
| `text-gray-600` | `text-ink-secondary` |
| `text-gray-500` | `text-ink-secondary` |
| `text-gray-400` | `text-ink-tertiary` |
| `text-gray-300` | `text-ink-muted` |
| `bg-gray-100` | `bg-surface` |
| `bg-gray-50` | `bg-surface` |
| `border-gray-200` | `border-subtle` |
| `border-gray-200/60` | `border-subtle` |
| `divide-gray-100` | `divide-subtle` |
| `hover:bg-gray-50` | `hover:bg-surface` |
| `placeholder:text-gray-500` | `placeholder:text-ink-secondary` |
| `placeholder:text-gray-400` | `placeholder:text-ink-tertiary` |
| `text-blue-600` | `text-action` |
| `text-blue-700` | `text-action` |
| `border-blue-400` | `border-action` |

**Special cases:**
- `ArticleLayout.tsx`: prose classes like `prose-headings:text-gray-900` → `prose-headings:text-ink`, `prose-p:text-gray-600` → `prose-p:text-ink-secondary`, `prose-code:bg-gray-100` → `prose-code:bg-surface`, `prose-pre:bg-gray-50` → `prose-pre:bg-surface`
- `ReadingProgress.tsx`: replace default color `'#3b82f6'` with `'var(--color-action)'` or accept the color prop as-is (it comes from category colors)
- `SearchBar.tsx`: complex search UI — replace all gray classes per mapping, ensure focus states use `focus:ring-action/20`

**Step 2: Add `@ai-why` comments to key files**

**Step 3: Commit**

```bash
git add components/wiki/
git commit -m "refactor: migrate wiki components to semantic design tokens"
```

---

## Task 8: Migrate wiki pages and layouts

**Files:**
- Modify: `app/(wiki-home)/wiki-home-content.tsx`
- Modify: `app/(wiki-home)/layout.tsx`
- Modify: `app/wiki/[category]/page.tsx`
- Modify: `app/wiki/[category]/layout.tsx`

**Step 1: wiki-home-content.tsx**

- Change `import { motion } from 'framer-motion'` → `import { motion, useReducedMotion } from 'motion/react'`
- Import `SPRING_GENTLE, EASE, STAGGER` from `@/lib/motion-config`
- Replace `transition={{ duration: 0.5 }}` → `transition={SPRING_GENTLE}`
- Replace `transition={{ duration: 0.4, delay: 0.3 + i * 0.05 }}` → `transition={{ ...SPRING_GENTLE, delay: i * STAGGER }}`
- Replace gray classes per Task 7 mapping
- Replace `bg-gradient-to-br from-gray-700 to-gray-900` — this is a hero gradient overlay, leave as-is (contextual)

**Step 2: layout.tsx files**

- Replace `bg-[#f5f5f7]` → `bg-surface` (these are wiki light layouts, will inherit `.wiki-light`)
- Replace `text-[#1d1d1f]` → `text-ink`
- Add `wiki-light` class to the wrapper div

**Step 3: category page.tsx**

- Replace gray classes per mapping
- Replace gradient fallbacks if they use gray classes

**Step 4: Commit**

```bash
git add app/\(wiki-home\)/ app/wiki/
git commit -m "refactor: migrate wiki pages to motion/react and semantic tokens"
```

---

## Task 9: Migrate app/carve/ + components/carve/ (~18 files)

**Files:**
- Modify: All files in `app/carve/` that import framer-motion (9 files)
- Modify: All files in `components/carve/` that import framer-motion (9 files)

**Step 1: For each file:**

- Change `import { motion, AnimatePresence } from 'framer-motion'` → `import { motion, AnimatePresence, useReducedMotion } from 'motion/react'`
- Import constants from `@/lib/motion-config` where animation values are used
- Replace ad-hoc `transition={{ duration: X }}` with appropriate config constant
- Add `useReducedMotion` and respect it

**Step 2: PricingHub.tsx — replace product color hex values**

- `'#D4A843'` → use `health` token via CSS variable or keep as data-driven (these are in a data array, not Tailwind classes)
- For inline `style` props with hex colors, these can reference CSS variables: `var(--color-health)` etc.

**Step 3: Add `@ai-why` comments**

**Step 4: Commit**

```bash
git add app/carve/ components/carve/
git commit -m "refactor: migrate carve pages to motion/react and semantic tokens"
```

---

## Task 10: Migrate components/dashboard/ + dashboard pages (~19 files)

**Files:**
- Modify: `components/dashboard/HealthDashboardClient.tsx`
- Modify: `components/dashboard/hub/WidgetSidebar.tsx`
- Modify: `components/dashboard/hub/chat/CoachChat.tsx`
- Modify: `components/dashboard/hub/chat/CoachEmptyState.tsx`
- Modify: All dashboard pages importing framer-motion (money/*, settings, profile, travel/*)

**Step 1: For each file with framer-motion import:**

- Change `framer-motion` → `motion/react`
- Add `useReducedMotion`
- Replace ad-hoc animation values with motion-config constants

**Step 2: HealthDashboardClient.tsx**

- Replace `'#c8b86e'` → `var(--color-health)` or `text-health`/`bg-health`

**Step 3: Commit**

```bash
git add components/dashboard/ app/\(protected\)/dashboard/
git commit -m "refactor: migrate dashboard to motion/react and semantic tokens"
```

---

## Task 11: Migrate components/app/ (6 files)

**Files:**
- Modify: `components/app/app-header.tsx`
- Modify: `components/app/layout-wrapper.tsx`
- Modify: `components/app/app-shell.tsx`
- Modify: `components/app/app-sidebar-controller.tsx`
- Modify: `components/app/sidebars/base-sidebar.tsx`
- Modify: `components/app/sidebars/sidebar-skeleton.tsx`

**Step 1: app-header.tsx**

- Change framer-motion → motion/react
- Replace `bg-[#0c0e14]` → `bg-surface`
- Replace `bg-[#1a1d25]` → `bg-surface-raised`

**Step 2: layout-wrapper.tsx**

- Replace `bg-[#f5f5f7]` → `bg-surface` (wiki context)
- Replace `bg-[#0c0e14]` → `bg-surface` (dark context)

**Step 3: app-shell.tsx**

- Replace `bg-[#0c0e14]` → `bg-surface`
- Replace `bg-[#111318]` → `bg-surface`

**Step 4: app-sidebar-controller.tsx**

This file has many hardcoded RGBA and hex values for sidebar theming. Replace:
- `'#0c0e14'` → `var(--color-surface)`
- `'#555d70'`, `'#7a8299'`, `'#c4cad6'` → map to `var(--color-ink-tertiary)`, `var(--color-ink-secondary)`, `var(--color-ink-muted)` as appropriate
- RGBA values for hover/bg → use semantic tokens with opacity

**Step 5: sidebars/base-sidebar.tsx and sidebar-skeleton.tsx**

- Replace `bg-[#ececf1]` → `bg-surface` (light sidebar variant)

**Step 6: Commit**

```bash
git add components/app/
git commit -m "refactor: migrate app shell components to semantic tokens"
```

---

## Task 12: Migrate remaining files (admin, landing, travel, quiz, misc)

**Files:**
- Modify: `components/admin/dashboard-charts.tsx`
- Modify: `components/admin/chart-card.tsx`
- Modify: `components/admin/stats-card.tsx`
- Modify: `components/admin/settings-section.tsx`
- Modify: `components/admin/admin-skeleton.tsx`
- Modify: `components/admin/users/user-edit-form.tsx`
- Modify: `components/landing/Footer.tsx`
- Modify: `components/landing/HeroSection.tsx`
- Modify: `components/landing/HiscoresWidget.tsx`
- Modify: `components/landing/DetailedFeatureSection.tsx`
- Modify: `components/landing/FeatureCard.tsx`
- Modify: `components/landing/ActivityFeed.tsx`
- Modify: `components/landing/WaitlistForm.tsx`
- Modify: `components/travel/chat/ChatMessage.tsx`
- Modify: `components/travel/plan/PlanDashboard.tsx`
- Modify: `components/travel/widgets/ActivityEditForm.tsx`
- Modify: `components/travel/widgets/ActivitySuggestions.tsx`
- Modify: `components/travel/widgets/BucketlistWidget.tsx`
- Modify: `components/travel/widgets/CreateTripModal.tsx`
- Modify: `components/travel/widgets/DayTimeline.tsx`
- Modify: `components/travel/widgets/TripCard.tsx`
- Modify: `components/quiz/QuizStartCard.tsx`
- Modify: `components/quiz/QuizQuestion.tsx`
- Modify: `components/quiz/QuizResults.tsx`
- Modify: `app/demo/page.tsx`
- Modify: `app/privacy/page.tsx`
- Modify: `app/hiscores/page.tsx`
- Modify: `app/terms/page.tsx`

**Step 1: Admin components**

All use dark theme. Replace:
- `bg-[#1c1f27]` → `bg-surface-raised`
- `border-white/[0.06]` → `border-subtle`
- `text-[#9da6b9]` → `text-ink-secondary`
- `hover:border-white/[0.12]` → `hover:border-subtle`
- Chart hex colors in `dashboard-charts.tsx` — keep as inline data arrays (dynamic per-chart, like academie's approach)

**Step 2: Landing components**

Replace gray classes per Task 7 mapping. Landing pages are mixed light/dark — apply mapping contextually.

**Step 3: Travel components**

- Change framer-motion → motion/react
- Add useReducedMotion
- Replace ad-hoc animation values

**Step 4: Quiz components**

- Change framer-motion → motion/react
- Add useReducedMotion

**Step 5: Misc pages**

- `app/hiscores/page.tsx`: replace `bg-[#c8b86e]` → `bg-health`, `text-[#c8b86e]` → `text-health`, `border-[#c8b86e]` → `border-health`, `bg-[#0c0e14]` → `bg-surface`, `text-[#9da6b9]` → `text-ink-secondary`, `bg-[#1c1f27]` → `bg-surface-raised`
- `app/demo/page.tsx`: replace `bg-[#ececf1]` → `bg-surface`, gray classes per mapping
- `app/terms/page.tsx`: replace `bg-[#ececf1]` → `bg-surface`

**Step 6: Commit per area**

```bash
git add components/admin/
git commit -m "refactor: migrate admin components to semantic tokens"

git add components/landing/
git commit -m "refactor: migrate landing components to semantic tokens"

git add components/travel/
git commit -m "refactor: migrate travel components to motion/react"

git add components/quiz/
git commit -m "refactor: migrate quiz components to motion/react"

git add app/demo/ app/privacy/ app/hiscores/ app/terms/
git commit -m "refactor: migrate misc pages to semantic tokens"
```

---

## Task 13: Verify build and final cleanup

**Step 1: Run build**

```bash
pnpm build
```

Expected: No errors. All pages render correctly.

**Step 2: Grep for remaining framer-motion imports**

```bash
grep -r "from 'framer-motion'" --include="*.tsx" --include="*.ts" -l | grep -v node_modules
```

Expected: No results.

**Step 3: Grep for remaining hardcoded hex values to assess**

```bash
grep -rn "#[0-9a-fA-F]\{6\}" --include="*.tsx" --include="*.ts" | grep -v node_modules | grep -v motion-config | grep -v DESIGN_SYSTEM | grep -v ".css"
```

Review remaining: chart data arrays and dynamic per-entity colors are OK. Anything else should be flagged.

**Step 4: Final commit if any cleanup needed**

```bash
git add -A
git commit -m "chore: final cleanup after design system migration"
```
