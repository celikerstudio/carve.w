"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import type { TripActivity } from "@/lib/ai/travel-schemas"

interface ActivityEditFormProps {
  activity: TripActivity
  onSave: (activity: TripActivity) => void
  onDelete: () => void
  onCancel: () => void
  currency?: string
}

const TIME_SLOTS = ["morning", "afternoon", "evening"] as const
const CATEGORIES = ["food", "activity", "transport", "shopping", "other"] as const

export function ActivityEditForm({ activity, onSave, onDelete, onCancel, currency = "EUR" }: ActivityEditFormProps) {
  const [form, setForm] = useState<TripActivity>({ ...activity })

  const currencySymbol = currency === "EUR" ? "\u20AC" : currency === "USD" ? "$" : currency === "GBP" ? "\u00A3" : currency

  const update = <K extends keyof TripActivity>(key: K, value: TripActivity[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const inputClass =
    "w-full px-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-white placeholder-[#555d70] focus:outline-none focus:border-[#b8d8e8]/30 transition-colors"

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden"
    >
      <div className="p-4 rounded-xl bg-[#1c1f27] border border-[#b8d8e8]/20 space-y-3">
        <input
          type="text"
          value={form.title}
          onChange={(e) => update("title", e.target.value)}
          placeholder="Activity name"
          className={inputClass}
          autoFocus
        />

        <div className="grid grid-cols-2 gap-3">
          <select value={form.time_slot} onChange={(e) => update("time_slot", e.target.value as TripActivity["time_slot"])} className={inputClass}>
            {TIME_SLOTS.map((s) => (<option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>))}
          </select>
          <select value={form.cost_category} onChange={(e) => update("cost_category", e.target.value as TripActivity["cost_category"])} className={inputClass}>
            {CATEGORIES.map((c) => (<option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>))}
          </select>
        </div>

        <input
          type="text"
          value={form.location_name}
          onChange={(e) => update("location_name", e.target.value)}
          placeholder="Location name"
          className={inputClass}
        />

        <textarea
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          placeholder="Description (optional)"
          rows={2}
          className={inputClass + " resize-none"}
        />

        <div className="grid grid-cols-2 gap-3">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#555d70]">{currencySymbol}</span>
            <input
              type="number"
              value={form.estimated_cost || ""}
              onChange={(e) => update("estimated_cost", parseFloat(e.target.value) || 0)}
              placeholder="0"
              min="0"
              className={inputClass + " pl-7"}
            />
          </div>
          <div className="relative">
            <input
              type="number"
              value={form.duration_minutes || ""}
              onChange={(e) => update("duration_minutes", parseInt(e.target.value) || 60)}
              placeholder="60"
              min="15"
              step="15"
              className={inputClass}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#555d70]">min</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <button onClick={onDelete} className="text-xs text-red-400/70 hover:text-red-400 transition-colors">Delete activity</button>
          <div className="flex gap-2">
            <button onClick={onCancel} className="px-3 py-1.5 text-xs text-[#7a8299] hover:text-white transition-colors">Cancel</button>
            <button onClick={() => onSave(form)} className="px-3 py-1.5 text-xs font-medium text-[#0c0e14] bg-[#b8d8e8] hover:bg-[#b8d8e8]/90 rounded-md transition-colors">Save</button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
