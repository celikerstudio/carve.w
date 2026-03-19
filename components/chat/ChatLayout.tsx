'use client'

import { useState } from 'react'
import { ChatSidebar } from './ChatSidebar'
import { CarveChat } from '@/components/dashboard/hub/chat/CarveChat'
import { ChatContextPanel } from './ChatContextPanel'
import { type SectionConfig, healthConfig, moneyConfig, homeConfig, lifeConfig, inboxConfig } from '@/components/dashboard/hub/mock-data'
import type { AppId } from './types'

const appConfigs: Record<AppId, SectionConfig> = {
  home: homeConfig,
  health: healthConfig,
  money: moneyConfig,
  life: lifeConfig,
  inbox: inboxConfig,
}

const appAccents: Record<AppId, { color: string; bg: string }> = {
  home: { color: '#e2e8f0', bg: 'rgba(226,232,240,0.1)' },
  health: { color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
  money: { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
  life: { color: '#a855f7', bg: 'rgba(168,85,247,0.12)' },
  inbox: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
}

interface ChatLayoutProps {
  userId: string
  userName?: string
}

export function ChatLayout({ userId, userName = 'User' }: ChatLayoutProps) {
  const [activeApp, setActiveApp] = useState<AppId>('home')
  const config = appConfigs[activeApp]
  const accent = appAccents[activeApp]

  return (
    <div className="flex h-full">
      {/* Left sidebar */}
      <ChatSidebar activeApp={activeApp} onAppChange={setActiveApp} userName={userName} />

      {/* Center: chat only, no top bar */}
      <div className="flex-1 min-w-0">
        <CarveChat key={activeApp} config={config} />
      </div>

      {/* Right context panel */}
      <div className="hidden lg:block w-[280px] shrink-0 border-l border-white/[0.04]">
        <ChatContextPanel activeApp={activeApp} />
      </div>
    </div>
  )
}
