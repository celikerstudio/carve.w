'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { APP_STORE_URL } from '@/lib/utils';

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
          Get Started — It&apos;s Free
        </Link>

        <a
          href={APP_STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full text-center border border-white/[0.1] text-white/70 rounded-xl font-medium py-3 px-6 text-sm hover:bg-white/[0.04] hover:border-white/[0.15] transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
          </svg>
          Download the App
        </a>

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
