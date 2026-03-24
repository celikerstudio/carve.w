import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { TripsPageClient } from "./trips-client"

export default async function TripsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: trips } = await supabase
    .from("trips")
    .select("id, title, destination, start_date, end_date, total_budget, currency, status, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return <TripsPageClient trips={trips || []} />
}
