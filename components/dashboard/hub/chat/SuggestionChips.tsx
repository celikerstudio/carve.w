'use client'

import { iconMap, type SuggestionChip } from '../mock-data'

interface SuggestionChipsProps {
  chips: SuggestionChip[]
  onChipClick: (label: string) => void
}

export function SuggestionChips({ chips, onChipClick }: SuggestionChipsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide px-4 py-2">
      {chips.map((chip) => {
        const Icon = iconMap[chip.icon]
        return (
          <button
            key={chip.id}
            onClick={() => onChipClick(chip.label)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] border border-white/[0.08] text-[13px] text-white/45 hover:border-white/[0.15] hover:text-white/65 transition-colors whitespace-nowrap shrink-0"
          >
            {Icon && <Icon className="w-3 h-3 text-white/35" />}
            <span>{chip.label}</span>
          </button>
        )
      })}
    </div>
  )
}
