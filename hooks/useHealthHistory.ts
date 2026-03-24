'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

// ─── Types ──────────────────────────────────────────────────────────

export type TimeRange = '7d' | '30d' | '90d'

export interface WeightEntry {
  date: string
  weight: number
}

export interface NutritionDay {
  date: string
  calories: number
  protein: number
  carbs: number
  fat: number
  calorieGoal: number
  proteinGoal: number
}

export interface WorkoutWeek {
  week: string // 'Mar 10' format
  count: number
}

export interface StepsDay {
  date: string
  steps: number
}

export interface HealthHistory {
  weight: WeightEntry[]
  nutrition: NutritionDay[]
  workouts: WorkoutWeek[]
  steps: StepsDay[]
}

// ─── Helpers ────────────────────────────────────────────────────────

function daysAgo(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString().split('T')[0]
}

function rangeToDays(range: TimeRange): number {
  return range === '7d' ? 7 : range === '30d' ? 30 : 90
}

function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })
}

function getWeekLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  const monday = new Date(d)
  monday.setDate(d.getDate() + diff)
  return monday.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })
}

// ─── Hook ───────────────────────────────────────────────────────────

export function useHealthHistory(userId: string | null, range: TimeRange = '30d') {
  const [data, setData] = useState<HealthHistory | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async () => {
    if (!userId) return

    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const days = rangeToDays(range)
      const since = daysAgo(days)

      const [weightRes, nutritionRes, workoutsRes, stepsRes] = await Promise.all([
        supabase
          .from('check_ins')
          .select('weight, created_at')
          .eq('user_id', userId)
          .gte('created_at', since)
          .order('created_at', { ascending: true }),

        supabase
          .from('diary_entries')
          .select('entry_date, total_calories, total_protein_g, total_carbs_g, total_fat_g, calorie_goal, protein_goal_g')
          .eq('user_id', userId)
          .gte('entry_date', since)
          .order('entry_date', { ascending: true }),

        supabase
          .from('completed_workouts')
          .select('workout_date')
          .eq('user_id', userId)
          .gte('workout_date', since)
          .order('workout_date', { ascending: true }),

        supabase
          .from('daily_steps')
          .select('step_date, step_count')
          .eq('user_id', userId)
          .gte('step_date', since)
          .order('step_date', { ascending: true }),
      ])

      // Weight trend
      const weight: WeightEntry[] = (weightRes.data ?? []).map((w) => ({
        date: formatShortDate(new Date(w.created_at).toISOString().split('T')[0]),
        weight: Number(w.weight),
      }))

      // Nutrition per day
      const nutrition: NutritionDay[] = (nutritionRes.data ?? []).map((n) => ({
        date: formatShortDate(n.entry_date),
        calories: n.total_calories ?? 0,
        protein: Math.round(n.total_protein_g ?? 0),
        carbs: Math.round(n.total_carbs_g ?? 0),
        fat: Math.round(n.total_fat_g ?? 0),
        calorieGoal: n.calorie_goal ?? 2200,
        proteinGoal: Math.round(n.protein_goal_g ?? 150),
      }))

      // Workouts grouped by week
      const weekMap = new Map<string, number>()
      for (const w of workoutsRes.data ?? []) {
        const weekLabel = getWeekLabel(w.workout_date)
        weekMap.set(weekLabel, (weekMap.get(weekLabel) ?? 0) + 1)
      }
      const workouts: WorkoutWeek[] = [...weekMap.entries()].map(([week, count]) => ({
        week,
        count,
      }))

      // Steps per day
      const steps: StepsDay[] = (stepsRes.data ?? []).map((s) => ({
        date: formatShortDate(s.step_date),
        steps: s.step_count ?? 0,
      }))

      setData({ weight, nutrition, workouts, steps })
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)))
    } finally {
      setLoading(false)
    }
  }, [userId, range])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error }
}
