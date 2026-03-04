# Wiki Light Redesign — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Convert all wiki pages (homepage, category listing, article) from dark to light theme with AI hero images, article thumbnails, and a modern card-based layout.

**Architecture:** Replace hardcoded dark classes across ~13 wiki components with a light color system (#f5f5f7 bg, dark text). Add hero image sections to homepage, category, and article pages. Add `image_url` column to DB. Header stays dark; only wiki routes change.

**Tech Stack:** Next.js App Router, Tailwind CSS v4, Supabase, framer-motion

> **IMPORTANT — Task coupling:** Tasks 3, 7, and 8 are tightly coupled. Task 3 changes the outer layout to light, Tasks 7 and 8 change the inner page wrappers. Between Task 3 and Tasks 7/8, article and category pages will be broken (dark inner wrapper on light outer). **Ship Tasks 3-10 together as one atomic release.**

---

### Task 1: Database — Add image_url column

**Files:**
- Supabase migration (run via SQL)

**Step 1: Add column to wiki_articles**

```sql
ALTER TABLE wiki_articles ADD COLUMN image_url TEXT;
```

Run via Supabase dashboard or CLI. No default value needed — null means "use fallback gradient."

**Step 2: Commit**

```bash
git add -A && git commit -m "docs: add wiki light redesign plan"
```

> Note: DB migration is external. The code handles null `image_url` with gradient fallbacks.

---

### Task 2: Configure next.config.ts for external images

**Files:**
- Modify: `next.config.ts`

**Why:** `next/image` will throw a runtime error for any `<Image>` with an external `src` (Supabase Storage URLs) unless `remotePatterns` is configured. Without this, every article thumbnail and hero image from the DB will fail.

**Step 1: Add remotePatterns config**

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.in',
      },
    ],
  },
};

export default nextConfig;
```

> Adjust hostnames if images are hosted elsewhere. This covers Supabase Storage URLs.

**Step 2: Commit**

```bash
git add next.config.ts
git commit -m "feat(wiki): configure next/image remote patterns for Supabase Storage"
```

---

### Task 3: Update category-colors.ts — Add light mode variants

**Files:**
- Modify: `lib/wiki/category-colors.ts`

**Step 1: Add light-mode text and bg classes to each category**

Add these properties to each category entry:

```ts
textLight: 'text-emerald-600',   // for Nutrition
bgLight: 'bg-emerald-50',        // light badge background
borderLight: 'border-emerald-200',
```

Full mapping:

| Category | textLight | bgLight | borderLight |
|----------|-----------|---------|-------------|
| Nutrition | `text-emerald-600` | `bg-emerald-50` | `border-emerald-200` |
| Training | `text-blue-600` | `bg-blue-50` | `border-blue-200` |
| Supplements | `text-purple-600` | `bg-purple-50` | `border-purple-200` |
| Recovery | `text-cyan-600` | `bg-cyan-50` | `border-cyan-200` |
| Mindset | `text-amber-600` | `bg-amber-50` | `border-amber-200` |
| Money | `text-green-600` | `bg-green-50` | `border-green-200` |
| Travel | `text-rose-600` | `bg-rose-50` | `border-rose-200` |

**Step 2: Commit**

```bash
git add lib/wiki/category-colors.ts
git commit -m "feat(wiki): add light mode color variants to category colors"
```

---

### Task 4: Add readTime utility

**Files:**
- Create: `lib/wiki/read-time.ts`

**Why:** Multiple components (article cards, article hero) need reading time. Currently hardcoded nowhere. Compute from content length.

**Step 1: Create utility**

```ts
/**
 * Estimate reading time from HTML content.
 * Average reading speed: ~200 words per minute.
 */
