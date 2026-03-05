'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import {
  Dumbbell, BarChart3, Users, Flame, Star, Trophy, Crown, Zap, Target,
  Check, X, Sparkles, Download, Headphones, Camera, ScanBarcode,
  MessageSquareText, Search, Apple,
} from 'lucide-react';
import { ScoreboardCard } from '@/components/carve/ScoreboardCard';
import { CarveFooter } from '@/components/carve/CarveFooter';
import { PhoneShowcase } from '@/components/carve/PhoneShowcase';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { APP_STORE_URL } from '@/lib/utils';
import { MarketingHero } from '@/components/carve/MarketingHero';

export default function CarvePage() {
  return (
    <div className="min-h-screen w-full bg-[#0A0A0B] text-white">
      {/* Hero Section */}
      <section className="min-h-[100dvh] flex flex-col items-center justify-center px-6 py-20 relative">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0 }}
          className="text-5xl md:text-7xl font-bold tracking-[0.3em] text-white mb-3"
        >
          CARVE
        </motion.h1>

        <p className="text-lg md:text-xl text-white/50 mb-12 font-light">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
          >
            One AI. Your{' '}
          </motion.span>
          <motion.span
            className="relative inline-block text-white/50"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, duration: 0.4, ease: 'easeOut' }}
          >
            whole life
          </motion.span>
        </p>

        <ScoreboardCard />

      </section>

      <MarketingHero page="/carve" />

      {/* Value Proposition */}
      <section className="py-24 md:py-32 px-6">
        <ScrollReveal animation="fade-up">
          <h2 className="text-3xl md:text-5xl font-bold text-center text-white mb-16 tracking-tight">
            Health. Money. Travel.
          </h2>
        </ScrollReveal>
        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-4">
          {[
            { icon: <Dumbbell className="w-5 h-5" />, title: 'Health', text: 'Track workouts, meals, and progress. AI coaches you daily.' },
            { icon: <BarChart3 className="w-5 h-5" />, title: 'Money', text: 'See where it goes. Find what to cut. Save more.' },
            { icon: <Target className="w-5 h-5" />, title: 'Travel', text: 'Plan trips with AI. Budget included.' },
          ].map((card, i) => (
            <ScrollReveal key={card.title} animation="fade-up" delay={i * 0.1}>
              <div className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-6 h-full">
                <div className="w-10 h-10 rounded-lg bg-white/[0.06] flex items-center justify-center text-white/50 mb-4">
                  {card.icon}
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">{card.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{card.text}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* AI Scan */}
      <AIScanSection />

      {/* Training */}
      <TrainingSection />

      {/* Hiscores */}
      <HiscoresSection />

      {/* Rewards */}
      <RewardsSection />

      {/* Pricing */}
      <PricingSection />

      {/* App Screenshots */}
      <section className="py-24 md:py-32">
        <ScrollReveal animation="fade">
          <PhoneShowcase />
        </ScrollReveal>
      </section>

      {/* Footer */}
      <section className="py-24 md:py-32 px-6">
        <ScrollReveal animation="fade-up">
          <div className="text-center">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-16 tracking-tight">
              Ready to start?
            </h2>
            <CarveFooter />
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   AI Scan Section — Interactive Demo
   ══════════════════════════════════════════════════════════ */

const SCAN_METHODS = [
  { icon: Camera,             label: 'AI Camera' },
  { icon: ScanBarcode,        label: 'Barcode' },
  { icon: MessageSquareText,  label: 'Text' },
  { icon: Search,             label: 'Search' },
] as const;

const MACROS = [
  { label: 'Calories', num: 487, unit: 'kcal', color: '#F28C33' },
  { label: 'Protein',  num: 32,  unit: 'g',    color: '#4D99F2' },
  { label: 'Carbs',    num: 54,  unit: 'g',    color: '#66BF73' },
  { label: 'Fat',      num: 16,  unit: 'g',    color: '#CC80F2' },
] as const;

// Timing (seconds after entering view)
const T = { photo: 0.3, shimmer: 0.8, name: 2.0, macros: 2.4, meta: 3.2, methods: 3.6 } as const;
const DEMO_LOOP = 6; // seconds before restart

function AIScanSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: false, amount: 0.4 });
  const [cycle, setCycle] = useState(0);

  // Restart the animation each time section scrolls into view
  useEffect(() => {
    if (inView) setCycle((c) => c + 1);
  }, [inView]);

  // Auto-replay
  useEffect(() => {
    if (!inView) return;
    const timer = setInterval(() => setCycle((c) => c + 1), DEMO_LOOP * 1000);
    return () => clearInterval(timer);
  }, [inView]);

  const show = inView;

  return (
    <section ref={ref} className="py-24 md:py-32 px-6">
      <ScrollReveal animation="fade-up">
        <div className="text-center mb-16">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#4D99F2] mb-3">AI-Powered</p>
          <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
            Scan it. Know it.
          </h2>
          <p className="text-white/40 mt-4 max-w-md mx-auto text-sm md:text-base leading-relaxed">
            Point your camera at any meal. AI identifies the food, estimates portions, and logs calories and macros — in seconds.
          </p>
        </div>
      </ScrollReveal>

      <div className="max-w-sm mx-auto">
        {/* Phone Frame */}
        <div className="relative mx-auto w-full max-w-[320px]">
          <div className="rounded-[2.5rem] border-[3px] border-white/[0.12] bg-[#0D0D0F] p-3 shadow-2xl shadow-black/50">
            {/* Notch */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-5 bg-[#0D0D0F] rounded-full z-20" />

            {/* Screen */}
            <div className="rounded-[2rem] overflow-hidden bg-[#111113] relative" style={{ aspectRatio: '9/17' }}>
              <AnimatePresence mode="wait">
                <motion.div key={cycle} className="absolute inset-0 flex flex-col">

                  {/* Phase 1: Food photo area */}
                  <div className="relative h-[45%] overflow-hidden">
                    {/* Gradient food placeholder */}
                    <motion.div
                      className="absolute inset-0"
                      style={{
                        background: 'linear-gradient(135deg, #2a1a0a 0%, #3d2a14 30%, #4a3520 50%, #2d1f0f 100%)',
                      }}
                      initial={{ opacity: 0, scale: 1.1 }}
                      animate={show ? { opacity: 1, scale: 1 } : {}}
                      transition={{ duration: 0.6, delay: T.photo }}
                    />
                    {/* Food emoji overlay */}
                    <motion.div
                      className="absolute inset-0 flex items-center justify-center"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={show ? { opacity: 1, scale: 1 } : {}}
                      transition={{ duration: 0.5, delay: T.photo + 0.2 }}
                    >
                      <span className="text-6xl drop-shadow-lg select-none">🍛</span>
                    </motion.div>

                    {/* Analyzing shimmer overlay */}
                    <ShimmerOverlay show={show} startDelay={T.shimmer} endDelay={T.name} />

                    {/* Scan line + "Analyzing..." */}
                    <AnalyzingIndicator show={show} startDelay={T.shimmer} endDelay={T.name} />

                    {/* Camera button hint — fades out when scan starts */}
                    <motion.div
                      className="absolute bottom-3 left-1/2 -translate-x-1/2"
                      initial={{ opacity: 0.6 }}
                      animate={show ? { opacity: 0 } : { opacity: 0.6 }}
                      transition={{ duration: 0.3, delay: show ? T.shimmer : 0 }}
                    >
                      <div className="w-10 h-10 rounded-full border-2 border-white/30 flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-white/20" />
                      </div>
                    </motion.div>
                  </div>

                  {/* Phase 2: Results panel */}
                  <div className="flex-1 px-4 pt-4 pb-3 flex flex-col">
                    {/* Food name + confidence */}
                    <motion.div
                      className="flex items-start justify-between mb-3"
                      initial={{ opacity: 0, y: 8 }}
                      animate={show ? { opacity: 1, y: 0 } : {}}
                      transition={{ duration: 0.4, delay: T.name }}
                    >
                      <div>
                        <p className="text-[15px] font-semibold text-white">Chicken Rice Bowl</p>
                        <p className="text-[10px] text-white/30 mt-0.5">~350 g · Lunch</p>
                      </div>
                      <motion.div
                        className="px-2 py-0.5 rounded-full bg-emerald-400/10 shrink-0"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={show ? { opacity: 1, scale: 1 } : {}}
                        transition={{ duration: 0.3, delay: T.meta }}
                      >
                        <span className="text-[10px] font-bold text-emerald-400">A+</span>
                      </motion.div>
                    </motion.div>

                    {/* Macro pills */}
                    <div className="grid grid-cols-4 gap-1.5 mb-3">
                      {MACROS.map((m, i) => (
                        <motion.div
                          key={m.label}
                          className="rounded-lg py-2 px-1 text-center"
                          style={{ backgroundColor: `${m.color}12` }}
                          initial={{ opacity: 0, y: 10 }}
                          animate={show ? { opacity: 1, y: 0 } : {}}
                          transition={{ duration: 0.35, delay: T.macros + i * 0.08 }}
                        >
                          <CountUp value={m.num} show={show} delay={T.macros + i * 0.08} />
                          <span className="text-[9px] ml-0.5" style={{ color: `${m.color}90` }}>{m.unit}</span>
                          <p className="text-[8px] mt-0.5" style={{ color: `${m.color}70` }}>{m.label}</p>
                        </motion.div>
                      ))}
                    </div>

                    {/* Confidence bar */}
                    <motion.div
                      className="mb-3"
                      initial={{ opacity: 0 }}
                      animate={show ? { opacity: 1 } : {}}
                      transition={{ duration: 0.3, delay: T.meta }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[9px] text-white/30">AI Confidence</span>
                        <span className="text-[9px] text-white/50 font-medium">94%</span>
                      </div>
                      <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-[#4D99F2]"
                          initial={{ width: '0%' }}
                          animate={show ? { width: '94%' } : {}}
                          transition={{ duration: 0.8, delay: T.meta, ease: 'easeOut' }}
                        />
                      </div>
                    </motion.div>

                    {/* Log button */}
                    <motion.div
                      className="mt-auto"
                      initial={{ opacity: 0, y: 6 }}
                      animate={show ? { opacity: 1, y: 0 } : {}}
                      transition={{ duration: 0.3, delay: T.meta + 0.2 }}
                    >
                      <div className="w-full py-2.5 bg-[#4D99F2] rounded-xl text-center">
                        <span className="text-[12px] font-semibold text-white">Log Meal</span>
                      </div>
                    </motion.div>
                  </div>

                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Scan methods row */}
        <motion.div
          className="flex items-center justify-center gap-3 mt-8"
          initial={{ opacity: 0, y: 10 }}
          animate={show ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, delay: T.methods }}
        >
          {SCAN_METHODS.map((m) => {
            const Icon = m.icon;
            return (
              <div key={m.label} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-white/[0.06] bg-white/[0.03]">
                <Icon className="w-3.5 h-3.5 text-[#4D99F2]" />
                <span className="text-[11px] text-white/50">{m.label}</span>
              </div>
            );
          })}
        </motion.div>

        {/* Quota */}
        <div className="flex items-center justify-center gap-4 mt-4 text-[11px] text-white/30">
          <span>Free: <span className="text-white/50 font-medium">3 scans/day</span></span>
          <span className="text-white/10">|</span>
          <span>Pro: <span className="text-[#D4A843] font-medium">Unlimited</span></span>
        </div>
      </div>
    </section>
  );
}

/** Animated number count-up */
function CountUp({ value, show, delay }: { value: number; show: boolean; delay: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!show) { setDisplay(0); return; }

    const start = performance.now();
    const delayMs = delay * 1000;
    const duration = 600;

    let raf: number;
    const tick = (now: number) => {
      const elapsed = now - start - delayMs;
      if (elapsed < 0) { raf = requestAnimationFrame(tick); return; }
      const progress = Math.min(elapsed / duration, 1);
      // ease-out quad
      const eased = 1 - (1 - progress) * (1 - progress);
      setDisplay(Math.round(eased * value));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [show, value, delay]);

  return <span className="text-[11px] font-bold text-white/90">{display}</span>;
}

/** Shimmer sweep that appears during analysis and fades out when results show */
function ShimmerOverlay({ show, startDelay, endDelay }: { show: boolean; startDelay: number; endDelay: number }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!show) { setVisible(false); return; }
    const tIn = setTimeout(() => setVisible(true), startDelay * 1000);
    const tOut = setTimeout(() => setVisible(false), endDelay * 1000);
    return () => { clearTimeout(tIn); clearTimeout(tOut); };
  }, [show, startDelay, endDelay]);

  return (
    <motion.div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.25 }}
    >
      <motion.div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(77,153,242,0.1) 50%, transparent 100%)' }}
        animate={visible ? { x: ['-100%', '200%'] } : {}}
        transition={{ duration: 1.0, repeat: Infinity, ease: 'easeInOut' }}
      />
    </motion.div>
  );
}

