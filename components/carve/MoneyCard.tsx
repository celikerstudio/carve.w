'use client';

import { motion } from 'framer-motion';
import { CreditCard, Sparkles } from 'lucide-react';

const CATEGORIES = [
  { name: 'Housing', amount: '$1,200', highlight: true },
  { name: 'Subscriptions', amount: '$89.99' },
  { name: 'Dining', amount: '$342.50' },
  { name: 'Transport', amount: '$215.00' },
];

const SUBSCRIPTIONS = [
  { name: 'Netflix', amount: '$15.99' },
  { name: 'Spotify', amount: '$9.99' },
  { name: 'iCloud', amount: '$2.99' },
];

export function MoneyCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      className="w-full max-w-sm mx-auto"
    >
      <div className="rounded-2xl border border-blue-500/[0.08] bg-blue-950/30 backdrop-blur-sm p-6 space-y-5">
        {/* Header */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-white/30 mb-1">
            Monthly Overview
          </p>
          <p className="text-sm text-white/40 mb-3">February 2026</p>
          <div className="flex items-baseline justify-between">
            <h3 className="text-3xl font-bold text-white">$2,847.50</h3>
            <span className="text-sm font-medium text-red-400">+3.2%</span>
          </div>
        </div>

        {/* Category breakdown */}
        <div className="grid grid-cols-2 gap-2">
          {CATEGORIES.map((cat) => (
            <div
              key={cat.name}
              className={`rounded-lg px-3 py-2.5 ${
                cat.highlight
                  ? 'bg-blue-500/[0.08] border border-blue-500/[0.1]'
                  : 'bg-blue-950/40 border border-blue-500/[0.06]'
              }`}
            >
              <p className="text-[11px] text-white/40 mb-0.5">{cat.name}</p>
              <p className="text-white font-semibold text-sm">{cat.amount}</p>
            </div>
          ))}
        </div>

        {/* Active Subscriptions */}
        <div className="rounded-xl border border-blue-500/[0.06] bg-blue-950/20 p-4">
          <div className="flex items-center gap-2 mb-3">
            <CreditCard className="w-3.5 h-3.5 text-white/40" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-white/40">
              Active Subscriptions
            </span>
          </div>
          <p className="text-sm text-white/60 mb-3">
            <span className="text-white font-medium">12 services</span>
            {' '}&middot;{' '}$89.99/mo
          </p>

          <div className="space-y-2">
            {SUBSCRIPTIONS.map((sub) => (
              <div
                key={sub.name}
                className="flex items-center justify-between px-3 py-2 rounded-lg bg-blue-950/40"
              >
                <span className="text-sm text-white/70">{sub.name}</span>
                <span className="text-sm text-white font-medium">{sub.amount}</span>
              </div>
            ))}
          </div>

          <p className="mt-3 text-xs text-white/50">
            Next payment: <span className="text-white/80 font-medium">Tomorrow</span>
          </p>
        </div>

        {/* Savings insight */}
        <div className="rounded-lg border border-green-500/[0.12] bg-green-500/[0.06] px-4 py-3">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-green-400/80" />
            <p className="text-sm font-medium text-green-400">
              Potential savings: $24.99/mo
            </p>
          </div>
          <p className="text-xs text-white/40">
            2 unused subscriptions detected
          </p>
        </div>
      </div>
    </motion.div>
  );
}
