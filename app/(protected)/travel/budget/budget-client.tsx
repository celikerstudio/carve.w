"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { TravelCard } from "@/components/travel/shared"

interface TripBudget {
  id: string
  title: string
  destination: string
  totalBudget: number | null
  currency: string
  status: string
  estimatedTotal: number
  categories: Record<string, number>
}

const CATEGORY_COLORS: Record<string, string> = {
  food: "#f59e0b",
  activity: "#b8d8e8",
  transport: "#a78bfa",
  accommodation: "#10b981",
  shopping: "#f472b6",
  other: "#9da6b9",
}

export function BudgetPageClient({ trips }: { trips: TripBudget[] }) {
  const totalSpent = trips.reduce((sum, t) => sum + t.estimatedTotal, 0)
  const totalPlanned = trips
    .filter((t) => t.status === "planned" || t.status === "active")
    .reduce((sum, t) => sum + t.estimatedTotal, 0)

  // Aggregate categories across all trips
  const globalCategories: Record<string, number> = {}
  trips.forEach((t) => {
    Object.entries(t.categories).forEach(([cat, amount]) => {
      globalCategories[cat] = (globalCategories[cat] || 0) + amount
    })
  })
  const categoryEntries = Object.entries(globalCategories).sort(([, a], [, b]) => b - a)
  const maxCategoryAmount = categoryEntries[0]?.[1] || 1

  // Use EUR as default display (most trips use EUR)
  const symbol = "\u20AC"

  return (
    <div className="p-6 lg:p-10 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl font-bold text-white tracking-tight">Budget</h1>
        <p className="text-[#7a8299] text-sm mt-0.5">Travel spending overview</p>
      </motion.div>

      {/* Stats cards */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <TravelCard>
          <p className="text-xs text-[#555d70] uppercase tracking-wider font-semibold">Total Estimated</p>
          <p className="text-3xl font-bold text-white mt-2 tabular-nums">
            {symbol}{totalSpent.toFixed(0)}
          </p>
          <p className="text-xs text-[#7a8299] mt-1">{trips.length} trips</p>
        </TravelCard>
        <TravelCard>
          <p className="text-xs text-[#555d70] uppercase tracking-wider font-semibold">Upcoming Planned</p>
          <p className="text-3xl font-bold text-[#b8d8e8] mt-2 tabular-nums">
            {symbol}{totalPlanned.toFixed(0)}
          </p>
          <p className="text-xs text-[#7a8299] mt-1">
            {trips.filter((t) => t.status === "planned" || t.status === "active").length} upcoming trips
          </p>
        </TravelCard>
      </motion.div>

      {/* Category breakdown */}
      {categoryEntries.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-lg font-semibold text-white mb-4">By Category</h2>
          <TravelCard>
            <div className="space-y-4">
              {categoryEntries.map(([cat, amount]) => (
                <div key={cat}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: CATEGORY_COLORS[cat] || CATEGORY_COLORS.other }}
                      />
                      <span className="text-sm text-[#9da6b9] capitalize">{cat}</span>
                    </div>
                    <span className="text-sm font-medium text-white tabular-nums">
                      {symbol}{amount.toFixed(0)}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-white/[0.04] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${(amount / maxCategoryAmount) * 100}%`,
                        backgroundColor: CATEGORY_COLORS[cat] || CATEGORY_COLORS.other,
                        opacity: 0.6,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </TravelCard>
        </motion.div>
      )}

      {/* Per-trip breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <h2 className="text-lg font-semibold text-white mb-4">By Trip</h2>
        {trips.length > 0 ? (
          <div className="space-y-3">
            {trips.map((trip) => {
              const budget = trip.totalBudget || trip.estimatedTotal
              const pct = budget > 0 ? Math.min(100, (trip.estimatedTotal / budget) * 100) : 0
              const tripSymbol = trip.currency === "EUR" ? "\u20AC" : trip.currency === "USD" ? "$" : trip.currency === "GBP" ? "\u00A3" : trip.currency

              return (
                <Link key={trip.id} href={`/travel/${trip.id}`}>
                  <TravelCard className="hover:border-[#b8d8e8]/20 transition-colors cursor-pointer">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-white truncate">{trip.destination}</h3>
                        <p className="text-xs text-[#555d70]">{trip.title}</p>
                      </div>
                      <div className="text-right shrink-0 ml-4">
                        <p className="text-sm font-semibold text-white tabular-nums">
                          {tripSymbol}{trip.estimatedTotal.toFixed(0)}
                        </p>
                        {trip.totalBudget && (
                          <p className="text-xs text-[#555d70]">
                            / {tripSymbol}{trip.totalBudget.toFixed(0)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          pct > 90 ? "bg-red-400/60" : pct > 70 ? "bg-amber-400/50" : "bg-[#b8d8e8]/40"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </TravelCard>
                </Link>
              )
            })}
          </div>
        ) : (
          <TravelCard className="text-center py-12">
            <p className="text-[#555d70] text-sm">No trips yet — plan one to start tracking your budget</p>
          </TravelCard>
        )}
      </motion.div>
    </div>
  )
}
