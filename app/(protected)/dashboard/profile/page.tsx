"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { useProfile, useAuth } from "@/lib/auth/hooks"
import { Kenniskaart } from "@/components/quiz/Kenniskaart"
import Link from "next/link"
import type { UserKnowledge } from "@/lib/quiz/types"

// ---------------------------------------------------------------------------
// Avatar
// ---------------------------------------------------------------------------

function ProfileAvatar({
  url,
  name,
  size = 96,
}: {
  url?: string | null
  name?: string | null
  size?: number
}) {
  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?"

  return (
    <div
      className="relative group cursor-pointer"
      style={{ width: size, height: size }}
    >
      {url ? (
        <img
          src={url}
          alt={name || "Avatar"}
          className="rounded-full object-cover"
          style={{ width: size, height: size }}
        />
      ) : (
        <div
          className={cn(
            "rounded-full flex items-center justify-center",
            "bg-gradient-to-br from-[#e8e0d4]/20 to-[#e8e0d4]/5",
            "border border-white/[0.1]"
          )}
          style={{ width: size, height: size }}
        >
          <span
            className="font-semibold text-[#e8e0d4]"
            style={{ fontSize: size * 0.32 }}
          >
            {initials}
          </span>
        </div>
      )}
      {/* Edit overlay */}
      <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
          <circle cx="12" cy="13" r="4" />
        </svg>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Grouped section (Apple-style)
// ---------------------------------------------------------------------------

function ProfileGroup({
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

function ProfileRow({
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

function StyledInput({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string
  onChange: (val: string) => void
  placeholder?: string
  type?: string
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={cn(
        "px-3 py-1.5 rounded-lg text-sm text-white text-right w-[200px]",
        "bg-white/[0.06] border border-white/[0.08]",
        "focus:outline-none focus:border-white/20",
        "transition-colors placeholder:text-slate-600"
      )}
    />
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

function ProfileSkeleton() {
  return (
    <div className="p-6 lg:p-10 max-w-2xl mx-auto space-y-8 animate-pulse">
      <div className="flex flex-col items-center gap-4 py-8">
        <div className="size-24 rounded-full bg-white/[0.06]" />
        <div className="h-5 w-32 rounded bg-white/[0.06]" />
        <div className="h-3 w-48 rounded bg-white/[0.04]" />
      </div>
      {[...Array(3)].map((_, i) => (
        <div key={i} className="space-y-3">
          <div className="h-3 w-24 rounded bg-white/[0.04]" />
          <div className="h-32 rounded-2xl bg-white/[0.03]" />
        </div>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ProfilePage() {
  const { profile, loading } = useProfile()
  const { user } = useAuth()
  const [knowledge, setKnowledge] = useState<UserKnowledge[]>([])

  useEffect(() => {
    async function fetchKnowledge() {
      if (!user) return
      try {
        const res = await fetch("/api/quiz/progress")
        if (res.ok) {
          const data = await res.json()
          setKnowledge(data.knowledge ?? [])
        }
      } catch (e) {
        console.error("Failed to fetch knowledge:", e)
      }
    }
    fetchKnowledge()
  }, [user])

  // Local form state
  const [displayName, setDisplayName] = useState("")
  const [username, setUsername] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [bio, setBio] = useState("")
  const [gender, setGender] = useState("")
  const [dateOfBirth, setDateOfBirth] = useState("")

  // Fitness & goals
  const [fitnessLevel, setFitnessLevel] = useState("intermediate")
  const [activityLevel, setActivityLevel] = useState("moderate")
  const [dailyCalories, setDailyCalories] = useState("2200")
  const [dailyProtein, setDailyProtein] = useState("150")
  const [dailyCarbs, setDailyCarbs] = useState("250")
  const [dailyFat, setDailyFat] = useState("70")
  const [weeklyWorkouts, setWeeklyWorkouts] = useState("4")

  // Sync on first load
  const [initialized, setInitialized] = useState(false)
  if (profile && !initialized) {
    setDisplayName(profile.display_name || "")
    setUsername(profile.username || "")
    setFirstName(profile.first_name || "")
    setLastName(profile.last_name || "")
    setGender(profile.gender || "")
    setDateOfBirth(profile.date_of_birth || "")
    setFitnessLevel(profile.fitness_level || "intermediate")
    setActivityLevel(profile.activity_level || "moderate")
    setDailyCalories(String(profile.daily_calorie_goal || 2200))
    setDailyProtein(String(profile.daily_protein_goal || 150))
    setDailyCarbs(String(profile.daily_carb_goal || 250))
    setDailyFat(String(profile.daily_fat_goal || 70))
    setWeeklyWorkouts(String(profile.weekly_workout_goal || 4))
    setInitialized(true)
  }

  if (loading) return <ProfileSkeleton />

  const email = profile?.email || ""
  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : ""

  return (
    <div className="p-6 lg:p-10 h-full overflow-y-auto max-w-2xl mx-auto space-y-8 pb-20">
      {/* ----------------------------------------------------------------- */}
      {/* Profile hero                                                      */}
      {/* ----------------------------------------------------------------- */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center text-center pt-4 pb-2"
      >
        <ProfileAvatar
          url={profile?.avatar_image_url}
          name={profile?.display_name || profile?.first_name}
          size={96}
        />
        <h1 className="text-xl font-bold text-white mt-4">
          {profile?.display_name || profile?.first_name || "Your Profile"}
        </h1>
        <p className="text-sm text-slate-400 mt-0.5">{email}</p>
        {memberSince && (
          <p className="text-xs text-slate-500 mt-1">
            Member since {memberSince}
          </p>
        )}
        {profile?.role && (
          <span
            className={cn(
              "mt-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
              profile.role === "admin"
                ? "bg-purple-500/10 text-purple-400"
                : profile.role === "dedicated"
                  ? "bg-amber-500/10 text-amber-400"
                  : "bg-white/[0.06] text-slate-400"
            )}
          >
            {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
          </span>
        )}
      </motion.div>

      {/* ----------------------------------------------------------------- */}
      {/* Personal Information                                              */}
      {/* ----------------------------------------------------------------- */}
      <ProfileGroup title="Personal Information" delay={0.1}>
        <ProfileRow label="Display Name">
          <StyledInput
            value={displayName}
            onChange={setDisplayName}
            placeholder="Display name"
          />
        </ProfileRow>
        <ProfileRow label="Username">
          <StyledInput
            value={username}
            onChange={setUsername}
            placeholder="username"
          />
        </ProfileRow>
        <ProfileRow label="First Name">
          <StyledInput
            value={firstName}
            onChange={setFirstName}
            placeholder="First name"
          />
        </ProfileRow>
        <ProfileRow label="Last Name">
          <StyledInput
            value={lastName}
            onChange={setLastName}
            placeholder="Last name"
          />
        </ProfileRow>
        <ProfileRow label="Bio">
          <StyledInput value={bio} onChange={setBio} placeholder="Short bio" />
        </ProfileRow>
        <ProfileRow label="Gender">
          <StyledSelect
            value={gender}
            onChange={setGender}
            options={[
              { value: "", label: "Not set" },
              { value: "male", label: "Male" },
              { value: "female", label: "Female" },
              { value: "other", label: "Other" },
            ]}
          />
        </ProfileRow>
        <ProfileRow label="Date of Birth" isLast>
          <StyledInput
            value={dateOfBirth}
            onChange={setDateOfBirth}
            type="date"
          />
        </ProfileRow>
      </ProfileGroup>

      {/* ----------------------------------------------------------------- */}
      {/* Fitness & Goals                                                   */}
      {/* ----------------------------------------------------------------- */}
      <ProfileGroup title="Fitness & Goals" delay={0.15}>
        <ProfileRow label="Fitness Level">
          <StyledSelect
            value={fitnessLevel}
            onChange={setFitnessLevel}
            options={[
              { value: "beginner", label: "Beginner" },
              { value: "intermediate", label: "Intermediate" },
              { value: "advanced", label: "Advanced" },
              { value: "elite", label: "Elite" },
            ]}
          />
        </ProfileRow>
        <ProfileRow label="Activity Level">
          <StyledSelect
            value={activityLevel}
            onChange={setActivityLevel}
            options={[
              { value: "sedentary", label: "Sedentary" },
              { value: "light", label: "Lightly Active" },
              { value: "moderate", label: "Moderately Active" },
              { value: "active", label: "Very Active" },
              { value: "extreme", label: "Extremely Active" },
            ]}
          />
        </ProfileRow>
        <ProfileRow label="Weekly Workout Goal">
          <StyledSelect
            value={weeklyWorkouts}
            onChange={setWeeklyWorkouts}
            options={[
              { value: "2", label: "2 days" },
              { value: "3", label: "3 days" },
              { value: "4", label: "4 days" },
              { value: "5", label: "5 days" },
              { value: "6", label: "6 days" },
              { value: "7", label: "7 days" },
            ]}
          />
        </ProfileRow>
        <ProfileRow label="Daily Calories" sublabel="kcal">
          <StyledInput
            value={dailyCalories}
            onChange={setDailyCalories}
            type="number"
          />
        </ProfileRow>
        <ProfileRow label="Daily Protein" sublabel="grams">
          <StyledInput
            value={dailyProtein}
            onChange={setDailyProtein}
            type="number"
          />
        </ProfileRow>
        <ProfileRow label="Daily Carbs" sublabel="grams">
          <StyledInput
            value={dailyCarbs}
            onChange={setDailyCarbs}
            type="number"
          />
        </ProfileRow>
        <ProfileRow label="Daily Fat" sublabel="grams" isLast>
          <StyledInput
            value={dailyFat}
            onChange={setDailyFat}
            type="number"
          />
        </ProfileRow>
      </ProfileGroup>

      {/* ----------------------------------------------------------------- */}
      {/* Kenniskaart                                                       */}
      {/* ----------------------------------------------------------------- */}
      <ProfileGroup title="Kenniskaart" delay={0.2}>
        <div className="p-5">
          {knowledge.length > 0 ? (
            <Kenniskaart knowledge={knowledge} />
          ) : (
            <div className="text-center py-6">
              <p className="text-sm text-[#7a8299] mb-2">No quiz data yet.</p>
              <Link
                href="/wiki/learn"
                className="text-sm text-[#c8b86e] hover:underline"
              >
                Start learning →
              </Link>
            </div>
          )}
        </div>
      </ProfileGroup>
    </div>
  )
}
