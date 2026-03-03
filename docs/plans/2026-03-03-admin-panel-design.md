# CARVE Admin Panel — Design Document

**Date:** 2026-03-03
**Status:** Draft (reviewed & corrected)
**Platform:** carve.wiki — `app/(protected)/admin/`

---

## Overview

Volledig admin panel voor Carve: monitoring dashboard, user management, content beheer, en app configuratie. Gebouwd als uitbreiding van het bestaande admin panel, met een architectuur die nieuwe pagina's triviaal maakt om toe te voegen.

## Bestaande Architectuur (wat er al staat)

### App Shell & Navigatie — Werkt al

De admin sidebar is **al functioneel** via de bestaande `AppSidebarController`:

```
LayoutWrapper → AppShell → AppBody → AppSidebarController + AppContent
```

- `AppSidebarController` detecteert `/admin` routes en laadt `adminNavigationGroups`
- Admin section heeft amber accent theme (`#f59e0b`)
- Dark shell: `bg-[#0c0e14]` wrapper, `bg-[#111318]` content area met `rounded-tl-xl`
- Hover-expand sidebar (64px → 200px)

**Actie nodig:** Alleen nav items toevoegen voor nieuwe pagina's.

### Admin Pages — 6 pagina's, wisselende kwaliteit

| Pagina | Status | Theme | Probleem |
|--------|--------|-------|----------|
| Dashboard | Functioneel* | Light | Queryt `completed_workouts` en `feedback` |
| Users lijst | Goed | Dark | — |
| User detail | Goed | Dark | Queryt `activity_log` (moet `activity_feed` zijn), `duration` (moet `duration_minutes` zijn) |
| Content | Stub | Light | Geen moderation acties, geen paginatie |
| Feedback | Stub | Light | Geen status/actie knoppen, geen paginatie |
| Settings | Stub | Light | Alle save handlers zijn `console.log` |

### Server Actions — Solide basis, één bug

`app/actions/admin/users.ts` heeft werkende admin-checked actions:
- `updateUserProfile`, `banUser`, `unbanUser`, `changeUserRole`, `deleteUser`
- Elke action verifieert `profile.role === 'admin'` voor uitvoering

**Bug:** `deleteUser` verwijdert alleen de `profiles` row, niet de `auth.users` entry. De user kan opnieuw inloggen en krijgt een nieuw profiel via de `handle_new_user()` trigger. Fix: gebruik `supabase.auth.admin.deleteUser()` met een service-role client, of vervang door soft-delete (ban + deactivate).

### Beschikbare Tech

| Tool | Package | Status |
|------|---------|--------|
| Charts | `recharts` v2.15 + shadcn `chart.tsx` wrapper | Geinstalleerd, nog niet gebruikt in admin |
| UI Components | shadcn/ui (button, card, badge, tabs, input, select, switch, skeleton) | Beschikbaar |
| Icons | Lucide React | Beschikbaar |
| Animations | Framer Motion | Beschikbaar |

### Wat Ontbreekt

- **Toast/notificatie systeem** — geen toast library geinstalleerd
- **Shared admin queries** — elke pagina schrijft eigen Supabase queries
- **Consistent theme** — dashboard/content/feedback/settings zijn light, users is dark
- **Loading states** — geen `loading.tsx` of skeleton loaders in admin
- **Error boundaries** — geen `error.tsx` in admin routes
- **Admin RLS policies** — `workouts`, `meals`, `activity_feed` hebben alleen `user_id = auth.uid()` policies; admin ziet alleen eigen data

### Bekende Tabel-naam Problemen

| Code queryt | Moet zijn | Locatie |
|-------------|-----------|---------|
| `completed_workouts` | Controleer productie DB — mogelijk `workouts` | `admin/page.tsx` |
| `activity_log` | `activity_feed` | `admin/users/[id]/page.tsx` |
| `duration` (kolom) | `duration_minutes` | `admin/users/[id]/page.tsx` |
| `feedback` | Controleer of tabel bestaat in productie | `admin/page.tsx`, `admin/feedback/page.tsx` |

---

## Prerequisite: Database & RLS Audit

**Voordat er code geschreven wordt**, moet de productie database geaudit worden. De migratie-files zijn niet in sync met productie.

### Stap 0.1 — Productie schema audit

