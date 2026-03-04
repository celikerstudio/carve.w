'use client'

import { motion } from 'motion/react'
import { iconMap, mockStatusPills, mockSuggestionChips, type SuggestionChip } from '../mock-data'

interface CoachEmptyStateProps {
  onChipClick: (label: string) => void
  subtitle?: string
  statusPills?: { icon: string; label: string }[]
  suggestionChips?: SuggestionChip[]
}

export function CoachEmptyState({
  onChipClick,
  subtitle = "Hey there, I'm your Carve coach. Ask me anything about your health, finances, or goals.",
  statusPills = mockStatusPills,
  suggestionChips = mockSuggestionChips,
}: CoachEmptyStateProps) {
  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="flex flex-col items-center gap-6 max-w-sm px-4">
        {/* Coach Avatar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-16 h-16 rounded-full bg-[#1c1f27] border border-white/[0.06] flex items-center justify-center"
        >
          {(() => { const Icon = iconMap['Brain']; return Icon ? <Icon className="w-7 h-7 text-[#9da6b9]" /> : null })()}
        </motion.div>

        {/* Welcome Text */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="text-center"
        >
          <p className="text-[10px] font-bold uppercase tracking-[1.5px] text-[#7a8299] mb-2">
            Carve Coach
          </p>
          <p className="text-[15px] text-[#9da6b9]">
            {subtitle}
          </p>
        </motion.div>

        {/* Status Pills */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="flex flex-wrap justify-center gap-2"
        >
          {statusPills.map((pill) => {
            const Icon = iconMap[pill.icon]
            return (
              <div
                key={pill.label}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1c1f27] border border-white/[0.06] text-[12px] text-[#9da6b9]"
              >
                {Icon && <Icon className="w-3 h-3 text-[#c8b86e]" />}
                <span>{pill.label}</span>
              </div>
            )
          })}
        </motion.div>

        {/* Suggestion Chips - 2 column grid */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.45 }}
          className="grid grid-cols-2 gap-2 w-full"
        >
          {suggestionChips.map((chip) => {
            const Icon = iconMap[chip.icon]
            return (
              <button
                key={chip.id}
                onClick={() => onChipClick(chip.label)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[#1c1f27] border border-white/[0.06] text-left hover:border-[#c8b86e]/30 transition-colors"
              >
                {Icon && <Icon className="w-4 h-4 text-[#c8b86e] shrink-0" />}
                <span className="text-[13px] text-white">{chip.label}</span>
              </button>
            )
          })}
        </motion.div>
      </div>
    </div>
  )
}
