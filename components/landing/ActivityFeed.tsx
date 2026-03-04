import { createClient } from '@/lib/supabase/server';
import { TrendingUp, Dumbbell, Award, Target, Clock } from 'lucide-react';

interface Activity {
  username: string;
  display_name: string;
  avatar_image_url: string | null;
  activity_type: string;
  activity_text: string;
  xp_earned: number;
  created_at: string;
}

async function getRecentActivity(): Promise<Activity[]> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc('get_recent_activity', {
    limit_count: 10,
  });

  if (error) {
    console.error('Error fetching recent activity:', error);
    return [];
  }

  return data || [];
}

function getActivityIcon(activityType: string) {
  switch (activityType) {
    case 'workout':
      return <Dumbbell className="w-4 h-4" />;
    case 'pr':
      return <Target className="w-4 h-4" />;
    case 'achievement':
      return <Award className="w-4 h-4" />;
    case 'level_up':
      return <TrendingUp className="w-4 h-4" />;
    default:
      return <Clock className="w-4 h-4" />;
  }
}

function getTimeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return `${Math.floor(seconds / 604800)}w ago`;
}

function getAvatarPlaceholder(displayName: string): string {
  return displayName
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export async function ActivityFeed() {
  const activities = await getRecentActivity();

  if (activities.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <Clock className="w-12 h-12 text-ink-muted mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-ink mb-2">Activity Feed</h3>
        <p className="text-ink-secondary text-sm">
          No recent activity yet. Be the first!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-white" />
          <h3 className="text-lg font-bold text-white">Live Activity</h3>
        </div>
        <p className="text-blue-100 text-xs mt-1">See what others are achieving</p>
      </div>

      {/* Activity List */}
      <div className="divide-y divide-subtle max-h-[500px] overflow-y-auto">
        {activities.map((activity, index) => (
          <div
            key={`${activity.username}-${activity.created_at}-${index}`}
            className="p-3 hover:bg-surface transition-colors"
          >
            <div className="flex items-start gap-3">
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                {activity.avatar_image_url ? (
                  <img
                    src={activity.avatar_image_url}
                    alt={activity.display_name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  getAvatarPlaceholder(activity.display_name)
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-sm text-ink">
                      <span className="font-semibold">{activity.display_name}</span>{' '}
                      <span className="text-ink-secondary">{activity.activity_text}</span>
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-ink-secondary flex items-center gap-1">
                        {getActivityIcon(activity.activity_type)}
                        <span className="capitalize">{activity.activity_type.replace('_', ' ')}</span>
                      </span>
                      {activity.xp_earned > 0 && (
                        <>
                          <span className="text-xs text-ink-tertiary">•</span>
                          <span className="text-xs font-semibold text-green-600">
                            +{activity.xp_earned} XP
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-ink-tertiary flex-shrink-0">
                    {getTimeAgo(activity.created_at)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="bg-surface p-3 border-t border-subtle text-center">
        <p className="text-xs text-ink-secondary">
          Join the waitlist to track your own progress
        </p>
      </div>
    </div>
  );
}
