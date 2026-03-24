"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { TravelCard } from "@/components/travel/shared"
import { TripHero } from "@/components/travel/widgets/TripHero"
import { CountdownWidget } from "@/components/travel/widgets/CountdownWidget"
import { TodosWidget } from "@/components/travel/widgets/TodosWidget"
import { BudgetWidget } from "@/components/travel/widgets/BudgetWidget"
import { ExperienceCard } from "@/components/travel/widgets/ExperienceCard"
import { TripCard } from "@/components/travel/widgets/TripCard"
import { BucketlistWidget } from "@/components/travel/widgets/BucketlistWidget"

interface Trip {
  id: string
  title: string
  destination: string
  start_date: string | null
  end_date: string | null
  total_budget: number | null
  currency: string
  status: string
}

interface TripListItem extends Trip {
  created_at: string
}

interface Activity {
  title: string
  cost_category: string | null
  estimated_cost: number | null
  duration_minutes: number | null
}

interface Day {
  day_number: number
  title: string | null
  trip_activities: Activity[]
}

interface Todo {
  id: string
  title: string
  completed: boolean
  order_index: number
}

interface BucketlistItemSummary {
  id: string
  title: string
  destination: string
  completed: boolean
}

interface Props {
  trip: Trip | null
  days: Day[]
  todos: Todo[]
  allTrips: TripListItem[]
  bucketlist: BucketlistItemSummary[]
}

const CATEGORY_COLORS: Record<string, string> = {
  food: "#f59e0b",
  activity: "#b8d8e8",
  transport: "#a78bfa",
  shopping: "#f472b6",
  other: "#9da6b9",
}

export function TravelDashboardClient({ trip, days, todos, allTrips, bucketlist }: Props) {
  const [trips, setTrips] = useState(allTrips)

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/travel/trips?id=${id}`, { method: "DELETE" })
    if (res.ok) {
      setTrips((prev) => prev.filter((t) => t.id !== id))
    }
  }

  // Build budget categories from activities
  const allActivities = days.flatMap((d) => d.trip_activities)
  const budgetCategories = Object.entries(
    allActivities.reduce<Record<string, number>>((acc, a) => {
      const cat = a.cost_category || "other"
      acc[cat] = (acc[cat] || 0) + (a.estimated_cost || 0)
      return acc
    }, {})
  ).map(([label, amount]) => ({
    label,
    amount,
    color: CATEGORY_COLORS[label] || CATEGORY_COLORS.other,
  }))

  // Pick a few experiences to highlight
  const experiences = allActivities
    .filter((a) => a.title && a.duration_minutes)
    .slice(0, 4)

  return (
    <div className="p-6 lg:p-10 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Carve Travel
          </h1>
          <p className="text-[#7a8299] text-sm mt-0.5">Ready for your next adventure?</p>
        </div>
        <Link
          href="/travel/new"
          className="px-4 py-2 text-sm font-medium text-[#b8d8e8] bg-[#b8d8e8]/10 hover:bg-[#b8d8e8]/20 rounded-lg transition-colors"
        >
          Plan a trip
        </Link>
      </motion.div>

      {trip ? (
        <>
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
          >
            <TripHero
              id={trip.id}
              title={trip.title}
              destination={trip.destination}
              startDate={trip.start_date}
              daysCount={days.length}
              totalBudget={trip.total_budget}
              currency={trip.currency}
            />
          </motion.div>

          {/* Widgets + Bucketlist side-by-side */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6"
          >
            {/* Left: trip widgets */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <CountdownWidget
                  startDate={trip.start_date}
                  tripTitle={trip.destination}
                  daysCount={days.length}
                />
                <TodosWidget
                  tripId={trip.id}
                  initialTodos={todos}
                />
                <BudgetWidget
                  totalBudget={trip.total_budget}
                  categories={budgetCategories}
                  currency={trip.currency}
                />
              </div>

              {/* Suggested Experiences */}
              {experiences.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold text-white mb-4">Suggested Experiences</h2>
                  <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1">
                    {experiences.map((exp, i) => (
                      <ExperienceCard
                        key={i}
                        title={exp.title}
                        category={exp.cost_category || "other"}
                        durationMinutes={exp.duration_minutes || 60}
                      />
                    ))}
                    <Link
                      href={`/travel/${trip.id}`}
                      className="w-[180px] shrink-0 h-[120px] rounded-xl border border-dashed border-white/[0.08] flex items-center justify-center hover:border-white/[0.16] transition-colors"
                    >
                      <span className="text-sm text-[#555d70]">View All</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Bucketlist */}
            <div>
              <BucketlistWidget items={bucketlist} />
            </div>
          </motion.div>
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6"
        >
          <Link href="/travel/new">
            <TravelCard className="hover:border-[#b8d8e8]/30 transition-colors cursor-pointer group text-center py-16">
              <div className="text-4xl mb-4 opacity-20">✈</div>
              <h3 className="text-lg font-semibold text-white group-hover:text-[#b8d8e8] transition-colors">
                Plan your first trip
              </h3>
              <p className="text-[#7a8299] text-sm mt-1">
                Tell the AI where you want to go and get a complete travel plan
              </p>
            </TravelCard>
          </Link>
          <div>
            <BucketlistWidget items={bucketlist} />
          </div>
        </motion.div>
      )}

      {/* All Trips */}
      {trips.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-lg font-semibold text-white mb-4">Your Trips</h2>
          <div className="space-y-3">
            {trips.map((t, idx) => (
              <TripCard
                key={t.id}
                id={t.id}
                title={t.title}
                destination={t.destination}
                startDate={t.start_date}
                endDate={t.end_date}
                totalBudget={t.total_budget}
                currency={t.currency}
                status={t.status}
                index={idx}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
