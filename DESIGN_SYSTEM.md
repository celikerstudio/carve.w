# Carve Wiki — Design System Reference

> Dark-first semantic token system. All visual decisions derive from the tokens below.
> Source of truth: `app/globals.css` (`@theme` block) and `.wiki-light` overrides.

---

## 1. Color Tokens

All tokens are defined as CSS custom properties under `@theme` in `app/globals.css` and consumed via Tailwind utility classes (e.g., `text-ink`, `bg-surface`, `border-subtle`).

The app defaults to dark mode. The `.wiki-light` class (Section 2) overrides the text and surface tokens for wiki reading pages.

| Token | Hex | Tailwind Class | Usage |
|---|---|---|---|
| `ink` | `#fafafa` | `text-ink` / `bg-ink` | Primary text |
| `ink-secondary` | `#a3a3a3` | `text-ink-secondary` | Labels, subtext |
| `ink-tertiary` | `#737373` | `text-ink-tertiary` | Timestamps, placeholders |
| `ink-muted` | `#404040` | `text-ink-muted` | Inactive borders, chevrons |
| `surface` | `#141415` | `bg-surface` | Card and input backgrounds |
| `surface-raised` | `#1a1a1b` | `bg-surface-raised` | Elevated cards, modals |
| `subtle` | `#262626` | `border-subtle` / `bg-subtle` | Borders, dividers |
| `action` | `#3B82F6` | `text-action` / `bg-action` | Links, primary CTAs |
| `action-hover` | `#2563EB` | `hover:bg-action-hover` | Hover state for action elements |
| `health` | `#D4A843` | `text-health` / `bg-health` | Health product accent |
| `money` | `#3B82F6` | `text-money` / `bg-money` | Money product accent |
| `travel` | `#F97316` | `text-travel` / `bg-travel` | Travel product accent |
| `wiki-accent` | `#10B981` | `text-wiki-accent` / `bg-wiki-accent` | Wiki / knowledge accent |
| `success` | `#34C759` | `text-success` | Positive status indicators |
| `warning` | `#FF9500` | `text-warning` | Warnings, caution states |
| `danger` | `#FF3B30` | `text-danger` | Errors, destructive actions |

---

## 2. Wiki Light Mode

Wiki article pages use a light reading theme. The `.wiki-light` class is applied to the layout wrapper in `app/wiki/[category]/layout.tsx`. It overrides the ink and surface tokens while leaving product accent and status tokens untouched.

```css
/* app/globals.css */
.wiki-light {
  --color-ink: #1d1d1f;
  --color-ink-secondary: #86868b;
  --color-ink-tertiary: #aeaeb2;
  --color-ink-muted: #d1d1d6;
  --color-surface: #f5f5f7;
  --color-surface-raised: #ffffff;
  --color-subtle: #e5e5ea;
}
```

| Token | Dark default | Wiki light override |
|---|---|---|
| `ink` | `#fafafa` | `#1d1d1f` |
| `ink-secondary` | `#a3a3a3` | `#86868b` |
| `ink-tertiary` | `#737373` | `#aeaeb2` |
| `ink-muted` | `#404040` | `#d1d1d6` |
| `surface` | `#141415` | `#f5f5f7` |
| `surface-raised` | `#1a1a1b` | `#ffffff` |
| `subtle` | `#262626` | `#e5e5ea` |

Because the app uses semantic tokens throughout, toggling `.wiki-light` on a parent element is sufficient to re-skin all descendant components. No component-level overrides are required.

---

## 3. Shadows

Shadows are defined in `app/globals.css` and consumed via `shadow-card` and `shadow-card-hover` Tailwind classes.

### Dark mode (default)

```css
--shadow-card:       0 1px 3px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.08);
--shadow-card-hover: 0 2px 8px rgba(0,0,0,0.16), 0 8px 24px rgba(0,0,0,0.12);
```

### Wiki light mode (`.wiki-light` override)

```css
--shadow-card:       0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03);
--shadow-card-hover: 0 2px 8px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.05);
```

Light-mode shadows are significantly reduced in opacity because a white surface with a dark shadow at full dark-mode opacity would appear heavy and harsh.

Usage:

```tsx
<div className="shadow-card hover:shadow-card-hover transition-shadow rounded-2xl bg-surface p-5">
  ...
</div>
```

---

## 4. Typography

All type sizes are set in explicit pixels rather than Tailwind's named scale (`text-sm`, `text-xs`, etc.) to ensure precise control independent of the base font size. Tracking and leading are only applied where they materially affect legibility.

