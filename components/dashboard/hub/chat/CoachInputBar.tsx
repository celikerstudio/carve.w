'use client'

import { useState, useRef } from 'react'
import { ArrowUp } from 'lucide-react'

interface CoachInputBarProps {
  onSend: (message: string) => void
}

export function CoachInputBar({ onSend }: CoachInputBarProps) {
  const [input, setInput] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }

  const handleSend = () => {
    if (!input.trim()) return
    onSend(input.trim())
    setInput('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="px-4 pb-4">
      <div
        className={`flex items-end gap-2 px-3 py-2 rounded-2xl bg-[#1c1f27] border transition-colors ${
          isFocused ? 'border-[#c8b86e]/50' : 'border-white/[0.06]'
        }`}
      >
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder="Ask your coach..."
          rows={1}
          className="flex-1 bg-transparent text-[15px] text-white placeholder:text-[#7a8299] resize-none outline-none max-h-[120px] py-1"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim()}
          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${
            input.trim()
              ? 'bg-[#c8b86e] text-[#111318]'
              : 'bg-white/[0.06] text-[#7a8299]'
          }`}
        >
          <ArrowUp className="w-4 h-4" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  )
}
