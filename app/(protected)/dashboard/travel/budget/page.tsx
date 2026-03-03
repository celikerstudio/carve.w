import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { BudgetPageClient } from "./budget-client"

export default async function BudgetPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: trips } = await supabase
    .from("trips")
    .select(`
      id, title, destination, total_budget, currency, status,
      trip_days(
        trip_activities(estimated_cost, cost_category)
      ),
      trip_accommodations(price_per_night)
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  type RawTrip = {
    id: string
    title: string
    destination: string
    total_budget: number | null
    currency: string
    status: string
    trip_days: Array<{
      trip_activities: Array<{
        estimated_cost: number | null
        cost_category: string | null
      }>
    }>
    trip_accommodations: Array<{
      price_per_night: number | null
    }>
  }

  const tripBudgets = ((trips || []) as RawTrip[]).map((trip) => {
    const activities = trip.trip_days.flatMap((d) => d.trip_activities || [])
    const activityCost = activities.reduce((sum, a) => sum + (a.estimated_cost || 0), 0)
    const accNights = trip.trip_days.length || 1
    const accCost = (trip.trip_accommodations?.[0]?.price_per_night || 0) * accNights
    const estimatedTotal = activityCost + accCost

    // Category breakdown
    const categories: Record<string, number> = {}
    activities.forEach((a) => {
      const cat = a.cost_category || "other"
      categories[cat] = (categories[cat] || 0) + (a.estimated_cost || 0)
    })
    if (accCost > 0) categories["accommodation"] = (categories["accommodation"] || 0) + accCost

    return {
      id: trip.id,
      title: trip.title,
      destination: trip.destination,
      totalBudget: trip.total_budget,
      currency: trip.currency,
      status: trip.status,
      estimatedTotal,
      categories,
    }
  })

  return <BudgetPageClient trips={tripBudgets} />
}
