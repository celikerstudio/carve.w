'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Check, X, Dumbbell, Wallet, MapPin,
} from 'lucide-react';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { APP_STORE_URL } from '@/lib/utils';

const FREE_FEATURES = [
  'Workout & meal logging',
  'Expense tracking & budgets',
  'Trip planning & itineraries',
  'Rank system & leaderboard',
  '3 AI analyses per day',
  'Wiki — always free',
];

const PRO_FEATURES = [
  'Everything in Free',
  '~30 AI analyses per day',
  'Unlimited workout history',
  'Advanced analytics & PR tracking',
  'Data export across all products',
  'Priority support',
];

const PRO_PER_PRODUCT = [
  {
    icon: Dumbbell,
    label: 'Health',
    accent: '#D4A843',
    feature: 'Advanced analytics, PR tracking & unlimited history',
  },
  {
    icon: Wallet,
    label: 'Money',
    accent: '#3B82F6',
    feature: 'Smart insights, export & subscription intelligence',
  },
  {
    icon: MapPin,
    label: 'Travel',
    accent: '#F97316',
    feature: 'AI trip planner, unlimited itineraries & budget tools',
  },
];


export function PricingHub() {
  const [yearly, setYearly] = useState(true);

  return (
    <section className="py-24 md:py-32 px-6">
      <ScrollReveal animation="fade-up">
        <div className="text-center mb-6">
          <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
            One subscription. Everything unlocked.
          </h2>
          <p className="text-white/40 mt-4 max-w-lg mx-auto text-sm md:text-base leading-relaxed">
            Health, money, travel&nbsp;&mdash; one Pro plan gives you full access across every Carve product. Wiki is always free.
          </p>
        </div>
      </ScrollReveal>

      {/* Billing toggle */}
      <ScrollReveal animation="fade-up" delay={0.05}>
        <div className="flex items-center justify-center gap-3 mb-12">
          <span className={`text-sm ${!yearly ? 'text-white' : 'text-white/40'}`}>Monthly</span>
          <button
            onClick={() => setYearly((y) => !y)}
            className="relative w-12 h-6 rounded-full bg-white/[0.08] border border-white/[0.06] transition-colors"
          >
            <motion.div
              className="absolute top-0.5 w-5 h-5 rounded-full bg-white"
              animate={{ left: yearly ? '26px' : '2px' }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          </button>
          <span className={`text-sm ${yearly ? 'text-white' : 'text-white/40'}`}>
            Yearly
            <span className="ml-1.5 text-[10px] font-semibold text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded">
              -40%
            </span>
          </span>
        </div>
      </ScrollReveal>

      {/* Pricing cards */}
      <div className="max-w-3xl mx-auto grid md:grid-cols-2 gap-4 mb-12">
        {/* Free */}
        <ScrollReveal animation="fade-up" delay={0.1}>
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-7 h-full flex flex-col">
            <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-white/30 mb-1">
              Free
            </p>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-4xl font-bold text-white">&euro;0</span>
            </div>
            <p className="text-xs text-white/30 mb-6">Forever</p>

            <div className="space-y-3 flex-1">
              {FREE_FEATURES.map((f) => (
                <div key={f} className="flex items-start gap-2.5">
                  <Check className="w-3.5 h-3.5 text-white/30 mt-0.5 shrink-0" />
                  <span className="text-sm text-white/50">{f}</span>
                </div>
              ))}
              <div className="flex items-start gap-2.5">
                <X className="w-3.5 h-3.5 text-white/15 mt-0.5 shrink-0" />
                <span className="text-sm text-white/25">Advanced analytics</span>
              </div>
              <div className="flex items-start gap-2.5">
                <X className="w-3.5 h-3.5 text-white/15 mt-0.5 shrink-0" />
                <span className="text-sm text-white/25">Data export</span>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Pro */}
        <ScrollReveal animation="fade-up" delay={0.15}>
          <div className="relative rounded-2xl border border-white/[0.12] bg-white/[0.05] p-7 h-full flex flex-col">
            {/* Badge */}
            <div className="absolute -top-3 left-7">
              <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white text-black">
                Most popular
              </span>
            </div>

            <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-white/30 mb-1">
              Pro
            </p>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-4xl font-bold text-white">
                &euro;{yearly ? '4.99' : '7.99'}
              </span>
              <span className="text-sm text-white/40">/month</span>
            </div>
            <p className="text-xs text-white/30 mb-6">
              {yearly ? (
                <>
                  &euro;59.99 billed yearly
                  <span className="ml-1.5 text-emerald-400">Save &euro;36</span>
                </>
              ) : (
                'Billed monthly'
              )}
            </p>

            <div className="space-y-3 flex-1">
              {PRO_FEATURES.map((f) => (
                <div key={f} className="flex items-start gap-2.5">
                  <Check className="w-3.5 h-3.5 text-white/60 mt-0.5 shrink-0" />
                  <span className="text-sm text-white/70">{f}</span>
                </div>
              ))}
            </div>

            <a href={APP_STORE_URL} target="_blank" rel="noopener noreferrer" className="mt-6 px-5 py-3 bg-white text-black rounded-xl font-semibold text-sm text-center block hover:bg-white/90 transition-colors">
              Download on the App Store
            </a>
          </div>
        </ScrollReveal>
      </div>

      {/* Per-product Pro features */}
      <ScrollReveal animation="fade-up" delay={0.2}>
        <div className="max-w-3xl mx-auto mb-16">
          <p className="text-center text-[11px] font-semibold uppercase tracking-[0.15em] text-white/30 mb-6">
            What Pro unlocks per product
          </p>
          <div className="grid md:grid-cols-3 gap-3">
            {PRO_PER_PRODUCT.map((p) => {
              const Icon = p.icon;
              return (
                <div
                  key={p.label}
                  className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-6 h-6 rounded-md flex items-center justify-center"
                      style={{ backgroundColor: `${p.accent}15` }}
                    >
                      <Icon className="w-3 h-3" style={{ color: p.accent }} />
                    </div>
                    <span className="text-sm font-semibold text-white">{p.label}</span>
                  </div>
                  <p className="text-xs text-white/40 leading-relaxed">{p.feature}</p>
                </div>
              );
            })}
          </div>
        </div>
      </ScrollReveal>

    </section>
  );
}
