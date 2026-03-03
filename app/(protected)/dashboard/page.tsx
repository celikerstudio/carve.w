import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { HealthDashboardClient } from "@/components/dashboard/HealthDashboardClient"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Fetch user stats
  const { data: stats } = await supabase
    .from("user_stats")
    .select("level, total_xp, current_workout_streak")
    .eq("user_id", user.id)
    .single()

  // Count total workouts
  const { count: workoutCount } = await supabase
    .from("workouts")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)

  // Determine ranking tier based on XP
  const totalXp = stats?.total_xp ?? 0
  const currentTier =
    totalXp >= 50000 ? "Legend"
    : totalXp >= 25000 ? "Master"
    : totalXp >= 10000 ? "Elite"
    : totalXp >= 5000 ? "Advanced"
    : totalXp >= 2000 ? "Intermediate"
    : totalXp >= 500 ? "Beginner"
    : "Rookie"

  return (
    <HealthDashboardClient
      totalXp={totalXp}
      currentTier={currentTier}
      workouts={workoutCount ?? 0}
      steps="—"
      worldwideRank={null}
      level={stats?.level ?? 1}
      streak={stats?.current_workout_streak ?? 0}
    />
  )
}
