'use client'

import { useState } from 'react'
import { ChevronDown, MoreHorizontal, Pencil, Archive, X, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import type { MemoryCategory, MemoryFact, GroupedFacts, CoachMemoryActions } from '@/hooks/useCoachMemory'

const MAX_FACTS = 50

// ─── Category config ────────────────────────────────────────────────

const CATEGORY_CONFIG: Record<MemoryCategory, { label: string; color: string; bg: string }> = {
  injuries: { label: 'Blessures', color: 'text-orange-400/80', bg: 'bg-orange-400/10' },
  nutrition: { label: 'Voeding', color: 'text-teal-400/80', bg: 'bg-teal-400/10' },
  preferences: { label: 'Voorkeuren', color: 'text-blue-400/80', bg: 'bg-blue-400/10' },
  goals: { label: 'Doelen', color: 'text-purple-400/80', bg: 'bg-purple-400/10' },
  lifestyle: { label: 'Levensstijl', color: 'text-pink-400/80', bg: 'bg-pink-400/10' },
  history: { label: 'Geschiedenis', color: 'text-white/40', bg: 'bg-white/[0.06]' },
  general: { label: 'Algemeen', color: 'text-white/50', bg: 'bg-white/[0.06]' },
}

const CATEGORIES: MemoryCategory[] = [
  'injuries', 'nutrition', 'preferences', 'goals', 'lifestyle', 'history', 'general',
]

// ─── Fact row ───────────────────────────────────────────────────────

function FactRow({
  fact,
  onArchive,
  onReactivate,
  onUpdate,
  archived = false,
}: {
  fact: MemoryFact
  onArchive?: (id: string) => void
  onReactivate?: (id: string) => void
  onUpdate?: (id: string, newFact: string) => void
  archived?: boolean
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editValue, setEditValue] = useState(fact.fact)

  const handleSave = () => {
    if (editValue.trim() && editValue !== fact.fact) {
      onUpdate?.(fact.id, editValue.trim())
    }
    setEditing(false)
  }

  const handleCancel = () => {
    setEditValue(fact.fact)
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="flex items-start gap-2 py-1.5 px-2 rounded-lg bg-white/[0.04]">
        <textarea
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          className="flex-1 bg-transparent text-[11px] text-white/70 resize-none outline-none min-h-[32px]"
          autoFocus
          rows={2}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSave() }
            if (e.key === 'Escape') handleCancel()
          }}
        />
        <div className="flex flex-col gap-1 shrink-0">
          <button onClick={handleSave} className="w-5 h-5 rounded flex items-center justify-center hover:bg-white/[0.08] transition-colors">
            <Check className="w-3 h-3 text-emerald-400/70" />
          </button>
          <button onClick={handleCancel} className="w-5 h-5 rounded flex items-center justify-center hover:bg-white/[0.08] transition-colors">
            <X className="w-3 h-3 text-white/30" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="group flex items-start gap-2 py-1.5 px-2 rounded-lg hover:bg-white/[0.03] transition-colors relative">
      <p className={cn('flex-1 text-[11px] leading-relaxed', archived ? 'text-white/25 line-through' : 'text-white/55')}>
        {fact.fact}
      </p>

      {archived ? (
        <button
          onClick={() => onReactivate?.(fact.id)}
          className="shrink-0 text-[9px] text-emerald-400/60 hover:text-emerald-400/90 transition-colors px-1.5 py-0.5 rounded bg-emerald-400/[0.08] hover:bg-emerald-400/[0.15]"
        >
          Reactiveer
        </button>
      ) : (
        <div className="relative shrink-0">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-5 h-5 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/[0.08]"
          >
            <MoreHorizontal className="w-3 h-3 text-white/30" />
          </button>

          <AnimatePresence>
            {menuOpen && (
              <>
                {/* Backdrop to close menu */}
                <div className="fixed inset-0 z-20" onClick={() => setMenuOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.1 }}
                  className="absolute right-0 top-6 z-30 rounded-lg bg-[#2a2a2e] border border-white/[0.10] shadow-lg overflow-hidden min-w-[120px]"
                >
                  <button
                    onClick={() => { setMenuOpen(false); setEditing(true) }}
                    className="flex items-center gap-2 px-3 py-2 text-[11px] text-white/55 hover:bg-white/[0.06] hover:text-white/80 transition-colors w-full text-left"
                  >
                    <Pencil className="w-3 h-3" />
                    Bewerken
                  </button>
                  <button
                    onClick={() => { setMenuOpen(false); onArchive?.(fact.id) }}
                    className="flex items-center gap-2 px-3 py-2 text-[11px] text-white/55 hover:bg-white/[0.06] hover:text-orange-400/80 transition-colors w-full text-left"
                  >
                    <Archive className="w-3 h-3" />
                    Archiveren
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}

// ─── Category group ─────────────────────────────────────────────────

function CategoryGroup({
  category,
  facts,
  actions,
}: {
  category: MemoryCategory
  facts: MemoryFact[]
  actions: CoachMemoryActions
}) {
  if (facts.length === 0) return null

  const config = CATEGORY_CONFIG[category]

  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <span className={cn('text-[9px] font-semibold uppercase tracking-[0.1em] px-1.5 py-0.5 rounded', config.color, config.bg)}>
          {config.label}
        </span>
        <span className="text-[9px] text-white/20">{facts.length}</span>
      </div>
      <div className="flex flex-col">
        {facts.map((fact) => (
          <FactRow
            key={fact.id}
            fact={fact}
            onArchive={actions.archiveFact}
            onUpdate={actions.updateFact}
          />
        ))}
      </div>
    </div>
  )
}

// ─── Main card ──────────────────────────────────────────────────────

interface MemoryFactsCardProps {
  memoryFacts: GroupedFacts
  totalFactCount: number
  loading: boolean
  actions: CoachMemoryActions
}

export function MemoryFactsCard({ memoryFacts, totalFactCount, loading, actions }: MemoryFactsCardProps) {
  const [showArchived, setShowArchived] = useState(false)

  if (loading) {
    return (
      <div className="rounded-xl bg-white/[0.05] border border-white/[0.08] p-3.5 animate-pulse">
        <div className="h-2 w-24 bg-white/[0.06] rounded mb-3" />
        <div className="space-y-2">
          <div className="h-3 w-full bg-white/[0.04] rounded" />
          <div className="h-3 w-3/4 bg-white/[0.04] rounded" />
          <div className="h-3 w-2/3 bg-white/[0.04] rounded" />
        </div>
      </div>
    )
  }

  const hasActiveFacts = Object.values(memoryFacts.active).some(arr => arr.length > 0)
  const archivedCount = memoryFacts.archived.length

  return (
    <div className="rounded-xl bg-white/[0.05] border border-white/[0.08] p-3.5">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-white/30">
          Coach Geheugen
        </p>
        <span className="text-[9px] text-white/20 font-medium">
          {totalFactCount}/{MAX_FACTS}
        </span>
      </div>

      {/* Category groups */}
      {hasActiveFacts ? (
        <div className="flex flex-col gap-3">
          {CATEGORIES.map((cat) => (
            <CategoryGroup
              key={cat}
              category={cat}
              facts={memoryFacts.active[cat]}
              actions={actions}
            />
          ))}
        </div>
      ) : (
        <p className="text-[12px] text-white/35 mt-2">Nog geen herinneringen</p>
      )}

      {/* Archived toggle */}
      {archivedCount > 0 && (
        <div className="mt-3 pt-3 border-t border-white/[0.06]">
          <button
            onClick={() => setShowArchived(!showArchived)}
            className="flex items-center gap-1.5 text-[10px] text-white/25 hover:text-white/40 transition-colors w-full"
          >
            <ChevronDown className={cn('w-3 h-3 transition-transform duration-200', showArchived && 'rotate-180')} />
            <span>Gearchiveerd ({archivedCount})</span>
          </button>

          <AnimatePresence>
            {showArchived && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="flex flex-col mt-2">
                  {memoryFacts.archived.map((fact) => (
                    <FactRow
                      key={fact.id}
                      fact={fact}
                      archived
                      onReactivate={actions.reactivateFact}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
