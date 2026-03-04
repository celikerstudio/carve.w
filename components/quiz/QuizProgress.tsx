'use client'

import { cn } from '@/lib/utils'

interface QuizProgressProps {
  current: number
  total: number
  score: number
  className?: string
}

export function QuizProgress({ current, total, score, className }: QuizProgressProps) {
  const progress = total > 0 ? (current / total) * 100 : 0

  return (
    <div className={cn('flex items-center gap-4', className)}>
      {/* Progress bar track */}
      <div className="flex-1 h-2 rounded-full bg-white/[0.06] overflow-hidden">
        <div
          className="h-full rounded-full bg-[#c8b86e] transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Stats */}
      <span className="text-sm text-[#7a8299] tabular-nums whitespace-nowrap">
        {current}/{total} &middot; {score} correct
      </span>
    </div>
  )
}
