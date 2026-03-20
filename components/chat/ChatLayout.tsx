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

interface ChatLayoutProps {
  userId: string
  userName?: string
}

export function ChatLayout({ userId, userName = 'User' }: ChatLayoutProps) {
  const [activeApp, setActiveApp] = useState<AppId>('home')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const config = appConfigs[activeApp]

  return (
    <div className="flex h-full">
      {/* Left sidebar */}
      <ChatSidebar
        activeApp={activeApp}
        onAppChange={setActiveApp}
        userName={userName}
        collapsed={!sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Center: chat */}
      <div className="flex-1 min-w-0">
        <CarveChat key={activeApp} config={config} />
      </div>

      {/* Right context panel */}
      <div className="hidden lg:block w-[280px] shrink-0 border-l border-white/[0.07]">
        <ChatContextPanel activeApp={activeApp} />
      </div>
    </div>
  )
}
