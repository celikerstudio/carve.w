'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import { useHealthHistory, type TimeRange } from '@/hooks/useHealthHistory'
import { useAuth } from '@/lib/auth/hooks'

// ─── Chart colors ───────────────────────────────────────────────────

const COLORS = {
  primary: '#c8b86e',
  calories: '#f59e0b',
  protein: '#3b82f6',
  carbs: '#a855f7',
  fat: '#ef4444',
  steps: '#10b981',
  workouts: '#3b82f6',
  grid: '#282e39',
  axis: '#64748b',
  goal: 'rgba(200, 184, 110, 0.3)',
}

// ─── Shared tooltip ─────────────────────────────────────────────────

function ChartTooltipContent({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ name: string; value: number; color: string }>
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg bg-[#1c1f27] border border-white/10 px-3 py-2 text-xs shadow-xl">
      <p className="text-white/40 mb-1">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-white/60 capitalize">{entry.name}:</span>
          <span className="text-white font-medium">{entry.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Chart card wrapper ─────────────────────────────────────────────

function DashboardChart({
  title,
  subtitle,
  children,
  index,
  empty,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
  index: number
  empty?: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="rounded-xl bg-[#1c1f27] border border-white/[0.06] p-5"
    >
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        {subtitle && <p className="text-[11px] text-white/30 mt-0.5">{subtitle}</p>}
      </div>
      {empty ? (
        <div className="h-[220px] flex items-center justify-center">
          <p className="text-xs text-white/20">Nog geen data</p>
        </div>
      ) : (
        children
      )}
    </motion.div>
  )
}

// ─── Weight trend chart ─────────────────────────────────────────────

function WeightChart({ data }: { data: { date: string; weight: number }[] }) {
  if (data.length === 0) return null

  const min = Math.floor(Math.min(...data.map((d) => d.weight)) - 1)
  const max = Math.ceil(Math.max(...data.map((d) => d.weight)) + 1)

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 5, right: 10, bottom: 0, left: -15 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fill: COLORS.axis, fontSize: 10 }}
          axisLine={{ stroke: COLORS.grid }}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          domain={[min, max]}
          tick={{ fill: COLORS.axis, fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          unit="kg"
        />
        <Tooltip content={<ChartTooltipContent />} />
        <Line
          type="monotone"
          dataKey="weight"
          name="gewicht"
          stroke={COLORS.primary}
          strokeWidth={2}
          dot={{ r: 3, fill: COLORS.primary, strokeWidth: 0 }}
          activeDot={{ r: 5, fill: COLORS.primary }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

// ─── Nutrition chart ────────────────────────────────────────────────

function NutritionChart({ data }: { data: { date: string; calories: number; protein: number; carbs: number; fat: number; calorieGoal: number }[] }) {
  if (data.length === 0) return null

  const avgGoal = data.length > 0 ? Math.round(data.reduce((sum, d) => sum + d.calorieGoal, 0) / data.length) : 0

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 5, right: 10, bottom: 0, left: -15 }}>
        <defs>
          <linearGradient id="gradCalories" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={COLORS.calories} stopOpacity={0.3} />
            <stop offset="95%" stopColor={COLORS.calories} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fill: COLORS.axis, fontSize: 10 }}
          axisLine={{ stroke: COLORS.grid }}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fill: COLORS.axis, fontSize: 10 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<ChartTooltipContent />} />
        {avgGoal > 0 && (
          <ReferenceLine y={avgGoal} stroke={COLORS.goal} strokeDasharray="4 4" label={{ value: `${avgGoal} kcal`, fill: COLORS.axis, fontSize: 10, position: 'right' }} />
        )}
        <Area
          type="monotone"
          dataKey="calories"
          name="kcal"
          stroke={COLORS.calories}
          strokeWidth={2}
          fill="url(#gradCalories)"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

// ─── Training frequency chart ───────────────────────────────────────

function WorkoutsChart({ data }: { data: { week: string; count: number }[] }) {
  if (data.length === 0) return null

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 5, right: 10, bottom: 0, left: -15 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} vertical={false} />
        <XAxis
          dataKey="week"
          tick={{ fill: COLORS.axis, fontSize: 10 }}
          axisLine={{ stroke: COLORS.grid }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: COLORS.axis, fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip content={<ChartTooltipContent />} />
        <Bar
          dataKey="count"
          name="workouts"
          fill={COLORS.workouts}
          radius={[4, 4, 0, 0]}
          maxBarSize={40}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}

// ─── Steps chart ────────────────────────────────────────────────────

function StepsChart({ data }: { data: { date: string; steps: number }[] }) {
  if (data.length === 0) return null

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 5, right: 10, bottom: 0, left: -15 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fill: COLORS.axis, fontSize: 10 }}
          axisLine={{ stroke: COLORS.grid }}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fill: COLORS.axis, fontSize: 10 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<ChartTooltipContent />} />
        <ReferenceLine y={10000} stroke={COLORS.goal} strokeDasharray="4 4" label={{ value: '10k', fill: COLORS.axis, fontSize: 10, position: 'right' }} />
        <Bar
          dataKey="steps"
          name="stappen"
          fill={COLORS.steps}
          radius={[3, 3, 0, 0]}
          maxBarSize={24}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}

