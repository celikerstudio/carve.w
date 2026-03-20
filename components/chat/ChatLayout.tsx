'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChatSidebar } from './ChatSidebar'
import { CarveChat } from '@/components/dashboard/hub/chat/CarveChat'
import { ChatContextPanel } from './ChatContextPanel'
import { type SectionConfig, type SuggestionChip, healthConfig, moneyConfig, homeConfig, lifeConfig, inboxConfig } from '@/components/dashboard/hub/mock-data'
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
  const config = appConfigs[activeApp]

  const { conversations, loadMessages, refreshConversations } = useChatHistory(userId)

  // @ai-why: Each app starts with default cards so the panel feels alive immediately
  const defaultCards: Record<AppId, string[]> = {
    home: [],
    health: ['workout', 'week', 'today', 'streak'],
    money: ['budget'],
    life: ['trip'],
    inbox: ['attention'],
  }

  const handleAppChange = useCallback((app: AppId) => {
    setActiveApp(app)
    setVisibleCards(defaultCards[app] || [])
    setSelectedConversationId(null)
    setLoadedMessages([])
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
  }, [activeApp, loadMessages])

  const handleNewChat = useCallback(() => {
    setSelectedConversationId(null)
    setLoadedMessages([])
    // Keep current app, just reset conversation
  }, [])

  const handleConversationCreated = useCallback((id: string) => {
    setSelectedConversationId(id)
    refreshConversations()
  }, [refreshConversations])

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
          conversationId={selectedConversationId}
          storedMessages={loadedMessages}
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
