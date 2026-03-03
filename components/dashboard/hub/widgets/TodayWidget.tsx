'use client'

import { iconMap } from '../mock-data'
import { DashboardCard } from '../DashboardCard'
import { mockTodayStats } from '../mock-data'

export function TodayWidget() {
  return (
    <DashboardCard compact>
      <p className="text-[10px] font-bold uppercase tracking-[1.5px] text-[#7a8299] mb-3">Today</p>
      <div className="flex flex-col gap-2.5">
        {mockTodayStats.map((stat) => {
          const Icon = iconMap[stat.icon]
          return (
            <div key={stat.label} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {Icon && <Icon className="w-3.5 h-3.5 text-[#9da6b9]" />}
                <span className="text-[13px] text-[#9da6b9]">{stat.label}</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-[14px] font-semibold text-white">{stat.value}</span>
                {stat.detail && (
                  <span className="text-[11px] text-[#7a8299]">{stat.detail}</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </DashboardCard>
  )
}
