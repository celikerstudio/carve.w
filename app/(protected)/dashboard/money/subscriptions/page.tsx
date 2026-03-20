"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import {
  sampleSubscriptions,
  sampleSavingsInsights,
  type SubscriptionCategory,
} from "@/components/money/sample-data"
import {
  SubscriptionCard,
  AddSubscriptionCard,
} from "@/components/money/widgets/SubscriptionCard"
import { TimelineView } from "@/components/money/widgets/TimelineView"
import { ManageView } from "@/components/money/widgets/ManageView"

// ---------------------------------------------------------------------------
// Filter tab configuration
// ---------------------------------------------------------------------------

type FilterTab = "all" | SubscriptionCategory

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "entertainment", label: "Entertainment" },
  { key: "utilities", label: "Utilities" },
  { key: "subscriptions", label: "Abonnementen" },
]

// ---------------------------------------------------------------------------
// Search icon (inline SVG to avoid external dependency)
// ---------------------------------------------------------------------------

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

function FilterIcon({ className }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="8" y1="12" x2="16" y2="12" />
      <line x1="11" y1="18" x2="13" y2="18" />
    </svg>
  )
}

function SortIcon({ className }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M11 5h10" />
      <path d="M11 9h7" />
      <path d="M11 13h4" />
      <path d="M3 17l3 3 3-3" />
      <path d="M6 18V4" />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function SubscriptionsPage() {
  const [view, setView] = useState<'grid' | 'timeline' | 'manage'>('grid')
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all")
  const [searchQuery, setSearchQuery] = useState("")

  // Derived data
  const activeSubscriptions = sampleSubscriptions.filter((s) => s.isActive)

  const totalMonthly = useMemo(
    () => activeSubscriptions.reduce((sum, s) => sum + s.cost, 0),
    [activeSubscriptions]
  )

  const yearlyForecast = totalMonthly * 12

  const avgCost = useMemo(
    () =>
      activeSubscriptions.length > 0
        ? totalMonthly / activeSubscriptions.length
        : 0,
    [activeSubscriptions, totalMonthly]
  )

  // Mock change values
  const changeAmount = 12.0
  const changePercent = 3.5

  // Filtered subscriptions
  const filteredSubscriptions = useMemo(() => {
    let result = activeSubscriptions

    if (activeFilter !== "all") {
      result = result.filter((s) => s.category === activeFilter)
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.plan.toLowerCase().includes(q)
      )
    }

    return result
  }, [activeSubscriptions, activeFilter, searchQuery])

  return (
    <div className="p-6 lg:p-10 h-full overflow-y-auto max-w-7xl mx-auto">
      {/* ----------------------------------------------------------------- */}
      {/* Hero stats section                                                */}
      {/* ----------------------------------------------------------------- */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        {/* Main amount + badge */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 mb-6">
          <div className="flex-1">
            <span className="text-[10px] uppercase tracking-[0.15em] text-slate-500 font-medium block mb-1">
              Total Monthly Recurring
            </span>
            <div className="flex items-baseline gap-3">
              <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">
                ${totalMonthly.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </h1>
              <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium bg-emerald-500/10 text-emerald-400">
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z" />
                </svg>
                +${changeAmount.toFixed(2)} / {changePercent}%
              </span>
            </div>
            <p className="text-slate-400 text-sm mt-1.5">
              Across {activeSubscriptions.length} active subscriptions
            </p>
          </div>

          {/* Stat boxes */}
          <div className="flex gap-3">
            {/* Yearly Forecast */}
            <div
              className={cn(
                "px-6 py-4 rounded-xl flex flex-col items-center justify-center min-w-[140px]",
                "bg-[rgba(30,35,45,0.4)] backdrop-blur-xl",
                "border border-white/[0.08]",
                "shadow-[0_4px_30px_rgba(0,0,0,0.3)]"
              )}
            >
              <span className="text-slate-400 text-xs font-medium uppercase mb-1">
                Yearly Forecast
              </span>
              <span className="text-white text-xl font-bold">
                ${yearlyForecast.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </span>
            </div>

            {/* Avg. Cost */}
            <div
              className={cn(
                "px-6 py-4 rounded-xl flex flex-col items-center justify-center min-w-[140px]",
                "bg-[rgba(30,35,45,0.4)] backdrop-blur-xl",
                "border border-white/[0.08]",
                "shadow-[0_4px_30px_rgba(0,0,0,0.3)]"
              )}
            >
              <span className="text-slate-400 text-xs font-medium uppercase mb-1">
                Avg. Cost
              </span>
              <span className="text-white text-xl font-bold">
                ${avgCost.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ----------------------------------------------------------------- */}
      {/* View toggle                                                       */}
      {/* ----------------------------------------------------------------- */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="flex bg-white/5 p-1 rounded-lg w-fit mb-6"
      >
        <button
          className={cn(
            "px-4 py-2 rounded-md text-sm font-medium transition-all",
            view === 'grid'
              ? "bg-white/10 text-white shadow-sm"
              : "text-slate-400 hover:text-white"
          )}
          onClick={() => setView('grid')}
        >
          Grid
        </button>
        <button
          className={cn(
            "px-4 py-2 rounded-md text-sm font-medium transition-all",
            view === 'timeline'
              ? "bg-white/10 text-white shadow-sm"
              : "text-slate-400 hover:text-white"
          )}
          onClick={() => setView('timeline')}
        >
          Timeline
        </button>
        <button
          className={cn(
            "px-4 py-2 rounded-md text-sm font-medium transition-all",
            view === 'manage'
              ? "bg-white/10 text-white shadow-sm"
              : "text-slate-400 hover:text-white"
          )}
          onClick={() => setView('manage')}
        >
          Manage
        </button>
      </motion.div>

      {/* ----------------------------------------------------------------- */}
      {/* View content                                                      */}
      {/* ----------------------------------------------------------------- */}

      {view === 'grid' && (
        <>
          {/* Filter tabs + search bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
            {/* Filter pill tabs */}
            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg">
              {FILTER_TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveFilter(tab.key)}
                  className={cn(
                    "px-4 py-2 rounded-md text-sm font-medium transition-all",
                    activeFilter === tab.key
                      ? "bg-white/10 text-white shadow-sm"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Search + filter/sort icons */}
            <div className="flex items-center gap-2">
              {/* Search input */}
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search subscriptions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={cn(
                    "pl-9 pr-4 py-2 rounded-lg text-sm text-white placeholder:text-slate-500",
                    "bg-[#1c1f27] border border-white/10",
                    "focus:outline-none focus:border-[#e8e0d4]/50 focus:ring-1 focus:ring-[#e8e0d4]/20",
                    "transition-colors w-[220px]"
                  )}
                />
              </div>

              {/* Filter button */}
              <button
                className="p-2.5 rounded-lg border border-white/10 bg-[#1c1f27] hover:bg-white/10 transition-colors"
                aria-label="Filter"
              >
                <FilterIcon className="text-slate-400" />
              </button>

              {/* Sort button */}
              <button
                className="p-2.5 rounded-lg border border-white/10 bg-[#1c1f27] hover:bg-white/10 transition-colors"
                aria-label="Sort"
              >
                <SortIcon className="text-slate-400" />
              </button>
            </div>
          </div>

          {/* Subscription cards grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
          >
            {filteredSubscriptions.map((sub) => (
              <SubscriptionCard key={sub.id} subscription={sub} />
            ))}
            <AddSubscriptionCard />
          </motion.div>
        </>
      )}

      {view === 'timeline' && (
        <TimelineView
          subscriptions={sampleSubscriptions}
          insights={sampleSavingsInsights}
        />
      )}

      {view === 'manage' && (
        <ManageView subscriptions={sampleSubscriptions} />
      )}
    </div>
  )
}
