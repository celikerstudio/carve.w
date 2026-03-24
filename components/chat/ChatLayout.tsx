'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChatSidebar } from './ChatSidebar'
import { CarveChat } from '@/components/dashboard/hub/chat/CarveChat'
import { ChatContextPanel } from './ChatContextPanel'
import { WikiMetadataProvider } from '@/components/wiki/chat/WikiMetadataProvider'
import { WikiArticleView } from '@/components/wiki/chat/WikiArticleView'
import { WikiCategoryView } from '@/components/wiki/chat/WikiCategoryView'
import { type SectionConfig, healthConfig, moneyConfig, homeConfig, lifeConfig, inboxConfig, breinConfig } from '@/components/dashboard/hub/mock-data'
import { useChatHistory } from '@/hooks/useChatHistory'
import type { ChatMessage } from '@/hooks/useChatHistory'
import type { AppId, AppMode } from './types'

const appConfigs: Record<AppId, SectionConfig> = {
  home: homeConfig,
  health: healthConfig,
  money: moneyConfig,
  life: lifeConfig,
  inbox: inboxConfig,
  brein: breinConfig,
}

const defaultCards: Record<AppId, string[]> = {
  home: [],
  health: ['workout', 'week', 'today', 'streak'],
  money: ['budget'],
  life: ['trip'],
  inbox: ['attention'],
  brein: ['memory', 'profile', 'logbook'],
}

interface ChatLayoutProps {
  userId: string
  userName?: string
}

