'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Flame, Target } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/scroll-reveal';

const LEADERBOARD = [
  { pos: 1, name: 'Marcus', rank: 'Legend', pts: 2450, medal: '\u{1F947}' },
  { pos: 2, name: 'Sarah', rank: 'Master', pts: 2180, medal: '\u{1F948}' },
  { pos: 3, name: 'Jesse', rank: 'Elite', pts: 1890, medal: '\u{1F949}' },
  { pos: 47, name: 'You', rank: 'Advanced', pts: 720, medal: '' },
];

const RANKS = ['Rookie', 'Beginner', 'Intermediate', 'Advanced', 'Champion', 'Elite', 'Master', 'Legend'] as const;

// Animate the "you" row climbing
const YOU_PHASES = [
  { pos: 312, rank: 'Beginner', pts: 148, pct: 'Top 3%' },
  { pos: 87, rank: 'Advanced', pts: 445, pct: 'Top 1%' },
  { pos: 24, rank: 'Elite', pts: 720, pct: 'Top 0.5%' },
  { pos: 6, rank: 'Master', pts: 1650, pct: 'Top 0.1%' },
];

const CYCLE_MS = 2500;

export function GamificationShowcase() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setPhase((p) => (p + 1) % YOU_PHASES.length), CYCLE_MS);
    return () => clearInterval(interval);
  }, []);

  const you = YOU_PHASES[phase];
  const rankIndex = RANKS.indexOf(you.rank as typeof RANKS[number]);

  return (
    <section className="py-24 md:py-32 px-6">
      <ScrollReveal animation="fade-up">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
            Why you won&apos;t quit this time.
          </h2>
          <p className="text-white/40 mt-4 max-w-md mx-auto text-sm md:text-base leading-relaxed">
            Every fitness app gets abandoned after 2 weeks. Carve makes progress visible&nbsp;&mdash; and visible progress is addictive.
          </p>
        </div>
      </ScrollReveal>

      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
        {/* Leaderboard card */}
        <ScrollReveal animation="fade-up" delay={0.1}>
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Trophy className="w-3.5 h-3.5 text-[#D4A843]/60" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-white/40">
                  World Ranking
                </span>
              </div>
              <span className="text-[10px] text-white/20">Season 1</span>
            </div>

            {/* Top 3 */}
            <div className="space-y-1.5 mb-3">
              {LEADERBOARD.slice(0, 3).map((entry) => (
                <div
                  key={entry.pos}
                  className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.03]"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm w-5">{entry.medal}</span>
                    <span className="text-sm text-white/70">{entry.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-white/30">{entry.rank}</span>
                    <span className="text-sm font-semibold text-[#D4A843]">{entry.pts}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Separator */}
            <div className="flex items-center gap-2 px-3 py-1">
              <div className="flex-1 border-t border-white/[0.04]" />
              <span className="text-[9px] text-white/15">...</span>
              <div className="flex-1 border-t border-white/[0.04]" />
            </div>

            {/* You — animated */}
            <AnimatePresence mode="wait">
              <motion.div
                key={phase}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.35 }}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-white/[0.06] border border-white/[0.08] mt-2"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-white/50 w-5">#{you.pos}</span>
                  <span className="text-sm font-medium text-white">You</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-white/40">{you.rank}</span>
                  <span className="text-sm font-semibold text-[#D4A843]">{you.pts}</span>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="mt-3 text-center">
              <AnimatePresence mode="wait">
                <motion.p
                  key={you.pct}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="text-xs text-white/30"
                >
                  <span className="text-[#D4A843] font-medium">{you.pct}</span> worldwide
                </motion.p>
              </AnimatePresence>
            </div>
          </div>
        </ScrollReveal>

        {/* Rank ladder + features */}
        <ScrollReveal animation="fade-up" delay={0.15}>
          <div className="space-y-4">
            {/* Rank progression */}
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-white/40 mb-4">
                8 ranks to climb
              </p>
              <div className="space-y-1">
                {[...RANKS].reverse().map((rank, i) => {
                  const isActive = rank === you.rank;
                  const isAbove = RANKS.indexOf(rank) > rankIndex;
                  return (
                    <div
                      key={rank}
                      className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-sm"
                    >
                      <motion.div
                        className="w-2 h-2 rounded-full"
                        animate={{
                          backgroundColor: isActive ? '#D4A843' : isAbove ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.15)',
                          scale: isActive ? 1.3 : 1,
                        }}
                        transition={{ duration: 0.4 }}
                      />
                      <motion.span
                        animate={{
                          color: isActive ? 'rgba(255,255,255,0.95)' : isAbove ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.35)',
                          fontWeight: isActive ? 600 : 400,
                        }}
                        transition={{ duration: 0.4 }}
                      >
                        {rank}
                      </motion.span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick features */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                <Flame className="w-4 h-4 text-orange-400/60 mb-2" />
                <p className="text-sm font-semibold text-white mb-0.5">Streaks</p>
                <p className="text-[11px] text-white/30">Stay consistent, earn rewards</p>
              </div>
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                <Target className="w-4 h-4 text-blue-400/60 mb-2" />
                <p className="text-sm font-semibold text-white mb-0.5">Challenges</p>
                <p className="text-[11px] text-white/30">Daily goals, weekly missions</p>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
