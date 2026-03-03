'use client'

import { iconMap, type ChatMessage } from '../mock-data'

interface ChatBubbleProps {
  message: ChatMessage
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const isCoach = message.role === 'coach'
  const BrainIcon = iconMap['Brain']

  return (
    <div className={`flex items-start gap-2 px-4 ${isCoach ? 'justify-start' : 'justify-end'}`}>
      {isCoach && (
        <div className="w-7 h-7 rounded-full bg-[#1c1f27] border border-white/[0.06] flex items-center justify-center shrink-0 mt-1">
          {BrainIcon && <BrainIcon className="w-3.5 h-3.5 text-[#9da6b9]" />}
        </div>
      )}

      <div
        className={`max-w-[80%] px-3 py-2.5 rounded-2xl ${
          isCoach
            ? 'bg-[#1c1f27] border border-white/[0.06]'
            : 'bg-[#c8b86e]/[0.08] border border-[#c8b86e]'
        }`}
      >
        <p className="text-[15px] text-white leading-relaxed">{message.content}</p>
        <p className="text-[11px] text-[#7a8299] mt-1">
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>

      {isCoach && <div className="min-w-[40px]" />}
    </div>
  )
}
