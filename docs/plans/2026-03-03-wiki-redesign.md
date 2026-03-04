# Wiki Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign all wiki pages (homepage, category, article) from glassmorphism to a clean Notion-style dark aesthetic.

**Architecture:** Restyle existing components and pages — same Supabase queries, ISR, data flow. No schema changes. One new component (ReadingProgress). All styling changes, no logic changes.

**Tech Stack:** Next.js App Router, Tailwind CSS v4, Framer Motion, Supabase, existing wiki component library.

**Design tokens (consistent across all files):**
- Background: `bg-[#0A0A0B]` (pages), `bg-[#141519]` (dropdowns)
- Borders: `border-white/[0.06]` everywhere
- Subtle bg: `bg-white/[0.02]` (hover), `bg-white/[0.03]` (cards/inputs)
- Text: `text-white` (headings), `text-white/40-60` (body), `text-white/20-30` (muted)
- Corners: `rounded-lg` (not `rounded-xl`)
- No `backdrop-blur`, no `rgba(28,31,39,*)`, no `shadow-[0_4px_30px_*]`

---

### Task 0: Verify @tailwindcss/typography plugin

**Files:**
- Check: `package.json`, `app/globals.css`

**Step 1: Check if typography plugin is installed and configured**

The article page uses `prose` classes heavily. In Tailwind v4, the plugin must be loaded via `@plugin "@tailwindcss/typography"` in CSS.

Run: `grep -r "typography" package.json app/globals.css`

If missing:
```bash
npm install @tailwindcss/typography
```

Then add to `app/globals.css` after `@import "tailwindcss"`:
```css
@plugin "@tailwindcss/typography";
```

**Step 2: Verify prose classes work**

Run: Visit any article page, check that headings/paragraphs have proper styling (not raw unstyled HTML).

**Step 3: Commit (if changes were needed)**

```bash
git add package.json package-lock.json app/globals.css
git commit -m "chore: install tailwind typography plugin for prose classes"
```

---

### Task 1: Restyle Homepage — WikiHomeContent + parent page

**Files:**
- Modify: `app/(wiki-home)/wiki-home-content.tsx`
- Modify: `app/(wiki-home)/page.tsx` (remove unused `totalArticles` prop)

**Step 1: Rewrite WikiHomeContent with new design**

Replace the entire component. Key changes: remove emojis, remove footer stats, remove `totalArticles` from interface, clean Notion-style layout with color dots.

```tsx
'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { SearchBar } from '@/components/wiki/SearchBar';
import { getCategoryColor } from '@/lib/wiki/category-colors';

interface WikiHomeContentProps {
  counts: Record<string, number>;
  popularToday: ReactNode;
}

const categories = [
  { title: "Nutrition", slug: "nutrition", description: "Macronutrients, micronutrients, meal timing, and dietary strategies" },
  { title: "Exercise Science", slug: "exercise-science", description: "Scientific principles of exercise, biomechanics, and training adaptations" },
  { title: "Physiology", slug: "physiology", description: "Energy systems, muscle growth, fat loss, and recovery" },
  { title: "Training Methods", slug: "training-methods", description: "Strength training, cardio, mobility, and programming" },
  { title: "Psychology", slug: "psychology", description: "Motivation, habit formation, goal setting, and mindset" },
  { title: "Injury & Health", slug: "injury-health", description: "Injury prevention, rehabilitation, and health optimization" },
];

export function WikiHomeContent({ counts, popularToday }: WikiHomeContentProps) {
  return (
    <div className="max-w-3xl mx-auto px-6">
      {/* Hero */}
      <section className="pt-28 md:pt-40 pb-16 flex flex-col items-center text-center">
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl md:text-5xl font-bold text-white mb-2"
        >
          Carve Wiki
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="text-base text-white/40 mb-10"
        >
          Evidence-based fitness knowledge
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="w-full max-w-xl"
        >
          <SearchBar />
        </motion.div>
      </section>

      {/* Categories */}
      <section className="pb-16">
        <p className="text-xs font-medium text-white/30 mb-4">Browse by topic</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {categories.map((category, i) => {
            const colors = getCategoryColor(category.slug);
            return (
              <motion.div
                key={category.slug}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 + i * 0.05 }}
              >
                <Link
                  href={`/wiki/${category.slug}`}
                  className="group flex items-start gap-3 rounded-lg p-4 bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] transition-colors"
                >
                  <span
                    className="mt-1.5 w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: colors.hex }}
                  />
                  <div className="min-w-0">
                    <div className="flex items-baseline gap-2">
                      <h3 className="text-sm font-medium text-white group-hover:text-white/90">
                        {category.title}
                      </h3>
                      <span className="text-xs text-white/20">
                        {counts[category.slug] || 0}
                      </span>
                    </div>
                    <p className="text-xs text-white/30 mt-0.5 line-clamp-1">
                      {category.description}
                    </p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Trending */}
      <section className="pb-20">
        <p className="text-xs font-medium text-white/30 mb-4">Trending today</p>
        {popularToday}
      </section>
    </div>
  );
}
```

