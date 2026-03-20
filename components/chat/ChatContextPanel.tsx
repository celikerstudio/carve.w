'use client'

import { createContext, useContext, useState } from 'react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { sampleSubscriptions, sampleTransactions } from '@/components/money/sample-data'
import { useHealthData, type HealthData } from '@/hooks/useHealthData'
import type { AppId } from './types'

// ─── Shared card primitives ─────────────────────────────────────────

function ContextCard({ children, className }: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'rounded-xl bg-white/[0.05] border border-white/[0.08] p-3.5',
        className
      )}
    >
      {children}
    </div>
  )
}

function CardLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-white/30 mb-0.5">
      {children}
    </p>
  )
}

function ListItem({ label, value, dim, accent }: {
  label: string
  value: string
  dim?: boolean
  accent?: 'red' | 'green'
}) {
  return (
    <div className="flex items-center justify-between">
      <span className={cn('text-[12px]', dim ? 'text-white/35' : 'text-white/60')}>{label}</span>
      <span className={cn(
        'text-[12px]',
        accent === 'red' ? 'text-red-400/70' :
        accent === 'green' ? 'text-emerald-400/70' :
        dim ? 'text-white/35' : 'text-white/45'
      )}>{value}</span>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="rounded-xl bg-white/[0.05] border border-white/[0.08] p-3.5 animate-pulse">
      <div className="h-2 w-16 bg-white/[0.06] rounded mb-3" />
      <div className="space-y-2">
        <div className="h-3 w-full bg-white/[0.04] rounded" />
        <div className="h-3 w-2/3 bg-white/[0.04] rounded" />
      </div>
    </div>
  )
}

// ─── Health data context ────────────────────────────────────────────

const HealthDataContext = createContext<{ data: HealthData | null; loading: boolean }>({
  data: null,
  loading: true,
})

function useHealth() {
  return useContext(HealthDataContext)
}

// ─── Health cards (real data) ───────────────────────────────────────

function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return n.toString()
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  return `${days}d ago`
}

function WorkoutCard() {
  const { data, loading } = useHealth()
  if (loading) return <SkeletonCard />

  if (!data?.lastWorkout) {
    return (
      <ContextCard>
        <CardLabel>Last workout</CardLabel>
        <p className="text-[12px] text-white/35 mt-2">No workouts yet</p>
      </ContextCard>
    )
  }

  const { name, date, muscleGroups } = data.lastWorkout

  return (
    <ContextCard>
      <CardLabel>Last workout</CardLabel>
      <div className="flex items-center justify-between mt-2 mb-2">
        <p className="text-[14px] text-white/70 font-semibold">{name}</p>
        <span className="text-[10px] text-white/35">{timeAgo(date)}</span>
      </div>
      {muscleGroups.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {muscleGroups.map((muscle) => (
            <span key={muscle} className="text-[10px] text-white/30 px-2 py-0.5 rounded-full bg-white/[0.06]">
              {muscle}
            </span>
          ))}
        </div>
      )}
    </ContextCard>
  )
}

function WeekCard() {
  const { data, loading } = useHealth()
  if (loading) return <SkeletonCard />
  if (!data) return null

  return (
    <ContextCard>
      <CardLabel>This week</CardLabel>
      <div className="flex gap-2 mt-2 mb-2">
        {data.weekDays.map((day, i) => (
          <div key={day.dayLabel + i} className="flex flex-col items-center gap-1.5">
            <span className="text-[9px] text-white/30">{day.dayLabel}</span>
            <div className={cn(
              'w-5 h-5 rounded-full flex items-center justify-center text-[9px]',
              day.done
                ? 'bg-white/15 text-white/60'
                : day.isToday
                  ? 'border border-white/20 text-white/40'
                  : 'bg-white/[0.03] text-white/30'
            )}>
              {day.done ? '✓' : day.isToday ? '·' : ''}
            </div>
          </div>
        ))}
      </div>
      <p className="text-[11px] text-white/35">
        {data.weekWorkoutCount} of {data.weekWorkoutGoal} workouts
      </p>
    </ContextCard>
  )
}

function TodayCard() {
  const { data, loading } = useHealth()
  if (loading) return <SkeletonCard />
  if (!data) return null

  const stepsDisplay = `${formatNumber(data.todaySteps)} / 10k`
  const calDisplay = `${formatNumber(data.todayCalories)} / ${formatNumber(data.calorieGoal)}`
  const proteinDisplay = `${data.todayProtein}g / ${data.proteinGoal}g`
  const waterL = (data.todayWater / 1000).toFixed(1)
  const waterGoalL = (data.waterGoal / 1000).toFixed(1)
  const waterDisplay = `${waterL}L / ${waterGoalL}L`

  return (
    <ContextCard>
      <CardLabel>Today</CardLabel>
      <div className="flex flex-col gap-2 mt-2">
        <ListItem
          label="Steps"
          value={stepsDisplay}
          accent={data.todaySteps === 0 ? 'red' : undefined}
        />
        <ListItem label="Calories" value={calDisplay} />
        <ListItem label="Protein" value={proteinDisplay} />
        <ListItem label="Water" value={waterDisplay} />
      </div>
    </ContextCard>
  )
}