| Context | Tailwind classes |
|---|---|
| Page title | `text-[28px] font-bold text-ink tracking-tight` |
| Section title | `text-[15px] font-semibold text-ink` |
| Body text | `text-[13px] text-ink` |
| Labels | `text-[12px] font-medium text-ink-secondary` |
| Micro labels | `text-[11px] font-semibold text-ink-secondary tracking-wider uppercase` |
| Badge text | `text-[10px] font-semibold` |
| Stat numbers | `text-[22px] font-bold text-ink tracking-tight leading-none` |

Do not use `text-sm` (14px), `text-xs` (12px), or other named sizes. Match the pixel values in the table above exactly.

---

## 5. Spacing

Spacing follows a consistent rhythm. Use these conventions across all pages and components.

| Context | Value |
|---|---|
| Page horizontal padding | `px-6 md:px-8` |
| Section gaps (vertical) | `gap-5` / `space-y-6` |
| Card internal padding | `p-5` or `p-6` |
| Card gaps within grids | `gap-4` to `gap-5` |
| Page header | `pt-8 pb-6` |

Avoid tight spacing. When in doubt, increase the gap rather than reduce it. Whitespace is structure — do not replace it with visible dividers unless the content genuinely requires a separator.

---

## 6. Animations

### Motion constants — `lib/motion-config.ts`

```ts
// @ai-why: Centralized animation constants for the entire app.
// Matches Apple HIG feel — snappy springs, subtle easing.
// All components import from here for consistency.

export const SPRING        = { type: 'spring', stiffness: 400, damping: 30 }
export const SPRING_GENTLE = { type: 'spring', stiffness: 260, damping: 20 }
export const EASE          = [0.25, 0.1, 0.25, 1] as const
export const STAGGER       = 0.04 // 40ms per item
```

- **SPRING** — snappy, responsive. Use for interactive elements (buttons, toggles, hover effects).
- **SPRING_GENTLE** — softer entry. Use for list items and content that fades in on load.
- **EASE** — cubic bezier for cases where spring is not appropriate (e.g., `ScrollReveal`).
- **STAGGER** — 40ms delay between sibling items in a list. Applied via `AnimatedList`.

### Animated components — `components/ui/`

**`AnimatedList`** — Wraps children in staggered fade-up entries. Each child receives a `SPRING_GENTLE` transition and appears 40ms after the previous one. Falls back to a plain `<div>` when `prefers-reduced-motion` is set.

**`AnimatedNumber`** — Count-up animation for stat figures (e.g., `0 → 847`). Triggered on viewport entry via `useInView`. Uses `useSpring` for physics-based interpolation. Renders the final value immediately when `prefers-reduced-motion` is set.

### Animation principles

1. **Every animation communicates** — Animation must convey state, hierarchy, or relationship. Decorative motion is not permitted.
2. **Spring physics** — Use `SPRING` or `SPRING_GENTLE` from `lib/motion-config.ts`. Never use `ease-in-out` or arbitrary cubic beziers for entrance/exit animations.
3. **Subtle and fast** — Target 200–400ms for all transitions. Nothing should linger.
4. **Staggered list entry** — Lists load item by item using a 40ms (`STAGGER`) delay per item. This communicates structure without feeling slow.
5. **Respect `prefers-reduced-motion`** — All animated components call `useReducedMotion()` and skip or skip to the final state when the user has opted out of motion.

---

## 7. Component Patterns

### AnimatedList

Use when rendering a list of cards, rows, or items that appear on page load.

```tsx
import { AnimatedList } from '@/components/ui/animated-list'

<AnimatedList className="space-y-3">
  {items.map((item) => (
    <ArticleCard key={item.id} {...item} />
  ))}
</AnimatedList>
```

Each direct child is automatically wrapped in a `motion.div` with staggered delay. Do not add manual `motion.div` wrappers inside `AnimatedList`.

### AnimatedNumber

Use for stat figures in dashboard cards or summary rows.

```tsx
import { AnimatedNumber } from '@/components/ui/animated-number'

<AnimatedNumber
  value={847}
  prefix="$"
  suffix="k"
  decimals={0}
  className="text-[22px] font-bold text-ink tracking-tight leading-none"
/>
```

The animation fires once when the element enters the viewport. Pass `duration` (in seconds, default `0.8`) to adjust the count-up speed.

### ScrollReveal

Use for marketing or editorial sections that animate in as the user scrolls. Available animation types: `fade-up` (default), `fade`, `slide-left`, `slide-right`, `scale`.

