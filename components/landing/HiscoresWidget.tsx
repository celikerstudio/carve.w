import { createClient } from '@/lib/supabase/server';
import { Trophy, TrendingUp, Zap } from 'lucide-react';
import Link from 'next/link';

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

async function getTopUsers(): Promise<LeaderboardUser[]> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc('get_top_users', {
    limit_count: 5,
    leaderboard_type: 'xp',
  });

  if (error) {
    console.error('Error fetching top users:', error);
    return [];
  }

  return data || [];
}

function getRankBadgeColor(rank: number): string {
  switch (rank) {
    case 1:
      return 'bg-yellow-500 text-white'; // Gold
    case 2:
      return 'bg-ink-tertiary text-white'; // Silver
    case 3:
      return 'bg-amber-700 text-white'; // Bronze
    default:
      return 'bg-surface text-ink';
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

export async function HiscoresWidget() {
  const topUsers = await getTopUsers();

  if (topUsers.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <Trophy className="w-12 h-12 text-ink-muted mx-auto mb-4" />
        <h2 className="text-xl font-bold text-ink mb-2">Leaderboard</h2>
        <p className="text-ink-secondary text-sm">
          Be the first to join and claim the top spot!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8 text-white" />
            <div>
              <h2 className="text-2xl font-bold text-white">Top Players</h2>
              <p className="text-yellow-100 text-sm">Real people, real progress</p>
            </div>
          </div>
          <TrendingUp className="w-6 h-6 text-white opacity-50" />
        </div>
      </div>

      {/* Leaderboard */}
      <div className="divide-y divide-subtle">
        {topUsers.map((user) => (
          <div
            key={user.id}
            className="flex items-center gap-4 p-4 hover:bg-surface transition-colors"
          >
            {/* Rank Badge */}
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0 ${getRankBadgeColor(
                user.rank
              )}`}
            >
              {user.rank}
            </div>

            {/* Avatar */}
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0">
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
              <h3 className="font-bold text-ink truncate">
                {user.display_name}
              </h3>
              <div className="flex items-center gap-3 text-xs text-ink-secondary mt-0.5">
                <span className="flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  Level {user.level}
                </span>
                <span>•</span>
                <span>{user.workout_count} workouts</span>
              </div>
            </div>

            {/* XP Badge */}
            <div className="text-right flex-shrink-0">
              <div className="font-bold text-lg text-blue-600">
                {user.total_xp.toLocaleString()}
              </div>
              <div className="text-xs text-ink-secondary">XP</div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="bg-surface p-4 border-t border-subtle">
        <Link
          href="/hiscores"
          className="block text-center text-blue-600 hover:text-blue-700 font-semibold text-sm transition-colors"
        >
          View Full Leaderboard →
        </Link>
      </div>
    </div>
  );
}
