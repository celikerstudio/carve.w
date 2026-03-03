# Productie Database Audit — Carve

**Date:** 2026-03-03
**Project:** utsmljikejvtfcehmhqc (Carve, eu-west-1)
**Postgres:** v17.6

---

## Samenvatting

De productie database wijkt **fundamenteel** af van zowel de migratie-files als de bestaande admin code. Het admin panel is in de huidige vorm **niet functioneel** in productie.

---

## Kritieke Bevindingen

### 1. `profiles` heeft GEEN `role` kolom

De admin layout checkt `profile.role === 'admin'`, maar `role` bestaat niet. Rollen werken via een **aparte `user_roles` tabel** met FK `profiles.user_role_id`.

**`user_roles` tabel:**

| id | name | display_name | permissions |
|----|------|-------------|-------------|
| 7171e054-... | admin | Admin | read, write, delete, moderate, admin |
| f4430f4d-... | moderator | Moderator | read, write_own, moderate |
| 1d341a14-... | user | User | read, write_own |

**Impact:** Admin auth check moet joinen op `user_roles` ipv `profiles.role`.

### 2. `profiles` heeft GEEN `is_banned`, `is_active`, `ban_reason` kolommen

De admin user management (ban/unban/status filters) schrijft naar kolommen die niet bestaan. Alle ban/unban/status functionaliteit is non-functioneel.

### 3. `workouts` tabel bestaat NIET — heet `completed_workouts`

| Kolom | Type |
|-------|------|
| id | uuid |
| user_id | uuid |
| planned_workout_id | uuid |
| name | text |
| workout_date | timestamptz |
| start_time | timestamptz |
| end_time | timestamptz |
| total_volume_kg | numeric |
| total_sets | integer |
| total_reps | integer |
| intensity_level | text |
| notes | text |
| created_at | timestamptz |
| updated_at | timestamptz |
| total_duration_minutes | integer |
| muscle_groups_targeted | array |
| variant_id | text |

### 4. `feedback` tabel bestaat NIET — heet `feature_requests`

| Kolom | Type |
|-------|------|
| id | uuid |
| user_id | uuid |
| title | text |
| description | text |
| status | text |
| vote_count | integer |
| is_visible | boolean |
| created_at | timestamptz |
| updated_at | timestamptz |

Er is ook een `feature_request_votes` tabel.

### 5. `user_stats` is compleet anders dan migraties

Productie kolommen: id, user_id, total_workouts, total_workout_minutes, current_workout_streak, longest_workout_streak, avg_workout_intensity, favorite_muscle_groups, total_weight_lifted_kg, carve_rank, total_friends, total_achievements, achievement_points, current_week_workouts, updated_at.

**Mist:** `level`, `total_xp`, `last_activity_date` (deze zitten op `profiles` als `level`, `total_xp`).

### 6. Subscription systeem is gebouwd met RevenueCat

`user_subscriptions` tabel:

| Kolom | Type |
|-------|------|
| tier | text |
| trial_started_at / trial_ends_at | timestamptz |
| trial_extended | boolean |
| revenue_cat_customer_id | text |
| revenue_cat_entitlement_id | text |
| app_store_transaction_id | text |
| current_period_start / current_period_end | timestamptz |
| will_renew | boolean |
| cancelled_at | timestamptz |
| earned_pro_expires_at | timestamptz |
| login_streak_current / login_streak_last_date | integer/date |

---

## Tabellen die NIET bestaan

| Code verwacht | Bestaat als | Verschil |
|--------------|-------------|----------|
| `workouts` | `completed_workouts` | Andere naam |
| `feedback` | `feature_requests` | Andere naam + andere kolommen |
| `activity_log` | `activity_feed` | Andere naam |
| `app_settings` | — | Bestaat niet |

## Tabellen die WEL bestaan (niet in migraties)

87 tabellen totaal. Belangrijkste die niet in migraties staan:

