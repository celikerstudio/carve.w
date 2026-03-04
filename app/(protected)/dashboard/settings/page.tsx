"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { useProfile } from "@/lib/auth/hooks"

// ---------------------------------------------------------------------------
// Shared UI primitives (Apple-style grouped settings)
// ---------------------------------------------------------------------------

function Toggle({
  enabled,
  onToggle,
}: {
  enabled: boolean
  onToggle: () => void
}) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0",
        enabled ? "bg-emerald-500" : "bg-white/10"
      )}
    >
      <span
        className={cn(
          "inline-block size-4 transform rounded-full bg-white transition-transform",
          enabled ? "translate-x-6" : "translate-x-1"
        )}
      />
    </button>
  )
}

function SettingsGroup({
  title,
  children,
  delay = 0,
}: {
  title: string
  children: React.ReactNode
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <h2 className="text-[13px] font-semibold text-[#9da6b9] uppercase tracking-wider mb-3">
        {title}
      </h2>
      <div
        className={cn(
          "rounded-2xl overflow-hidden",
          "bg-[rgba(28,31,39,0.7)] backdrop-blur-xl",
          "border border-white/[0.08]",
          "shadow-[0_4px_30px_rgba(0,0,0,0.3)]"
        )}
      >
        {children}
      </div>
    </motion.div>
  )
}

function SettingsRow({
  label,
  sublabel,
  children,
  isLast = false,
}: {
  label: string
  sublabel?: string
  children: React.ReactNode
  isLast?: boolean
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between px-5 py-4",
        !isLast && "border-b border-white/[0.06]"
      )}
    >
      <div className="flex-1 min-w-0 mr-4">
        <p className="text-sm font-medium text-white">{label}</p>
        {sublabel && (
          <p className="text-xs text-slate-500 mt-0.5">{sublabel}</p>
        )}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  )
}

function StyledSelect({
  value,
  onChange,
  options,
}: {
  value: string
  onChange: (val: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "px-3 py-1.5 rounded-lg text-sm text-white text-right",
        "bg-white/[0.06] border border-white/[0.08]",
        "focus:outline-none focus:border-white/20",
        "transition-colors appearance-none cursor-pointer pr-8",
        "bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%239da6b9%22%20stroke-width%3D%222%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%2F%3E%3C%2Fsvg%3E')]",
        "bg-[length:12px] bg-[right_8px_center] bg-no-repeat"
      )}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value} className="bg-[#1c1f27]">
          {opt.label}
        </option>
      ))}
    </select>
  )
}

// ---------------------------------------------------------------------------
// Loading skeleton
// ---------------------------------------------------------------------------