// ─── Time range selector ────────────────────────────────────────────

const RANGES: { key: TimeRange; label: string }[] = [
  { key: '7d', label: '7 dagen' },
  { key: '30d', label: '30 dagen' },
  { key: '90d', label: '90 dagen' },
]

function RangeSelector({ value, onChange }: { value: TimeRange; onChange: (r: TimeRange) => void }) {
  return (
    <div className="flex bg-white/[0.04] p-1 rounded-lg">
      {RANGES.map((r) => (
        <button
          key={r.key}
          onClick={() => onChange(r.key)}
          className={cn(
            'px-3 py-1.5 rounded-md text-xs font-medium transition-all',
            value === r.key
              ? 'bg-white/10 text-white'
              : 'text-white/40 hover:text-white/60',
          )}
        >
          {r.label}
        </button>
      ))}
    </div>
  )
}

// ─── Page ───────────────────────────────────────────────────────────

export default function HealthDashboardPage() {
  const [range, setRange] = useState<TimeRange>('30d')
  const { user } = useAuth()
  const { data, loading } = useHealthHistory(user?.id ?? null, range)

  return (
    <div className="p-6 lg:p-10 h-full overflow-y-auto max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Health</h1>
          <p className="text-sm text-white/30 mt-1">Overzicht en trends</p>
        </div>
        <RangeSelector value={range} onChange={setRange} />
      </motion.div>

      {/* Loading state */}
      {loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl bg-[#1c1f27] border border-white/[0.06] p-5 animate-pulse">
              <div className="h-3 w-24 bg-white/[0.06] rounded mb-4" />
              <div className="h-[220px] bg-white/[0.03] rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Charts grid */}
      {!loading && data && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <DashboardChart
            title="Gewicht"
            subtitle={data.weight.length > 0 ? `${data.weight[data.weight.length - 1]?.weight} kg` : undefined}
            index={0}
            empty={data.weight.length === 0}
          >
            <WeightChart data={data.weight} />
          </DashboardChart>

          <DashboardChart
            title="Voeding"
            subtitle="Dagelijkse calorie-inname"
            index={1}
            empty={data.nutrition.length === 0}
          >
            <NutritionChart data={data.nutrition} />
          </DashboardChart>

          <DashboardChart
            title="Training"
            subtitle="Workouts per week"
            index={2}
            empty={data.workouts.length === 0}
          >
            <WorkoutsChart data={data.workouts} />
          </DashboardChart>

          <DashboardChart
            title="Stappen"
            subtitle="Dagelijkse stappen"
            index={3}
            empty={data.steps.length === 0}
          >
            <StepsChart data={data.steps} />
          </DashboardChart>
        </div>
      )}
    </div>
  )
}
