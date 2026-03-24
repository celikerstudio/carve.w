"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface Exercise {
  id: string;
  exercise_name: string;
  sets: number;
  reps: number;
  weight: number;
  weight_unit: string;
  notes: string;
}

export default function NewWorkoutPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [xpAwarded, setXpAwarded] = useState<number | null>(null);

  const [workoutName, setWorkoutName] = useState("");
  const [duration, setDuration] = useState("");
  const [workoutNotes, setWorkoutNotes] = useState("");

  const [exercises, setExercises] = useState<Exercise[]>([
    {
      id: crypto.randomUUID(),
      exercise_name: "",
      sets: 1,
      reps: 10,
      weight: 0,
      weight_unit: "lbs",
      notes: "",
    },
  ]);

  const addExercise = () => {
    setExercises([
      ...exercises,
      {
        id: crypto.randomUUID(),
        exercise_name: "",
        sets: 1,
        reps: 10,
        weight: 0,
        weight_unit: "lbs",
        notes: "",
      },
    ]);
  };

  const removeExercise = (id: string) => {
    if (exercises.length > 1) {
      setExercises(exercises.filter((ex) => ex.id !== id));
    }
  };

  const updateExercise = (id: string, field: keyof Exercise, value: any) => {
    setExercises(
      exercises.map((ex) =>
        ex.id === id ? { ...ex, [field]: value } : ex
      )
    );
  };

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

      const { data: workout, error: workoutError } = await supabase
        .from("workouts")
        .insert({
          user_id: user.id,
          name: workoutName,
          notes: workoutNotes || null,
          duration_minutes: duration ? parseInt(duration) : null,
        })
        .select()
        .single();

      if (workoutError) throw workoutError;

      const exercisesToInsert = exercises
        .filter((ex) => ex.exercise_name.trim() !== "")
        .map((ex, index) => ({
          workout_id: workout.id,
          exercise_name: ex.exercise_name,
          sets: ex.sets,
          reps: ex.reps || null,
          weight: ex.weight || null,
          weight_unit: ex.weight_unit,
          order_index: index,
          notes: ex.notes || null,
        }));

      if (exercisesToInsert.length > 0) {
        const { error: exercisesError } = await supabase
          .from("exercises")
          .insert(exercisesToInsert);

        if (exercisesError) throw exercisesError;
      }

      setXpAwarded(50);

      setTimeout(() => {
        router.push("/workouts");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to save workout");
      setLoading(false);
    }
  };

  if (xpAwarded !== null) {
    return (
      <div className="p-6 lg:p-10 max-w-2xl mx-auto">
        <div className="rounded-xl bg-[#1c1f27] border border-white/[0.06] p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">💪</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Workout Logged!</h2>
          <p className="text-[#9da6b9] mb-4">
            You earned {xpAwarded} XP for completing this workout!
          </p>
          <p className="text-sm text-slate-500">
            Redirecting to workout history...
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
          Log Workout
        </h1>
        <p className="text-[#9da6b9] mt-1">
          Track your training and earn XP!
        </p>
      </div>

      {error && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Workout Details */}
        <div className="rounded-xl bg-[#1c1f27] border border-white/[0.06] p-5 space-y-4">
          <h2 className="text-sm font-semibold text-white">Workout Details</h2>
          <div>
            <Label htmlFor="workoutName" className="text-slate-400 text-xs">Workout Name *</Label>
            <Input
              id="workoutName"
              placeholder="e.g., Upper Body Day, Leg Day"
              value={workoutName}
              onChange={(e) => setWorkoutName(e.target.value)}
              required
              className="mt-1 bg-white/5 border-white/[0.06] text-white placeholder:text-slate-600"
            />
          </div>
          <div>
            <Label htmlFor="duration" className="text-slate-400 text-xs">Duration (minutes)</Label>
            <Input
              id="duration"
              type="number"
              min="1"
              placeholder="60"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="mt-1 bg-white/5 border-white/[0.06] text-white placeholder:text-slate-600"
            />
          </div>
          <div>
            <Label htmlFor="notes" className="text-slate-400 text-xs">Notes</Label>
            <Textarea
              id="notes"
              placeholder="How did you feel? Any observations?"
              rows={3}
              value={workoutNotes}
              onChange={(e) => setWorkoutNotes(e.target.value)}
              className="mt-1 bg-white/5 border-white/[0.06] text-white placeholder:text-slate-600"
            />
          </div>
        </div>

        {/* Exercises */}
        <div className="rounded-xl bg-[#1c1f27] border border-white/[0.06] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Exercises</h2>
            <button
              type="button"
              onClick={addExercise}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Add Exercise
            </button>
          </div>

          <div className="space-y-4">
            {exercises.map((exercise, index) => (
              <div
                key={exercise.id}
                className="p-4 rounded-lg border border-white/[0.06] bg-white/[0.02] space-y-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-xs text-slate-500">
                    Exercise {index + 1}
                  </span>
                  {exercises.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeExercise(exercise.id)}
                      className="text-slate-500 hover:text-red-400 transition-colors"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>

                <div>
                  <Label htmlFor={`exercise-name-${exercise.id}`} className="text-slate-400 text-xs">
                    Exercise Name
                  </Label>
                  <Input
                    id={`exercise-name-${exercise.id}`}
                    placeholder="e.g., Bench Press, Squat"
                    value={exercise.exercise_name}
                    onChange={(e) =>
                      updateExercise(exercise.id, "exercise_name", e.target.value)
                    }
                    className="mt-1 bg-white/5 border-white/[0.06] text-white placeholder:text-slate-600"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label htmlFor={`sets-${exercise.id}`} className="text-slate-400 text-xs">Sets</Label>
                    <Input
                      id={`sets-${exercise.id}`}
                      type="number"
                      min="1"
                      value={exercise.sets}
                      onChange={(e) =>
                        updateExercise(exercise.id, "sets", parseInt(e.target.value))
                      }
                      className="mt-1 bg-white/5 border-white/[0.06] text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`reps-${exercise.id}`} className="text-slate-400 text-xs">Reps</Label>
                    <Input
                      id={`reps-${exercise.id}`}
                      type="number"
                      min="1"
                      value={exercise.reps}
                      onChange={(e) =>
                        updateExercise(exercise.id, "reps", parseInt(e.target.value))
                      }
                      className="mt-1 bg-white/5 border-white/[0.06] text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`weight-${exercise.id}`} className="text-slate-400 text-xs">
                      Weight ({exercise.weight_unit})
                    </Label>
                    <Input
                      id={`weight-${exercise.id}`}
                      type="number"
                      min="0"
                      step="0.5"
                      value={exercise.weight}
                      onChange={(e) =>
                        updateExercise(exercise.id, "weight", parseFloat(e.target.value))
                      }
                      className="mt-1 bg-white/5 border-white/[0.06] text-white"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor={`exercise-notes-${exercise.id}`} className="text-slate-400 text-xs">
                    Notes (optional)
                  </Label>
                  <Input
                    id={`exercise-notes-${exercise.id}`}
                    placeholder="Form notes, difficulty, etc."
                    value={exercise.notes}
                    onChange={(e) =>
                      updateExercise(exercise.id, "notes", e.target.value)
                    }
                    className="mt-1 bg-white/5 border-white/[0.06] text-white placeholder:text-slate-600"
                  />
                </div>
              </div>
            ))}
          </div>
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
            {loading ? "Saving..." : "Log Workout & Earn XP"}
          </button>
        </div>
      </form>
    </div>
  );
}
