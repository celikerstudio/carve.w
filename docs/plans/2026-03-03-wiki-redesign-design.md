# Wiki Redesign — Notion-style Dark Design

## Design Principles

- **Flat, content-first** — no glassmorphism cards, subtle dividers instead
- **Generous whitespace** — Notion-style breathing room
- **Typography as design** — clean heading hierarchy, relaxed body text
- **Color as accent only** — category colors subtle (dot, left border), not dominant
- **Dark, consistent** — matches rest of app (`#0A0A0B` base)

Remove: emoji icons, footer stats, heavy backdrop-blur cards, aggressive uppercase tracking.

## Pages

### Homepage (`/`)

- Clean hero: "Carve Wiki" title (not all-caps), subtitle, centered search bar
- Cmd+K hint on search bar
- Category grid: light bg (`white/[0.03]`), subtle border, color accent dot/line, title + count + description
- Hover: subtle bg shift, no translate/shadow effects
- Trending articles: clean list with title + category badge
- No footer stats section

### Category Page (`/wiki/[category]`)

- Breadcrumbs + category title + description + article count
- Articles as clean rows (Notion-database style), not cards
- Each row: title, summary (1 line), evidence rating badge, view count
- Subtle divider lines between articles
- Sorted by popularity (default)

### Article Page (`/wiki/[category]/[slug]`)

- Max content width ~680px (Notion/Medium reading width)
- Sticky TOC sidebar (right), cleaner styled
- Reading progress bar (subtle line at top)
- Header: breadcrumbs, large title, meta row (author, date, evidence rating, views), tag pills
- Content: better prose — larger line-height, more section spacing, heading breathing room
- Citations: keep current hover preview behavior
- Sources section at bottom
- Related articles as simple links, not heavy cards

## Tech

- Reuse existing components where possible (SearchBar, EvidenceRating, CitationEnhancer, TableOfContents, ViewTracker)
- Restyle rather than rebuild — same data flow, new presentation
- Keep ISR (revalidate 3600), keep Supabase queries as-is
- Add reading progress bar as new lightweight client component