export function estimateReadTime(html: string): number {
  const text = html.replace(/<[^>]*>/g, '');
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}
```

**Step 2: Commit**

```bash
git add lib/wiki/read-time.ts
git commit -m "feat(wiki): add reading time estimation utility"
```

---

### Task 5: Layout wrapper — Light background for wiki routes

**Files:**
- Modify: `components/app/layout-wrapper.tsx:79-98`
- Modify: `app/(wiki-home)/layout.tsx`

**Step 1: Update layout-wrapper.tsx wiki route block**

Change the wiki route section (line 81) from:

```tsx
<div className="min-h-screen bg-[#0A0A0B]">
```

to:

```tsx
<div className="min-h-screen bg-[#f5f5f7]">
```

**Step 2: Update wiki-home layout.tsx**

Change `app/(wiki-home)/layout.tsx` from:

```tsx
<div className="min-h-screen bg-[#0A0A0B] text-white">
```

to:

```tsx
<div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f]">
```

**Step 3: Commit**

```bash
git add components/app/layout-wrapper.tsx app/\(wiki-home\)/layout.tsx
git commit -m "feat(wiki): switch wiki routes to light background"
```

---

### Task 6: EvidenceRating — Light mode + hero variant

**Files:**
- Modify: `components/wiki/EvidenceRating.tsx`

**Why (variant):** EvidenceRating is used in two contexts: (1) on light content areas (default) and (2) inside dark hero overlays on article pages. Without a `variant` prop, the light badges will be invisible on dark hero images.

**Step 1: Add variant prop and dual config**

```tsx
interface EvidenceRatingProps {
  rating: string;
  variant?: 'default' | 'hero';
}

const ratingConfig = {
  'well-established': {
    label: 'Well-Established',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    heroColor: 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30',
    icon: '🟢',
    description: 'Strong peer-reviewed consensus with multiple meta-analyses',
  },
  'emerging-research': {
    label: 'Emerging Research',
    color: 'bg-amber-50 text-amber-700 border-amber-200',
    heroColor: 'bg-amber-500/20 text-amber-200 border-amber-400/30',
    icon: '🟡',
    description: 'Promising research findings that need more replication studies',
  },
  'expert-consensus': {
    label: 'Expert Consensus',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    heroColor: 'bg-blue-500/20 text-blue-200 border-blue-400/30',
    icon: '🔵',
    description: 'Based on practitioner experience with limited research',
  },
};

export function EvidenceRating({ rating, variant = 'default' }: EvidenceRatingProps) {
  const config = ratingConfig[rating as keyof typeof ratingConfig] || ratingConfig['expert-consensus'];
  const colorClass = variant === 'hero' ? config.heroColor : config.color;
  // ...rest of component using colorClass
```

**Step 2: Update tooltip to light styling (default variant)**

```tsx
<div className="bg-white border border-gray-200 text-gray-900 text-xs rounded-lg px-3 py-2 shadow-lg whitespace-nowrap">
  {config.description}
  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
    <div className="border-4 border-transparent border-t-white"></div>
  </div>
</div>
```

For hero variant, keep dark tooltip:
```tsx
{variant === 'hero' ? (
  <div className="bg-gray-900 border border-gray-700 text-white text-xs rounded-lg px-3 py-2 shadow-lg whitespace-nowrap">
    ...
  </div>
) : (
  <div className="bg-white border border-gray-200 text-gray-900 text-xs rounded-lg px-3 py-2 shadow-lg whitespace-nowrap">
    ...
  </div>
)}
```

**Step 3: Commit**

```bash
git add components/wiki/EvidenceRating.tsx
git commit -m "feat(wiki): evidence rating with light mode + hero variant"
```

---

### Task 7: SearchBar — Light hero variant + light dropdown

**Files:**
- Modify: `components/wiki/SearchBar.tsx`

> **IMPORTANT — Variant scoping:** The header variant input lives inside the dark `AppHeader`. Only the dropdown should become light for header variant. The input itself must keep dark-compatible styling. The hero variant input gets new white/glass styling since it sits on the hero image overlay.

**Step 1: Update hero variant input styling**

```tsx
isHeader
  ? "pl-9 pr-8 py-1.5 text-sm bg-white/[0.03] border-white/[0.06] text-white placeholder:text-white/30"  // KEEP dark — lives in dark header
  : "pl-12 pr-12 py-4 text-lg bg-white/90 backdrop-blur-sm border-white/20 text-gray-900 placeholder:text-gray-400 rounded-xl shadow-lg"  // NEW light — on hero image
```

**Step 2: Update hero variant icon/clear colors**

Only change icon/clear colors for hero variant:
```tsx
// Icon
<Search className={cn(
  "absolute top-1/2 -translate-y-1/2",
  isHeader ? "left-3 w-3.5 h-3.5 text-white/30" : "left-4 w-5 h-5 text-gray-400"  // header stays white
)} />

// Clear button
<button className={cn(
  "absolute top-1/2 -translate-y-1/2 rounded-full transition-colors",
  isHeader ? "right-2 p-0.5 hover:bg-white/[0.08]" : "right-4 p-1 hover:bg-gray-200"  // header stays dark hover
)} />
<X className={cn(
  isHeader ? "w-3.5 h-3.5 text-white/30" : "w-5 h-5 text-gray-400"
)} />
```

**Step 3: Update dropdown to light styling (BOTH variants)**

Both hero and header dropdowns render as popovers on the page, so both should be light:

```tsx
// Dropdown container — both variants
"absolute top-full mt-2 bg-white rounded-xl border border-gray-200 shadow-xl"
```

Update all dropdown interior colors:
- `text-white` → `text-gray-900`
- `text-white/40` → `text-gray-500`
- `text-white/50` → `text-gray-600`
- `text-white/30` → `text-gray-400`
- `border-white/[0.06]` → `border-gray-100`
- `bg-white/[0.04]` hover → `bg-gray-50`
- `bg-white/[0.06]` selected → `bg-gray-100`
- `bg-amber-500/30 text-white` highlight → `bg-amber-100 text-amber-900`
- `bg-white/[0.04] border border-white/[0.08] text-white/60` tags → `bg-gray-100 border border-gray-200 text-gray-600`
- Spinner and empty state text: `text-gray-500`

**Step 4: Commit**

```bash
git add components/wiki/SearchBar.tsx
git commit -m "feat(wiki): light search bar and dropdown styling"
```

---

### Task 8: Wiki Homepage — Full redesign

**Files:**
- Modify: `app/(wiki-home)/wiki-home-content.tsx` (full rewrite)
- Modify: `app/(wiki-home)/page.tsx` (add latest articles query)
- Modify: `components/wiki/PopularToday.tsx` (becomes article cards)

**Step 1: Update page.tsx to fetch latest articles**

Add a query to get latest articles with `image_url`:

```tsx
async function getLatestArticles() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('wiki_articles')
    .select('slug, title, category, summary, image_url, evidence_rating, view_count, created_at, content_html')
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(6);
  return data || [];
}
```

Update props interface and pass both `latestArticles` and `counts`:

```tsx
<WikiHomeContent
  counts={counts}
  latestArticles={latestArticles}
  popularToday={<PopularToday />}
