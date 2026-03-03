# Admin Panel Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a complete admin panel with monitoring dashboard, user management, content moderation, and app configuration — using the same Apple-style dark UI as the existing health/money dashboards.

**Architecture:** Server Components for all pages, Server Actions for mutations, shared query layer in `lib/admin/queries.ts`, Recharts for charts, sonner for toasts. All data fetched via Supabase with RLS policies allowing admin access.

**Tech Stack:** Next.js 16 App Router, Supabase, Recharts, sonner, shadcn/ui, Tailwind CSS, Framer Motion, Lucide icons

**Design doc:** `docs/plans/2026-03-03-admin-panel-design.md`

---

## Task 0: Prerequisites — Database & RLS

### Task 0.1: Productie Database Audit

**This is a manual task.** Connect to the production Supabase dashboard and document:

1. Which columns does `profiles` actually have? (migrations define ~7, TypeScript expects ~56)
2. Does a `completed_workouts` table exist? What are its columns?
3. Does a `feedback` table exist? What are its columns?
4. Does `activity_log` exist, or only `activity_feed`?
5. Which RLS policies exist on `workouts`, `meals`, `activity_feed`, `profiles`?
6. Does an `app_settings` table exist?

**Save findings to:** `docs/plans/2026-03-03-db-audit-results.md`

This audit determines the exact queries and migrations needed for all subsequent tasks.

---

### Task 0.2: Reconciliation Migration

**Files:**
- Create: `supabase/migrations/YYYYMMDDHHMMSS_admin_panel_prerequisites.sql`

**Depends on:** Task 0.1 audit results.

**Step 1: Generate migration file**

Run: `pnpm supabase migration new admin_panel_prerequisites`

**Step 2: Write the migration**

Based on audit results, add missing columns and tables. Template:

```sql
-- ===========================================
-- Admin Panel Prerequisites Migration
-- ===========================================

-- 1. Add missing profiles columns (only if they don't exist in production)
-- Uncomment columns that the audit confirms are missing:

-- ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'free';
-- ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;
-- ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
-- ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT false;
-- ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ban_reason TEXT;
-- ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ;

-- 2. Create app_settings table
CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_by UUID REFERENCES profiles(id),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_read_settings" ON app_settings
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "admin_manage_settings" ON app_settings
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 3. Create feedback table if it doesn't exist
-- (Uncomment if audit confirms it's missing)
-- CREATE TABLE IF NOT EXISTS feedback (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   user_id UUID REFERENCES profiles(id),
--   type TEXT DEFAULT 'other', -- bug, feature, other
--   status TEXT DEFAULT 'new', -- new, reviewed, addressed
--   message TEXT NOT NULL,
--   admin_notes TEXT,
--   email TEXT,
--   display_name TEXT,
--   created_at TIMESTAMPTZ DEFAULT now(),
--   updated_at TIMESTAMPTZ DEFAULT now()
-- );
--
-- ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "users_insert_feedback" ON feedback FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
-- CREATE POLICY "admin_manage_feedback" ON feedback FOR ALL TO authenticated USING (
--   EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
-- );
```

**Step 3: Apply migration**

Run: `pnpm supabase db push` (of via Supabase dashboard)

**Step 4: Commit**

```bash
git add supabase/migrations/
git commit -m "chore(db): add admin panel prerequisite migration"
```

---

### Task 0.3: Admin RLS Policies

**Files:**
- Create: `supabase/migrations/YYYYMMDDHHMMSS_admin_rls_policies.sql`

**Depends on:** Task 0.1 audit results (to know which policies already exist).

**Step 1: Generate migration**

Run: `pnpm supabase migration new admin_rls_policies`

**Step 2: Write admin RLS policies**

