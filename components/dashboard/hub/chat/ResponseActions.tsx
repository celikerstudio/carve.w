'use client'

import { motion } from 'framer-motion'
import { iconMap } from '../mock-data'

// @ai-why: These are coach-driven follow-up actions, not static suggestions.
// The coach decides what actions to show based on conversation context.
// isTask = coach needs data from the user (blue pill). isRecommended = coach's pick (subtle highlight).
export interface ResponseAction {
  id: string
  icon: string
  label: string
  isTask?: boolean
  isRecommended?: boolean
}

interface ResponseActionsProps {
  actions: ResponseAction[]
  onActionClick: (action: ResponseAction) => void
}

export function ResponseActions({ actions, onActionClick }: ResponseActionsProps) {
  if (actions.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.15 }}
      className="flex flex-wrap gap-1.5 pl-11 pr-4 mt-1"
    >
      {actions.map((action) => {
        const Icon = iconMap[action.icon]
        const isTask = action.isTask
        const isRecommended = action.isRecommended

        return (
          <button
            key={action.id}
            onClick={() => onActionClick(action)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[13px] transition-all group ${
              isTask
                ? 'border-blue-400/20 text-blue-300/55 hover:border-blue-400/35 hover:text-blue-300/75'
                : 'border-white/[0.08] text-white/40 hover:border-white/[0.15] hover:text-white/60'
            } ${isRecommended ? 'ring-1 ring-white/[0.06]' : ''}`}
          >
            {Icon && (
              <Icon className={`w-3.5 h-3.5 transition-colors ${
                isTask
                  ? 'text-blue-400/40 group-hover:text-blue-400/60'
                  : 'text-white/30 group-hover:text-white/45'
              }`} />
            )}
            <span>{action.label}</span>
            {isRecommended && (
              <span className="text-[10px] text-white/25 ml-0.5">✦</span>
            )}
          </button>
        )
      })}
    </motion.div>
  )
}
