'use client'

import { useState } from 'react'
import { ChevronDown, Pencil, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import type { ProfileSection, CoachProfileMap, CoachMemoryActions } from '@/hooks/useCoachMemory'

// ─── Section config ─────────────────────────────────────────────────

const SECTION_CONFIG: { key: ProfileSection; label: string }[] = [
  { key: 'goals', label: 'Doelen' },
  { key: 'schedule', label: 'Schema' },
  { key: 'limitations', label: 'Beperkingen' },
  { key: 'nutrition', label: 'Voeding' },
  { key: 'coaching', label: 'Coaching' },
]

// ─── Section block ──────────────────────────────────────────────────

function ProfileSectionBlock({
  sectionKey,
  label,
  content,
  onSave,
}: {
  sectionKey: ProfileSection
  label: string
  content: string | null
  onSave: (section: ProfileSection, content: string) => Promise<void>
}) {
  const [expanded, setExpanded] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editValue, setEditValue] = useState(content ?? '')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!editValue.trim()) return
    setSaving(true)
    try {
      await onSave(sectionKey, editValue.trim())
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setEditValue(content ?? '')
    setEditing(false)
  }

  const handleStartEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    setExpanded(true)
    setEditing(true)
    setEditValue(content ?? '')
  }

  return (
    <div className="border-b border-white/[0.05] last:border-b-0">
      <button
        onClick={() => { if (!editing) setExpanded(!expanded) }}
        className="flex items-center justify-between w-full py-2 px-1 group"
      >
        <span className="text-[11px] font-medium text-white/55 group-hover:text-white/70 transition-colors">
          {label}
        </span>
        <div className="flex items-center gap-1.5">
          {!editing && (
            <button
              onClick={handleStartEdit}
              className="w-5 h-5 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/[0.08]"
            >
              <Pencil className="w-2.5 h-2.5 text-white/30" />
            </button>
          )}
          <ChevronDown
            className={cn(
              'w-3 h-3 text-white/20 transition-transform duration-200',
              expanded && 'rotate-180'
            )}
          />
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="px-1 pb-2.5">
              {editing ? (
                <div className="flex flex-col gap-2">
                  <textarea
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-2.5 py-2 text-[11px] text-white/65 resize-none outline-none focus:border-white/[0.15] transition-colors min-h-[60px]"
                    autoFocus
                    rows={3}
                    placeholder="Typ hier..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.metaKey) handleSave()
                      if (e.key === 'Escape') handleCancel()
                    }}
                  />
                  <div className="flex items-center gap-1.5 justify-end">
                    <button
                      onClick={handleCancel}
                      className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] text-white/35 hover:text-white/55 hover:bg-white/[0.06] transition-colors"
                    >
                      <X className="w-3 h-3" />
                      Annuleer
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving || !editValue.trim()}
                      className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] text-emerald-400/70 hover:text-emerald-400/90 hover:bg-emerald-400/[0.08] transition-colors disabled:opacity-30"
                    >
                      <Check className="w-3 h-3" />
                      {saving ? 'Opslaan...' : 'Opslaan'}
                    </button>
                  </div>
                </div>
              ) : (
                <p className={cn(
                  'text-[11px] leading-relaxed',
                  content ? 'text-white/45' : 'text-white/20 italic'
                )}>
                  {content ?? 'Nog niet ingesteld'}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Main card ──────────────────────────────────────────────────────

interface CoachProfileCardProps {
  coachProfile: CoachProfileMap
  loading: boolean
  actions: CoachMemoryActions
}

export function CoachProfileCard({ coachProfile, loading, actions }: CoachProfileCardProps) {
  if (loading) {
    return (
      <div className="rounded-xl bg-white/[0.05] border border-white/[0.08] p-3.5 animate-pulse">
        <div className="h-2 w-20 bg-white/[0.06] rounded mb-3" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-6 w-full bg-white/[0.04] rounded" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl bg-white/[0.05] border border-white/[0.08] p-3.5">
      <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-white/30 mb-1">
        Profiel
      </p>

      <div className="flex flex-col">
        {SECTION_CONFIG.map(({ key, label }) => (
          <ProfileSectionBlock
            key={key}
            sectionKey={key}
            label={label}
            content={coachProfile[key]}
            onSave={actions.updateProfileSection}
          />
        ))}
      </div>
    </div>
  )
}