```sql
-- ===========================================
-- Admin RLS Policies
-- ===========================================
-- Only add policies that don't already exist (check audit results).
-- Pattern: admin can read all rows, users only their own.

-- workouts: current policy is "Users can view own workouts" USING (auth.uid() = user_id)
DROP POLICY IF EXISTS "Users can view own workouts" ON workouts;
CREATE POLICY "users_or_admin_select_workouts" ON workouts
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- meals: current policy is "Users can view own meals" USING (auth.uid() = user_id)
DROP POLICY IF EXISTS "Users can view own meals" ON meals;
CREATE POLICY "users_or_admin_select_meals" ON meals
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- activity_feed: current policy is "Users can view own activities" USING (auth.uid() = user_id)
DROP POLICY IF EXISTS "Users can view own activities" ON activity_feed;
CREATE POLICY "users_or_admin_select_activity_feed" ON activity_feed
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- user_achievements: add admin read policy
CREATE POLICY "admin_select_user_achievements" ON user_achievements
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- profiles: admin can UPDATE other users (current policy only allows own profile)
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

**Step 3: Apply and commit**

```bash
pnpm supabase db push
git add supabase/migrations/
git commit -m "chore(db): add admin RLS policies for cross-user data access"
```

---

## Task 1: Install Sonner + Add Toaster

**Files:**
- Modify: `app/layout.tsx`

**Step 1: Install sonner**

Run: `pnpm add sonner`

**Step 2: Add Toaster to root layout**

Modify `app/layout.tsx` — add import and component:

```typescript
// Add import at top:
import { Toaster } from "sonner";

// Add <Toaster /> inside <body>, after <LayoutWrapper>:
<body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0c0e14]`}>
  <LayoutWrapper ...>
    {children}
  </LayoutWrapper>
  <Toaster theme="dark" position="bottom-right" richColors />
</body>
```

**Step 3: Verify**

Run: `pnpm dev`
Navigate to any page — Toaster should be invisible until called.

**Step 4: Commit**

```bash
git add package.json pnpm-lock.yaml app/layout.tsx
git commit -m "feat(admin): add sonner toast notification system"
```

---

## Task 2: Clean Up Admin Navigation Config

**Files:**
- Modify: `lib/navigation/admin-navigation.ts`

**Step 1: Remove dead Database link**

Current file has a "Database" item at line 48-53 pointing to `/admin/database` which doesn't exist.

Replace entire file content:

```typescript
export const adminNavigationGroups = [
  {
    label: 'OVERVIEW',
    icon: { name: 'DashboardIcon' },
    items: [
      {
        title: "Dashboard",
        href: "/admin",
        icon: { name: 'DashboardIcon' },
        description: "Analytics & insights"
      }
    ]
  },
  {
    label: 'MANAGEMENT',
    icon: { name: 'UsersIcon' },
    items: [
      {
        title: "Users",
        href: "/admin/users",
        icon: { name: 'UsersIcon' },
        description: "User management"
      },
      {
        title: "Content",
        href: "/admin/content",
        icon: { name: 'BookIcon' },
        description: "Wiki & content moderation"
      },
      {
        title: "Feedback",
        href: "/admin/feedback",
        icon: { name: 'MailIcon' },
        description: "User feedback"
      }
    ]
  },
  {
    label: 'CONFIGURATION',
    icon: { name: 'SettingsIcon' },
    items: [
      {
        title: "Settings",
        href: "/admin/settings",
        icon: { name: 'SettingsIcon' },
        description: "Site configuration"
      }
    ]
  }
];
```

**Step 2: Verify sidebar renders correctly**

Run: `pnpm dev`, navigate to `/admin`. Sidebar should show 5 items (Dashboard, Users, Content, Feedback, Settings) — no Database link.

**Step 3: Commit**

```bash
git add lib/navigation/admin-navigation.ts
git commit -m "fix(admin): remove dead Database nav link"
```

---

## Task 3: Bug Fixes in Existing Pages

**Files:**
- Modify: `app/(protected)/admin/users/[id]/page.tsx`
- Modify: `app/actions/admin/users.ts`

### Step 1: Fix `activity_log` → `activity_feed` in user detail page

In `app/(protected)/admin/users/[id]/page.tsx`, find the query that uses `activity_log` and change it to `activity_feed`:

```typescript
// BEFORE:
const { data: activities } = await supabase
  .from("activity_log")
  .select("*")
  .eq("user_id", id)

// AFTER:
const { data: activities } = await supabase
  .from("activity_feed")
  .select("*")
  .eq("user_id", id)
```

### Step 2: Fix `duration` → `duration_minutes` in user detail page

In the same file, find the workouts query and fix the column name:

```typescript
// BEFORE:
.select("id, name, created_at, duration")

// AFTER:
.select("id, name, created_at, duration_minutes")
```

Also update the JSX that renders the duration to use `duration_minutes`.

### Step 3: Add self-demotion protection to `changeUserRole`

In `app/actions/admin/users.ts`, find `changeUserRole` and add a check:

```typescript
export async function changeUserRole(userId: string, newRole: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  // Prevent self-demotion
  if (user.id === userId && newRole !== 'admin') {
    throw new Error("Cannot change your own admin role");
  }

  // ... existing admin check and update logic
}
```

