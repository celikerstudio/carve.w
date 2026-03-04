'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Brain, LogIn } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth/hooks'
import { QUIZ_CATEGORIES } from '@/lib/quiz/constants'
import type { UserKnowledge } from '@/lib/quiz/types'
import { getRankTitle } from '@/lib/quiz/utils'
import { getCategoryColor } from '@/lib/wiki/category-colors'

const CATEGORY_EMOJIS: Record<string, string> = {
  Training: '\u{1F4AA}',
  Nutrition: '\u{1F957}',
  Supplements: '\u{1F48A}',
  Recovery: '\u{1F9D8}',
  Mindset: '\u{1F9E0}',
  Money: '\u{1F4B0}',
  Travel: '\u{2708}\u{FE0F}',
}

export function KnowledgeHubContent() {
  const { user, loading: authLoading } = useAuth()
  const [progress, setProgress] = useState<UserKnowledge[]>([])
  const [loadingProgress, setLoadingProgress] = useState(false)

  useEffect(() => {
    if (!user) return

    const fetchProgress = async () => {
      setLoadingProgress(true)
      try {
        const res = await fetch('/api/quiz/progress')
        if (res.ok) {
          const data = await res.json()
          setProgress(data)
        }
      } catch {
        // Silently fail — user just won't see progress
      } finally {
        setLoadingProgress(false)
      }
    }

    fetchProgress()
  }, [user])

  const getProgressForCategory = (category: string): UserKnowledge | undefined => {
    return progress.find((p) => p.category === category)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="text-center mb-10"
      >
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 rounded-2xl bg-[#c8b86e]/10 border border-[#c8b86e]/20 flex items-center justify-center">
            <Brain className="w-7 h-7 text-[#c8b86e]" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Knowledge Hub</h1>
        <p className="text-[#9da6b9] text-base">
          Test your knowledge, earn XP, and climb the ranks
        </p>
      </motion.div>

      {/* Category Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {QUIZ_CATEGORIES.map((category, index) => {
          const colors = getCategoryColor(category)
          const knowledge = getProgressForCategory(category)
          const emoji = CATEGORY_EMOJIS[category] ?? ''

          return (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05, ease: 'easeOut' }}
            >
              <Link
                href={`/wiki/learn/${category.toLowerCase()}`}
                className="block rounded-xl border border-white/[0.08] bg-[rgba(28,31,39,0.7)] backdrop-blur-xl p-5 hover:border-white/[0.16] transition-all duration-200 group"
              >
                <div className="flex items-center gap-4">
                  {/* Emoji icon */}
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ backgroundColor: `${colors.hex}15` }}
                  >
                    {emoji}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <h2 className="text-white font-semibold text-[15px] group-hover:text-[#c8b86e] transition-colors">
                      {category}
                    </h2>
                    {knowledge ? (
                      <p className="text-[#9da6b9] text-sm mt-0.5">
                        {getRankTitle(category, knowledge.current_level)} &middot;{' '}
                        <span className="tabular-nums">{knowledge.total_correct}</span> correct
                      </p>
                    ) : (
                      <p className="text-[#7a8299] text-sm mt-0.5">
                        {loadingProgress ? 'Loading...' : 'Not started'}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            </motion.div>
          )
        })}
      </div>

      {/* Login prompt */}
      {!authLoading && !user && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="mt-10 rounded-xl border border-white/[0.08] bg-[rgba(28,31,39,0.7)] backdrop-blur-xl p-6 text-center"
        >
          <LogIn className="w-6 h-6 text-[#9da6b9] mx-auto mb-3" />
          <p className="text-white font-medium mb-1">Sign in to track your progress</p>
          <p className="text-[#7a8299] text-sm mb-4">
            Your scores, ranks, and XP are saved when you're logged in.
          </p>
          <Link
            href="/login?redirect=/wiki/learn"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#c8b86e] text-black text-sm font-semibold hover:bg-[#c8b86e]/90 transition-colors"
          >
            Sign in
          </Link>
        </motion.div>
      )}
    </div>
  )
}
