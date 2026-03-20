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
  mealsLogged: number
  stepsToday: number
  waterIntakeMl: number
  waterGoalMl: number
  lastWorkoutName: string
  lastWorkoutDate: string
  daysSinceLastWorkout: number
  currentStreak: number
  trainedToday: boolean
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

  const [diaryRes, stepsRes, workoutsRes, profileRes] = await Promise.all([
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
      .select('name, workout_date')
      .eq('user_id', userId)
      .gte('workout_date', sixtyDaysAgo)
      .order('workout_date', { ascending: false }),

    supabase
      .from('profiles')
      .select('display_name, daily_calorie_goal, protein_g_target, water_ml_target, weekly_workout_goal, training_focus, primary_fitness_goal, coach_name, coach_style')
      .eq('id', userId)
      .single(),
  ])

  const diary = diaryRes.data
  const profile = profileRes.data
  const workouts = workoutsRes.data ?? []

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

  return {
    userName: profile?.display_name ?? userName,
    fitnessGoal: profile?.primary_fitness_goal ?? '',
    trainingSplit: profile?.training_focus ?? '',
    trainingFrequency: profile?.weekly_workout_goal ?? 4,
    todayCalories: diary?.total_calories ?? 0,
    todayProtein: Math.round(diary?.total_protein_g ?? 0),
    calorieGoal: diary?.calorie_goal ?? profile?.daily_calorie_goal ?? 2200,
    proteinGoal: Math.round(diary?.protein_goal_g ?? profile?.protein_g_target ?? 150),
    mealsLogged: diary ? 1 : 0,
    stepsToday: stepsRes.data?.step_count ?? 0,
    waterIntakeMl: diary?.water_intake_ml ?? 0,
    waterGoalMl: profile?.water_ml_target ?? 3000,
    lastWorkoutName: lastWorkout?.name ?? '',
    lastWorkoutDate,
    daysSinceLastWorkout,
    currentStreak: streak,
    trainedToday: allDates.includes(today),
    coachName: profile?.coach_name ?? 'Carve',
    coachIntensity: 3,
    coachToneKeywords: [],
    activeDomains: [activeApp],
  }
}