Run `supabase db dump` of inspecteer de productie database om te documenteren:
1. Welke kolommen `profiles` daadwerkelijk heeft (migraties definiëren ~7, TypeScript verwacht ~56)
2. Of `completed_workouts` en `feedback` tabellen bestaan
3. Welke RLS policies al bestaan

### Stap 0.2 — Reconciliatie migratie

Schrijf een migratie die de ontbrekende kolommen toevoegt (als ze niet al bestaan):

```sql
-- Alleen kolommen toevoegen die de admin pagina's nodig hebben
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'free';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ban_reason TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_status TEXT;
-- etc. — gebaseerd op wat de audit uitwijst
```

**Waarom:** Met meerdere developers is het essentieel dat `supabase db reset` een werkende database oplevert. Zonder deze migratie krijgt elke nieuwe developer een kapot admin panel.

### Stap 0.3 — Admin RLS policies

**Dit moet VOOR het dashboard gebouwd wordt.** Zonder admin RLS geven queries op `workouts`, `meals`, `activity_feed` etc. alleen de admin's eigen data terug — het dashboard toont dan verkeerde cijfers zonder foutmelding.

```sql
-- Pattern: admin kan alles lezen, users alleen eigen data
-- Vervang bestaande policy of voeg toe naast bestaande

-- workouts: huidige policy is "Users can view own workouts" USING (auth.uid() = user_id)
-- Vervangen door:
DROP POLICY IF EXISTS "Users can view own workouts" ON workouts;
CREATE POLICY "users_or_admin_select_workouts" ON workouts
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Herhaal voor: meals, user_stats, activity_feed, user_achievements
-- Controleer eerst of de policy al bestaat in productie!

-- profiles: admin moet andere users kunnen updaten
CREATE POLICY "admin_update_profiles" ON profiles
  FOR UPDATE TO authenticated
  USING (
    auth.uid() = id
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    auth.uid() = id
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
```

**Belangrijk:** Controleer eerst welke policies al bestaan in productie. Voeg alleen toe wat ontbreekt. De `DROP POLICY IF EXISTS` + `CREATE POLICY` pattern is veilig.

---

## Design

### Fase 1 — Fundament

Zonder dit fundament is elke nieuwe pagina weggegooid werk.

#### 1.1 Design System — Apple-stijl dark UI (consistent met health & money dashboards)

Het admin panel volgt exact dezelfde design taal als de bestaande health en money dashboards. Geen eigen stijl — dezelfde componenten, dezelfde kleuren, dezelfde spacing.

**Kleurenpalet:**
```
Body background:     bg-[#0c0e14]        (via AppShell, al aanwezig)
Content area:        bg-[#111318]         (via AppContent, al aanwezig)
Card background:     bg-[#1c1f27]         (zelfde als HealthCard/MoneyCard)
Card border:         border border-white/[0.06]   (signature subtiele scheiding)
Glassmorphism:       bg-[rgba(30,35,45,0.4)] backdrop-blur-xl  (premium secties)
```

**Typografie hiërarchie:**
```
Page titel:          text-3xl font-bold text-white tracking-tight
Page subtitel:       text-[#9da6b9] mt-1
Stat label:          text-xs uppercase tracking-wider text-slate-500 mb-1
Stat waarde:         text-3xl font-bold text-white tracking-tight
Secondary text:      text-[#9da6b9] text-sm
Muted text:          text-slate-500 text-sm
```

**Card template (identiek aan HealthCard/MoneyCard):**
```tsx
<div className="rounded-xl p-5 bg-[#1c1f27] border border-white/[0.06]">
  <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">Label</p>
  <p className="text-3xl font-bold text-white tracking-tight">Value</p>
  <p className="text-[#9da6b9] text-sm mt-1">Supporting text</p>
</div>
```

**Accent kleuren:**
```
Admin accent:        #f59e0b (amber — al geconfigureerd in AppSidebarController)
Success/positive:    emerald-400, bg-emerald-500/10
Negative/alert:      rose-400, bg-rose-500/10
Warning:             amber-400, bg-amber-500/10
Role badges:         bg-purple-500/20 text-purple-300 (admin)
                     bg-blue-500/20 text-blue-300 (dedicated)
                     bg-green-500/20 text-green-300 (active)
                     bg-red-500/20 text-red-300 (banned)
```

