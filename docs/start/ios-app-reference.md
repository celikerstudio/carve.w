# iOS App Reference (`~/Developer/carve-ai`)

What the iOS app has — the benchmark for the web app.

## Architecture

- **SwiftUI** (iOS 17+), SwiftData for local persistence
- **Supabase** backend (shared with web)
- **OpenAI API** via Supabase edge functions (GPT-4o pro / GPT-4o-mini free)
- **RevenueCat** for subscriptions
- **HealthKit** for step tracking
- **FatSecret API** for food database

## Tabs & Features

### Coach Tab (AI Chat)
- Streaming responses with thinking steps shown before tokens
- Photo-based food analysis (base64 → Claude vision → auto-log)
- Coach memory: 50 facts in Supabase, categorized (injuries, nutrition, preferences, goals, lifestyle, history)
- Coach personality: adjustable intensity (1-5), tone keywords, coach name
- Tool requests: week analysis, workout review, nutrition check, progress prediction, month report, meal plan
- Quota: 10 free/day + bonus credits for tools; pro = unlimited
- Rich message blocks: [FOOD_LOG], [MACRO_CARD], [WORKOUT_CARD], [COMPARE], [REMEMBER], [LOG]

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
- Coach preferences

## Key Data Flow

```
HealthKit (device) → HealthKitService → StepsSyncService → Supabase daily_steps
FatSecret API → Food search → diary_entries + food_items
Workout completion → completed_workouts + workout_exercises
Coach chat → CoachContextBuilder assembles ALL user data → edge function → streaming response
Carve Score → calculate_carve_score() RPC → carve_scores table (daily cron)
```

## Coach Context (what the AI receives)

```
CoachContext {
  userName, fitnessGoal, trainingSplit, trainingFrequency
  todayCalories, todayProtein, calorieGoal, proteinGoal
  mealsLogged, stepsToday, waterIntakeMl, waterGoalMl
  lastWorkoutName, lastWorkoutDate, daysSinceLastWorkout
  currentStreak, trainedToday
  coachName, coachIntensity, coachToneKeywords
  keyFacts: [String]  // 50 max, categorized
  activeDomains: ["health"]
}
```

## Coach Personality

NOT a generic chatbot. Dutch language. Direct, opinionated, uses data as evidence.
- No emoji, no "good job!" motivational fluff
- Varies structure — not every message ends with a question
- Intensity 4-5: strict, confrontational, pushes through excuses
- Responds like a WhatsApp coach, not a template
