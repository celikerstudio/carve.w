"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const MEAL_TYPES = [
  { value: "breakfast", label: "Breakfast", icon: "☀️" },
  { value: "lunch", label: "Lunch", icon: "🌞" },
  { value: "dinner", label: "Dinner", icon: "🌙" },
  { value: "snack", label: "Snack", icon: "🍎" },
];

export default function NewMealPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [xpAwarded, setXpAwarded] = useState<number | null>(null);

  const [mealType, setMealType] = useState("breakfast");
  const [mealName, setMealName] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error: mealError } = await supabase.from("meals").insert({
        user_id: user.id,
        meal_type: mealType,
        name: mealName || null,
        calories: calories ? parseInt(calories) : null,
        protein: protein ? parseFloat(protein) : null,
        carbs: carbs ? parseFloat(carbs) : null,
        fat: fat ? parseFloat(fat) : null,
        notes: notes || null,
      });

      if (mealError) throw mealError;

      setXpAwarded(10);

      setTimeout(() => {
        router.push("/food");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to save meal");
      setLoading(false);
    }
  };

  if (xpAwarded !== null) {
    return (
      <div className="p-6 lg:p-10 max-w-2xl mx-auto">
        <div className="rounded-xl bg-[#1c1f27] border border-white/[0.06] p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🍽</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Meal Logged!</h2>
          <p className="text-[#9da6b9] mb-4">
            You earned {xpAwarded} XP for tracking your nutrition!
          </p>
          <p className="text-sm text-slate-500">
            Redirecting to nutrition history...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-4"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Log Meal
        </h1>
        <p className="text-[#9da6b9] mt-1">
          Track your nutrition and earn XP!
        </p>
      </div>

      {error && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Meal Type */}
        <div className="rounded-xl bg-[#1c1f27] border border-white/[0.06] p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Meal Type</h2>
          <div className="grid grid-cols-2 gap-3">
            {MEAL_TYPES.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setMealType(type.value)}
                className={`p-3 rounded-lg border-2 transition-all text-sm flex items-center gap-2 ${
                  mealType === type.value
                    ? "border-emerald-400/50 bg-emerald-400/5 text-white font-semibold"
                    : "border-white/[0.06] text-slate-400 hover:border-white/[0.15]"
                }`}
              >
                <span>{type.icon}</span>
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Meal Details */}
        <div className="rounded-xl bg-[#1c1f27] border border-white/[0.06] p-5 space-y-4">
          <h2 className="text-sm font-semibold text-white">Meal Details</h2>
          <div>
            <Label htmlFor="mealName" className="text-slate-400 text-xs">Meal Name (optional)</Label>
            <Input
              id="mealName"
              placeholder="e.g., Chicken Salad, Protein Shake"
              value={mealName}
              onChange={(e) => setMealName(e.target.value)}
              className="mt-1 bg-white/5 border-white/[0.06] text-white placeholder:text-slate-600"
            />
          </div>
          <div>
            <Label htmlFor="calories" className="text-slate-400 text-xs">Calories (optional)</Label>
            <Input
              id="calories"
              type="number"
              min="0"
              placeholder="500"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              className="mt-1 bg-white/5 border-white/[0.06] text-white placeholder:text-slate-600"
            />
          </div>
        </div>

        {/* Macros */}
        <div className="rounded-xl bg-[#1c1f27] border border-white/[0.06] p-5 space-y-4">
          <h2 className="text-sm font-semibold text-white">Macros (grams, optional)</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="protein" className="text-slate-400 text-xs">Protein</Label>
              <Input
                id="protein"
                type="number"
                min="0"
                step="0.1"
                placeholder="30"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
                className="mt-1 bg-white/5 border-white/[0.06] text-white placeholder:text-slate-600"
              />
            </div>
            <div>
              <Label htmlFor="carbs" className="text-slate-400 text-xs">Carbs</Label>
              <Input
                id="carbs"
                type="number"
                min="0"
                step="0.1"
                placeholder="45"
                value={carbs}
                onChange={(e) => setCarbs(e.target.value)}
                className="mt-1 bg-white/5 border-white/[0.06] text-white placeholder:text-slate-600"
              />
            </div>
            <div>
              <Label htmlFor="fat" className="text-slate-400 text-xs">Fat</Label>
              <Input
                id="fat"
                type="number"
                min="0"
                step="0.1"
                placeholder="15"
                value={fat}
                onChange={(e) => setFat(e.target.value)}
                className="mt-1 bg-white/5 border-white/[0.06] text-white placeholder:text-slate-600"
              />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="rounded-xl bg-[#1c1f27] border border-white/[0.06] p-5 space-y-4">
          <h2 className="text-sm font-semibold text-white">Notes (optional)</h2>
          <Textarea
            placeholder="How did you feel? Any observations?"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="bg-white/5 border-white/[0.06] text-white placeholder:text-slate-600"
          />
        </div>

        {/* Submit */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            disabled={loading}
            className="rounded-lg border border-white/[0.06] px-4 py-2.5 text-sm text-slate-400 hover:text-white hover:border-white/[0.15] transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 rounded-lg bg-white/10 px-4 py-2.5 text-sm font-medium text-white hover:bg-white/15 transition-colors disabled:opacity-50"
          >
            {loading ? "Saving..." : "Log Meal & Earn XP"}
          </button>
        </div>
      </form>
    </div>
  );
}