**Step 2: Update parent page to remove totalArticles**

In `app/(wiki-home)/page.tsx`, remove the `totalArticles` computation and prop:

```tsx
export default async function WikiPage() {
  const counts = await getCategoryCounts();

  return (
    <WikiHomeContent
      counts={counts}
      popularToday={<PopularToday />}
    />
  );
}
```

**Step 3: Verify homepage**

Run: Visit `http://localhost:3000`
Expected: Clean hero, category grid with color dots, no emojis, no footer stats

**Step 4: Commit**

```bash
git add app/(wiki-home)/wiki-home-content.tsx app/(wiki-home)/page.tsx
git commit -m "redesign: clean Notion-style wiki homepage"
```

---

### Task 2: Restyle PopularToday component

**Files:**
- Modify: `components/wiki/PopularToday.tsx`

**Step 1: Restyle PopularToday to match clean design**

Replace the glassmorphism card with a simple list. Keep the Supabase query logic identical. Change only the JSX return. Use `replace(/-/g, ' ')` (regex) for category names:

```tsx
// Keep all imports and data fetching logic identical
// Only change the return JSX to:

return (
  <div className="divide-y divide-white/[0.06]">
    {articles.map((article: any, index: number) => {
      const colors = getCategoryColor(article.category);
      return (
        <Link
          key={article.slug}
          href={`/wiki/${article.category}/${article.slug}`}
          className="group flex items-center gap-4 py-3 hover:bg-white/[0.02] -mx-2 px-2 rounded-lg transition-colors"
        >
          <span className="text-xs font-medium text-white/20 w-5 text-right">
            {index + 1}
          </span>
          <div className="min-w-0 flex-1">
            <span className="text-sm text-white group-hover:text-white/90">
              {article.title}
            </span>
          </div>
          <span className={`text-xs ${colors.text}`}>
            {article.category.replace(/-/g, ' ')}
          </span>
        </Link>
      );
    })}
  </div>
);
```

Remove: outer card wrapper, "Populair Vandaag" header, TrendingUp icon, rank badges, view counts, "Bekijk alle artikelen" footer.

**Step 2: Commit**

```bash
git add components/wiki/PopularToday.tsx
git commit -m "redesign: clean trending list without card wrapper"
```

---

### Task 3: Restyle Category Page

**Files:**
- Modify: `app/wiki/[category]/page.tsx`

**Step 1: Rewrite category page with Notion-database rows**

Replace card-based layout with clean rows. Remove emojis from VALID_CATEGORIES. Remove ScrollReveal import. Add EvidenceRating import. Keep all data fetching identical.

