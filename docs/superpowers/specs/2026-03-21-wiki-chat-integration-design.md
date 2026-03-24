# Wiki-Chat Integration — Design Spec

**Date:** 2026-03-21
**Status:** Approved
**Approach:** Metadata in prompt (Approach A)

---

## Problem

The coach has no awareness of the 97 wiki articles in the knowledge base. Users get advice without being able to dive deeper into topics. The wiki exists as a separate public site (`/wiki`) with no connection to the chat experience.

## Solution

Integrate the wiki into the chat as a knowledge layer. The coach references articles inline, users read them without leaving the chat interface.

Three integration surfaces:
1. **Inline article cards** in chat responses (carve mode)
2. **Full article view** in the center column (wiki mode)
3. **Wiki mode** in the sidebar for browsing by category

---

## Architecture: Mode-Based Navigation

The sidebar already uses a Perplexity-inspired mode system (`AppMode`):

```
Carve  — AI coach chat with domain apps (health, money, life)
Wiki   — Knowledge base browse + article reading
Brein  — Coach memory management (geheugen, profiel, logbook, archief)
```

Each mode controls both what the **sidebar** shows and what the **center column** renders. Wiki integration uses this existing pattern — no separate `activeArticle` / `activeCategory` state needed. The mode system handles all view transitions.

### Mode → Center Column Mapping

| Mode | Sidebar Shows | Center Column Shows |
|------|--------------|---------------------|
| `carve` | New chat, domain apps, chat history | CarveChat + ChatContextPanel |
| `wiki` | Category list with article counts | WikiCategoryView or WikiArticleView |
| `brein` | Geheugen, Profiel, Logbook, Archief | (future: memory management UI) |

### Existing Types

```ts
// components/chat/types.ts
export type AppMode = 'carve' | 'wiki' | 'brein'
export type AppId = 'home' | 'health' | 'money' | 'life' | 'inbox' | 'brein'
```

---

## 1. Data & Schema

### 1.1 Migration: Add `type` column

```sql
ALTER TABLE wiki_articles
ADD COLUMN type TEXT NOT NULL DEFAULT 'ai'
CHECK (type IN ('ai', 'reviewed', 'original'));
```

All 97 existing articles default to `'ai'`. Promote to `'reviewed'` after manual review, or `'original'` for hand-written articles.

**Badge mapping:**
| Type | Badge | Meaning |
|------|-------|---------|
| `ai` | `AI` | AI-generated, not verified |
| `reviewed` | `Verified` | AI-basis, fact-checked by human |
| `original` | `Written by Carve` | Hand-written from scratch |

### 1.2 Article metadata for coach prompt

Query in `/api/carve-ai/chat/route.ts`:

```ts
const { data: articles } = await supabase
  .from('wiki_articles')
  .select('slug, title, category, tags, summary')
  .eq('is_published', true)
  .order('view_count', { ascending: false })
```

Formatted as text block in the system prompt context:

```
WIKI KENNISBANK — Je hebt toegang tot deze artikelen. Verwijs met [[slug]] als
een onderwerp relevant is voor het gesprek. Verwijs alleen als het echt waarde
toevoegt, niet bij elk antwoord. Maximaal 1-2 referenties per antwoord.

- [[protein]] Protein (Nutrition) — Eiwitinname voor spiermassa
- [[bcaa]] BCAAs (Supplements) — Wanneer zinvol?
...
```

~2000 tokens for 97 articles. Acceptable. Revisit when approaching 200+ articles.

### 1.3 `useWikiArticle(slug)` hook

Client-side hook for fetching a full article on click:

```ts
function useWikiArticle(slug: string | null) {
  // Fetches wiki_articles (including content_html) + wiki_citations for the given slug
  // Caches results in a useRef(new Map()) so repeated opens don't re-fetch
  // Returns { article, citations, loading, error }
}
```

Fetches `content_html` (pre-rendered), NOT `content_markdown` — the markdown parser is server-only (Node.js).

### 1.4 `useWikiMetadata()` hook

Fetches the compact article list (slug, title, category, summary, evidence_rating, type) once on chat mount. Provides metadata to ChatBubble components for rendering article cards without additional queries.

Wrapped in a `WikiMetadataProvider` context around the chat.

### 1.5 `useWikiCategories()` hook

Fetches category names with article counts for the wiki sidebar. Derived from the same metadata query or a separate grouped query:

```ts
function useWikiCategories() {
  // Returns { categories: { name: string, count: number }[], loading: boolean }
  // Grouped from wiki_articles where is_published = true
}
```

