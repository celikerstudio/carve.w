'use client'

import { Brain } from 'lucide-react'

interface ChatBubbleProps {
  role: 'user' | 'assistant'
  content: string
}

export function ChatBubble({ role, content }: ChatBubbleProps) {
  const isAssistant = role === 'assistant'

  return (
    <div className={`flex items-start gap-2 px-4 ${isAssistant ? 'justify-start' : 'justify-end'}`}>
      {isAssistant && (
        <div className="w-7 h-7 rounded-full bg-[#1c1f27] border border-white/[0.06] flex items-center justify-center shrink-0 mt-1">
          <Brain className="w-3.5 h-3.5 text-[#9da6b9]" />
        </div>
      )}

      <div
        className={`max-w-[80%] px-3 py-2.5 rounded-2xl ${
          isAssistant
            ? 'bg-[#1c1f27] border border-white/[0.06]'
            : 'bg-[#c8b86e]/[0.08] border border-[#c8b86e]'
        }`}
      >
        <p className="text-[15px] text-white leading-relaxed whitespace-pre-wrap">{content}</p>
      </div>

      {isAssistant && <div className="min-w-[40px]" />}
    </div>
  )
}
