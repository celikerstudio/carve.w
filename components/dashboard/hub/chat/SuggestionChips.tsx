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
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1c1f27] border border-white/[0.06] text-[13px] text-[#9da6b9] hover:border-[#c8b86e]/30 hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            {Icon && <Icon className="w-3 h-3 text-[#c8b86e]" />}
            <span>{chip.label}</span>
          </button>
        )
      })}
    </div>
  )
}
