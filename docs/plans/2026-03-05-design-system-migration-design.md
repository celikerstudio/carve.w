# Design System Migration — Carve Wiki

Applying academie's design system patterns to carve-wiki: semantic tokens, centralized motion config, animated primitives, and consistent styling.

## Decisions

- **Theme:** Dark-first tokens, wiki pages override to light
- **Scope:** Full migration — all files, all tokens, all animations
- **Approach:** Page-by-page — foundation first, then migrate per area
- **Product colors:** Semantic tokens (`--color-health`, `--color-money`, etc.)
- **Motion library:** `motion/react` (already bundled in framer-motion v12+, just change imports)

## Foundation (one-time setup)

### 1. `lib/motion-config.ts`

Centralized animation constants matching Apple HIG feel:

```ts
export const SPRING = { type: 'spring', stiffness: 400, damping: 30 }
export const SPRING_GENTLE = { type: 'spring', stiffness: 260, damping: 20 }
export const EASE = [0.25, 0.1, 0.25, 1]
export const STAGGER = 0.04 // 40ms per item
```

### 2. Semantic Tokens in `globals.css`

Dark-first (default):

| Token | Value | Usage |
|-------|-------|-------|
| `ink` | #fafafa | Primary text |
| `ink-secondary` | #a3a3a3 | Labels, subtext |
| `ink-tertiary` | #737373 | Timestamps, placeholders |
| `ink-muted` | #404040 | Inactive borders, chevrons |
| `surface` | #141415 | Card/input backgrounds |
| `surface-raised` | #1a1a1b | Elevated cards |
| `subtle` | #262626 | Borders, dividers |
| `action` | #3B82F6 | Links, primary CTAs |
| `action-hover` | #2563EB | Hover state for action |
| `health` | #D4A843 | Health product accent |
| `money` | #3B82F6 | Money product accent |
| `travel` | #F97316 | Travel product accent |
| `wiki` | #10B981 | Wiki/knowledge accent |
| `success` | #34C759 | Positive status |
| `warning` | #FF9500 | Warnings |
| `danger` | #FF3B30 | Errors, destructive |

Wiki pages get light-mode overrides via a `.wiki-light` class on the layout wrapper:

| Token | Light override |
|-------|---------------|
| `ink` | #1d1d1f |
| `ink-secondary` | #86868b |
| `ink-tertiary` | #aeaeb2 |
| `ink-muted` | #d1d1d6 |
| `surface` | #f5f5f7 |
| `surface-raised` | #ffffff |
| `subtle` | #e5e5ea |

### 3. Shadows

```css
--shadow-card: 0 1px 3px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.08);
--shadow-card-hover: 0 2px 8px rgba(0,0,0,0.16), 0 8px 24px rgba(0,0,0,0.12);
```

### 4. Animated Primitives in `components/ui/`

**AnimatedList** — staggered fade-up entry for any list of children. Uses `SPRING_GENTLE` + `STAGGER`. Respects `prefers-reduced-motion`.

**AnimatedNumber** — spring-based count-up triggered on viewport entry. Supports prefix/suffix/decimals. Respects `prefers-reduced-motion`.

### 5. `DESIGN_SYSTEM.md`

Living document at project root covering:
- Token reference table
- Typography scale (pixel sizes, not Tailwind classes)
- Spacing conventions
- Animation principles
- Common mistakes
- Per-page migration checklist

## Page-by-Page Migration

### Per-page checklist

- [ ] `framer-motion` → `motion/react`
- [ ] Raw hex/gray classes → semantic tokens
- [ ] Ad-hoc animation values → motion-config constants
- [ ] `useReducedMotion` added where animations exist
- [ ] `@ai-why` comment at top of file
- [ ] No visual regression (build passes)

### Migration order

| # | Area | Files (approx) |
|---|------|----------------|
| 1 | `components/ui/` (scroll-reveal, etc.) | 3-4 |
| 2 | `components/wiki/` + wiki pages | ~12 |
| 3 | `app/carve/` + `components/carve/` | ~15 |
| 4 | `components/dashboard/` + dashboard pages | ~10 |
| 5 | `components/app/` (header, layout) | ~3 |
| 6 | Remaining (`landing/`, `money/`, `travel/`, `admin/`) | ~10 |

### Token migration mapping

| Find | Replace with |
|------|-------------|
| `text-white` (on dark bg) | `text-ink` |
| `text-white/70`, `text-white/60` | `text-ink-secondary` |
| `text-white/40`, `text-white/30` | `text-ink-tertiary` |
| `text-gray-900`, `text-[#0a0a0a]` | `text-ink` (light context) |
| `text-gray-400`, `text-gray-500` | `text-ink-secondary` |
| `bg-[#0A0A0B]`, `bg-[#141415]` | `bg-surface` |
| `bg-[#1a1a1b]`, `bg-[#1A1A1B]` | `bg-surface-raised` |
| `border-[#262626]`, `border-white/10` | `border-subtle` |
| `text-[#D4A843]`, `bg-[#D4A843]` | `text-health`, `bg-health` |
| `text-[#3B82F6]`, `bg-[#3B82F6]` | `text-money`, `bg-money` |
| `text-[#F97316]`, `bg-[#F97316]` | `text-travel`, `bg-travel` |
| `{ duration: 0.5 }` etc. | `SPRING_GENTLE` or `SPRING` |
| `ease: [0.25, 0.1, 0.25, 1]` | `EASE` from motion-config |

### What NOT to replace

- Gradient stops with specific opacity (`from-black/80 via-black/40`) — these are contextual
- Image overlay gradients — leave as-is
- SVG stroke attributes — no Tailwind support
- Tailwind color utilities that already match semantic meaning (e.g., `bg-white` in wiki light context)
