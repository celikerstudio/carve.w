'use client'

import { motion } from 'framer-motion'
import { iconMap, type SectionConfig, type SuggestionChip } from '../mock-data'

interface CarveEmptyStateProps {
  config: SectionConfig
  isHome?: boolean
  onChipClick: (chip: SuggestionChip) => void
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 6) return 'Good night'
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

export function CarveEmptyState({ config, isHome = false, onChipClick }: CarveEmptyStateProps) {
  if (isHome) {
    return (
      <div className="flex flex-col items-center w-full max-w-[560px] px-4">
        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="text-center mb-8"
        >
          <h1 className="text-[28px] md:text-[32px] font-light text-white/60 tracking-tight">
            {getGreeting()}, Furkan
          </h1>
        </motion.div>

        {/* Contextual prompts — what's happening in your life */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="flex flex-col gap-1.5 w-full"
        >
          {config.suggestionChips.map((chip) => {
            const Icon = iconMap[chip.icon]
            return (
              <button
                key={chip.id}
                onClick={() => onChipClick(chip)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-left hover:bg-white/[0.06] hover:border-white/[0.10] transition-all group"
              >
                {Icon && <Icon className="w-4 h-4 text-white/25 shrink-0 group-hover:text-white/40 transition-colors" />}
                <span className="text-[14px] text-white/45 group-hover:text-white/65 transition-colors">{chip.label}</span>
              </button>
            )
          })}
        </motion.div>

        {/* Divider */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="flex items-center gap-4 w-full mt-6"
        >
          <div className="flex-1 h-px bg-white/[0.04]" />
          <span className="text-[11px] text-white/15 uppercase tracking-[0.1em]">or just ask</span>
          <div className="flex-1 h-px bg-white/[0.04]" />
        </motion.div>
      </div>
    )
  }

  // Domain mode — simpler chips
  return (
    <div className="flex flex-col items-center w-full max-w-[560px] px-4">
      <h1 className="text-[40px] md:text-[48px] font-light text-white/[0.55] tracking-tight mb-10 select-none">
        carve
      </h1>

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
              onClick={() => onChipClick(chip)}
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
