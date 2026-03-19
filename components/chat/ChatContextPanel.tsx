'use client'

import { cn } from '@/lib/utils'
import type { AppId } from './types'
import {
  mockRankData,
  mockChallenges,
  mockLeaderboard,
} from '@/components/dashboard/hub/mock-data'

// ─── Shared primitives ──────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-white/20 mb-3">
      {children}
    </p>
  )
}

function Divider() {
  return <div className="h-px bg-white/[0.04]" />
}

function StatBar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = Math.min((value / max) * 100, 100)
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-[12px] text-white/40 font-medium">{label}</span>
        <span className="text-[12px] text-white font-bold">{value}</span>
      </div>
      <div className="h-[2px] bg-white/[0.04] rounded-full">
        <div
          className="h-full bg-white/30 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

function ObjectiveItem({ label, detail, xp, urgent }: {
  label: string
  detail: string
  xp: number
  urgent?: boolean
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <div className={cn(
          'w-[5px] h-[5px] rounded-[1px] rotate-45 shrink-0',
          urgent ? 'bg-white/50' : 'border border-white/15'
        )} />
        <div>
          <p className={cn('text-[12px]', urgent ? 'text-white/60' : 'text-white/35')}>{label}</p>
          <p className="text-[10px] text-white/15">{detail}</p>
        </div>
      </div>
      <span className="text-[10px] text-white/15">+{xp}</span>
    </div>
  )
}

function ListItem({ label, value, dim }: { label: string; value: string; dim?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={cn('text-[12px]', dim ? 'text-white/25' : 'text-white/50')}>{label}</span>
      <span className={cn('text-[12px]', dim ? 'text-white/15' : 'text-white/35')}>{value}</span>
    </div>
  )
}

// ─── Home panel (character sheet) ────────────────────────────────────

