import { getDemoData } from '@/lib/demo/sample-data';
import { DemoBanner } from '@/components/dashboard/DemoBanner';
import { Dumbbell, Apple, Trophy, TrendingUp, Flame } from 'lucide-react';

export const metadata = {
  title: 'Demo Dashboard - Carve',
  description: 'Try out the Carve fitness tracking experience with sample data',
  robots: 'noindex', // Don't index demo page
};

export default function DemoPage() {
  const data = getDemoData();

  return (
    <div className="min-h-screen bg-surface">
      <DemoBanner />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-lg p-6 mb-6 shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {data.profile.username.charAt(0)}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-ink">{data.profile.username}</h1>
                <p className="text-ink-secondary">Level {data.profile.level} • {data.profile.total_xp.toLocaleString()} XP</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-orange-600">
                <Flame className="w-5 h-5" />
                <span className="text-2xl font-bold">{data.stats.current_streak}</span>
              </div>
              <p className="text-sm text-ink-secondary">Day Streak</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow">
            <div className="flex items-center gap-2 text-blue-600 mb-2">
              <Dumbbell className="w-5 h-5" />
              <h3 className="font-semibold">Workouts</h3>
            </div>
            <p className="text-3xl font-bold text-ink">{data.stats.workouts_count}</p>
            <p className="text-sm text-ink-secondary">Total logged</p>
          </div>

          <div className="bg-white rounded-lg p-4 shadow">
            <div className="flex items-center gap-2 text-green-600 mb-2">
              <Apple className="w-5 h-5" />
              <h3 className="font-semibold">Meals</h3>
            </div>
            <p className="text-3xl font-bold text-ink">{data.stats.meals_count}</p>
            <p className="text-sm text-ink-secondary">Total logged</p>
          </div>

          <div className="bg-white rounded-lg p-4 shadow">
            <div className="flex items-center gap-2 text-purple-600 mb-2">
              <Trophy className="w-5 h-5" />
              <h3 className="font-semibold">PRs</h3>
            </div>
            <p className="text-3xl font-bold text-ink">{data.stats.prs_this_month}</p>
            <p className="text-sm text-ink-secondary">This month</p>
          </div>

          <div className="bg-white rounded-lg p-4 shadow">
            <div className="flex items-center gap-2 text-orange-600 mb-2">
              <TrendingUp className="w-5 h-5" />
              <h3 className="font-semibold">Best Streak</h3>
            </div>
            <p className="text-3xl font-bold text-ink">{data.stats.max_streak}</p>
            <p className="text-sm text-ink-secondary">Days</p>
          </div>
        </div>

        {/* Recent Workouts */}
        <div className="bg-white rounded-lg p-6 mb-6 shadow">
          <h2 className="text-xl font-bold text-ink mb-4">Recent Workouts</h2>
          <div className="space-y-4">
            {data.recentWorkouts.map((workout) => (
              <div key={workout.id} className="border-l-4 border-blue-500 pl-4 py-2">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-ink">{workout.name}</h3>
                  <span className="text-sm text-ink-secondary">{workout.date}</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-ink-secondary">
                  <span>{workout.duration_minutes} min</span>
                  <span>•</span>
                  <span>{workout.total_volume.toLocaleString()} lbs total</span>
                  <span>•</span>
                  <span className="text-blue-600 font-semibold">+{workout.xp_earned} XP</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {workout.exercises.map((exercise, idx) => (
                    <span key={idx} className="text-xs bg-surface px-2 py-1 rounded">
                      {exercise.name} {exercise.sets}×{exercise.reps}
                      {exercise.weight > 0 && ` @ ${exercise.weight}${exercise.unit}`}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-white rounded-lg p-6 mb-6 shadow">
          <h2 className="text-xl font-bold text-ink mb-4">Achievements</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {data.achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`text-center p-4 rounded-lg border ${
                  achievement.unlocked
                    ? 'bg-yellow-50 border-yellow-200'
                    : 'bg-surface border-subtle opacity-50'
                }`}
              >
                <div className="text-4xl mb-2">{achievement.icon}</div>
                <p className="text-xs font-semibold text-ink">{achievement.name}</p>
                <p className="text-xs text-ink-secondary mt-1">{achievement.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Personal Records */}
        <div className="bg-white rounded-lg p-6 shadow">
          <h2 className="text-xl font-bold text-ink mb-4">Personal Records</h2>
          <div className="space-y-3">
            {data.personalRecords.map((pr, idx) => (
              <div key={idx} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="font-semibold text-ink">{pr.exercise}</p>
                  <p className="text-sm text-ink-secondary">{pr.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-blue-600">
                    {pr.reps ? `${pr.reps} reps` : `${pr.weight} ${pr.unit}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-8 text-center text-white shadow-lg">
          <h2 className="text-2xl font-bold mb-2">Ready to Track Your Progress?</h2>
          <p className="mb-6 text-blue-100">Join the waitlist to start tracking your real workouts and nutrition</p>
          <a
            href="/"
            className="inline-block bg-white text-blue-600 font-semibold px-8 py-3 rounded-lg hover:bg-blue-50 transition-colors"
          >
            Join Waitlist
          </a>
        </div>
      </div>
    </div>
  );
}
