'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { LogbookEntry, LogbookCategory } from '@/hooks/useCoachMemory'

// ─── Category config ────────────────────────────────────────────────

const LOGBOOK_CATEGORY_CONFIG: Record<LogbookCategory, { label: string; dotColor: string }> = {
  observation: { label: 'Observatie', dotColor: 'bg-blue-400' },
  milestone: { label: 'Mijlpaal', dotColor: 'bg-emerald-400' },
  concern: { label: 'Aandachtspunt', dotColor: 'bg-orange-400' },
  decision: { label: 'Beslissing', dotColor: 'bg-purple-400' },
}

// ─── Date formatter ─────────────────────────────────────────────────

function formatEntryDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Vandaag'
  if (diffDays === 1) return 'Gisteren'
  if (diffDays < 7) return `${diffDays}d geleden`
  return date.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })
}

// ─── Entry row ──────────────────────────────────────────────────────

function LogbookEntryRow({ entry }: { entry: LogbookEntry }) {
  const config = LOGBOOK_CATEGORY_CONFIG[entry.category] ?? LOGBOOK_CATEGORY_CONFIG.observation

  return (
    <div className="flex gap-2.5 py-1.5">
      {/* Timeline dot */}
      <div className="flex flex-col items-center pt-1.5 shrink-0">
        <div className={cn('w-1.5 h-1.5 rounded-full', config.dotColor)} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-[9px] text-white/25 font-medium uppercase tracking-wide">
            {config.label}
          </span>
          <span className="text-[9px] text-white/15">
            {formatEntryDate(entry.entry_date)}
          </span>
        </div>
        <p className="text-[11px] text-white/50 leading-relaxed">
          {entry.content}
        </p>
      </div>
    </div>
  )
}

// ─── Main card ──────────────────────────────────────────────────────

const PAGE_SIZE = 20

interface LogbookCardProps {
  logbookEntries: LogbookEntry[]
  loading: boolean
}

export function LogbookCard({ logbookEntries, loading }: LogbookCardProps) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  if (loading) {
    return (
      <div className="rounded-xl bg-white/[0.05] border border-white/[0.08] p-3.5 animate-pulse">
        <div className="h-2 w-16 bg-white/[0.06] rounded mb-3" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-2.5">
              <div className="w-1.5 h-1.5 rounded-full bg-white/[0.06] mt-1.5 shrink-0" />
              <div className="flex-1 space-y-1">
                <div className="h-2 w-20 bg-white/[0.04] rounded" />
                <div className="h-3 w-full bg-white/[0.04] rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (logbookEntries.length === 0) {
    return (
      <div className="rounded-xl bg-white/[0.05] border border-white/[0.08] p-3.5">
        <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-white/30 mb-0.5">
          Logbook
        </p>
        <p className="text-[12px] text-white/35 mt-2">Nog geen notities</p>
      </div>
    )
  }

  const visibleEntries = logbookEntries.slice(0, visibleCount)
  const hasMore = logbookEntries.length > visibleCount

  return (
    <div className="rounded-xl bg-white/[0.05] border border-white/[0.08] p-3.5">
      <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-white/30 mb-2">
        Logbook
      </p>

      <div className="flex flex-col">
        {visibleEntries.map((entry) => (
          <LogbookEntryRow key={entry.id} entry={entry} />
        ))}
      </div>

      {hasMore && (
        <button
          onClick={() => setVisibleCount(prev => prev + PAGE_SIZE)}
          className="w-full mt-2 pt-2 border-t border-white/[0.06] text-[10px] text-white/25 hover:text-white/40 transition-colors text-center"
        >
          Meer laden ({logbookEntries.length - visibleCount} over)
        </button>
      )}
    </div>
  )
}
