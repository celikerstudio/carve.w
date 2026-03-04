'use client'

import { motion } from 'framer-motion'
import { Trophy, Star, TrendingUp, ArrowRight, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { LEVEL_UNLOCK_MIN_QUESTIONS } from '@/lib/quiz/constants'
import type { QuizSubmitResponse } from '@/lib/quiz/types'

interface QuizResultsProps {
  response: QuizSubmitResponse
  category: string
  onRetryMissed?: () => void
}

export function QuizResults({ response, category, onRetryMissed }: QuizResultsProps) {
  const { score, total, xp_earned, level_progress } = response
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0
  const isPerfect = score === total

  const levelCorrect = level_progress?.level_correct ?? 0
  const levelAttempted = level_progress?.level_attempted ?? 0
  const progressTowardUnlock = Math.min(
    100,
    (levelAttempted / LEVEL_UNLOCK_MIN_QUESTIONS) * 100,
  )

  return (
    <div className="flex flex-col items-center gap-8 py-4">
      {/* Score card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md rounded-2xl border border-white/[0.06] bg-[rgba(28,31,39,0.7)] backdrop-blur-xl p-8 text-center space-y-4"
      >
        {/* Icon */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="flex justify-center"
        >
          {isPerfect ? (
            <Star className="w-12 h-12 text-[#c8b86e] fill-[#c8b86e]" />
          ) : (
            <Trophy className="w-12 h-12 text-[#c8b86e]" />
          )}
        </motion.div>

        {/* Score */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <p className="text-5xl font-bold text-white tabular-nums">
            {score}/{total}
          </p>
          <p className="text-[#9da6b9] text-sm mt-1">
            {percentage}% correct
          </p>
        </motion.div>

        {/* XP earned badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="flex justify-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#c8b86e]/10 border border-[#c8b86e]/20">
            <TrendingUp className="w-4 h-4 text-[#c8b86e]" />
            <span className="text-[#c8b86e] text-sm font-semibold">
              +{xp_earned} XP
            </span>
          </div>
        </motion.div>
      </motion.div>

      {/* Level progress */}
      {level_progress && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="w-full max-w-md rounded-2xl border border-white/[0.06] bg-[rgba(28,31,39,0.7)] backdrop-blur-xl p-6 space-y-4"
        >
          {level_progress.unlocked_next ? (
            /* Level up celebration */
            <div className="text-center space-y-2">
              <motion.p
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.6, type: 'spring' }}
                className="text-2xl font-bold text-[#c8b86e]"
              >
                Level Up!
              </motion.p>
              <p className="text-white font-semibold text-lg">
                {level_progress.rank_title}
              </p>
              <p className="text-[#9da6b9] text-sm">
                You've unlocked the next difficulty level
              </p>
            </div>
          ) : (
            /* Progress toward next level */
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[13px] font-semibold text-[#9da6b9] uppercase tracking-wider">
                  Level Progress
                </p>
                <p className="text-sm text-[#7a8299] tabular-nums">
                  {levelAttempted}/{LEVEL_UNLOCK_MIN_QUESTIONS} questions
                </p>
              </div>

              {/* Progress bar */}
              <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-[#c8b86e]"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressTowardUnlock}%` }}
                  transition={{ duration: 0.8, delay: 0.6, ease: 'easeOut' }}
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-white font-medium">
                  {level_progress.rank_title}
                </span>
                <span className="text-[#7a8299] tabular-nums">
                  {levelCorrect} correct of {levelAttempted}
                </span>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Action buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.7 }}
        className="flex items-center gap-3 w-full max-w-md"
      >
        {/* Retry missed (only if not perfect) */}
        {score < total && onRetryMissed && (
          <button
            onClick={onRetryMissed}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl',
              'border border-white/[0.06] bg-[#1c1f27] text-white text-sm font-medium',
              'hover:bg-white/[0.08] transition-colors',
            )}
          >
            <RotateCcw className="w-4 h-4" />
            Retry missed
          </button>
        )}

        {/* Next quiz CTA */}
        <a
          href={`/quiz/${category.toLowerCase()}`}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl',
            'bg-[#c8b86e] text-black text-sm font-semibold',
            'hover:bg-[#c8b86e]/90 transition-colors',
          )}
        >
          Next quiz
          <ArrowRight className="w-4 h-4" />
        </a>
      </motion.div>
    </div>
  )
}
