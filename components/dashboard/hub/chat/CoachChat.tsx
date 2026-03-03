'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { CoachEmptyState } from './CoachEmptyState'
import { ChatBubble } from './ChatBubble'
import { SuggestionChips } from './SuggestionChips'
import { CoachInputBar } from './CoachInputBar'
import { iconMap, mockSuggestionChips, type ChatMessage } from '../mock-data'

const MOCK_COACH_REPLIES: Record<string, string> = {
  "What's my progress?":
    "You're doing great! 3 workouts this week, 12-day streak going strong. Your XP puts you at Intermediate rank — 2,550 XP away from Advanced. Keep pushing!",
  'Plan my workout':
    "Based on your history, I'd suggest an upper body session today. You haven't hit chest/shoulders since Monday. Want me to build a quick plan?",
  "How's my budget?":
    "You've spent €1,240 of your €2,000 monthly budget. That's 62% with 12 days left. Your biggest category is groceries at €340. Looking solid!",
  'Analyze my week':
    "This week: 3 workouts (target 4), 8.2k avg steps, and nutrition is on point at 1,840 cal avg. Money-wise you're tracking under budget. One more workout and you'll hit all your goals!",
}

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

export function CoachChat() {
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
        MOCK_COACH_REPLIES[content] ||
        "That's a great question! In the full version, I'll have real-time insights from your health, nutrition, and financial data. For now, try one of the suggestion chips!"
      const coachMessage: ChatMessage = {
        id: `msg-${++messageCounter}`,
        role: 'coach',
        content: replyContent,
        timestamp: new Date(),
      }
      setIsTyping(false)
      setMessages((prev) => [...prev, coachMessage])
    }, 800)
  }, [])

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
        <CoachEmptyState onChipClick={handleSend} />
      )}

      {hasMessages && (
        <SuggestionChips chips={mockSuggestionChips} onChipClick={handleSend} />
      )}

      <CoachInputBar onSend={handleSend} />
    </div>
  )
}
