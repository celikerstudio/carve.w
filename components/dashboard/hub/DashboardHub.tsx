'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { CoachChat } from './chat/CoachChat'
import { WidgetSidebar } from './WidgetSidebar'
import { XpRankWidget } from './widgets/XpRankWidget'
import { TodayWidget } from './widgets/TodayWidget'
import { MoneyWidget } from './widgets/MoneyWidget'
import { ChallengesWidget } from './widgets/ChallengesWidget'
import { LeaderboardWidget } from './widgets/LeaderboardWidget'

export function DashboardHub() {
  const [mobileWidgetsOpen, setMobileWidgetsOpen] = useState(false)

  return (
    <div className="flex flex-col lg:flex-row h-full">
      {/* AI Coach Chat */}
      <div className="flex-1 min-w-0 min-h-0 lg:border-r lg:border-white/[0.04]">
        <CoachChat />
      </div>

      {/* Widget Sidebar — desktop */}
      <div className="hidden lg:block w-[340px] shrink-0">
        <WidgetSidebar />
      </div>

      {/* Widget section — mobile */}
      <div className="lg:hidden border-t border-white/[0.06]">
        <button
          onClick={() => setMobileWidgetsOpen(!mobileWidgetsOpen)}
          className="flex items-center justify-between w-full px-4 py-3 text-[13px] text-[#9da6b9]"
        >
          <span>Widgets</span>
          {mobileWidgetsOpen ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
        {mobileWidgetsOpen && (
          <div className="px-4 pb-4 flex flex-col gap-3 max-h-[40vh] overflow-y-auto">
            <XpRankWidget />
            <TodayWidget />
            <MoneyWidget />
            <ChallengesWidget />
            <LeaderboardWidget />
          </div>
        )}
      </div>
    </div>
  )
}
