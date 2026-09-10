'use client'

import { useState, useCallback, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ChatSidebar } from './ChatSidebar'
import { CarveChat } from '@/components/dashboard/hub/chat/CarveChat'
import { ChatContextPanel } from './ChatContextPanel'
import { WikiMetadataProvider } from '@/components/wiki/chat/WikiMetadataProvider'
import {
  type SectionConfig,
  healthConfig,
  moneyConfig,
  homeConfig,
  lifeConfig,
  inboxConfig,
  breinConfig,
} from '@/components/dashboard/hub/mock-data'
import { useChatHistory } from '@/hooks/useChatHistory'
import type { ChatMessage } from '@/hooks/useChatHistory'
import type { AppId, AppMode } from './types'
import { adminSectionFromPath, modeFromPath, pathForMode } from './cockpit-routes'

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

interface CockpitShellProps {
  userId: string
  userName?: string
  /**
   * Toont Beheer in de zijbalk. Komt van `isAdmin()` in de layout.
   *
   * @ai-gotcha: Dit is presentatie, geen beveiliging. De route `/beheer` heeft zijn eigen
   * layout die `requireAdminOrRedirect()` draait, en de server actions weigeren los
   * daarvan. Deze vlag verbergt alleen de knop.
   * @ai-sync: app/(cockpit)/beheer/layout.tsx
   */
  isAdmin?: boolean
  children: React.ReactNode
}

/**
 * De schil om de cockpit: zijbalk links, sectie rechts.
 *
 * @ai-why: Het chatvenster hangt hier en niet in `app/(cockpit)/page.tsx`. Een layout
 * blijft staan bij navigatie binnen dezelfde groep, dus zo overleeft een lopend gesprek
 * een klik naar Beheer. Zat de chat in de pagina, dan koppelde hij bij elke sectiewissel
 * opnieuw aan en was het antwoord weg. Dat is dezelfde reden waarom hij verborgen wordt
 * met `hidden` in plaats van uit de boom gehaald.
 *
 * @ai-why: De modus komt uit het pad. Tot 2026-09-10 stond hij in React-state, met als
 * gevolg dat een bladwijzer niet bestond, de terugknop niets deed en verversen je altijd
 * op Carve zette.
 *
 * @ai-sync: components/chat/cockpit-routes.ts
 * @ai-sync: app/(cockpit)/layout.tsx
 */
