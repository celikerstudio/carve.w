import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { HealthCard } from "@/components/dashboard/shared";
import { FriendSearchForm } from "@/components/social/FriendSearchForm";
import { FriendRequestActions } from "@/components/social/FriendRequestActions";

interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
}

async function getFriends(userId: string) {
  const supabase = await createClient();

  const { data: friendships, error } = await supabase
    .from("friendships")
    .select(
      `
      id,
      status,
      created_at,
      user_id,
      friend_id,
      friend_profile:profiles!friendships_friend_id_fkey(id, username, display_name, avatar_url),
      requester_profile:profiles!friendships_user_id_fkey(id, username, display_name, avatar_url)
    `
    )
    .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
    .eq("status", "accepted")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching friends:", error);
    return [];
  }

  return (friendships || []).map((f: any) => ({
    ...f,
    friend_profile: f.user_id === userId ? f.friend_profile : f.requester_profile,
  }));
}

async function getPendingRequests(userId: string) {
  const supabase = await createClient();

  const { data: requests, error } = await supabase
    .from("friendships")
    .select(
      `
      id,
      status,
      created_at,
      user_id,
      friend_id,
      requester_profile:profiles!friendships_user_id_fkey(id, username, display_name, avatar_url)
    `
    )
    .eq("friend_id", userId)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching pending requests:", error);
    return [];
  }

  return requests || [];
}

async function getSentRequests(userId: string) {
  const supabase = await createClient();

  const { data: requests, error } = await supabase
    .from("friendships")
    .select(
      `
      id,
      status,
      created_at,
      user_id,
      friend_id,
      friend_profile:profiles!friendships_friend_id_fkey(id, username, display_name, avatar_url)
    `
    )
    .eq("user_id", userId)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching sent requests:", error);
    return [];
  }

  return requests || [];
}

export default async function FriendsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const friends = await getFriends(user.id);
  const pendingRequests = await getPendingRequests(user.id);
  const sentRequests = await getSentRequests(user.id);

  return (
    <div className="p-6 lg:p-10 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Friends
        </h1>
        <p className="text-[#9da6b9] mt-1">
          Connect with others and share your fitness journey
        </p>
      </div>

      {/* Search */}
      <HealthCard>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm">🔍</span>
          <h2 className="text-sm font-semibold text-white">Add Friends</h2>
        </div>
        <FriendSearchForm currentUserId={user.id} />
      </HealthCard>

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <HealthCard>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm">⏳</span>
            <h2 className="text-sm font-semibold text-white">
              Pending Requests ({pendingRequests.length})
            </h2>
          </div>
          <div className="space-y-3">
            {pendingRequests.map((request: any) => (
              <div
                key={request.id}
                className="flex items-center justify-between p-3 rounded-lg border border-white/[0.06] bg-white/[0.02]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white font-semibold text-sm">
                    {request.requester_profile.username?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">
                      {request.requester_profile.display_name ||
                        request.requester_profile.username}
                    </p>
                    <p className="text-xs text-slate-500">
                      @{request.requester_profile.username}
                    </p>
                  </div>
                </div>
                <FriendRequestActions friendshipId={request.id} />
              </div>
            ))}
          </div>
        </HealthCard>
      )}

      {/* Sent Requests */}
      {sentRequests.length > 0 && (
        <HealthCard>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm">📤</span>
            <h2 className="text-sm font-semibold text-white">
              Sent Requests ({sentRequests.length})
            </h2>
          </div>
          <div className="space-y-3">
            {sentRequests.map((request: any) => (
              <div
                key={request.id}
                className="flex items-center justify-between p-3 rounded-lg border border-white/[0.06] bg-white/[0.02]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white font-semibold text-sm">
                    {request.friend_profile.username?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">
                      {request.friend_profile.display_name ||
                        request.friend_profile.username}
                    </p>
                    <p className="text-xs text-slate-500">
                      @{request.friend_profile.username}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-slate-500">Pending</span>
              </div>
            ))}
          </div>
        </HealthCard>
      )}

      {/* Friends List */}
      <HealthCard>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm">👥</span>
          <h2 className="text-sm font-semibold text-white">
            My Friends ({friends.length})
          </h2>
        </div>

        {friends.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-14 h-14 rounded-full bg-white/5 mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
            <p className="text-[#9da6b9]">
              No friends yet. Search for users to add friends!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {friends.map((friendship: any) => (
              <div
                key={friendship.id}
                className="flex items-center justify-between p-3 rounded-lg border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white font-semibold text-sm">
                    {friendship.friend_profile?.username
                      ?.charAt(0)
                      .toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">
                      {friendship.friend_profile?.display_name ||
                        friendship.friend_profile?.username}
                    </p>
                    <p className="text-xs text-slate-500">
                      @{friendship.friend_profile?.username}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-emerald-400">Friends</span>
              </div>
            ))}
          </div>
        )}
      </HealthCard>
    </div>
  );
}
