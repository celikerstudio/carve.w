# Admin Panel Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a complete admin panel with monitoring dashboard, user management, content moderation, and app configuration — using the same Apple-style dark UI as the existing health/money dashboards.

**Architecture:** Server Components for all pages, Server Actions for mutations, shared query layer in `lib/admin/queries.ts`, Recharts for charts, sonner for toasts. All data fetched via Supabase with RLS policies allowing admin access.

**Tech Stack:** Next.js 16 App Router, Supabase, Recharts, sonner, shadcn/ui, Tailwind CSS, Framer Motion, Lucide icons

**Design doc:** `docs/plans/2026-03-03-admin-panel-design.md`
**DB Audit:** `docs/plans/2026-03-03-db-audit-results.md`

---

## DB Audit Corrections (CRITICAL — read before implementing)

The production database differs fundamentally from what the existing admin code assumes:

| Code assumes | Production reality |
|---|---|
| `profiles.role` column | **Does not exist.** Roles via `profiles.user_role_id` → `user_roles` table |
| `profiles.is_banned`, `is_active`, `ban_reason` | **Do not exist.** No ban mechanism in DB |
| `workouts` table | **Does not exist.** Called `completed_workouts` |
| `feedback` table | **Does not exist.** Called `feature_requests` (+ `feature_request_votes`) |
| `user_stats.level`, `user_stats.total_xp` | **Not on `user_stats`.** `level` and `total_xp` are on `profiles` |
| `user_stats.current_streak` | Called `current_workout_streak` on `user_stats` |
| Open SELECT on `user_stats` | **Only own data** (`auth.uid() = user_id`) |
| Any admin RLS policy | **None exist.** Zero admin policies in production |

**Admin role IDs (from `user_roles` table):**
- admin: `7171e054-3cd4-4cae-b552-f6c6ad2b9114`
- moderator: `f4430f4d-a18d-4e54-a2fa-53293a90e365`
- user: `1d341a14-9656-4857-b783-75fc47880aba`

---

## Task 0: Prerequisites — Database & RLS

### Task 0.1: Productie Database Audit

**DONE.** Results saved in `docs/plans/2026-03-03-db-audit-results.md`.

---

### Task 0.2: Admin Prerequisites Migration

**Files:**
- Create: `supabase/migrations/YYYYMMDDHHMMSS_admin_panel_prerequisites.sql`

**Step 1: Create migration via Supabase MCP**

Use `mcp__supabase__apply_migration` with project_id `utsmljikejvtfcehmhqc`.

```sql
-- ===========================================
-- Admin Panel Prerequisites
-- ===========================================

-- 1. App Settings table for admin configuration
CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_by UUID REFERENCES profiles(id),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read settings (for feature flags, iOS app)
CREATE POLICY "authenticated_read_settings" ON app_settings
  FOR SELECT TO authenticated USING (true);

-- Only admins can manage settings
CREATE POLICY "admin_manage_settings" ON app_settings
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM profiles p
      JOIN user_roles ur ON p.user_role_id = ur.id
      WHERE p.id = auth.uid() AND ur.name = 'admin'
    )
  );
```

**Step 2: Also save the migration file locally**

Create `supabase/migrations/20260303000001_admin_panel_prerequisites.sql` with the same SQL.

**Step 3: Commit**

```bash
git add supabase/migrations/
git commit -m "chore(db): add app_settings table for admin configuration"
```

---

### Task 0.3: Admin RLS Policies

**Files:**
- Create: `supabase/migrations/YYYYMMDDHHMMSS_admin_rls_policies.sql`

Apply via Supabase MCP with project_id `utsmljikejvtfcehmhqc`.

**Important:** The admin check must join `profiles` → `user_roles` since there is no `role` column on `profiles`.