/>
```

**Step 2: Rewrite wiki-home-content.tsx**

Updated `WikiHomeContentProps`:
```tsx
interface WikiHomeContentProps {
  counts: Record<string, number>;
  latestArticles: Array<{
    slug: string;
    title: string;
    category: string;
    summary: string | null;
    image_url: string | null;
    evidence_rating: string;
    view_count: number;
    created_at: string;
    content_html: string | null;
  }>;
  popularToday: ReactNode;
}
```

Full layout sections:

1. **Hero section**: full-width rounded image with dark gradient overlay, "Carve Wiki" title, subtitle, search bar

```tsx
<section className="relative rounded-2xl overflow-hidden mx-4 md:mx-0 h-[300px] md:h-[400px]">
  {/* Use gradient fallback if no hero image exists yet */}
  <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900" />
  {/* Uncomment when hero image is available:
  <Image src="/images/wiki-hero.jpg" alt="" fill className="object-cover" priority />
  */}
  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
  <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6">
    <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">Carve Wiki</h1>
    <p className="text-base text-white/70 mb-10">Evidence-based fitness knowledge</p>
    <div className="w-full max-w-xl">
      <SearchBar />
    </div>
  </div>
</section>
```

2. **Browse by topic**: category cards with color badges

```tsx
<section className="pb-12">
  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-4">Browse by topic</p>
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
    {categories.map((category) => {
      const colors = getCategoryColor(category.slug);
      return (
        <Link href={`/wiki/${category.slug}`}
          className="group flex items-start gap-3 rounded-xl p-4 bg-white border border-gray-200/60 shadow-sm hover:shadow-md transition-all">
          <span className="mt-1.5 w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: colors.hex }} />
          <div className="min-w-0">
            <div className="flex items-baseline gap-2">
              <h3 className="text-sm font-medium text-gray-900 group-hover:text-gray-700">{category.title}</h3>
              <span className="text-xs text-gray-400">{counts[category.slug] || 0}</span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{category.description}</p>
          </div>
        </Link>
      );
    })}
  </div>