---

## 2. Coach Integration & Response Parsing

### 2.1 Sending article metadata to edge function

The API route adds `wikiArticles` to the context payload:

```ts
const payload = {
  messages,
  context: {
    ...coachContext,
    ...moneyContext,
    wikiArticles: formatArticlesForPrompt(articles)
  }
}
```

The edge function injects this into the system prompt alongside existing health/money context.

### 2.2 Coach referencing instruction

Added to the system prompt:

```
WIKI REFERENTIES
Je hebt een kennisbank. Als een onderwerp dieper behandeld wordt in een artikel,
verwijs er dan naar met [[slug]]. Doe dit subtiel — maximaal 1-2 referenties per
antwoord. Alleen als het echt relevant is. Verwijs NIET als:
- Het antwoord al compleet is zonder het artikel
- Het onderwerp te ver afstaat van het artikel
- Je al eerder naar hetzelfde artikel hebt verwezen in dit gesprek
```

### 2.3 Response parsing

The coach response contains `[[slug]]` references. A new `ChatMessage` wrapper component handles parsing (keeps `ChatBubble` as a pure text renderer):

1. Extracts all complete `[[slug]]` patterns from the message text
2. Validates each slug exists in the `WikiMetadataProvider` context (unknown slugs are silently removed)
3. Removes matched `[[slug]]` from the rendered text, passes clean text to `ChatBubble`
4. Renders `ArticleReferenceCard` components below the bubble

**Streaming behavior:** During streaming (`status !== 'ready'`), `[[slug]]` references are not parsed — partial patterns like `[[prot` would break. Article cards appear only after the message stream completes. The brief "pop" of cards appearing is a natural micro-animation.

```
Raw: "Je hebt 140-170g eiwit per dag nodig. [[protein]]"

Rendered:
"Je hebt 140-170g eiwit per dag nodig."

┌─────────────────────────────────────┐
│ Protein                             │
│ Eiwitinname voor spiermassa         │
│ Nutrition · Well-established · 3 min│
└─────────────────────────────────────┘
```

### 2.4 `ArticleReferenceCard` component

Compact, clickable card rendered inside chat bubbles:
- Title (bold)
- Summary (one line, truncated)
- Category pill + evidence rating badge + estimated reading time
- Type badge (AI / Verified / Original) — subtle, secondary
- On click: calls `onArticleClick(slug)` → switches to wiki mode + opens article

Styling: subtle border, `bg-white/[0.05]`, rounded, hover state. Consistent with existing ContextCard primitive.

---

## 3. Wiki Mode — Center Column

### 3.1 State management in ChatLayout

Wiki mode uses two new states for what the center column shows:

```tsx
// New state in ChatLayout
const [wikiArticleSlug, setWikiArticleSlug] = useState<string | null>(null)
const [wikiCategory, setWikiCategory] = useState<string | null>(null)
```

Center column rendering is driven by `activeMode`:

```tsx
{/* Carve mode: chat (always mounted, hidden when not active to preserve useChat state) */}
<div className={activeMode === 'carve' ? '' : 'hidden'}>
  <CarveChat ... onArticleClick={handleArticleClick} />
  <ChatContextPanel ... />
</div>

{/* Wiki mode: article or category view */}
{activeMode === 'wiki' && (
  wikiArticleSlug ? (
    <WikiArticleView
      slug={wikiArticleSlug}
      onBack={() => setWikiArticleSlug(null)}
      onArticleClick={setWikiArticleSlug}
    />
  ) : (
    <WikiCategoryView
      category={wikiCategory}
      onArticleClick={setWikiArticleSlug}
      onCategoryChange={setWikiCategory}
    />
  )
)}

{/* Brein mode: future */}
{activeMode === 'brein' && (
  <BreinPlaceholder />
)}
```

**Critical:** CarveChat uses `useChat` from `@ai-sdk/react` — unmounting destroys all message state. We use `className="hidden"` instead of conditional rendering so the hook stays mounted and messages, scroll position, and streaming state are preserved.

### 3.2 Article click from chat (mode transition)

When user clicks an `ArticleReferenceCard` in a chat bubble:

```ts
const handleArticleClick = useCallback((slug: string) => {
  setActiveMode('wiki')
  setWikiArticleSlug(slug)
  window.history.pushState({ mode: 'wiki', article: slug }, '')
}, [])
```

This switches to wiki mode + opens the article. CarveChat stays mounted but hidden — returning to carve mode resumes exactly where you left off.

### 3.3 Mode transitions reset wiki state

