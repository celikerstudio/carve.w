'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

interface LeaderboardUser {
  id: string;
  username: string;
  display_name: string;
  avatar_image_url: string | null;
  total_xp: number;
  level: number;
  workout_count: number;
  rank: number;
}

type LeaderboardType = 'xp' | 'level' | 'workouts';

const TABS: { value: LeaderboardType; label: string; icon: string }[] = [
  { value: 'xp', label: 'Total XP', icon: '📊' },
  { value: 'level', label: 'Level', icon: '⚡' },
  { value: 'workouts', label: 'Workouts', icon: '💪' },
];

function getRankStyle(rank: number): string {
  switch (rank) {
    case 1:
      return 'bg-health/20 text-health border-health/30';
    case 2:
      return 'bg-slate-400/20 text-slate-300 border-slate-400/30';
    case 3:
      return 'bg-amber-700/20 text-amber-500 border-amber-700/30';
    default:
      return 'bg-white/5 text-slate-400 border-subtle';
  }
}

function getAvatarPlaceholder(displayName: string): string {
  return displayName
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function HiscoresPage() {
  const [leaderboardType, setLeaderboardType] = useState<LeaderboardType>('xp');
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      setLoading(true);
      const supabase = createClient();

      const { data, error } = await supabase.rpc('get_top_users', {
        limit_count: 100,
        leaderboard_type: leaderboardType,
      });

      if (error) {
        console.error('Error fetching leaderboard:', error);
        setUsers([]);
      } else {
        setUsers(data || []);
      }

      setLoading(false);
    }

    fetchLeaderboard();
  }, [leaderboardType]);

  return (
    <div className="min-h-screen bg-surface py-12 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center gap-3 mb-4">
            <span className="text-4xl">🏆</span>
            <h1 className="text-5xl font-bold text-white tracking-tight">
              Hiscores
            </h1>
          </div>
          <p className="text-lg text-ink-secondary">
            See where you rank among the Carve community
          </p>
        </div>

        {/* Tabs */}
        <div className="rounded-xl bg-surface-raised border border-subtle p-1.5 flex gap-1.5">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setLeaderboardType(tab.value)}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 text-sm ${
                leaderboardType === tab.value
                  ? 'bg-white/10 text-white'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.03]'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Leaderboard */}
        <div className="rounded-xl bg-surface-raised border border-subtle overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-2 border-white/10 border-t-white/50 mb-4" />
              <p className="text-slate-500">Loading leaderboard...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center">
              <span className="text-5xl block mb-4">🏆</span>
              <h3 className="text-xl font-bold text-white mb-2">
                No Players Yet
              </h3>
              <p className="text-ink-secondary">
                Be the first to join and claim the top spot!
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {users.map((user) => (
                <div
                  key={user.id}
                  className={`flex items-center gap-4 p-4 transition-colors ${
                    user.rank <= 3
                      ? 'bg-health/[0.03]'
                      : 'hover:bg-white/[0.02]'
                  }`}
                >
                  {/* Rank Badge */}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 border ${getRankStyle(
                      user.rank
                    )}`}
                  >
                    {user.rank}
                  </div>

                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {user.avatar_image_url ? (
                      <img
                        src={user.avatar_image_url}
                        alt={user.display_name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      getAvatarPlaceholder(user.display_name)
                    )}
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white truncate">
                      {user.display_name}
                    </h3>
                    <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
                      <span className="flex items-center gap-1">
                        ⚡ Level {user.level}
                      </span>
                      <span className="flex items-center gap-1">
                        💪 {user.workout_count} workouts
                      </span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="text-right flex-shrink-0">
                    <div className="font-bold text-xl text-white">
                      {leaderboardType === 'xp' && user.total_xp.toLocaleString()}
                      {leaderboardType === 'level' && user.level}
                      {leaderboardType === 'workouts' && user.workout_count}
                    </div>
                    <div className="text-xs text-slate-500 uppercase tracking-wider">
                      {leaderboardType === 'xp' && 'XP'}
                      {leaderboardType === 'level' && 'Level'}
                      {leaderboardType === 'workouts' && 'Workouts'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="rounded-xl bg-surface-raised border border-subtle p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">
            Want to compete?
          </h2>
          <p className="text-ink-secondary mb-6">
            Join the waitlist to track your workouts, earn XP, and climb the leaderboard.
          </p>
          <a
            href="/#waitlist"
            className="inline-block rounded-lg bg-white/10 px-8 py-3 font-medium text-white hover:bg-white/15 transition-colors"
          >
            Join Waitlist
          </a>
        </div>
      </div>
    </div>
  );
}
