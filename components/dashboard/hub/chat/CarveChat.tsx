'use client'

import { useEffect, useRef, useMemo, useCallback } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { motion } from 'framer-motion'
import { CarveEmptyState } from './CarveEmptyState'
import { ChatBubble } from './ChatBubble'
import { SuggestionChips } from './SuggestionChips'
import { CarveInputBar } from './CarveInputBar'
import { iconMap, healthConfig, type SectionConfig } from '../mock-data'

function TypingIndicator() {
  const BrainIcon = iconMap['Brain']
  return (
    <div className="flex items-start gap-2 px-4">
      <div className="w-7 h-7 rounded-full bg-surface border border-white/[0.06] flex items-center justify-center shrink-0 mt-1">
        {BrainIcon && <BrainIcon className="w-3.5 h-3.5 text-white/40" />}
      </div>
      <div className="px-4 py-3 rounded-2xl bg-surface border border-white/[0.06]">
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-white/30"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

interface CarveChatProps {
  config?: SectionConfig
}

export function CarveChat({ config = healthConfig }: CarveChatProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const transport = useMemo(
    () => new DefaultChatTransport({ api: '/api/carve-ai/chat' }),
    []
  )

  const { messages, sendMessage, status } = useChat({ transport })

  const isLoading = status === 'streaming' || status === 'submitted'

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isLoading])

  const getMessageText = useCallback((message: (typeof messages)[0]) => {
    return message.parts
      .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
      .map((p) => p.text)
      .join('')
  }, [])

  const handleSend = useCallback(
    (content: string) => {
      sendMessage({ text: content })
    },
    [sendMessage]
  )

  const hasMessages = messages.length > 0

  return (
    <div className="flex flex-col h-full">
      {hasMessages ? (
        <>
          <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-hide py-4">
            <div className="flex flex-col gap-3">
              {messages.map((msg) => {
                const text = getMessageText(msg)
                if (!text) return null
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChatBubble
                      role={msg.role as 'user' | 'assistant'}
                      content={text}
                    />
                  </motion.div>
                )
              })}
              {isLoading && <TypingIndicator />}
            </div>
          </div>

          <SuggestionChips chips={config.suggestionChips} onChipClick={handleSend} />
          <CarveInputBar onSend={handleSend} disabled={isLoading} />
        </>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center pb-8">
          <CarveEmptyState
            config={config}
            onChipClick={handleSend}
          />
          <div className="w-full max-w-[560px] mt-4 px-4">
            <CarveInputBar onSend={handleSend} disabled={isLoading} />
          </div>
        </div>
      )}
    </div>
  )
}