```ts
const handleModeChange = useCallback((mode: AppMode) => {
  setActiveMode(mode)
  if (mode === 'wiki') {
    // Enter wiki: show category browse (no article selected)
    setWikiArticleSlug(null)
    // Keep wikiCategory if previously set, otherwise null (shows all)
  } else if (mode === 'carve') {
    setActiveApp('home')
    setVisibleCards([])
    setSelectedConversationId(null)
    setLoadedMessages([])
    setChatResetKey(k => k + 1)
  } else if (mode === 'brein') {
    setActiveApp('brein')
    setVisibleCards(defaultCards['brein'])
    setSelectedConversationId(null)
    setLoadedMessages([])
    setChatResetKey(k => k + 1)
  }
}, [])
```

Selecting a conversation always switches back to carve mode (already implemented).

### 3.4 Browser history integration

```ts
// On article open (from chat or category view)
window.history.pushState({ mode: 'wiki', article: slug }, '')

// On category change
window.history.pushState({ mode: 'wiki', category: name }, '')

// On popstate (back button)
useEffect(() => {
  const handlePopState = (e: PopStateEvent) => {
    if (e.state?.mode === 'wiki') {
      setActiveMode('wiki')
      setWikiArticleSlug(e.state.article ?? null)
      setWikiCategory(e.state.category ?? null)
    } else {
      setActiveMode('carve')
      setWikiArticleSlug(null)
    }
  }
  window.addEventListener('popstate', handlePopState)
  return () => window.removeEventListener('popstate', handlePopState)
}, [])
```

---

## 4. Wiki Mode — Sidebar

### 4.1 Expanded mode

When `activeMode === 'wiki'`, the sidebar shows categories:

```
┌─────────────────────────┐
│ CARVE              [◀]  │
├─────────────────────────┤
│ ○ Carve                 │
│ ● Wiki        ← active  │
│ ○ Brein                 │
├─────────────────────────┤
│ All articles (97)       │  ← click: clear category filter
│ ─────────────────────── │
│ Nutrition (23)          │
│ Supplements (18)        │
│ Training (31)           │
│ Recovery (12)           │
│ Mindset (8)             │
│ ...                     │
├─────────────────────────┤
│ [Avatar] User Name      │
└─────────────────────────┘
```

Categories fetched via `useWikiCategories()`. Click on a category → `setWikiCategory(name)` → center column filters to that category.

### 4.2 Collapsed mode (icon rail)

The existing collapsed mode already renders mode icons (Flame, BookOpen, Brain). When wiki mode is active and collapsed, clicking the BookOpen icon expands the sidebar to show categories.

### 4.3 "Terug naar chat" shortcut

In wiki mode, add a subtle link at the top of the sidebar content:

```
← Terug naar chat
```

Clicking it: `setActiveMode('carve')` — returns to chat, preserving all state.

---

## 5. WikiArticleView

### 5.1 Component design

**New component** — does NOT reuse `ArticleLayout` (which is a server component with server-only dependencies). Cherry-picks compatible sub-components only.

Full-width component (takes center + context panel columns):

- **Header:** Back arrow ("← Terug") + article title
- **Type badge:** AI / Verified / Original
- **Evidence rating:** Reuses existing `EvidenceRating` component (pure, client-safe)
- **Content:** Renders `content_html` from database via `dangerouslySetInnerHTML` (pre-rendered by sync script, no client-side markdown parsing needed — `markdown-parser.ts` is Node.js only)
- **Internal links:** `[[other-slug]]` links within articles trigger `onArticleClick(slug)`
- **Table of Contents:** Reuses existing `TableOfContents` component (client-safe, uses IntersectionObserver)
- **Citations:** Reuses existing `SourcesList` / `Citation` components (pure, client-safe)
- **View tracking:** Reuses existing `ViewTracker` component (client-side fetch)
- **Loading state:** Skeleton layout while `useWikiArticle` fetches

**Not reusable** from existing wiki (server-only): `ArticleLayout`, `RelatedArticles`.

Max content width ~720px centered, with TOC on the right if space allows. Adapted for the chat shell (no public wiki header/footer, no breadcrumbs, no hero image).

### 5.2 Back navigation

- If entered from chat (article card click) → "Terug naar chat" returns to carve mode
- If entered from category browse → "Terug" returns to category view
- Browser back button works via `pushState` / `popstate`

---

## 6. WikiCategoryView

### 6.1 Component design

Center column component showing articles in a category (or all articles if no category selected):

