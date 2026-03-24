"use client"

import { motion } from "framer-motion"
import { HealthStatCard } from "@/components/dashboard/widgets/HealthStatCard"
import { WorldRankingCard } from "@/components/dashboard/widgets/WorldRankingCard"
import { ChallengesCard } from "@/components/dashboard/widgets/ChallengesCard"
import { DailyRoutineCard } from "@/components/dashboard/widgets/DailyRoutineCard"
import { QuickLinkCard } from "@/components/dashboard/widgets/QuickLinkCard"
import { sampleChallenges, sampleHabits } from "@/components/dashboard/sample-data"
import type { RankingTier } from "@/components/dashboard/sample-data"

interface HealthDashboardClientProps {
  totalXp: number
  currentTier: RankingTier
  workouts: number
  steps: string | number
  worldwideRank: number | string | null
  level: number
  streak: number
}

export function HealthDashboardClient({
  totalXp,
  currentTier,
  workouts,
  steps,
  worldwideRank,
}: HealthDashboardClientProps) {
  return (
    <div className="p-6 lg:p-10 space-y-6 max-w-7xl mx-auto">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Carve Health
            </h1>
            <p className="text-[#9da6b9] mt-1">Your daily breakdown</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-wider text-slate-500">
              Season 1
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#c8b86e]/10 px-3 py-1 text-xs font-medium text-[#c8b86e]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c8b86e]" />
              {currentTier}
            </span>
            <span className="text-sm font-semibold text-white">
              {totalXp} pts
            </span>
          </div>
        </div>
      </motion.div>

      {/* Stat cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <HealthStatCard label="Workouts" value={workouts} />
        <HealthStatCard label="Steps" value={steps} />
        <HealthStatCard
          label="Worldwide"
          value={worldwideRank ?? "—"}
        />
      </motion.div>

      {/* Ranking + Challenges */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <WorldRankingCard
          currentTier={currentTier}
          workouts={workouts}
          steps={steps}
          worldwideRank={worldwideRank}
        />
        <ChallengesCard challenges={sampleChallenges} />
      </motion.div>

      {/* Daily Routine */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <DailyRoutineCard habits={sampleHabits} />
      </motion.div>

      {/* Quick links */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <QuickLinkCard
          href="/food"
          icon="🍽"
          title="Food"
          description="Track your meals and nutrition"
        />
        <QuickLinkCard
          href="/workouts"
          icon="💪"
          title="Workouts"
          description="Start or log a workout"
        />
        <QuickLinkCard
          href="/social"
          icon="👥"
          title="Social"
          description="Friends and rankings"
        />
      </motion.div>
    </div>
  )
}
