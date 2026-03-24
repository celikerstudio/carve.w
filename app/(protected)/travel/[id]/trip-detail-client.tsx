"use client"

import { useState, useCallback, useMemo } from "react"
import { motion } from "framer-motion"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { ChatBubble } from "@/components/dashboard/hub/chat/ChatBubble"
import { CarveInputBar } from "@/components/dashboard/hub/chat/CarveInputBar"
import { ActivityEditForm } from "@/components/travel/widgets/ActivityEditForm"
import { ActivitySuggestions } from "@/components/travel/widgets/ActivitySuggestions"
import { TravelCard } from "@/components/travel/shared"
import { cn } from "@/lib/utils"
import { getSuggestionsForDestination } from "@/lib/travel/city-suggestions"
import type { TripPlan, TripActivity } from "@/lib/ai/travel-schemas"

interface TripDetailClientProps {
  trip: {
    id: string
    title: string
    destination: string
    start_date: string | null
    end_date: string | null
    total_budget: number | null
    currency: string
  }
  days: Array<{
    day_number: number
    title: string | null
    trip_activities: Array<{
      time_slot: string
      title: string
      description: string | null
      location_name: string | null
      latitude: number | null
      longitude: number | null
      estimated_cost: number | null
      cost_category: string | null
      duration_minutes: number | null
    }>
  }>
  accommodations: Array<{
    name: string
    price_per_night: number | null
    rating: number | null
    price_tier: string | null
    booking_url: string | null
    latitude: number | null
    longitude: number | null
    distance_to_center: string | null
  }>
}

function toTripPlan(props: TripDetailClientProps): TripPlan {
  let days = props.days.map((d) => ({
    day_number: d.day_number,
    title: d.title || `Day ${d.day_number}`,
    activities: d.trip_activities.map((a) => ({
      time_slot: (a.time_slot || "morning") as TripActivity["time_slot"],
      title: a.title,
      description: a.description || "",
      location_name: a.location_name || "",
      latitude: a.latitude || 0,
      longitude: a.longitude || 0,
      estimated_cost: a.estimated_cost || 0,
      cost_category: (a.cost_category || "other") as TripActivity["cost_category"],
      duration_minutes: a.duration_minutes || 60,
    })),
  }))

  // Auto-populate Day 1 with city suggestions for new trips (no days yet)
  if (days.length === 0 && props.trip.destination) {
    const suggestions = getSuggestionsForDestination(props.trip.destination)
    if (suggestions.length > 0) {
      days = [{
        day_number: 1,
        title: "Day 1",
        activities: suggestions.map((s) => ({
          time_slot: s.time_slot as TripActivity["time_slot"],
          title: s.title,
          description: s.description,
          location_name: s.location_name,
          latitude: 0,
          longitude: 0,
          estimated_cost: s.estimated_cost,
          cost_category: s.cost_category as TripActivity["cost_category"],
          duration_minutes: s.duration_minutes,
        })),
      }]
    } else {
      days = [{ day_number: 1, title: "Day 1", activities: [] }]
    }
  }

  return {
    title: props.trip.title,
    destination: props.trip.destination,
    days,
    accommodations: props.accommodations.map((a) => ({
      name: a.name,
      price_per_night: a.price_per_night || 0,
      rating: a.rating || 0,
      price_tier: (a.price_tier || "mid-range") as "budget" | "mid-range" | "luxury",
      booking_url: a.booking_url || "#",
      latitude: a.latitude || 0,
      longitude: a.longitude || 0,
      distance_to_center: a.distance_to_center || "",
    })),
    budget_breakdown: { accommodation: 0, food: 0, activities: 0, transport: 0, other: 0, total: 0 },
  }
}

// --- Inline editable text ---
function InlineEdit({
  value,
  onSave,
  className,
}: {
  value: string
  onSave: (val: string) => void
  className?: string
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)

  if (editing) {
    return (
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => { onSave(draft); setEditing(false) }}
        onKeyDown={(e) => {
          if (e.key === "Enter") { onSave(draft); setEditing(false) }
          if (e.key === "Escape") { setDraft(value); setEditing(false) }
        }}
        className={cn("bg-transparent border-b border-[#b8d8e8]/30 outline-none", className)}
        autoFocus
      />
    )
  }

  return (
    <span
      onClick={() => { setDraft(value); setEditing(true) }}
      className={cn("cursor-pointer hover:text-[#b8d8e8] transition-colors", className)}
      title="Click to edit"
    >
      {value || "Click to set"}
    </span>
  )
}

