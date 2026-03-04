"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { TravelCard } from "@/components/travel/shared"
import type { TripDay } from "@/lib/ai/travel-schemas"

interface DayTimelineProps {
  days: TripDay[]
  currency?: string
  onActivityClick?: (dayIndex: number, activityIndex: number) => void
}

const TIME_SLOT_LABELS: Record<string, string> = {
  morning: "Morning",
  afternoon: "Afternoon",
  evening: "Evening",
}

const COST_CATEGORY_COLORS: Record<string, string> = {
  food: "#10b981",
  activity: "#b8d8e8",
  transport: "#f59e0b",
  shopping: "#a78bfa",
  other: "#9da6b9",
}

export function DayTimeline({ days, currency = "EUR", onActivityClick }: DayTimelineProps) {
  const [activeDay, setActiveDay] = useState(0)
  const currencySymbol = currency === "EUR" ? "\u20AC" : currency === "USD" ? "$" : currency === "GBP" ? "\u00A3" : currency

  if (!days.length) return null

  const currentDay = days[activeDay]

  return (
    <div className="space-y-4">
      {/* Day tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {days.map((day, idx) => (
          <button
            key={day.day_number}
            onClick={() => setActiveDay(idx)}
            className={cn(
              "shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              activeDay === idx
                ? "bg-[#b8d8e8]/20 text-[#b8d8e8]"
                : "text-[#7a8299] hover:text-white hover:bg-white/[0.04]"
            )}
          >
            Day {day.day_number}
          </button>
        ))}
      </div>

      {/* Day title */}
      <h3 className="text-lg font-semibold text-white">{currentDay.title}</h3>

      {/* Activities timeline */}
      <div className="space-y-3">
        {(["morning", "afternoon", "evening"] as const).map((slot) => {
          const slotActivities = currentDay.activities.filter(
            (a) => a.time_slot === slot
          )
          if (!slotActivities.length) return null

          return (
            <div key={slot}>
              <p className="text-xs uppercase tracking-wider text-[#555d70] mb-2">
                {TIME_SLOT_LABELS[slot]}
              </p>
              <div className="space-y-2">
                {slotActivities.map((activity, idx) => (
                  <motion.div
                    key={`${slot}-${idx}`}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <TravelCard
                      className="cursor-pointer hover:border-[#b8d8e8]/20 transition-colors"
                      onClick={() => onActivityClick?.(activeDay, idx)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-white truncate">
                            {activity.title}
                          </h4>
                          <p className="text-xs text-[#7a8299] mt-0.5">
                            {activity.location_name}
                          </p>
                          {activity.description && (
                            <p className="text-xs text-[#555d70] mt-1 line-clamp-2">
                              {activity.description}
                            </p>
                          )}
                        </div>
                        {activity.estimated_cost > 0 && (
                          <span
                            className="shrink-0 ml-3 text-xs font-medium px-2 py-0.5 rounded-full"
                            style={{
                              color: COST_CATEGORY_COLORS[activity.cost_category] || COST_CATEGORY_COLORS.other,
                              backgroundColor: `${COST_CATEGORY_COLORS[activity.cost_category] || COST_CATEGORY_COLORS.other}15`,
                            }}
                          >
                            {currencySymbol}{activity.estimated_cost}
                          </span>
                        )}
                      </div>
                    </TravelCard>
                  </motion.div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
