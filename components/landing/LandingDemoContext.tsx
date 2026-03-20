'use client'

import { motion, AnimatePresence } from 'framer-motion'

type PanelId = 'empty' | 'health' | 'money' | 'inbox' | 'life'

interface LandingDemoContextProps {
  activePanel: PanelId
}

export function LandingDemoContext({ activePanel }: LandingDemoContextProps) {
  return (
    <div className="h-full bg-[#0c0c0d] overflow-hidden relative">
      <AnimatePresence mode="wait">
        <motion.div
          key={activePanel}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -8 }}
          transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
          className="absolute inset-0 p-4 overflow-y-auto scrollbar-hide"
        >
          {activePanel === 'empty' && <EmptyView />}
          {activePanel === 'health' && <HealthView />}
          {activePanel === 'money' && <MoneyView />}
          {activePanel === 'inbox' && <InboxView />}
          {activePanel === 'life' && <LifeView />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function Label({ children, color }: { children: React.ReactNode; color?: string }) {
  return (
    <div className="flex items-center gap-1.5 mb-3">
      {color && <div className="w-[5px] h-[5px] rounded-full" style={{ background: color }} />}
      <span className="text-[10px] font-semibold uppercase tracking-[0.12em]" style={{ color: color || 'rgba(255,255,255,0.15)' }}>
        {children}
      </span>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-[11px] py-1">
      <span className="text-white/30">{label}</span>
      <span className="text-white/50">{value}</span>
    </div>
  )
}

function Bar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="h-[3px] bg-white/[0.04] rounded-full mt-1 overflow-hidden">
      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
    </div>
  )
}

function EmptyView() {
  return (
    <div className="flex items-center justify-center h-full">
      <p className="text-[11px] text-white/10 text-center leading-relaxed">
        Context from your<br />data appears here
      </p>
    </div>
  )
}

function HealthView() {
  return (
    <div className="flex flex-col gap-4">
      <Label color="#22c55e">Health</Label>
      <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-3">
        <p className="text-[13px] font-semibold text-white/60 mb-1">Push Day</p>
        <p className="text-[11px] text-white/20 mb-3">Today · 55 min · 5 exercises</p>
        <div className="flex flex-col gap-1">
          <Row label="Bench Press" value="4×8 · 80kg" />
          <Row label="OHP" value="3×10 · 45kg" />
          <Row label="Incline DB" value="3×12 · 28kg" />
          <Row label="Lateral Raise" value="4×15 · 12kg" />
        </div>
      </div>
      <div>
        <Label>Targets</Label>
        <Row label="Protein" value="110/150g" />
        <Bar pct={73} color="#22c55e" />
        <div className="mt-2" />
        <Row label="Calories" value="1,450/2,500" />
        <Bar pct={58} color="#22c55e" />
        <div className="mt-2" />
        <Row label="Steps" value="4,200/10K" />
        <Bar pct={42} color="#22c55e" />
      </div>
    </div>
  )
}

function MoneyView() {
  return (
    <div className="flex flex-col gap-4">
      <Label color="#3b82f6">Money</Label>
      <div>
        <p className="text-[24px] font-bold text-white/75 mb-0.5">€2,140</p>
        <p className="text-[11px] text-white/20 mb-2">of €3,400 remaining</p>
        <div className="h-[5px] bg-white/[0.04] rounded-full overflow-hidden">
          <div className="h-full rounded-full bg-[#3b82f6]" style={{ width: '63%' }} />
        </div>
      </div>
      <div>
        <Label>Open Bills</Label>
        <div className="rounded-xl bg-white/[0.02] border border-[#f59e0b]/10 p-3">
          <p className="text-[13px] font-semibold text-white/60">Coolblue — €847</p>
          <p className="text-[11px] text-white/20">Due Friday · From email</p>
        </div>
      </div>
      <div>
        <Label>Recent</Label>
        <Row label="Albert Heijn" value="-€23.40" />
        <Row label="Shell" value="-€62.10" />
        <Row label="Spotify" value="-€10.99" />
      </div>
    </div>
  )
}

function InboxView() {
  return (
    <div className="flex flex-col gap-4">
      <Label color="#f59e0b">Inbox</Label>
      <div className="grid grid-cols-2 gap-2">
        <div className="p-3 rounded-lg bg-[#f59e0b]/5 text-center">
          <p className="text-[20px] font-bold text-[#f59e0b]">2</p>
          <p className="text-[9px] text-[#f59e0b]/40">Need you</p>
        </div>
        <div className="p-3 rounded-lg bg-[#22c55e]/5 text-center">
          <p className="text-[20px] font-bold text-[#22c55e]">14</p>
          <p className="text-[9px] text-[#22c55e]/40">Handled</p>
        </div>
      </div>
      <div>
        <Label>Needs Attention</Label>
        <div className="rounded-lg bg-white/[0.02] border border-white/[0.04] p-3 mb-2">
          <p className="text-[12px] font-semibold text-white/50">Coolblue — Invoice</p>
          <p className="text-[10px] text-[#3b82f6] mt-1">→ Route to Money</p>
        </div>
        <div className="rounded-lg bg-white/[0.02] border border-white/[0.04] p-3">
          <p className="text-[12px] font-semibold text-white/50">KLM — Booking AMS→BCN</p>
          <p className="text-[10px] text-[#a855f7] mt-1">→ Route to Life</p>
        </div>
      </div>
      <div>
        <Label>Auto-Handled</Label>
        <Row label="Newsletters archived" value="8" />
        <Row label="Promotions dismissed" value="4" />
        <Row label="Receipts → Money" value="2" />
      </div>
    </div>
  )
}

function LifeView() {
  return (
    <div className="flex flex-col gap-4">
      <Label color="#a855f7">Life</Label>
      <div className="rounded-xl bg-white/[0.02] border border-[#a855f7]/10 p-3">
        <p className="text-[16px] font-bold text-white/70 mb-0.5">Barcelona 🇪🇸</p>
        <p className="text-[11px] text-white/20 mb-2">Mar 22–26 · In 3 days</p>
        <Row label="Flight" value="KL1677 · 09:40" />
        <Row label="Hotel" value="Hotel Arts · 4n" />
        <Row label="Budget" value="€1,200" />
      </div>
      <div>
        <Label>Upcoming</Label>
        <Row label="Dentist" value="Apr 2" />
        <Row label="Car insurance" value="Apr 14" />
      </div>
    </div>
  )
}