**Trend indicator (ChangeBadge pattern uit money dashboard):**
```tsx
// Positief
<span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium bg-emerald-500/10 text-emerald-400">
  ↑ 12%
</span>
// Negatief
<span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium bg-red-500/10 text-red-400">
  ↓ 3%
</span>
```

**Layout & spacing:**
```
Page container:      p-6 lg:p-10 space-y-6 max-w-7xl mx-auto
Card grid:           grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4
Section spacing:     space-y-6 (24px)
Card padding:        p-5
```

**Interactie & animatie (Framer Motion, zelfde als dashboards):**
```tsx
// Staggered card entrance
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5, delay: index * 0.1 }}
>

// Hover op interactieve cards
className="hover:border-white/[0.12] hover:bg-white/[0.02] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
```

**Aanpak:** Alle bestaande admin pagina's (dashboard, content, feedback, settings) converteren naar dit design systeem. De users pagina's gebruiken `bg-[#0a0e1a]` en `bg-[#1a1f2e]` — deze worden ook geconverteerd naar `bg-[#1c1f27]` voor consistentie met de rest van de app.

#### 1.2 Toast systeem

Installeer `sonner` — past bij shadcn/ui, minimale setup:

```
pnpm add sonner
```

- `<Toaster />` toevoegen aan root layout (of admin layout)
- Elke mutation toont success/error toast
- Theme: `theme="dark"` voor admin context

#### 1.3 Shared data access layer

`lib/admin/queries.ts` — alle admin-specifieke Supabase queries op één plek:

```typescript
// Voorbeeld structuur
export async function getAdminDashboardStats(supabase: SupabaseClient) {
  const [users, activeUsers, workouts, meals, articles] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true })
      .gte("last_active_at", daysAgo(7)),
    supabase.from("workouts").select("*", { count: "exact", head: true }),
    supabase.from("meals").select("*", { count: "exact", head: true }),
    supabase.from("wiki_articles").select("*", { count: "exact", head: true }),
  ]);
  return { users, activeUsers, workouts, meals, articles };
}

export async function getUserGrowthData(supabase: SupabaseClient, days: number) { ... }
export async function getActivityTrends(supabase: SupabaseClient, days: number) { ... }
export async function getGamificationStats(supabase: SupabaseClient) { ... }
```

**Note:** Tabel-namen (`workouts` vs `completed_workouts`) worden gebaseerd op de productie DB audit uit Stap 0.1.

#### 1.4 Loading & Error states

Per admin route:
- `loading.tsx` — skeleton loader (herbruikbaar `AdminSkeleton` component)
- `error.tsx` — error boundary met retry knop

#### 1.5 Admin navigatie config opschonen

Verwijder de dead "Database" link. Huidige config behouden, nieuwe items toevoegen per fase.

#### 1.6 Bug fixes in bestaande pagina's

Voordat het dashboard herbouwd wordt, fix de bekende problemen:
- `admin/users/[id]/page.tsx`: `activity_log` → `activity_feed`, `duration` → `duration_minutes`
- `admin/users/[id]/page.tsx`: Self-demotion protection in `changeUserRole` (admin kan zichzelf niet demoten)
- `deleteUser` action: vervang met soft-delete (set `is_banned = true`, `is_active = false`) of implementeer service-role client voor echte deletion

---

### Fase 2 — Monitoring Dashboard

Het hart van het admin panel. Eén pagina, meerdere secties, gebouwd op data die er daadwerkelijk is.

**Prerequisite:** Admin RLS policies moeten staan (Stap 0.3), anders toont het dashboard verkeerde data.

#### 2.1 Herbruikbare Components (eerst bouwen)

Bouw deze componenten voordat het dashboard zelf gebouwd wordt:

**`components/admin/stats-card.tsx`** — Zelfde stijl als HealthCard/MoneyCard:
```tsx
interface StatsCardProps {
  title: string;
  value: number;
  previousValue?: number;     // Voor trend berekening
  format?: 'number' | 'percentage';
  icon: LucideIcon;
}

// Visueel:
// ┌─────────────────────────────────┐
// │ 👥  TOTAL USERS          ↑ 12% │  ← text-xs uppercase tracking-wider text-slate-500
// │     1,247                       │  ← text-3xl font-bold text-white tracking-tight
// │     43 new this week            │  ← text-[#9da6b9] text-sm
// └─────────────────────────────────┘
// bg-[#1c1f27] border border-white/[0.06] rounded-xl p-5
// Framer Motion: fade-up entrance met staggered delay
```

