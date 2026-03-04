"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { TravelCard } from "@/components/travel/shared"

interface TripCardProps {
  id: string
  title: string
  destination: string
  startDate: string | null
  endDate: string | null
  totalBudget: number | null
  currency: string
  status: string
  index: number
  onDelete?: (id: string) => void
}

const STATUS_COLORS: Record<string, string> = {
  draft: "#9da6b9",
  planned: "#b8d8e8",
  active: "#10b981",
  completed: "#7a8299",
}

export function TripCard({
  id, title, destination, startDate, endDate,
  totalBudget, currency, status, index, onDelete,
}: TripCardProps) {
  const statusColor = STATUS_COLORS[status] || STATUS_COLORS.draft
  const currencySymbol = currency === "EUR" ? "\u20AC" : currency === "USD" ? "$" : currency === "GBP" ? "\u00A3" : currency

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Link href={`/dashboard/travel/${id}`}>
        <TravelCard className="hover:border-[#b8d8e8]/20 transition-colors cursor-pointer group">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-white group-hover:text-[#b8d8e8] transition-colors truncate">
                {title}
              </h3>
              <p className="text-sm text-[#7a8299] mt-0.5">{destination}</p>
              {startDate && endDate && (
                <p className="text-xs text-[#555d70] mt-1">
                  {new Date(startDate).toLocaleDateString()} — {new Date(endDate).toLocaleDateString()}
                </p>
              )}
            </div>
            <div className="shrink-0 ml-4 flex items-start gap-2">
              <div className="text-right">
                {totalBudget && (
                  <p className="text-sm font-semibold text-white">
                    {currencySymbol}{totalBudget.toFixed(0)}
                  </p>
                )}
                <span
                  className="inline-block text-xs font-medium px-2 py-0.5 rounded-full mt-1"
                  style={{
                    color: statusColor,
                    backgroundColor: `${statusColor}15`,
                  }}
                >
                  {status}
                </span>
              </div>
              {onDelete && (
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    onDelete(id)
                  }}
                  className="p-1.5 rounded-lg text-[#555d70] hover:text-red-400 hover:bg-red-400/10 transition-colors opacity-0 group-hover:opacity-100"
                  title="Delete trip"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </TravelCard>
      </Link>
    </motion.div>
  )
}
