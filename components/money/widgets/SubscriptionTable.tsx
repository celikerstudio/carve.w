"use client"

import { useState, useMemo } from "react"
import { cn } from "@/lib/utils"
import type { Subscription, SubscriptionCategory } from "@/components/money/sample-data"

// ---------------------------------------------------------------------------
// Service icon configuration -- matches SubscriptionCard pattern
// ---------------------------------------------------------------------------

const SERVICE_ICON_MAP: Record<
  string,
  { bg: string; label: string; textColor?: string }
> = {
  Netflix: { bg: "bg-[#E50914]", label: "N" },
  Spotify: { bg: "bg-[#1DB954]", label: "S" },
  "Adobe CC": { bg: "bg-[#FF0000]", label: "Ai" },
  Figma: { bg: "bg-[#1e1e1e]", label: "F" },
  AWS: { bg: "bg-[#232f3e]", label: "AWS", textColor: "text-[#FF9900]" },
  "X Premium": { bg: "bg-black", label: "X" },
  Equinox: { bg: "bg-black", label: "EQ" },
}

// ---------------------------------------------------------------------------
// Category badge colors
// ---------------------------------------------------------------------------

const CATEGORY_BADGE_STYLES: Record<string, string> = {
  entertainment:
    "bg-purple-500/10 text-purple-400 border-purple-500/20",
  subscriptions:
    "bg-blue-500/10 text-blue-400 border-blue-500/20",
  utilities:
    "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
}

// ---------------------------------------------------------------------------
// Filter tabs
// ---------------------------------------------------------------------------

type FilterTab = "all" | "active" | "upcoming"

const ITEMS_PER_PAGE = 6

// ---------------------------------------------------------------------------
// SubscriptionTable
// ---------------------------------------------------------------------------

interface SubscriptionTableProps {
  subscriptions: Subscription[]
  onCancelClick: (sub: Subscription) => void
}

export function SubscriptionTable({
  subscriptions,
  onCancelClick,
}: SubscriptionTableProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all")
  const [currentPage, setCurrentPage] = useState(1)

  // Filter and search subscriptions
  const filteredSubscriptions = useMemo(() => {
    let result = subscriptions

    // Apply search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (sub) =>
          sub.name.toLowerCase().includes(q) ||
          sub.plan.toLowerCase().includes(q) ||
          sub.category.toLowerCase().includes(q)
      )
    }

    // Apply filter tab
    if (activeFilter === "active") {
      result = result.filter((sub) => sub.isActive)
    } else if (activeFilter === "upcoming") {
      const now = new Date()
      const sevenDaysFromNow = new Date(
        now.getTime() + 7 * 24 * 60 * 60 * 1000
      )
      result = result.filter((sub) => {
        const billDate = new Date(sub.nextBillDate)
        return billDate >= now && billDate <= sevenDaysFromNow
      })
    }

    return result
  }, [subscriptions, searchQuery, activeFilter])

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredSubscriptions.length / ITEMS_PER_PAGE))
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedSubscriptions = filteredSubscriptions.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  )

  // Reset page when filters change
  const handleFilterChange = (tab: FilterTab) => {
    setActiveFilter(tab)
    setCurrentPage(1)
  }

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    setCurrentPage(1)
  }

  return (
    <div
      className={cn(
        "rounded-2xl overflow-hidden",
        "bg-[rgba(28,31,39,0.7)] backdrop-blur-xl",
        "border border-white/[0.08]",
        "shadow-[0_4px_30px_rgba(0,0,0,0.3)]"
      )}
    >
      {/* Search + filter bar */}
      <div className="flex items-center justify-between p-4 border-b border-[#3b4354]/30 bg-[#1c1f27]/30">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9da6b9]"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search subscriptions..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className={cn(
              "pl-9 pr-4 py-2 rounded-lg text-sm",
              "bg-[#111318]/50 border border-[#3b4354]/30",
              "text-white placeholder-[#9da6b9]",
              "focus:outline-none focus:border-[#e8e0d4]/50",
              "transition-colors"
            )}
          />
        </div>

        <div className="flex gap-2">
          {(["all", "active", "upcoming"] as FilterTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => handleFilterChange(tab)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                activeFilter === tab
                  ? "bg-[#e8e0d4]/20 text-[#e8e0d4] border border-[#e8e0d4]/20"
                  : "text-[#9da6b9] hover:bg-[#3b4354]/30 border border-transparent"
              )}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 bg-[#111318]/90 backdrop-blur-md">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-[#9da6b9] uppercase tracking-wider">
                Service Name
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-[#9da6b9] uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-[#9da6b9] uppercase tracking-wider">
                Frequency
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-[#9da6b9] uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-[#9da6b9] uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#3b4354]/20">
            {paginatedSubscriptions.map((sub) => {
              const iconCfg = SERVICE_ICON_MAP[sub.name] ?? {
                bg: "bg-slate-700",
                label: sub.name.charAt(0),
              }
              const badgeStyle =
                CATEGORY_BADGE_STYLES[sub.category] ??
                "bg-slate-500/10 text-slate-400 border-slate-500/20"

              return (
                <tr
                  key={sub.id}
                  className="hover:bg-white/[0.02] transition-colors"
                >
                  {/* Service */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0",
                          iconCfg.bg,
                          iconCfg.textColor
                        )}
                      >
                        {iconCfg.label}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {sub.name}
                        </p>
                        <p className="text-xs text-[#9da6b9] truncate">
                          {sub.plan}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border",
                        badgeStyle
                      )}
                    >
                      {sub.category.charAt(0).toUpperCase() +
                        sub.category.slice(1)}
                    </span>
                  </td>

                  {/* Frequency */}
                  <td className="px-6 py-4">
                    <span className="text-sm text-[#9da6b9]">
                      {sub.frequency === "monthly" ? "Monthly" : "Yearly"}
                    </span>
                  </td>

                  {/* Amount */}
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm font-bold text-white">
                      ${sub.cost.toFixed(2)}
                    </span>
                  </td>

                  {/* Action */}
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => onCancelClick(sub)}
                      className={cn(
                        "p-2 rounded-lg transition-colors",
                        "text-[#9da6b9] hover:text-red-400 hover:bg-red-500/10"
                      )}
                      aria-label={`Cancel ${sub.name} subscription`}
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
                        <circle cx="12" cy="12" r="10" />
                        <line x1="15" y1="9" x2="9" y2="15" />
                        <line x1="9" y1="9" x2="15" y2="15" />
                      </svg>
                    </button>
                  </td>
                </tr>
              )
            })}

            {paginatedSubscriptions.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-12 text-center text-sm text-[#9da6b9]"
                >
                  No subscriptions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between p-4 border-t border-[#3b4354]/30 bg-[#1c1f27]/30">
        <p className="text-xs text-[#9da6b9]">
          Showing {filteredSubscriptions.length === 0 ? 0 : startIndex + 1}-
          {Math.min(startIndex + ITEMS_PER_PAGE, filteredSubscriptions.length)}{" "}
          of {filteredSubscriptions.length}
        </p>
        <div className="flex gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={cn(
                "w-8 h-8 rounded-lg text-xs font-medium transition-colors",
                currentPage === page
                  ? "bg-[#e8e0d4] text-white"
                  : "text-[#9da6b9] hover:bg-[#3b4354]/30"
              )}
            >
              {page}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