function SettingsSkeleton() {
  return (
    <div className="p-6 lg:p-10 max-w-2xl mx-auto space-y-8 animate-pulse">
      <div className="space-y-2">
        <div className="h-7 w-24 rounded bg-white/[0.06]" />
        <div className="h-4 w-48 rounded bg-white/[0.04]" />
      </div>
      {[...Array(4)].map((_, i) => (
        <div key={i} className="space-y-3">
          <div className="h-3 w-24 rounded bg-white/[0.04]" />
          <div className="h-32 rounded-2xl bg-white/[0.03]" />
        </div>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function SettingsPage() {
  const { profile, loading } = useProfile()

  // Notifications
  const [pushNotifications, setPushNotifications] = useState(true)
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [workoutReminders, setWorkoutReminders] = useState(true)
  const [socialNotifications, setSocialNotifications] = useState(true)
  const [achievementNotifications, setAchievementNotifications] = useState(true)

  // Privacy
  const [profileVisibility, setProfileVisibility] = useState("public")
  const [allowFriendRequests, setAllowFriendRequests] = useState(true)
  const [dataAnalytics, setDataAnalytics] = useState(true)
  const [dataResearch, setDataResearch] = useState(false)

  // Appearance
  const [language, setLanguage] = useState("en")
  const [timezone, setTimezone] = useState("Europe/Amsterdam")

  // Sync profile data to local state on first load
  const [initialized, setInitialized] = useState(false)
  if (profile && !initialized) {
    setPushNotifications(profile.push_notifications_enabled ?? true)
    setEmailNotifications(profile.email_notifications_enabled ?? true)
    setWorkoutReminders(profile.workout_reminders ?? true)
    setSocialNotifications(profile.social_notifications ?? true)
    setAchievementNotifications(profile.achievement_notifications ?? true)
    setProfileVisibility(profile.profile_visibility || "public")
    setAllowFriendRequests(profile.allow_friend_requests ?? true)
    setDataAnalytics(profile.data_sharing_analytics ?? true)
    setDataResearch(profile.data_sharing_research ?? false)
    setLanguage(profile.preferred_language || "en")
    setTimezone(profile.timezone || "Europe/Amsterdam")
    setInitialized(true)
  }

  if (loading) return <SettingsSkeleton />

  return (
    <div className="p-6 lg:p-10 h-full overflow-y-auto max-w-2xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Settings
        </h1>
        <p className="text-[#9da6b9] text-sm mt-1">
          Manage your app preferences
        </p>
      </motion.div>

      {/* ----------------------------------------------------------------- */}
      {/* Notifications                                                     */}
      {/* ----------------------------------------------------------------- */}
      <SettingsGroup title="Notifications" delay={0.1}>
        <SettingsRow label="Push Notifications" sublabel="Mobile & desktop alerts">
          <Toggle
            enabled={pushNotifications}
            onToggle={() => setPushNotifications(!pushNotifications)}
          />
        </SettingsRow>
        <SettingsRow label="Email Notifications" sublabel="Updates to your inbox">
          <Toggle
            enabled={emailNotifications}
            onToggle={() => setEmailNotifications(!emailNotifications)}
          />
        </SettingsRow>
        <SettingsRow label="Workout Reminders" sublabel="Daily workout nudges">
          <Toggle
            enabled={workoutReminders}
            onToggle={() => setWorkoutReminders(!workoutReminders)}
          />
        </SettingsRow>
        <SettingsRow label="Social Notifications" sublabel="Friend requests & activity">
          <Toggle
            enabled={socialNotifications}
            onToggle={() => setSocialNotifications(!socialNotifications)}
          />
        </SettingsRow>
        <SettingsRow label="Achievement Alerts" sublabel="Badges & milestones" isLast>
          <Toggle
            enabled={achievementNotifications}
            onToggle={() =>
              setAchievementNotifications(!achievementNotifications)
            }
          />
        </SettingsRow>
      </SettingsGroup>

      {/* ----------------------------------------------------------------- */}
      {/* Privacy & Security                                                */}
      {/* ----------------------------------------------------------------- */}
      <SettingsGroup title="Privacy & Security" delay={0.15}>
        <SettingsRow label="Profile Visibility" sublabel="Who can see your profile">
          <StyledSelect
            value={profileVisibility}
            onChange={setProfileVisibility}
            options={[
              { value: "public", label: "Public" },
              { value: "friends", label: "Friends Only" },
              { value: "private", label: "Private" },
            ]}
          />
        </SettingsRow>
        <SettingsRow label="Friend Requests" sublabel="Allow others to add you">
          <Toggle
            enabled={allowFriendRequests}
            onToggle={() => setAllowFriendRequests(!allowFriendRequests)}
          />
        </SettingsRow>
        <SettingsRow label="Analytics Data" sublabel="Help improve the app">
          <Toggle
            enabled={dataAnalytics}
            onToggle={() => setDataAnalytics(!dataAnalytics)}
          />
        </SettingsRow>
        <SettingsRow label="Research Data" sublabel="Anonymized data for research" isLast>
          <Toggle
            enabled={dataResearch}
            onToggle={() => setDataResearch(!dataResearch)}
          />
        </SettingsRow>
      </SettingsGroup>

      {/* ----------------------------------------------------------------- */}
      {/* Appearance                                                        */}
      {/* ----------------------------------------------------------------- */}
      <SettingsGroup title="Appearance" delay={0.2}>
        <SettingsRow label="Language">
          <StyledSelect
            value={language}
            onChange={setLanguage}
            options={[
              { value: "en", label: "English" },
              { value: "nl", label: "Nederlands" },
              { value: "de", label: "Deutsch" },
              { value: "fr", label: "Francais" },
              { value: "es", label: "Espanol" },
            ]}
          />
        </SettingsRow>
        <SettingsRow label="Timezone" isLast>
          <StyledSelect
            value={timezone}
            onChange={setTimezone}
            options={[
              { value: "Europe/Amsterdam", label: "Amsterdam (CET)" },
              { value: "Europe/London", label: "London (GMT)" },
              { value: "America/New_York", label: "New York (EST)" },
              { value: "America/Los_Angeles", label: "Los Angeles (PST)" },
              { value: "Asia/Tokyo", label: "Tokyo (JST)" },
              { value: "Asia/Dubai", label: "Dubai (GST)" },
            ]}
          />
        </SettingsRow>
      </SettingsGroup>

      {/* ----------------------------------------------------------------- */}
      {/* Danger Zone                                                       */}
      {/* ----------------------------------------------------------------- */}
      <SettingsGroup title="Danger Zone" delay={0.25}>
        <SettingsRow label="Sign Out" sublabel="Sign out of your account">
          <button
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium",
              "bg-white/5 text-white border border-white/10",
              "hover:bg-white/10 transition-colors"
            )}
          >
            Sign Out
          </button>
        </SettingsRow>
        <SettingsRow
          label="Delete Account"
          sublabel="Permanently delete your account and all data"
          isLast
        >
          <button
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium",
              "bg-red-500/10 text-red-400 border border-red-500/20",
              "hover:bg-red-500/20 transition-colors"
            )}
          >
            Delete
          </button>
        </SettingsRow>
      </SettingsGroup>
    </div>
  )
}