</section>
```

3. **Latest articles**: article cards grid using `latestArticles`

Use `estimateReadTime` from `lib/wiki/read-time.ts` for the read time display.

**Article card:**
```tsx
import { estimateReadTime } from '@/lib/wiki/read-time';

// In the card:
const readTime = article.content_html ? estimateReadTime(article.content_html) : null;

<Link href={`/wiki/${article.category.toLowerCase()}/${article.slug}`}
  className="group bg-white rounded-xl border border-gray-200/60 overflow-hidden shadow-sm hover:shadow-md transition-all">
  {/* Thumbnail with gradient fallback */}
  <div className="relative h-40 bg-gradient-to-br from-gray-100 to-gray-200">
    {article.image_url && (
      <Image src={article.image_url} alt="" fill className="object-cover" />
    )}
  </div>
  <div className="p-4">
    <div className="flex items-center gap-2 mb-2">
      <span className={`text-xs font-medium ${colors.textLight}`}>{article.category}</span>
      {readTime && (
        <>
          <span className="text-xs text-gray-400">·</span>
          <span className="text-xs text-gray-400">{readTime} min read</span>
        </>
      )}
    </div>
    <h3 className="font-semibold text-gray-900 group-hover:text-gray-700 mb-1 line-clamp-2">{article.title}</h3>
    {article.summary && (
      <p className="text-sm text-gray-500 line-clamp-2">{article.summary}</p>
    )}
  </div>
</Link>
```

**Step 3: Update PopularToday.tsx to light card format**

Convert from dark list to light card grid. Each card: thumbnail, category badge, title, view count. Same card pattern as above.

**Step 4: Commit**

```bash
git add app/\(wiki-home\)/page.tsx app/\(wiki-home\)/wiki-home-content.tsx components/wiki/PopularToday.tsx lib/wiki/read-time.ts
git commit -m "feat(wiki): redesign homepage with hero image, category cards, article grid"
```

---

### Task 9: ArticleLayout — Hero image + light prose

**Files:**
- Modify: `components/wiki/ArticleLayout.tsx` (major restyle)
- Modify: `app/wiki/[category]/[slug]/page.tsx` (pass `image_url`)

**Step 1: Update Article interface in ArticleLayout.tsx**

```ts
interface Article {
  slug: string;
  title: string;
  category: string;
  tags: string[];
  evidence_rating: string;
  author: string;
  reviewers?: string[];
  summary: string;
  view_count: number;
  needs_update?: boolean;
  created_at: string;
  updated_at: string;
  content_html: string;
  image_url?: string | null;
}
```

**Step 2: Remove dark outer wrapper**

Remove `<div className="min-h-screen bg-[#0A0A0B]">` (line 51). Replace with:
```tsx
<div>
```

The light bg comes from the layout wrapper.

**Step 3: Add hero section**

```tsx
import Image from 'next/image';
import { estimateReadTime } from '@/lib/wiki/read-time';

// Inside component:
const readTime = estimateReadTime(html);

<div className="relative h-[350px] md:h-[450px] rounded-2xl overflow-hidden mx-4 md:mx-6 mt-4">
  {article.image_url ? (
    <Image src={article.image_url} alt="" fill className="object-cover" />
  ) : (
    <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300" />
  )}
  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
  <div className="relative z-10 flex flex-col justify-end h-full p-6 md:p-10">
    <div className="flex items-center gap-3 mb-3">
      <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/20 backdrop-blur-sm text-white border border-white/20 capitalize">
        {category.replace(/-/g, ' ')}
      </span>
      <span className="text-sm text-white/70">{readTime} min read</span>
    </div>
    <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-3">
      {article.title}
    </h1>
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-white/60">
      <EvidenceRating rating={article.evidence_rating} variant="hero" />
      <span>By {article.author}</span>
      <span>Updated {timeAgo}</span>
      <span>{article.view_count.toLocaleString()} views</span>
    </div>
  </div>
