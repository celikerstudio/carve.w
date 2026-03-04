"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { TravelCard } from "@/components/travel/shared"
import { getSuggestionsForDestination } from "@/lib/travel/city-suggestions"
import type { TripActivity } from "@/lib/ai/travel-schemas"

interface ActivitySuggestionsProps {
  destination: string
  onAdd: (activity: TripActivity) => void
  currency?: string
}

const TIME_SLOT_ORDER = ["morning", "afternoon", "evening"] as const
const TIME_SLOT_LABELS: Record<string, string> = {
  morning: "Morning",
  afternoon: "Afternoon",
  evening: "Evening",
}

const CATEGORY_COLORS: Record<string, string> = {
  food: "#10b981",
  activity: "#b8d8e8",
  transport: "#f59e0b",
  shopping: "#a78bfa",
  other: "#9da6b9",
}

export function ActivitySuggestions({ destination, onAdd, currency = "EUR" }: ActivitySuggestionsProps) {
  const [added, setAdded] = useState<Set<number>>(new Set())

  const currencySymbol = currency === "EUR" ? "\u20AC" : currency === "USD" ? "$" : currency === "GBP" ? "\u00A3" : currency

  const suggestions = useMemo(() => getSuggestionsForDestination(destination), [destination])

  if (!suggestions.length) return null

  const handleAdd = (idx: number) => {
    const s = suggestions[idx]
    onAdd({
      title: s.title,
      description: s.description,
      time_slot: s.time_slot,
      location_name: s.location_name,
      estimated_cost: s.estimated_cost,
      cost_category: s.cost_category,
      duration_minutes: s.duration_minutes,
      latitude: 0,
      longitude: 0,
    })
    setAdded((prev) => new Set(prev).add(idx))
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-[#7a8299]">
          Suggested activities in {destination}
        </h3>
        <span className="text-xs text-[#555d70]">Click + to add</span>
      </div>

      {TIME_SLOT_ORDER.map((slot) => {
        const slotSuggestions = suggestions
          .map((s, idx) => ({ ...s, _idx: idx }))
          .filter((s) => s.time_slot === slot)

        if (!slotSuggestions.length) return null

        return (
          <div key={slot} className="space-y-2">
            <p className="text-xs uppercase tracking-wider text-[#555d70]">
              {TIME_SLOT_LABELS[slot]}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {slotSuggestions.map((s) => {
                const isAdded = added.has(s._idx)

                return (
                  <motion.div
                    key={s._idx}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: s._idx * 0.05 }}
                  >
                    <TravelCard
                      className={`transition-all ${
                        isAdded
                          ? "opacity-40 border-[#b8d8e8]/10"
                          : "hover:border-[#b8d8e8]/20"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-sm font-medium text-white truncate">{s.title}</h4>
                            <span
                              className="shrink-0 text-[10px] px-1.5 py-0.5 rounded-full capitalize"
                              style={{
                                color: CATEGORY_COLORS[s.cost_category] || CATEGORY_COLORS.other,
                                backgroundColor: `${CATEGORY_COLORS[s.cost_category] || CATEGORY_COLORS.other}15`,
                              }}
                            >
                              {s.cost_category}
                            </span>
                          </div>
                          <p className="text-xs text-[#555d70] line-clamp-2">{s.description}</p>
                          <div className="flex items-center gap-3 mt-1.5 text-[10px] text-[#7a8299]">
                            <span>{s.location_name}</span>
                            {s.estimated_cost > 0 && <span>{currencySymbol}{s.estimated_cost}</span>}
                            <span>{s.duration_minutes}min</span>
                          </div>
                        </div>
                        <button
                          onClick={() => !isAdded && handleAdd(s._idx)}
                          disabled={isAdded}
                          className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-sm font-medium transition-colors ${
                            isAdded
                              ? "bg-[#b8d8e8]/10 text-[#b8d8e8]/40"
                              : "bg-[#b8d8e8]/10 text-[#b8d8e8] hover:bg-[#b8d8e8]/20"
                          }`}
                        >
                          {isAdded ? "✓" : "+"}
                        </button>
                      </div>
                    </TravelCard>
                  </motion.div>
                )
              })}
            </div>
          </div>
        )
      })}
    </motion.div>
  )
}
