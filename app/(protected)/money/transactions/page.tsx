"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import {
  sampleTransactions,
  CATEGORY_CONFIG,
  type SpendingCategory,
} from "@/components/money/sample-data"

// ---------------------------------------------------------------------------
// Category filter tabs
// ---------------------------------------------------------------------------

type FilterTab = "all" | SpendingCategory

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "housing", label: "Housing" },
  { key: "dining", label: "Dining" },
  { key: "travel", label: "Travel" },
  { key: "shopping", label: "Shopping" },
  { key: "transport", label: "Transport" },
  { key: "entertainment", label: "Entertainment" },
  { key: "utilities", label: "Utilities" },
  { key: "subscriptions", label: "Subscriptions" },
]

// ---------------------------------------------------------------------------
// Sort configuration
// ---------------------------------------------------------------------------

type SortField = "date" | "amount" | "merchant"
type SortDirection = "asc" | "desc"

// ---------------------------------------------------------------------------
// Inline SVG icons
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

function SortIndicator({
  field,
  activeField,
  direction,
}: {
  field: SortField
  activeField: SortField
  direction: SortDirection
}) {
  if (field !== activeField) return null
  return (
    <span className="ml-1 text-slate-500">
      {direction === "asc" ? "\u2191" : "\u2193"}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Date formatting helper
// ---------------------------------------------------------------------------

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00")
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function TransactionsPage() {
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortField, setSortField] = useState<SortField>("date")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")

  // Handle column header click for sorting
  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  // Total across all transactions (unfiltered)
  const totalAmount = useMemo(
    () => sampleTransactions.reduce((sum, t) => sum + t.amount, 0),
    []
  )

  // Filtered and sorted transactions
  const filteredTransactions = useMemo(() => {
    let result = [...sampleTransactions]

    // Category filter
    if (activeFilter !== "all") {
      result = result.filter((t) => t.category === activeFilter)
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (t) =>
          t.merchant.toLowerCase().includes(q) ||
          t.subcategory.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q)
      )
    }

    // Sorting
    result.sort((a, b) => {
      let cmp = 0
      switch (sortField) {
        case "date":
          cmp = a.date.localeCompare(b.date)
          break
        case "amount":
          cmp = a.amount - b.amount
          break
        case "merchant":
          cmp = a.merchant.localeCompare(b.merchant)
          break
      }
      return sortDirection === "asc" ? cmp : -cmp
    })

    return result
  }, [activeFilter, searchQuery, sortField, sortDirection])

  // Filtered total
  const filteredTotal = useMemo(
    () => filteredTransactions.reduce((sum, t) => sum + t.amount, 0),
    [filteredTransactions]
  )

  return (
    <div className="p-6 lg:p-10 h-full overflow-y-auto max-w-7xl mx-auto space-y-6">
      {/* --------------------------------------------------------------- */}
      {/* Header                                                          */}
      {/* --------------------------------------------------------------- */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row sm:items-end gap-4"
      >
        <div className="flex-1">
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Transactions
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Your spending history
          </p>
        </div>

        {/* Total amount stat box */}
        <div
          className={cn(
            "px-6 py-4 rounded-xl flex flex-col items-center justify-center min-w-[160px]",
            "bg-[rgba(30,35,45,0.4)] backdrop-blur-xl",
            "border border-white/[0.08]",
            "shadow-[0_4px_30px_rgba(0,0,0,0.3)]"
          )}
        >
          <span className="text-slate-400 text-xs font-medium uppercase mb-1">
            Total Spent
          </span>
          <span className="text-white text-xl font-bold">
            $
            {totalAmount.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>
      </motion.div>

      {/* --------------------------------------------------------------- */}
      {/* Filters row: category tabs + search                             */}
      {/* --------------------------------------------------------------- */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="flex flex-col lg:flex-row items-start lg:items-center gap-3"
      >
        {/* Category pill tabs */}
        <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg flex-wrap">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key)}
              className={cn(
                "px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap",
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

        {/* Search input */}
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              "pl-9 pr-4 py-2 rounded-lg text-sm text-white placeholder:text-slate-500",
              "bg-[#1c1f27] border border-white/10",
              "focus:outline-none focus:border-[#e8e0d4]/50 focus:ring-1 focus:ring-[#e8e0d4]/20",
              "transition-colors w-[260px]"
            )}
          />
        </div>
      </motion.div>

      {/* --------------------------------------------------------------- */}
      {/* Transaction list (glass panel)                                  */}
      {/* --------------------------------------------------------------- */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
      <div
        className={cn(
          "bg-[rgba(28,31,39,0.7)] backdrop-blur-xl",
          "border border-white/[0.08]",
          "shadow-[0_4px_30px_rgba(0,0,0,0.3)]",
          "rounded-2xl overflow-hidden"
        )}
      >
        {/* Table header row */}
        <div className="grid grid-cols-[120px_1fr_140px_120px_100px] gap-4 px-6 py-3 border-b border-white/[0.06]">
          <button
            onClick={() => handleSort("date")}
            className="text-xs font-semibold text-[#9da6b9] uppercase tracking-wider text-left hover:text-white transition-colors flex items-center"
          >
            Date
            <SortIndicator
              field="date"
              activeField={sortField}
              direction={sortDirection}
            />
          </button>
          <button
            onClick={() => handleSort("merchant")}
            className="text-xs font-semibold text-[#9da6b9] uppercase tracking-wider text-left hover:text-white transition-colors flex items-center"
          >
            Merchant
            <SortIndicator
              field="merchant"
              activeField={sortField}
              direction={sortDirection}
            />
          </button>
          <span className="text-xs font-semibold text-[#9da6b9] uppercase tracking-wider text-left">
            Category
          </span>
          <button
            onClick={() => handleSort("amount")}
            className="text-xs font-semibold text-[#9da6b9] uppercase tracking-wider text-right hover:text-white transition-colors flex items-center justify-end"
          >
            Amount
            <SortIndicator
              field="amount"
              activeField={sortField}
              direction={sortDirection}
            />
          </button>
          <span className="text-xs font-semibold text-[#9da6b9] uppercase tracking-wider text-right">
            Status
          </span>
        </div>

        {/* Transaction rows */}
        {filteredTransactions.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-slate-500 text-sm">
              No transactions found matching your filters.
            </p>
          </div>
        ) : (
          <div>
            {filteredTransactions.map((txn) => {
              const catConfig = CATEGORY_CONFIG[txn.category]
              return (
                <div
                  key={txn.id}
                  className="grid grid-cols-[120px_1fr_140px_120px_100px] gap-4 px-6 py-4 items-center hover:bg-white/[0.02] transition-colors border-b border-white/5 last:border-b-0"
                >
                  {/* Date */}
                  <span className="text-sm text-slate-400">
                    {formatDate(txn.date)}
                  </span>

                  {/* Merchant with icon */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="size-10 rounded-full bg-[#282e39] flex items-center justify-center flex-shrink-0 text-base">
                      {catConfig.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {txn.merchant}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {txn.subcategory}
                      </p>
                    </div>
                  </div>

                  {/* Category */}
                  <span className="text-sm text-slate-400">
                    {catConfig.label}
                  </span>

                  {/* Amount */}
                  <span className="text-sm font-bold text-white text-right">
                    -$
                    {txn.amount.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>

                  {/* Status */}
                  <div className="flex justify-end">
                    {txn.isRecurring ? (
                      <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-medium">
                        Recurring
                      </span>
                    ) : null}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
      </motion.div>

      {/* --------------------------------------------------------------- */}
      {/* Summary footer                                                  */}
      {/* --------------------------------------------------------------- */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
      <div
        className={cn(
          "bg-[rgba(28,31,39,0.7)] backdrop-blur-xl",
          "border border-white/[0.08]",
          "shadow-[0_4px_30px_rgba(0,0,0,0.3)]",
          "rounded-2xl px-6 py-4",
          "flex items-center justify-between"
        )}
      >
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-400">
            {filteredTransactions.length}{" "}
            {filteredTransactions.length === 1
              ? "transaction"
              : "transactions"}
          </span>
          {activeFilter !== "all" && (
            <span className="text-xs text-slate-500">
              Filtered by: {CATEGORY_CONFIG[activeFilter].label}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-400">Total:</span>
          <span className="text-lg font-bold text-white">
            -$
            {filteredTotal.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>
      </div>
      </motion.div>
    </div>
  )
}
