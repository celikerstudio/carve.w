import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { HealthCard } from "@/components/dashboard/shared";

interface ActivityFeedItem {
  id: string;
  user_id: string;
  activity_type: "workout" | "pr" | "achievement" | "level_up" | "meal";
  activity_data: any;
  is_public: boolean;
  created_at: string;
  profile?: {
    username: string;
    display_name: string | null;
  };
}

async function getFriendActivityFeed(userId: string): Promise<ActivityFeedItem[]> {
  const supabase = await createClient();

  const { data: friendships } = await supabase
    .from("friendships")
    .select("user_id, friend_id")
    .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
    .eq("status", "accepted");

  if (!friendships || friendships.length === 0) {
    return [];
  }

  const friendIds = friendships.map((f) =>
    f.user_id === userId ? f.friend_id : f.user_id
  );

  const { data: activities, error } = await supabase
    .from("activity_feed")
    .select(
      `
      id,
      user_id,
      activity_type,
      activity_data,
      is_public,
      created_at,
      profile:profiles!activity_feed_user_id_fkey(username, display_name)
    `
    )
    .in("user_id", friendIds)
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("Error fetching activity feed:", error);
    return [];
  }

  return (activities || []).map((activity: any) => ({
    ...activity,
    profile: Array.isArray(activity.profile) ? activity.profile[0] : activity.profile,
  }));
}

const ACTIVITY_ICONS: Record<string, string> = {
  workout: "💪",
  pr: "🏆",
  achievement: "⭐",
  level_up: "⚡",
  meal: "🍽",
};

function getActivityDescription(activity: ActivityFeedItem): string {
  const { activity_type, activity_data } = activity;
  const username = activity.profile?.display_name || activity.profile?.username || "Someone";

  switch (activity_type) {
    case "workout":
      return `${username} completed a workout${
        activity_data.workout_name ? `: ${activity_data.workout_name}` : ""
      }`;
    case "pr":
      return `${username} set a new PR on ${activity_data.exercise_name}: ${activity_data.weight} ${activity_data.weight_unit}!`;
    case "achievement":
      return `${username} unlocked: ${activity_data.achievement_name}`;
    case "level_up":
      return `${username} leveled up to Level ${activity_data.new_level}!`;
    case "meal":
      return `${username} logged a ${activity_data.meal_type}`;
    default:
      return `${username} had an activity`;
  }
}

async function ActivityFeed({ userId }: { userId: string }) {
  const activities = await getFriendActivityFeed(userId);

  if (activities.length === 0) {
    return (
      <HealthCard className="py-12 text-center">
        <div className="w-14 h-14 rounded-full bg-white/5 mx-auto mb-4 flex items-center justify-center">
          <span className="text-2xl">👥</span>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">
          No activity yet
        </h3>
        <p className="text-[#9da6b9] mb-4">
          Add friends to see their fitness journey!
        </p>
        <Link
          href="/social/friends"
          className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/15 transition-colors"
        >
          Add Friends
        </Link>
      </HealthCard>
    );
  }

  return (
    <div className="space-y-3">
      {activities.map((activity) => (
        <HealthCard key={activity.id}>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0">
              <span className="text-lg">
                {ACTIVITY_ICONS[activity.activity_type] || "💪"}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm text-white mb-1">
                {getActivityDescription(activity)}
              </p>

              {activity.activity_data.xp_earned && (
                <span className="inline-flex text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-medium">
                  +{activity.activity_data.xp_earned} XP
                </span>
              )}

              <p className="text-xs text-slate-500 mt-2">
                {formatDistanceToNow(new Date(activity.created_at), {
                  addSuffix: true,
                })}
              </p>
            </div>
          </div>
        </HealthCard>
      ))}
    </div>
  );
}

function ActivityFeedSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="rounded-xl bg-[#1c1f27] border border-white/[0.06] p-5"
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-white/[0.06] animate-shimmer flex-shrink-0" />
            <div className="flex-1 min-w-0 space-y-2">
              <div className="h-3.5 w-3/4 rounded bg-white/[0.06] animate-shimmer" />
              {i % 2 === 0 && (
                <div className="h-5 w-14 rounded-full bg-emerald-500/10 animate-shimmer" />
              )}
              <div className="h-3 w-20 rounded bg-white/[0.06] animate-shimmer" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function SocialFeedPage() {
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
            Social Feed
          </h1>
          <p className="text-[#9da6b9] mt-1">
            See what your friends are up to
          </p>
        </div>
        <Link
          href="/social/friends"
          className="inline-flex items-center gap-2 rounded-lg border border-white/[0.06] px-4 py-2 text-sm text-slate-400 hover:text-white hover:border-white/[0.15] transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          Manage Friends
        </Link>
      </div>

      {/* Activity Feed — streamed */}
      <Suspense fallback={<ActivityFeedSkeleton />}>
        <ActivityFeed userId={user.id} />
      </Suspense>
    </div>
  );
}
