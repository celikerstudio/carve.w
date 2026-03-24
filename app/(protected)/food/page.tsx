import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { HealthCard } from "@/components/dashboard/shared";

interface Meal {
  id: string;
  meal_type: "breakfast" | "lunch" | "dinner" | "snack";
  name: string | null;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  notes: string | null;
  created_at: string;
}

async function getMeals(userId: string): Promise<Meal[]> {
  const supabase = await createClient();

  const { data: meals, error } = await supabase
    .from("meals")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching meals:", error);
    return [];
  }

  return meals || [];
}

async function getNutritionStats(userId: string) {
  const supabase = await createClient();

  const { data: stats } = await supabase
    .from("user_stats")
    .select("total_meals_logged")
    .eq("user_id", userId)
    .single();

  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const { count: weekCount } = await supabase
    .from("meals")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", startOfWeek.toISOString());

  return {
    total: stats?.total_meals_logged || 0,
    thisWeek: weekCount || 0,
  };
}

const MEAL_TYPE_LABELS: Record<string, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack: "Snack",
};

const MEAL_TYPE_ICONS: Record<string, string> = {
  breakfast: "☀️",
  lunch: "🌞",
  dinner: "🌙",
  snack: "🍎",
};

async function NutritionStats({ userId }: { userId: string }) {
  const stats = await getNutritionStats(userId);

  return (
    <div className="grid grid-cols-2 gap-4">
      <HealthCard>
        <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">
          Total Meals
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

function NutritionStatsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4">
      {[1, 2].map((i) => (
        <div key={i} className="rounded-xl bg-[#1c1f27] border border-white/[0.06] p-5">
          <div className="h-3 w-20 rounded bg-white/[0.06] animate-shimmer mb-1" />
          <div className="h-9 w-12 rounded bg-white/[0.06] animate-shimmer" />
        </div>
      ))}
    </div>
  );
}