```sql
-- ===========================================
-- Admin RLS Policies
-- ===========================================
-- Admin check pattern: join profiles.user_role_id → user_roles.name = 'admin'

-- Helper function for admin check (reusable in all policies)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles p
    JOIN user_roles ur ON p.user_role_id = ur.id
    WHERE p.id = auth.uid() AND ur.name = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- completed_workouts: admin can read all
DROP POLICY IF EXISTS "Users can view their own completed workouts" ON completed_workouts;
CREATE POLICY "users_or_admin_select_completed_workouts" ON completed_workouts
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

-- meals: admin can read all
DROP POLICY IF EXISTS "Users can manage their own meals" ON meals;
CREATE POLICY "users_select_meals" ON meals
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());
CREATE POLICY "users_manage_own_meals" ON meals
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- activity_feed: admin can read all
DROP POLICY IF EXISTS "activity_feed_select_policy" ON activity_feed;
CREATE POLICY "users_or_admin_select_activity_feed" ON activity_feed
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR public.is_admin()
    OR user_id IN (
      SELECT friendships.addressee_id FROM friendships
      WHERE friendships.requester_id = auth.uid() AND friendships.status = 'accepted'
      UNION
      SELECT friendships.requester_id FROM friendships
      WHERE friendships.addressee_id = auth.uid() AND friendships.status = 'accepted'
    )
    OR user_id IN (SELECT id FROM profiles WHERE public_profile = true)
  );

-- user_stats: admin can read all (currently own-only)
DROP POLICY IF EXISTS "Users can view their own stats" ON user_stats;
CREATE POLICY "users_or_admin_select_user_stats" ON user_stats
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

-- user_achievements: admin can read all
CREATE POLICY "admin_select_all_user_achievements" ON user_achievements
  FOR SELECT TO authenticated
  USING (public.is_admin());

-- profiles: admin can view ALL profiles (current policies only show own + public)
CREATE POLICY "admin_select_all_profiles" ON profiles
  FOR SELECT TO authenticated
  USING (public.is_admin());

-- profiles: admin can update any profile
CREATE POLICY "admin_update_all_profiles" ON profiles
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- feature_requests: admin can read and manage all
CREATE POLICY "admin_manage_feature_requests" ON feature_requests
  FOR ALL TO authenticated
  USING (public.is_admin());

-- chat_quota: admin can read all
CREATE POLICY "admin_select_chat_quota" ON chat_quota
  FOR SELECT TO authenticated
  USING (public.is_admin());

-- user_subscriptions: admin can read all
CREATE POLICY "admin_select_user_subscriptions" ON user_subscriptions
  FOR SELECT TO authenticated
  USING (public.is_admin());
```

**Step 2: Save migration locally and commit**

```bash
git add supabase/migrations/
git commit -m "chore(db): add admin RLS policies with is_admin() helper function"
```

---

## Task 1: Install Sonner + Add Toaster

**DONE.** Committed as `c5ced63`.

---

## Task 2: Clean Up Admin Navigation Config

**Files:**
- Modify: `lib/navigation/admin-navigation.ts`