</div>
```

**Step 4: Restyle content area to light prose**

Replace `prose prose-invert` and all `text-white/*` classes:

```tsx
{/* Breadcrumbs */}
<nav className="mb-8 text-sm text-gray-400">
  <Link href="/" className="hover:text-gray-600 transition-colors">Wiki</Link>
  <span className="mx-2">/</span>
  <Link href={`/wiki/${category}`} className="hover:text-gray-600 transition-colors capitalize">{category.replace(/-/g, ' ')}</Link>
  <span className="mx-2">/</span>
  <span className="text-gray-600">{article.title}</span>
</nav>

{/* Tags */}
<span className="px-2.5 py-0.5 bg-gray-100 border border-gray-200 text-gray-500 rounded-full text-xs">{tag}</span>

{/* Summary */}
<div className="mb-10 py-4 border-l-2 pl-5" style={{ borderLeftColor: colors.hex }}>
  <p className="text-gray-500 leading-relaxed">{article.summary}</p>
</div>

{/* Prose */}
<div className="prose max-w-none
  prose-headings:text-gray-900 prose-headings:font-semibold
  prose-h2:text-xl prose-h2:mt-12 prose-h2:mb-4 prose-h2:pb-2 prose-h2:border-b prose-h2:border-gray-200
  prose-h3:text-lg prose-h3:mt-8 prose-h3:mb-3
  prose-p:text-gray-600 prose-p:leading-[1.8] prose-p:mb-5
  prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
  prose-strong:text-gray-800 prose-strong:font-medium
  prose-ul:my-4 prose-ol:my-4
  prose-li:text-gray-600 prose-li:leading-[1.8]
  prose-code:text-sm prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:border prose-code:border-gray-200
  prose-pre:bg-gray-50 prose-pre:border prose-pre:border-gray-200"
  dangerouslySetInnerHTML={{ __html: html }}
/>

{/* Sources divider */}
<div className="mt-16 pt-8 border-t border-gray-200">
  <h2 className="text-lg font-semibold text-gray-900 mb-6">Sources</h2>
  ...
</div>

{/* Related divider */}
<div className="mt-12 pt-8 border-t border-gray-200">
  ...
</div>
```

**Step 5: Commit**

```bash
git add components/wiki/ArticleLayout.tsx app/wiki/\[category\]/\[slug\]/page.tsx
git commit -m "feat(wiki): article page hero image and light prose styling"
```

---

### Task 10: Category page — Hero image + article cards grid

**Files:**
- Modify: `app/wiki/[category]/page.tsx`

**Step 1: Remove dark wrapper**

Remove the `<div className="min-h-screen bg-[#0A0A0B]">` wrapper (line 77). Replace with plain `<div>`.

**Step 2: Add category hero images mapping**

```ts
const CATEGORY_IMAGES: Record<string, string> = {
  training: '/images/wiki/category-training.jpg',
  nutrition: '/images/wiki/category-nutrition.jpg',
  supplements: '/images/wiki/category-supplements.jpg',
  recovery: '/images/wiki/category-recovery.jpg',
  mindset: '/images/wiki/category-mindset.jpg',
  money: '/images/wiki/category-money.jpg',
  travel: '/images/wiki/category-travel.jpg',
};
```

**Step 3: Add hero section with gradient fallback**

```tsx
import Image from 'next/image';

<div className="relative h-[200px] md:h-[250px] rounded-2xl overflow-hidden mx-4 md:mx-6 mt-4">
  {/* Gradient fallback — always visible behind image */}
  <div className="absolute inset-0 bg-gradient-to-br from-gray-600 to-gray-800" />
  {CATEGORY_IMAGES[category] && (
    <Image src={CATEGORY_IMAGES[category]} alt="" fill className="object-cover" />
  )}
  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
  <div className="relative z-10 flex flex-col justify-end h-full p-6 md:p-10">
    <nav className="mb-3 text-sm text-white/50">
      <Link href="/" className="hover:text-white/70 transition-colors">Wiki</Link>
      <span className="mx-2">/</span>
      <span className="text-white/80">{cat.title}</span>
    </nav>
    <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">{cat.title}</h1>
    <p className="text-sm text-white/60">{cat.description}</p>
    <p className="text-xs text-white/40 mt-1">{articles?.length || 0} articles</p>
  </div>