async function MealList({ userId }: { userId: string }) {
  const meals = await getMeals(userId);

  const groupedMeals: { [key: string]: Meal[] } = {};
  meals.forEach((meal) => {
    const date = format(new Date(meal.created_at), "yyyy-MM-dd");
    if (!groupedMeals[date]) {
      groupedMeals[date] = [];
    }
    groupedMeals[date].push(meal);
  });

  const dates = Object.keys(groupedMeals).sort((a, b) => b.localeCompare(a));

  const dailyTotals: {
    [key: string]: { calories: number; protein: number; carbs: number; fat: number };
  } = {};
  dates.forEach((date) => {
    const dayMeals = groupedMeals[date];
    dailyTotals[date] = dayMeals.reduce(
      (acc, meal) => ({
        calories: acc.calories + (meal.calories || 0),
        protein: acc.protein + (meal.protein || 0),
        carbs: acc.carbs + (meal.carbs || 0),
        fat: acc.fat + (meal.fat || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  });

  if (meals.length === 0) {
    return (
      <HealthCard className="py-12 text-center">
        <div className="w-14 h-14 rounded-full bg-white/5 mx-auto mb-4 flex items-center justify-center">
          <span className="text-2xl">🍽</span>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">
          No meals logged yet
        </h3>
        <p className="text-[#9da6b9] mb-4">
          Start tracking your nutrition to monitor your progress!
        </p>
        <Link
          href="/food/new"
          className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/15 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Log Your First Meal
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

          <HealthCard className="mb-3 bg-emerald-500/5 border-emerald-500/10">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm text-white">Daily Totals</span>
              <div className="flex gap-5 text-sm">
                <div className="flex items-center gap-1">
                  <span className="text-orange-400 text-xs">🔥</span>
                  <span className="font-semibold text-white">
                    {Math.round(dailyTotals[date].calories)}
                  </span>
                  <span className="text-slate-500">cal</span>
                </div>
                {dailyTotals[date].protein > 0 && (
                  <div className="text-slate-500">
                    <span className="font-semibold text-white">
                      {Math.round(dailyTotals[date].protein)}g
                    </span>{" "}
                    P
                  </div>
                )}
                {dailyTotals[date].carbs > 0 && (
                  <div className="text-slate-500">
                    <span className="font-semibold text-white">
                      {Math.round(dailyTotals[date].carbs)}g
                    </span>{" "}
                    C
                  </div>
                )}
                {dailyTotals[date].fat > 0 && (
                  <div className="text-slate-500">
                    <span className="font-semibold text-white">
                      {Math.round(dailyTotals[date].fat)}g
                    </span>{" "}
                    F
                  </div>
                )}
              </div>
            </div>
          </HealthCard>

          <div className="space-y-3">
            {groupedMeals[date].map((meal) => (
              <HealthCard key={meal.id}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">
                        {MEAL_TYPE_ICONS[meal.meal_type]}
                      </span>
                      <h3 className="font-semibold text-white">
                        {MEAL_TYPE_LABELS[meal.meal_type]}
                      </h3>
                      {meal.name && (
                        <span className="text-sm text-[#9da6b9]">
                          — {meal.name}
                        </span>
                      )}
                    </div>

                    {(meal.calories || meal.protein || meal.carbs || meal.fat) && (
                      <div className="flex gap-4 text-sm mb-2">
                        {meal.calories && (
                          <div className="flex items-center gap-1">
                            <span className="text-xs">🔥</span>
                            <span className="font-medium text-white">
                              {meal.calories}
                            </span>
                            <span className="text-slate-500">cal</span>
                          </div>
                        )}
                        {meal.protein && (
                          <div className="text-slate-500">
                            <span className="font-medium text-white">
                              {meal.protein}g
                            </span>{" "}
                            protein
                          </div>
                        )}
                        {meal.carbs && (
                          <div className="text-slate-500">
                            <span className="font-medium text-white">
                              {meal.carbs}g
                            </span>{" "}
                            carbs
                          </div>
                        )}
                        {meal.fat && (
                          <div className="text-slate-500">
                            <span className="font-medium text-white">
                              {meal.fat}g
                            </span>{" "}
                            fat
                          </div>
                        )}
                      </div>
                    )}

                    {meal.notes && (
                      <p className="text-sm text-[#9da6b9] italic">
                        {meal.notes}
                      </p>
                    )}
                  </div>

                  <span className="text-sm text-slate-500">
                    {format(new Date(meal.created_at), "h:mm a")}
                  </span>
                </div>
              </HealthCard>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function MealListSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2].map((group) => (
        <div key={group} className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-white/[0.06] animate-shimmer" />
            <div className="h-4 w-48 rounded bg-white/[0.06] animate-shimmer" />
          </div>
          <div className="rounded-xl bg-emerald-500/5 border border-emerald-500/10 p-5">
            <div className="flex items-center justify-between">
              <div className="h-3.5 w-24 rounded bg-white/[0.06] animate-shimmer" />
              <div className="flex gap-5">
                <div className="h-3.5 w-16 rounded bg-white/[0.06] animate-shimmer" />
                <div className="h-3.5 w-10 rounded bg-white/[0.06] animate-shimmer" />
              </div>
            </div>
          </div>
          {[1, 2].map((meal) => (
            <div key={meal} className="rounded-xl bg-[#1c1f27] border border-white/[0.06] p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-5 h-5 rounded bg-white/[0.06] animate-shimmer" />
                    <div className="h-4 w-20 rounded bg-white/[0.06] animate-shimmer" />
                  </div>
                  <div className="flex gap-4">
                    <div className="h-3.5 w-16 rounded bg-white/[0.06] animate-shimmer" />
                    <div className="h-3.5 w-20 rounded bg-white/[0.06] animate-shimmer" />
                  </div>
                </div>
                <div className="h-3.5 w-16 rounded bg-white/[0.06] animate-shimmer" />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default async function FoodPage() {
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
            Nutrition
          </h1>
          <p className="text-[#9da6b9] mt-1">
            Monitor your meals and macros
          </p>
        </div>
        <Link
          href="/food/new"
          className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/15 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Log Meal
        </Link>
      </div>

      {/* Stats — streamed independently */}
      <Suspense fallback={<NutritionStatsSkeleton />}>
        <NutritionStats userId={user.id} />
      </Suspense>

      {/* Meal List — streamed independently */}
      <Suspense fallback={<MealListSkeleton />}>
        <MealList userId={user.id} />
      </Suspense>
    </div>
  );
}
