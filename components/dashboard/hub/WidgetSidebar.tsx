'use client'

import { motion } from 'motion/react'
import { XpRankWidget } from './widgets/XpRankWidget'
import { TodayWidget } from './widgets/TodayWidget'
import { MoneyWidget } from './widgets/MoneyWidget'
import { ChallengesWidget } from './widgets/ChallengesWidget'
import { LeaderboardWidget } from './widgets/LeaderboardWidget'

export function WidgetSidebar() {
  const widgets = [
    { key: 'xp', Component: XpRankWidget },
    { key: 'today', Component: TodayWidget },
    { key: 'money', Component: MoneyWidget },
    { key: 'challenges', Component: ChallengesWidget },
    { key: 'leaderboard', Component: LeaderboardWidget },
  ]

  return (
    <div className="h-full overflow-y-auto scrollbar-hide py-4 pr-4 pl-2">
      <div className="flex flex-col gap-3">
        {widgets.map(({ key, Component }, i) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
          >
            <Component />
          </motion.div>
        ))}
      </div>
    </div>
  )
}
