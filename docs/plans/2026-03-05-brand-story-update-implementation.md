# Brand Story Update Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Update the three core marketing sections (Hero, Founder Story, AI Chat Demo) to reposition Carve from "gamified fitness tracker" to "AI life coach."

**Architecture:** Copy-only changes for Hero and AI Demo. Founder Story gets new animated progress bars (fat% down, muscle% up) using framer-motion with scroll-triggered animation via existing ScrollReveal pattern.

**Tech Stack:** Next.js, framer-motion, lucide-react, existing ScrollReveal component

---

### Task 1: Update Hero Section copy

**Files:**
- Modify: `components/landing/HeroSection.tsx`

**Step 1: Update the headline and subheadline**

Change lines 10-16 from:
```tsx
<h1 className="text-5xl md:text-6xl font-bold text-ink leading-tight">
  Track Everything.
  <br />
  Level Up.
  <br />
  Win.
</h1>
```
To:
```tsx
<h1 className="text-5xl md:text-6xl font-bold text-ink leading-tight">
  One AI.
  <br />
  Your whole life.
</h1>
```

Change line 18-20 from:
```tsx
<p className="mt-6 text-xl text-ink-secondary leading-relaxed">
  The fitness app that gamifies your progress. Track PRs, earn XP, compete with friends.
</p>
```
To:
```tsx
<p className="mt-6 text-xl text-ink-secondary leading-relaxed">
  Carve AI coaches you on fitness, finances, and travel — because life isn&apos;t just one thing.
</p>
```

Change line 27 from:
```tsx
<p className="mt-4 text-sm text-ink-secondary">
  Join the waitlist for early access
</p>
```
To:
```tsx
<p className="mt-4 text-sm text-ink-secondary">
  Join the waitlist — it&apos;s free
</p>
```

**Step 2: Commit**

```bash
git add components/landing/HeroSection.tsx
git commit -m "copy(brand): update hero to AI life coach positioning"
```

---

### Task 2: Update Founder Story copy and add animated progress bars

**Files:**
- Modify: `components/carve/FounderStory.tsx`

**Step 1: Update the story copy and stats**

Replace the entire content of `FounderStory.tsx` with:

```tsx
'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ScrollReveal } from '@/components/ui/scroll-reveal';

function AnimatedBar({
  label,
  from,
  to,
  unit,
  color,
  delay,
  inView,
}: {
  label: string;
  from: number;
  to: number;
  unit: string;
  color: string;
  delay: number;
  inView: boolean;
}) {
  const percentage = to;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-white/40">{label}</span>
        <span className="text-xs font-medium" style={{ color }}>
          {from}{unit} → {to}{unit}
        </span>
      </div>
      <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: `${from}%` }}
          animate={inView ? { width: `${percentage}%` } : { width: `${from}%` }}
          transition={{ duration: 1.5, delay, ease: [0.25, 0.1, 0.25, 1] }}
        />
      </div>
    </div>
  );
}

export function FounderStory() {
  const barsRef = useRef(null);
  const barsInView = useInView(barsRef, { once: true, margin: '-100px' });

  return (
    <section className="py-24 md:py-32 px-6">
      <div className="max-w-2xl mx-auto text-center">
        {/* The number */}
        <ScrollReveal animation="fade-up">
          <p className="text-6xl md:text-8xl font-bold text-white tracking-tight mb-8">
            130<span className="text-white/20">kg</span>
            <span className="text-white/20 mx-2 md:mx-4">&rarr;</span>
            80<span className="text-white/20">kg</span>
          </p>
        </ScrollReveal>

        {/* Animated bars */}
        <ScrollReveal animation="fade-up" delay={0.1}>
          <div ref={barsRef} className="max-w-xs mx-auto space-y-3 mb-10">
            <AnimatedBar
              label="Body fat"
              from={38}
              to={15}
              unit="%"
              color="#ef4444"
              delay={0.3}
              inView={barsInView}
            />
            <AnimatedBar
              label="Muscle mass"
              from={28}
              to={42}
              unit="%"
              color="#22c55e"
              delay={0.5}
              inView={barsInView}
            />
          </div>
        </ScrollReveal>

        <ScrollReveal animation="fade-up" delay={0.15}>
          <p className="text-white/50 text-base md:text-lg leading-relaxed max-w-xl mx-auto">
            130kg &rarr; 80kg. 4 years. Built the app that got me there. Now it does more than fitness. So do I.
          </p>
        </ScrollReveal>

        {/* Stats */}
        <ScrollReveal animation="fade-up" delay={0.2}>
          <div className="mt-12 grid grid-cols-3 gap-4">
            {[
              { value: '50kg', label: 'lost' },
              { value: '4 yrs', label: 'journey' },
              { value: '1', label: 'developer' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl md:text-3xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-white/30 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
```

Key changes:
- Added `AnimatedBar` component with framer-motion width animation
- Fat% bar: 38% → 15% (red, animates down)
- Muscle% bar: 28% → 42% (green, animates up)
- Bars trigger on scroll into view via `useInView`
- Updated story copy to the new narrative
- Updated stats: "900+ commits" → "4 yrs journey"

**Step 2: Commit**

```bash
git add components/carve/FounderStory.tsx
git commit -m "feat(brand): update founder story with animated progress bars and new narrative"
```

---

### Task 3: Update AI Chat Demo copy

**Files:**
- Modify: `components/carve/AIChatDemo.tsx`

**Step 1: Update headline and subheadline**

Change line 88 from:
```tsx
A coach that knows you.
```
To:
```tsx
A coach that actually knows you.
```

Change lines 90-91 from:
```tsx
<p className="text-white/40 mt-4 max-w-md mx-auto text-sm md:text-base leading-relaxed">
  Not a generic answer. A coach that knows what you trained this morning, what your budget is, and where your next trip goes.
</p>
```
To:
```tsx
<p className="text-white/40 mt-4 max-w-md mx-auto text-sm md:text-base leading-relaxed">
  Not a chatbot with canned answers. An AI that sees your workouts, your spending, and your plans&nbsp;&mdash; and connects the dots.
</p>
```

**Step 2: Commit**

```bash
git add components/carve/AIChatDemo.tsx
git commit -m "copy(brand): update AI demo headline and description"
```

---

### Task 4: Verify build

**Step 1: Run TypeScript check**

```bash
npx tsc --noEmit
```

Expected: No errors.

**Step 2: Visual check**

```bash
npm run dev
```

- Landing page hero shows "One AI. Your whole life."
- Founder story shows 130→80 with animated fat/muscle bars on scroll
- AI demo shows "A coach that actually knows you."

**Step 3: Commit any fixes**

```bash
git commit -m "fix(brand): resolve build issues"
```
