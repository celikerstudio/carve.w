'use client'

import { motion } from 'framer-motion'
import { iconMap, type SectionConfig } from '../mock-data'

interface CarveEmptyStateProps {
  config: SectionConfig
  onChipClick: (label: string) => void
}

export function CarveEmptyState({ config, onChipClick }: CarveEmptyStateProps) {
  return (
    <div className="flex flex-col items-center w-full max-w-[560px] px-4">
      {/* Brand */}
      <motion.h1
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.05 }}
        className="text-[40px] md:text-[48px] font-light text-white/[0.55] tracking-tight mb-10 select-none"
      >
        carve
      </motion.h1>

      {/* Suggestion chips */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="flex flex-wrap items-center justify-center gap-2 mt-4"
      >
        {config.suggestionChips.slice(0, 4).map((chip) => {
          const Icon = iconMap[chip.icon]
          return (
            <button
              key={chip.id}
              onClick={() => onChipClick(chip.label)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/[0.08] text-[13px] text-white/40 hover:text-white/60 hover:border-white/[0.15] transition-colors"
            >
              {Icon && <Icon className="w-3.5 h-3.5" />}
              <span>{chip.label}</span>
            </button>
          )
        })}
      </motion.div>
    </div>
  )
}
