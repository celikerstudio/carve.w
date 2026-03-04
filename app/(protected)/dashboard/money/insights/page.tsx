"use client"

import { useMemo } from "react"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"
import { MoneyCard, ChangeBadge } from "@/components/money/shared"
import {
  sampleSavingsInsights,
  sampleSpendingTrends,
  sampleSmartTips,
} from "@/components/money/sample-data"

// ---------------------------------------------------------------------------
// Insight type badge
// ---------------------------------------------------------------------------

const INSIGHT_TYPE_CONFIG: Record<
  string,
  { label: string; bgColor: string; textColor: string }
> = {
  duplicate: {
    label: "Duplicate",
    bgColor: "bg-amber-500/10",
    textColor: "text-amber-400",
  },
  price_hike: {
    label: "Price Hike",
    bgColor: "bg-red-500/10",
    textColor: "text-red-400",
  },
  unused: {
    label: "Unused",
    bgColor: "bg-slate-500/10",
    textColor: "text-slate-400",
  },
}

const TIP_CATEGORY_CONFIG: Record<
  string,
  { bgColor: string; borderColor: string }
> = {
  save: { bgColor: "bg-emerald-500/5", borderColor: "border-emerald-500/20" },
  optimize: { bgColor: "bg-blue-500/5", borderColor: "border-blue-500/20" },
  alert: { bgColor: "bg-amber-500/5", borderColor: "border-amber-500/20" },
  reward: { bgColor: "bg-purple-500/5", borderColor: "border-purple-500/20" },
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function InsightsPage() {
  const totalPotentialSavings = useMemo(
    () =>
      sampleSavingsInsights.reduce(
        (sum, i) => sum + (i.savingsAmount ?? 0),
        0
      ),
    []
  )

  // Calculate a simple "financial health score"
  const healthScore = 72

  return (
    <div className="p-6 lg:p-10 h-full overflow-y-auto max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Insights
        </h1>
        <p className="text-[#9da6b9] mt-1">
          Smart recommendations to optimize your spending
        </p>
      </motion.div>

      {/* Hero stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <MoneyCard>
          <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">
            Potential Monthly Savings
          </p>
          <p className="text-3xl font-bold text-emerald-400 tracking-tight">
            ${totalPotentialSavings.toFixed(2)}
          </p>
          <p className="text-[#9da6b9] text-sm mt-2">
            ${(totalPotentialSavings * 12).toFixed(0)}/year if acted on
          </p>
        </MoneyCard>

        <MoneyCard>
          <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">
            Active Alerts
          </p>
          <p className="text-3xl font-bold text-amber-400 tracking-tight">
            {sampleSavingsInsights.length}
          </p>
          <p className="text-[#9da6b9] text-sm mt-2">
            Requires your attention
          </p>
        </MoneyCard>

        <MoneyCard>
          <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">
            Financial Health Score
          </p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-white tracking-tight">
              {healthScore}
            </p>
            <span className="text-lg text-slate-500">/100</span>
          </div>
          <div className="mt-2 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-400 transition-all duration-700 ease-out"
              style={{ width: `${healthScore}%` }}
            />
          </div>
        </MoneyCard>
      </motion.div>

      {/* Savings opportunities */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h2 className="text-lg font-semibold text-white mb-4">
          Savings Opportunities
        </h2>
        <div className="space-y-3">
          {sampleSavingsInsights.map((insight) => {
            const typeConfig = INSIGHT_TYPE_CONFIG[insight.type]
            return (
              <div
                key={insight.id}
                className={cn(
                  "rounded-2xl p-5",
                  "bg-[rgba(28,31,39,0.7)] backdrop-blur-xl",
                  "border border-white/[0.08]",
                  "shadow-[0_4px_30px_rgba(0,0,0,0.3)]",
                  "flex items-start gap-4"
                )}
              >
                <div className="size-10 rounded-full bg-white/[0.04] flex items-center justify-center text-lg flex-shrink-0">
                  {insight.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-white">
                      {insight.title}
                    </h3>
                    <span
                      className={cn(
                        "text-[10px] px-2 py-0.5 rounded-full font-medium",
                        typeConfig.bgColor,
                        typeConfig.textColor
                      )}
                    >
                      {typeConfig.label}
                    </span>
                  </div>
                  <p className="text-sm text-[#9da6b9]">
                    {insight.description}
                  </p>
                </div>
                {insight.savingsAmount && (
                  <div className="flex-shrink-0 text-right">
                    <p className="text-lg font-bold text-emerald-400">
                      ${insight.savingsAmount.toFixed(2)}
                    </p>
                    <p className="text-xs text-slate-500">/month</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </motion.div>

      {/* Spending trends */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <h2 className="text-lg font-semibold text-white mb-4">
          Spending Trends
        </h2>
        <div
          className={cn(
            "rounded-2xl p-6",
            "bg-[rgba(28,31,39,0.7)] backdrop-blur-xl",
            "border border-white/[0.08]",
            "shadow-[0_4px_30px_rgba(0,0,0,0.3)]"
          )}
        >
          {/* Column headers */}
          <div className="grid grid-cols-[1fr_100px_100px_80px] gap-4 pb-3 border-b border-white/[0.06] mb-1">
            <span className="text-xs font-semibold text-[#9da6b9] uppercase tracking-wider">
              Category
            </span>
            <span className="text-xs font-semibold text-[#9da6b9] uppercase tracking-wider text-right">
              This Month
            </span>
            <span className="text-xs font-semibold text-[#9da6b9] uppercase tracking-wider text-right">
              Last Month
            </span>
            <span className="text-xs font-semibold text-[#9da6b9] uppercase tracking-wider text-right">
              Change
            </span>
          </div>

          {/* Trend rows */}
          {sampleSpendingTrends.map((trend) => {
            const changePercent =
              trend.previousMonth === 0
                ? 100
                : Math.round(
                    ((trend.currentMonth - trend.previousMonth) /
                      trend.previousMonth) *
                      100
                  )

            return (
              <div
                key={trend.category}
                className="grid grid-cols-[1fr_100px_100px_80px] gap-4 py-3 items-center border-b border-white/5 last:border-b-0 hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">{trend.icon}</span>
                  <span className="text-sm font-medium text-white">
                    {trend.label}
                  </span>
                </div>
                <span className="text-sm font-semibold text-white text-right">
                  ${trend.currentMonth.toLocaleString("en-US")}
                </span>
                <span className="text-sm text-slate-400 text-right">
                  ${trend.previousMonth.toLocaleString("en-US")}
                </span>
                <div className="flex justify-end">
                  <ChangeBadge value={changePercent} />
                </div>
              </div>
            )
          })}
        </div>
      </motion.div>

      {/* Smart tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <h2 className="text-lg font-semibold text-white mb-4">Smart Tips</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sampleSmartTips.map((tip) => {
            const config = TIP_CATEGORY_CONFIG[tip.category]
            return (
              <MoneyCard
                key={tip.id}
                className={cn(config.bgColor, config.borderColor)}
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl">{tip.icon}</span>
                  <div>
                    <h3 className="text-sm font-semibold text-white mb-1">
                      {tip.title}
                    </h3>
                    <p className="text-sm text-[#9da6b9]">{tip.description}</p>
                  </div>
                </div>
              </MoneyCard>
            )
          })}
        </div>
      </motion.div>
    </div>
  )
}