```tsx
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getCategoryColor } from '@/lib/wiki/category-colors';
import { EvidenceRating } from '@/components/wiki/EvidenceRating';
import { Eye } from 'lucide-react';

const VALID_CATEGORIES: Record<string, { title: string; description: string }> = {
  'nutrition': {
    title: 'Nutrition',
    description: 'Evidence-based articles about macronutrients, micronutrients, meal timing, and dietary strategies',
  },
  'exercise-science': {
    title: 'Exercise Science',
    description: 'Scientific principles of exercise, biomechanics, and training adaptations',
  },
  'physiology': {
    title: 'Physiology',
    description: 'How your body works: energy systems, muscle growth, fat loss, and recovery',
  },
  'training-methods': {
    title: 'Training Methods',
    description: 'Practical training approaches: strength training, cardio, mobility, and programming',
  },
  'psychology': {
    title: 'Psychology',
    description: 'Mental aspects of fitness: motivation, habit formation, goal setting, and mindset',
  },
  'injury-health': {
    title: 'Injury & Health',
    description: 'Injury prevention, rehabilitation, common issues, and health optimization',
  },
};

interface PageProps {
  params: Promise<{ category: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { category } = await params;
  const cat = VALID_CATEGORIES[category];
  if (!cat) return { title: 'Category Not Found' };
  return {
    title: `${cat.title} | Carve Wiki`,
    description: cat.description,
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { category } = await params;
  const cat = VALID_CATEGORIES[category];
  if (!cat) notFound();

  const colors = getCategoryColor(category);

  const supabase = await createClient();
  const { data: articles } = await supabase
    .from('wiki_articles')
    .select('slug, title, summary, evidence_rating, view_count, updated_at, tags')
    .eq('category', category)
    .eq('is_published', true)
    .order('view_count', { ascending: false });

  return (
    <div className="min-h-screen bg-[#0A0A0B]">
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Breadcrumbs */}
        <nav className="mb-8 text-sm text-white/30">
          <Link href="/" className="hover:text-white/50 transition-colors">Wiki</Link>
          <span className="mx-2">/</span>
          <span className="text-white/60">{cat.title}</span>
        </nav>

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colors.hex }} />
            <h1 className="text-2xl font-bold text-white">{cat.title}</h1>
          </div>
          <p className="text-sm text-white/40 mb-1">{cat.description}</p>
          <p className="text-xs text-white/20">{articles?.length || 0} articles</p>
        </div>

        {/* Articles */}
        {articles && articles.length > 0 ? (
          <div className="divide-y divide-white/[0.06]">
            {articles.map((article) => (
              <Link
                key={article.slug}
                href={`/wiki/${category}/${article.slug}`}
                className="group block py-4 hover:bg-white/[0.02] -mx-3 px-3 rounded-lg transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h2 className="text-base font-medium text-white group-hover:text-white/90 mb-1">
                      {article.title}
                    </h2>
                    {article.summary && (
                      <p className="text-sm text-white/35 line-clamp-1">{article.summary}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 shrink-0 mt-1">
                    <EvidenceRating rating={article.evidence_rating} />
                    <span className="flex items-center gap-1 text-xs text-white/20">
                      <Eye className="w-3 h-3" />
                      {article.view_count}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="text-white/30">No articles yet in this category.</p>
            <Link href="/" className="mt-3 inline-block text-sm text-white/40 hover:text-white/60">
              Back to Wiki
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export const revalidate = 3600;
```

**Step 2: Commit**

```bash
git add app/wiki/[category]/page.tsx
git commit -m "redesign: Notion-style category page with clean rows"
```

---

### Task 4: Create ReadingProgress component

**Files:**
- Create: `components/wiki/ReadingProgress.tsx`

**Step 1: Create the reading progress bar**

Use `z-[51]` to stack above the header (which is `z-50`):

```tsx
'use client';

import { useEffect, useState } from 'react';

interface ReadingProgressProps {
  color?: string;
}

export function ReadingProgress({ color = '#3b82f6' }: ReadingProgressProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function handleScroll() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0);
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-[51] h-0.5 bg-transparent">
      <div
        className="h-full transition-[width] duration-150 ease-out"
        style={{ width: `${progress}%`, backgroundColor: color }}
      />
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add components/wiki/ReadingProgress.tsx
git commit -m "feat: add reading progress bar component"
```

---

### Task 5: Restyle EvidenceRating component

**Files:**
- Modify: `components/wiki/EvidenceRating.tsx`

**Step 1: Remove glassmorphism from tooltip**

Keep the rating configs and badge styling. Update the tooltip to use flat design:

- Tooltip container: replace `bg-[rgba(28,31,39,0.95)] backdrop-blur-xl border border-white/[0.08] shadow-[0_4px_30px_rgba(0,0,0,0.5)]` with `bg-[#141519] border border-white/[0.06]`
- Tooltip caret: replace `border-t-[rgba(28,31,39,0.95)]` with `border-t-[#141519]`

**Step 2: Commit**

```bash
git add components/wiki/EvidenceRating.tsx
git commit -m "redesign: flat tooltip on evidence rating badge"
```

---

### Task 6: Restyle ArticleLayout

**Files:**
- Modify: `components/wiki/ArticleLayout.tsx`

**Step 1: Rewrite ArticleLayout with clean Notion-style design**

Keep interfaces identical. Use `replace(/-/g, ' ')` for breadcrumb category. Import ReadingProgress. Change grid to flexbox with `max-w-[680px]` content width.