// --- Constants ---
const CATEGORY_COLORS: Record<string, string> = {
  food: "#10b981",
  activity: "#b8d8e8",
  transport: "#f59e0b",
  shopping: "#a78bfa",
  other: "#9da6b9",
}

const TIME_SLOT_ORDER = ["morning", "afternoon", "evening"] as const
const TIME_SLOT_LABELS: Record<string, string> = {
  morning: "Morning",
  afternoon: "Afternoon",
  evening: "Evening",
}

export function TripDetailClient(props: TripDetailClientProps) {
  const [plan, setPlan] = useState<TripPlan>(() => toTripPlan(props))
  const [chatOpen, setChatOpen] = useState(false)
  const [activeDay, setActiveDay] = useState(0)
  const [editingActivity, setEditingActivity] = useState<{ dayIdx: number; actIdx: number } | null>(null)
  const [addingToDay, setAddingToDay] = useState<number | null>(null)

  const replanTransport = useMemo(
    () => new DefaultChatTransport({ api: '/api/carve-ai/chat', body: { tripId: props.trip.id } }),
    [props.trip.id]
  )

  const { messages: chatMessages, sendMessage, status: chatStatus } = useChat({
    transport: replanTransport,
    onToolCall({ toolCall }: any) {
      if (toolCall.toolName === 'generate_trip_plan') {
        setPlan(toolCall.args as TripPlan)
      }
    },
  })

  const isChatLoading = chatStatus === 'streaming' || chatStatus === 'submitted'

  const getChatMessageText = (message: typeof chatMessages[0]) => {
    return message.parts
      .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
      .map((p) => p.text)
      .join('')
  }

  const currency = props.trip.currency
  const currencySymbol = currency === "EUR" ? "\u20AC" : currency === "USD" ? "$" : currency === "GBP" ? "\u00A3" : currency

  // --- Mutator functions (swap for API calls later) ---
  const updateTitle = useCallback(async (title: string) => {
    setPlan((p) => ({ ...p, title }))
  }, [])

  const updateDestination = useCallback(async (destination: string) => {
    setPlan((p) => ({ ...p, destination }))
  }, [])

  const addDay = useCallback(async () => {
    setPlan((p) => ({
      ...p,
      days: [
        ...p.days,
        { day_number: p.days.length + 1, title: `Day ${p.days.length + 1}`, activities: [] },
      ],
    }))
  }, [])

  const removeDay = useCallback(async (dayIdx: number) => {
    setPlan((p) => ({
      ...p,
      days: p.days.filter((_, i) => i !== dayIdx).map((d, i) => ({ ...d, day_number: i + 1 })),
    }))
    setActiveDay((prev) => Math.max(0, prev - (dayIdx <= prev ? 1 : 0)))
  }, [])

  const updateDayTitle = useCallback(async (dayIdx: number, title: string) => {
    setPlan((p) => ({
      ...p,
      days: p.days.map((d, i) => (i === dayIdx ? { ...d, title } : d)),
    }))
  }, [])

  const addActivity = useCallback(async (dayIdx: number, activity: TripActivity) => {
    setPlan((p) => ({
      ...p,
      days: p.days.map((d, i) => (i === dayIdx ? { ...d, activities: [...d.activities, activity] } : d)),
    }))
    setAddingToDay(null)
  }, [])

  const updateActivity = useCallback(async (dayIdx: number, actIdx: number, activity: TripActivity) => {
    setPlan((p) => ({
      ...p,
      days: p.days.map((d, i) =>
        i === dayIdx ? { ...d, activities: d.activities.map((a, j) => (j === actIdx ? activity : a)) } : d
      ),
    }))
    setEditingActivity(null)
  }, [])

  const removeActivity = useCallback(async (dayIdx: number, actIdx: number) => {
    setPlan((p) => ({
      ...p,
      days: p.days.map((d, i) =>
        i === dayIdx ? { ...d, activities: d.activities.filter((_, j) => j !== actIdx) } : d
      ),
    }))
    setEditingActivity(null)
  }, [])

  // --- Computed ---
  const currentDay = plan.days[activeDay]
  const totalEstimated = plan.days.flatMap((d) => d.activities).reduce((s, a) => s + a.estimated_cost, 0)

  const newActivity: TripActivity = {
    time_slot: "morning",
    title: "",
    description: "",
    location_name: "",
    latitude: 0,
    longitude: 0,
    estimated_cost: 0,
    cost_category: "activity",
    duration_minutes: 60,
  }

  return (
    <div className="h-full flex">
      {/* Chat panel */}
      {chatOpen && (
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: 400 }}
          transition={{ duration: 0.3 }}
          className="shrink-0 border-r border-white/[0.06] overflow-hidden bg-[#0c0e14]"
        >
          <div className="w-[400px] h-full">
            <div className="flex flex-col h-full">
              <div className="px-4 py-3 border-b border-white/[0.06]">
                <h2 className="text-sm font-semibold text-white">Carve AI</h2>
                <p className="text-xs text-[#555d70]">Replan your trip</p>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {chatMessages.map((msg) => {
                  const text = getChatMessageText(msg)
                  if (!text) return null
                  return (
                    <ChatBubble key={msg.id} role={msg.role as 'user' | 'assistant'} content={text} />
                  )
                })}
                {isChatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white/[0.04] border border-white/[0.06] rounded-2xl px-4 py-3">
                      <div className="flex gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#c8b86e]/40 animate-pulse" />
                        <div className="w-1.5 h-1.5 rounded-full bg-[#c8b86e]/40 animate-pulse [animation-delay:0.2s]" />
                        <div className="w-1.5 h-1.5 rounded-full bg-[#c8b86e]/40 animate-pulse [animation-delay:0.4s]" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <CarveInputBar onSend={(text) => sendMessage({ text })} disabled={isChatLoading} />
            </div>
          </div>
        </motion.div>
      )}

      {/* Main content */}
      <div className="flex-1 min-w-0 overflow-y-auto p-6 lg:p-10 space-y-6 max-w-5xl">
        {/* AI toggle */}
        <div className="flex justify-end">
          <button
            onClick={() => setChatOpen(!chatOpen)}
            className="px-3 py-1.5 text-xs font-medium text-[#b8d8e8] bg-[#b8d8e8]/10 hover:bg-[#b8d8e8]/20 rounded-lg transition-colors"
          >
            {chatOpen ? "Close chat" : "Replan with Carve AI"}
          </button>
        </div>

        {/* Trip header — inline editable */}
        <div>
          <InlineEdit
            value={plan.title}
            onSave={updateTitle}
            className="text-2xl font-bold text-white tracking-tight block"
          />
          <InlineEdit
            value={plan.destination}
            onSave={updateDestination}
            className="text-[#9da6b9] text-sm mt-1 block"
          />
          <div className="flex items-center gap-4 mt-2 text-xs text-[#555d70]">
            <span>{plan.days.length} days</span>
            {props.trip.total_budget && (
              <span>{currencySymbol}{props.trip.total_budget} budget</span>
            )}
            {totalEstimated > 0 && (
              <span className="text-[#b8d8e8]">{currencySymbol}{totalEstimated.toFixed(0)} estimated</span>
            )}
          </div>
        </div>

        {/* Day tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {plan.days.map((day, idx) => (
            <button
              key={day.day_number}
              onClick={() => setActiveDay(idx)}
              className={cn(
                "shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors group relative",
                activeDay === idx
                  ? "bg-[#b8d8e8]/20 text-[#b8d8e8]"
                  : "text-[#7a8299] hover:text-white hover:bg-white/[0.04]"
              )}
            >
              Day {day.day_number}
              {plan.days.length > 1 && (
                <span
                  onClick={(e) => { e.stopPropagation(); removeDay(idx) }}
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500/80 text-white text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  ×
                </span>
              )}
            </button>
          ))}
          <button
            onClick={addDay}
            className="shrink-0 px-3 py-2 rounded-lg text-sm text-[#555d70] hover:text-[#b8d8e8] hover:bg-white/[0.04] transition-colors"
          >
            + Add day
          </button>
        </div>

        {/* Current day content */}
        {currentDay && (
          <div className="space-y-4">
            <InlineEdit
              value={currentDay.title}
              onSave={(val) => updateDayTitle(activeDay, val)}
              className="text-lg font-semibold text-white block"
            />

            {/* Activities by time slot */}
            {TIME_SLOT_ORDER.map((slot) => {
              const slotActivities = currentDay.activities
                .map((a, idx) => ({ ...a, _idx: idx }))
                .filter((a) => a.time_slot === slot)

              if (!slotActivities.length) return null

              return (
                <div key={slot}>
                  <p className="text-xs uppercase tracking-wider text-[#555d70] mb-2">
                    {TIME_SLOT_LABELS[slot]}
                  </p>
                  <div className="space-y-2">
                    {slotActivities.map((activity) => {
                      const isEditing =
                        editingActivity?.dayIdx === activeDay &&
                        editingActivity?.actIdx === activity._idx

                      if (isEditing) {
                        return (
                          <ActivityEditForm
                            key={activity._idx}
                            activity={activity}
                            onSave={(a) => updateActivity(activeDay, activity._idx, a)}
                            onDelete={() => removeActivity(activeDay, activity._idx)}
                            onCancel={() => setEditingActivity(null)}
                            currency={currency}
                          />
                        )
                      }

                      return (
                        <motion.div
                          key={activity._idx}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                        >
                          <TravelCard
                            className="cursor-pointer hover:border-[#b8d8e8]/20 transition-colors group"
                            onClick={() => setEditingActivity({ dayIdx: activeDay, actIdx: activity._idx })}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-medium text-white truncate">{activity.title}</h4>
                                {activity.location_name && (
                                  <p className="text-xs text-[#7a8299] mt-0.5">{activity.location_name}</p>
                                )}
                                {activity.description && (
                                  <p className="text-xs text-[#555d70] mt-1 line-clamp-2">{activity.description}</p>
                                )}
                              </div>
                              <div className="flex items-center gap-2 shrink-0 ml-3">
                                {activity.estimated_cost > 0 && (
                                  <span
                                    className="text-xs font-medium px-2 py-0.5 rounded-full"
                                    style={{
                                      color: CATEGORY_COLORS[activity.cost_category] || CATEGORY_COLORS.other,
                                      backgroundColor: `${CATEGORY_COLORS[activity.cost_category] || CATEGORY_COLORS.other}15`,
                                    }}
                                  >
                                    {currencySymbol}{activity.estimated_cost}
                                  </span>
                                )}
                                <button
                                  onClick={(e) => { e.stopPropagation(); removeActivity(activeDay, activity._idx) }}
                                  className="w-6 h-6 rounded-lg flex items-center justify-center text-[#555d70] hover:text-red-400 hover:bg-red-400/10 opacity-0 group-hover:opacity-100 transition-all"
                                >
                                  ×
                                </button>
                              </div>
                            </div>
                          </TravelCard>
                        </motion.div>
                      )
                    })}
                  </div>
                </div>
              )
            })}

            {/* Add activity */}
            {addingToDay === activeDay ? (
              <ActivityEditForm
                activity={newActivity}
                onSave={(a) => addActivity(activeDay, a)}
                onDelete={() => setAddingToDay(null)}
                onCancel={() => setAddingToDay(null)}
                currency={currency}
              />
            ) : (
              <button
                onClick={() => setAddingToDay(activeDay)}
                className="w-full py-3 rounded-xl border border-dashed border-white/[0.08] text-sm text-[#555d70] hover:text-[#b8d8e8] hover:border-[#b8d8e8]/20 transition-colors"
              >
                + Add activity
              </button>
            )}

            {/* Suggestions — always visible for supported destinations */}
            {plan.destination && (
              <ActivitySuggestions
                destination={plan.destination}
                onAdd={(a) => addActivity(activeDay, a)}
                currency={currency}
              />
            )}
          </div>
        )}

        {/* Empty state — no days */}
        {plan.days.length === 0 && (
          <TravelCard className="text-center py-12">
            <p className="text-[#555d70] text-sm mb-3">No days planned yet</p>
            <button
              onClick={addDay}
              className="px-4 py-2 text-sm font-medium text-[#b8d8e8] bg-[#b8d8e8]/10 hover:bg-[#b8d8e8]/20 rounded-lg transition-colors"
            >
              Add your first day
            </button>
          </TravelCard>
        )}
      </div>
    </div>
  )
}
