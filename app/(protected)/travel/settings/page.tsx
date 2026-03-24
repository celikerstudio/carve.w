"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { TravelCard } from "@/components/travel/shared"

const POPULAR_CITIES = [
  "Amsterdam", "Barcelona", "Berlin", "Budapest", "London", "Paris",
  "Rome", "Istanbul", "Lisbon", "Madrid", "Prague", "Vienna",
  "Copenhagen", "Dublin", "Stockholm", "Munich", "Zurich",
  "New York", "Tokyo", "Dubai", "Singapore", "Sydney", "Bangkok",
] as const

const CURRENCIES = ["EUR", "USD", "GBP", "CHF", "JPY", "AUD", "CAD"] as const
const STYLES = [
  { value: "budget", label: "Budget", description: "Hostels, street food, public transport" },
  { value: "mid-range", label: "Mid-range", description: "Hotels, restaurants, mix of transport" },
  { value: "luxury", label: "Luxury", description: "Premium hotels, fine dining, private transport" },
] as const

export default function TravelSettingsPage() {
  const [homebase, setHomebase] = useState("Amsterdam")
  const [currency, setCurrency] = useState("EUR")
  const [style, setStyle] = useState("mid-range")

  return (
    <div className="p-6 lg:p-10 space-y-8 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl font-bold text-white tracking-tight">Settings</h1>
        <p className="text-[#7a8299] text-sm mt-0.5">Travel preferences</p>
      </motion.div>

      {/* Homebase */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.03 }}>
        <TravelCard>
          <h3 className="text-sm font-semibold text-white mb-1">Homebase</h3>
          <p className="text-xs text-[#555d70] mb-4">Your home city — shown on the map as your starting point</p>
          <div className="flex flex-wrap gap-2">
            {POPULAR_CITIES.map((city) => (
              <button
                key={city}
                onClick={() => setHomebase(city)}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  homebase === city
                    ? "bg-[#b8d8e8]/20 text-[#b8d8e8]"
                    : "text-[#7a8299] bg-white/[0.04] hover:bg-white/[0.08]"
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        </TravelCard>
      </motion.div>

      {/* Currency */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <TravelCard>
          <h3 className="text-sm font-semibold text-white mb-1">Default Currency</h3>
          <p className="text-xs text-[#555d70] mb-4">Used for new trips and budget calculations</p>
          <div className="flex flex-wrap gap-2">
            {CURRENCIES.map((c) => (
              <button
                key={c}
                onClick={() => setCurrency(c)}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  currency === c
                    ? "bg-[#b8d8e8]/20 text-[#b8d8e8]"
                    : "text-[#7a8299] bg-white/[0.04] hover:bg-white/[0.08]"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </TravelCard>
      </motion.div>

      {/* Travel style */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <TravelCard>
          <h3 className="text-sm font-semibold text-white mb-1">Travel Style</h3>
          <p className="text-xs text-[#555d70] mb-4">The AI uses this to tailor trip suggestions</p>
          <div className="space-y-2">
            {STYLES.map((s) => (
              <button
                key={s.value}
                onClick={() => setStyle(s.value)}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                  style === s.value
                    ? "bg-[#b8d8e8]/10 border border-[#b8d8e8]/20"
                    : "bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08]"
                }`}
              >
                <span className={`text-sm font-medium ${style === s.value ? "text-[#b8d8e8]" : "text-white"}`}>
                  {s.label}
                </span>
                <p className="text-xs text-[#555d70] mt-0.5">{s.description}</p>
              </button>
            ))}
          </div>
        </TravelCard>
      </motion.div>
    </div>
  )
}