```tsx
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { getCategoryColor } from '@/lib/wiki/category-colors';
import { EvidenceRating } from './EvidenceRating';
import { TableOfContents } from './TableOfContents';
import { SourcesList } from './SourcesList';
import { RelatedArticles } from './RelatedArticles';
import { CitationEnhancer } from './CitationEnhancer';
import { ExpertReviewBadge } from './ExpertReviewBadge';
import { UpdateAlert } from './UpdateAlert';
import { ReadingProgress } from './ReadingProgress';

// Keep Article, Citation, ArticleLayoutProps interfaces identical

export function ArticleLayout({ article, citations, html, category }: ArticleLayoutProps) {
  const updatedDate = new Date(article.updated_at);
  const timeAgo = formatDistanceToNow(updatedDate, { addSuffix: true });
  const colors = getCategoryColor(category);

  return (
    <div className="min-h-screen bg-[#0A0A0B]">
      <ReadingProgress color={colors.hex} />

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Breadcrumbs */}
        <nav className="mb-8 text-sm text-white/30">
          <Link href="/" className="hover:text-white/50 transition-colors">Wiki</Link>
          <span className="mx-2">/</span>
          <Link href={`/wiki/${category}`} className="hover:text-white/50 transition-colors capitalize">
            {category.replace(/-/g, ' ')}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-white/60">{article.title}</span>
        </nav>

        <div className="flex gap-16">
          {/* Main Content */}
          <article className="min-w-0 flex-1 max-w-[680px]">
            {/* Header */}
            <header className="mb-10">
              <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-4">
                {article.title}
              </h1>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-white/30 mb-4">
                <EvidenceRating rating={article.evidence_rating} />
                <span>By {article.author}</span>
                <span>Updated {timeAgo}</span>
                <span>{article.view_count.toLocaleString()} views</span>
              </div>

              {article.tags && article.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-0.5 bg-white/[0.03] border border-white/[0.06] text-white/40 rounded-full text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </header>

            {article.needs_update && <UpdateAlert />}

            {article.reviewers && article.reviewers.length > 0 && (
              <div className="mb-8">
                <ExpertReviewBadge reviewers={article.reviewers} />
              </div>
            )}

            {/* Summary */}
            {article.summary && (
              <div className="mb-10 py-4 border-l-2 pl-5" style={{ borderLeftColor: colors.hex }}>
                <p className="text-white/50 leading-relaxed">{article.summary}</p>
              </div>
            )}

            {/* Content */}
            <div
              className="prose prose-invert max-w-none
                prose-headings:text-white prose-headings:font-semibold
                prose-h2:text-xl prose-h2:mt-12 prose-h2:mb-4 prose-h2:pb-2 prose-h2:border-b prose-h2:border-white/[0.06]
                prose-h3:text-lg prose-h3:mt-8 prose-h3:mb-3
                prose-p:text-white/60 prose-p:leading-[1.8] prose-p:mb-5
                prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
                prose-strong:text-white/80 prose-strong:font-medium
                prose-ul:my-4 prose-ol:my-4
                prose-li:text-white/60 prose-li:leading-[1.8]
                prose-code:text-sm prose-code:bg-white/[0.04] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:border prose-code:border-white/[0.06]
                prose-pre:bg-white/[0.02] prose-pre:border prose-pre:border-white/[0.06]"
              dangerouslySetInnerHTML={{ __html: html }}
            />

            <CitationEnhancer citations={citations} />

            {/* Sources */}
            {citations.length > 0 && (
              <div className="mt-16 pt-8 border-t border-white/[0.06]">
                <h2 className="text-lg font-semibold text-white mb-6">Sources</h2>
                <SourcesList citations={citations} />
              </div>
            )}

            {/* Related Articles */}
            <div className="mt-12 pt-8 border-t border-white/[0.06]">
              <RelatedArticles currentSlug={article.slug} category={category} />
            </div>
          </article>

          {/* Sidebar TOC */}
          <aside className="hidden lg:block w-56 shrink-0">
            <div className="sticky top-12">
              <TableOfContents html={html} category={category} />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add components/wiki/ArticleLayout.tsx
git commit -m "redesign: Notion-style article layout with reading progress"
```

---

### Task 7: Restyle TableOfContents

**Files:**
- Modify: `components/wiki/TableOfContents.tsx`

**Step 1: Restyle TOC to minimal design**

Keep all hook logic (IntersectionObserver, heading parsing) identical. Change only the JSX styling:

