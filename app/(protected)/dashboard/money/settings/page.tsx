"use client"

import { useState } from "react"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"
import { CATEGORY_CONFIG, type SpendingCategory } from "@/components/money/sample-data"

// ---------------------------------------------------------------------------
// Toggle switch component
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
        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
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

// ---------------------------------------------------------------------------
// Section wrapper
// ---------------------------------------------------------------------------

function SettingsSection({
  title,
  description,
  children,
  delay = 0,
}: {
  title: string
  description: string
  children: React.ReactNode
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        <p className="text-sm text-[#9da6b9]">{description}</p>
      </div>
      <div
        className={cn(
          "rounded-2xl p-6",
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

// ---------------------------------------------------------------------------
// Select dropdown styled component
// ---------------------------------------------------------------------------

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
        "px-4 py-2 rounded-lg text-sm text-white",
        "bg-[#1c1f27] border border-white/10",
        "focus:outline-none focus:border-[#e8e0d4]/50 focus:ring-1 focus:ring-[#e8e0d4]/20",
        "transition-colors appearance-none cursor-pointer"
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
// Page component
// ---------------------------------------------------------------------------

export default function SettingsPage() {
  // Currency & display
  const [currency, setCurrency] = useState("USD")
  const [numberFormat, setNumberFormat] = useState("en-US")

  // Budget alerts
  const [alertAt50, setAlertAt50] = useState(true)
  const [alertAt80, setAlertAt80] = useState(true)
  const [alertAt100, setAlertAt100] = useState(true)
  const [weeklyDigest, setWeeklyDigest] = useState(false)

  // Categories
  const allCategories = Object.keys(CATEGORY_CONFIG) as SpendingCategory[]
  const [enabledCategories, setEnabledCategories] = useState<
    Record<SpendingCategory, boolean>
  >(
    () =>
      Object.fromEntries(
        allCategories.map((cat) => [cat, true])
      ) as Record<SpendingCategory, boolean>
  )

  function toggleCategory(cat: SpendingCategory) {
    setEnabledCategories((prev) => ({ ...prev, [cat]: !prev[cat] }))
  }

  return (
    <div className="p-6 lg:p-10 h-full overflow-y-auto max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Settings
        </h1>
        <p className="text-[#9da6b9] mt-1">
          Customize your money tracking preferences
        </p>
      </motion.div>

      {/* Currency & Display */}
      <SettingsSection
        title="Currency & Display"
        description="Choose how amounts are displayed"
        delay={0.1}
      >
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">Currency</p>
              <p className="text-xs text-slate-500">
                Select your preferred currency
              </p>
            </div>
            <StyledSelect
              value={currency}
              onChange={setCurrency}
              options={[
                { value: "USD", label: "$ USD" },
                { value: "EUR", label: "\u20AC EUR" },
                { value: "GBP", label: "\u00A3 GBP" },
                { value: "JPY", label: "\u00A5 JPY" },
              ]}
            />
          </div>

          <div className="border-t border-white/[0.06]" />

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">Number Format</p>
              <p className="text-xs text-slate-500">
                How numbers and decimals are displayed
              </p>
            </div>
            <StyledSelect
              value={numberFormat}
              onChange={setNumberFormat}
              options={[
                { value: "en-US", label: "1,234.56" },
                { value: "de-DE", label: "1.234,56" },
                { value: "fr-FR", label: "1 234,56" },
              ]}
            />
          </div>
        </div>
      </SettingsSection>

      {/* Budget Alerts */}
      <SettingsSection
        title="Budget Alerts"
        description="Get notified when you approach budget limits"
        delay={0.2}
      >
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">Alert at 50%</p>
              <p className="text-xs text-slate-500">
                Notify when half the budget is spent
              </p>
            </div>
            <Toggle enabled={alertAt50} onToggle={() => setAlertAt50(!alertAt50)} />
          </div>

          <div className="border-t border-white/[0.06]" />

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">Alert at 80%</p>
              <p className="text-xs text-slate-500">
                Warning when nearing the limit
              </p>
            </div>
            <Toggle enabled={alertAt80} onToggle={() => setAlertAt80(!alertAt80)} />
          </div>

          <div className="border-t border-white/[0.06]" />

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">Alert at 100%</p>
              <p className="text-xs text-slate-500">
                Alert when budget is exceeded
              </p>
            </div>
            <Toggle
              enabled={alertAt100}
              onToggle={() => setAlertAt100(!alertAt100)}
            />
          </div>

          <div className="border-t border-white/[0.06]" />

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">Weekly Digest</p>
              <p className="text-xs text-slate-500">
                Receive a weekly spending summary email
              </p>
            </div>
            <Toggle
              enabled={weeklyDigest}
              onToggle={() => setWeeklyDigest(!weeklyDigest)}
            />
          </div>
        </div>
      </SettingsSection>

      {/* Categories */}
      <SettingsSection
        title="Categories"
        description="Enable or disable spending categories"
        delay={0.3}
      >
        <div className="space-y-4">
          {allCategories.map((cat, idx) => {
            const config = CATEGORY_CONFIG[cat]
            return (
              <div key={cat}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-base">{config.icon}</span>
                    <p className="text-sm font-medium text-white">
                      {config.label}
                    </p>
                  </div>
                  <Toggle
                    enabled={enabledCategories[cat]}
                    onToggle={() => toggleCategory(cat)}
                  />
                </div>
                {idx < allCategories.length - 1 && (
                  <div className="border-t border-white/[0.06] mt-4" />
                )}
              </div>
            )
          })}
        </div>
      </SettingsSection>

      {/* Data & Privacy */}
      <SettingsSection
        title="Data & Privacy"
        description="Manage your financial data"
        delay={0.4}
      >
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">Export Data</p>
              <p className="text-xs text-slate-500">
                Download all your financial data as CSV
              </p>
            </div>
            <button
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium",
                "bg-white/5 text-white border border-white/10",
                "hover:bg-white/10 transition-colors"
              )}
            >
              Export
            </button>
          </div>

          <div className="border-t border-white/[0.06]" />

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-400">
                Delete All Data
              </p>
              <p className="text-xs text-slate-500">
                Permanently remove all financial data. This cannot be undone.
              </p>
            </div>
            <button
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium",
                "bg-red-500/10 text-red-400 border border-red-500/20",
                "hover:bg-red-500/20 transition-colors"
              )}
            >
              Delete
            </button>
          </div>
        </div>
      </SettingsSection>
    </div>
  )
}
