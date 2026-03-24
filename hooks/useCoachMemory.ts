'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

// ─── Types ──────────────────────────────────────────────────────────

export type MemoryCategory =
  | 'injuries'
  | 'nutrition'
  | 'preferences'
  | 'goals'
  | 'lifestyle'
  | 'history'
  | 'general'

export type MemoryStatus = 'active' | 'archived' | 'superseded'

export interface MemoryFact {
  id: string
  user_id: string
  fact: string
  category: MemoryCategory
  status: MemoryStatus
  source: string | null
  created_at: string
  updated_at: string
}

export type ProfileSection = 'goals' | 'schedule' | 'limitations' | 'nutrition' | 'coaching'

export interface CoachProfile {
  id: string
  user_id: string
  section: ProfileSection
  content: string
  extra: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

export type LogbookCategory = 'observation' | 'milestone' | 'concern' | 'decision'

export interface LogbookEntry {
  id: string
  user_id: string
  content: string
  category: LogbookCategory
  entry_date: string
  created_at: string
}

export interface CoachProfileMap {
  goals: string | null
  schedule: string | null
  limitations: string | null
  nutrition: string | null
  coaching: string | null
}

export interface GroupedFacts {
  active: Record<MemoryCategory, MemoryFact[]>
  archived: MemoryFact[]
}

export interface CoachMemoryActions {
  archiveFact: (id: string) => Promise<void>
  reactivateFact: (id: string) => Promise<void>
  updateFact: (id: string, newFact: string) => Promise<void>
  updateProfileSection: (section: ProfileSection, content: string) => Promise<void>
  refreshAll: () => Promise<void>
}

export interface CoachMemoryData {
  memoryFacts: GroupedFacts
  coachProfile: CoachProfileMap
  logbookEntries: LogbookEntry[]
  totalFactCount: number
  loading: boolean
  error: Error | null
  actions: CoachMemoryActions
}

// ─── Constants ──────────────────────────────────────────────────────

const MAX_FACTS = 50

const MEMORY_CATEGORIES: MemoryCategory[] = [
  'injuries', 'nutrition', 'preferences', 'goals', 'lifestyle', 'history', 'general',
]

const EMPTY_GROUPED: GroupedFacts = {
  active: {
    injuries: [],
    nutrition: [],
    preferences: [],
    goals: [],
    lifestyle: [],
    history: [],
    general: [],
  },
  archived: [],
}

const EMPTY_PROFILE: CoachProfileMap = {
  goals: null,
  schedule: null,
  limitations: null,
  nutrition: null,
  coaching: null,
}

// ─── Helpers ────────────────────────────────────────────────────────

function groupFacts(facts: MemoryFact[]): GroupedFacts {
  const active: GroupedFacts['active'] = {
    injuries: [],
    nutrition: [],
    preferences: [],
    goals: [],
    lifestyle: [],
    history: [],
    general: [],
  }
  const archived: MemoryFact[] = []

  for (const fact of facts) {
    if (fact.status === 'archived' || fact.status === 'superseded') {
      archived.push(fact)
    } else if (MEMORY_CATEGORIES.includes(fact.category)) {
      active[fact.category].push(fact)
    }
  }

  return { active, archived }
}

function buildProfileMap(profiles: CoachProfile[]): CoachProfileMap {
  const map: CoachProfileMap = { ...EMPTY_PROFILE }
  for (const p of profiles) {
    if (p.section in map) {
      map[p.section] = p.content
    }
  }
  return map
}

// ─── Hook ───────────────────────────────────────────────────────────

export function useCoachMemory(userId: string | null): CoachMemoryData {
  const [memoryFacts, setMemoryFacts] = useState<GroupedFacts>(EMPTY_GROUPED)
  const [coachProfile, setCoachProfile] = useState<CoachProfileMap>(EMPTY_PROFILE)
  const [logbookEntries, setLogbookEntries] = useState<LogbookEntry[]>([])
  const [totalFactCount, setTotalFactCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchAll = useCallback(async () => {
    if (!userId) return

    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      const [factsRes, profilesRes, logbookRes] = await Promise.all([
        supabase
          .from('coach_memory')
          .select('id, user_id, fact, category, status, source, created_at, updated_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false }),

        supabase
          .from('coach_profiles')
          .select('id, user_id, section, content, extra, created_at, updated_at')
          .eq('user_id', userId),

        supabase
          .from('coach_logbook')
          .select('id, user_id, content, category, entry_date, created_at')
          .eq('user_id', userId)
          .order('entry_date', { ascending: false })
          .limit(50),
      ])

      if (factsRes.error) throw factsRes.error
      if (profilesRes.error) throw profilesRes.error
      if (logbookRes.error) throw logbookRes.error

      const facts = (factsRes.data ?? []) as MemoryFact[]
      const profiles = (profilesRes.data ?? []) as CoachProfile[]
      const logbook = (logbookRes.data ?? []) as LogbookEntry[]

      setMemoryFacts(groupFacts(facts))
      setTotalFactCount(facts.filter(f => f.status === 'active').length)
      setCoachProfile(buildProfileMap(profiles))
      setLogbookEntries(logbook)
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)))
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  // ─── Actions ────────────────────────────────────────────────────

  const archiveFact = useCallback(async (id: string) => {
    const supabase = createClient()
    const { error: err } = await supabase
      .from('coach_memory')
      .update({ status: 'archived' })
      .eq('id', id)

    if (err) throw err

    // Optimistic update
    setMemoryFacts(prev => {
      const allActive = Object.values(prev.active).flat()
      const target = allActive.find(f => f.id === id)
      if (!target) return prev

      const updated = { ...target, status: 'archived' as MemoryStatus }
      const newActive = { ...prev.active }
      newActive[target.category] = newActive[target.category].filter(f => f.id !== id)

      return {
        active: newActive,
        archived: [updated, ...prev.archived],
      }
    })
    setTotalFactCount(prev => prev - 1)
  }, [])

  const reactivateFact = useCallback(async (id: string) => {
    const supabase = createClient()
    const { error: err } = await supabase
      .from('coach_memory')
      .update({ status: 'active' })
      .eq('id', id)

    if (err) throw err

    // Optimistic update
    setMemoryFacts(prev => {
      const target = prev.archived.find(f => f.id === id)
      if (!target) return prev

      const updated = { ...target, status: 'active' as MemoryStatus }
      const newActive = { ...prev.active }
      newActive[target.category] = [...newActive[target.category], updated]

      return {
        active: newActive,
        archived: prev.archived.filter(f => f.id !== id),
      }
    })
    setTotalFactCount(prev => prev + 1)
  }, [])

  const updateFact = useCallback(async (id: string, newFact: string) => {
    const supabase = createClient()
    const { error: err } = await supabase
      .from('coach_memory')
      .update({ fact: newFact })
      .eq('id', id)

    if (err) throw err

    // Optimistic update
    setMemoryFacts(prev => {
      const newActive = { ...prev.active }
      for (const cat of MEMORY_CATEGORIES) {
        newActive[cat] = newActive[cat].map(f =>
          f.id === id ? { ...f, fact: newFact } : f
        )
      }
      return {
        active: newActive,
        archived: prev.archived.map(f =>
          f.id === id ? { ...f, fact: newFact } : f
        ),
      }
    })
  }, [])

  const updateProfileSection = useCallback(async (section: ProfileSection, content: string) => {
    if (!userId) return

    const supabase = createClient()
    const { error: err } = await supabase
      .from('coach_profiles')
      .upsert(
        { user_id: userId, section, content },
        { onConflict: 'user_id,section' }
      )

    if (err) throw err

    // Optimistic update
    setCoachProfile(prev => ({ ...prev, [section]: content }))
  }, [userId])

  return {
    memoryFacts,
    coachProfile,
    logbookEntries,
    totalFactCount,
    loading,
    error,
    actions: {
      archiveFact,
      reactivateFact,
      updateFact,
      updateProfileSection,
      refreshAll: fetchAll,
    },
  }
}
