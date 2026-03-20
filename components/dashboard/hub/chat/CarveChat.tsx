'use client'

import { useEffect, useRef, useMemo, useCallback, useState } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { CarveEmptyState } from './CarveEmptyState'
import { ChatBubble } from './ChatBubble'
import { SuggestionChips } from './SuggestionChips'
import { CarveInputBar } from './CarveInputBar'
import { iconMap, healthConfig, type SectionConfig, type SuggestionChip } from '../mock-data'
import type { AppId } from '@/components/chat/types'
import type { ChatMessage } from '@/hooks/useChatHistory'

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

// Convert stored messages to UIMessage format for useChat initialMessages
function toUIMessages(stored: ChatMessage[]) {
  return stored.map((m, i) => ({
    id: `stored-${i}`,
    role: m.role as 'user' | 'assistant',
    content: m.content,
    parts: [{ type: 'text' as const, text: m.content }],
  }))
}

interface CarveChatProps {
  config?: SectionConfig
  activeApp?: AppId
  isHome?: boolean
  conversationId?: string | null
  storedMessages?: ChatMessage[]
  onConversationCreated?: (id: string) => void
  onAppChange?: (app: AppId) => void
  onCardAdd?: (cardType: string) => void
}

export function CarveChat({
  config = healthConfig,
  activeApp = 'home',
  isHome = false,
  conversationId: externalConversationId = null,
  storedMessages = [],
  onConversationCreated,
  onAppChange,
  onCardAdd,
}: CarveChatProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const conversationIdRef = useRef<string | null>(externalConversationId)
  // Track which messages we've already saved to avoid duplicates
  const savedCountRef = useRef(storedMessages.length * 2) // stored messages are already in DB

  // Keep ref in sync with prop
  useEffect(() => {
    conversationIdRef.current = externalConversationId
  }, [externalConversationId])

  const transport = useMemo(
    () => new DefaultChatTransport({
      api: '/api/carve-ai/chat',
      body: { activeApp },
    }),
    [activeApp]
  )

  const initialMessages = useMemo(() => {
    if (storedMessages.length === 0) return undefined
    return toUIMessages(storedMessages)
  }, [storedMessages])

  const { messages, sendMessage, status } = useChat({
    transport,
    messages: initialMessages,
  })

  const isLoading = status === 'streaming' || status === 'submitted'
  const prevStatusRef = useRef(status)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isLoading])

  // Save assistant message when streaming completes
  useEffect(() => {
    const wasStreaming = prevStatusRef.current === 'streaming' || prevStatusRef.current === 'submitted'
    prevStatusRef.current = status

    if (!wasStreaming || status !== 'ready') return
    if (messages.length === 0) return

    const conversationId = conversationIdRef.current
    if (!conversationId) return

    const lastMsg = messages[messages.length - 1]
    if (lastMsg.role !== 'assistant') return

    const text = lastMsg.parts
      .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
      .map((p) => p.text)
      .join('')
    if (!text) return

    const supabase = createClient()
    supabase.from('ai_messages').insert({
      conversation_id: conversationId,
      role: 'assistant',
      content: text,
    }).then(() => {
      savedCountRef.current = messages.length
    })
  }, [status, messages])

  const getMessageText = useCallback((message: (typeof messages)[0]) => {
    return message.parts
      .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
      .map((p) => p.text)
      .join('')
  }, [])

  const handleSend = useCallback(
    async (content: string) => {
      // Create conversation on first message if none exists
      if (!conversationIdRef.current) {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data } = await supabase
          .from('ai_conversations')
          .insert({
            user_id: user.id,
            title: content.length > 60 ? content.slice(0, 57) + '...' : content,
            active_app: activeApp,
          })
          .select('id')
          .single()

        if (data) {
          conversationIdRef.current = data.id
          onConversationCreated?.(data.id)
        }
      }

      // Save user message to DB
      if (conversationIdRef.current) {
        const supabase = createClient()
        supabase.from('ai_messages').insert({
          conversation_id: conversationIdRef.current,
          role: 'user',
          content,
        })
      }

      sendMessage({ text: content })
    },
    [sendMessage, activeApp, onConversationCreated]
  )

  const handleChipClick = useCallback(
    (chip: SuggestionChip) => {
      if (chip.appId) {
        onAppChange?.(chip.appId)
      }
      if (chip.cardType) {
        onCardAdd?.(chip.cardType)
      }
      handleSend(chip.label)
    },
    [handleSend, onAppChange, onCardAdd]
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
            isHome={isHome}
            onChipClick={handleChipClick}
          />
          <div className="w-full max-w-[560px] mt-4 px-4">
            <CarveInputBar onSend={handleSend} disabled={isLoading} />
          </div>
        </div>
      )}
    </div>
  )
}
