'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/hooks'
import { createClient } from '@/lib/supabase/client'
import { DIFFICULTY_LEVELS, HUB_QUESTIONS_PER_QUIZ } from '@/lib/quiz/constants'
import type { QuizCategory, DifficultyLevel } from '@/lib/quiz/constants'
import type { UserKnowledge } from '@/lib/quiz/types'
import { getRankTitle } from '@/lib/quiz/utils'
import { getCategoryColor } from '@/lib/wiki/category-colors'
import { QuizStartCard } from '@/components/quiz/QuizStartCard'

interface CategoryQuizContentProps {
  category: string
}

export function CategoryQuizContent({ category }: CategoryQuizContentProps) {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [knowledge, setKnowledge] = useState<UserKnowledge | null>(null)
  const [loadingKnowledge, setLoadingKnowledge] = useState(true)

  const colors = getCategoryColor(category)
  const typedCategory = category as QuizCategory

  useEffect(() => {
    const fetchKnowledge = async () => {
      if (!user) {
        setLoadingKnowledge(false)
        return
      }

      const supabase = createClient()
      const { data } = await supabase
        .from('user_knowledge')
        .select('*')
        .eq('user_id', user.id)
        .eq('category', category)
        .single()

      if (data) {
        setKnowledge(data as UserKnowledge)
      }
      setLoadingKnowledge(false)
    }

    if (!authLoading) {
      fetchKnowledge()
    }
  }, [user, authLoading, category])

  const isLevelUnlocked = (difficulty: DifficultyLevel): boolean => {
    if (difficulty === 'beginner') return true
    if (!knowledge) return false

    const levelIndex = DIFFICULTY_LEVELS.indexOf(difficulty)
    const currentIndex = DIFFICULTY_LEVELS.indexOf(knowledge.current_level)
    return currentIndex >= levelIndex
  }

  const isCurrentLevel = (difficulty: DifficultyLevel): boolean => {
    if (!knowledge) return difficulty === 'beginner'
    return knowledge.current_level === difficulty
  }

  const handleStart = async (difficulty: DifficultyLevel) => {
    // If not authenticated, redirect to login
    if (!user) {
      const redirectPath = `/wiki/learn/${category.toLowerCase()}`
      router.push(`/login?redirect=${encodeURIComponent(redirectPath)}`)
      return
    }

    // Create quiz session
    const supabase = createClient()
    const { data: session, error } = await supabase
      .from('quiz_sessions')
      .insert({
        user_id: user.id,
        category,
        difficulty,
        source: 'hub' as const,
        article_slug: null,
        total_questions: HUB_QUESTIONS_PER_QUIZ,
        score: null,
        xp_earned: 0,
      })
      .select('id')
      .single()

    if (error || !session) {
      console.error('Failed to create quiz session:', error)
      return
    }

    router.push(
      `/wiki/learn/${category.toLowerCase()}/quiz?session=${session.id}&difficulty=${difficulty}`
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      {/* Back link */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Link
          href="/wiki/learn"
          className="inline-flex items-center gap-2 text-[#9da6b9] text-sm hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Knowledge Hub
        </Link>
      </motion.div>

      {/* Category Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold text-white mb-2">{category}</h1>
        {knowledge ? (
          <p className="text-[#9da6b9]">
            Current rank:{' '}
            <span className="font-medium" style={{ color: colors.hex }}>
              {getRankTitle(typedCategory, knowledge.current_level)}
            </span>
          </p>
        ) : (
          <p className="text-[#7a8299]">
            {loadingKnowledge ? 'Loading...' : 'Start your first quiz'}
          </p>
        )}
      </motion.div>

      {/* Difficulty Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
        className="space-y-3"
      >
        {DIFFICULTY_LEVELS.map((difficulty) => (
          <QuizStartCard
            key={difficulty}
            category={typedCategory}
            difficulty={difficulty}
            isUnlocked={isLevelUnlocked(difficulty)}
            isCurrent={isCurrentLevel(difficulty)}
            knowledge={knowledge ?? undefined}
            onStart={() => handleStart(difficulty)}
          />
        ))}
      </motion.div>
    </div>
  )
}
