import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { HealthCard } from "@/components/dashboard/shared";

interface Workout {
  id: string;
  name: string;
  notes: string | null;
  duration_minutes: number | null;
  created_at: string;
  exercises: Exercise[];
}

interface Exercise {
  id: string;
  exercise_name: string;
  sets: number;
  reps: number | null;
  weight: number | null;
  weight_unit: string;
  is_pr: boolean;
  notes: string | null;
}

async function getWorkouts(userId: string): Promise<Workout[]> {
  const supabase = await createClient();

  const { data: workouts, error } = await supabase
    .from("workouts")
    .select(
      `
      id,
      name,
      notes,
      duration_minutes,
      created_at,
      exercises (
        id,
        exercise_name,
        sets,
        reps,
        weight,
        weight_unit,
        is_pr,
        notes,
        order_index
      )
    `
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching workouts:", error);
    return [];
  }

  return (workouts || []).map((workout: any) => ({
    ...workout,
    exercises: (workout.exercises || []).sort(
      (a: any, b: any) => a.order_index - b.order_index
    ),
  }));
}

async function getWorkoutStats(userId: string) {
  const supabase = await createClient();

  const { data: stats } = await supabase
    .from("user_stats")
    .select("total_workouts")
    .eq("user_id", userId)
    .single();

  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const { count: weekCount } = await supabase
    .from("workouts")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", startOfWeek.toISOString());

  return {
    total: stats?.total_workouts || 0,
    thisWeek: weekCount || 0,
  };
}

async function WorkoutStats({ userId }: { userId: string }) {
  const stats = await getWorkoutStats(userId);

  return (
    <div className="grid grid-cols-2 gap-4">
      <HealthCard>
        <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">
          Total Workouts
        </p>
        <p className="text-3xl font-bold text-white tracking-tight">
          {stats.total}
        </p>
      </HealthCard>
      <HealthCard>
        <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">
          This Week
        </p>
        <p className="text-3xl font-bold text-white tracking-tight">
          {stats.thisWeek}
        </p>
      </HealthCard>
    </div>
  );
}

function WorkoutStatsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4">
      {[1, 2].map((i) => (
        <div key={i} className="rounded-xl bg-[#1c1f27] border border-white/[0.06] p-5">
          <div className="h-3 w-24 rounded bg-white/[0.06] animate-shimmer mb-1" />
          <div className="h-9 w-12 rounded bg-white/[0.06] animate-shimmer" />
        </div>
      ))}
    </div>
  );
}

async function WorkoutList({ userId }: { userId: string }) {
  const workouts = await getWorkouts(userId);

  const groupedWorkouts: { [key: string]: Workout[] } = {};
  workouts.forEach((workout) => {
    const date = format(new Date(workout.created_at), "yyyy-MM-dd");
    if (!groupedWorkouts[date]) {
      groupedWorkouts[date] = [];
    }
    groupedWorkouts[date].push(workout);
  });

  const dates = Object.keys(groupedWorkouts).sort((a, b) => b.localeCompare(a));

  if (workouts.length === 0) {
    return (
      <HealthCard className="py-12 text-center">
        <div className="w-14 h-14 rounded-full bg-white/5 mx-auto mb-4 flex items-center justify-center">
          <span className="text-2xl">💪</span>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">
          No workouts yet
        </h3>
        <p className="text-[#9da6b9] mb-4">
          Start logging your workouts to track your progress!
        </p>
        <Link
          href="/workouts/new"
          className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/15 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Log Your First Workout
        </Link>
      </HealthCard>
    );
  }

  return (
    <div className="space-y-6">
      {dates.map((date) => (
        <div key={date}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-slate-500 text-sm">📅</span>
            <h2 className="font-semibold text-white text-sm">
              {format(new Date(date), "EEEE, MMMM d, yyyy")}
            </h2>
          </div>

          <div className="space-y-3">
            {groupedWorkouts[date].map((workout) => (
              <HealthCard key={workout.id}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg text-white">
                      {workout.name}
                    </h3>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-sm text-slate-500 flex items-center gap-1">
                        ⏱
                        {workout.duration_minutes
                          ? ` ${workout.duration_minutes} min`
                          : " No duration"}
                      </span>
                      <span className="text-sm text-slate-500">
                        {workout.exercises.length} exercise
                        {workout.exercises.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                  <span className="text-sm text-slate-500">
                    {format(new Date(workout.created_at), "h:mm a")}
                  </span>
                </div>

                {workout.notes && (
                  <p className="text-sm text-[#9da6b9] mb-4 italic">
                    {workout.notes}
                  </p>
                )}

                {workout.exercises.length > 0 && (
                  <div className="space-y-2">
                    {workout.exercises.map((exercise) => (
                      <div
                        key={exercise.id}
                        className="flex items-start justify-between p-3 rounded-lg bg-white/[0.03]"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-white text-sm">
                              {exercise.exercise_name}
                            </p>
                            {exercise.is_pr && (
                              <span className="px-2 py-0.5 text-xs font-semibold bg-[#c8b86e]/20 text-[#c8b86e] rounded-full">
                                PR
                              </span>
                            )}
                          </div>
                          {exercise.notes && (
                            <p className="text-xs text-slate-500 mt-1">
                              {exercise.notes}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-white">
                            {exercise.sets} × {exercise.reps || "-"} reps
                          </p>
                          {exercise.weight && exercise.weight > 0 && (
                            <p className="text-xs text-slate-500">
                              {exercise.weight} {exercise.weight_unit}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </HealthCard>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function WorkoutListSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2].map((group) => (
        <div key={group} className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-white/[0.06] animate-shimmer" />
            <div className="h-4 w-48 rounded bg-white/[0.06] animate-shimmer" />
          </div>
          {[1, 2].map((card) => (
            <div
              key={card}
              className="rounded-xl bg-[#1c1f27] border border-white/[0.06] p-5 space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="h-5 w-36 rounded bg-white/[0.06] animate-shimmer" />
                  <div className="flex items-center gap-4 mt-1">
                    <div className="h-3.5 w-20 rounded bg-white/[0.06] animate-shimmer" />
                    <div className="h-3.5 w-24 rounded bg-white/[0.06] animate-shimmer" />
                  </div>
                </div>
                <div className="h-3.5 w-16 rounded bg-white/[0.06] animate-shimmer" />
              </div>
              <div className="space-y-2">
                {[1, 2, 3].map((exercise) => (
                  <div
                    key={exercise}
                    className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03]"
                  >
                    <div className="h-3.5 w-28 rounded bg-white/[0.06] animate-shimmer" />
                    <div className="h-3.5 w-20 rounded bg-white/[0.06] animate-shimmer" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default async function WorkoutsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="p-6 lg:p-10 space-y-6 max-w-7xl mx-auto">
      {/* Header — renders immediately */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Workouts
          </h1>
          <p className="text-[#9da6b9] mt-1">
            Track your progress and review past sessions
          </p>
        </div>
        <Link
          href="/workouts/new"
          className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/15 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Log Workout
        </Link>
      </div>

      {/* Stats — streamed independently */}
      <Suspense fallback={<WorkoutStatsSkeleton />}>
        <WorkoutStats userId={user.id} />
      </Suspense>

      {/* Workout List — streamed independently */}
      <Suspense fallback={<WorkoutListSkeleton />}>
        <WorkoutList userId={user.id} />
      </Suspense>
    </div>
  );
}
