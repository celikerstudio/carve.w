# Shared Supabase Backend

iOS and Web share the same Supabase instance. The web app can read all data the iOS app writes.

## AI Architecture

Both platforms use the same Supabase edge function for AI:

```
Web: useChat → /api/carve-ai/chat (Next.js proxy) → coach-chat edge function → OpenAI
iOS: CoachChatService → coach-chat edge function → OpenAI
```

The edge function handles: model selection (based on subscription tier), coach personality, memory (50 facts), quota management, tool requests, and streaming. The web app's Next.js route is a thin proxy that translates SSE → AI SDK stream protocol.

## Tables the Web App Should Consume

### User & Auth
- `auth.users` — Supabase managed
- `profiles` — display_name, avatar_url, profile_data (JSONB: nutrition goals, training split, preferences)

### Health Data (written by iOS, readable by web)
- `completed_workouts` — name, duration, total_sets, completed_at
  - `workout_exercises` — exercise_name, sets, reps, weight_kg
- `diary_entries` — entry_date, total_calories, total_protein_g, total_carbs_g, total_fat_g, goals
- `check_ins` — weight entries with date
- `daily_steps` — date, steps, synced_from (healthkit/manual)

### Coach System
- `coach_memory` — fact, category, source, status (max 50 per user)
- `coach_profile` — goals, schedule, limitations, nutrition, coaching preferences
- `coach_logbook` — entry, category (observation/milestone/concern/decision)

### Gamification (designed, NOT active yet)
- `carve_scores` — score (400-2800), tier, components (JSONB), window dates
- `score_history` — daily snapshots with delta
- `user_stats` — season_xp, percentile, total_workouts, total_food_logs, longest_streak

### Social
- `friendships` — requester_id, addressee_id, status
- `activity_feed` — activity_type, metadata (JSONB)

### Monetization
- `subscriptions` — tier (free/pro), provider, expires_at
- `chat_quota` — used_today, last_reset_date
- `bonus_credits` — credits balance
- `ai_usage_logs` — endpoint, model, tokens_in, tokens_out, cost_eur

## Key RPCs
- `calculate_carve_score(user_id)` — 14-day score calculation
- `check_chat_quota(user_id)` — returns {used, limit, remaining, canUse, bonusCredits, tier}
- `use_chat_quota(user_id, credits, reason)` — deduct credits
- `get_sub_status(user_id)` — subscription tier lookup

## Important

- All tables have RLS (Row Level Security) — user can only read their own data
- The web app authenticates via Supabase client, same as iOS
- No new backend needed — consume what exists
- Edge function at `supabase/functions/coach-chat/index.ts` is the single AI entry point
- Model selection: free tier → GPT-5 mini, pro tier → GPT-5 (configurable via PRO_MODEL env var)
