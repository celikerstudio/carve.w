'use client'

import { useEffect, useRef, useMemo, useCallback, useState } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowDown } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { CarveEmptyState } from './CarveEmptyState'
import { ChatErrorBubble } from './ChatBubble'
import { ChatMessage as ChatMessageBubble } from '@/components/wiki/chat/ChatMessage'
import { CarveInputBar } from './CarveInputBar'
// @ai-todo: Re-enable ResponseActions when AI generates follow-up actions contextually
// import { ResponseActions, type ResponseAction } from './ResponseActions'
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

function generateTitle(message: string): string {
  let title = message.trim()

  // Strip greeting prefixes (NL + EN)
  title = title.replace(
    /^(hey|hi|hoi|hallo|yo|goedemorgen|goedemiddag|goedenavond|good\s*morning|good\s*evening)[,!.\s]*/i,
    ''
  ).trim()

  // If nothing left after stripping greeting, use original message
  if (!title) title = message.trim()
  // If still empty (e.g. just "Hey"), fallback
  if (!title) return 'New conversation'

  // Take first sentence if it ends within 60 chars
  const sentenceEnd = title.search(/[.!?]\s/)
  if (sentenceEnd > 0 && sentenceEnd < 60) {
    title = title.slice(0, sentenceEnd + 1)
  }

  // Truncate at word boundary if still too long
  if (title.length > 50) {
    title = title.slice(0, 50).replace(/\s+\S*$/, '')
  }

  // Capitalize first letter
  return title[0].toUpperCase() + title.slice(1)
}

interface CarveChatProps {
  config?: SectionConfig
  activeApp?: AppId
  isHome?: boolean
  userName?: string
  conversationId?: string | null
  storedMessages?: ChatMessage[]
  pendingMessage?: string | null
  onPendingMessageHandled?: () => void
  onConversationCreated?: (id: string) => void
  onAppChange?: (app: AppId, message?: string) => void
  onCardAdd?: (cardType: string) => void
  onArticleClick?: (slug: string) => void
}

