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
        <div className="w-7 h-7 rounded-full bg-white/[0.07] border border-white/[0.08] flex items-center justify-center shrink-0 mt-1">
          <Brain className="w-3.5 h-3.5 text-white/45" />
        </div>
      )}

      <div
        className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl ${
          isAssistant
            ? 'bg-white/[0.06] border border-white/[0.08]'
            : 'bg-white/[0.12] border border-white/[0.10]'
        }`}
      >
        <p className="text-[15px] text-white/85 leading-relaxed whitespace-pre-wrap">{content}</p>
      </div>

      {isAssistant && <div className="min-w-[40px]" />}
    </div>
  )
}