- Remove outer card: no `bg-[rgba(28,31,39,0.5)] backdrop-blur-xl border rounded-xl p-6`
- Section label: `text-xs font-medium text-white/25 mb-3` (not uppercase tracking)
- Links: `text-xs text-white/30 hover:text-white/60 transition-colors`
- Active link: `text-white/80 font-medium` with left border using category color
- Reduce padding, Notion-style outline feel

**Step 2: Commit**

```bash
git add components/wiki/TableOfContents.tsx
git commit -m "redesign: minimal TOC without card wrapper"
```

---

### Task 8: Restyle RelatedArticles

**Files:**
- Modify: `components/wiki/RelatedArticles.tsx`

**Step 1: Restyle to simple links**

Keep Supabase query identical. Replace glassmorphism cards with plain list:

```tsx
// Return JSX becomes:
return (
  <div>
    <h2 className="text-lg font-semibold text-white mb-4">Related</h2>
    <div className="space-y-2">
      {articles.map((article: any) => (
        <Link
          key={article.slug}
          href={`/wiki/${category}/${article.slug}`}
          className="group block py-2 hover:bg-white/[0.02] -mx-2 px-2 rounded-lg transition-colors"
        >
          <span className="text-sm text-white/50 group-hover:text-white/70">{article.title}</span>
          {article.summary && (
            <p className="text-xs text-white/25 line-clamp-1 mt-0.5">{article.summary}</p>
          )}
        </Link>
      ))}
    </div>
  </div>
);
```

**Step 2: Commit**

```bash
git add components/wiki/RelatedArticles.tsx
git commit -m "redesign: simple related articles list"
```

---

### Task 9: Restyle SearchBar (both variants)

**Files:**
- Modify: `components/wiki/SearchBar.tsx`

**Step 1: Update SearchBar styling for both hero and header variants**

Keep all logic (debounce, keyboard nav, Supabase RPC) identical. Change only styling classes:

**Hero variant (wiki homepage):**
- Input: `bg-white/[0.03] rounded-lg border border-white/[0.06]` (replace glassmorphism)
- Focus: `focus:border-white/20`

**Header variant (app header):**
- Input: same token swap — `bg-white/[0.03] rounded-lg border border-white/[0.06]`

**Dropdown (both variants):**
- Container: `bg-[#141519] rounded-lg border border-white/[0.06]` (no backdrop-blur, no shadow)
- Selected row: `bg-white/[0.04]`

Keep all result rendering, highlight, keyboard nav logic untouched.

**Step 2: Commit**

```bash
git add components/wiki/SearchBar.tsx
git commit -m "redesign: clean search bar without glassmorphism"
```

---

### Task 10: Restyle CitationEnhancer tooltip

**Files:**
- Modify: `components/wiki/CitationEnhancer.tsx`

**Step 1: Update DOM-injected tooltip HTML**

This component injects tooltip HTML directly into the DOM. Find the `innerHTML` assignment and replace glassmorphism classes:

- Replace `bg-[rgba(28,31,39,0.95)] backdrop-blur-xl border border-white/[0.08] shadow-[0_4px_30px_rgba(0,0,0,0.5)]`
- With `bg-[#141519] border border-white/[0.06]`

**Step 2: Commit**

```bash
git add components/wiki/CitationEnhancer.tsx
git commit -m "redesign: flat citation tooltips"
```

---

### Task 11: Final visual QA pass

**Step 1: Check all pages**

Visit each page and verify:
- `http://localhost:3000` — homepage
- `http://localhost:3000/wiki/nutrition` — category page
- `http://localhost:3000/wiki/nutrition/protein` — article page (or any published article)

**Checklist:**
- [ ] No remaining glassmorphism (`backdrop-blur`, `rgba(28,31,39,*)`)
- [ ] All borders use `white/[0.06]` consistently
- [ ] All corners use `rounded-lg` (not `rounded-xl`)
- [ ] Reading progress bar visible and colored per category
- [ ] Search works (type, results, keyboard nav) in both hero and header variants
- [ ] TOC highlights active section on scroll
- [ ] Citation hover previews show flat tooltip
- [ ] EvidenceRating tooltip shows flat tooltip
- [ ] ExpertReviewBadge and UpdateAlert look acceptable (change `rounded-xl` to `rounded-lg` if needed)
- [ ] No emojis anywhere in wiki pages
- [ ] Mobile: article page hides TOC, category page rows stack properly

**Step 2: Commit any remaining tweaks**

```bash
git add -A
git commit -m "redesign: final QA tweaks"
```
