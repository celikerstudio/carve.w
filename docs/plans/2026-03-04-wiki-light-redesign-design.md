# Wiki Light Redesign — Design Document

## Overview

Redesign all wiki pages (homepage, category, article) from dark to light theme. Add AI-generated hero images and article thumbnails. Inspired by a wellness encyclopedia reference but adapted to Carve's Apple-inspired design language.

## Color System

| Token | Value | Usage |
|-------|-------|-------|
| Page bg | `#f5f5f7` | All wiki page backgrounds |
| Text primary | `#1d1d1f` | Headlines, body text |
| Text secondary | `#6e6e73` | Meta info, descriptions |
| Text tertiary | `#86868b` | Timestamps, view counts |
| Card bg | `#ffffff` | Article cards, content areas |
| Card border | `border-gray-200/60` | Subtle card edges |
| Divider | `#d2d2d7` | Section separators |

Category colors (emerald, blue, purple, cyan, amber, green, rose) remain the same hex values. Text classes shift from `-400` to `-600` for contrast on light backgrounds.

Header stays dark (`#0A0A0B`). Dashboard stays dark. Only wiki routes change.

## Page Designs

### Wiki Homepage

**Hero (full-width, ~400px desktop, ~300px mobile):**
- AI-generated fitness/lifestyle background image
- `rounded-2xl` with side margins
- Dark gradient overlay (bottom → up) for text legibility
- White text: "Carve Wiki" title + "Evidence-based fitness knowledge" subtitle
- Search bar (white bg, subtle border) centered on hero
- Search dropdown results styled light

**Category Cards (horizontal row below hero):**
- Horizontally scrollable on mobile, grid on desktop
- Each card: AI category image, category color badge, title of most popular article
- Rounded corners, subtle shadow on white card

**Trending/Latest Articles:**
- Section header: "Trending today" with "View all →" link
- 3-column grid (desktop), 1-column (mobile)
- White cards with thumbnail image on top
- Category color badge + estimated read time
- Article title (semibold) + excerpt (2 lines max)

### Article Page

**Hero (full-width, ~450px):**
- AI-generated article-specific image
- Dark gradient overlay at bottom
- Category badge in category color (e.g., blue pill for Training)
- Read time estimate
- Article title (large, bold, white)
- "By [author]" + "Updated [timeago]"
- Evidence rating badge (prominent — unique to Carve)

**Content area (below hero, bg: #f5f5f7):**
- Two-column layout: sticky ToC on left, article content on right
- Prose styling: `prose` (not `prose-invert`) — dark text on light
- Summary block: left border in category color
- Tags as subtle pills (`bg-gray-100`, `text-gray-600`)
- Citations/Sources section at bottom, light styled
- Related articles at bottom as cards

### Category Page

**Hero (full-width, ~250px, shorter than article):**
- AI-generated category-specific image (1 per category, 7 total)
- Breadcrumbs in overlay (Wiki / Category Name)
- Category title + description + article count

**Article grid (below hero):**
- 3-column grid (desktop), 1-column (mobile)
- Same card style as homepage trending cards
- Thumbnail, evidence rating, title, excerpt, view count

## Images

**Sources:**
- AI-generated externally, stored in Supabase Storage or `/public`
- 1 homepage hero image
- 7 category hero images
- Per-article thumbnails

**Database change:**
- Add `image_url` column to `wiki_articles` table

**Fallback (no image):**
- Category-color gradient as placeholder background

## Components Modified

1. `layout-wrapper.tsx` — wiki routes get light bg (`#f5f5f7`)
2. `wiki-home-content.tsx` — full redesign (hero + category cards + trending grid)
3. `ArticleLayout.tsx` — hero image + light prose + light meta
4. `app/wiki/[category]/page.tsx` — hero image + article cards grid
5. `SearchBar.tsx` — hero variant becomes light; dropdown becomes light
6. `PopularToday.tsx` — becomes article cards with thumbnails
7. `TableOfContents.tsx` — light styling
8. `EvidenceRating.tsx` — light color variants
9. `RelatedArticles.tsx` — light styling, card format
10. `CitationEnhancer.tsx` — light styling
11. `category-colors.ts` — add light-mode text classes (`-600` variants)

## What Does NOT Change

- AppHeader (stays dark)
- Dashboard pages (stay dark)
- Marketing pages (stay dark)
- Database queries and logic (only add `image_url` column)
- Authentication flow
