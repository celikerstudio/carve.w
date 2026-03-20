'use client'

import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import type { AppId } from './types'

// ─── Animated card wrapper ──────────────────────────────────────────

function ContextCard({ children, delay = 0, className }: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={cn(
        'rounded-xl bg-white/[0.05] border border-white/[0.08] p-3.5',
        className
      )}
    >
      {children}
    </motion.div>
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

// ─── Home cards ─────────────────────────────────────────────────────

function HomeCards() {
  const today = new Date()
  const dayName = today.toLocaleDateString('nl-NL', { weekday: 'long' })
  const dateStr = today.toLocaleDateString('nl-NL', { day: 'numeric', month: 'long' })

  return (
    <>
      {/* Date header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="mb-1"
      >
        <p className="text-[11px] text-white/30 capitalize">{dayName}</p>
        <p className="text-[15px] font-semibold text-white/60 capitalize">{dateStr}</p>
      </motion.div>

      {/* Today's plan */}
      <ContextCard delay={0.1}>
        <CardLabel>Vandaag</CardLabel>
        <div className="flex items-center justify-between mt-2">
          <p className="text-[13px] text-white/60 font-medium">Push Day</p>
          <span className="text-[10px] text-white/30">17:00</span>
        </div>
        <p className="text-[10px] text-white/30 mt-0.5">Chest · Shoulders · Triceps</p>
      </ContextCard>

      {/* Quick stats */}
      <ContextCard delay={0.2}>
        <CardLabel>Status</CardLabel>
        <div className="flex flex-col gap-2 mt-2">
          <ListItem label="Calorieën" value="1.1k / 2.2k" />
          <ListItem label="Eiwit" value="86g / 150g" />
          <ListItem label="Stappen" value="0" accent="red" />
        </div>
      </ContextCard>

      {/* Needs attention */}
      <ContextCard delay={0.35}>
        <CardLabel>Aandacht</CardLabel>
        <div className="flex flex-col gap-2.5 mt-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[12px] text-white/65">Coolblue</p>
              <p className="text-[10px] text-white/30">Due friday</p>
            </div>
            <span className="text-[12px] text-white/60 font-medium">€847</span>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-[12px] text-white/65">2 emails need review</p>
            <span className="text-[10px] text-white/30">inbox</span>
          </div>
        </div>
      </ContextCard>

      {/* This week */}
      <ContextCard delay={0.5}>
        <CardLabel>Deze week</CardLabel>
        <div className="flex flex-col gap-2 mt-2">
          <ListItem label="Workouts" value="3 / 4" />
          <ListItem label="Budget" value="€760 remaining" />
          <ListItem label="Barcelona" value="in 3 dagen" accent="green" />
        </div>
      </ContextCard>
    </>
  )
}

// ─── Health cards ───────────────────────────────────────────────────

function HealthCards() {
  return (
    <>
      {/* Workout card */}
      <ContextCard delay={0.05}>
        <CardLabel>Workout</CardLabel>
        <div className="flex items-center justify-between mt-2 mb-2">
          <p className="text-[14px] text-white/70 font-semibold">Push Day</p>
          <span className="text-[10px] text-white/35">Scheduled</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {['Chest', 'Shoulders', 'Triceps'].map((muscle) => (
            <span key={muscle} className="text-[10px] text-white/30 px-2 py-0.5 rounded-full bg-white/[0.06]">
              {muscle}
            </span>
          ))}
        </div>
      </ContextCard>

      {/* Week overview */}
      <ContextCard delay={0.15}>
        <CardLabel>This week</CardLabel>
        <div className="flex gap-2 mt-2 mb-2">
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => {
            const done = i < 3
            const today = i === 3
            return (
              <div key={day + i} className="flex flex-col items-center gap-1.5">
                <span className="text-[9px] text-white/30">{day}</span>
                <div className={cn(
                  'w-5 h-5 rounded-full flex items-center justify-center text-[9px]',
                  done ? 'bg-white/15 text-white/60' : today ? 'border border-white/20 text-white/40' : 'bg-white/[0.03] text-white/30'
                )}>
                  {done ? '✓' : today ? '·' : ''}
                </div>
              </div>
            )
          })}
        </div>
        <p className="text-[11px] text-white/35">3 of 4 workouts completed</p>
      </ContextCard>

      {/* Today's numbers */}
      <ContextCard delay={0.3}>
        <CardLabel>Today</CardLabel>
        <div className="flex flex-col gap-2 mt-2">
          <ListItem label="Steps" value="0 / 10k" accent="red" />
          <ListItem label="Calories" value="1.1k / 2.2k" />
          <ListItem label="Protein" value="86g / 150g" />
          <ListItem label="Water" value="1.5L / 3L" />
        </div>
      </ContextCard>

      {/* Streak */}
      <ContextCard delay={0.45}>
        <div className="flex justify-between items-center">
          <p className="text-[11px] text-white/30">12-day streak</p>
          <p className="text-[11px] text-white/30">3 this week</p>
        </div>
      </ContextCard>
    </>
  )
}

