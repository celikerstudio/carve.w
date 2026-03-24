"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { CarveChat } from "@/components/dashboard/hub/chat/CarveChat"
import { PlanDashboard } from "@/components/travel/plan/PlanDashboard"
import { travelConfig } from "@/components/dashboard/hub/mock-data"
import type { TripPlan } from "@/lib/ai/travel-schemas"

export default function NewTripPage() {
  const [plan, setPlan] = useState<TripPlan | null>(null)
  const [chatCollapsed, setChatCollapsed] = useState(false)

  return (
    <div className="h-full flex">
      {/* Chat panel */}
      <motion.div
        animate={{ width: chatCollapsed ? 0 : 400 }}
        transition={{ duration: 0.3 }}
        className="shrink-0 border-r border-white/[0.06] overflow-hidden bg-[#0c0e14]"
      >
        <div className="w-[400px] h-full">
          <CarveChat config={travelConfig} />
        </div>
      </motion.div>

      {/* Toggle button */}
      <button
        onClick={() => setChatCollapsed(!chatCollapsed)}
        className="shrink-0 w-6 flex items-center justify-center hover:bg-white/[0.04] transition-colors border-r border-white/[0.06]"
      >
        <svg
          className="w-3 h-3 text-[#555d70]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          style={{ transform: chatCollapsed ? "rotate(180deg)" : "none" }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Plan dashboard */}
      <div className="flex-1 min-w-0">
        {plan ? (
          <PlanDashboard plan={plan} />
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-4 opacity-20">🗺</div>
              <p className="text-[#555d70] text-sm">
                Your trip plan will appear here
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
