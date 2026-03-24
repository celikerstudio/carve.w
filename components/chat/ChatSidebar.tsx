'use client'

import { useState, useRef, useEffect } from 'react'
import { Plus, LogOut, Settings, PanelLeftClose, PanelLeft, Dumbbell, Wallet, Plane, Brain, BookOpen, Flame, MessageSquare, User, BookMarked, Archive } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useSignOut } from '@/lib/auth/hooks'
import { useWikiMeta } from '@/components/wiki/chat/WikiMetadataProvider'
import { getCategoryColor } from '@/lib/wiki/category-colors'
import type { AppId, AppMode } from './types'
import type { Conversation } from '@/hooks/useChatHistory'

interface ChatSidebarProps {
  activeApp: AppId
  activeMode: AppMode
  onAppChange: (app: AppId) => void
  onModeChange: (mode: AppMode) => void
  userName?: string
  collapsed?: boolean
  onToggle?: () => void
  conversations?: Conversation[]
  selectedConversationId?: string | null
  onSelectConversation?: (id: string, activeApp: string) => void
  onNewChat?: () => void
  wikiCategory?: string | null
  onWikiCategoryChange?: (category: string | null) => void
}

// @ai-why: Top-level modes — each changes what appears below in the sidebar.
// Carve = coach chat with domain apps. Brein = memory management. Wiki = future.
const modes: { id: AppMode; label: string; icon: React.ElementType }[] = [
  { id: 'carve', label: 'Carve', icon: Flame },
  { id: 'wiki', label: 'Wiki', icon: BookOpen },
  { id: 'brein', label: 'Brein', icon: Brain },
]

// Domain apps shown when in Carve mode
const carveApps: { id: AppId; label: string; icon: React.ElementType; color: string }[] = [
  { id: 'health', label: 'Health', icon: Dumbbell, color: '#22c55e' },
  { id: 'money', label: 'Money', icon: Wallet, color: '#3b82f6' },
  { id: 'life', label: 'Life', icon: Plane, color: '#a855f7' },
]

// Sub-nav items shown when in Brein mode
const breinItems: { id: string; label: string; icon: React.ElementType }[] = [
  { id: 'memory', label: 'Geheugen', icon: MessageSquare },
  { id: 'profile', label: 'Profiel', icon: User },
  { id: 'logbook', label: 'Logbook', icon: BookMarked },
  { id: 'archive', label: 'Archief', icon: Archive },
]

function formatTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Vandaag'
  if (diffDays === 1) return 'Gisteren'
  if (diffDays < 7) return `${diffDays}d geleden`
  return date.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })
}

