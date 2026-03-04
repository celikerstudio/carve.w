"use client"

import { motion } from "framer-motion"
import { DayTimeline } from "@/components/travel/widgets/DayTimeline"
import { BudgetOverview } from "@/components/travel/widgets/BudgetOverview"
import { AccommodationCard } from "@/components/travel/widgets/AccommodationCard"
import { TripMap } from "@/components/travel/widgets/TripMap"
import type { TripPlan } from "@/lib/ai/travel-schemas"

interface PlanDashboardProps {
  plan: TripPlan
  currency?: string
}

export function PlanDashboard({ plan, currency = "EUR" }: PlanDashboardProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="h-full overflow-y-auto p-6 space-y-6"
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">{plan.title}</h1>
        <p className="text-[#9da6b9] text-sm mt-1">
          {plan.destination} · {plan.days.length} days
        </p>
      </div>

      {/* Map */}
      <div className="h-[300px]">
        <TripMap days={plan.days} />
      </div>

      {/* Grid: Timeline + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DayTimeline days={plan.days} currency={currency} />
        </div>
        <div className="space-y-4">
          <BudgetOverview
            budget={plan.budget_breakdown}
            totalBudget={plan.budget_breakdown.total}
            currency={currency}
          />
          <AccommodationCard accommodations={plan.accommodations} currency={currency} />
        </div>
      </div>
    </motion.div>
  )
}
