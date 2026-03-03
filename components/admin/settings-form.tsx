'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { SettingsNav } from '@/components/admin/settings-nav';
import { SettingsMobileNav } from '@/components/admin/settings-mobile-nav';
import { SettingsSection } from '@/components/admin/settings-section';
import { SettingItem } from '@/components/admin/setting-item';
import { SettingsSaveButton } from '@/components/admin/settings-save-button';
import { useScrollSpy } from '@/hooks/use-scroll-spy';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { saveSettings } from '@/app/actions/admin/settings';

const SECTION_IDS = [
  'general',
  'users',
  'content',
  'notifications',
  'security',
  'integrations',
  'advanced',
];

interface SettingsFormProps {
  initialSettings: Record<string, any>;
}

export function SettingsForm({ initialSettings }: SettingsFormProps) {
  const activeSection = useScrollSpy(SECTION_IDS);

  // Helper to read initial value with fallback
  const initial = <T,>(key: string, fallback: T): T => {
    return initialSettings[key] !== undefined ? initialSettings[key] : fallback;
  };

  // Form state - General
  const [siteName, setSiteName] = useState<string>(
    initial('general.site_name', 'Carve Wiki')
  );
  const [maintenanceMode, setMaintenanceMode] = useState<boolean>(
    initial('general.maintenance_mode', false)
  );

  // Form state - Users & Roles
  const [userRegistration, setUserRegistration] = useState<boolean>(
    initial('users.registration_enabled', true)
  );
  const [defaultRole, setDefaultRole] = useState<string>(
    initial('users.default_role', 'user')
  );
  const [requireEmailVerification, setRequireEmailVerification] = useState<boolean>(
    initial('users.require_email_verification', true)
  );

  // Form state - Content
  const [enableWikiEditing, setEnableWikiEditing] = useState<boolean>(
    initial('content.wiki_editing_enabled', true)
  );
  const [moderateEdits, setModerateEdits] = useState<boolean>(
    initial('content.moderate_edits', true)
  );
  const [minEditReputation, setMinEditReputation] = useState<string>(
    String(initial('content.min_edit_reputation', 100))
  );

  // Form state - Notifications
  const [emailNotifications, setEmailNotifications] = useState<boolean>(
    initial('notifications.email_enabled', true)
  );
  const [weeklyDigest, setWeeklyDigest] = useState<boolean>(
    initial('notifications.weekly_digest', false)
  );
  const [achievementAlerts, setAchievementAlerts] = useState<boolean>(
    initial('notifications.achievement_alerts', true)
  );

  // Form state - Security
  const [enableTwoFactor, setEnableTwoFactor] = useState<boolean>(
    initial('security.two_factor_enabled', false)
  );
  const [sessionTimeout, setSessionTimeout] = useState<string>(
    String(initial('security.session_timeout_hours', 24))
  );
  const [maxLoginAttempts, setMaxLoginAttempts] = useState<string>(
    String(initial('security.max_login_attempts', 5))
  );

  // Form state - Integrations (XP)
  const [xpPerWorkout, setXpPerWorkout] = useState<string>(
    String(initial('integrations.xp_per_workout', 50))
  );
  const [xpPerMeal, setXpPerMeal] = useState<string>(
    String(initial('integrations.xp_per_meal', 10))
  );

  // Form state - Advanced
  const [weeklyResetDay, setWeeklyResetDay] = useState<string>(
    String(initial('advanced.weekly_reset_day', 1))
  );

  const handleNavigate = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleSaveGeneral = async () => {
    try {
      await saveSettings({
        'general.site_name': siteName,
        'general.maintenance_mode': maintenanceMode,
      });
      toast.success('General settings saved');
    } catch (error) {
      toast.error('Failed to save general settings');
      throw error;
    }
  };

  const handleSaveUsers = async () => {
    try {
      await saveSettings({
        'users.registration_enabled': userRegistration,
        'users.default_role': defaultRole,
        'users.require_email_verification': requireEmailVerification,
      });
      toast.success('User settings saved');
    } catch (error) {
      toast.error('Failed to save user settings');
      throw error;
    }
  };

  const handleSaveContent = async () => {
    try {
      await saveSettings({
        'content.wiki_editing_enabled': enableWikiEditing,
        'content.moderate_edits': moderateEdits,
        'content.min_edit_reputation': Number(minEditReputation),
      });
      toast.success('Content settings saved');
    } catch (error) {
      toast.error('Failed to save content settings');
      throw error;
    }
  };

  const handleSaveNotifications = async () => {
    try {
      await saveSettings({
        'notifications.email_enabled': emailNotifications,
        'notifications.weekly_digest': weeklyDigest,
        'notifications.achievement_alerts': achievementAlerts,
      });
      toast.success('Notification settings saved');
    } catch (error) {
      toast.error('Failed to save notification settings');
      throw error;
    }
  };

  const handleSaveSecurity = async () => {
    try {
      await saveSettings({
        'security.two_factor_enabled': enableTwoFactor,
        'security.session_timeout_hours': Number(sessionTimeout),
        'security.max_login_attempts': Number(maxLoginAttempts),
      });
      toast.success('Security settings saved');
    } catch (error) {
      toast.error('Failed to save security settings');
      throw error;
    }
  };

  const handleSaveXP = async () => {
    try {
      await saveSettings({
        'integrations.xp_per_workout': Number(xpPerWorkout),
        'integrations.xp_per_meal': Number(xpPerMeal),
      });
      toast.success('Integration settings saved');
    } catch (error) {
      toast.error('Failed to save integration settings');
      throw error;
    }
  };

  const handleSaveAdvanced = async () => {
    try {
      await saveSettings({
        'advanced.weekly_reset_day': Number(weeklyResetDay),
      });
      toast.success('Advanced settings saved');
    } catch (error) {
      toast.error('Failed to save advanced settings');
      throw error;
    }
  };

  return (
    <div className="h-full lg:grid lg:grid-cols-[250px_1fr]">
      {/* Mobile Navigation */}
      <SettingsMobileNav
        activeSection={activeSection}
        onNavigate={handleNavigate}
      />

      {/* Desktop Left Navigation */}
      <div className="hidden lg:block">
        <SettingsNav
          activeSection={activeSection}
          onNavigate={handleNavigate}
        />
      </div>

      {/* Right Content */}
      <div className="overflow-y-auto">
        <div className="p-6 lg:p-10 max-w-4xl space-y-6">
          {/* General Settings */}
          <SettingsSection
            id="general"
            title="General"
            description="Configure site-wide settings and preferences"
          >
            <SettingItem
              label="Site Name"
              description="The name displayed in the header"
              htmlFor="site-name"
            >
              <Input
                id="site-name"
                type="text"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                className="w-64 bg-white/5 border-white/10 text-white"
              />
            </SettingItem>

            <SettingItem
              label="Maintenance Mode"
              description="Enable to show maintenance page to users"
              htmlFor="maintenance-mode"
            >
              <Switch
                id="maintenance-mode"
                checked={maintenanceMode}
                onCheckedChange={setMaintenanceMode}
              />
            </SettingItem>

            <SettingsSaveButton onSave={handleSaveGeneral} />
          </SettingsSection>

          {/* Users & Roles */}
          <SettingsSection
            id="users"
            title="Users & Roles"
            description="Manage user permissions and roles"
          >
            <SettingItem
              label="User Registration"
              description="Allow new users to register for accounts"
              htmlFor="user-registration"
            >
              <Switch
                id="user-registration"
                checked={userRegistration}
                onCheckedChange={setUserRegistration}
              />
            </SettingItem>

            <SettingItem
              label="Default User Role"
              description="Role assigned to new user accounts"
              htmlFor="default-role"
            >
              <Select value={defaultRole} onValueChange={setDefaultRole}>
                <SelectTrigger className="w-64 bg-white/5 border-white/10 text-white" id="default-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="contributor">Contributor</SelectItem>
                  <SelectItem value="moderator">Moderator</SelectItem>
                </SelectContent>
              </Select>
            </SettingItem>

            <SettingItem
              label="Require Email Verification"
              description="Users must verify their email before full access"
              htmlFor="email-verification"
            >
              <Switch
                id="email-verification"
                checked={requireEmailVerification}
                onCheckedChange={setRequireEmailVerification}
              />
            </SettingItem>

            <SettingsSaveButton onSave={handleSaveUsers} />
          </SettingsSection>

          {/* Content Settings */}
          <SettingsSection
            id="content"
            title="Content"
            description="Configure content moderation and wiki settings"
          >
            <SettingItem
              label="Enable Wiki Editing"
              description="Allow users to create and edit wiki articles"
              htmlFor="wiki-editing"
            >
              <Switch
                id="wiki-editing"
                checked={enableWikiEditing}
                onCheckedChange={setEnableWikiEditing}
              />
            </SettingItem>

            <SettingItem
              label="Moderate Edits"
              description="Require admin approval for wiki edits"
              htmlFor="moderate-edits"
            >
              <Switch
                id="moderate-edits"
                checked={moderateEdits}
                onCheckedChange={setModerateEdits}
              />
            </SettingItem>

            <SettingItem
              label="Minimum Edit Reputation"
              description="Reputation required to edit wiki articles"
              htmlFor="min-edit-reputation"
            >
              <Input
                id="min-edit-reputation"
                type="number"
                value={minEditReputation}
                onChange={(e) => setMinEditReputation(e.target.value)}
                className="w-32 bg-white/5 border-white/10 text-white"
              />
            </SettingItem>

            <SettingsSaveButton onSave={handleSaveContent} />
          </SettingsSection>

          {/* Notifications */}
          <SettingsSection
            id="notifications"
            title="Notifications"
            description="Configure email and notification preferences"
          >
            <SettingItem
              label="Email Notifications"
              description="Send email notifications for important events"
              htmlFor="email-notifications"
            >
              <Switch
                id="email-notifications"
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
            </SettingItem>

            <SettingItem
              label="Weekly Digest"
              description="Send weekly summary of activity and updates"
              htmlFor="weekly-digest"
            >
              <Switch
                id="weekly-digest"
                checked={weeklyDigest}
                onCheckedChange={setWeeklyDigest}
              />
            </SettingItem>

            <SettingItem
              label="Achievement Alerts"
              description="Notify users when they unlock achievements"
              htmlFor="achievement-alerts"
            >
              <Switch
                id="achievement-alerts"
                checked={achievementAlerts}
                onCheckedChange={setAchievementAlerts}
              />
            </SettingItem>

            <SettingsSaveButton onSave={handleSaveNotifications} />
          </SettingsSection>

          {/* Security */}
          <SettingsSection
            id="security"
            title="Security"
            description="Authentication and privacy settings"
          >
            <SettingItem
              label="Enable Two-Factor Authentication"
              description="Require 2FA for admin accounts"
              htmlFor="two-factor"
            >
              <Switch
                id="two-factor"
                checked={enableTwoFactor}
                onCheckedChange={setEnableTwoFactor}
              />
            </SettingItem>

            <SettingItem
              label="Session Timeout"
              description="Hours until inactive sessions expire"
              htmlFor="session-timeout"
            >
              <Input
                id="session-timeout"
                type="number"
                value={sessionTimeout}
                onChange={(e) => setSessionTimeout(e.target.value)}
                className="w-32 bg-white/5 border-white/10 text-white"
              />
            </SettingItem>

            <SettingItem
              label="Max Login Attempts"
              description="Failed login attempts before account lockout"
              htmlFor="max-login-attempts"
            >
              <Input
                id="max-login-attempts"
                type="number"
                value={maxLoginAttempts}
                onChange={(e) => setMaxLoginAttempts(e.target.value)}
                className="w-32 bg-white/5 border-white/10 text-white"
              />
            </SettingItem>

            <SettingsSaveButton onSave={handleSaveSecurity} />
          </SettingsSection>

          {/* Integrations */}
          <SettingsSection
            id="integrations"
            title="Integrations"
            description="Third-party services and API configurations"
          >
            <SettingItem
              label="XP per Workout"
              description="Base XP earned per completed workout"
              htmlFor="xp-workout"
            >
              <Input
                id="xp-workout"
                type="number"
                value={xpPerWorkout}
                onChange={(e) => setXpPerWorkout(e.target.value)}
                className="w-32 bg-white/5 border-white/10 text-white"
              />
            </SettingItem>

            <SettingItem
              label="XP per Meal"
              description="Base XP earned per logged meal"
              htmlFor="xp-meal"
            >
              <Input
                id="xp-meal"
                type="number"
                value={xpPerMeal}
                onChange={(e) => setXpPerMeal(e.target.value)}
                className="w-32 bg-white/5 border-white/10 text-white"
              />
            </SettingItem>

            <SettingsSaveButton onSave={handleSaveXP} />
          </SettingsSection>

          {/* Advanced */}
          <SettingsSection
            id="advanced"
            title="Advanced"
            description="System settings and danger zone"
          >
            <SettingItem
              label="Weekly Reset Day"
              description="Day of the week to reset leaderboards"
              htmlFor="reset-day"
            >
              <Select value={weeklyResetDay} onValueChange={setWeeklyResetDay}>
                <SelectTrigger className="w-64 bg-white/5 border-white/10 text-white" id="reset-day">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Monday</SelectItem>
                  <SelectItem value="2">Tuesday</SelectItem>
                  <SelectItem value="3">Wednesday</SelectItem>
                  <SelectItem value="4">Thursday</SelectItem>
                  <SelectItem value="5">Friday</SelectItem>
                  <SelectItem value="6">Saturday</SelectItem>
                  <SelectItem value="0">Sunday</SelectItem>
                </SelectContent>
              </Select>
            </SettingItem>

            <SettingsSaveButton onSave={handleSaveAdvanced} />
          </SettingsSection>
        </div>
      </div>
    </div>
  );
}
