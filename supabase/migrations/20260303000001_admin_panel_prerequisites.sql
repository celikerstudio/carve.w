-- ===========================================
-- Admin Panel Prerequisites
-- ===========================================

-- 1. App Settings table for admin configuration
CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_by UUID REFERENCES profiles(id),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read settings (for feature flags, iOS app)
CREATE POLICY "authenticated_read_settings" ON app_settings
  FOR SELECT TO authenticated USING (true);

-- Only admins can manage settings (using user_roles join)
CREATE POLICY "admin_manage_settings" ON app_settings
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM profiles p
      JOIN user_roles ur ON p.user_role_id = ur.id
      WHERE p.id = auth.uid() AND ur.name = 'admin'
    )
  );
