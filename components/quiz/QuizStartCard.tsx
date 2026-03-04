'use client'

import { motion } from 'framer-motion'
import { Lock, Brain, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { RANK_TITLES, LEVEL_UNLOCK_MIN_QUESTIONS } from '@/lib/quiz/constants'
import type { QuizCategory, DifficultyLevel } from '@/lib/quiz/constants'
import type { UserKnowledge } from '@/lib/quiz/types'

interface QuizStartCardProps {
  category: QuizCategory
  difficulty: DifficultyLevel
  isUnlocked: boolean
  isCurrent: boolean
  knowledge?: UserKnowledge
  onStart: () => void
}

const DIFFICULTY_LABELS: Record<DifficultyLevel, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  expert: 'Expert',
}

export function QuizStartCard({
  category,
  difficulty,
  isUnlocked,
  isCurrent,
  knowledge,
  onStart,
}: QuizStartCardProps) {
  const rankTitle = RANK_TITLES[category]?.[difficulty] ?? ''
  const isCompleted = isUnlocked && !isCurrent && knowledge != null
  const accuracy =
    knowledge && knowledge.level_attempted > 0
      ? Math.round((knowledge.level_correct / knowledge.level_attempted) * 100)
      : null
  const progressPercent =
    knowledge
      ? Math.min(100, (knowledge.level_attempted / LEVEL_UNLOCK_MIN_QUESTIONS) * 100)
      : 0

  // Pick icon based on state
  const Icon = !isUnlocked ? Lock : isCurrent ? Brain : CheckCircle2

  return (
    <motion.button
      onClick={isUnlocked ? onStart : undefined}
      disabled={!isUnlocked}
      whileHover={isUnlocked ? { scale: 1.02 } : undefined}
      whileTap={isUnlocked ? { scale: 0.98 } : undefined}
      className={cn(
        'w-full rounded-xl border p-4 text-left transition-colors duration-200',
        // Locked state
        !isUnlocked && 'bg-[#1c1f27]/50 border-white/[0.03] opacity-50 cursor-not-allowed',
        // Current state (gold accent border)
        isCurrent && isUnlocked && 'bg-[#1c1f27] border-[#c8b86e]/40 hover:border-[#c8b86e]/60',
        // Completed state
        isCompleted && 'bg-[#1c1f27] border-white/[0.06] hover:border-white/[0.12]',
        // Default unlocked (not current, not completed)
        isUnlocked && !isCurrent && !isCompleted && 'bg-[#1c1f27] border-white/[0.06] hover:border-white/[0.12]',
      )}
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center',
              !isUnlocked && 'bg-white/[0.04] text-[#7a8299]',
              isCurrent && isUnlocked && 'bg-[#c8b86e]/10 text-[#c8b86e]',
              isCompleted && 'bg-emerald-500/10 text-emerald-400',
              isUnlocked && !isCurrent && !isCompleted && 'bg-white/[0.06] text-[#9da6b9]',
            )}
          >
            <Icon className="w-4 h-4" />
          </div>
          <span
            className={cn(
              'font-semibold text-[15px]',
              isUnlocked ? 'text-white' : 'text-[#7a8299]',
            )}
          >
            {DIFFICULTY_LABELS[difficulty]}
          </span>
        </div>

        <span className="text-sm text-[#7a8299]">{rankTitle}</span>
      </div>

      {/* Knowledge stats (if available) */}
      {knowledge && isUnlocked && (
        <div className="mt-3 space-y-2">
          {/* Accuracy */}
          {accuracy !== null && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#7a8299]">Accuracy</span>
              <span className="text-xs text-[#9da6b9] font-medium tabular-nums">
                {accuracy}%
              </span>
            </div>
          )}

          {/* Progress bar */}
          <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500 ease-out',
                isCurrent ? 'bg-[#c8b86e]' : 'bg-emerald-500/60',
              )}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}
    </motion.button>
  )
}