### Step 4: Fix `deleteUser` — replace with soft-delete

In `app/actions/admin/users.ts`, modify `deleteUser` to do a soft-delete instead of hard delete:

```typescript
export async function deleteUser(userId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") throw new Error("Unauthorized");

  if (user.id === userId) throw new Error("Cannot delete your own account");

  // Soft-delete: ban + deactivate instead of hard delete
  const { error } = await supabase
    .from("profiles")
    .update({
      is_banned: true,
      is_active: false,
      ban_reason: "Account deleted by admin",
    })
    .eq("id", userId);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
}
```

### Step 5: Verify and commit

Run: `pnpm dev`, navigate to `/admin/users/[any-user-id]` — activities and workouts should load.

```bash
git add app/(protected)/admin/users/[id]/page.tsx app/actions/admin/users.ts
git commit -m "fix(admin): fix table names, add self-demotion protection, soft-delete users"
```

---

## Task 4: Dark Theme Conversion

Convert all light-themed admin pages to match the health/money dashboard design system.

### Task 4.1: Dashboard Dark Theme

**Files:**
- Modify: `app/(protected)/admin/page.tsx`

**Step 1: Rewrite the dashboard page with dark theme**

Replace the entire page with the dark theme version. Key changes:
- Remove emoji icons, use Lucide icons instead
- Use `bg-[#1c1f27] border border-white/[0.06] rounded-xl` for cards
- Use `text-xs uppercase tracking-wider text-slate-500` for labels
- Use `text-3xl font-bold text-white tracking-tight` for values
- Use `text-[#9da6b9]` for secondary text
- Add Framer Motion staggered entrance animations
- Page container: `p-6 lg:p-10 space-y-6 max-w-7xl mx-auto`

The dashboard should have:
1. Header section with title + subtitle
2. 6-card stats grid (3 columns)
3. Two-column recent activity section (Recent Signups + Recent Workouts)
4. Quick Actions row

Use Lucide icons: `Users`, `Activity`, `UtensilsCrossed`, `BookOpen`, `MessageSquare`, `CheckCircle`.

**Note:** Update table queries based on DB audit (Task 0.1). Use `workouts` instead of `completed_workouts` unless audit confirms the latter exists.

**Step 2: Verify**

Run: `pnpm dev`, navigate to `/admin`. Page should match dark theme of `/admin/users`.

**Step 3: Commit**

```bash
git add app/(protected)/admin/page.tsx
git commit -m "feat(admin): convert dashboard to dark theme"
```

### Task 4.2: Content Page Dark Theme

**Files:**
- Modify: `app/(protected)/admin/content/page.tsx`

**Step 1: Convert to dark theme**

Same pattern: replace light classes with dark equivalents.

```
bg-white          → bg-[#1c1f27]
border-gray-200   → border-white/[0.06]
text-gray-900     → text-white
text-gray-600     → text-[#9da6b9]
text-gray-500     → text-slate-500
hover:bg-gray-50  → hover:bg-white/[0.04]
```

Add the page container pattern: `p-6 lg:p-10 space-y-6 max-w-7xl mx-auto`

**Step 2: Commit**

```bash
git add app/(protected)/admin/content/page.tsx
git commit -m "feat(admin): convert content page to dark theme"
```

### Task 4.3: Feedback Page Dark Theme

**Files:**
- Modify: `app/(protected)/admin/feedback/page.tsx`

Same conversion as content page. Apply identical color substitutions.

```bash
git add app/(protected)/admin/feedback/page.tsx
git commit -m "feat(admin): convert feedback page to dark theme"
```

### Task 4.4: Settings Page Dark Theme

**Files:**
- Modify: `app/(protected)/admin/settings/page.tsx`
- Modify: `components/admin/settings-nav.tsx`
- Modify: `components/admin/settings-section.tsx`
- Modify: `components/admin/setting-item.tsx`
- Modify: `components/admin/settings-save-button.tsx`
- Modify: `components/admin/settings-mobile-nav.tsx`

**Step 1: Convert all settings components**

Apply the same color substitutions to every component. For inputs:
```
bg-white/input defaults → bg-white/5 border-white/10 text-white
```

For switches, selects, and other shadcn components — they may need className overrides for dark mode.

**Step 2: Commit**