**`components/admin/chart-card.tsx`** — Card wrapper voor Recharts:
```tsx
interface ChartCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;  // Recharts component
  className?: string;
}

// Visueel:
// ┌─────────────────────────────────┐
// │ User Growth                     │  ← text-sm font-medium text-white
// │ Nieuwe signups afgelopen 30d    │  ← text-xs text-slate-500
// │                                 │
// │ ▁▂▃▅▇█▇▅▆▇ (Recharts)         │  ← Recharts met dark theme kleuren
// │                                 │
// └─────────────────────────────────┘
// bg-[#1c1f27] border border-white/[0.06] rounded-xl p-5
```

Recharts theme kleuren: `#f59e0b` (amber, admin accent), `#3b82f6` (blue), `#a855f7` (purple), `#10b981` (emerald). Grid/axis: `stroke="#282e39"`, tooltip: `bg-[#1c1f27] border border-white/[0.06]`.

**`components/admin/status-badge.tsx`** — Pill badges:
```tsx
// Zelfde pattern als ChangeBadge uit money dashboard
// inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium

// Roles:
// Admin:     bg-purple-500/10 text-purple-400
// Dedicated: bg-blue-500/10 text-blue-400
// Member:    bg-slate-500/10 text-slate-400
// Free:      bg-white/5 text-slate-500

// Status:
// Active:    bg-emerald-500/10 text-emerald-400
// Banned:    bg-rose-500/10 text-rose-400
// Inactive:  bg-white/5 text-slate-500
```

**`components/admin/admin-skeleton.tsx`** — Skeleton loader:
```tsx
// Animated pulse placeholders matching the card grid layout
// 6x stats card skeletons (rounded-xl bg-[#1c1f27] animate-pulse)
// 2x chart card skeletons (taller, zelfde styling)
// 2x activity feed skeletons
```

#### 2.2 Stats Cards (bovenaan)

Compacte grid van kernmetrics met trend indicators:

| Card | Query | Tabel |
|------|-------|-------|
| Total Users | `profiles` count | `profiles` |
| Active (7d) | `profiles` where `last_active_at` >= 7d ago | `profiles` |
| New Users (7d) | `profiles` where `created_at` >= 7d ago | `profiles` |
| Total Workouts | count | `workouts` (of `completed_workouts` — na audit) |
| Total Meals | `meals` count | `meals` |
| Wiki Articles | `wiki_articles` count | `wiki_articles` |

Elke card toont: waarde + vergelijking met vorige periode (percentage up/down).

#### 2.3 Charts Sectie

Twee rijen met Recharts visualisaties (gebruikmakend van bestaande `chart.tsx` wrapper):

**Rij 1: Groei & Activiteit**
- **User Growth** (AreaChart) — nieuwe signups per dag/week, afgelopen 30 dagen
- **Daily Activity** (BarChart) — workouts + meals per dag, gestapeld

**Rij 2: Verdeling & Gamification**
- **User Roles** (PieChart/DonutChart) — admin/dedicated/member/free verdeling
- **Level Distribution** (BarChart) — hoeveel users per level range (1-5, 6-10, 11-20, 21+)

Data uit: `profiles` (role, created_at), `workouts` (created_at), `meals` (created_at), `user_stats` (level).

#### 2.4 Recent Activity Feed

Twee kolommen:

| Links | Rechts |
|-------|--------|
| **Recent Signups** — naam, email, datum, role badge | **Recent Workouts** — user, workout naam, duur, datum |

Max 10 items per kolom. Link naar user detail pagina.

#### 2.5 Quick Stats (optioneel, onderaan)

- Top 5 populairste wiki artikelen (uit `wiki_article_views`)
- Achievement unlock rate (uit `user_achievements` / totaal users)
- Gemiddelde streak lengte (uit `user_stats`)

---

### Fase 3 — Bestaande Pagina's Fixen

#### 3.1 Content Moderation — Acties toevoegen

