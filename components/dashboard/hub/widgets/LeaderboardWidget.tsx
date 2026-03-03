'use client'

import { DashboardCard } from '../DashboardCard'
import { mockLeaderboard } from '../mock-data'

export function LeaderboardWidget() {
  return (
    <DashboardCard compact>
      <p className="text-[10px] font-bold uppercase tracking-[1.5px] text-[#7a8299] mb-3">
        Leaderboard
      </p>
      <div className="flex flex-col gap-2">
        {mockLeaderboard.map((entry) => (
          <div
            key={entry.rank}
            className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg ${
              entry.isYou ? 'bg-[#c8b86e]/[0.08] border border-[#c8b86e]/20' : ''
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span
                className={`text-[13px] font-semibold w-5 ${
                  entry.rank === 1 ? 'text-[#c8b86e]' : 'text-[#7a8299]'
                }`}
              >
                {entry.rank}
              </span>
              <span className={`text-[13px] ${entry.isYou ? 'text-white font-medium' : 'text-[#9da6b9]'}`}>
                {entry.name}
                {entry.isYou && (
                  <span className="text-[11px] text-[#c8b86e] ml-1">&larr; you</span>
                )}
              </span>
            </div>
            <span className="text-[12px] text-[#7a8299]">
              {entry.xp.toLocaleString()} XP
            </span>
          </div>
        ))}
      </div>
    </DashboardCard>
  )
}