```bash
git add app/(protected)/admin/settings/ components/admin/settings-*.tsx components/admin/setting-item.tsx
git commit -m "feat(admin): convert settings page and components to dark theme"
```

### Task 4.5: Users Page — Align with design system

**Files:**
- Modify: `app/(protected)/admin/users/page.tsx`

The users page is already dark but uses slightly different colors (`bg-[#0a0e1a]`, `bg-[#1a1f2e]`). Align to the standard card color `bg-[#1c1f27]` and border `border-white/[0.06]` for consistency.

```bash
git add app/(protected)/admin/users/page.tsx
git commit -m "feat(admin): align users page to standard dark theme tokens"
```

---

## Task 5: Shared Query Layer

**Files:**
- Create: `lib/admin/queries.ts`

**Step 1: Create the shared queries file**

```typescript
import { SupabaseClient } from "@supabase/supabase-js";

// Helper
function daysAgo(days: number): string {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

// ─── Dashboard Stats ────────────────────────────────────

export async function getAdminDashboardStats(supabase: SupabaseClient) {
  const [
    { count: totalUsers },
    { count: activeUsers7d },
    { count: newUsers7d },
    { count: totalWorkouts },
    { count: totalMeals },
    { count: totalArticles },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true })
      .gte("last_active_at", daysAgo(7)),
    supabase.from("profiles").select("*", { count: "exact", head: true })
      .gte("created_at", daysAgo(7)),
    supabase.from("workouts").select("*", { count: "exact", head: true }),
    supabase.from("meals").select("*", { count: "exact", head: true }),
    supabase.from("wiki_articles").select("*", { count: "exact", head: true }),
  ]);

  // Previous period for trend calculation
  const [
    { count: activeUsersPrev },
    { count: newUsersPrev },
    { count: workoutsPrev },
    { count: mealsPrev },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true })
      .gte("last_active_at", daysAgo(14)).lt("last_active_at", daysAgo(7)),
    supabase.from("profiles").select("*", { count: "exact", head: true })
      .gte("created_at", daysAgo(14)).lt("created_at", daysAgo(7)),
    supabase.from("workouts").select("*", { count: "exact", head: true })
      .gte("created_at", daysAgo(14)).lt("created_at", daysAgo(7)),
    supabase.from("meals").select("*", { count: "exact", head: true })
      .gte("created_at", daysAgo(14)).lt("created_at", daysAgo(7)),
  ]);

  return {
    totalUsers: totalUsers ?? 0,
    activeUsers7d: activeUsers7d ?? 0,
    activeUsersPrev: activeUsersPrev ?? 0,
    newUsers7d: newUsers7d ?? 0,
    newUsersPrev: newUsersPrev ?? 0,
    totalWorkouts: totalWorkouts ?? 0,
    workoutsPrev: workoutsPrev ?? 0,
    totalMeals: totalMeals ?? 0,
    mealsPrev: mealsPrev ?? 0,
    totalArticles: totalArticles ?? 0,
  };
}

// ─── User Growth Data (for charts) ─────────────────────

export async function getUserGrowthData(supabase: SupabaseClient, days: number = 30) {
  const { data } = await supabase
    .from("profiles")
    .select("created_at")
    .gte("created_at", daysAgo(days))
    .order("created_at", { ascending: true });

  if (!data) return [];

  // Group by date
  const grouped: Record<string, number> = {};
  data.forEach((row) => {
    const date = new Date(row.created_at).toISOString().split("T")[0];
    grouped[date] = (grouped[date] || 0) + 1;
  });

  // Fill missing dates
  const result = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    result.push({ date, count: grouped[date] || 0 });
  }
  return result;
}

// ─── Activity Trends (workouts + meals per day) ────────

export async function getActivityTrends(supabase: SupabaseClient, days: number = 30) {
  const [{ data: workouts }, { data: meals }] = await Promise.all([
    supabase.from("workouts").select("created_at").gte("created_at", daysAgo(days)),
    supabase.from("meals").select("created_at").gte("created_at", daysAgo(days)),
  ]);

  const workoutsByDay: Record<string, number> = {};
  const mealsByDay: Record<string, number> = {};

  (workouts || []).forEach((w) => {
    const d = new Date(w.created_at).toISOString().split("T")[0];
    workoutsByDay[d] = (workoutsByDay[d] || 0) + 1;
  });
  (meals || []).forEach((m) => {
    const d = new Date(m.created_at).toISOString().split("T")[0];
    mealsByDay[d] = (mealsByDay[d] || 0) + 1;
  });

  const result = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    result.push({
      date,
      workouts: workoutsByDay[date] || 0,
      meals: mealsByDay[date] || 0,
    });
  }
  return result;
}

// ─── Gamification Stats ────────────────────────────────

export async function getGamificationStats(supabase: SupabaseClient) {
  const { data: stats } = await supabase
    .from("user_stats")
    .select("level");

  if (!stats) return { levelDistribution: [], avgLevel: 0 };

  const buckets: Record<string, number> = {
    "1-5": 0, "6-10": 0, "11-20": 0, "21+": 0,
  };

  let totalLevel = 0;
  stats.forEach((s) => {
    const lvl = s.level || 1;
    totalLevel += lvl;
    if (lvl <= 5) buckets["1-5"]++;
    else if (lvl <= 10) buckets["6-10"]++;
    else if (lvl <= 20) buckets["11-20"]++;
    else buckets["21+"]++;
  });

  return {
    levelDistribution: Object.entries(buckets).map(([range, count]) => ({ range, count })),
    avgLevel: stats.length > 0 ? Math.round(totalLevel / stats.length) : 0,
  };
}

// ─── Role Distribution ─────────────────────────────────

export async function getRoleDistribution(supabase: SupabaseClient) {
  const { data } = await supabase
    .from("profiles")
    .select("role");

  if (!data) return [];

  const counts: Record<string, number> = {};
  data.forEach((p) => {
    const role = p.role || "free";
    counts[role] = (counts[role] || 0) + 1;
  });

  return Object.entries(counts).map(([role, count]) => ({ role, count }));
}

// ─── Recent Activity ───────────────────────────────────

export async function getRecentSignups(supabase: SupabaseClient, limit: number = 10) {
  const { data } = await supabase
    .from("profiles")
    .select("id, display_name, email, role, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  return data || [];
}

export async function getRecentWorkouts(supabase: SupabaseClient, limit: number = 10) {
  const { data } = await supabase
    .from("workouts")
    .select("id, user_id, name, duration_minutes, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  return data || [];
}

// ─── Wiki Stats ────────────────────────────────────────

export async function getPopularArticles(supabase: SupabaseClient, limit: number = 5) {
  const { data } = await supabase
    .from("wiki_articles")
    .select("slug, title, view_count, category")
    .order("view_count", { ascending: false })
    .limit(limit);

  return data || [];
}
```