De content pagina toont al wiki artikelen. Toevoegen:
- **Publish/Unpublish toggle** — wijzigt `is_published` via Server Action
- **Soft delete** — set `is_published = false` + `deleted_at` timestamp (geen hard delete — admin tool moet recovery toestaan)
- **Edit link** — navigeert naar wiki editor
- **Paginatie** — zelfde pattern als users pagina (50 per page)
- Server Actions met admin auth check

#### 3.2 Feedback — Workflow toevoegen

**Prerequisite:** Bevestig dat `feedback` tabel bestaat in productie (Stap 0.1). Als de tabel niet bestaat, creëer een migratie.

De feedback pagina toont al items. Toevoegen:
- **Status wijzigen** — new → reviewed → addressed (dropdown of knoppen)
- **Interne notities** — tekstveld voor admin notes
- **Type filter** — bug/feature/other
- **Paginatie** — zelfde pattern als users pagina
- Server Actions met admin auth check

#### 3.3 Settings — Echte Persistence

**Stap 1:** `app_settings` tabel aanmaken (als die niet al bestaat in productie):

```sql
CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_by UUID REFERENCES profiles(id),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Alle authenticated users kunnen settings lezen (feature flags, iOS app)
CREATE POLICY "read_settings" ON app_settings
  FOR SELECT TO authenticated USING (true);

-- Alleen admins kunnen settings wijzigen
CREATE POLICY "admin_manage_settings" ON app_settings
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
```

**Stap 2:** Settings page ombouwen:
- Van `'use client'` met `useState` → Server Component met Server Actions
- Elke save handler wordt een Server Action die naar `app_settings` schrijft
- Toast feedback na elke save/error
- Initiële waarden laden uit `app_settings` (met defaults als key niet bestaat)

**Stap 3:** Settings secties reviewen — alleen settings behouden die daadwerkelijk effect hebben. XP-gerelateerde settings (xpPerWorkout, xpPerMeal) hebben pas effect als de database functies (`calculate_xp`) ook aangepast worden om uit `app_settings` te lezen ipv hardcoded waarden.

---

### Fase 4 — Uitbreiding (later, architectuur staat klaar)

Doordat de shell, data-laag, theme, en component-patronen staan, is een nieuwe pagina toevoegen:
1. Route file aanmaken
2. Nav item toevoegen in `admin-navigation.ts`
3. Query toevoegen in `lib/admin/queries.ts`
4. Server Component bouwen met herbruikbare patterns

Mogelijke toekomstige pagina's (pas bouwen als er een concrete need is):

| Pagina | Wanneer nodig |
|--------|---------------|
| **Revenue** | Als er een payment integratie is (Stripe/RevenueCat) |
| **Announcements** | Als de iOS app in-app berichten moet tonen |
| **Audit Log** | Als je wilt tracken wie wat heeft gewijzigd in admin |
| **Analytics deep-dive** | Als het dashboard niet genoeg detail geeft |
| **Coach/AI usage** | Als er een chat_quota systeem in de database zit |

---

## Component Architecture

### Overzicht

```
components/admin/
├── stats-card.tsx          ← NIEUW: Metric card met trend indicator
├── chart-card.tsx          ← NIEUW: Card wrapper voor Recharts
├── admin-skeleton.tsx      ← NIEUW: Skeleton loader voor admin pagina's
├── status-badge.tsx        ← NIEUW: Herbruikbare status badges
├── settings-nav.tsx        ← Bestaand
├── settings-section.tsx    ← Bestaand
├── setting-item.tsx        ← Bestaand
├── settings-save-button.tsx← Bestaand (toast toevoegen)
├── settings-mobile-nav.tsx ← Bestaand
└── users/                  ← Bestaand
    ├── user-search.tsx
    ├── user-filters.tsx
    ├── user-edit-form.tsx
    └── user-actions.tsx
```

**Note:** Geen generieke `data-table.tsx` — de users pagina heeft al een bespoke tabel die goed werkt. Bouw specifieke tabellen per pagina en extract pas een abstractie als er een duidelijk herhalend patroon ontstaat.

---

## Data Flow

```
Browser request
  → Admin Layout (auth check: profile.role === 'admin')
    → Server Component (page.tsx)
      → lib/admin/queries.ts (Supabase queries)
        → Supabase (RLS: admin policies laten alle data door)
      ← Data
    ← Rendered HTML with charts + stats
  ← Response

User mutation (ban user, save setting, etc.)
  → Server Action (app/actions/admin/*.ts)
    → Admin auth check (profile.role === 'admin')
    → Supabase mutation (RLS: admin policies)
    → revalidatePath('/admin/...')
  ← Success/Error
  → Toast notification via sonner
```