export function CarveChat({
  config = healthConfig,
  activeApp = 'home',
  isHome = false,
  userName,
  conversationId: externalConversationId = null,
  storedMessages = [],
  pendingMessage = null,
  onPendingMessageHandled,
  onConversationCreated,
  onAppChange,
  onCardAdd,
  onArticleClick,
}: CarveChatProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const conversationIdRef = useRef<string | null>(externalConversationId)
  // Tracks the last saved assistant message ID to prevent duplicate saves
  const lastSavedMsgIdRef = useRef<string | null>(null)
  const browserTimeZone = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone || undefined,
    []
  )

  // Keep ref in sync with prop
  useEffect(() => {
    conversationIdRef.current = externalConversationId
  }, [externalConversationId])

  const transport = useMemo(
    () => new DefaultChatTransport({
      api: '/api/carve-ai/chat',
      body: { activeApp, timeZone: browserTimeZone },
    }),
    [activeApp, browserTimeZone]
  )

  const initialMessages = useMemo(() => {
    if (storedMessages.length === 0) return undefined
    return toUIMessages(storedMessages)
  }, [storedMessages])

  const { messages, sendMessage, status, error } = useChat({
    transport,
    messages: initialMessages,
  })

  const isLoading = status === 'streaming' || status === 'submitted'
  const prevStatusRef = useRef(status)
  const [showScrollButton, setShowScrollButton] = useState(false)
  const isNearBottomRef = useRef(true)

  // Check if user is near bottom of scroll container
  const checkScrollPosition = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const threshold = 100
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < threshold
    isNearBottomRef.current = nearBottom
    setShowScrollButton(!nearBottom)
  }, [])

  const scrollToBottom = useCallback(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [])

  // Auto-scroll only when near bottom — uses rAF to batch with browser paint instead of
  // firing on every token during streaming
  const scrollRafRef = useRef<number | null>(null)
  useEffect(() => {
    if (!isNearBottomRef.current || !scrollRef.current) return
    if (scrollRafRef.current) cancelAnimationFrame(scrollRafRef.current)
    scrollRafRef.current = requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight })
      scrollRafRef.current = null
    })
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
    // Prevent duplicate saves (e.g. StrictMode double-invoke or re-renders)
    if (lastMsg.id === lastSavedMsgIdRef.current) return

    const text = lastMsg.parts
      .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
      .map((p) => p.text)
      .join('')
    if (!text) return

    lastSavedMsgIdRef.current = lastMsg.id
    const supabase = createClient()
    supabase.from('ai_messages').insert({
      conversation_id: conversationId,
      role: 'assistant',
      content: text,
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
        try {
          const supabase = createClient()
          const { data: { user } } = await supabase.auth.getUser()
          if (!user) return

          const { data, error } = await supabase
            .from('ai_conversations')
            .insert({
              user_id: user.id,
              title: generateTitle(content),
              active_app: activeApp,
            })
            .select('id')
            .single()

          if (error || !data) {
            console.error('[CarveChat] Failed to create conversation:', error?.message)
            // Still send the message — the AI response won't be persisted but the user gets an answer
          } else {
            conversationIdRef.current = data.id
            onConversationCreated?.(data.id)
          }
        } catch (err) {
          console.error('[CarveChat] Conversation creation error:', err)
        }
      }

      // Save user message to DB (fire-and-forget, non-blocking)
      if (conversationIdRef.current) {
        const supabase = createClient()
        supabase.from('ai_messages').insert({
          conversation_id: conversationIdRef.current,
          role: 'user',
          content,
        }).then(({ error }) => {
          if (error) console.error('[CarveChat] Failed to save user message:', error.message)
        })
      }

      sendMessage({ text: content })
    },
    [sendMessage, activeApp, onConversationCreated]
  )

  // Auto-send pending message after remount (from home chip click)
  const pendingHandled = useRef(false)
  useEffect(() => {
    if (pendingMessage && !pendingHandled.current) {
      pendingHandled.current = true
      onPendingMessageHandled?.()
      void handleSend(pendingMessage)
    }
  }, [pendingMessage, handleSend, onPendingMessageHandled])

  const handleChipClick = useCallback(
    (chip: SuggestionChip) => {
      if (chip.appId) {
        // App switch causes remount — pass message through layout so new instance picks it up
        if (chip.cardType) onCardAdd?.(chip.cardType)
        onAppChange?.(chip.appId, chip.label)
        return
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
    <div className="flex flex-col h-full relative">
      {hasMessages ? (
        <>
          <div ref={scrollRef} onScroll={checkScrollPosition} className="relative flex-1 overflow-y-auto scrollbar-hide py-4">
            <div className="flex flex-col gap-3">
              {messages.map((msg, idx) => {
                const text = getMessageText(msg)
                if (!text) return null
                const isCurrentlyStreaming = isLoading && idx === messages.length - 1
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChatMessageBubble
                      role={msg.role as 'user' | 'assistant'}
                      content={text}
                      isStreaming={isCurrentlyStreaming}
                      onArticleClick={onArticleClick}
                    />
                  </motion.div>
                )
              })}
              {isLoading && <TypingIndicator />}
              {error && !isLoading && (
                <ChatErrorBubble message={error.message || 'Er ging iets mis. Probeer het opnieuw.'} />
              )}
            </div>
          </div>

          <AnimatePresence>
            {showScrollButton && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
                onClick={scrollToBottom}
                className="absolute bottom-20 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white/[0.10] border border-white/[0.12] flex items-center justify-center hover:bg-white/[0.15] transition-colors shadow-lg z-10"
              >
                <ArrowDown className="w-4 h-4 text-white/50" />
              </motion.button>
            )}
          </AnimatePresence>

          <CarveInputBar onSend={handleSend} disabled={isLoading} />
        </>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center pb-8">
          <CarveEmptyState
            config={config}
            isHome={isHome}
            userName={userName}
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