**Step 2: Commit**

```bash
git add lib/admin/queries.ts
git commit -m "feat(admin): add shared query layer for admin dashboard"
```

---

## Task 6: Loading & Error States

**Files:**
- Create: `app/(protected)/admin/loading.tsx`
- Create: `app/(protected)/admin/error.tsx`
- Create: `app/(protected)/admin/users/loading.tsx`
- Create: `app/(protected)/admin/content/loading.tsx`
- Create: `app/(protected)/admin/feedback/loading.tsx`
- Create: `app/(protected)/admin/settings/loading.tsx`

**Step 1: Create shared admin skeleton component**

Create `components/admin/admin-skeleton.tsx`:

```tsx
export function AdminSkeleton() {
  return (
    <div className="p-6 lg:p-10 space-y-6 max-w-7xl mx-auto animate-pulse">
      {/* Header skeleton */}
      <div>
        <div className="h-8 w-48 bg-white/[0.06] rounded-lg" />
        <div className="h-4 w-72 bg-white/[0.04] rounded-lg mt-2" />
      </div>

      {/* Stats grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl p-5 bg-[#1c1f27] border border-white/[0.06] h-28" />
        ))}
      </div>

      {/* Content skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl p-5 bg-[#1c1f27] border border-white/[0.06] h-64" />
        <div className="rounded-xl p-5 bg-[#1c1f27] border border-white/[0.06] h-64" />
      </div>
    </div>
  );
}
```

**Step 2: Create admin loading pages**

Each `loading.tsx` imports and renders `AdminSkeleton`:

```tsx
import { AdminSkeleton } from "@/components/admin/admin-skeleton";

export default function Loading() {
  return <AdminSkeleton />;
}
```

**Step 3: Create admin error boundary**

Create `app/(protected)/admin/error.tsx`:

```tsx
"use client";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto">
      <div className="rounded-xl p-8 bg-[#1c1f27] border border-white/[0.06] text-center">
        <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
        <p className="text-[#9da6b9] mb-4">{error.message}</p>
        <button
          onClick={reset}
          className="px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
```