---

## Database Considerations

### Tabellen die we queryen

Alles via de bestaande Supabase client met de `anon` key (RLS van toepassing):

| Tabel | Operatie | RLS status |
|-------|----------|------------|
| `profiles` | SELECT all, UPDATE any | Heeft open SELECT, **mist admin UPDATE** — toevoegen |
| `workouts` | SELECT all (counts, recents) | Heeft alleen `user_id = auth.uid()` — **admin policy toevoegen** |
| `meals` | SELECT all (counts) | Heeft alleen `user_id = auth.uid()` — **admin policy toevoegen** |
| `user_stats` | SELECT all (levels, XP) | Heeft open SELECT — OK |
| `wiki_articles` | SELECT all, UPDATE (publish) | Authenticated SELECT — OK |
| `wiki_article_views` | SELECT all | Open SELECT — OK |
| `achievements` | SELECT all | Open SELECT — OK |
| `user_achievements` | SELECT all | Heeft alleen `user_id = auth.uid()` — **admin policy toevoegen** |
| `activity_feed` | SELECT all | Heeft alleen `user_id = auth.uid()` — **admin policy toevoegen** |
| `app_settings` | CRUD | **Nieuw** — aanmaken met admin policies |
| `feedback` | SELECT, UPDATE | **Onbekend** — controleer productie |

### Security Overwegingen

- **Single source of truth:** `profile.role === 'admin'` is de enige admin check — zowel in app-laag als RLS. Geen secundaire verificatie.
- **Self-demotion:** `changeUserRole` moet voorkomen dat een admin zichzelf demoteert (lock-out scenario).
- **Settings audit:** `app_settings` heeft `updated_by` + `updated_at`, maar geen history. In een multi-admin setup is er geen manier om te zien wie wat gewijzigd heeft. Overweeg een `app_settings_history` tabel als er meerdere admins zijn.
- **Content soft-delete:** Admin content moderation gebruikt soft-delete (niet hard delete) om recovery mogelijk te maken.

---

## Wat We Niet Bouwen

- **Eigen analytics engine** — Supabase queries + Plausible voor web analytics
- **Eigen error tracking** — Sentry (als nodig, apart integreren)
- **Real-time updates** — Server Components + revalidatePath is voldoende
- **Batch operaties** — Te risicovol, altijd per-item
- **Mobile admin** — Desktop-only (sidebar is hidden op mobile, dat is OK voor admin)
- **Pagina's voor features die niet bestaan** — geen revenue zonder payments, geen coach zonder quota systeem
- **Generieke data-table abstractie** — bouw specifiek, extract later

---

## Implementatie Volgorde

| Stap | Wat | Afhankelijk van |
|------|-----|-----------------|
| **0.1** | Productie database audit (schema + bestaande RLS policies) | — |
| **0.2** | Reconciliatie migratie (ontbrekende profiles kolommen) | 0.1 |
| **0.3** | Admin RLS policies toevoegen (workouts, meals, activity_feed, user_achievements, profiles UPDATE) | 0.1 |
| **1** | Sonner installeren + Toaster in layout | — |
| **2** | Admin navigatie config opschonen (Database link weg) | — |
| **3** | Bug fixes: `activity_log` → `activity_feed`, `duration` → `duration_minutes`, self-demotion protection, deleteUser fix | — |
| **4** | Alle admin pagina's naar dark theme converteren | — |
| **5** | `lib/admin/queries.ts` opzetten met dashboard queries | 0.3 (RLS moet staan) |
| **6** | `loading.tsx` en `error.tsx` voor admin routes | — |
| **7** | Herbruikbare components (stats-card, chart-card, status-badge, admin-skeleton) | 4 (dark theme) |
| **8** | Dashboard herbouwen met stats cards + charts + activity feed | 5, 7 |
| **9** | Content pagina — moderation acties + paginatie | 1, 4 |
| **10** | Feedback pagina — status workflow + paginatie | 1, 4, 0.1 (tabel check) |
| **11** | Settings — `app_settings` tabel + persistence | 1, 4, 0.3 |
