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

export default async function FoodPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const meals = await getMeals(user.id);
  const stats = await getNutritionStats(user.id);

  // Group meals by date
  const groupedMeals: { [key: string]: Meal[] } = {};
  meals.forEach((meal) => {
    const date = format(new Date(meal.created_at), "yyyy-MM-dd");
    if (!groupedMeals[date]) {
      groupedMeals[date] = [];
    }
    groupedMeals[date].push(meal);
  });

  const dates = Object.keys(groupedMeals).sort((a, b) => b.localeCompare(a));

  // Calculate daily totals
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

  return (
    <div className="p-6 lg:p-10 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
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
          href="/dashboard/food/new"
          className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/15 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Log Meal
        </Link>
      </div>

      {/* Stats */}
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

      {/* Meal List */}
      {meals.length === 0 ? (
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
            href="/dashboard/food/new"
            className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/15 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Log Your First Meal
          </Link>
        </HealthCard>
      ) : (
        <div className="space-y-6">
          {dates.map((date) => (
            <div key={date}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-slate-500 text-sm">📅</span>
                <h2 className="font-semibold text-white text-sm">
                  {format(new Date(date), "EEEE, MMMM d, yyyy")}
                </h2>
              </div>

              {/* Daily Totals */}
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

              {/* Individual Meals */}
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
      )}
    </div>
  );
}
