'use client'

import { motion } from 'framer-motion'
import { iconMap, mockStatusPills, mockSuggestionChips, type SuggestionChip } from '../mock-data'

interface CarveEmptyStateProps {
  onChipClick: (label: string) => void
  subtitle?: string
  statusPills?: { icon: string; label: string }[]
  suggestionChips?: SuggestionChip[]
}

export function CarveEmptyState({
  onChipClick,
  subtitle = "I know your health, money, trips, and inbox. Ask me anything.",
  statusPills = mockStatusPills,
  suggestionChips = mockSuggestionChips,
}: CarveEmptyStateProps) {
  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="flex flex-col items-center gap-6 max-w-md px-4">
        {/* Welcome Text */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="text-center"
        >
          <p className="text-[22px] font-bold text-white mb-2">
            What can I help with?
          </p>
          <p className="text-[14px] text-white/30">
            {subtitle}
          </p>
        </motion.div>

        {/* Status Pills */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="flex flex-wrap justify-center gap-2"
        >
          {statusPills.map((pill) => {
            const Icon = iconMap[pill.icon]
            return (
              <div
                key={pill.label}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-[12px] text-white/40"
              >
                {Icon && <Icon className="w-3 h-3 text-white/25" />}
                <span>{pill.label}</span>
              </div>
            )
          })}
        </motion.div>

        {/* Suggestion Chips - 2 column grid */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="grid grid-cols-2 gap-2 w-full"
        >
          {suggestionChips.map((chip) => {
            const Icon = iconMap[chip.icon]
            return (
              <button
                key={chip.id}
                onClick={() => onChipClick(chip.label)}
                className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-left hover:bg-white/[0.06] hover:border-white/[0.1] transition-all"
              >
                {Icon && <Icon className="w-4 h-4 text-white/20 shrink-0" />}
                <span className="text-[13px] text-white/60">{chip.label}</span>
              </button>
            )
          })}
        </motion.div>
      </div>
    </div>
  )
}
