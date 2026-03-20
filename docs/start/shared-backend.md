# Shared Supabase Backend

iOS and Web share the same Supabase instance. The web app can read all data the iOS app writes.

## AI Architecture

Both platforms use the same Supabase edge function for AI:

```
Web: useChat → /api/carve-ai/chat (Next.js proxy) → coach-chat edge function → OpenAI
iOS: CoachChatService → coach-chat edge function → OpenAI
```

The edge function handles model selection, prompt assembly from supplied context, quota management, tool requests, and streaming. The web app's Next.js route is a thin proxy that translates SSE → AI SDK stream protocol.

Important nuance: the edge function does not reconstruct the full coach context on its own. It consumes whatever `context` the client sends. That means context parity between iOS and web depends on each client, not just on the shared edge function.

### Web Context Building

The Next.js route enriches every request with real user data via `buildCoachContext()`:

```
lib/ai/health-context.ts → CoachContext {
  userName, fitnessGoal, trainingSplit, trainingFrequency
  todayCalories, todayProtein, calorieGoal, proteinGoal
  mealsLogged, stepsToday, waterIntakeMl, waterGoalMl
  lastWorkoutName, lastWorkoutDate, daysSinceLastWorkout
  currentStreak, trainedToday
  coachName, coachIntensity, coachToneKeywords
  activeDomains
}
```

This is not full parity with the latest iOS `CoachContextBuilder` output. The web payload is currently slimmer and omits fields such as `mealsLoggedCount`, `lastWorkoutDuration`, `nextPlannedWorkout`, `keyFacts`, and profile/logbook sections.

## Tables the Web App Should Consume

### User & Auth
- `auth.users` — Supabase managed
- `profiles` — display_name, avatar_url, profile_data (JSONB: nutrition goals, training split, preferences)

### Health Data (written by iOS, readable by web)
- `completed_workouts` — name, workout_date, total_volume_kg, total_sets, total_reps, total_duration_minutes, muscle_groups_targeted
  - `workout_exercises` — exercise_name, sets, reps, weight_kg
- `diary_entries` — entry_date, total_calories, total_protein_g, total_carbs_g, total_fat_g, calorie_goal, protein_goal_g, water_intake_ml
- `check_ins` — weight, weight_unit, week_start
- `daily_steps` — step_date, step_count, synced_at

### Coach System
- `coach_memory` — fact, category, source, status (max 50 per user, active/archived/superseded)
- `coach_profiles` — goals, schedule, limitations, nutrition, coaching (structured v2)
- `coach_logbook` — content, category (observation/milestone/concern/decision), entry_date

### Web-only: Chat Persistence
- `ai_conversations` — user_id, title, active_app, created_at, updated_at
- `ai_messages` — conversation_id, role (user/assistant), content, created_at
- Auto-update trigger: `updated_at` refreshes on new message
- RLS: users can only access own conversations

### Gamification (designed, NOT active yet)
- `carve_scores` — score (400-2800), tier, components (JSONB), window dates
- `score_history` — daily snapshots with delta
- `user_stats` — season_xp, percentile, total_workouts, total_food_logs, longest_streak

### Social
- `friendships` — requester_id, addressee_id, status
- `activity_feed` — activity_type, metadata (JSONB)

### Monetization
- `subscriptions` — tier (free/pro), provider, expires_at
- `chat_quota` — legacy daily columns plus hourly tracking in the shared backend (`used_this_hour`, `last_reset_hour` after the 2026-03-17 migration)
- `bonus_credits` — legacy / experimental; latest hourly quota migration returns `bonusCredits: 0` for normal chat
- `ai_usage_logs` — endpoint, model, tokens_in, tokens_out, cost_eur

## Key RPCs
- `calculate_carve_score(user_id)` — 14-day score calculation
- `check_chat_quota(user_id)` — returns {used, limit, remaining, canUse, bonusCredits, tier, minutesUntilReset}
- `use_chat_quota(user_id, credits?, reason?)` — normal messages currently decrement hourly quota; the overload remains for backward compatibility
- `get_sub_status(user_id)` — subscription tier lookup

## Important

- All tables have RLS (Row Level Security) — user can only read their own data
- The web app authenticates via Supabase client, same as iOS
- No new backend needed — consume what exists
- Edge function at `supabase/functions/coach-chat/index.ts` is the single AI entry point
- Model selection is env-configurable in the edge function; local defaults in `../carve-ai` are free → `gpt-5-mini`, pro → `gpt-5`
- `activeDomains` is already passed through the request context, but the current edge function is still mostly health-oriented and does not yet do full domain-specific prompt branching
