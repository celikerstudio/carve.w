import { createClient } from "@/lib/supabase/server";
import {
  getAdminDashboardStats,
  getUserGrowthData,
  getActivityTrends,
  getGamificationStats,
  getRoleDistribution,
  getRecentSignups,
  getRecentWorkouts,
} from "@/lib/admin/queries";
import { StatsCard } from "@/components/admin/stats-card";
import {
  UserGrowthChart,
  ActivityChart,
  RoleDistributionChart,
  LevelDistributionChart,
} from "@/components/admin/dashboard-charts";
import {
  Users,
  Activity,
  UserPlus,
  Dumbbell,
  UtensilsCrossed,
  BookOpen,
  Clock,
} from "lucide-react";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // Fetch all dashboard data in parallel
  const [
    stats,
    userGrowthData,
    activityData,
    gamificationStats,
    roleDistribution,
    recentSignups,
    recentWorkoutsList,
  ] = await Promise.all([
    getAdminDashboardStats(supabase),
    getUserGrowthData(supabase),
    getActivityTrends(supabase),
    getGamificationStats(supabase),
    getRoleDistribution(supabase),
    getRecentSignups(supabase),
    getRecentWorkouts(supabase),
  ]);

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 lg:p-10 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="border-b border-white/[0.06] pb-4">
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Admin Dashboard
          </h1>
          <p className="text-[#9da6b9] mt-1">
            Platform analytics and activity overview
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatsCard
            title="Total Users"
            value={stats.totalUsers}
            icon={Users}
            description={`${stats.activeUsers7d} active this week`}
            index={0}
          />
          <StatsCard
            title="Active Users"
            value={stats.activeUsers7d}
            previousValue={stats.activeUsersPrev}
            icon={Activity}
            description="Last 7 days"
            index={1}
          />
          <StatsCard
            title="New Users"
            value={stats.newUsers7d}
            previousValue={stats.newUsersPrev}
            icon={UserPlus}
            description="Last 7 days"
            index={2}
          />
          <StatsCard
            title="Total Workouts"
            value={stats.totalWorkouts}
            previousValue={stats.workoutsPrev}
            icon={Dumbbell}
            description="All-time logged"
            index={3}
          />
          <StatsCard
            title="Total Meals"
            value={stats.totalMeals}
            previousValue={stats.mealsPrev}
            icon={UtensilsCrossed}
            description="All-time logged"
            index={4}
          />
          <StatsCard
            title="Wiki Articles"
            value={stats.totalArticles}
            icon={BookOpen}
            description="Published articles"
            index={5}
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <UserGrowthChart data={userGrowthData} />
          <ActivityChart data={activityData} />
          <RoleDistributionChart data={roleDistribution} />
          <LevelDistributionChart
            data={gamificationStats.levelDistribution}
            avgLevel={gamificationStats.avgLevel}
          />
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Signups */}
          <div className="bg-[#1c1f27] border border-white/[0.06] rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <UserPlus className="h-4 w-4 text-slate-500" />
              <h2 className="text-lg font-semibold text-white">
                Recent Signups
              </h2>
            </div>
            <div className="space-y-3">
              {recentSignups.length > 0 ? (
                recentSignups.map((user: any) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between border-b border-white/[0.06] pb-3 last:border-0 last:pb-0"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-white truncate">
                        {user.display_name || user.email || "Anonymous"}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-[#9da6b9]">
                        <span className="capitalize">
                          {user.user_roles?.name || "user"}
                        </span>
                        <span className="text-slate-600">--</span>
                        <span>{new Date(user.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">No signups yet</p>
              )}
            </div>
          </div>

          {/* Recent Workouts */}
          <div className="bg-[#1c1f27] border border-white/[0.06] rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Dumbbell className="h-4 w-4 text-slate-500" />
              <h2 className="text-lg font-semibold text-white">
                Recent Workouts
              </h2>
            </div>
            <div className="space-y-3">
              {recentWorkoutsList.length > 0 ? (
                recentWorkoutsList.map((workout: any) => (
                  <div
                    key={workout.id}
                    className="flex items-center justify-between border-b border-white/[0.06] pb-3 last:border-0 last:pb-0"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-white truncate">
                        {workout.name || "Untitled Workout"}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-[#9da6b9]">
                        {workout.total_duration_minutes && (
                          <>
                            <Clock className="h-3 w-3" />
                            <span>{workout.total_duration_minutes} min</span>
                            <span className="text-slate-600">--</span>
                          </>
                        )}
                        <span>
                          {new Date(workout.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">No workouts yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
