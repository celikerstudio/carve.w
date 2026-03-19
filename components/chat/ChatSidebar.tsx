'use client'

import { Plus, BookOpen } from 'lucide-react'
import Link from 'next/link'
import { AppSwitcher } from './AppSwitcher'
import type { AppId } from './types'

interface ChatSidebarProps {
  activeApp: AppId
  onAppChange: (app: AppId) => void
  userName?: string
}

// @ai-todo: replace with real chat history from Supabase
const mockChats = [
  { id: '1', title: 'Budget analyse maart', time: 'Vandaag' },
  { id: '2', title: 'Workout plan aanpassen', time: 'Vandaag' },
  { id: '3', title: 'Barcelona trip planning', time: 'Gisteren' },
  { id: '4', title: 'Subscriptions opschonen', time: 'Gisteren' },
]

export function ChatSidebar({ activeApp, onAppChange, userName = 'User' }: ChatSidebarProps) {
  return (
    <div className="w-[220px] shrink-0 bg-white/[0.02] border-r border-white/[0.06] flex flex-col h-full">
      {/* Brand + new chat */}
      <div className="p-3 flex items-center justify-between">
        <span className="text-white font-bold text-sm tracking-[0.15em] px-2">CARVE</span>
        <button className="w-8 h-8 rounded-lg bg-white/[0.06] hover:bg-white/[0.08] transition-colors flex items-center justify-center">
          <Plus className="w-4 h-4 text-white/60" />
        </button>
      </div>

      {/* Chat history */}
      <div className="flex-1 overflow-y-auto px-3 pb-2">
        <p className="text-[9px] font-semibold uppercase tracking-widest text-white/25 px-3 mb-2">Recent</p>
        <div className="flex flex-col gap-0.5">
          {mockChats.map((chat, i) => (
            <button
              key={chat.id}
              className={`text-left px-3 py-1.5 rounded-md transition-colors ${
                i === 0 ? 'bg-white/[0.05] text-white/70' : 'text-white/35 hover:bg-white/[0.03] hover:text-white/50'
              }`}
            >
              <p className="text-[11px] truncate">{chat.title}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="mx-3 h-px bg-white/[0.06]" />

      {/* App switcher */}
      <div className="p-3">
        <AppSwitcher activeApp={activeApp} onAppChange={onAppChange} />
      </div>

      {/* Wiki link */}
      <div className="px-3 pb-2">
        <Link
          href="/wiki"
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-white/35 hover:bg-white/[0.03] hover:text-white/50 transition-colors"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span className="text-[11px] font-medium">Wiki</span>
        </Link>
      </div>

      {/* User */}
      <div className="p-3 border-t border-white/[0.06]">
        <div className="flex items-center gap-2 px-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center">
            <span className="text-[8px] font-semibold text-white">
              {userName.slice(0, 2).toUpperCase()}
            </span>
          </div>
          <span className="text-[11px] text-white/40">{userName}</span>
        </div>
      </div>
    </div>
  )
}
