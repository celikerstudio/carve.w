'use client'

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts'
import {
  QUIZ_CATEGORIES,
  RANK_TITLES,
  MASTER_TITLE,
  type QuizCategory,
  type DifficultyLevel,
} from '@/lib/quiz/constants'
import type { UserKnowledge } from '@/lib/quiz/types'
import { motion } from 'framer-motion'

interface KenniskaartProps {
  knowledge: UserKnowledge[]
}

const LEVEL_VALUE: Record<DifficultyLevel, number> = {
  beginner: 1,
  intermediate: 2,
  expert: 3,
}

export function Kenniskaart({ knowledge }: KenniskaartProps) {
  // Build a lookup by category
  const knowledgeByCategory = new Map(
    knowledge.map((k) => [k.category, k]),
  )

  // Radar chart data: one point per category
  const chartData = QUIZ_CATEGORIES.map((cat) => {
    const entry = knowledgeByCategory.get(cat)
    return {
      category: cat,
      value: entry ? LEVEL_VALUE[entry.current_level] : 0,
    }
  })

  // Determine top titles
  const isAllExpert =
    QUIZ_CATEGORIES.every((cat) => {
      const entry = knowledgeByCategory.get(cat)
      return entry?.current_level === 'expert'
    })

  const topTitles = isAllExpert
    ? [{ title: MASTER_TITLE, isMaster: true }]
    : [...knowledge]
        .sort((a, b) => LEVEL_VALUE[b.current_level] - LEVEL_VALUE[a.current_level])
        .slice(0, 2)
        .map((k) => ({ title: k.rank_title, isMaster: false }))

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="space-y-6"
    >
      {/* Title display */}
      {topTitles.length > 0 && (
        <div className="flex items-center justify-center gap-3 flex-wrap">
          {topTitles.map(({ title, isMaster }) => (
            <span
              key={title}
              className={
                isMaster
                  ? 'text-lg font-bold text-[#c8b86e]'
                  : 'text-sm font-semibold text-[#9da6b9]'
              }
            >
              {title}
            </span>
          ))}
        </div>
      )}

      {/* Radar chart */}
      <ResponsiveContainer width="100%" height={280}>
        <RadarChart data={chartData}>
          <PolarGrid stroke="#282e39" />
          <PolarAngleAxis
            dataKey="category"
            tick={{ fill: '#9da6b9', fontSize: 11 }}
          />
          <Radar
            dataKey="value"
            stroke="#c8b86e"
            fill="#c8b86e"
            fillOpacity={0.15}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>

      {/* Category cards */}
      <div className="space-y-2">
        {QUIZ_CATEGORIES.map((cat) => {
          const entry = knowledgeByCategory.get(cat)
          const accuracy =
            entry && entry.total_attempted > 0
              ? Math.round((entry.total_correct / entry.total_attempted) * 100)
              : null

          return (
            <div
              key={cat}
              className="flex items-center justify-between bg-white/[0.02] border border-white/[0.04] rounded-lg px-4 py-3"
            >
              <div>
                <span className="text-sm font-medium text-white">{cat}</span>
                {entry ? (
                  <span className="ml-2 text-xs text-[#7a8299]">
                    {RANK_TITLES[cat as QuizCategory][entry.current_level]}
                  </span>
                ) : (
                  <span className="ml-2 text-xs text-[#7a8299]">&mdash;</span>
                )}
              </div>

              <div className="text-right">
                {entry && accuracy !== null ? (
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-white tabular-nums">
                      {accuracy}%
                    </span>
                    <span className="text-xs text-[#7a8299] tabular-nums">
                      {entry.total_attempted} answered
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-[#7a8299]">&mdash;</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}
