import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { TripDetailClient } from "./trip-detail-client"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function TripDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: trip } = await supabase
    .from("trips")
    .select("*")
    .eq("id", id)
    .single()

  if (!trip) redirect("/travel")

  const { data: days } = await supabase
    .from("trip_days")
    .select("*, trip_activities(*)")
    .eq("trip_id", id)
    .order("day_number")

  const { data: accommodations } = await supabase
    .from("trip_accommodations")
    .select("*")
    .eq("trip_id", id)

  return (
    <TripDetailClient
      trip={trip}
      days={days || []}
      accommodations={accommodations || []}
    />
  )
}