// ─── Money cards ────────────────────────────────────────────────────

function MoneyCards() {
  return (
    <>
      {/* Budget */}
      <ContextCard delay={0.05}>
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

      {/* Recent transactions */}
      <ContextCard delay={0.15}>
        <CardLabel>Recent</CardLabel>
        <div className="flex flex-col gap-2.5 mt-2">
          {[
            { name: 'Albert Heijn', cat: 'Groceries · Today', amount: '-€67.40' },
            { name: 'Spotify', cat: 'Subscription · Yesterday', amount: '-€10.99' },
            { name: 'Shell', cat: 'Transport · Monday', amount: '-€45.00' },
            { name: 'Coolblue', cat: 'Shopping · Sunday', amount: '-€847.00' },
          ].map((tx) => (
            <div key={tx.name} className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-[12px] text-white/60 truncate">{tx.name}</p>
                <p className="text-[10px] text-white/30">{tx.cat}</p>
              </div>
              <span className="text-[12px] text-white/35 font-medium shrink-0 ml-3">{tx.amount}</span>
            </div>
          ))}
        </div>
      </ContextCard>

      {/* Subscriptions + Bills */}
      <ContextCard delay={0.3}>
        <CardLabel>Subscriptions</CardLabel>
        <div className="mt-2">
          <ListItem label="12 active" value="€89/mo" />
        </div>
      </ContextCard>

      <ContextCard delay={0.4}>
        <CardLabel>Open bills</CardLabel>
        <div className="flex items-center justify-between mt-2">
          <div>
            <p className="text-[12px] text-white/60">Coolblue</p>
            <p className="text-[10px] text-white/30">Due friday</p>
          </div>
          <span className="text-[12px] text-white/60 font-semibold">€847</span>
        </div>
      </ContextCard>
    </>
  )
}

// ─── Life cards ─────────────────────────────────────────────────────

function LifeCards() {
  return (
    <>
      {/* Next trip */}
      <ContextCard delay={0.05}>
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

      {/* Upcoming */}
      <ContextCard delay={0.2}>
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

      {/* Stats */}
      <ContextCard delay={0.35}>
        <CardLabel>Stats</CardLabel>
        <div className="flex flex-col gap-2 mt-2">
          <ListItem label="Trips this year" value="2" />
          <ListItem label="Countries visited" value="5" />
          <ListItem label="Trips planned" value="3" />
        </div>
      </ContextCard>
    </>
  )
}

// ─── Inbox cards ────────────────────────────────────────────────────

function InboxCards() {
  return (
    <>
      {/* Needs attention */}
      <ContextCard delay={0.05}>
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

      {/* Auto-handled */}
      <ContextCard delay={0.2}>
        <CardLabel>Handled by AI today</CardLabel>
        <div className="flex flex-col gap-2 mt-2">
          <ListItem label="Newsletters archived" value="8" dim />
          <ListItem label="Promotions dismissed" value="4" dim />
          <ListItem label="Receipts → Money" value="2" dim />
        </div>
      </ContextCard>

      {/* Stats */}
      <ContextCard delay={0.35}>
        <CardLabel>Stats</CardLabel>
        <div className="flex flex-col gap-2 mt-2">
          <ListItem label="Unread" value="2" />
          <ListItem label="Auto-handled today" value="14" />
          <ListItem label="Response rate" value="94%" dim />
        </div>
      </ContextCard>
    </>
  )
}

// ─── Main export ─────────────────────────────────────────────────────

interface ChatContextPanelProps {
  activeApp: AppId
}

export function ChatContextPanel({ activeApp }: ChatContextPanelProps) {
  return (
    <div className="h-full overflow-y-auto scrollbar-hide p-3">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeApp}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="flex flex-col gap-2.5"
        >
          {activeApp === 'home' && <HomeCards />}
          {activeApp === 'health' && <HealthCards />}
          {activeApp === 'money' && <MoneyCards />}
          {activeApp === 'life' && <LifeCards />}
          {activeApp === 'inbox' && <InboxCards />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
