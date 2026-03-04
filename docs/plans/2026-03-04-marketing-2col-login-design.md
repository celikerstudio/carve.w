# Marketing Page 2-Column Layout with Smart Header

**Date:** 2026-03-04
**Status:** Approved (revised after review)

## Problem

The header on marketing pages (`/carve/*`) shows Health | Money | Travel links that navigate between marketing pages — redundant when you're already on a marketing page. There's no clear path to login/dashboard from the marketing experience.

## Solution

### 1. Contextual Header Navigation

The header keeps its current route-based nav switching (marketing pages show marketing links, dashboard pages show dashboard links). The key change: **add a prominent "Sign in" button** to the right side for unauthenticated users.

- **On marketing pages:** Health → `/carve/health`, Money → `/carve/money`, Travel → `/carve/travel`
- **On dashboard pages:** Health → `/dashboard`, Money → `/dashboard/money`, Travel → `/dashboard/travel`
- Logo "CARVE" always links to `/carve`
- Wiki button remains
- Right side: **"Sign in" button** (not authenticated) or avatar dropdown (authenticated)

Note: Marketing pages remain accessible to everyone (URLs are shareable). Only `/carve` redirects authenticated users to `/dashboard`.

### 2. Two-Column Layout on All Marketing Pages

All marketing pages (`/carve`, `/carve/health`, `/carve/money`, `/carve/travel`) get a 2-column layout using a **`MarketingPageLayout` wrapper component** that each page explicitly uses (not injected from `layout-wrapper.tsx`).

- **Left column (`lg:w-[65%]`):** Existing marketing content, scrollable
- **Right column (`lg:w-[35%]`):** Sticky panel with product-specific feature highlights + CTA
- **Breakpoint: `lg` (1024px)** — below this, single column (CTA above content)

Each page wraps its content:
```tsx
<MarketingPageLayout page="/carve/health">
  {/* existing marketing content */}
</MarketingPageLayout>
```

Right column content (not authenticated):
- Product-specific feature checkmarks with accent color
- "Get Started" primary button → `/signup`
- "Already have an account? Sign in" link → `/login`

### 3. Auth-Based Redirect (only /carve)

- **Authenticated user visits `/carve`** → Redirect to `/dashboard` via middleware
- **Product pages (`/carve/health` etc.)** → Always accessible, shareable URLs work for everyone

### 4. Mobile Behavior

On mobile (< `lg` breakpoint):
- Right column moves above the marketing content (not sticky)
- Shows: feature highlights + CTA + sign in link
- Marketing content scrolls below
- Header uses hamburger menu as current

### 5. Sticky Behavior (Desktop)

The right column uses `position: sticky; top: 16px`. The marketing routes scroll inside a `fixed inset-0 overflow-y-auto` container in `layout-wrapper.tsx`, so sticky `top` is relative to that scroll container (not the viewport). Content is vertically centered within the sticky container, with `h-[calc(100vh-5rem)]` to fill the viewport minus header.

### 6. Hero Section Adjustments

Existing marketing pages have `min-h-[100dvh]` hero sections designed for full-width. In the 2-column layout these must be reduced:
- Replace `min-h-[100dvh]` with `min-h-[60vh]` on hero sections
- Remove standalone App Store CTA buttons from each page (replaced by sidebar CTA)
- Keep the marketing narrative and feature showcases intact

## Design Tokens

- Background: `bg-[#0A0A0B]` (matches current marketing pages)
- Right panel: subtle `border-l border-white/[0.04]` separator
- CTA button: `bg-white text-black rounded-xl font-semibold` — Apple style
- Feature checkmarks: product accent color (gold for health, blue for money, orange for travel, emerald for wiki)
- Sticky panel: generous padding (`p-8 lg:p-12`), vertically centered

## Sidebar Configuration

Typed config object — not hardcoded per page:

```tsx
type SidebarConfig = {
  features: string[];
  accent: string; // tailwind color
};

const SIDEBAR_CONFIG: Record<string, SidebarConfig> = {
  '/carve': {
    features: ['Track health & fitness', 'Manage your money', 'Plan your travels', 'Evidence-based wiki'],
    accent: 'white',
  },
  '/carve/health': {
    features: ['Track workouts', 'AI coaching', 'Compete on scoreboards', 'Rank progression'],
    accent: '[#D4A843]',
  },
  '/carve/money': {
    features: ['Budget tracking', 'Spending insights', 'Financial goals', 'Smart categorization'],
    accent: 'blue-400',
  },
  '/carve/travel': {
    features: ['Trip planning', 'Collect moments', 'Travel journal', 'Destination discovery'],
    accent: 'orange-400',
  },
};
```

## Files to Modify

1. `components/app/app-header.tsx` — add prominent "Sign in" button styling, keep route-based nav switching
2. `middleware.ts` — add `/carve` → `/dashboard` redirect for authenticated users
3. `app/carve/page.tsx` — wrap with `MarketingPageLayout`, remove standalone CTA, adjust hero height
4. `app/carve/health/page.tsx` — wrap with `MarketingPageLayout`, remove standalone CTA, adjust hero height
5. `app/carve/money/page.tsx` — wrap with `MarketingPageLayout`, remove standalone CTA, adjust hero height
6. `app/carve/travel/page.tsx` — wrap with `MarketingPageLayout`, remove standalone CTA, adjust hero height
7. New: `components/carve/MarketingPageLayout.tsx` — 2-column wrapper with sticky sidebar
8. New: `components/carve/MarketingSidebar.tsx` — reusable sticky right column with config-driven content
