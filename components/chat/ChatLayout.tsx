'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChatSidebar } from './ChatSidebar'
import { CarveChat } from '@/components/dashboard/hub/chat/CarveChat'
import { ChatContextPanel } from './ChatContextPanel'
import { type SectionConfig, healthConfig, moneyConfig, homeConfig, lifeConfig, inboxConfig } from '@/components/dashboard/hub/mock-data'
import { useChatHistory } from '@/hooks/useChatHistory'
import type { ChatMessage } from '@/hooks/useChatHistory'
import type { AppId } from './types'

const appConfigs: Record<AppId, SectionConfig> = {
  home: homeConfig,
  health: healthConfig,
  money: moneyConfig,
  life: lifeConfig,
  inbox: inboxConfig,
}

const defaultCards: Record<AppId, string[]> = {
  home: [],
  health: ['workout', 'week', 'today', 'streak'],
  money: ['budget'],
  life: ['trip'],
  inbox: ['attention'],
}

interface ChatLayoutProps {
  userId: string
  userName?: string
}

export function ChatLayout({ userId, userName = 'User' }: ChatLayoutProps) {
  const [activeApp, setActiveApp] = useState<AppId>('home')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [visibleCards, setVisibleCards] = useState<string[]>([])
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  const [loadedMessages, setLoadedMessages] = useState<ChatMessage[]>([])
  // @ai-why: Survives the app-switch remount long enough for the next CarveChat instance to auto-send once.
  const [pendingMessage, setPendingMessage] = useState<string | null>(null)
  const config = appConfigs[activeApp]

  const { conversations, loadMessages, refreshConversations } = useChatHistory(userId)

  const handleAppChange = useCallback((app: AppId, message?: string) => {
    setActiveApp(app)
    setVisibleCards(defaultCards[app] || [])
    setSelectedConversationId(null)
    setLoadedMessages([])
    setPendingMessage(message ?? null)
  }, [])

  const handleCardAdd = useCallback((cardType: string) => {
    setVisibleCards(prev =>
      prev.includes(cardType) ? prev : [...prev, cardType]
    )
  }, [])

  const handleSelectConversation = useCallback(async (conversationId: string, conversationApp: string) => {
    // Switch to the conversation's app if different
    const app = conversationApp as AppId
    if (app !== activeApp && appConfigs[app]) {
      setActiveApp(app)
      setVisibleCards(defaultCards[app] || [])
    }

    // Load messages
    const messages = await loadMessages(conversationId)
    setLoadedMessages(messages)
    setSelectedConversationId(conversationId)
    setPendingMessage(null)
  }, [activeApp, loadMessages])

  const handleNewChat = useCallback(() => {
    setSelectedConversationId(null)
    setLoadedMessages([])
    setPendingMessage(null)
    // Keep current app, just reset conversation
  }, [])

  const handleConversationCreated = useCallback((id: string) => {
    setSelectedConversationId(id)
    refreshConversations()
  }, [refreshConversations])

  const handlePendingMessageHandled = useCallback(() => {
    setPendingMessage(null)
  }, [])

  const showContextPanel = activeApp !== 'home'

  // Use conversationId + activeApp as key so CarveChat remounts on either change
  const chatKey = selectedConversationId || activeApp

  return (
    <div className="flex h-full">
      {/* Left sidebar */}
      <ChatSidebar
        activeApp={activeApp}
        onAppChange={handleAppChange}
        userName={userName}
        collapsed={!sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        conversations={conversations}
        selectedConversationId={selectedConversationId}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
      />

      {/* Center: chat */}
      <div className="flex-1 min-w-0">
        <CarveChat
          key={chatKey}
          config={config}
          activeApp={activeApp}
          isHome={activeApp === 'home'}
          userName={userName}
          conversationId={selectedConversationId}
          storedMessages={loadedMessages}
          pendingMessage={pendingMessage}
          onPendingMessageHandled={handlePendingMessageHandled}
          onConversationCreated={handleConversationCreated}
          onAppChange={handleAppChange}
          onCardAdd={handleCardAdd}
        />
      </div>

      {/* Right context panel — only when cards are loaded */}
      <AnimatePresence>
        {showContextPanel && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            className="hidden lg:block shrink-0 border-l border-white/[0.07] overflow-hidden"
          >
            <div className="w-[280px] h-full">
              <ChatContextPanel activeApp={activeApp} visibleCards={visibleCards} userId={userId} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
