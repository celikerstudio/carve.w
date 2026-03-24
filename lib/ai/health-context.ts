import { createClient } from '@/lib/supabase/server'
import {
  differenceInDateStrings,
  formatDateInTimeZone,
  normalizeDateString,
  shiftDateString,
} from '@/lib/date/local-date'

// @ai-why: Matches the CoachContext shape expected by the coach-chat edge function.
// The edge function uses these fields to build the system prompt and inject user data.
// @ai-sync: ~/Developer/carve-ai/Carve AI/App/Models/CoachContext.swift
export interface CoachContext {
  userName: string
  fitnessGoal: string
  trainingSplit: string
  trainingFrequency: number
  todayCalories: number
  todayProtein: number
  calorieGoal: number
  proteinGoal: number
  mealsLogged: string[]
  mealsLoggedCount: number
  stepsToday: number
  waterIntakeMl: number
  waterGoalMl: number
  lastWorkoutName: string
  lastWorkoutDate: string
  lastWorkoutDuration: number
  daysSinceLastWorkout: number
  currentStreak: number
  trainedToday: boolean
  // Coach memory — up to 50 active facts the AI has remembered about the user
  keyFacts: string[]
  // Coach profile sections (structured v2)
  profileGoals: string
  profileSchedule: string
  profileLimitations: string
  profileNutrition: string
  profileCoaching: string
  // Coach logbook — recent observations/milestones/concerns
  recentLogEntries: string[]
  coachName: string
  coachIntensity: number
  coachToneKeywords: string[]
  activeDomains: string[]
}

export async function buildCoachContext(
  userId: string,
  activeApp: string,
  userName: string,
  timeZone?: string,
): Promise<CoachContext> {
  const supabase = await createClient()
  const now = new Date()
  const today = formatDateInTimeZone(now, timeZone)
  const sixtyDaysAgo = shiftDateString(today, -60)
  const sevenDaysAgo = shiftDateString(today, -7)

  const [diaryRes, stepsRes, workoutsRes, profileRes, memoryRes, coachProfileRes, logbookRes] = await Promise.all([
    supabase
      .from('diary_entries')
      .select('total_calories, total_protein_g, calorie_goal, protein_goal_g, water_intake_ml')
      .eq('user_id', userId)
      .eq('entry_date', today)
      .maybeSingle(),

    supabase
      .from('daily_steps')
      .select('step_count')
      .eq('user_id', userId)
      .eq('step_date', today)
      .maybeSingle(),

    supabase
      .from('completed_workouts')
      .select('name, workout_date, total_duration_minutes')
      .eq('user_id', userId)
      .gte('workout_date', sixtyDaysAgo)
      .order('workout_date', { ascending: false }),

    supabase
      .from('profiles')
      .select('display_name, daily_calorie_goal, protein_g_target, water_ml_target, weekly_workout_goal, training_focus, primary_fitness_goal, coach_name, coach_style, coach_intensity')
      .eq('id', userId)
      .single(),

    // Coach memory — active facts the AI has stored about this user
    supabase
      .from('coach_memory')
      .select('fact, category')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('updated_at', { ascending: false })
      .limit(50),

    // Coach profile — structured sections (goals, schedule, limitations, nutrition, coaching)
    supabase
      .from('coach_profiles')
      .select('section, content')
      .eq('user_id', userId),

    // Coach logbook — recent entries
    supabase
      .from('coach_logbook')
      .select('content, category, entry_date')
      .eq('user_id', userId)
      .gte('entry_date', sevenDaysAgo)
      .order('entry_date', { ascending: false })
      .limit(10),
  ])

  const diary = diaryRes.data
  // @ai-why: Cast to include coach_intensity which exists in the DB but isn't in generated Supabase types yet.
  // Run `supabase gen types typescript` to fix this properly.
  const profile = profileRes.data as (typeof profileRes.data & { coach_intensity?: number }) | null
  const workouts = workoutsRes.data ?? []
  const memories = memoryRes.data ?? []
  const coachProfiles = coachProfileRes.data ?? []
  const logEntries = logbookRes.data ?? []

  // Streak calculation
  const allDates = [...new Set(workouts.map((w) => normalizeDateString(w.workout_date, timeZone)))].sort().reverse()
  let streak = 0
  let checkDate = today
  if (!allDates.includes(today)) {
    checkDate = shiftDateString(checkDate, -1)
  }
  for (let i = 0; i < 60; i++) {
    if (allDates.includes(checkDate)) {
      streak++
      checkDate = shiftDateString(checkDate, -1)
    } else {
      break
    }
  }

  const lastWorkout = workouts[0] ?? null
  const lastWorkoutDate = lastWorkout
    ? normalizeDateString(lastWorkout.workout_date, timeZone)
    : ''
  const daysSinceLastWorkout = lastWorkout
    ? differenceInDateStrings(today, lastWorkoutDate)
    : 0

  // Build coach profile sections map
  const profileSections = Object.fromEntries(
    coachProfiles.map((p) => [p.section, p.content ?? ''])
  )

  // Format logbook entries as readable strings
  const formattedLogEntries = logEntries.map(
    (e) => `[${e.category}] ${e.entry_date}: ${e.content}`
  )

  // Key facts from coach memory
  const keyFacts = memories.map((m) =>
    m.category ? `[${m.category}] ${m.fact}` : m.fact
  )

  return {
    userName: profile?.display_name ?? userName,
    fitnessGoal: profile?.primary_fitness_goal ?? '',
    trainingSplit: profile?.training_focus ?? '',
    trainingFrequency: profile?.weekly_workout_goal ?? 4,
    todayCalories: diary?.total_calories ?? 0,
    todayProtein: Math.round(diary?.total_protein_g ?? 0),
    calorieGoal: diary?.calorie_goal ?? profile?.daily_calorie_goal ?? 2200,
    proteinGoal: Math.round(diary?.protein_goal_g ?? profile?.protein_g_target ?? 150),
    mealsLogged: diary ? ['food logged today'] : [],
    mealsLoggedCount: diary ? 1 : 0,
    stepsToday: stepsRes.data?.step_count ?? 0,
    waterIntakeMl: diary?.water_intake_ml ?? 0,
    waterGoalMl: profile?.water_ml_target ?? 3000,
    lastWorkoutName: lastWorkout?.name ?? '',
    lastWorkoutDate,
    lastWorkoutDuration: lastWorkout?.total_duration_minutes ?? 0,
    daysSinceLastWorkout,
    currentStreak: streak,
    trainedToday: allDates.includes(today),
    keyFacts,
    profileGoals: profileSections['goals'] ?? '',
    profileSchedule: profileSections['schedule'] ?? '',
    profileLimitations: profileSections['limitations'] ?? '',
    profileNutrition: profileSections['nutrition'] ?? '',
    profileCoaching: profileSections['coaching'] ?? '',
    recentLogEntries: formattedLogEntries,
    coachName: profile?.coach_name ?? 'Carve',
    coachIntensity: profile?.coach_intensity ?? 3,
    coachToneKeywords: [],
    // @ai-why: Default to activeApp only. The API route overrides this with auto-detected
    // domains based on actual data presence (health + money + any explicitly navigated app).
    activeDomains: [activeApp],
  }
}
