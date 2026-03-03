import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { TravelDashboardClient } from "./travel-dashboard-client"

export default async function TravelPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  // Fetch upcoming trip (first planned trip with future start_date)
  const { data: upcomingTrip } = await supabase
    .from("trips")
    .select("id, title, destination, start_date, end_date, total_budget, currency, status")
    .eq("user_id", user.id)
    .in("status", ["planned", "active"])
    .gte("start_date", new Date().toISOString().split("T")[0])
    .order("start_date", { ascending: true })
    .limit(1)
    .single()

  // If no upcoming, try any planned trip
  const trip = upcomingTrip || (await supabase
    .from("trips")
    .select("id, title, destination, start_date, end_date, total_budget, currency, status")
    .eq("user_id", user.id)
    .in("status", ["planned", "active"])
    .order("created_at", { ascending: false })
    .limit(1)
    .single()
  ).data

  let days: Array<{
    day_number: number
    title: string | null
    trip_activities: Array<{
      title: string
      cost_category: string | null
      estimated_cost: number | null
      duration_minutes: number | null
    }>
  }> = []

  let todos: Array<{
    id: string
    title: string
    completed: boolean
    order_index: number
  }> = []

  if (trip) {
    const { data: tripDays } = await supabase
      .from("trip_days")
      .select("day_number, title, trip_activities(title, cost_category, estimated_cost, duration_minutes)")
      .eq("trip_id", trip.id)
      .order("day_number")

    days = tripDays || []

    const { data: tripTodos } = await supabase
      .from("trip_todos")
      .select("id, title, completed, order_index")
      .eq("trip_id", trip.id)
      .order("order_index")

    todos = tripTodos || []
  }

  // All trips for the "Your Trips" section
  const { data: allTrips } = await supabase
    .from("trips")
    .select("id, title, destination, start_date, end_date, total_budget, currency, status, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  // Bucketlist items
  const { data: bucketlistItems } = await supabase
    .from("bucketlist_items")
    .select("id, title, destination, completed")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <TravelDashboardClient
      trip={trip}
      days={days}
      todos={todos}
      allTrips={allTrips || []}
      bucketlist={bucketlistItems || []}
    />
  )
}
