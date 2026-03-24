import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardHub } from "@/components/dashboard/hub/DashboardHub"

export default async function MoneyPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  return <DashboardHub section="money" />
}
