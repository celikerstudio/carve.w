"use client"

import { useMemo } from "react"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"
import { MoneyCard } from "@/components/money/shared"
import { sampleCategoryBudgets } from "@/components/money/sample-data"

// ---------------------------------------------------------------------------
// Budget ring chart (SVG-based)
// ---------------------------------------------------------------------------

function BudgetRing({
  spent,
  total,
  size = 180,
}: {
  spent: number
  total: number
  size?: number
}) {
  const strokeWidth = 12
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const percentage = Math.min((spent / total) * 100, 100)
  const offset = circumference - (percentage / 100) * circumference

  const color =
    percentage >= 100
      ? "#ef4444"
      : percentage >= 80
        ? "#f59e0b"
        : "#10b981"

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
        />
        {/* Progress ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-white">{Math.round(percentage)}%</span>
        <span className="text-xs text-slate-500">of budget</span>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Category budget progress row
// ---------------------------------------------------------------------------

function BudgetCategoryRow({
  icon,
  label,
  spent,
  budgetLimit,
}: {
  icon: string
  label: string
  spent: number
  budgetLimit: number
}) {
  const percentage = Math.min((spent / budgetLimit) * 100, 100)
  const isOver = spent > budgetLimit
  const barColor = isOver
    ? "bg-red-400"
    : percentage >= 80
      ? "bg-amber-400"
      : "bg-emerald-400"

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="text-base">{icon}</span>
          <span className="text-sm font-medium text-white">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn("text-sm font-semibold", isOver ? "text-red-400" : "text-white")}>
            ${spent.toLocaleString("en-US")}
          </span>
          <span className="text-xs text-slate-500">
            / ${budgetLimit.toLocaleString("en-US")}
          </span>
        </div>
      </div>
      {/* Progress bar */}
      <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-700 ease-out", barColor)}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {isOver && (
        <p className="text-xs text-red-400">
          ${(spent - budgetLimit).toLocaleString("en-US")} over budget
        </p>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function BudgetingPage() {
  const totalBudget = useMemo(
    () => sampleCategoryBudgets.reduce((sum, b) => sum + b.budgetLimit, 0),
    []
  )

  const totalSpent = useMemo(
    () => sampleCategoryBudgets.reduce((sum, b) => sum + b.spent, 0),
    []
  )

  const remaining = totalBudget - totalSpent
  const overBudgetCategories = sampleCategoryBudgets.filter(
    (b) => b.spent > b.budgetLimit
  )

  return (
    <div className="p-6 lg:p-10 h-full overflow-y-auto max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-white tracking-tight">Budgeting</h1>
        <p className="text-[#9da6b9] mt-1">Track your spending against budget limits</p>
      </motion.div>

      {/* Hero section: ring chart + stat cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-6"
      >
        {/* Ring chart */}
        <div
          className={cn(
            "flex items-center justify-center p-8 rounded-2xl",
            "bg-[rgba(28,31,39,0.7)] backdrop-blur-xl",
            "border border-white/[0.08]",
            "shadow-[0_4px_30px_rgba(0,0,0,0.3)]"
          )}
        >
          <BudgetRing spent={totalSpent} total={totalBudget} size={200} />
        </div>

        {/* Stat cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <MoneyCard>
            <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">
              Total Budget
            </p>
            <p className="text-3xl font-bold text-white tracking-tight">
              ${totalBudget.toLocaleString("en-US")}
            </p>
            <p className="text-[#9da6b9] text-sm mt-2">Monthly limit</p>
          </MoneyCard>

          <MoneyCard>
            <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">
              Spent So Far
            </p>
            <p className="text-3xl font-bold text-white tracking-tight">
              ${totalSpent.toLocaleString("en-US")}
            </p>
            <p className="text-[#9da6b9] text-sm mt-2">
              {Math.round((totalSpent / totalBudget) * 100)}% of budget
            </p>
          </MoneyCard>

          <MoneyCard>
            <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">
              Remaining
            </p>
            <p
              className={cn(
                "text-3xl font-bold tracking-tight",
                remaining >= 0 ? "text-emerald-400" : "text-red-400"
              )}
            >
              {remaining >= 0 ? "$" : "-$"}
              {Math.abs(remaining).toLocaleString("en-US")}
            </p>
            <p className="text-[#9da6b9] text-sm mt-2">
              {remaining >= 0 ? "Left to spend" : "Over budget"}
            </p>
          </MoneyCard>
        </div>
      </motion.div>

      {/* Category budgets */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h2 className="text-lg font-semibold text-white mb-4">Category Budgets</h2>
        <div
          className={cn(
            "rounded-2xl p-6 space-y-5",
            "bg-[rgba(28,31,39,0.7)] backdrop-blur-xl",
            "border border-white/[0.08]",
            "shadow-[0_4px_30px_rgba(0,0,0,0.3)]"
          )}
        >
          {sampleCategoryBudgets.map((budget) => (
            <BudgetCategoryRow
              key={budget.category}
              icon={budget.icon}
              label={budget.label}
              spent={budget.spent}
              budgetLimit={budget.budgetLimit}
            />
          ))}
        </div>
      </motion.div>

      {/* Over budget alerts */}
      {overBudgetCategories.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h2 className="text-lg font-semibold text-white mb-4">Over Budget</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {overBudgetCategories.map((b) => (
              <MoneyCard key={b.category} className="border-red-500/20">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-red-500/10 flex items-center justify-center text-lg">
                    {b.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">{b.label}</p>
                    <p className="text-xs text-red-400">
                      ${(b.spent - b.budgetLimit).toLocaleString("en-US")} over the $
                      {b.budgetLimit.toLocaleString("en-US")} limit
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-red-400">
                      {Math.round((b.spent / b.budgetLimit) * 100)}%
                    </p>
                  </div>
                </div>
              </MoneyCard>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
