"use client"

import { useMemo } from "react"
import { cn } from "@/lib/utils"
import type { Subscription, SubscriptionCategory } from "@/components/money/sample-data"

// ---------------------------------------------------------------------------
// Category colors for the donut chart and legend
// ---------------------------------------------------------------------------

// @ai-why: Only showing the 3 most common subscription categories in the donut.
// This is a subset of SpendingCategory, not the full list.
type ChartCategory = "utilities" | "subscriptions" | "entertainment"

const CATEGORY_CHART_CONFIG: Record<
  ChartCategory,
  { stroke: string; dotClass: string; label: string }
> = {
  utilities: {
    stroke: "#EAB308",
    dotClass: "bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.4)]",
    label: "Vaste lasten",
  },
  subscriptions: {
    stroke: "#3B82F6",
    dotClass: "bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.4)]",
    label: "Abonnementen",
  },
  entertainment: {
    stroke: "#A855F7",
    dotClass: "bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.4)]",
    label: "Entertainment",
  },
}

// Order in which categories are rendered on the donut
const CATEGORY_ORDER: ChartCategory[] = [
  "utilities",
  "subscriptions",
  "entertainment",
]

// ---------------------------------------------------------------------------
// Donut math constants
// ---------------------------------------------------------------------------

const RADIUS = 70
const CIRCUMFERENCE = 2 * Math.PI * RADIUS // ~439.82

// ---------------------------------------------------------------------------
// MonthlyOutlook
// ---------------------------------------------------------------------------

interface MonthlyOutlookProps {
  subscriptions: Subscription[]
}

export function MonthlyOutlook({ subscriptions }: MonthlyOutlookProps) {
  // Calculate category totals from active monthly subscriptions
  const { categoryTotals, grandTotal } = useMemo(() => {
    const totals: Record<ChartCategory, number> = {
      utilities: 0,
      subscriptions: 0,
      entertainment: 0,
    }

    for (const sub of subscriptions) {
      if (!sub.isActive) continue
      // Normalize yearly to monthly equivalent
      const monthlyCost =
        sub.frequency === "yearly" ? sub.cost / 12 : sub.cost
      const cat = sub.category as ChartCategory
      if (cat in totals) {
        totals[cat] += monthlyCost
      }
    }

    const total = Object.values(totals).reduce((sum, v) => sum + v, 0)

    return { categoryTotals: totals, grandTotal: total }
  }, [subscriptions])

  // Calculate donut segments
  const segments = useMemo(() => {
    let accumulatedOffset = 0
    return CATEGORY_ORDER.map((cat) => {
      const amount = categoryTotals[cat]
      const proportion = grandTotal > 0 ? amount / grandTotal : 0
      const segmentLength = proportion * CIRCUMFERENCE

      // Small gap between segments for visual separation
      const gap = 5
      const offset = -accumulatedOffset
      accumulatedOffset += segmentLength + gap

      return {
        category: cat,
        amount,
        segmentLength,
        offset,
        stroke: CATEGORY_CHART_CONFIG[cat].stroke,
      }
    }).filter((seg) => seg.amount > 0)
  }, [categoryTotals, grandTotal])

  // Find the highest-spending category for the insight
  const highestCategory = useMemo(() => {
    let maxCat: ChartCategory = "subscriptions"
    let maxAmount = 0
    for (const cat of CATEGORY_ORDER) {
      if (categoryTotals[cat] > maxAmount) {
        maxAmount = categoryTotals[cat]
        maxCat = cat
      }
    }
    return maxCat
  }, [categoryTotals])

  return (
    <div
      className={cn(
        "rounded-2xl p-6 flex flex-col gap-6",
        "bg-[rgba(28,31,39,0.7)] backdrop-blur-xl",
        "border border-white/[0.08]",
        "shadow-[0_4px_30px_rgba(0,0,0,0.3)]"
      )}
    >
      {/* Header */}
      <div>
        <h3 className="text-lg font-bold text-white">Monthly Outlook</h3>
        <p className="text-xs text-[#9da6b9] mt-1">
          Cost breakdown by category
        </p>
      </div>

      {/* SVG Donut Chart */}
      <div className="flex items-center justify-center">
        <div className="relative">
          <svg
            className="rotate-[-90deg]"
            width="180"
            height="180"
            viewBox="0 0 180 180"
          >
            {/* Base ring */}
            <circle
              cx="90"
              cy="90"
              r={RADIUS}
              stroke="#282e39"
              strokeWidth="12"
              fill="transparent"
            />

            {/* Category segments */}
            {segments.map((seg) => (
              <circle
                key={seg.category}
                cx="90"
                cy="90"
                r={RADIUS}
                stroke={seg.stroke}
                strokeDasharray={`${seg.segmentLength} ${CIRCUMFERENCE}`}
                strokeDashoffset={seg.offset}
                strokeWidth="12"
                fill="transparent"
                strokeLinecap="round"
              />
            ))}
          </svg>

          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[10px] uppercase tracking-wider text-[#9da6b9] font-medium">
              Total
            </span>
            <span className="text-xl font-bold text-white">
              ${grandTotal.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-col gap-3">
        {CATEGORY_ORDER.map((cat) => {
          const config = CATEGORY_CHART_CONFIG[cat]
          const amount = categoryTotals[cat]
          if (amount === 0) return null

          return (
            <div
              key={cat}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn("size-3 rounded-full", config.dotClass)}
                />
                <span className="text-sm text-[#d1d5db]">
                  {config.label}
                </span>
              </div>
              <span className="text-sm font-bold text-white">
                ${amount.toFixed(2)}
              </span>
            </div>
          )
        })}
      </div>

      {/* Insight card */}
      <div className="p-4 rounded-xl bg-gradient-to-br from-[#e8e0d4]/20 to-[#e8e0d4]/5 border border-[#e8e0d4]/20">
        <p className="text-xs font-bold text-[#e8e0d4] uppercase tracking-wide mb-1">
          Insight
        </p>
        <p className="text-sm text-white leading-relaxed">
          Your {CATEGORY_CHART_CONFIG[highestCategory].label.toLowerCase()} spend
          is the largest category at{" "}
          <span className="text-[#e8e0d4] font-bold">
            ${categoryTotals[highestCategory].toFixed(2)}/mo
          </span>
          , accounting for{" "}
          <span className="text-[#e8e0d4] font-bold">
            {grandTotal > 0
              ? Math.round(
                  (categoryTotals[highestCategory] / grandTotal) * 100
                )
              : 0}
            %
          </span>{" "}
          of your subscriptions.
        </p>
      </div>

      {/* Download button */}
      <button
        className={cn(
          "w-full py-3 rounded-xl text-sm font-medium transition-colors",
          "bg-[#282e39] text-white hover:bg-[#3b4354]",
          "border border-[#3b4354]/50",
          "flex items-center justify-center gap-2"
        )}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        Download Report
      </button>
    </div>
  )
}