function WikiSidebarContent({
  activeCategory,
  onCategoryChange,
}: {
  activeCategory: string | null
  onCategoryChange?: (category: string | null) => void
}) {
  const { categories, articles, loading } = useWikiMeta()

  if (loading) {
    return (
      <div className="px-3 py-4 space-y-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-8 bg-white/[0.04] rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-0.5">
      <button
        onClick={() => onCategoryChange?.(null)}
        className={cn(
          'flex items-center justify-between px-3 py-2 rounded-lg text-left transition-all w-full',
          !activeCategory ? 'bg-white/[0.08]' : 'hover:bg-white/[0.05]'
        )}
      >
        <span className={cn(
          'text-[13px] font-medium',
          !activeCategory ? 'text-white/90' : 'text-white/55'
        )}>
          Alle artikelen
        </span>
        <span className="text-[11px] text-white/25">{articles.length}</span>
      </button>

      {categories.map((cat) => {
        const isActive = activeCategory === cat.name
        const color = getCategoryColor(cat.name)
        return (
          <button
            key={cat.name}
            onClick={() => onCategoryChange?.(isActive ? null : cat.name)}
            className={cn(
              'flex items-center justify-between px-3 py-2 rounded-lg text-left transition-all w-full',
              isActive ? 'bg-white/[0.08]' : 'hover:bg-white/[0.05]'
            )}
          >
            <span className={cn(
              'text-[13px] font-medium',
              isActive ? 'text-white/90' : 'text-white/55'
            )} style={{ color: isActive ? color.hex : undefined }}>
              {cat.name}
            </span>
            <span className="text-[11px] text-white/25">{cat.count}</span>
          </button>
        )
      })}
    </div>
  )
}

export function ChatSidebar({
  activeApp,
  activeMode,
  onAppChange,
  onModeChange,
  userName = 'User',
  collapsed = false,
  onToggle,
  conversations = [],
  selectedConversationId,
  onSelectConversation,
  onNewChat,
  wikiCategory,
  onWikiCategoryChange,
}: ChatSidebarProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const signOut = useSignOut()
  const router = useRouter()

  useEffect(() => {
    if (!menuOpen) return
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [menuOpen])

  const handleNewChat = () => {
    onModeChange('carve')
    onAppChange('home')
    onNewChat?.()
  }

  // ─── Collapsed: icon rail ─────────────────────────────────────────
  if (collapsed) {
    return (
      <motion.div
        initial={{ width: 220 }}
        animate={{ width: 60 }}
        transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
        className="shrink-0 bg-white/[0.03] border-r border-white/[0.07] flex flex-col items-center h-full py-3 gap-1 overflow-hidden"
      >
        {/* Expand */}
        <button
          onClick={onToggle}
          className="w-9 h-9 rounded-lg hover:bg-white/[0.07] transition-colors flex items-center justify-center mb-1"
        >
          <PanelLeft className="w-4 h-4 text-white/35" />
        </button>

        {/* Modes */}
        {modes.map((mode) => {
          const isActive = activeMode === mode.id
          const Icon = mode.icon
          return (
            <button
              key={mode.id}
              onClick={() => onModeChange(mode.id)}
              className={cn(
                'w-9 h-9 rounded-lg flex items-center justify-center transition-all',
                isActive ? 'bg-white/[0.08]' : 'hover:bg-white/[0.05]'
              )}
            >
              <Icon
                className="w-[18px] h-[18px]"
                style={{ color: isActive ? '#fff' : 'rgba(255,255,255,0.35)' }}
              />
            </button>
          )
        })}

        <div className="mx-auto w-5 h-px bg-white/[0.07] my-1" />

        {/* Mode-specific collapsed items */}
        {activeMode === 'carve' && (
          <>
            <button
              onClick={handleNewChat}
              className="w-9 h-9 rounded-lg bg-white/[0.07] hover:bg-white/[0.12] transition-colors flex items-center justify-center"
            >
              <Plus className="w-4 h-4 text-white/50" />
            </button>
            {carveApps.map((app) => {
              const isActive = activeApp === app.id
              const Icon = app.icon
              return (
                <button
                  key={app.id}
                  onClick={() => onAppChange(isActive ? 'home' : app.id)}
                  className={cn(
                    'w-9 h-9 rounded-lg flex items-center justify-center transition-all',
                    isActive ? 'bg-white/[0.08]' : 'hover:bg-white/[0.05]'
                  )}
                >
                  <Icon
                    className="w-[18px] h-[18px]"
                    style={{ color: isActive ? app.color : 'rgba(255,255,255,0.35)' }}
                  />
                </button>
              )
            })}
          </>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* User */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-500 to-slate-700 flex items-center justify-center hover:opacity-80 transition-opacity"
        >
          <span className="text-[9px] font-semibold text-white">
            {userName.slice(0, 2).toUpperCase()}
          </span>
        </button>
      </motion.div>
    )
  }

  // ─── Expanded: full sidebar ───────────────────────────────────────
  return (
    <motion.div
      initial={{ width: 60 }}
      animate={{ width: 220 }}
      transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
      className="shrink-0 bg-white/[0.03] border-r border-white/[0.07] flex flex-col h-full overflow-hidden"
    >
      {/* Brand + collapse */}
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <button
          onClick={() => router.push('/')}
          className="text-white font-bold text-sm tracking-[0.15em] hover:text-white/70 transition-colors"
        >
          CARVE
        </button>
        <button
          onClick={onToggle}
          className="w-7 h-7 rounded-lg hover:bg-white/[0.07] transition-colors flex items-center justify-center"
        >
          <PanelLeftClose className="w-3.5 h-3.5 text-white/35" />
        </button>
      </div>

      {/* Modes — top-level, Perplexity-style */}
      <div className="px-2 py-1 flex flex-col gap-0.5">
        {modes.map((mode) => {
          const isActive = activeMode === mode.id
          const Icon = mode.icon
          return (
            <button
              key={mode.id}
              onClick={() => onModeChange(mode.id)}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all',
                isActive ? 'bg-white/[0.08]' : 'hover:bg-white/[0.05]'
              )}
            >
              <Icon
                className="w-[18px] h-[18px] shrink-0"
                style={{ color: isActive ? '#fff' : 'rgba(255,255,255,0.4)' }}
              />
              <span className={cn(
                'text-[13px] font-medium',
                isActive ? 'text-white/90' : 'text-white/55'
              )}>
                {mode.label}
              </span>
            </button>
          )
        })}
      </div>

      {/* Divider */}
      <div className="mx-4 h-px bg-white/[0.07] my-1" />

      {/* Mode-specific content */}
      <div className="flex-1 overflow-y-auto px-2 py-1">
        {activeMode === 'carve' && (
          <>
            {/* New chat + domain apps */}
            <button
              onClick={handleNewChat}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-left hover:bg-white/[0.05] transition-colors w-full mb-0.5"
            >
              <Plus className="w-[18px] h-[18px] text-white/40 shrink-0" />
              <span className="text-[13px] text-white/55 font-medium">Nieuwe chat</span>
            </button>

            {carveApps.map((app) => {
              const isActive = activeApp === app.id
              const Icon = app.icon
              return (
                <button
                  key={app.id}
                  onClick={() => onAppChange(isActive ? 'home' : app.id)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all w-full',
                    isActive ? 'bg-white/[0.08]' : 'hover:bg-white/[0.05]'
                  )}
                >
                  <Icon
                    className="w-[18px] h-[18px] shrink-0"
                    style={{ color: isActive ? app.color : 'rgba(255,255,255,0.4)' }}
                  />
                  <span className={cn(
                    'text-[13px] font-medium',
                    isActive ? 'text-white/90' : 'text-white/55'
                  )}>
                    {app.label}
                  </span>
                </button>
              )
            })}

            {/* Chat history */}
            {conversations.length > 0 && (
              <>
                <div className="mx-2 h-px bg-white/[0.07] my-2" />
                <p className="text-[9px] font-semibold uppercase tracking-widest text-white/30 px-3 mb-1.5">Recent</p>
                <div className="flex flex-col gap-0.5">
                  {conversations.map((conv) => {
                    const isSelected = conv.id === selectedConversationId
                    return (
                      <button
                        key={conv.id}
                        onClick={() => onSelectConversation?.(conv.id, conv.active_app)}
                        className={cn(
                          'text-left px-3 py-1.5 rounded-lg transition-colors',
                          isSelected
                            ? 'bg-white/[0.07] text-white/70'
                            : 'text-white/40 hover:bg-white/[0.05] hover:text-white/60'
                        )}
                      >
                        <p className="text-[12px] truncate">{conv.title || 'New conversation'}</p>
                        <p className="text-[10px] text-white/25 mt-0.5">{formatTime(conv.updated_at)}</p>
                      </button>
                    )
                  })}
                </div>
              </>
            )}
          </>
        )}

        {activeMode === 'brein' && (
          <div className="flex flex-col gap-0.5">
            {breinItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-left hover:bg-white/[0.05] transition-colors w-full"
                >
                  <Icon className="w-[18px] h-[18px] text-white/40 shrink-0" />
                  <span className="text-[13px] text-white/55 font-medium">{item.label}</span>
                </button>
              )
            })}
          </div>
        )}

        {activeMode === 'wiki' && (
          <WikiSidebarContent
            activeCategory={wikiCategory ?? null}
            onCategoryChange={onWikiCategoryChange}
          />
        )}
      </div>

      {/* User */}
      <div className="px-3 py-3 border-t border-white/[0.07] relative" ref={menuRef}>
        {menuOpen && (
          <div className="absolute bottom-full left-3 right-3 mb-1 rounded-xl bg-[#232427] border border-white/[0.10] shadow-[0_8px_30px_rgba(0,0,0,0.4)] overflow-hidden">
            <Link
              href="/settings"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2.5 px-3.5 py-2.5 text-[12px] text-white/55 hover:bg-white/[0.06] hover:text-white/80 transition-colors"
            >
              <Settings className="w-3.5 h-3.5" />
              Settings
            </Link>
            <div className="h-px bg-white/[0.07]" />
            <button
              onClick={() => { setMenuOpen(false); signOut() }}
              className="flex items-center gap-2.5 px-3.5 py-2.5 text-[12px] text-white/55 hover:bg-white/[0.06] hover:text-red-400 transition-colors w-full text-left"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign out
            </button>
          </div>
        )}

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex items-center gap-2.5 px-2 w-full rounded-lg hover:bg-white/[0.05] py-1.5 transition-colors"
        >
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-500 to-slate-700 flex items-center justify-center">
            <span className="text-[9px] font-semibold text-white">
              {userName.slice(0, 2).toUpperCase()}
            </span>
          </div>
          <span className="text-[13px] text-white/50 whitespace-nowrap">{userName}</span>
        </button>
      </div>
    </motion.div>
  )
}
