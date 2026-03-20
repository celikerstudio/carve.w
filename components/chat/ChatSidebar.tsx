'use client'

import { useState, useRef, useEffect } from 'react'
import { Plus, LogOut, Settings, PanelLeftClose, PanelLeft, Dumbbell, Wallet, Plane, Mail } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AppSwitcher } from './AppSwitcher'
import { useSignOut } from '@/lib/auth/hooks'
import type { AppId } from './types'
import type { Conversation } from '@/hooks/useChatHistory'

interface ChatSidebarProps {
  activeApp: AppId
  onAppChange: (app: AppId) => void
  userName?: string
  collapsed?: boolean
  onToggle?: () => void
  conversations?: Conversation[]
  selectedConversationId?: string | null
  onSelectConversation?: (id: string, activeApp: string) => void
  onNewChat?: () => void
}

const collapsedApps: { id: AppId; icon: React.ElementType; color: string }[] = [
  { id: 'health', icon: Dumbbell, color: '#22c55e' },
  { id: 'money', icon: Wallet, color: '#3b82f6' },
  { id: 'life', icon: Plane, color: '#a855f7' },
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

export function ChatSidebar({
  activeApp,
  onAppChange,
  userName = 'User',
  collapsed = false,
  onToggle,
  conversations = [],
  selectedConversationId,
  onSelectConversation,
  onNewChat,
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
        {/* Logo */}
        <button
          onClick={() => router.push('/')}
          className="text-white font-bold text-[11px] tracking-[0.12em] mb-2 hover:text-white/70 transition-colors"
        >
          C
        </button>

        {/* Expand */}
        <button
          onClick={onToggle}
          className="w-9 h-9 rounded-lg hover:bg-white/[0.07] transition-colors flex items-center justify-center mb-1"
        >
          <PanelLeft className="w-4 h-4 text-white/35" />
        </button>

        {/* New chat */}
        <button
          onClick={handleNewChat}
          className="w-9 h-9 rounded-lg bg-white/[0.07] hover:bg-white/[0.12] transition-colors flex items-center justify-center mb-2"
        >
          <Plus className="w-4 h-4 text-white/50" />
        </button>

        {/* Apps */}
        {collapsedApps.map((app) => {
          const isActive = activeApp === app.id
          const Icon = app.icon
          return (
            <button
              key={app.id}
              onClick={() => onAppChange(isActive ? 'home' : app.id)}
              className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                isActive ? 'bg-white/[0.08]' : 'hover:bg-white/[0.05]'
              }`}
            >
              <Icon
                className="w-[18px] h-[18px]"
                style={{ color: isActive ? app.color : 'rgba(255,255,255,0.35)' }}
              />
            </button>
          )
        })}

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
      {/* Brand + actions */}
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <button
          onClick={() => router.push('/')}
          className="text-white font-bold text-sm tracking-[0.15em] hover:text-white/70 transition-colors"
        >
          CARVE
        </button>
        <div className="flex items-center gap-1">
          <button
            onClick={handleNewChat}
            className="w-7 h-7 rounded-lg bg-white/[0.07] hover:bg-white/[0.12] transition-colors flex items-center justify-center"
          >
            <Plus className="w-3.5 h-3.5 text-white/50" />
          </button>
          <button
            onClick={onToggle}
            className="w-7 h-7 rounded-lg hover:bg-white/[0.07] transition-colors flex items-center justify-center"
          >
            <PanelLeftClose className="w-3.5 h-3.5 text-white/35" />
          </button>
        </div>
      </div>

      {/* Apps — primary navigation */}
      <div className="px-2 py-2">
        <AppSwitcher activeApp={activeApp} onAppChange={onAppChange} />
      </div>

      {/* Divider */}
      <div className="mx-4 h-px bg-white/[0.07]" />

      {/* Chat history */}
      <div className="flex-1 overflow-y-auto px-2 py-2">
        {conversations.length > 0 ? (
          <>
            <p className="text-[9px] font-semibold uppercase tracking-widest text-white/30 px-3 mb-1.5">Recent</p>
            <div className="flex flex-col gap-0.5">
              {conversations.map((conv) => {
                const isSelected = conv.id === selectedConversationId
                return (
                  <button
                    key={conv.id}
                    onClick={() => onSelectConversation?.(conv.id, conv.active_app)}
                    className={`text-left px-3 py-1.5 rounded-lg transition-colors ${
                      isSelected
                        ? 'bg-white/[0.07] text-white/70'
                        : 'text-white/40 hover:bg-white/[0.05] hover:text-white/60'
                    }`}
                  >
                    <p className="text-[12px] truncate">{conv.title || 'New conversation'}</p>
                    <p className="text-[10px] text-white/25 mt-0.5">{formatTime(conv.updated_at)}</p>
                  </button>
                )
              })}
            </div>
          </>
        ) : (
          <p className="text-[11px] text-white/25 px-3 py-4">No conversations yet</p>
        )}
      </div>

      {/* User */}
      <div className="px-3 py-3 border-t border-white/[0.07] relative" ref={menuRef}>
        {menuOpen && (
          <div className="absolute bottom-full left-3 right-3 mb-1 rounded-xl bg-[#232427] border border-white/[0.10] shadow-[0_8px_30px_rgba(0,0,0,0.4)] overflow-hidden">
            <Link
              href="/dashboard/settings"
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