**Step 4: Commit**

```bash
git add components/admin/admin-skeleton.tsx app/(protected)/admin/loading.tsx app/(protected)/admin/error.tsx app/(protected)/admin/users/loading.tsx app/(protected)/admin/content/loading.tsx app/(protected)/admin/feedback/loading.tsx app/(protected)/admin/settings/loading.tsx
git commit -m "feat(admin): add loading skeletons and error boundaries"
```

---

## Task 7: Reusable Admin Components

**Files:**
- Create: `components/admin/stats-card.tsx`
- Create: `components/admin/chart-card.tsx`
- Create: `components/admin/status-badge.tsx`

### Step 1: Create stats-card component

Create `components/admin/stats-card.tsx`:

```tsx
"use client";

import { type LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface StatsCardProps {
  title: string;
  value: number;
  previousValue?: number;
  format?: "number" | "percentage";
  icon: LucideIcon;
  delay?: number;
}

function formatNumber(value: number): string {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return value.toLocaleString();
}

function getTrend(current: number, previous: number) {
  if (previous === 0) return null;
  const change = ((current - previous) / previous) * 100;
  return { value: Math.abs(Math.round(change)), isPositive: change >= 0 };
}

export function StatsCard({ title, value, previousValue, format = "number", icon: Icon, delay = 0 }: StatsCardProps) {
  const trend = previousValue !== undefined ? getTrend(value, previousValue) : null;
  const displayValue = format === "percentage" ? `${value}%` : formatNumber(value);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="rounded-xl p-5 bg-[#1c1f27] border border-white/[0.06]"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">{title}</p>
          <p className="text-3xl font-bold text-white tracking-tight">{displayValue}</p>
          {trend && (
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium mt-2 ${
                trend.isPositive
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "bg-red-500/10 text-red-400"
              }`}
            >
              {trend.isPositive ? "↑" : "↓"} {trend.value}%
            </span>
          )}
        </div>
        <Icon className="h-5 w-5 text-slate-500" />
      </div>
    </motion.div>
  );
}
```

### Step 2: Create chart-card component

Create `components/admin/chart-card.tsx`:

```tsx
"use client";

import { motion } from "framer-motion";

interface ChartCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export function ChartCard({ title, description, children, className, delay = 0 }: ChartCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`rounded-xl p-5 bg-[#1c1f27] border border-white/[0.06] ${className ?? ""}`}
    >
      <div className="mb-4">
        <h3 className="text-sm font-medium text-white">{title}</h3>
        {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
      </div>
      {children}
    </motion.div>
  );
}
```

### Step 3: Create status-badge component

Create `components/admin/status-badge.tsx`:

```tsx
const ROLE_STYLES: Record<string, string> = {
  admin: "bg-purple-500/10 text-purple-400",
  dedicated: "bg-blue-500/10 text-blue-400",
  member: "bg-slate-500/10 text-slate-400",
  free: "bg-white/5 text-slate-500",
};

const STATUS_STYLES: Record<string, string> = {
  active: "bg-emerald-500/10 text-emerald-400",
  banned: "bg-rose-500/10 text-rose-400",
  inactive: "bg-white/5 text-slate-500",
};

const FEEDBACK_STYLES: Record<string, string> = {
  new: "bg-amber-500/10 text-amber-400",
  reviewed: "bg-blue-500/10 text-blue-400",
  addressed: "bg-emerald-500/10 text-emerald-400",
};

interface StatusBadgeProps {
  variant: "role" | "status" | "feedback";
  value: string;
}

