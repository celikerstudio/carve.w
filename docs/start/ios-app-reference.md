# iOS App Reference (`~/Developer/carve-ai`)

What the iOS app has — the benchmark for the web app.

Reference snapshot based on `../carve-ai` as read on 2026-03-20.

## Architecture

- **SwiftUI** (iOS 17+), SwiftData for local persistence
- **Supabase** backend (shared with web)
- **OpenAI API** via Supabase edge function `coach-chat` (local defaults: GPT-5 pro / GPT-5-mini free, configurable via env)
- **RevenueCat** for subscriptions
- **HealthKit** for step tracking
- **FatSecret API** for food database

## Tabs & Features

### Coach Tab (AI Chat)
- Streaming responses with thinking steps shown before tokens
- Photo-based food analysis (base64 → OpenAI vision → auto-log)
- Coach memory: 50 facts in Supabase, categorized (injuries, nutrition, preferences, goals, lifestyle, history)
- Coach profile: structured sections (goals, schedule, limitations, nutrition, coaching)
- Coach logbook: timestamped observations/milestones/concerns/decisions
- Coach personality: adjustable intensity (1-5), tone keywords, coach name
- Tool requests: week analysis, workout review, nutrition check, progress prediction, month report, meal plan, cut help
- Quota: 10 free/hour, pro = unlimited (hourly quota migration landed on 2026-03-17)
- Rich message blocks: [FOOD_LOG], [MACRO_CARD], [WORKOUT_CARD], [COMPARE], [CHECKLIST], [REMEMBER], [LOG], [PROFILE]
- Multi-conversation support with SwiftData persistence

### Diary Tab (Food & Nutrition)
- Manual food entry + FatSecret search + barcode scanning
- AI photo food analysis
- Macro tracking (calories, protein, carbs, fat vs user goals)
- Daily timeline view

### Workout Tab
- Customizable workout templates with variants
- Active workout timer with live set/rep/weight tracking
- Quick activities (cardio shortcuts)
- Completed workout history

### Progress Tab
- Weight trend charts (7/30/90 days)
- Macro radar chart
- Training volume bar chart
- Check-in history

### Social Tab
- Friend requests, friend list with stats
- Leaderboard (global + friend-group)
- Activity feed

### Ranking Tab
- Carve Score: designed but NOT active yet
  - Formula: 14-day rolling window, 35% consistency + 30% training + 20% nutrition + 15% movement
  - Tiers: Rookie → Beginner → Intermediate → Advanced (XP) → Elite → Master → Legend (percentile)
  - Tables and RPCs exist in Supabase but not in use

### Profile Tab
- Training mode (hypertrophy/strength/endurance)
- Training split (PPL/UL/Full Body)
- Nutrition targets
- Coach preferences (name, intensity, tone)

## Key Data Flow

```
HealthKit (device) → HealthKitService → StepsSyncService → Supabase daily_steps
FatSecret API → Food search → diary_entries + food_items
Workout completion → completed_workouts + workout_exercises
Coach chat → CoachContextBuilder assembles ALL user data → edge function → streaming response
Memory actions → CoachMemoryService → coach_memory table (50 max, lifecycle: active/archived/superseded)
Profile updates → CoachProfileService → coach_profiles table (5 sections)
Logbook entries → CoachLogbookService → coach_logbook table
Carve Score → calculate_carve_score() RPC → carve_scores table (daily cron)
```

## Coach Context (what the AI receives)

Latest iOS `CoachContext` shape:

```
CoachContext {
  userName, fitnessGoal, trainingSplit, trainingFrequency
  todayCalories, todayProtein, calorieGoal, proteinGoal
  mealsLogged: [String], stepsToday, waterIntakeMl, waterGoalMl
  mealsLoggedCount, daysSinceLastWorkout, trainedToday
  lastWorkoutName, lastWorkoutDate, lastWorkoutDuration, nextPlannedWorkout, currentStreak
  keyFacts: [String]
  profileGoals, profileSchedule, profileLimitations, profileNutrition, profileCoaching
  recentLogEntries: [String]
  coachName, coachIntensity, coachToneKeywords
  activeDomains: ["health"]
}
```

The edge function formats this context into the system prompt; it does not independently recreate these fields.

Web equivalent: `lib/ai/health-context.ts` → `buildCoachContext()`
Current web payload is still a slimmer health-focused subset, not full parity with the latest iOS shape.

## Coach Personality

NOT a generic chatbot. Dutch language. Direct, opinionated, uses data as evidence.
- No emoji, no "good job!" motivational fluff
- Varies structure — not every message ends with a question
- Intensity 4-5: strict, confrontational, pushes through excuses
- Responds like a WhatsApp coach, not a template

## Key Files

- `Services/Coach/CoachChatService.swift` — main orchestration
- `Services/Coach/CoachContextBuilder.swift` — data aggregation (web equivalent: `buildCoachContext`)
- `Services/Coach/CoachStreamingHandler.swift` — SSE parsing
- `Services/Coach/CoachMessageParser.swift` — response parsing (rich blocks, memory actions)
- `Services/Coach/CoachMemoryService.swift` — fact lifecycle (50 max, categorized)
- `Services/Coach/CoachProfileService.swift` — structured profile (5 sections)
- `Services/Coach/CoachLogbookService.swift` — timestamped entries
- `Models/SwiftData/PersistentChatMessage.swift` — message persistence
- `Models/SwiftData/PersistentConversation.swift` — conversation metadata
