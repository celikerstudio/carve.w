'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, Dumbbell, Flame, Footprints } from 'lucide-react';
import { useState, useEffect } from 'react';

const RANKS = ['Legend', 'Master', 'Elite', 'Advanced', 'Intermediate', 'Beginner', 'Rookie'] as const;

// Growth phases — cycling through rank progression like the iOS welcome screen
const PHASES = [
  { rankIndex: 5, rank: 'Beginner',     pts: 148, progress: 35, workouts: 23, streak: 47,  steps: '12.4K', position: '#312', pct: 'Top 3%' },
  { rankIndex: 4, rank: 'Intermediate',  pts: 280, progress: 55, workouts: 38, streak: 62,  steps: '18.5K', position: '#189', pct: 'Top 2%' },
  { rankIndex: 3, rank: 'Advanced',      pts: 445, progress: 70, workouts: 56, streak: 90,  steps: '24.0K', position: '#87',  pct: 'Top 1%' },
  { rankIndex: 2, rank: 'Elite',         pts: 720, progress: 85, workouts: 82, streak: 135, steps: '31.2K', position: '#24',  pct: 'Top 0.5%' },
];

const CYCLE_MS = 2500;
const ENTRANCE_DELAY = 1.5;
const ENTRANCE_DURATION = 0.7;

export function ScoreboardCard() {
  const [phase, setPhase] = useState(0);
  const [hasEntered, setHasEntered] = useState(false);

  // Start cycling after the entrance animation finishes
  useEffect(() => {
    const entranceTimer = setTimeout(() => setHasEntered(true), (ENTRANCE_DELAY + ENTRANCE_DURATION) * 1000);
    return () => clearTimeout(entranceTimer);
  }, []);

  useEffect(() => {
    if (!hasEntered) return;
    const interval = setInterval(() => {
      setPhase(p => (p + 1) % PHASES.length);
    }, CYCLE_MS);
    return () => clearInterval(interval);
  }, [hasEntered]);

  const current = PHASES[phase];

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: ENTRANCE_DURATION, delay: ENTRANCE_DELAY, ease: [0.25, 0.1, 0.25, 1] }}
      className="w-full max-w-sm mx-auto"
    >
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-sm p-6 space-y-5">
        {/* Season + Rank header */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-white/30 mb-1">
            Season 1
          </p>
          <div className="flex items-baseline justify-between">
            <AnimatePresence mode="wait">
              <motion.h3
                key={current.rank}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.35, ease: 'easeInOut' }}
                className="text-3xl font-bold text-white"
              >
                {current.rank}
              </motion.h3>
            </AnimatePresence>
            <AnimatePresence mode="wait">
              <motion.span
                key={current.pts}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="text-lg font-bold text-[#D4A843]"
              >
                {current.pts} pts
              </motion.span>
            </AnimatePresence>
          </div>
          {/* Progress bar */}
          <div className="mt-3 h-1 bg-white/[0.08] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-[#D4A843] rounded-full"
              animate={{ width: `${current.progress}%` }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
            />
          </div>
        </div>

        {/* World Ranking */}
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-3.5 h-3.5 text-white/40" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-white/40">
                World Ranking
              </span>
            </div>
          </div>
          <div className="space-y-1.5">
            {RANKS.map((rank, i) => {
              const isActive = i === current.rankIndex;
              const isCompleted = i > current.rankIndex;
              // Distance-based opacity like the Swift app
              const distance = Math.abs(i - current.rankIndex);
              const opacity = isActive ? 1 : isCompleted ? Math.max(0.12 - (distance - 1) * 0.03, 0.06) : 0.25;

              return (
                <div
                  key={rank}
                  className="relative flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-sm"
                >
                  {/* Background highlight for active rank */}
                  <motion.div
                    className="absolute inset-0 rounded-lg bg-white/[0.08]"
                    initial={false}
                    animate={{ opacity: isActive ? 1 : 0 }}
                    transition={{ duration: 0.4, ease: 'easeInOut' }}
                  />
                  {/* Rank dot */}
                  <div className="relative z-10 flex items-center justify-center w-2.5 h-2.5">
                    {/* Gold filled dot for active */}
                    <motion.div
                      className="absolute w-2.5 h-2.5 rounded-full bg-[#D4A843]"
                      initial={false}
                      animate={{ scale: isActive ? 1 : 0, opacity: isActive ? 1 : 0 }}
                      transition={{ duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
                    />
                    {/* Empty border dot for inactive */}
                    <motion.div
                      className="absolute w-2 h-2 rounded-full border border-white/20"
                      initial={false}
                      animate={{ scale: isActive ? 0 : 1, opacity: isActive ? 0 : (isCompleted ? 0.4 : 1) }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <motion.span
                    className="relative z-10"
                    initial={false}
                    animate={{
                      color: isActive ? 'rgba(255,255,255,0.95)' : `rgba(255,255,255,${opacity})`,
                      fontWeight: isActive ? 500 : 400,
                    }}
                    transition={{ duration: 0.4, ease: 'easeInOut' }}
                  >
                    {rank}
                  </motion.span>
                </div>
              );
            })}
          </div>

          {/* Stats row */}
          <div className="mt-4 pt-3 border-t border-white/[0.08] grid grid-cols-3 text-center">
            <AnimatedStat icon={<Dumbbell className="w-3.5 h-3.5" />} value={current.workouts} label="Workouts" />
            <AnimatedStat icon={<Flame className="w-3.5 h-3.5" />} value={current.streak} label="Streak" />
            <AnimatedStat icon={<Footprints className="w-3.5 h-3.5" />} value={current.steps} label="Steps" />
          </div>
        </div>

        {/* Percentile */}
        <div className="text-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={`${current.position}-${current.pct}`}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="text-white/50 text-sm"
            >
              <span className="text-white font-medium">{current.position}</span>
              {' '}&middot;{' '}
              <span className="text-[#D4A843] font-medium">{current.pct}</span>
              {' '}worldwide
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

function AnimatedStat({ icon, value, label }: { icon: React.ReactNode; value: number | string; label: string }) {
  return (
    <div className="space-y-0.5">
      <div className="flex items-center justify-center text-white/30">{icon}</div>
      <AnimatePresence mode="wait">
        <motion.p
          key={String(value)}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="text-white font-bold text-lg"
        >
          {value}
        </motion.p>
      </AnimatePresence>
      <p className="text-white/40 text-[11px]">{label}</p>
    </div>
  );
}
