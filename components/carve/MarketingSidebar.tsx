'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

type SidebarConfig = {
  features: string[];
  accent: string;
  accentBg: string;
};

const SIDEBAR_CONFIG: Record<string, SidebarConfig> = {
  '/carve': {
    features: ['Track workouts', 'AI coaching', 'Compete on scoreboards', 'Rank progression'],
    accent: 'text-[#D4A843]',
    accentBg: 'bg-[#D4A843]/10',
  },
  '/carve/money': {
    features: ['Budget tracking', 'Spending insights', 'Financial goals', 'Smart categorization'],
    accent: 'text-blue-400',
    accentBg: 'bg-blue-400/10',
  },
  '/carve/travel': {
    features: ['Trip planning', 'Collect moments', 'Travel journal', 'Destination discovery'],
    accent: 'text-orange-400',
    accentBg: 'bg-orange-400/10',
  },
};

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as const },
  },
};

interface MarketingSidebarProps {
  page: string;
}

export function MarketingSidebar({ page }: MarketingSidebarProps) {
  const config = SIDEBAR_CONFIG[page] ?? SIDEBAR_CONFIG['/carve'];

  return (
    <div className="flex flex-col items-start justify-center h-full px-8 lg:px-12">
      <motion.ul
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-4 mb-10"
      >
        {config.features.map((feature) => (
          <motion.li key={feature} variants={itemVariants} className="flex items-center gap-3">
            <span
              className={`flex items-center justify-center w-7 h-7 rounded-full ${config.accentBg}`}
            >
              <Check className={`w-4 h-4 ${config.accent}`} />
            </span>
            <span className="text-sm font-medium text-white/80">{feature}</span>
          </motion.li>
        ))}
      </motion.ul>

      <motion.div
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        className="w-full space-y-4"
      >
        <Link
          href="/signup"
          className="block w-full text-center bg-white text-black rounded-xl font-semibold py-3 px-6 text-sm hover:bg-white/90 transition-colors"
        >
          Get Started
        </Link>

        <p className="text-sm text-white/40 text-center">
          Already have an account?{' '}
          <Link href="/login" className="text-white/60 hover:text-white transition-colors underline">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
