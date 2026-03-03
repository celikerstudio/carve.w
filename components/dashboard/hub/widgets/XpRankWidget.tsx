'use client'

import { iconMap } from '../mock-data'
import { DashboardCard } from '../DashboardCard'
import { mockRankData } from '../mock-data'

export function XpRankWidget() {
  const { rankName, currentXp, nextLevelXp, level, streak } = mockRankData
  const progress = (currentXp / nextLevelXp) * 100
  const FlameIcon = iconMap['Flame']

  return (
    <DashboardCard compact>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-bold uppercase tracking-[1.5px] text-[#7a8299]">Rank</p>
        <div className="flex items-center gap-1 text-[12px] text-[#c8b86e]">
          {FlameIcon && <FlameIcon className="w-3 h-3" />}
          <span>{streak} days</span>
        </div>
      </div>
      <p className="text-[20px] font-bold text-white mb-1">{rankName}</p>
      <div className="flex items-center gap-2 mb-2">
        <div className="flex-1 h-[3px] rounded-full bg-white/[0.05]">
          <div
            className="h-full rounded-full bg-[#c8b86e] transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-[11px] text-[#7a8299]">Lv {level}</span>
      </div>
      <p className="text-[12px] text-[#7a8299]">
        {currentXp.toLocaleString()} / {nextLevelXp.toLocaleString()} XP
      </p>
    </DashboardCard>
  )
}