function StreakCard() {
  const { data, loading } = useHealth()
  if (loading) return <SkeletonCard />
  if (!data) return null

  return (
    <ContextCard>
      <div className="flex justify-between items-center">
        <p className="text-[11px] text-white/30">
          {data.currentStreak > 0 ? `${data.currentStreak}-day streak` : 'No streak'}
        </p>
        <p className="text-[11px] text-white/30">{data.weekWorkoutCount} this week</p>
      </div>
    </ContextCard>
  )
}

// ─── Money cards (still mock) ───────────────────────────────────────

const SUB_COLORS: Record<string, string> = {
  Netflix: '#E50914', Spotify: '#1DB954', 'Adobe CC': '#FF0000',
  Figma: '#A259FF', AWS: '#FF9900', 'X Premium': '#ffffff', Equinox: '#ffffff',
}

function BudgetCard() {
  return (
    <ContextCard>
      <CardLabel>Budget — March</CardLabel>
      <div className="flex items-baseline justify-between mt-2 mb-2">
        <p className="text-[22px] font-bold text-white/80 tracking-tight">€760</p>
        <p className="text-[12px] text-white/30">/ €2,000</p>
      </div>
      <div className="h-[3px] bg-white/[0.06] rounded-full">
        <div className="h-full bg-white/25 rounded-full" style={{ width: '62%' }} />
      </div>
      <p className="text-[10px] text-white/30 mt-1.5">62% spent · 12 days remaining</p>
    </ContextCard>
  )
}

function SubscriptionsCard() {
  const [expanded, setExpanded] = useState(false)
  const activeSubs = sampleSubscriptions.filter(s => s.isActive)
  const totalMonthly = activeSubs.reduce((sum, s) => sum + s.cost, 0)

  return (
    <ContextCard>
      <button onClick={() => setExpanded(!expanded)} className="flex items-center justify-between w-full">
        <div>
          <CardLabel>Subscriptions</CardLabel>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-[16px] font-bold text-white/80">${totalMonthly.toFixed(2)}</span>
            <span className="text-[10px] text-white/30">/mo</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-white/35">{activeSubs.length} active</span>
          <ChevronDown className={cn('w-3.5 h-3.5 text-white/30 transition-transform duration-200', expanded && 'rotate-180')} />
        </div>
      </button>

      {!expanded && (
        <div className="flex items-center gap-1.5 mt-3">
          {activeSubs.slice(0, 5).map((sub) => (
            <div key={sub.id} className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold text-white shrink-0" style={{ background: SUB_COLORS[sub.name] || '#333' }} title={sub.name}>
              {sub.name.charAt(0)}
            </div>
          ))}
          {activeSubs.length > 5 && (
            <div className="w-7 h-7 rounded-lg bg-white/[0.08] flex items-center justify-center text-[9px] text-white/40">+{activeSubs.length - 5}</div>
          )}
        </div>
      )}

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
            <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-white/[0.06]">
              {activeSubs.map((sub) => (
                <div key={sub.id} className="flex items-center gap-2.5 py-1">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold text-white shrink-0" style={{ background: SUB_COLORS[sub.name] || '#333' }}>{sub.name.charAt(0)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] text-white/70 font-medium truncate">{sub.name}</p>
                    <p className="text-[10px] text-white/30">{sub.plan}</p>
                  </div>
                  <span className="text-[12px] text-white/50 font-medium">${sub.cost.toFixed(2)}</span>
                </div>
              ))}
              <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
                <span className="text-[11px] text-white/35">Yearly forecast</span>
                <span className="text-[11px] text-white/50 font-medium">${(totalMonthly * 12).toLocaleString()}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </ContextCard>
  )
}