export function ChatLayout({ userId, userName = 'User' }: ChatLayoutProps) {
  const [activeApp, setActiveApp] = useState<AppId>('home')
  const [activeMode, setActiveMode] = useState<AppMode>('carve')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [visibleCards, setVisibleCards] = useState<string[]>([])
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  const [loadedMessages, setLoadedMessages] = useState<ChatMessage[]>([])
  // @ai-why: Survives the app-switch remount long enough for the next CarveChat instance to auto-send once.
  const [pendingMessage, setPendingMessage] = useState<string | null>(null)
  // @ai-why: Counter-based key so CarveChat only remounts on explicit resets (app switch, conversation
  // load, new chat) — NOT when a conversation is created mid-stream from the first message.
  // The old `selectedConversationId || activeApp` key caused a second remount when onConversationCreated
  // set the ID, killing the in-flight stream and losing the message.
  const [chatResetKey, setChatResetKey] = useState(0)
  // Wiki mode state
  const [wikiArticleSlug, setWikiArticleSlug] = useState<string | null>(null)
  const [wikiCategory, setWikiCategory] = useState<string | null>(null)
  const config = appConfigs[activeApp]

  const { conversations, loadMessages, deleteConversation, refreshConversations } = useChatHistory(userId)

  // @ai-why: Mode change drives what the sidebar shows and what activeApp becomes.
  // Switching to brein sets activeApp='brein' to load memory cards in context panel.
  // Switching to carve returns to home. Wiki is placeholder for now.
  const handleModeChange = useCallback((mode: AppMode) => {
    setActiveMode(mode)
    if (mode === 'wiki') {
      // Enter wiki: show category browse (keep previous category if set)
      setWikiArticleSlug(null)
    } else if (mode === 'brein') {
      setActiveApp('brein')
      setVisibleCards(defaultCards['brein'])
      setSelectedConversationId(null)
      setLoadedMessages([])
      setChatResetKey(k => k + 1)
    } else if (mode === 'carve') {
      setActiveApp('home')
      setVisibleCards([])
      setSelectedConversationId(null)
      setLoadedMessages([])
      setChatResetKey(k => k + 1)
    }
  }, [])

  const handleAppChange = useCallback((app: AppId, message?: string) => {
    // If switching to a domain app, ensure we're in carve mode
    if (app !== 'brein') {
      setActiveMode('carve')
    }
    setActiveApp(app)
    setVisibleCards(defaultCards[app] || [])
    setSelectedConversationId(null)
    setLoadedMessages([])
    setPendingMessage(message ?? null)
    setChatResetKey(k => k + 1)
  }, [])

  const handleCardAdd = useCallback((cardType: string) => {
    setVisibleCards(prev =>
      prev.includes(cardType) ? prev : [...prev, cardType]
    )
  }, [])

  const handleCardRemove = useCallback((cardType: string) => {
    setVisibleCards(prev => prev.filter(c => c !== cardType))
  }, [])

  const handleSelectConversation = useCallback(async (conversationId: string, conversationApp: string) => {
    const app = conversationApp as AppId
    // Selecting a conversation always returns to carve mode
    setActiveMode('carve')
    if (app !== activeApp && appConfigs[app]) {
      setActiveApp(app)
      setVisibleCards(defaultCards[app] || [])
    }

    const messages = await loadMessages(conversationId)
    setLoadedMessages(messages)
    setSelectedConversationId(conversationId)
    setPendingMessage(null)
    setChatResetKey(k => k + 1)
  }, [activeApp, loadMessages])

  const handleNewChat = useCallback(() => {
    setSelectedConversationId(null)
    setLoadedMessages([])
    setPendingMessage(null)
    setChatResetKey(k => k + 1)
  }, [])

  const handleConversationCreated = useCallback((id: string) => {
    // @ai-why: Only update the ID and refresh the sidebar list — do NOT increment chatResetKey.
    // Changing the key here would remount CarveChat mid-stream, killing the AI response.
    setSelectedConversationId(id)
    refreshConversations()
  }, [refreshConversations])

  const handlePendingMessageHandled = useCallback(() => {
    setPendingMessage(null)
  }, [])

  // @ai-why: Article click from chat switches to wiki mode with the article open.
  // CarveChat stays mounted (hidden) so useChat state is preserved.
  const handleArticleClick = useCallback((slug: string) => {
    setActiveMode('wiki')
    setWikiArticleSlug(slug)
    window.history.pushState({ mode: 'wiki', article: slug }, '')
  }, [])

  const handleWikiCategoryChange = useCallback((category: string | null) => {
    setWikiCategory(category)
  }, [])

  const handleWikiBack = useCallback(() => {
    setWikiArticleSlug(null)
  }, [])

  const handleBackToChat = useCallback(() => {
    setActiveMode('carve')
  }, [])

  const handleDeleteConversation = useCallback(async (conversationId: string) => {
    await deleteConversation(conversationId)
    // If the deleted conversation was the active one, reset to a new chat
    if (conversationId === selectedConversationId) {
      setSelectedConversationId(null)
      setLoadedMessages([])
      setChatResetKey(k => k + 1)
    }
  }, [deleteConversation, selectedConversationId])

  // Browser back button support for wiki mode
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (e.state?.mode === 'wiki') {
        setActiveMode('wiki')
        setWikiArticleSlug(e.state.article ?? null)
        setWikiCategory(e.state.category ?? null)
      } else {
        // Return to carve mode on back
        if (activeMode === 'wiki') {
          setActiveMode('carve')
          setWikiArticleSlug(null)
        }
      }
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [activeMode])

  const showContextPanel = activeApp !== 'home' && activeMode === 'carve'

  const chatKey = `chat-${chatResetKey}`

  return (
    <div className="flex h-full">
      {/* Left sidebar */}
      <ChatSidebar
        activeApp={activeApp}
        activeMode={activeMode}
        onAppChange={handleAppChange}
        onModeChange={handleModeChange}
        userName={userName}
        collapsed={!sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        conversations={conversations}
        selectedConversationId={selectedConversationId}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
        wikiCategory={wikiCategory}
        onWikiCategoryChange={handleWikiCategoryChange}
      />

      <WikiMetadataProvider>
        {/* Carve mode: chat — always mounted, hidden when inactive to preserve useChat state */}
        <div className={`flex-1 min-w-0 flex ${activeMode === 'carve' ? '' : 'hidden'}`}>
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
              onArticleClick={handleArticleClick}
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
                  <ChatContextPanel activeApp={activeApp} visibleCards={visibleCards} onCardRemove={handleCardRemove} userId={userId} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Wiki mode: article or category view */}
        {activeMode === 'wiki' && (
          <div className="flex-1 min-w-0">
            {wikiArticleSlug ? (
              <WikiArticleView
                slug={wikiArticleSlug}
                onBack={handleWikiBack}
                onArticleClick={(slug) => {
                  setWikiArticleSlug(slug)
                  window.history.pushState({ mode: 'wiki', article: slug }, '')
                }}
              />
            ) : (
              <WikiCategoryView
                category={wikiCategory}
                onArticleClick={(slug) => {
                  setWikiArticleSlug(slug)
                  window.history.pushState({ mode: 'wiki', article: slug }, '')
                }}
                onCategoryChange={handleWikiCategoryChange}
                onBackToChat={handleBackToChat}
              />
            )}
          </div>
        )}

        {/* Brein mode */}
        {activeMode === 'brein' && (
          <div className="flex-1 min-w-0 flex items-center justify-center">
            <p className="text-[13px] text-white/25">Coach geheugen — binnenkort beschikbaar</p>
          </div>
        )}
      </WikiMetadataProvider>
    </div>
  )
}