- `completed_workouts` — de echte workout tabel
- `feature_requests` + `feature_request_votes` — feedback systeem
- `user_roles` — rollen systeem
- `user_subscriptions` — RevenueCat subscriptions
- `subscription_plans` — plannen
- `pro_days_ledger` — pro day tracking
- `chat_quota` — AI chat quota (user_id, used_today, last_reset_date)
- `ai_daily_quota` — AI usage
- `trainer_usage` — coach usage
- `notifications` — in-app notificaties
- `exercises` + `exercise_categories` + `muscle_groups` + `equipment_types` — exercise library
- `food_items` + `food_categories` + `food_products_cache` — food library
- `trips` + `trip_*` (12 trip-gerelateerde tabellen) — travel feature
- `diary_entries` — dagboek
- `check_ins` — check-in systeem
- `monthly_challenges` + `challenge_templates` + `user_challenge_progress` — challenges
- `carve_scores` + `score_history` + `season_history` + `user_season_rankings` — scoring systeem
- `conversations` + `messages` + `conversation_participants` — messaging
- `events` + `event_responses` + `group_events` — social events
- `friend_groups` + `group_members` — groepen
- `planned_workouts` — workout planning

---

## RLS Policies — Geen admin access

Geen enkele tabel heeft een admin-specifieke policy. Alles is user-eigen-data:

| Tabel | SELECT policy |
|-------|--------------|
| `profiles` | Eigen profiel OF publieke profielen |
| `completed_workouts` | `auth.uid() = user_id` |
| `meals` | `auth.uid() = user_id` |
| `activity_feed` | Eigen + vrienden + publieke |
| `user_stats` | `auth.uid() = user_id` |
| `user_achievements` | Eigen + showcased |

**Geen admin read-all policies. Geen admin update policies.**

---

## `profiles` Productie Schema (alle 45 kolommen)

| Kolom | Type | Default | Nullable |
|-------|------|---------|----------|
| id | uuid | — | NO |
| email | text | — | NO |
| username | text | — | NO |
| display_name | text | — | YES |
| first_name | text | — | YES |
| last_name | text | — | YES |
| date_of_birth | date | — | YES |
| gender | text | — | YES |
| height_cm | integer | — | YES |
| weight_kg | numeric | — | YES |
| fitness_level | text | 'beginner' | YES |
| primary_fitness_goal | text | — | YES |
| daily_calorie_goal | integer | 2000 | YES |
| weekly_workout_goal | integer | 3 | YES |
| subscription_plan_id | uuid | — | YES |
| user_role_id | uuid | — | YES |
| avatar_image_url | text | — | YES |
| timezone | text | 'UTC' | YES |
| preferred_language | text | 'en' | YES |
| profile_visibility | text | 'private' | YES |
| created_at | timestamptz | now() | YES |
| updated_at | timestamptz | now() | YES |
| last_active_at | timestamptz | now() | YES |
| public_profile | boolean | false | YES |
| show_on_leaderboard | boolean | true | YES |
| show_workouts | boolean | false | YES |
| total_xp | integer | 0 | YES |
| level | integer | 1 | YES |
| workout_count | integer | 0 | YES |
| activity_level | text | — | YES |
| goals | jsonb | '[]' | YES |
| coach_style | text | 'furkan' | YES |
| coach_name | text | — | YES |
| has_ai_access | boolean | false | YES |
| onboarding_status | text | 'not_started' | YES |
| onboarding_step | integer | 0 | YES |
| protein_g_target | integer | 120 | YES |
| carbs_g_target | integer | 250 | YES |
| fat_g_target | integer | 70 | YES |
| water_ml_target | integer | 3000 | YES |
| training_focus | varchar | — | YES |
| goals_wizard_completed | boolean | false | YES |
| nutrition_wizard_completed | boolean | false | YES |
| coach_wizard_completed | boolean | false | YES |
| bio | text | '' | YES |