function TransactionsCard() {
  return (
    <ContextCard>
      <CardLabel>Recent transactions</CardLabel>
      <div className="flex flex-col gap-2 mt-2">
        {sampleTransactions.slice(0, 5).map((tx) => (
          <div key={tx.id} className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-[12px] text-white/60 truncate">{tx.merchant}</p>
              <p className="text-[10px] text-white/30 capitalize">{tx.subcategory}</p>
            </div>
            <span className="text-[12px] text-white/45 font-medium shrink-0 ml-3">-${tx.amount.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </ContextCard>
  )
}

function BillsCard() {
  return (
    <ContextCard>
      <CardLabel>Open bills</CardLabel>
      <div className="flex items-center justify-between mt-2">
        <div>
          <p className="text-[12px] text-white/60">Coolblue</p>
          <p className="text-[10px] text-white/30">Due friday</p>
        </div>
        <span className="text-[13px] text-white/70 font-semibold">€847</span>
      </div>
    </ContextCard>
  )
}

// ─── Life cards (still mock) ────────────────────────────────────────

function TripCard() {
  return (
    <ContextCard>
      <CardLabel>Next trip</CardLabel>
      <div className="flex items-center justify-between mt-2 mb-2">
        <p className="text-[15px] text-white/70 font-bold">Barcelona</p>
        <span className="text-[11px] text-emerald-400/60">in 3 days</span>
      </div>
      <div className="flex flex-col gap-1.5">
        <ListItem label="Flight" value="KLM · Confirmed" />
        <ListItem label="Hotel" value="3 nights" />
        <ListItem label="Dates" value="Mar 22 — 25" />
        <ListItem label="Budget" value="€1,200" />
      </div>
    </ContextCard>
  )
}

function UpcomingCard() {
  return (
    <ContextCard>
      <CardLabel>Upcoming</CardLabel>
      <div className="flex flex-col gap-2.5 mt-2">
        <div className="flex items-center justify-between">
          <p className="text-[12px] text-white/60">Tandarts</p>
          <p className="text-[11px] text-white/30">Mar 28 · 10:00</p>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-[12px] text-white/60">Belastingaangifte</p>
          <p className="text-[11px] text-white/30">Apr 15 · deadline</p>
        </div>
      </div>
    </ContextCard>
  )
}

function LifeStatsCard() {
  return (
    <ContextCard>
      <CardLabel>Stats</CardLabel>
      <div className="flex flex-col gap-2 mt-2">
        <ListItem label="Trips this year" value="2" />
        <ListItem label="Countries visited" value="5" />
        <ListItem label="Trips planned" value="3" />
      </div>
    </ContextCard>
  )
}

// ─── Inbox cards (still mock) ───────────────────────────────────────

function AttentionCard() {
  return (
    <ContextCard>
      <CardLabel>Needs attention</CardLabel>
      <div className="flex flex-col gap-3 mt-2">
        <div>
          <p className="text-[12px] text-white/65 font-medium">Belastingdienst</p>
          <p className="text-[11px] text-white/35">Voorlopige aanslag 2026</p>
          <p className="text-[10px] text-white/30 mt-0.5">AI: Deadline april 15</p>
        </div>
        <div className="h-px bg-white/[0.06]" />
        <div>
          <p className="text-[12px] text-white/65 font-medium">KLM</p>
          <p className="text-[11px] text-white/35">Vluchtbevestiging Barcelona</p>
          <p className="text-[10px] text-white/30 mt-0.5">AI: Added to trip</p>
        </div>
      </div>
    </ContextCard>
  )
}

function HandledCard() {
  return (
    <ContextCard>
      <CardLabel>Handled by AI today</CardLabel>
      <div className="flex flex-col gap-2 mt-2">
        <ListItem label="Newsletters archived" value="8" dim />
        <ListItem label="Promotions dismissed" value="4" dim />
        <ListItem label="Receipts → Money" value="2" dim />
      </div>
    </ContextCard>
  )
}

function InboxStatsCard() {
  return (
    <ContextCard>
      <CardLabel>Stats</CardLabel>
      <div className="flex flex-col gap-2 mt-2">
        <ListItem label="Unread" value="2" />
        <ListItem label="Auto-handled today" value="14" />
        <ListItem label="Response rate" value="94%" dim />
      </div>
    </ContextCard>
  )
}

// ─── Card registry ──────────────────────────────────────────────────

// @ai-why: Card registry maps cardType strings to components. AI chat can dynamically add cards via onCardAdd.
const CARD_REGISTRY: Record<string, React.ComponentType> = {
  // Health (real data via HealthDataContext)
  workout: WorkoutCard,
  week: WeekCard,
  today: TodayCard,
  streak: StreakCard,
  // Money (mock)
  budget: BudgetCard,
  subscriptions: SubscriptionsCard,
  transactions: TransactionsCard,
  bills: BillsCard,
  // Life (mock)
  trip: TripCard,
  upcoming: UpcomingCard,
  stats: LifeStatsCard,
  // Inbox (mock)
  attention: AttentionCard,
  handled: HandledCard,
  'inbox-stats': InboxStatsCard,
}

// ─── Main export ────────────────────────────────────────────────────

interface ChatContextPanelProps {
  activeApp: AppId
  visibleCards?: string[]
  userId: string
}

export function ChatContextPanel({ activeApp, visibleCards = [], userId }: ChatContextPanelProps) {
  const healthState = useHealthData(userId)

  return (
    <HealthDataContext.Provider value={healthState}>
      <div className="h-full overflow-y-auto scrollbar-hide p-3">
        <div className="flex flex-col gap-2.5">
          {visibleCards.map((cardType, i) => {
            const CardComponent = CARD_REGISTRY[cardType]
            if (!CardComponent) return null
            return (
              <motion.div
                key={cardType}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <CardComponent />
              </motion.div>
            )
          })}
        </div>
      </div>
    </HealthDataContext.Provider>
  )
}
