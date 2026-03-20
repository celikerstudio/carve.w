'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { CATEGORY_CONFIG, type SpendingCategory } from '@/components/money/sample-data'

interface AddTransactionModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  userId: string
}

const CATEGORIES = Object.entries(CATEGORY_CONFIG) as [SpendingCategory, typeof CATEGORY_CONFIG[SpendingCategory]][]

const inputClass =
  'w-full px-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-white placeholder-[#555d70] focus:outline-none focus:border-white/20 transition-colors'

export function AddTransactionModal({ open, onClose, onSuccess, userId }: AddTransactionModalProps) {
  const [amount, setAmount] = useState('')
  const [type, setType] = useState<'expense' | 'income'>('expense')
  const [category, setCategory] = useState<SpendingCategory>('dining')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0])
  const [isRecurring, setIsRecurring] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const parsedAmount = parseFloat(amount)
    if (!parsedAmount || parsedAmount <= 0) return

    setSaving(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.from('money_transactions').insert({
        user_id: userId,
        amount: parsedAmount,
        type,
        category,
        description: description.trim(),
        transaction_date: date,
        is_recurring: isRecurring,
      })

      if (error) throw error

      // Reset form
      setAmount('')
      setType('expense')
      setCategory('dining')
      setDescription('')
      setDate(new Date().toISOString().split('T')[0])
      setIsRecurring(false)
      onSuccess()
      onClose()
    } catch (err) {
      console.error('Failed to add transaction:', err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div
              className="w-full max-w-md rounded-xl p-5 bg-[#1c1f27] border border-white/[0.06]"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-lg font-semibold text-white mb-1">Transactie toevoegen</h2>
              <p className="text-xs text-[#555d70] mb-5">Log een uitgave of inkomst</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Type toggle */}
                <div className="flex bg-white/[0.04] p-1 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setType('expense')}
                    className={cn(
                      'flex-1 py-2 rounded-md text-sm font-medium transition-all',
                      type === 'expense'
                        ? 'bg-white/10 text-white'
                        : 'text-white/40 hover:text-white/60',
                    )}
                  >
                    Uitgave
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('income')}
                    className={cn(
                      'flex-1 py-2 rounded-md text-sm font-medium transition-all',
                      type === 'income'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'text-white/40 hover:text-white/60',
                    )}
                  >
                    Inkomst
                  </button>
                </div>

                {/* Amount - primary field */}
                <div>
                  <label className="block text-xs text-[#7a8299] mb-1.5">Bedrag *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-sm">€</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className={cn(inputClass, 'pl-7 text-lg font-semibold')}
                      autoFocus
                      required
                    />
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs text-[#7a8299] mb-1.5">Categorie *</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {CATEGORIES.map(([key, config]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setCategory(key)}
                        className={cn(
                          'flex flex-col items-center gap-1 py-2 px-1 rounded-lg text-[10px] transition-all border',
                          category === key
                            ? 'bg-white/10 border-white/20 text-white'
                            : 'bg-white/[0.02] border-transparent text-white/40 hover:bg-white/[0.04]',
                        )}
                      >
                        <span className="text-sm">{config.icon}</span>
                        <span className="truncate w-full text-center">{config.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs text-[#7a8299] mb-1.5">Beschrijving</label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="bijv. Albert Heijn boodschappen"
                    className={inputClass}
                  />
                </div>

                {/* Date + Recurring */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-[#7a8299] mb-1.5">Datum</label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div className="flex items-end pb-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isRecurring}
                        onChange={(e) => setIsRecurring(e.target.checked)}
                        className="w-4 h-4 rounded border-white/20 bg-white/[0.04] accent-white/60"
                      />
                      <span className="text-xs text-[#7a8299]">Terugkerend</span>
                    </label>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm text-[#7a8299] hover:text-white transition-colors"
                  >
                    Annuleer
                  </button>
                  <button
                    type="submit"
                    disabled={saving || !amount}
                    className={cn(
                      'px-5 py-2 text-sm font-medium rounded-lg transition-colors',
                      'bg-white/90 text-[#0c0e14] hover:bg-white',
                      'disabled:opacity-40 disabled:cursor-not-allowed',
                    )}
                  >
                    {saving ? 'Opslaan...' : 'Toevoegen'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
