'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'motion/react'
import { CoachEmptyState } from './CoachEmptyState'
import { ChatBubble } from './ChatBubble'
import { SuggestionChips } from './SuggestionChips'
import { CoachInputBar } from './CoachInputBar'
import { iconMap, healthConfig, type ChatMessage, type SectionConfig } from '../mock-data'

let messageCounter = 0

function TypingIndicator() {
  const BrainIcon = iconMap['Brain']
  return (
    <div className="flex items-start gap-2 px-4">
      <div className="w-7 h-7 rounded-full bg-[#1c1f27] border border-white/[0.06] flex items-center justify-center shrink-0 mt-1">
        {BrainIcon && <BrainIcon className="w-3.5 h-3.5 text-[#9da6b9]" />}
      </div>
      <div className="px-4 py-3 rounded-2xl bg-[#1c1f27] border border-white/[0.06]">
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-[#c8b86e]"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

interface CoachChatProps {
  config?: SectionConfig
}

export function CoachChat({ config = healthConfig }: CoachChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping])

  const handleSend = useCallback((content: string) => {
    const userMessage: ChatMessage = {
      id: `msg-${++messageCounter}`,
      role: 'user',
      content,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])
    setIsTyping(true)

    setTimeout(() => {
      const replyContent =
        config.coachReplies[content] ||
        "That's a great question! In the full version, I'll have real-time insights from your data. For now, try one of the suggestion chips!"
      const coachMessage: ChatMessage = {
        id: `msg-${++messageCounter}`,
        role: 'coach',
        content: replyContent,
        timestamp: new Date(),
      }
      setIsTyping(false)
      setMessages((prev) => [...prev, coachMessage])
    }, 800)
  }, [config.coachReplies])

  const hasMessages = messages.length > 0

  return (
    <div className="flex flex-col h-full">
      {hasMessages ? (
        <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-hide py-4">
          <div className="flex flex-col gap-3">
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChatBubble message={msg} />
              </motion.div>
            ))}
            {isTyping && <TypingIndicator />}
          </div>
        </div>
      ) : (
        <CoachEmptyState
          onChipClick={handleSend}
          subtitle={config.subtitle}
          statusPills={config.statusPills}
          suggestionChips={config.suggestionChips}
        />
      )}

      {hasMessages && (
        <SuggestionChips chips={config.suggestionChips} onChipClick={handleSend} />
      )}

      <CoachInputBar onSend={handleSend} />
    </div>
  )
}
