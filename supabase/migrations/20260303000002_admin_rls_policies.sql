-- ===========================================
-- Admin RLS Policies
-- ===========================================

-- Helper function: check if current user is admin via user_roles join
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles p
    JOIN user_roles ur ON p.user_role_id = ur.id
    WHERE p.id = auth.uid() AND ur.name = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- completed_workouts: admin can read all
DROP POLICY IF EXISTS "Users can view their own completed workouts" ON completed_workouts;
CREATE POLICY "users_or_admin_select_completed_workouts" ON completed_workouts
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

-- meals: admin can read all, users manage own
DROP POLICY IF EXISTS "Users can manage their own meals" ON meals;
CREATE POLICY "users_or_admin_select_meals" ON meals
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());
CREATE POLICY "users_manage_own_meals" ON meals
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "users_update_own_meals" ON meals
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "users_delete_own_meals" ON meals
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- activity_feed: admin can read all (preserve existing friend/public logic)
DROP POLICY IF EXISTS "activity_feed_select_policy" ON activity_feed;
CREATE POLICY "users_or_admin_select_activity_feed" ON activity_feed
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR public.is_admin()
    OR user_id IN (
      SELECT friendships.addressee_id FROM friendships
      WHERE friendships.requester_id = auth.uid() AND friendships.status = 'accepted'
      UNION
      SELECT friendships.requester_id FROM friendships
      WHERE friendships.addressee_id = auth.uid() AND friendships.status = 'accepted'
    )
    OR user_id IN (SELECT id FROM profiles WHERE public_profile = true)
  );

-- user_stats: admin can read all
DROP POLICY IF EXISTS "Users can view their own stats" ON user_stats;
CREATE POLICY "users_or_admin_select_user_stats" ON user_stats
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

-- user_achievements: admin can read all
CREATE POLICY "admin_select_all_user_achievements" ON user_achievements
  FOR SELECT TO authenticated
  USING (public.is_admin());

-- profiles: admin can view ALL profiles
CREATE POLICY "admin_select_all_profiles" ON profiles
  FOR SELECT TO authenticated
  USING (public.is_admin());

-- profiles: admin can update any profile
CREATE POLICY "admin_update_all_profiles" ON profiles
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- feature_requests: admin can read and manage all
CREATE POLICY "admin_manage_feature_requests" ON feature_requests
  FOR ALL TO authenticated
  USING (public.is_admin());

-- chat_quota: admin can read all
CREATE POLICY "admin_select_chat_quota" ON chat_quota
  FOR SELECT TO authenticated
  USING (public.is_admin());

-- user_subscriptions: admin can read all
CREATE POLICY "admin_select_user_subscriptions" ON user_subscriptions
  FOR SELECT TO authenticated
  USING (public.is_admin());