Note: `ScrollReveal` currently imports from `framer-motion`. Migrate it to `motion/react` before use in new components.

```tsx
import { ScrollReveal } from '@/components/ui/scroll-reveal'

<ScrollReveal animation="fade-up" delay={0.1}>
  <FeatureCard ... />
</ScrollReveal>
```

`StaggerContainer` and `StaggerItem` are also exported from the same file for manual stagger control.

---

## 8. Token Migration Mapping

When migrating existing components to use semantic tokens, apply these substitutions. Use find-and-replace within the file scope, not globally, to avoid collateral changes.

| Old value | Replacement |
|---|---|
| `text-white` (on dark background) | `text-ink` |
| `text-white/70`, `text-white/60` | `text-ink-secondary` |
| `text-white/40`, `text-white/30` | `text-ink-tertiary` |
| `text-gray-900`, `text-gray-800` | `text-ink` |
| `text-gray-600`, `text-gray-500` | `text-ink-secondary` |
| `text-gray-400` | `text-ink-tertiary` |
| `bg-[#0A0A0B]`, `bg-[#141415]` | `bg-surface` |
| `bg-[#1a1a1b]` | `bg-surface-raised` |
| `border-[#262626]`, `border-white/10` | `border-subtle` |
| `#D4A843` (inline) | `health` token — use `text-health` / `bg-health` |
| `#3B82F6` (inline) | `money` / `action` token — use `text-money`, `text-action`, etc. |
| `#F97316` (inline) | `travel` token — use `text-travel` / `bg-travel` |
| `import { ... } from 'framer-motion'` | `import { ... } from 'motion/react'` |

---

## 9. What NOT to Replace

Some values must not be replaced with semantic tokens even if they appear to match a token hex.

- **Gradient stops with specific opacity** — e.g., `from-[#141415]/0 to-[#141415]`. These are intentional opacity ramps and replacing them with `from-surface/0` may not produce the correct output depending on the Tailwind version.
- **Image overlay gradients** — gradient overlays on top of photos or background images use fine-tuned opacity and must remain as-is.
- **SVG `stroke` attributes** — SVG stroke colors are set inline and are not part of the token system.
- **Chart data array colors** — colors assigned per-entity in chart data arrays (e.g., bar fill colors, line series colors) are dynamic and intentional. They are not design-system violations.

---

## 10. Per-page Migration Checklist

When migrating or reviewing a page or component, work through each item in order:

- [ ] Replace `framer-motion` imports with `motion/react`
- [ ] Replace raw hex values and gray-scale Tailwind classes with semantic tokens (see Section 8)
- [ ] Replace ad-hoc `transition` / `spring` values with constants from `lib/motion-config.ts`
- [ ] Add `useReducedMotion()` in every component that contains animation
- [ ] Add `// @ai-why:` comment at the top of the file explaining the component's role
- [ ] Verify no visual regression — run `npm run build` and check the affected routes

---

## 11. Common Mistakes

**1. Forgetting `shadow-card`**
Cards without `shadow-card` appear flat and indistinguishable from the page background. Every card element must have `shadow-card` applied.

**2. Wrong border radius**
Use `rounded-2xl` for cards and panels. Use `rounded-xl` for buttons and inputs. Do not use `rounded-lg` — it is too small and inconsistent with the design language.

**3. Using visible borders as dividers**
Reach for whitespace (`gap-*`, `space-y-*`) before placing a visible border. If a border is necessary, use `border-subtle`. Never use `border-white/10` or hardcoded border colors.

**4. Using named Tailwind type sizes**
Do not use `text-sm` (14px) or `text-xs` (12px). Use the explicit pixel sizes from the typography table in Section 4.

**5. Tight spacing**
Default to generous gaps. Increase `gap-*` and `space-y-*` values rather than reducing them. Dense layouts feel cluttered on larger screens.

**6. Light-mode hover states**
Do not use `hover:bg-gray-50` or `hover:bg-gray-100`. Use `hover:bg-surface` or `hover:bg-surface-raised` so the hover color adapts to both dark and wiki-light contexts.

**7. Importing from `framer-motion`**
The project uses `motion/react` (the Motion for React package). Importing from `framer-motion` will introduce a duplicate dependency. All animation imports must use `motion/react`.

**8. Missing `useReducedMotion`**
Every component that applies animation must call `useReducedMotion()` from `motion/react` and either skip the animation entirely or jump to the final state when it returns `true`.