export function StatusBadge({ variant, value }: StatusBadgeProps) {
  const styles = variant === "role"
    ? ROLE_STYLES
    : variant === "status"
    ? STATUS_STYLES
    : FEEDBACK_STYLES;

  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${styles[value] || "bg-white/5 text-slate-500"}`}>
      {value}
    </span>
  );
}
```

### Step 4: Commit

```bash
git add components/admin/stats-card.tsx components/admin/chart-card.tsx components/admin/status-badge.tsx
git commit -m "feat(admin): add reusable stats-card, chart-card, and status-badge components"
```

---

## Task 8: Dashboard Rebuild

**Files:**
- Modify: `app/(protected)/admin/page.tsx`

**Depends on:** Task 5 (queries), Task 7 (components), Task 0.3 (RLS policies)

**Step 1: Rebuild the dashboard page**

Replace the entire `app/(protected)/admin/page.tsx` with a new version that:

1. Imports from `lib/admin/queries.ts` for all data
2. Uses `StatsCard` components for the 6 metric cards
3. Uses `ChartCard` + Recharts for 4 charts:
   - User Growth (AreaChart)
   - Daily Activity (BarChart, stacked workouts + meals)
   - Role Distribution (PieChart)
   - Level Distribution (BarChart)
4. Uses `StatusBadge` for role badges in recent signups
5. Has the page container pattern: `p-6 lg:p-10 space-y-6 max-w-7xl mx-auto`
6. Uses Framer Motion staggered animations

**Key imports:**
```tsx
import { createClient } from "@/lib/supabase/server";
import {
  getAdminDashboardStats,
  getUserGrowthData,
  getActivityTrends,
  getRoleDistribution,
  getGamificationStats,
  getRecentSignups,
  getRecentWorkouts,
  getPopularArticles,
} from "@/lib/admin/queries";
```

**Recharts imports** (use the shadcn chart wrapper):
```tsx
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
```

**Chart colors:**
```tsx
const CHART_COLORS = {
  primary: "#f59e0b",   // amber (admin accent)
  secondary: "#3b82f6", // blue
  tertiary: "#a855f7",  // purple
  success: "#10b981",   // emerald
};

const ROLE_COLORS: Record<string, string> = {
  admin: "#a855f7",
  dedicated: "#3b82f6",
  member: "#64748b",
  free: "#334155",
};
```

**Recharts dark theme tooltip:**
```tsx
<Tooltip
  contentStyle={{
    backgroundColor: "#1c1f27",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "8px",
    color: "#fff",
  }}
/>
```

**Recharts axis styling:**
```tsx
<XAxis
  dataKey="date"
  stroke="#334155"
  tick={{ fill: "#64748b", fontSize: 12 }}
  tickLine={false}
  axisLine={false}
/>
```

**Step 2: Verify**

Run: `pnpm dev`, navigate to `/admin`. Dashboard should show:
- 6 stats cards with trend indicators
- 4 charts with dark theme
- Recent signups + recent workouts lists
- All with smooth staggered entrance animations

**Step 3: Commit**

```bash
git add app/(protected)/admin/page.tsx
git commit -m "feat(admin): rebuild dashboard with charts, trends, and Apple-style design"
```

---

## Task 9: Content Moderation Actions

**Files:**
- Modify: `app/(protected)/admin/content/page.tsx`
- Create: `app/actions/admin/content.ts`

### Step 1: Create content server actions

Create `app/actions/admin/content.ts`:

```typescript
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") throw new Error("Unauthorized");
  return supabase;
}

export async function toggleArticlePublished(slug: string, isPublished: boolean) {
  const supabase = await requireAdmin();

  const { error } = await supabase
    .from("wiki_articles")
    .update({ is_published: isPublished })
    .eq("slug", slug);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/content");
}

export async function softDeleteArticle(slug: string) {
  const supabase = await requireAdmin();

  const { error } = await supabase
    .from("wiki_articles")
    .update({ is_published: false })
    .eq("slug", slug);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/content");
}
```

### Step 2: Add actions + pagination to content page

Update `app/(protected)/admin/content/page.tsx`:
- Add pagination with URL search params (same pattern as users page)
- Add publish/unpublish toggle button per article
- Add soft-delete button with confirmation
- Use `StatusBadge` for published/draft status
- Use toast for success/error feedback
- Dark theme styling

### Step 3: Commit

```bash
git add app/actions/admin/content.ts app/(protected)/admin/content/page.tsx
git commit -m "feat(admin): add content moderation actions and pagination"
```

---

## Task 10: Feedback Workflow

**Files:**
- Modify: `app/(protected)/admin/feedback/page.tsx`
- Create: `app/actions/admin/feedback.ts`

**Depends on:** Task 0.1 (confirm feedback table exists and its schema)

### Step 1: Create feedback server actions

Create `app/actions/admin/feedback.ts`:

```typescript
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") throw new Error("Unauthorized");
  return supabase;
}

export async function updateFeedbackStatus(id: string, status: string) {
  const supabase = await requireAdmin();

  const { error } = await supabase
    .from("feedback")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/feedback");
}

export async function updateFeedbackNotes(id: string, adminNotes: string) {
  const supabase = await requireAdmin();

  const { error } = await supabase
    .from("feedback")
    .update({ admin_notes: adminNotes, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/feedback");
}
```

### Step 2: Rebuild feedback page

Update `app/(protected)/admin/feedback/page.tsx`:
- Status change buttons (new → reviewed → addressed)
- Admin notes textarea per item
- Type filter via URL search params (bug/feature/other)
- Pagination
- `StatusBadge` for type and status
- Toast feedback
- Dark theme

### Step 3: Commit

```bash
git add app/actions/admin/feedback.ts app/(protected)/admin/feedback/page.tsx
git commit -m "feat(admin): add feedback status workflow and admin notes"
```

---

## Task 11: Settings Persistence

**Files:**
- Modify: `app/(protected)/admin/settings/page.tsx`
- Create: `app/actions/admin/settings.ts`
- Modify: `components/admin/settings-save-button.tsx`

**Depends on:** Task 0.2 (app_settings table must exist)

### Step 1: Create settings server actions

Create `app/actions/admin/settings.ts`:

```typescript
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") throw new Error("Unauthorized");
  return { supabase, userId: user.id };
}

export async function getSettings() {
  const { supabase } = await requireAdmin();

  const { data } = await supabase
    .from("app_settings")
    .select("key, value");

  const settings: Record<string, any> = {};
  (data || []).forEach((row) => {
    settings[row.key] = row.value;
  });
  return settings;
}

export async function saveSetting(key: string, value: any) {
  const { supabase, userId } = await requireAdmin();

  const { error } = await supabase
    .from("app_settings")
    .upsert(
      { key, value, updated_by: userId, updated_at: new Date().toISOString() },
      { onConflict: "key" }
    );

  if (error) throw new Error(error.message);
  revalidatePath("/admin/settings");
}

export async function saveSettingsSection(section: string, values: Record<string, any>) {
  const { supabase, userId } = await requireAdmin();

  const rows = Object.entries(values).map(([k, v]) => ({
    key: `${section}.${k}`,
    value: v,
    updated_by: userId,
    updated_at: new Date().toISOString(),
  }));

  const { error } = await supabase
    .from("app_settings")
    .upsert(rows, { onConflict: "key" });

  if (error) throw new Error(error.message);
  revalidatePath("/admin/settings");
}
```

### Step 2: Update settings save button to use toast

Modify `components/admin/settings-save-button.tsx` to import and use sonner:

```tsx
import { toast } from "sonner";

// In the save handler:
try {
  await onSave();
  toast.success("Settings saved");
} catch (error) {
  toast.error("Failed to save settings");
}
```

### Step 3: Convert settings page

The settings page needs to change from pure client-side state to loading initial values from `app_settings` and saving via Server Actions. This is a significant rewrite:

1. Make the page a Server Component that loads settings via `getSettings()`
2. Pass initial values to a client component `SettingsForm` that handles the UI
3. Each section save calls `saveSettingsSection(sectionName, values)`
4. Toast feedback on success/error

### Step 4: Commit

```bash
git add app/actions/admin/settings.ts app/(protected)/admin/settings/page.tsx components/admin/settings-save-button.tsx
git commit -m "feat(admin): add settings persistence via app_settings table"
```

---

## Summary of All Commits

| Task | Commit Message |
|------|---------------|
| 0.2 | `chore(db): add admin panel prerequisite migration` |
| 0.3 | `chore(db): add admin RLS policies for cross-user data access` |
| 1 | `feat(admin): add sonner toast notification system` |
| 2 | `fix(admin): remove dead Database nav link` |
| 3 | `fix(admin): fix table names, add self-demotion protection, soft-delete users` |
| 4.1 | `feat(admin): convert dashboard to dark theme` |
| 4.2 | `feat(admin): convert content page to dark theme` |
| 4.3 | `feat(admin): convert feedback page to dark theme` |
| 4.4 | `feat(admin): convert settings page and components to dark theme` |
| 4.5 | `feat(admin): align users page to standard dark theme tokens` |
| 5 | `feat(admin): add shared query layer for admin dashboard` |
| 6 | `feat(admin): add loading skeletons and error boundaries` |
| 7 | `feat(admin): add reusable stats-card, chart-card, and status-badge components` |
| 8 | `feat(admin): rebuild dashboard with charts, trends, and Apple-style design` |
| 9 | `feat(admin): add content moderation actions and pagination` |
| 10 | `feat(admin): add feedback status workflow and admin notes` |
| 11 | `feat(admin): add settings persistence via app_settings table` |
