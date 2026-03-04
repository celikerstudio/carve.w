'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dumbbell, Wallet, MapPin, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { CarveFooter } from '@/components/carve/CarveFooter';
import { AIChatDemo } from '@/components/carve/AIChatDemo';
import { FounderStory } from '@/components/carve/FounderStory';
import { GamificationShowcase } from '@/components/carve/GamificationShowcase';
import { PricingHub } from '@/components/carve/PricingHub';
import { MarketingPageLayout } from '@/components/carve/MarketingPageLayout';

// Wiki article feed — cycles through topics with evidence badges
const WIKI_TOPICS = [
  { title: 'Progressive Overload', badge: 'Strong', category: 'Training' },
  { title: 'Protein Timing', badge: 'Moderate', category: 'Nutrition' },
  { title: 'Sleep & Recovery', badge: 'Strong', category: 'Physiology' },
  { title: 'Creatine Loading', badge: 'Strong', category: 'Nutrition' },
];

export default function CarvePage() {
  const [wikiIndex, setWikiIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setWikiIndex((i) => (i + 1) % WIKI_TOPICS.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <MarketingPageLayout page="/carve">
      {/* Hero — Herkenning */}
      <section className="flex flex-col items-center pt-32 md:pt-44 pb-16 px-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-lg mx-auto mb-10"
        >
          <p className="text-lg md:text-xl text-white/50 font-light leading-relaxed">
            You&apos;ve tried everything.
          </p>
          <p className="text-lg md:text-xl text-white/30 font-light leading-relaxed mt-1">
            The app. The plan. The spreadsheet.
          </p>
          <p className="text-lg md:text-xl text-white/20 font-light leading-relaxed mt-1">
            It worked&nbsp;&mdash;&nbsp;for a while.
          </p>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-5xl md:text-7xl font-bold tracking-[0.3em] text-white"
        >
          CARVE
        </motion.h1>
      </section>

      {/* Founder Story */}
      <FounderStory />

      {/* Product Cards — All in one */}
      <section className="max-w-4xl mx-auto px-6 pb-32">
        <ScrollReveal animation="fade-up">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
              This is what I needed.
            </h2>
            <p className="text-white/40 mt-4 max-w-md mx-auto text-sm md:text-base leading-relaxed">
              One place for everything that matters. No ten apps. No spreadsheets. Just this.
            </p>
          </div>
        </ScrollReveal>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Health */}
          <ScrollReveal animation="fade-up" delay={0}>
            <Link href="/carve/health" className="group block">
              <div className="relative rounded-2xl border border-[#D4A843]/[0.1] bg-[#D4A843]/[0.04] p-8 min-h-[240px] overflow-hidden transition-all duration-300 hover:border-[#D4A843]/[0.2] hover:bg-[#D4A843]/[0.06]">
                {/* Visual: rank ladder */}
                <div className="absolute top-6 right-6 flex flex-col gap-1.5 opacity-25 group-hover:opacity-50 transition-opacity duration-300">
                  {['Legend', 'Master', 'Elite', 'Advanced'].map((rank, i) => (
                    <div key={rank} className="flex items-center gap-2">
                      <div
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: i === 2 ? '#D4A843' : 'rgba(255,255,255,0.2)' }}
                      />
                      <span className="text-[10px] text-white/40">{rank}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col justify-end h-full min-h-[180px]">
                  <div className="w-10 h-10 rounded-lg bg-[#D4A843]/10 flex items-center justify-center mb-4">
                    <Dumbbell className="w-5 h-5 text-[#D4A843]" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-1">Health</h2>
                  <p className="text-sm text-white/50">Fitness with a scoreboard</p>
                </div>
              </div>
            </Link>
          </ScrollReveal>

          {/* Money */}
          <ScrollReveal animation="fade-up" delay={0.1}>
            <Link href="/carve/money" className="group block">
              <div className="relative rounded-2xl border border-blue-500/[0.1] bg-blue-500/[0.04] p-8 min-h-[240px] overflow-hidden transition-all duration-300 hover:border-blue-500/[0.2] hover:bg-blue-500/[0.06]">
                {/* Visual: spending bars */}
                <div className="absolute top-6 right-6 flex flex-col gap-2 opacity-25 group-hover:opacity-50 transition-opacity duration-300">
                  {[72, 40, 58, 24].map((w, i) => (
                    <div
                      key={i}
                      className="h-1.5 rounded-full bg-blue-400/60"
                      style={{ width: `${w}px` }}
                    />
                  ))}
                </div>

                <div className="flex flex-col justify-end h-full min-h-[180px]">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4">
                    <Wallet className="w-5 h-5 text-blue-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-1">Money</h2>
                  <p className="text-sm text-white/50">Know where your money goes</p>
                </div>
              </div>
            </Link>
          </ScrollReveal>

          {/* Travel */}
          <ScrollReveal animation="fade-up" delay={0.2}>
            <Link href="/carve/travel" className="group block">
              <div className="relative rounded-2xl border border-orange-500/[0.1] bg-orange-500/[0.04] p-8 min-h-[240px] overflow-hidden transition-all duration-300 hover:border-orange-500/[0.2] hover:bg-orange-500/[0.06]">
                {/* Visual: world dots */}
                <svg
                  viewBox="0 0 120 60"
                  className="absolute top-4 right-4 w-32 opacity-20 group-hover:opacity-40 transition-opacity duration-300"
                >
                  {/* Europe */}
                  <circle cx={60} cy={10} r={2} fill="#F97316" />
                  <circle cx={63} cy={12} r={2} fill="#F97316" />
                  <circle cx={66} cy={15} r={1.5} fill="#F97316" />
                  {/* Middle East / Asia */}
                  <circle cx={80} cy={20} r={2} fill="#F97316" />
                  <circle cx={95} cy={18} r={2.5} fill="#F97316" />
                  <circle cx={100} cy={28} r={2} fill="#F97316" />
                  {/* Americas */}
                  <circle cx={35} cy={14} r={1.5} fill="rgba(255,255,255,0.3)" />
                  <circle cx={20} cy={16} r={1.5} fill="rgba(255,255,255,0.3)" />
                  {/* S. America / Oceania */}
                  <circle cx={42} cy={42} r={1.5} fill="rgba(255,255,255,0.3)" />
                  <circle cx={108} cy={48} r={1.5} fill="rgba(255,255,255,0.3)" />
                </svg>

                <div className="flex flex-col justify-end h-full min-h-[180px]">
                  <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center mb-4">
                    <MapPin className="w-5 h-5 text-orange-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-1">Travel</h2>
                  <p className="text-sm text-white/50">Collect moments, not things</p>
                </div>
              </div>
            </Link>
          </ScrollReveal>

          {/* Wiki */}
          <ScrollReveal animation="fade-up" delay={0.3}>
            <Link href="/" className="group block">
              <div className="relative rounded-2xl border border-emerald-500/[0.1] bg-emerald-500/[0.04] p-8 min-h-[240px] overflow-hidden transition-all duration-300 hover:border-emerald-500/[0.2] hover:bg-emerald-500/[0.06]">
                {/* Visual: cycling article feed */}
                <div className="absolute top-6 right-6 opacity-25 group-hover:opacity-60 transition-opacity duration-300">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={wikiIndex}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.3 }}
                      className="text-right"
                    >
                      <p className="text-[10px] text-emerald-400/80 mb-0.5">
                        {WIKI_TOPICS[wikiIndex].category}
                      </p>
                      <p className="text-xs text-white/70 font-medium">
                        {WIKI_TOPICS[wikiIndex].title}
                      </p>
                      <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-emerald-500/20 text-emerald-400/80">
                        {WIKI_TOPICS[wikiIndex].badge}
                      </span>
                    </motion.div>
                  </AnimatePresence>
                </div>

                <div className="flex flex-col justify-end h-full min-h-[180px]">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-4">
                    <BookOpen className="w-5 h-5 text-emerald-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-1">Wiki</h2>
                  <p className="text-sm text-white/50">Evidence-based knowledge</p>
                </div>
              </div>
            </Link>
          </ScrollReveal>

        </div>
      </section>

      {/* AI Coach Demo */}
      <AIChatDemo />

      {/* Gamification */}
      <GamificationShowcase />

      {/* Pricing */}
      <PricingHub />

      {/* Closing — Uitnodiging */}
      <section className="py-24 md:py-32 px-6">
        <ScrollReveal animation="fade-up">
          <div className="text-center max-w-lg mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight leading-snug">
              This is what helped me.
            </h2>
            <p className="text-xl md:text-2xl text-white/40 font-light mt-3">
              Maybe it helps you too.
            </p>
          </div>
        </ScrollReveal>
      </section>

      {/* Footer */}
      <section className="pb-16 px-6">
        <ScrollReveal animation="fade-up">
          <div className="text-center">
            <CarveFooter />
          </div>
        </ScrollReveal>
      </section>
    </MarketingPageLayout>
  );
}