</div>
```

**Step 4: Convert article list to card grid**

Replace the `divide-y` list with a 3-column card grid. Add `image_url` to the select query:

```ts
.select('slug, title, summary, evidence_rating, view_count, updated_at, tags, image_url')
```

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-4 md:px-6 mt-8 pb-12">
  {articles.map((article) => (
    <Link key={article.slug} href={`/wiki/${category}/${article.slug}`}
      className="group bg-white rounded-xl border border-gray-200/60 overflow-hidden shadow-sm hover:shadow-md transition-all">
      <div className="relative h-36 bg-gradient-to-br from-gray-100 to-gray-200">
        {article.image_url && (
          <Image src={article.image_url} alt="" fill className="object-cover" />
        )}
      </div>
      <div className="p-4">
        <div className="mb-2">
          <EvidenceRating rating={article.evidence_rating} />
        </div>
        <h2 className="font-semibold text-gray-900 group-hover:text-gray-700 mb-1 line-clamp-2">
          {article.title}
        </h2>
        {article.summary && (
          <p className="text-sm text-gray-500 line-clamp-2">{article.summary}</p>
        )}
        <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
          <Eye className="w-3 h-3" />
          {article.view_count}
        </div>
      </div>
    </Link>
  ))}
</div>
```

**Step 5: Empty state — light styling**

```tsx
<div className="py-12 text-center">
  <p className="text-gray-400">No articles yet in this category.</p>
  <Link href="/" className="mt-3 inline-block text-sm text-gray-500 hover:text-gray-700">
    Back to Wiki
  </Link>
</div>
```

**Step 6: Commit**

```bash
git add app/wiki/\[category\]/page.tsx
git commit -m "feat(wiki): category page hero image and article card grid"
```

---

### Task 11: TableOfContents — Light styling

**Files:**
- Modify: `components/wiki/TableOfContents.tsx`

**Step 1: Update text colors**

```tsx
// Header
<h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
  In this article
</h3>

// Active link
'text-xs text-gray-900 font-medium border-l-2 pl-2'

// Inactive link
'text-xs text-gray-400 hover:text-gray-600 transition-colors'
```

**Step 2: Commit**

```bash
git add components/wiki/TableOfContents.tsx
git commit -m "feat(wiki): light table of contents styling"
```

---

### Task 12: Supporting components — Light styling

**Files:**
- Modify: `components/wiki/SourcesList.tsx`
- Modify: `components/wiki/RelatedArticles.tsx`
- Modify: `components/wiki/ExpertReviewBadge.tsx`
- Modify: `components/wiki/UpdateAlert.tsx`
- Modify: `components/wiki/CitationEnhancer.tsx`
- Modify: `components/wiki/Citation.tsx` ← **was missing from original plan**

**Step 1: SourcesList.tsx — Update text colors**

```tsx
className="text-sm text-gray-600 leading-relaxed"       // citation text
className="font-medium text-gray-800"                    // citation number
className="text-blue-600 hover:text-blue-500 hover:underline"  // link
```

**Step 2: RelatedArticles.tsx — Light card styling**

```tsx
<h2 className="text-lg font-semibold text-gray-900 mb-4">Related</h2>
className="group block py-2 hover:bg-gray-50 -mx-2 px-2 rounded-lg transition-colors"
className="text-sm text-gray-600 group-hover:text-gray-900"
className="text-xs text-gray-400 line-clamp-1 mt-0.5"
```

**Step 3: ExpertReviewBadge.tsx — Light blue styling**

```tsx
<div className="flex items-start gap-3 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-xl">
  <UserCheck className="w-5 h-5 text-blue-600" />
  className="font-semibold text-blue-700 text-sm mb-1"
  className="text-blue-600 text-sm"
```

**Step 4: UpdateAlert.tsx — Light amber styling**

```tsx
<div className="mb-6 p-4 bg-amber-50 border-l-4 border-amber-400 rounded-xl flex items-start gap-3">
  <AlertTriangle className="w-5 h-5 text-amber-600" />
  className="font-semibold text-amber-700 text-sm mb-1"
  className="text-amber-600 text-sm"
```

**Step 5: CitationEnhancer.tsx — Light tooltips**

Update tooltip HTML template (line 47):
```ts
tooltip.innerHTML = `
  <div class="bg-white border border-gray-200 text-gray-900 text-xs rounded-lg px-3 py-2 shadow-lg">
    <div class="font-semibold mb-1">
      ${citation.authors} ${citation.year ? `(${citation.year})` : ''}
    </div>
    <div class="text-gray-600 line-clamp-2">
      "${citation.title}"
    </div>
    <div class="text-gray-400 italic mt-1 text-[10px]">
      ${citation.publication}
    </div>
    <div class="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
      <div class="border-4 border-transparent border-t-white"></div>
    </div>
  </div>
