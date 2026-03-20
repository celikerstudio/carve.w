'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  formatDateInTimeZone,
  getMondayDateString,
  normalizeDateString,
  shiftDateString,
} from '@/lib/date/local-date'

export interface WorkoutDay {
  dayLabel: string
  done: boolean
  isToday: boolean
}

export interface HealthData {
  // Today's nutrition
  todayCalories: number
  calorieGoal: number
  todayProtein: number
  proteinGoal: number
  todayWater: number
  waterGoal: number

  // Steps
  todaySteps: number

  // Last workout
  lastWorkout: {
    name: string
    date: string
    muscleGroups: string[]
  } | null

  // Week overview (Mon–Sun)
  weekDays: WorkoutDay[]
  weekWorkoutCount: number
  weekWorkoutGoal: number

  // Streak
  currentStreak: number
}

function calculateStreak(workoutDates: string[], today: string): number {
  if (workoutDates.length === 0) return 0

  const unique = [...new Set(workoutDates)].sort().reverse()
  let streak = 0
  let checkDate = today

  // If no workout today, start checking from yesterday
  if (!unique.includes(today)) {
    checkDate = shiftDateString(checkDate, -1)
  }

  for (let i = 0; i < 60; i++) {
    if (unique.includes(checkDate)) {
      streak++
      checkDate = shiftDateString(checkDate, -1)
    } else {
      break
    }
  }

  return streak
}

export function useHealthData(userId: string) {
  const [data, setData] = useState<HealthData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return

    async function fetchHealthData() {
      const supabase = createClient()
      const now = new Date()
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || undefined
      const today = formatDateInTimeZone(now, timeZone)
      const monday = getMondayDateString(today)
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
          .select('name, workout_date, muscle_groups_targeted')
          .eq('user_id', userId)
          .gte('workout_date', sixtyDaysAgo)
          .order('workout_date', { ascending: false }),

        supabase
          .from('profiles')
          .select('daily_calorie_goal, protein_g_target, water_ml_target, weekly_workout_goal')
          .eq('id', userId)
          .single(),
      ])

      const diary = diaryRes.data
      const profile = profileRes.data
      const workouts = workoutsRes.data ?? []

      // Week overview: Mon–Sun dots
      const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
      const workoutDateStrings = workouts.map((w) => normalizeDateString(w.workout_date, timeZone))

      const weekDays: WorkoutDay[] = dayLabels.map((label, i) => {
        const dateStr = shiftDateString(monday, i)
        return {
          dayLabel: label,
          done: workoutDateStrings.includes(dateStr),
          isToday: dateStr === today,
        }
      })

      const weekWorkoutCount = weekDays.filter((d) => d.done).length
      const streak = calculateStreak(workoutDateStrings, today)

      const lastWorkout = workouts[0]
        ? {
            name: workouts[0].name,
            date: normalizeDateString(workouts[0].workout_date, timeZone),
            muscleGroups: workouts[0].muscle_groups_targeted ?? [],
          }
        : null

      setData({
        todayCalories: diary?.total_calories ?? 0,
        calorieGoal: diary?.calorie_goal ?? profile?.daily_calorie_goal ?? 2200,
        todayProtein: Math.round(diary?.total_protein_g ?? 0),
        proteinGoal: Math.round(diary?.protein_goal_g ?? profile?.protein_g_target ?? 150),
        todayWater: diary?.water_intake_ml ?? 0,
        waterGoal: profile?.water_ml_target ?? 3000,
        todaySteps: stepsRes.data?.step_count ?? 0,
        lastWorkout,
        weekDays,
        weekWorkoutCount,
        weekWorkoutGoal: profile?.weekly_workout_goal ?? 4,
        currentStreak: streak,
      })

      setLoading(false)
    }

    fetchHealthData()
  }, [userId])

  return { data, loading }
}
