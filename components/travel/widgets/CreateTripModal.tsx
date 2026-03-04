"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { TravelCard } from "@/components/travel/shared"

interface CreateTripModalProps {
  open: boolean
  onClose: () => void
  onCreate: (trip: {
    destination: string
    title: string
    start_date: string
    end_date: string
    total_budget: number
    currency: string
  }) => void
}

const CURRENCIES = ["EUR", "USD", "GBP", "CHF", "JPY", "AUD", "CAD"] as const

export function CreateTripModal({ open, onClose, onCreate }: CreateTripModalProps) {
  const [destination, setDestination] = useState("")
  const [title, setTitle] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [budget, setBudget] = useState("")
  const [currency, setCurrency] = useState("EUR")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!destination.trim()) return

    onCreate({
      destination: destination.trim(),
      title: title.trim() || `Trip to ${destination.trim()}`,
      start_date: startDate,
      end_date: endDate,
      total_budget: parseFloat(budget) || 0,
      currency,
    })

    setDestination("")
    setTitle("")
    setStartDate("")
    setEndDate("")
    setBudget("")
    setCurrency("EUR")
  }

  const inputClass =
    "w-full px-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-white placeholder-[#555d70] focus:outline-none focus:border-[#b8d8e8]/30 transition-colors"

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="w-full max-w-md rounded-xl p-5 bg-[#1c1f27] border border-white/[0.06]" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-lg font-semibold text-white mb-1">Create a trip</h2>
              <p className="text-xs text-[#555d70] mb-5">Fill in the basics — you can edit everything later</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs text-[#7a8299] mb-1.5">Destination *</label>
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="Barcelona, Spain"
                    className={inputClass}
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-xs text-[#7a8299] mb-1.5">Trip name</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={destination ? `Trip to ${destination}` : "Summer vacation"}
                    className={inputClass}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-[#7a8299] mb-1.5">Start date</label>
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-xs text-[#7a8299] mb-1.5">End date</label>
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={inputClass} />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs text-[#7a8299] mb-1.5">Budget</label>
                    <input type="number" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="1500" min="0" className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-xs text-[#7a8299] mb-1.5">Currency</label>
                    <select value={currency} onChange={(e) => setCurrency(e.target.value)} className={inputClass}>
                      {CURRENCIES.map((c) => (<option key={c} value={c}>{c}</option>))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-[#7a8299] hover:text-white transition-colors">Cancel</button>
                  <button type="submit" className="px-5 py-2 text-sm font-medium text-[#0c0e14] bg-[#b8d8e8] hover:bg-[#b8d8e8]/90 rounded-lg transition-colors">Create trip</button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