function HomePanel() {
  const { rankName, currentXp, nextLevelXp, level, streak } = mockRankData
  const xpPct = (currentXp / nextLevelXp) * 100

  return (
    <div className="flex flex-col gap-6">
      {/* Identity */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <p className="text-[16px] font-bold text-white">Furkan</p>
          <div className="px-2 py-0.5 border border-white/[0.08] rounded">
            <span className="text-[10px] text-white/40 font-semibold">{level}</span>
          </div>
        </div>
        <p className="text-[11px] text-white/20 mb-3">{rankName} · {streak}-day streak</p>
        <div className="h-[2px] bg-white/[0.04] rounded-full">
          <div className="h-full bg-white/25 rounded-full" style={{ width: `${xpPct}%` }} />
        </div>
        <p className="text-[10px] text-white/15 mt-1.5 text-right">
          {currentXp.toLocaleString()} / {nextLevelXp.toLocaleString()}
        </p>
      </div>

      {/* Stats */}
      <div>
        <SectionLabel>Stats</SectionLabel>
        <div className="flex flex-col gap-3.5">
          <StatBar label="Body" value={75} max={100} />
          <StatBar label="Wealth" value={38} max={100} />
          <StatBar label="Mind" value={62} max={100} />
          <StatBar label="Discipline" value={84} max={100} />
        </div>
      </div>

      <Divider />

      {/* Objectives */}
      <div>
        <SectionLabel>Objectives</SectionLabel>
        <div className="flex flex-col gap-2.5">
          <ObjectiveItem label="Coolblue — €847" detail="due friday" xp={120} urgent />
          <ObjectiveItem label="Leg Day" detail="17:00" xp={80} />
          <ObjectiveItem label="Clear inbox" detail="2 items" xp={50} />
        </div>
      </div>

      <Divider />

      {/* Bottom */}
      <div className="flex justify-between items-center">
        <p className="text-[10px] text-white/15">#2 on leaderboard</p>
        <p className="text-[10px] text-white/15">Barcelona in 3d</p>
      </div>
    </div>
  )
}

// ─── Health panel ────────────────────────────────────────────────────

function HealthPanel() {
  return (
    <div className="flex flex-col gap-6">
      {/* Today's workout */}
      <div>
        <SectionLabel>Today&apos;s workout</SectionLabel>
        <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[14px] text-white font-semibold">Push Day</p>
            <span className="text-[10px] text-white/25">Scheduled</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {['Chest', 'Shoulders', 'Triceps'].map((muscle) => (
              <span key={muscle} className="text-[10px] text-white/35 px-2 py-0.5 rounded-full bg-white/[0.04]">
                {muscle}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Week overview */}
      <div>
        <SectionLabel>This week</SectionLabel>
        <div className="flex gap-2 mb-3">
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => {
            const done = i < 3
            const today = i === 3
            return (
              <div key={day + i} className="flex flex-col items-center gap-1.5">
                <span className="text-[9px] text-white/20">{day}</span>
                <div className={cn(
                  'w-5 h-5 rounded-full flex items-center justify-center text-[9px]',
                  done ? 'bg-white/15 text-white/60' : today ? 'border border-white/20 text-white/40' : 'bg-white/[0.03] text-white/15'
                )}>
                  {done ? '✓' : today ? '·' : ''}
                </div>
              </div>
            )
          })}
        </div>
        <p className="text-[11px] text-white/30">3 of 4 workouts completed</p>
      </div>

      <Divider />

      {/* Today's numbers */}
      <div>
        <SectionLabel>Today</SectionLabel>
        <div className="flex flex-col gap-2.5">
          <ListItem label="Steps" value="8,241 / 10k" />
          <ListItem label="Calories" value="1,840 / 2,200" />
          <ListItem label="Protein" value="95g / 150g" />
          <ListItem label="Water" value="1.5L / 3L" />
        </div>
      </div>

      <Divider />

      {/* Challenges */}
      <div>
        <SectionLabel>Challenges</SectionLabel>
        <div className="flex flex-col gap-2.5">
          {mockChallenges.map((c) => {
            const pct = Math.min((c.current / c.target) * 100, 100)
            const display = c.current >= 1000 ? `${(c.current / 1000).toFixed(1)}k` : `${c.current}`
            const targetDisplay = c.target >= 1000 ? `${(c.target / 1000).toFixed(0)}k` : `${c.target}`
            return (
              <div key={c.id}>
                <div className="flex justify-between mb-1">
                  <span className="text-[11px] text-white/40">{c.label}</span>
                  <span className="text-[10px] text-white/20">{display}/{targetDisplay}</span>
                </div>
                <div className="h-[2px] bg-white/[0.04] rounded-full">
                  <div className="h-full bg-white/25 rounded-full" style={{ width: `${pct}%` }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <Divider />

      {/* Streak */}
      <div className="flex justify-between items-center">
        <p className="text-[10px] text-white/15">12-day streak</p>
        <p className="text-[10px] text-white/15">Level 7 · 2,450 XP</p>
      </div>
    </div>
  )
}

// ─── Money panel ─────────────────────────────────────────────────────

function MoneyPanel() {
  return (
    <div className="flex flex-col gap-6">
      {/* Budget */}
      <div>
        <SectionLabel>Budget — March</SectionLabel>
        <div className="flex items-baseline justify-between mb-2">
          <p className="text-[24px] font-bold text-white tracking-tight">€760</p>
          <p className="text-[12px] text-white/20">/ €2,000</p>
        </div>
        <div className="h-[3px] bg-white/[0.04] rounded-full">
          <div className="h-full bg-white/25 rounded-full" style={{ width: '62%' }} />
        </div>
        <p className="text-[10px] text-white/20 mt-1.5">62% spent · 12 days remaining</p>
      </div>

      <Divider />

      {/* Recent transactions */}
      <div>
        <SectionLabel>Recent</SectionLabel>
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[12px] text-white/50">Albert Heijn</p>
              <p className="text-[10px] text-white/15">Groceries · Today</p>
            </div>
            <span className="text-[12px] text-white/40 font-medium">-€67.40</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[12px] text-white/50">Spotify</p>
              <p className="text-[10px] text-white/15">Subscription · Yesterday</p>
            </div>
            <span className="text-[12px] text-white/40 font-medium">-€10.99</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[12px] text-white/50">Shell</p>
              <p className="text-[10px] text-white/15">Transport · Monday</p>
            </div>
            <span className="text-[12px] text-white/40 font-medium">-€45.00</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[12px] text-white/50">Coolblue</p>
              <p className="text-[10px] text-white/15">Shopping · Sunday</p>
            </div>
            <span className="text-[12px] text-white/40 font-medium">-€847.00</span>
          </div>
        </div>
      </div>

      <Divider />

      {/* Subscriptions */}
      <div>
        <SectionLabel>Subscriptions</SectionLabel>
        <div className="flex items-baseline justify-between">
          <p className="text-[14px] text-white font-semibold">12 active</p>
          <p className="text-[12px] text-white/25">€89/mo</p>
        </div>
      </div>

      <Divider />

      {/* Bills */}
      <div>
        <SectionLabel>Open bills</SectionLabel>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[12px] text-white/50">Coolblue</p>
            <p className="text-[10px] text-white/15">Due friday</p>
          </div>
          <span className="text-[12px] text-white font-semibold">€847</span>
        </div>
      </div>
    </div>
  )
}

// ─── Life panel ──────────────────────────────────────────────────────

function LifePanel() {
  return (
    <div className="flex flex-col gap-6">
      {/* Next trip */}
      <div>
        <SectionLabel>Next trip</SectionLabel>
        <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[16px] text-white font-bold">Barcelona</p>
            <span className="text-[11px] text-white/25">in 3 days</span>
          </div>
          <div className="flex flex-col gap-1.5">
            <ListItem label="Flight" value="KLM · Confirmed" />
            <ListItem label="Hotel" value="3 nights · Confirmed" />
            <ListItem label="Dates" value="Mar 22 — 25" />
            <ListItem label="Budget" value="€1,200" />
          </div>
        </div>
      </div>

      <Divider />

      {/* Upcoming */}
      <div>
        <SectionLabel>Upcoming</SectionLabel>
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <p className="text-[12px] text-white/50">Tandarts</p>
            <p className="text-[11px] text-white/20">Mar 28 · 10:00</p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-[12px] text-white/50">Belastingaangifte</p>
            <p className="text-[11px] text-white/20">Apr 15 · deadline</p>
          </div>
        </div>
      </div>

      <Divider />

      {/* Travel stats */}
      <div>
        <SectionLabel>Stats</SectionLabel>
        <div className="flex flex-col gap-2">
          <ListItem label="Trips this year" value="2" />
          <ListItem label="Countries visited" value="5" />
          <ListItem label="Trips planned" value="3" />
        </div>
      </div>
    </div>
  )
}

// ─── Inbox panel ─────────────────────────────────────────────────────

function InboxPanel() {
  return (
    <div className="flex flex-col gap-6">
      {/* Needs attention */}
      <div>
        <SectionLabel>Needs attention</SectionLabel>
        <div className="flex flex-col gap-2.5">
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3">
            <p className="text-[12px] text-white/60 font-medium mb-0.5">Belastingdienst</p>
            <p className="text-[11px] text-white/25">Voorlopige aanslag 2026</p>
            <p className="text-[10px] text-white/15 mt-1">AI: Deadline april 15 — route to Money?</p>
          </div>
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3">
            <p className="text-[12px] text-white/60 font-medium mb-0.5">KLM</p>
            <p className="text-[11px] text-white/25">Vluchtbevestiging Barcelona</p>
            <p className="text-[10px] text-white/15 mt-1">AI: Added to Barcelona trip</p>
          </div>
        </div>
      </div>

      <Divider />

      {/* Auto-handled */}
      <div>
        <SectionLabel>Handled by AI today</SectionLabel>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <p className="text-[11px] text-white/35">Newsletters archived</p>
            <span className="text-[11px] text-white/20">8</span>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-[11px] text-white/35">Promotions dismissed</p>
            <span className="text-[11px] text-white/20">4</span>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-[11px] text-white/35">Receipts → Money</p>
            <span className="text-[11px] text-white/20">2</span>
          </div>
        </div>
      </div>

      <Divider />

      {/* Summary */}
      <div>
        <SectionLabel>Inbox stats</SectionLabel>
        <div className="flex flex-col gap-2">
          <ListItem label="Unread" value="2" />
          <ListItem label="Auto-handled today" value="14" />
          <ListItem label="Response rate" value="94%" dim />
        </div>
      </div>
    </div>
  )
}

// ─── Main export ─────────────────────────────────────────────────────

interface ChatContextPanelProps {
  activeApp: AppId
}

export function ChatContextPanel({ activeApp }: ChatContextPanelProps) {
  return (
    <div className="h-full overflow-y-auto scrollbar-hide p-4">
      {activeApp === 'home' && <HomePanel />}
      {activeApp === 'health' && <HealthPanel />}
      {activeApp === 'money' && <MoneyPanel />}
      {activeApp === 'life' && <LifePanel />}
      {activeApp === 'inbox' && <InboxPanel />}
    </div>
  )
}