export function CockpitShell({
  userId,
  userName = 'User',
  isAdmin = false,
  children,
}: CockpitShellProps) {
  const router = useRouter()
  const pathname = usePathname() ?? '/'
  const activeMode = modeFromPath(pathname)
  const adminSection = adminSectionFromPath(pathname)

  const [activeApp, setActiveApp] = useState<AppId>('home')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [visibleCards, setVisibleCards] = useState<string[]>([])
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  const [loadedMessages, setLoadedMessages] = useState<ChatMessage[]>([])
  // @ai-why: Survives the app-switch remount long enough for the next CarveChat instance to auto-send once.
  const [pendingMessage, setPendingMessage] = useState<string | null>(null)
  // @ai-why: Counter-based key so CarveChat only remounts on explicit resets (app switch, conversation
  // load, new chat) — NOT when a conversation is created mid-stream from the first message.
  const [chatResetKey, setChatResetKey] = useState(0)
  const config = appConfigs[activeApp]

  // @ai-todo: `useChatHistory` levert ook `deleteConversation`, maar niets roept het aan.
  // Dat was in ChatLayout al zo; een gesprek verwijderen kan dus nergens in de UI.
  const { conversations, loadMessages, refreshConversations } = useChatHistory(userId)

  const resetChat = useCallback(() => {
    setSelectedConversationId(null)
    setLoadedMessages([])
    setChatResetKey((k) => k + 1)
  }, [])

  /**
   * @ai-why: De zijbalk navigeert en zet geen staat meer. De opruiming die vroeger in
   * `handleModeChange` zat is verhuisd naar het effect hieronder, zodat hij ook gebeurt
   * als je rechtstreeks op `/jij` binnenkomt via een bladwijzer.
   */
  const handleModeChange = useCallback(
    (mode: AppMode) => {
      router.push(pathForMode(mode))
    },
    [router],
  )

  // @ai-why: De Brein-modus laadt geheugenkaarten in het contextpaneel; Carve begint
  // thuis. Dit hangt aan de modus en niet aan de klik, want een bladwijzer op /jij komt
  // nooit langs een klik.
  useEffect(() => {
    if (activeMode === 'brein') {
      setActiveApp('brein')
      setVisibleCards(defaultCards['brein'])
      resetChat()
    } else if (activeMode === 'carve') {
      setActiveApp((huidig) => (huidig === 'brein' ? 'home' : huidig))
    }
  }, [activeMode, resetChat])

  const handleAppChange = useCallback(
    (app: AppId, message?: string) => {
      // Een domein-app hoort bij de chat, dus terug naar Carve.
      if (app !== 'brein' && activeMode !== 'carve') router.push(pathForMode('carve'))
      setActiveApp(app)
      setVisibleCards(defaultCards[app] || [])
      setSelectedConversationId(null)
      setLoadedMessages([])
      setPendingMessage(message ?? null)
      setChatResetKey((k) => k + 1)
    },
    [activeMode, router],
  )

  const handleCardAdd = useCallback((cardType: string) => {
    setVisibleCards((prev) => (prev.includes(cardType) ? prev : [...prev, cardType]))
  }, [])

  const handleCardRemove = useCallback((cardType: string) => {
    setVisibleCards((prev) => prev.filter((c) => c !== cardType))
  }, [])

  const handleSelectConversation = useCallback(
    async (conversationId: string, conversationApp: string) => {
      const app = conversationApp as AppId
      if (activeMode !== 'carve') router.push(pathForMode('carve'))
      if (app !== activeApp && appConfigs[app]) {
        setActiveApp(app)
        setVisibleCards(defaultCards[app] || [])
      }

      const messages = await loadMessages(conversationId)
      setLoadedMessages(messages)
      setSelectedConversationId(conversationId)
      setPendingMessage(null)
      setChatResetKey((k) => k + 1)
    },
    [activeApp, activeMode, loadMessages, router],
  )

  const handleNewChat = useCallback(() => {
    if (activeMode !== 'carve') router.push(pathForMode('carve'))
    setPendingMessage(null)
    resetChat()
  }, [activeMode, resetChat, router])

  const handleConversationCreated = useCallback(
    (id: string) => {
      // @ai-why: Alleen het ID bijwerken en de lijst verversen — géén chatResetKey erbij.
      // Die zou CarveChat midden in de stream opnieuw aankoppelen en het antwoord doden.
      setSelectedConversationId(id)
      refreshConversations()
    },
    [refreshConversations],
  )

  const handlePendingMessageHandled = useCallback(() => setPendingMessage(null), [])

  /**
   * @ai-why: Een artikelklik in de chat navigeert naar `/wiki?artikel=<slug>` in plaats
   * van een modus te zetten en zelf `history.pushState` te doen. Die handmatige variant
   * stond naast Next's eigen routering, dus de terugknop werkte in de wiki wél en overal
   * anders niet. Nu is er één manier waarop het adres de staat volgt.
   * @ai-sync: app/(cockpit)/wiki/page.tsx
   */
  const handleArticleClick = useCallback(
    (slug: string) => {
      router.push(`/wiki?artikel=${encodeURIComponent(slug)}`)
    },
    [router],
  )

  const showContextPanel = activeApp !== 'home' && activeMode === 'carve'

  return (
    <div className="flex h-full">
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
        isAdmin={isAdmin}
        adminSection={adminSection}
      />

      <WikiMetadataProvider>
        {/* Carve: altijd gekoppeld, verborgen als je elders bent, zodat useChat blijft leven */}
        <div className={`flex-1 min-w-0 flex ${activeMode === 'carve' ? '' : 'hidden'}`}>
          <div className="flex-1 min-w-0">
            <CarveChat
              key={`chat-${chatResetKey}`}
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
                  <ChatContextPanel
                    activeApp={activeApp}
                    visibleCards={visibleCards}
                    onCardRemove={handleCardRemove}
                    userId={userId}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Elke andere modus is een route en rendert hier. */}
        {activeMode !== 'carve' && <div className="flex-1 min-w-0">{children}</div>}
      </WikiMetadataProvider>
    </div>
  )
}
