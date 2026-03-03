'use client'

import { DashboardCard } from '../DashboardCard'
import { mockChallenges } from '../mock-data'

export function ChallengesWidget() {
  return (
    <DashboardCard compact>
      <p className="text-[10px] font-bold uppercase tracking-[1.5px] text-[#7a8299] mb-3">
        Challenges
      </p>
      <div className="flex flex-col gap-3">
        {mockChallenges.map((challenge) => {
          const progress = Math.min((challenge.current / challenge.target) * 100, 100)
          return (
            <div key={challenge.id}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[13px] text-white">{challenge.label}</span>
                <span className="text-[11px] text-[#7a8299]">
                  {challenge.current >= 1000
                    ? `${(challenge.current / 1000).toFixed(1)}k`
                    : challenge.current}
                  /{challenge.target >= 1000
                    ? `${(challenge.target / 1000).toFixed(0)}k`
                    : challenge.target}
                </span>
              </div>
              <div className="h-[2px] rounded-full bg-white/[0.05]">
                <div
                  className="h-full rounded-full bg-[#c8b86e] transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </DashboardCard>
  )
}