`;
```

Update highlight flash class (line 87):
```ts
element.classList.add('bg-amber-50', 'transition-colors', 'duration-300');
setTimeout(() => {
  element.classList.remove('bg-amber-50');
}, 2000);
```

**Step 6: Citation.tsx — Light tooltip (was missing from original plan)**

Update from `bg-zinc-900` dark tooltip to light:

```tsx
<div className="bg-white border border-gray-200 text-gray-900 text-xs rounded-lg px-3 py-2 shadow-xl">
  <div className="font-semibold mb-1">
    {author} {year && `(${year})`}
  </div>
  <div className="text-gray-600 line-clamp-2">
    "{title}"
  </div>
  <div className="text-gray-400 italic mt-1 text-[10px]">
    {publication}
  </div>
  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
    <div className="border-4 border-transparent border-t-white"></div>
  </div>
</div>
```

Also update the highlight flash from `bg-yellow-100` (already light, keep as-is).

**Step 7: ReadingProgress.tsx — No changes needed**

Uses category color via prop — works on both light and dark.

**Step 8: Commit**

```bash
git add components/wiki/SourcesList.tsx components/wiki/RelatedArticles.tsx components/wiki/ExpertReviewBadge.tsx components/wiki/UpdateAlert.tsx components/wiki/CitationEnhancer.tsx components/wiki/Citation.tsx
git commit -m "feat(wiki): light styling for all supporting wiki components"
```

---

### Task 13: Add placeholder images

**Files:**
- Create: `public/images/wiki/` directory

**Step 1: Create directory**

```bash
mkdir -p public/images/wiki
```

**Step 2: About placeholder images**

All hero sections already use inline CSS gradient fallbacks for when images are missing:
- Homepage hero: `bg-gradient-to-br from-gray-700 to-gray-900`
- Category heroes: `bg-gradient-to-br from-gray-600 to-gray-800`
- Article thumbnails: `bg-gradient-to-br from-gray-100 to-gray-200`
- Article hero: `bg-gradient-to-br from-gray-200 to-gray-300`

**The layout works fully without any image files.** Real AI-generated images will be added separately:
- Homepage hero: `public/images/wiki-hero.jpg` (~1920x800)
- Category heroes: `public/images/wiki/category-{name}.jpg` (~1920x600) x7
- Article thumbnails: stored in Supabase Storage, referenced by `image_url` column

> This task is manual/external — no code changes needed. Skip commit.

---

### Task 14: Visual QA and polish

**Step 1: Run dev server**

```bash
npm run dev
```

**Step 2: Check all wiki pages**

- [ ] Homepage: hero, categories, trending cards
- [ ] Category page: hero, article grid
- [ ] Article page: hero, prose, TOC, citations, related
- [ ] Search: hero input white/glass, header input still dark, dropdown light on both
- [ ] Mobile: all pages responsive
- [ ] Dark header → light content transition is smooth
- [ ] EvidenceRating: light on content, hero variant on article hero
- [ ] Citation tooltips: light on hover
- [ ] Empty states: light text

**Step 3: Fix any remaining dark-mode artifacts**

Search for remaining dark patterns (expanded grep):
```bash
grep -rn "text-white" components/wiki/ app/\(wiki-home\)/ app/wiki/
grep -rn "bg-\[#0A0A0B\]" components/wiki/ app/\(wiki-home\)/ app/wiki/
grep -rn "bg-\[#141519\]" components/wiki/ app/\(wiki-home\)/ app/wiki/
grep -rn "prose-invert" components/wiki/ app/\(wiki-home\)/ app/wiki/
grep -rn "bg-zinc" components/wiki/
grep -rn "text-zinc" components/wiki/
grep -rn "border-t-zinc" components/wiki/
```

> Note: `text-white` hits inside hero overlay sections are expected and correct. Only flag `text-white` outside of hero/overlay contexts.

**Step 4: Final commit**

```bash
git add -A
git commit -m "fix(wiki): visual QA polish and remaining dark mode cleanup"
```
