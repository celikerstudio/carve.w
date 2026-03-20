'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { CATEGORY_CONFIG, type SpendingCategory } from '@/components/money/sample-data'

interface AddSubscriptionModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  userId: string
}

const CATEGORIES = Object.entries(CATEGORY_CONFIG) as [SpendingCategory, typeof CATEGORY_CONFIG[SpendingCategory]][]

const inputClass =
  'w-full px-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-white placeholder-[#555d70] focus:outline-none focus:border-white/20 transition-colors'

export function AddSubscriptionModal({ open, onClose, onSuccess, userId }: AddSubscriptionModalProps) {
  const [name, setName] = useState('')
  const [cost, setCost] = useState('')
  const [frequency, setFrequency] = useState<'monthly' | 'yearly'>('monthly')
  const [category, setCategory] = useState<SpendingCategory>('subscriptions')
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0])
  const [billingDay, setBillingDay] = useState(() => String(new Date().getDate()))
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const parsedCost = parseFloat(cost)
    if (!name.trim() || !parsedCost || parsedCost <= 0) return

    setSaving(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.from('money_subscriptions').insert({
        user_id: userId,
        name: name.trim(),
        cost: parsedCost,
        frequency,
        category,
        start_date: startDate,
        billing_day: Math.min(28, Math.max(1, parseInt(billingDay) || 1)),
      })

      if (error) throw error

      // Reset form
      setName('')
      setCost('')
      setFrequency('monthly')
      setCategory('subscriptions')
      setStartDate(new Date().toISOString().split('T')[0])
      setBillingDay(String(new Date().getDate()))
      onSuccess()
      onClose()
    } catch (err) {
      console.error('Failed to add subscription:', err)
    } finally {
      setSaving(false)
    }
  }

  const monthlyCost = frequency === 'yearly' && cost
    ? (parseFloat(cost) / 12).toFixed(2)
    : null

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
              <h2 className="text-lg font-semibold text-white mb-1">Abonnement toevoegen</h2>
              <p className="text-xs text-[#555d70] mb-5">Voeg een terugkerende betaling toe</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-xs text-[#7a8299] mb-1.5">Naam *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="bijv. Netflix, Spotify, sportschool"
                    className={inputClass}
                    autoFocus
                    required
                  />
                </div>

                {/* Cost + Frequency */}
                <div className="grid grid-cols-5 gap-3">
                  <div className="col-span-3">
                    <label className="block text-xs text-[#7a8299] mb-1.5">Kosten *</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-sm">€</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={cost}
                        onChange={(e) => setCost(e.target.value)}
                        placeholder="0.00"
                        className={cn(inputClass, 'pl-7')}
                        required
                      />
                    </div>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-[#7a8299] mb-1.5">Frequentie</label>
                    <select
                      value={frequency}
                      onChange={(e) => setFrequency(e.target.value as 'monthly' | 'yearly')}
                      className={inputClass}
                    >
                      <option value="monthly">Maandelijks</option>
                      <option value="yearly">Jaarlijks</option>
                    </select>
                  </div>
                </div>

                {monthlyCost && (
                  <p className="text-[11px] text-white/30 -mt-2">= €{monthlyCost}/maand</p>
                )}

                {/* Category - compact row */}
                <div>
                  <label className="block text-xs text-[#7a8299] mb-1.5">Categorie</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as SpendingCategory)}
                    className={inputClass}
                  >
                    {CATEGORIES.map(([key, config]) => (
                      <option key={key} value={key}>{config.icon} {config.label}</option>
                    ))}
                  </select>
                </div>

                {/* Start date + Billing day */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-[#7a8299] mb-1.5">Startdatum</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#7a8299] mb-1.5">Betaaldag (1-28)</label>
                    <input
                      type="number"
                      min="1"
                      max="28"
                      value={billingDay}
                      onChange={(e) => setBillingDay(e.target.value)}
                      className={inputClass}
                    />
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
                    disabled={saving || !name.trim() || !cost}
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
