'use client'

import { useState, useRef } from 'react'
import { ArrowUp, Plus, Mic, Paperclip } from 'lucide-react'

const MAX_LENGTH = 4000

interface CarveInputBarProps {
  onSend: (message: string) => void
  disabled?: boolean
}

export function CarveInputBar({ onSend, disabled }: CarveInputBarProps) {
  const [input, setInput] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    if (value.length > MAX_LENGTH) return
    setInput(value)
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }

  const showCounter = input.length > MAX_LENGTH * 0.8

  const handleSend = () => {
    if (!input.trim() || disabled) return
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
        className={`flex flex-col rounded-2xl bg-white/[0.06] border transition-colors ${
          isFocused ? 'border-white/[0.15]' : 'border-white/[0.08]'
        }`}
      >
        {/* Input row */}
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Carve anything..."
          disabled={disabled}
          rows={1}
          className="flex-1 bg-transparent text-[15px] text-white/90 placeholder:text-white/25 resize-none outline-none max-h-[120px] px-4 pt-3 pb-1 disabled:opacity-50"
        />

        {/* Toolbar row */}
        <div className="flex items-center justify-between px-3 pb-2.5 pt-1">
          <div className="flex items-center gap-1">
            <button className="w-8 h-8 rounded-full flex items-center justify-center text-white/30 hover:text-white/50 hover:bg-white/[0.06] transition-colors">
              <Plus className="w-4 h-4" />
            </button>
            <button className="w-8 h-8 rounded-full flex items-center justify-center text-white/30 hover:text-white/50 hover:bg-white/[0.06] transition-colors">
              <Paperclip className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-1">
            {showCounter && (
              <span className={`text-[11px] mr-1 tabular-nums ${input.length > MAX_LENGTH * 0.95 ? 'text-red-400/60' : 'text-white/20'}`}>
                {input.length}/{MAX_LENGTH}
              </span>
            )}
            <button className="w-8 h-8 rounded-full flex items-center justify-center text-white/30 hover:text-white/50 hover:bg-white/[0.06] transition-colors">
              <Mic className="w-4 h-4" />
            </button>
            <button
              onClick={handleSend}
              disabled={!input.trim() || disabled}
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                input.trim() && !disabled
                  ? 'bg-white text-[#191a1c]'
                  : 'bg-white/[0.08] text-white/30'
              }`}
            >
              <ArrowUp className="w-4 h-4" strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
