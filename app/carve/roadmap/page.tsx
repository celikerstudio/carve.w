'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { CarveFooter } from '@/components/carve/CarveFooter';

/* ══════════════════════════════════════════════════════════
   Types
   ══════════════════════════════════════════════════════════ */

type Priority = 'high' | 'medium' | 'low';

interface RoadmapItem {
  title: string;
  description: string;
  priority?: Priority;
}

interface Phase {
  label: string;
  color: string;
  pulse?: boolean;
  dimmed?: boolean;
  transparent?: boolean;
  items: RoadmapItem[];
}

/* ══════════════════════════════════════════════════════════
   Data
   ══════════════════════════════════════════════════════════ */

const PHASES: Phase[] = [
  {
    label: 'Completed',
    color: '#22C55E',
    dimmed: true,
    items: [
      {
        title: 'Landing Page & Website',
        description: 'Marketing site with product showcase and information',
      },
      {
        title: 'Wiki System',
        description: 'Knowledge base for fitness and nutrition education',
      },
      {
        title: 'Marketing Pages',
        description: 'Roadmap, vision, FAQ, and developer pages',
      },
    ],
  },
  {
    label: 'In Development',
    color: '#D4A843',
    pulse: true,
    items: [
      {
        title: 'iOS App Beta',
        description: 'Native iOS app with core workout tracking and scoring',
        priority: 'high',
      },
      {
        title: 'AI Food Scanner',
        description: 'Photo-based meal logging with macro calculation',
        priority: 'high',
      },
      {
        title: 'Scoreboard System',
        description: 'XP, ranks, and global leaderboard system',
        priority: 'medium',
      },
    ],
  },
  {
    label: 'Planned',
    color: '#3B82F6',
    items: [
      {
        title: 'Social Features & Leaderboards',
        description: 'Follow friends, compete, share achievements',
        priority: 'high',
      },
      {
        title: 'Money Tracking',
        description: 'Subscription and spending management',
        priority: 'medium',
      },
      {
        title: 'Workout Programs',
        description: 'Pre-built training plans and custom program builder',
        priority: 'medium',
      },
      {
        title: 'Apple Watch Integration',
        description: 'Track workouts and metrics from your wrist',
        priority: 'medium',
      },
    ],
  },
  {
    label: 'Considering',
    color: '#A855F7',
    transparent: true,
    items: [
      {
        title: 'AI Coaching',
        description: 'Personalized training recommendations based on your data',
        priority: 'low',
      },
      {
        title: 'Community Challenges',
        description: 'Monthly fitness challenges with rewards and prizes',
        priority: 'low',
      },
      {
        title: 'Android App',
        description: 'Carve on Android devices',
        priority: 'low',
      },
    ],
  },
];

const PRIORITY_STYLES: Record<Priority, string> = {
  high: 'bg-red-500/10 text-red-400 border border-red-500/20',
  medium: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  low: 'bg-green-500/10 text-green-400 border border-green-500/20',
};

/* ══════════════════════════════════════════════════════════
   Components
   ══════════════════════════════════════════════════════════ */

function RoadmapCard({
  item,
  dimmed,
}: {
  item: RoadmapItem;
  dimmed?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border border-white/[0.08] bg-white/[0.04] p-5 ${
        dimmed ? 'opacity-50' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3
            className={`text-white font-semibold mb-1 ${
              dimmed ? 'line-through' : ''
            }`}
          >
            {item.title}
          </h3>
          <p className="text-white/40 text-sm">{item.description}</p>
        </div>
        {item.priority && !dimmed && (
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
              PRIORITY_STYLES[item.priority]
            }`}
          >
            {item.priority.toUpperCase()}
          </span>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   Page
   ══════════════════════════════════════════════════════════ */

export default function RoadmapPage() {
  return (
    <div className="min-h-screen w-full bg-[#0A0A0B] text-white overflow-y-auto">

      {/* ─── Hero ─── */}
      <section className="py-24 md:py-32 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-4"
          >
            Roadmap
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-lg md:text-xl text-white/50 font-light max-w-2xl mx-auto"
          >
            See what we&apos;re building and where Carve is heading.
          </motion.p>
        </div>
      </section>

      {/* ─── Visual Timeline ─── */}
      <section className="py-24 md:py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-6 md:left-8 top-0 bottom-0 w-px bg-white/[0.08]" />

            {/* Phase sections */}
            {PHASES.map((phase, phaseIndex) => (
              <ScrollReveal
                key={phase.label}
                animation="fade-up"
                delay={phaseIndex * 0.1}
              >
                <div className="relative pl-16 md:pl-20 mb-16 last:mb-0">
                  {/* Dot on the line */}
                  <div
                    className={`absolute left-[19px] md:left-[27px] top-1 w-3 h-3 rounded-full ${
                      phase.pulse ? 'animate-pulse' : ''
                    }`}
                    style={{
                      backgroundColor: phase.color,
                      boxShadow: `0 0 12px ${phase.color}40`,
                    }}
                  />

                  {/* Phase header */}
                  <h2
                    className="text-2xl md:text-3xl font-bold mb-1"
                    style={{ color: phase.color }}
                  >
                    {phase.label}
                  </h2>

                  {/* Items */}
                  <div className="space-y-3 mt-4">
                    {phase.items.map((item) => (
                      <RoadmapCard
                        key={item.title}
                        item={item}
                        dimmed={phase.dimmed}
                      />
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-24 md:py-32 px-6">
        <ScrollReveal animation="fade-up">
          <div className="max-w-5xl mx-auto">
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-8 md:p-12 text-center">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
                Have a feature request?
              </h3>
              <p className="text-white/50 mb-6 max-w-lg mx-auto">
                We&apos;d love to hear your ideas. Help shape the future of Carve.
              </p>
              <Link
                href="/carve/contributing"
                className="inline-block bg-white text-black font-semibold px-8 py-3 rounded-xl text-sm hover:bg-white/90 transition-colors"
              >
                Submit Feedback
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ─── Footer ─── */}
      <footer className="py-16 px-6 text-center">
        <div className="max-w-5xl mx-auto">
          <CarveFooter />
        </div>
      </footer>
    </div>
  );
}