- **Header:** Category title + article count (or "Alle artikelen" if no filter)
- **Search:** Simple text filter on title/summary (client-side, from metadata)
- **Article list:** Sorted by view_count (popular first)
- **Each article row:** Title, summary (truncated), category pill, evidence badge, type badge, reading time
- **Click** → `onArticleClick(slug)` → opens WikiArticleView

### 6.2 Data source

Uses the `WikiMetadataProvider` context — same data that's already fetched for chat article cards. No additional query needed. Filter client-side by category.

---

## 7. Component Tree

```
ChatLayout
├── ChatSidebar
│   ├── Modes (Carve / Wiki / Brein)
│   ├── [carve mode] New chat, domain apps, chat history
│   ├── [wiki mode] Category list + "Terug naar chat"  (NEW content)
│   ├── [brein mode] Geheugen, Profiel, Logbook, Archief
│   └── UserMenu
├── WikiMetadataProvider (NEW, wraps center column)
│   ├── [carve mode — always mounted, hidden when inactive]
│   │   ├── CarveChat
│   │   │   └── ChatMessage (NEW, wrapper)
│   │   │       ├── ChatBubble (existing, pure text)
│   │   │       └── ArticleReferenceCard (NEW)
│   │   └── ChatContextPanel
│   ├── [wiki mode]
│   │   ├── WikiArticleView (NEW) — if slug selected
│   │   │   ├── ArticleHeader (back + title + badges)
│   │   │   ├── ArticleContent (dangerouslySetInnerHTML from content_html)
│   │   │   ├── TableOfContents (existing, client-safe)
│   │   │   └── SourcesList (existing, client-safe)
│   │   └── WikiCategoryView (NEW) — if no slug selected
│   │       └── ArticleListItem (NEW, per article)
│   └── [brein mode]
│       └── (future)
```

## 8. New Files

```
hooks/useWikiArticle.ts            — Fetch single article (content_html) + citations, cached via useRef(Map)
hooks/useWikiMetadata.ts           — Fetch article list for cards + prompt + category browse
components/wiki/chat/
  WikiMetadataProvider.tsx          — Context provider for article metadata
  ChatMessage.tsx                  — Wrapper: parses [[slug]], renders ChatBubble + ArticleReferenceCard
  ArticleReferenceCard.tsx         — Inline card in chat bubbles
  WikiArticleView.tsx              — Full article view (new component, NOT reusing ArticleLayout)
  WikiCategoryView.tsx             — Category browse / article list
  ArticleListItem.tsx              — Article row in category/search view
```

## 9. Modified Files

```
app/api/carve-ai/chat/route.ts     — Add wiki article metadata to context payload
components/chat/ChatLayout.tsx      — Add wikiArticleSlug/wikiCategory state, mode-based center column rendering
components/chat/ChatSidebar.tsx     — Add wiki category list in wiki mode (replace placeholder)
components/dashboard/hub/chat/CarveChat.tsx — Pass onArticleClick through to ChatMessage
```

Note: `ChatBubble.tsx` stays unchanged — the new `ChatMessage` wrapper handles `[[slug]]` parsing.

## 10. Edge Function Changes

The `coach-chat` edge function needs to:
1. Accept `wikiArticles` in the context object
2. Inject the formatted article list + referencing instructions into the system prompt

This is a change in the shared edge function at `~/Developer/carve-ai/supabase/functions/coach-chat/index.ts`.

## 11. Out of Scope

- AI article generation tooling (future)
- Article editing/CMS in web app (future — use Supabase dashboard for now)
- RAG / vector search (migrate when 200+ articles)
- Mobile responsive wiki view
- Public wiki route changes (existing `/wiki` stays as-is)
- Article comments or reactions
- `:::takeaway` and `:::checklist` custom block rendering (not implemented anywhere yet — articles use standard markdown)
- Domain-filtered article metadata (send all articles for now; filter by activeApp category when 200+)
- Brein mode implementation (separate feature, roadmap 2.2)

## 12. Deployment Coordination

The edge function change (accepting `wikiArticles` in context) must be deployed **before** the web app changes go live. Otherwise the `wikiArticles` field is silently ignored and no article references appear.

Order:
1. Deploy edge function update (backward-compatible — just accepts a new optional field)
2. Apply `type` column migration
3. Deploy web app changes

## 13. Scaling Notes

- **<200 articles:** Metadata in prompt (current approach)
- **200-500 articles:** Switch to top-N by relevance (tag matching against activeApp/conversation topic)
- **500+ articles:** Migrate to RAG with pgvector embeddings or coach tool call
