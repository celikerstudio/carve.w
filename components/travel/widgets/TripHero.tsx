"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { TravelCard } from "@/components/travel/shared"

interface TripHeroProps {
  id: string
  title: string
  destination: string
  startDate: string | null
  daysCount: number
  totalBudget: number | null
  currency: string
}

function useCountdown(targetDate: string | null) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0 })

  useEffect(() => {
    if (!targetDate) return

    const calc = () => {
      const diff = new Date(targetDate).getTime() - Date.now()
      if (diff <= 0) return { days: 0, hours: 0, mins: 0 }
      return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        mins: Math.floor((diff / (1000 * 60)) % 60),
      }
    }

    setTimeLeft(calc())
    const interval = setInterval(() => setTimeLeft(calc()), 60_000)
    return () => clearInterval(interval)
  }, [targetDate])

  return timeLeft
}

export function TripHero({ id, title, destination, startDate, daysCount, totalBudget, currency }: TripHeroProps) {
  const countdown = useCountdown(startDate)
  const currencySymbol = currency === "EUR" ? "\u20AC" : currency === "USD" ? "$" : currency === "GBP" ? "\u00A3" : currency
  const hasCountdown = startDate && new Date(startDate).getTime() > Date.now()

  return (
    <TravelCard className="p-0 overflow-hidden">
      <div className="flex flex-col md:flex-row">
        {/* Gradient visual */}
        <div className="w-full md:w-[280px] h-[180px] md:h-auto shrink-0 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#b8d8e8]/20 via-[#1c1f27] to-[#b8d8e8]/10" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-6xl opacity-30">✈</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 md:p-8 flex flex-col justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-[#b8d8e8]" />
              <span className="text-xs font-semibold tracking-wider uppercase text-[#b8d8e8]">
                Upcoming Trip
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white">{destination}</h2>
            <p className="text-[#7a8299] text-sm mt-1.5 line-clamp-2">{title}</p>
          </div>

          {hasCountdown && (
            <div className="flex items-end gap-6">
              <div className="flex gap-5">
                {[
                  { value: countdown.days, label: "DAYS" },
                  { value: countdown.hours, label: "HOURS" },
                  { value: countdown.mins, label: "MINS" },
                ].map((item, i) => (
                  <div key={item.label} className="flex items-center gap-5">
                    <div>
                      <div className="text-3xl font-bold text-white tabular-nums">
                        {String(item.value).padStart(2, "0")}
                      </div>
                      <div className="text-[10px] font-semibold tracking-wider text-[#555d70] uppercase mt-0.5">
                        {item.label}
                      </div>
                    </div>
                    {i < 2 && (
                      <div className="w-px h-8 bg-white/[0.08]" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <Link
            href={`/travel/${id}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-[#b8d8e8]/15 hover:bg-[#b8d8e8]/25 rounded-lg transition-colors w-fit"
          >
            View Itinerary
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </TravelCard>
  )
}