Remove the dead "Database" link (line 48-53, points to `/admin/database` which doesn't exist).

Keep the rest unchanged. New items will be added per phase.

**Commit:** `fix(admin): remove dead Database nav link`

---

## Task 3: Fix Admin Auth + Bug Fixes

**This is the biggest change from the original plan.** The entire admin auth system needs to be rewritten because `profiles.role` doesn't exist.

**Files:**
- Create: `lib/admin/auth.ts` — shared admin auth helper
- Modify: `app/(protected)/admin/layout.tsx` — fix auth check
- Modify: `app/actions/admin/users.ts` — fix all actions
- Modify: `app/(protected)/admin/users/[id]/page.tsx` — fix table names

### Step 1: Create shared admin auth helper

Create `lib/admin/auth.ts`:

```typescript
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

const ADMIN_ROLE_ID = "7171e054-3cd4-4cae-b552-f6c6ad2b9114";

/**
 * Check if the current user is an admin.
 * Uses user_role_id on profiles joined to user_roles table.
 */
export async function isAdmin(): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data: profile } = await supabase
    .from("profiles")
    .select("user_role_id")
    .eq("id", user.id)
    .single();

  return profile?.user_role_id === ADMIN_ROLE_ID;
}

/**
 * Require admin access. Throws if not admin.
 * For use in Server Actions.
 */
export async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { data: profile } = await supabase
    .from("profiles")
    .select("user_role_id")
    .eq("id", user.id)
    .single();

  if (profile?.user_role_id !== ADMIN_ROLE_ID) {
    throw new Error("Unauthorized");
  }

  return { supabase, user };
}

/**
 * Require admin for page access. Redirects if not admin.
 * For use in Server Components (layouts, pages).
 */
export async function requireAdminOrRedirect() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/dashboard/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("user_role_id")
    .eq("id", user.id)
    .single();

  if (profile?.user_role_id !== ADMIN_ROLE_ID) {
    redirect("/dashboard");
  }

  return { supabase, user };
}

/**
 * Get user's role name by looking up user_roles table.
 */
export async function getUserRoleName(supabase: any, userId: string): Promise<string> {
  const { data } = await supabase
    .from("profiles")
    .select("user_role_id, user_roles(name)")
    .eq("id", userId)
    .single();

  return data?.user_roles?.name || "user";
}
```

### Step 2: Fix admin layout

Replace `app/(protected)/admin/layout.tsx`:

```typescript
import { requireAdminOrRedirect } from "@/lib/admin/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdminOrRedirect();
  return <>{children}</>;
}
```

### Step 3: Rewrite all admin user actions

Replace `app/actions/admin/users.ts` — every action uses `requireAdmin()` from the new helper and uses correct column names. Key changes:
- All `profile.role` checks → `requireAdmin()`
- `banUser`/`unbanUser` — since `is_banned`/`is_active` don't exist, we need to decide: either add these columns in the migration, or use a different approach. **Recommended:** Remove ban/unban for now, keep only `updateUserProfile` and `changeUserRole` (via `user_role_id`).
- `changeUserRole` → updates `user_role_id` with the UUID from `user_roles`, not a string
- `deleteUser` → soft-approach: we don't have ban columns, so remove this action for now
- Add self-demotion protection

```typescript
"use server";

import { requireAdmin } from "@/lib/admin/auth";
import { revalidatePath } from "next/cache";

// Role UUIDs from user_roles table
const ROLE_IDS: Record<string, string> = {
  admin: "7171e054-3cd4-4cae-b552-f6c6ad2b9114",
  moderator: "f4430f4d-a18d-4e54-a2fa-53293a90e365",
  user: "1d341a14-9656-4857-b783-75fc47880aba",
};

export async function updateUserProfile(userId: string, data: {
  display_name?: string;
  username?: string;
  bio?: string;
}) {
  const { supabase } = await requireAdmin();

  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: data.display_name,
      username: data.username,
      bio: data.bio,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) return { error: error.message };

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
  return { success: true };
}

export async function changeUserRole(userId: string, roleName: string) {
  const { supabase, user } = await requireAdmin();

  // Prevent self-demotion
  if (user.id === userId && roleName !== "admin") {
    return { error: "Cannot change your own admin role" };
  }

  const roleId = ROLE_IDS[roleName];
  if (!roleId) return { error: `Unknown role: ${roleName}` };

  const { error } = await supabase
    .from("profiles")
    .update({
      user_role_id: roleId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) return { error: error.message };

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
  return { success: true };
}
```

### Step 4: Fix user detail page table/column names

In `app/(protected)/admin/users/[id]/page.tsx`:
- `activity_log` → `activity_feed`
- `workouts` query with `duration` → `completed_workouts` with `total_duration_minutes`
- Role display: join on `user_roles` to get role name
- Remove `is_banned`/`is_active` references (these columns don't exist)

### Step 5: Fix users list page

In `app/(protected)/admin/users/page.tsx`:
- Remove `is_banned`, `is_active` from SELECT and filters
- Add join to get role name: `.select("id, email, display_name, username, user_role_id, user_roles(name), created_at, last_active_at")`
- Update filter logic to use `user_role_id` instead of `role`
- Remove status filter (active/inactive/banned) since these columns don't exist

### Step 6: Commit

```bash
git add lib/admin/auth.ts app/(protected)/admin/layout.tsx app/actions/admin/users.ts app/(protected)/admin/users/page.tsx app/(protected)/admin/users/[id]/page.tsx
git commit -m "fix(admin): rewrite auth to use user_roles table, fix all table/column names"
```

---

## Task 4: Dark Theme Conversion (all admin pages)

Same as original plan. Convert dashboard, content, feedback, settings pages from light to dark theme.

**Card pattern:** `bg-[#1c1f27] border border-white/[0.06] rounded-xl p-5`
**Page container:** `p-6 lg:p-10 space-y-6 max-w-7xl mx-auto`
**Typography:** `text-xs uppercase tracking-wider text-slate-500` for labels, `text-3xl font-bold text-white tracking-tight` for values

Also align users page from `bg-[#0a0e1a]`/`bg-[#1a1f2e]` to `bg-[#1c1f27]`.

**5 sub-commits:**
- `feat(admin): convert dashboard to dark theme`
- `feat(admin): convert content page to dark theme`
- `feat(admin): convert feedback page to dark theme`
- `feat(admin): convert settings page and components to dark theme`
- `feat(admin): align users page to standard dark theme tokens`

---

## Task 5: Shared Query Layer

**Files:**
- Create: `lib/admin/queries.ts`

**All queries use production table names:**

```typescript
import { SupabaseClient } from "@supabase/supabase-js";

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
    supabase.from("completed_workouts").select("*", { count: "exact", head: true }),
    supabase.from("meals").select("*", { count: "exact", head: true }),
    supabase.from("wiki_articles").select("*", { count: "exact", head: true }),
  ]);

  // Previous period for trends
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
    supabase.from("completed_workouts").select("*", { count: "exact", head: true })
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

// ─── User Growth (chart) ───────────────────────────────

export async function getUserGrowthData(supabase: SupabaseClient, days = 30) {
  const { data } = await supabase
    .from("profiles")
    .select("created_at")
    .gte("created_at", daysAgo(days))
    .order("created_at", { ascending: true });

  if (!data) return [];

  const grouped: Record<string, number> = {};
  data.forEach((row) => {
    const date = new Date(row.created_at).toISOString().split("T")[0];
    grouped[date] = (grouped[date] || 0) + 1;
  });

  const result = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(Date.now() - i * 86400000).toISOString().split("T")[0];
    result.push({ date, count: grouped[date] || 0 });
  }
  return result;
}

// ─── Activity Trends (chart) ───────────────────────────

export async function getActivityTrends(supabase: SupabaseClient, days = 30) {
  const [{ data: workouts }, { data: meals }] = await Promise.all([
    supabase.from("completed_workouts").select("created_at").gte("created_at", daysAgo(days)),
    supabase.from("meals").select("created_at").gte("created_at", daysAgo(days)),
  ]);

  const wByDay: Record<string, number> = {};
  const mByDay: Record<string, number> = {};

  (workouts || []).forEach((w) => {
    const d = new Date(w.created_at).toISOString().split("T")[0];
    wByDay[d] = (wByDay[d] || 0) + 1;
  });
  (meals || []).forEach((m) => {
    const d = new Date(m.created_at).toISOString().split("T")[0];
    mByDay[d] = (mByDay[d] || 0) + 1;
  });

  const result = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(Date.now() - i * 86400000).toISOString().split("T")[0];
    result.push({ date, workouts: wByDay[date] || 0, meals: mByDay[date] || 0 });
  }
  return result;
}

// ─── Gamification Stats (chart) ────────────────────────
// Note: level and total_xp are on profiles, NOT user_stats

export async function getGamificationStats(supabase: SupabaseClient) {
  const { data } = await supabase
    .from("profiles")
    .select("level");

  if (!data) return { levelDistribution: [], avgLevel: 0 };

  const buckets: Record<string, number> = { "1-5": 0, "6-10": 0, "11-20": 0, "21+": 0 };
  let totalLevel = 0;

  data.forEach((p) => {
    const lvl = p.level || 1;
    totalLevel += lvl;
    if (lvl <= 5) buckets["1-5"]++;
    else if (lvl <= 10) buckets["6-10"]++;
    else if (lvl <= 20) buckets["11-20"]++;
    else buckets["21+"]++;
  });

  return {
    levelDistribution: Object.entries(buckets).map(([range, count]) => ({ range, count })),
    avgLevel: data.length > 0 ? Math.round(totalLevel / data.length) : 0,
  };
}

// ─── Role Distribution (chart) ─────────────────────────
// Join profiles.user_role_id → user_roles.name

export async function getRoleDistribution(supabase: SupabaseClient) {
  const { data } = await supabase
    .from("profiles")
    .select("user_role_id, user_roles(name)");

  if (!data) return [];

  const counts: Record<string, number> = {};
  data.forEach((p: any) => {
    const role = p.user_roles?.name || "user";
    counts[role] = (counts[role] || 0) + 1;
  });

  return Object.entries(counts).map(([role, count]) => ({ role, count }));
}

// ─── Recent Activity ───────────────────────────────────

export async function getRecentSignups(supabase: SupabaseClient, limit = 10) {
  const { data } = await supabase
    .from("profiles")
    .select("id, display_name, email, user_role_id, user_roles(name), created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  return data || [];
}

export async function getRecentWorkouts(supabase: SupabaseClient, limit = 10) {
  const { data } = await supabase
    .from("completed_workouts")
    .select("id, user_id, name, total_duration_minutes, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  return data || [];
}

// ─── Wiki Stats ────────────────────────────────────────

export async function getPopularArticles(supabase: SupabaseClient, limit = 5) {
  const { data } = await supabase
    .from("wiki_articles")
    .select("slug, title, view_count, category")
    .order("view_count", { ascending: false })
    .limit(limit);
  return data || [];
}

// ─── Subscription Stats ────────────────────────────────

export async function getSubscriptionStats(supabase: SupabaseClient) {
  const { data } = await supabase
    .from("user_subscriptions")
    .select("tier, will_renew, cancelled_at, trial_ends_at");

  if (!data) return { total: 0, tiers: [] };

  const tierCounts: Record<string, number> = {};
  data.forEach((s: any) => {
    const tier = s.tier || "free";
    tierCounts[tier] = (tierCounts[tier] || 0) + 1;
  });

  return {
    total: data.length,
    tiers: Object.entries(tierCounts).map(([tier, count]) => ({ tier, count })),
  };
}
```

**Commit:** `feat(admin): add shared query layer with production table names`

---

## Task 6: Loading & Error States

Same as original plan — create `AdminSkeleton` component and `loading.tsx`/`error.tsx` for all admin routes. No changes needed from DB audit.

**Commit:** `feat(admin): add loading skeletons and error boundaries`

---

## Task 7: Reusable Admin Components

Same as original plan — `stats-card.tsx`, `chart-card.tsx`, `status-badge.tsx`. No changes needed from DB audit.

One adjustment for `status-badge.tsx`: role badges should match `user_roles.name` values:

```typescript
const ROLE_STYLES: Record<string, string> = {
  admin: "bg-purple-500/10 text-purple-400",
  moderator: "bg-blue-500/10 text-blue-400",
  user: "bg-white/5 text-slate-500",
};
```

**Commit:** `feat(admin): add reusable stats-card, chart-card, and status-badge components`

---

## Task 8: Dashboard Rebuild

Same structure as original plan, but using production table names and the shared query layer.

**Key differences:**
- Import all data from `lib/admin/queries.ts`
- Use `completed_workouts` not `workouts`
- Level/XP data from `profiles.level`/`profiles.total_xp`
- Role distribution via join on `user_roles`
- Add subscription stats card (from `user_subscriptions`)

**Commit:** `feat(admin): rebuild dashboard with charts, trends, and Apple-style design`

---

## Task 9: Content Moderation Actions

Same as original plan. `wiki_articles` table is unchanged from migrations.

**Commit:** `feat(admin): add content moderation actions and pagination`

---

## Task 10: Feature Requests Workflow (was: Feedback)

**Changed:** The table is `feature_requests`, not `feedback`. Different columns.

**Files:**
- Modify: `app/(protected)/admin/feedback/page.tsx`
- Create: `app/actions/admin/feedback.ts`

### Step 1: Create server actions

```typescript
"use server";

import { requireAdmin } from "@/lib/admin/auth";
import { revalidatePath } from "next/cache";

export async function updateFeatureRequestStatus(id: string, status: string) {
  const { supabase } = await requireAdmin();

  const { error } = await supabase
    .from("feature_requests")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/feedback");
}

export async function toggleFeatureRequestVisibility(id: string, isVisible: boolean) {
  const { supabase } = await requireAdmin();

  const { error } = await supabase
    .from("feature_requests")
    .update({ is_visible: isVisible, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/feedback");
}
```

### Step 2: Rebuild feedback page

Query `feature_requests` instead of `feedback`:
- Show: title, description, status, vote_count, is_visible, created_at
- Status change buttons
- Visibility toggle
- Sort by votes
- Pagination

**Commit:** `feat(admin): add feature request management (replaces feedback stubs)`

---

## Task 11: Settings Persistence

Same as original plan, backed by the `app_settings` table created in Task 0.2. Uses `requireAdmin()` from `lib/admin/auth.ts`.

**Commit:** `feat(admin): add settings persistence via app_settings table`

---

## Summary of All Commits

| Task | Commit Message |
|------|---------------|
| 0.2 | `chore(db): add app_settings table for admin configuration` |
| 0.3 | `chore(db): add admin RLS policies with is_admin() helper function` |
| 1 | `feat(admin): add sonner toast notification system` ✅ DONE |
| 2 | `fix(admin): remove dead Database nav link` |
| 3 | `fix(admin): rewrite auth to use user_roles table, fix all table/column names` |
| 4.1-4.5 | `feat(admin): convert [page] to dark theme` (5 commits) |
| 5 | `feat(admin): add shared query layer with production table names` |
| 6 | `feat(admin): add loading skeletons and error boundaries` |
| 7 | `feat(admin): add reusable stats-card, chart-card, and status-badge components` |
| 8 | `feat(admin): rebuild dashboard with charts, trends, and Apple-style design` |
| 9 | `feat(admin): add content moderation actions and pagination` |
| 10 | `feat(admin): add feature request management (replaces feedback stubs)` |
| 11 | `feat(admin): add settings persistence via app_settings table` |
