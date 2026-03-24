import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { TravelMapClient } from "./map-client"

export default async function MapPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: trips } = await supabase
    .from("trips")
    .select(`
      id, title, destination, start_date, end_date, total_budget, currency, status,
      trip_days(
        trip_activities(latitude, longitude)
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  // Extract first valid lat/lng per trip as the "pin" location
  const tripsWithCoords = (trips || []).map((trip) => {
    const days = (trip.trip_days as Array<{ trip_activities: Array<{ latitude: number | null; longitude: number | null }> }>) || []
    const activities = days.flatMap((d) => d.trip_activities || [])
    const firstWithCoords = activities.find((a) => a.latitude && a.longitude)

    return {
      id: trip.id,
      title: trip.title,
      destination: trip.destination,
      start_date: trip.start_date,
      end_date: trip.end_date,
      total_budget: trip.total_budget,
      currency: trip.currency,
      status: trip.status,
      latitude: firstWithCoords?.latitude ?? null,
      longitude: firstWithCoords?.longitude ?? null,
    }
  })

  // Get homebase from travel_preferences (fallback to Amsterdam)
  const { data: prefs } = await supabase
    .from("travel_preferences")
    .select("homebase")
    .eq("user_id", user.id)
    .single()

  const homebase = prefs?.homebase || "Amsterdam"

  // Fetch bucketlist items
  const { data: bucketlistItems } = await supabase
    .from("bucketlist_items")
    .select("id, type, title, destination, description, completed, trip_id, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return <TravelMapClient trips={tripsWithCoords} homebase={homebase} bucketlist={bucketlistItems || []} />
}