/** "Analyzing..." scan line indicator */
function AnalyzingIndicator({ show, startDelay, endDelay }: { show: boolean; startDelay: number; endDelay: number }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!show) { setVisible(false); return; }
    const tIn = setTimeout(() => setVisible(true), (startDelay + 0.1) * 1000);
    const tOut = setTimeout(() => setVisible(false), endDelay * 1000);
    return () => { clearTimeout(tIn); clearTimeout(tOut); };
  }, [show, startDelay, endDelay]);

  return (
    <motion.div
      className="absolute left-4 right-4"
      style={{ top: '50%' }}
      animate={{ opacity: visible ? 0.7 : 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className="h-[1px] bg-[#4D99F2]/40" />
      <p className="text-[10px] text-[#4D99F2]/70 text-center mt-1 font-medium">
        Analyzing...
      </p>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════
   Training Section
   ══════════════════════════════════════════════════════════ */

const WORKOUT_TYPES = [
  { name: 'Push',      muscles: 'Chest · Shoulders · Triceps', color: '#E54D4D', icon: '🏋️' },
  { name: 'Pull',      muscles: 'Back · Biceps',                color: '#4D99F2', icon: '💪' },
  { name: 'Legs',      muscles: 'Quads · Hamstrings · Glutes',  color: '#66BF73', icon: '🦵' },
  { name: 'Upper',     muscles: 'Full upper body',              color: '#CC80F2', icon: '⬆️' },
  { name: 'Lower',     muscles: 'Full lower body',              color: '#F28C33', icon: '⬇️' },
  { name: 'Full Body', muscles: 'Everything in one session',    color: '#EDCA47', icon: '🔥' },
] as const;

const VARIANTS = [
  { name: 'Strength',    desc: 'Heavy compounds, 4–6 reps',    stars: '★★★' },
  { name: 'Hypertrophy', desc: 'Balanced, 8–12 reps',          stars: '★★' },
  { name: 'Volume',      desc: 'More sets, 12–20 reps',        stars: '★' },
  { name: 'Dumbbell',    desc: 'DB-only, no barbell needed',    stars: '—' },
  { name: 'Cable',       desc: 'Machines & cables',             stars: '—' },
] as const;

const EQUIPMENT_TYPES = [
  { abbr: 'BB', name: 'Barbell' },
  { abbr: 'DB', name: 'Dumbbell' },
  { abbr: 'CB', name: 'Cable' },
  { abbr: 'MC', name: 'Machine' },
  { abbr: 'BW', name: 'Bodyweight' },
  { abbr: 'BD', name: 'Band' },
  { abbr: 'KB', name: 'Kettlebell' },
] as const;

function TrainingSection() {
  return (
    <section className="py-24 md:py-32 px-6">
      <ScrollReveal animation="fade-up">
        <div className="text-center mb-16">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#CC80F2] mb-3">Training</p>
          <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
            482 exercises. Your program.
          </h2>
          <p className="text-white/40 mt-4 max-w-lg mx-auto text-sm md:text-base leading-relaxed">
            Pick a split, choose a variant, and start lifting. Every set, rep, and PR is tracked automatically.
          </p>
        </div>
      </ScrollReveal>

      <div className="max-w-5xl mx-auto space-y-6">
        {/* Workout Types Grid */}
        <ScrollReveal animation="fade-up" delay={0}>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {WORKOUT_TYPES.map((wt) => (
              <div
                key={wt.name}
                className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 hover:bg-white/[0.05] transition-colors"
              >
                <span className="text-2xl mb-2 block">{wt.icon}</span>
                <p className="text-sm font-semibold text-white">{wt.name}</p>
                <p className="text-[11px] text-white/35 mt-0.5">{wt.muscles}</p>
              </div>
            ))}
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Variants */}
          <ScrollReveal animation="fade-up" delay={0.1}>
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 h-full">
              <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-white/50 mb-4">
                5 variants per split
              </h3>
              <div className="space-y-2">
                {VARIANTS.map((v) => (
                  <div key={v.name} className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/[0.04] transition-colors">
                    <div>
                      <p className="text-sm font-medium text-white/80">{v.name}</p>
                      <p className="text-[11px] text-white/30">{v.desc}</p>
                    </div>
                    <span className="text-xs text-[#F28C33] font-mono">{v.stars}</span>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>

          {/* Stats + Equipment */}
          <ScrollReveal animation="fade-up" delay={0.2}>
            <div className="space-y-6 h-full flex flex-col">
              {/* Key stats */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: '482', label: 'Exercises' },
                  { value: '12', label: 'Muscle groups' },
                  { value: '30+', label: 'Templates' },
                ].map((s) => (
                  <div key={s.label} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-center">
                    <p className="text-xl font-bold text-white">{s.value}</p>
                    <p className="text-[11px] text-white/30 mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Equipment */}
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 flex-1">
                <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-white/50 mb-4">Equipment</h3>
                <div className="flex flex-wrap gap-2">
                  {EQUIPMENT_TYPES.map((eq) => (
                    <div
                      key={eq.abbr}
                      className="px-3 py-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] text-sm"
                    >
                      <span className="text-white/60 font-mono text-xs mr-1.5">{eq.abbr}</span>
                      <span className="text-white/40">{eq.name}</span>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-white/25 mt-4 leading-relaxed">
                  Every exercise includes form instructions, muscle targets, and demo images. Build custom templates or use 30+ prebuilt programs.
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   Hiscores Section
   ══════════════════════════════════════════════════════════ */

const WORLD_LEADERBOARD = [
  { rank: 1, name: 'Furkan',    xp: '14,280', level: 42, medal: '🥇' },
  { rank: 2, name: 'Jesse',     xp: '12,910', level: 38, medal: '🥈' },
  { rank: 3, name: 'Liam',      xp: '11,540', level: 35, medal: '🥉' },
  { rank: 4, name: 'Sophie',    xp: '10,200', level: 31, medal: '' },
  { rank: 5, name: 'Daan',      xp: '9,870',  level: 29, medal: '' },
] as const;

const FRIENDS_LEADERBOARD: ReadonlyArray<{ rank: number; name: string; xp: string; level: number; medal: string; isUser?: boolean }> = [
  { rank: 1, name: 'You',       xp: '2,480',  level: 12, medal: '🥇', isUser: true },
  { rank: 2, name: 'Jesse',     xp: '2,210',  level: 10, medal: '🥈' },
  { rank: 3, name: 'Lotte',     xp: '1,870',  level: 8,  medal: '🥉' },
  { rank: 4, name: 'Max',       xp: '1,430',  level: 6,  medal: '' },
  { rank: 5, name: 'Emma',      xp: '980',    level: 4,  medal: '' },
];

function HiscoresSection() {
  const [tab, setTab] = useState<'world' | 'friends'>('world');
  const rows = tab === 'world' ? WORLD_LEADERBOARD : FRIENDS_LEADERBOARD;

  return (
    <section className="py-24 md:py-32 px-6">
      <ScrollReveal animation="fade-up">
        <div className="text-center mb-16">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#EDCA47] mb-3">Hiscores</p>
          <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
            See who&apos;s on top
          </h2>
          <p className="text-white/40 mt-4 max-w-md mx-auto text-sm md:text-base leading-relaxed">
            Global and friend leaderboards ranked by XP, level, and workouts. Monthly seasons keep it fresh.
          </p>
        </div>
      </ScrollReveal>

      <ScrollReveal animation="fade-up" delay={0.1}>
        <div className="max-w-lg mx-auto">
          {/* Tabs */}
          <div className="flex items-center gap-2 mb-6 justify-center">
            <button
              onClick={() => setTab('world')}
              className={`text-sm font-medium px-4 py-1.5 rounded-full transition-colors flex items-center gap-1.5 ${
                tab === 'world' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/60'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" /> World
            </button>
            <button
              onClick={() => setTab('friends')}
              className={`text-sm font-medium px-4 py-1.5 rounded-full transition-colors flex items-center gap-1.5 ${
                tab === 'friends' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/60'
              }`}
            >
              <Users className="w-3.5 h-3.5" /> Friends
            </button>
          </div>

          {/* Leaderboard Card */}
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-[2.5rem_1fr_4rem_4rem] px-5 py-3 border-b border-white/[0.06] text-[10px] font-semibold uppercase tracking-[0.15em] text-white/25">
              <span>#</span>
              <span>Player</span>
              <span className="text-right">Level</span>
              <span className="text-right">XP</span>
            </div>
            {/* Rows */}
            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25 }}
              >
                {rows.map((row) => {
                  const isUser = 'isUser' in row && row.isUser;
                  return (
                    <div
                      key={row.rank}
                      className={`grid grid-cols-[2.5rem_1fr_4rem_4rem] px-5 py-3 items-center border-b border-white/[0.03] last:border-0 ${
                        isUser ? 'bg-[#D4A843]/[0.06]' : ''
                      }`}
                    >
                      <span className="text-sm">
                        {row.medal || <span className="text-white/25">{row.rank}</span>}
                      </span>
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center text-[11px] font-bold text-white/50">
                          {row.name[0]}
                        </div>
                        <span className={`text-sm ${isUser ? 'text-[#D4A843] font-semibold' : 'text-white/70'}`}>
                          {row.name}
                        </span>
                      </div>
                      <span className="text-xs text-white/40 text-right font-mono">
                        {row.level}
                      </span>
                      <span className={`text-xs text-right font-mono ${row.rank <= 3 ? 'text-[#EDCA47]' : 'text-white/50'}`}>
                        {row.xp}
                      </span>
                    </div>
                  );
                })}
              </motion.div>
            </AnimatePresence>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-white/[0.06] text-center">
              <p className="text-[11px] text-white/25">
                {tab === 'world'
                  ? 'Season 1 · Resets monthly · Top 3 earn Legend rank'
                  : 'Weekly XP · Resets every Monday'}
              </p>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   Rewards Section
   ══════════════════════════════════════════════════════════ */

const RANK_TIERS = [
  { name: 'Legend',       icon: Crown,  color: '#E54D4D', xp: 'Top 3%' },
  { name: 'Master',      icon: Crown,  color: '#F28C33', xp: 'Top 10%' },
  { name: 'Elite',       icon: Star,   color: '#EDCA47', xp: 'Top 25%' },
  { name: 'Advanced',    icon: Zap,    color: '#CC80F2', xp: '500 XP' },
  { name: 'Intermediate',icon: Flame,  color: '#4D99F2', xp: '150 XP' },
  { name: 'Beginner',    icon: Flame,  color: '#66BF73', xp: '25 XP' },
  { name: 'Rookie',      icon: Users,  color: '#999CA0', xp: '0 XP' },
] as const;

const CHALLENGES = [
  { timeframe: 'DAY', color: '#4D99F2', examples: ['Log a meal', 'Complete a workout', 'Walk 5,000 steps'], xpRange: '5–10 XP' },
  { timeframe: 'WK',  color: '#CC80F2', examples: ['3 workouts', 'Hit protein 5x', 'Log weight'], xpRange: '10–15 XP' },
  { timeframe: 'MO',  color: '#F28C33', examples: ['12 workouts ★★★', '8 workouts ★★', '5 workouts ★'], xpRange: '20–80 XP' },
] as const;

const STREAK_MILESTONES = [
  { days: 7,  reward: '+ 1 day Pro',  icon: Flame },
  { days: 14, reward: '+ 2 days Pro', icon: Flame },
  { days: 30, reward: '+ 5 days Pro', icon: Trophy },
] as const;

function RewardsSection() {
  return (
    <section className="py-24 md:py-32 px-6">
      <ScrollReveal animation="fade-up">
        <div className="text-center mb-16">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#D4A843] mb-3">Rewards</p>
          <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
            Every rep counts
          </h2>
          <p className="text-white/40 mt-4 max-w-md mx-auto text-sm md:text-base leading-relaxed">
            Earn XP, climb ranks, complete challenges, and unlock Pro days — just by staying consistent.
          </p>
        </div>
      </ScrollReveal>

      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6">
        {/* Rank Ladder */}
        <ScrollReveal animation="fade-up" delay={0}>
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 h-full">
            <div className="flex items-center gap-2 mb-5">
              <BarChart3 className="w-4 h-4 text-[#D4A843]" />
              <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-white/50">7 Ranks to climb</h3>
            </div>
            <div className="space-y-1.5">
              {RANK_TIERS.map((tier) => {
                const Icon = tier.icon;
                return (
                  <div key={tier.name} className="flex items-center justify-between px-3 py-2 rounded-lg group hover:bg-white/[0.04] transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: `${tier.color}20` }}>
                        <Icon className="w-3 h-3" style={{ color: tier.color }} />
                      </div>
                      <span className="text-sm font-medium text-white/80">{tier.name}</span>
                    </div>
                    <span className="text-xs text-white/30 font-mono">{tier.xp}</span>
                  </div>
                );
              })}
            </div>
            <p className="text-[11px] text-white/25 mt-4 leading-relaxed">
              First 4 ranks are XP-based. Top 3 are percentile — compete with the community.
            </p>
          </div>
        </ScrollReveal>

        {/* Challenges + Streaks */}
        <div className="space-y-6">
          <ScrollReveal animation="fade-up" delay={0.1}>
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
              <div className="flex items-center gap-2 mb-5">
                <Target className="w-4 h-4 text-[#D4A843]" />
                <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-white/50">Challenges</h3>
              </div>
              <div className="space-y-3">
                {CHALLENGES.map((ch) => (
                  <div key={ch.timeframe} className="flex items-start gap-3">
                    <span
                      className="text-[10px] font-bold tracking-wider px-2 py-1 rounded-md mt-0.5 shrink-0"
                      style={{ backgroundColor: `${ch.color}18`, color: ch.color }}
                    >
                      {ch.timeframe}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm text-white/60 leading-relaxed">{ch.examples.join(' · ')}</p>
                      <p className="text-[11px] text-white/25 mt-0.5">{ch.xpRange} per task</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal animation="fade-up" delay={0.2}>
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
              <div className="flex items-center gap-2 mb-5">
                <Flame className="w-4 h-4 text-[#F28C33]" />
                <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-white/50">Streak Rewards</h3>
              </div>
              <div className="flex gap-3">
                {STREAK_MILESTONES.map((ms) => {
                  const Icon = ms.icon;
                  return (
                    <div key={ms.days} className="flex-1 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-center">
                      <Icon className="w-5 h-5 text-[#F28C33] mx-auto mb-2" />
                      <p className="text-lg font-bold text-white">{ms.days}</p>
                      <p className="text-[11px] text-white/30">days</p>
                      <div className="mt-2 px-2 py-0.5 rounded-full bg-[#D4A843]/10 inline-block">
                        <p className="text-[10px] font-semibold text-[#D4A843]">{ms.reward}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-[11px] text-white/25 mt-4 leading-relaxed">
                Log in daily and earn free Pro access. Rank up for even more Pro days.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   Pricing Section
   ══════════════════════════════════════════════════════════ */

const PRO_FEATURES = [
  { icon: Sparkles,   label: '~30 AI analyses per day', free: '3 / day' },
  { icon: Dumbbell,   label: 'Unlimited workout history', free: 'Limited' },
  { icon: BarChart3,  label: 'Advanced analytics & PR tracking', free: false },
  { icon: Download,   label: 'Data export', free: false },
  { icon: Headphones, label: 'Priority support', free: false },
] as const;


function PricingSection() {
  const [yearly, setYearly] = useState(true);

  return (
    <section className="py-24 md:py-32 px-6">
      <ScrollReveal animation="fade-up">
        <div className="text-center mb-16">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#D4A843] mb-3">Pricing</p>
          <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
            Free forever. Pro when you want more.
          </h2>
          <p className="text-white/40 mt-4 max-w-lg mx-auto text-sm md:text-base leading-relaxed">
            Everything you need to track, rank, and compete is free. Upgrade to Pro for unlimited AI and advanced features.
          </p>
        </div>
      </ScrollReveal>

      {/* Toggle */}
      <ScrollReveal animation="fade" delay={0.1}>
        <div className="flex items-center justify-center gap-3 mb-10">
          <button
            onClick={() => setYearly(false)}
            className={`text-sm font-medium px-4 py-1.5 rounded-full transition-colors ${
              !yearly ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/60'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setYearly(true)}
            className={`text-sm font-medium px-4 py-1.5 rounded-full transition-colors flex items-center gap-2 ${
              yearly ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/60'
            }`}
          >
            Yearly
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded-full">Save 40%</span>
          </button>
        </div>
      </ScrollReveal>

      <div className="max-w-3xl mx-auto grid md:grid-cols-2 gap-4">
        {/* Free Tier */}
        <ScrollReveal animation="fade-up" delay={0}>
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 h-full flex flex-col">
            <h3 className="text-lg font-bold text-white mb-1">Free</h3>
            <p className="text-white/30 text-sm mb-4">Get started, no card needed</p>
            <div className="px-3 py-2 rounded-lg bg-[#4D99F2]/10 border border-[#4D99F2]/20 mb-6">
              <p className="text-[12px] text-[#4D99F2] font-medium">
                <Sparkles className="w-3 h-3 inline mr-1 -mt-0.5" />
                7 days Pro free on sign-up
              </p>
            </div>
            <p className="text-3xl font-bold text-white mb-1">€0</p>
            <p className="text-white/30 text-sm mb-8">forever</p>
            <div className="space-y-3 flex-1">
              <FeatureRow included label="7-day Pro trial included" />
              <FeatureRow included label="Workout & meal logging" />
              <FeatureRow included label="Rank system & leaderboard" />
              <FeatureRow included label="Daily challenges & streaks" />
              <FeatureRow included label="3 AI analyses / day" />
              <FeatureRow label="Advanced analytics" />
              <FeatureRow label="Data export" />
            </div>
          </div>
        </ScrollReveal>

        {/* Pro Tier */}
        <ScrollReveal animation="fade-up" delay={0.1}>
          <div className="rounded-2xl border border-[#D4A843]/30 bg-[#D4A843]/[0.04] p-6 h-full flex flex-col relative">
            <div className="absolute -top-3 left-6">
              <span className="text-[10px] font-bold uppercase tracking-widest bg-[#D4A843] text-black px-3 py-1 rounded-full">
                Most popular
              </span>
            </div>
            <h3 className="text-lg font-bold text-white mb-1 mt-1">Pro</h3>
            <p className="text-white/30 text-sm mb-2">Unlock everything</p>
            <p className="text-[11px] text-[#4D99F2] font-medium mb-5">Includes 7-day free trial</p>
            <div className="flex items-baseline gap-1 mb-1">
              <p className="text-3xl font-bold text-white">{yearly ? '€4.99' : '€7.99'}</p>
              <span className="text-white/30 text-sm">/mo</span>
            </div>
            {yearly
              ? <p className="text-emerald-400 text-xs font-medium mb-8">€59.99/year — save €36</p>
              : <p className="text-white/30 text-sm mb-8">billed monthly</p>
            }
            <div className="space-y-3 flex-1">
              <FeatureRow included label="Everything in Free" />
              {PRO_FEATURES.map((f) => (
                <FeatureRow key={f.label} included label={f.label} />
              ))}
            </div>
            <a href={APP_STORE_URL} target="_blank" rel="noopener noreferrer" className="mt-8 px-5 py-3 bg-white text-black rounded-xl font-semibold text-sm text-center block hover:bg-white/90 transition-colors">
              Download on the App Store
            </a>
          </div>
        </ScrollReveal>

      </div>

      {/* Feature Comparison */}
      <ScrollReveal animation="fade-up" delay={0.15}>
        <div className="max-w-2xl mx-auto mt-16 rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
          <div className="grid grid-cols-3 text-center text-[11px] font-semibold uppercase tracking-[0.12em] text-white/30 py-3 border-b border-white/[0.06]">
            <span>Feature</span>
            <span>Free</span>
            <span className="text-[#D4A843]">Pro</span>
          </div>
          {PRO_FEATURES.map((f) => (
            <div key={f.label} className="grid grid-cols-3 text-center py-3 border-b border-white/[0.04] last:border-0 items-center">
              <span className="text-sm text-white/60 text-left pl-5">{f.label}</span>
              <span className="text-sm text-white/30">
                {f.free === false ? <X className="w-3.5 h-3.5 mx-auto text-white/15" /> : f.free}
              </span>
              <Check className="w-3.5 h-3.5 mx-auto text-[#D4A843]" />
            </div>
          ))}
        </div>
      </ScrollReveal>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   Shared Components
   ══════════════════════════════════════════════════════════ */

function FeatureRow({ included, label }: { included?: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2.5">
      {included ? (
        <Check className="w-3.5 h-3.5 text-[#D4A843] shrink-0" />
      ) : (
        <X className="w-3.5 h-3.5 text-white/15 shrink-0" />
      )}
      <span className={`text-sm ${included ? 'text-white/70' : 'text-white/25'}`}>{label}</span>
    </div>
  );
}
