'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { APP_STORE_URL } from '@/lib/utils';
import { AppleGlyph } from '@/components/carve/AppleGlyph';
import { track } from '@/lib/analytics';

type ChatExample = {
  question: string;
  answer: string;
};

type HeroConfig = {
  chats: ChatExample[];
  accent: string;
  accentBg: string;
};

const HERO_CONFIG: Record<string, HeroConfig> = {
  '/carve': {
    chats: [
      { question: 'What should I train today?', answer: 'You haven\u2019t hit chest in 4 days. I\u2019d suggest bench press, incline dumbbell press, and cable flyes.' },
      { question: 'Am I eating enough protein?', answer: 'You\u2019re averaging 1.4g/kg this week. For your goals, aim for 1.8g/kg \u2014 about 40g more per day.' },
      { question: 'How\u2019s my progress this month?', answer: 'You\u2019ve trained 14 out of 22 days. Your squat 1RM estimate went up 5kg. Consistency is paying off.' },
      { question: 'I feel tired, should I still go?', answer: 'Your sleep was 5.5h last night. I\u2019d recommend a light session \u2014 mobility work and some easy cardio.' },
    ],
    accent: 'text-[#D4A843]',
    accentBg: 'bg-[#D4A843]/10',
  },
  '/carve/money': {
    chats: [
      { question: 'Where did my money go this month?', answer: 'You spent \u20ac847 so far. Biggest: groceries (\u20ac234), dining out (\u20ac189), and subscriptions (\u20ac67).' },
      { question: 'Any subscriptions I should cancel?', answer: 'You have 3 overlapping streaming services (\u20ac31/mo). One hasn\u2019t been used in 2 months.' },
      { question: 'Am I on track for my savings goal?', answer: 'You\u2019re at 62% of your \u20ac5,000 goal. At this rate, you\u2019ll hit it by August.' },
      { question: 'How much did I spend on coffee?', answer: '\u20ac47 this month across 18 purchases. That\u2019s up 30% from last month. Daily average: \u20ac2.60.' },
    ],
    accent: 'text-blue-400',
    accentBg: 'bg-blue-400/10',
  },
  '/carve/travel': {
    chats: [
      { question: 'Plan a 5-day trip to Lisbon', answer: 'Day 1: Alfama & Castle. Day 2: Bel\u00e9m. Day 3: Sintra day trip. Day 4: LX Factory. Day 5: Cascais beach.' },
      { question: 'Best time to visit Japan?', answer: 'Late March to mid-April for cherry blossoms, or November for autumn colors. Avoid Golden Week.' },
      { question: 'Budget for a week in Bangkok?', answer: 'Comfortable: \u20ac45-60/day. Street food: \u20ac3-5/meal. A week comes to roughly \u20ac350-450.' },
      { question: 'What should I pack for Iceland?', answer: 'Layers: merino base, fleece mid, waterproof shell. Plus swimsuit for hot springs and hiking boots.' },
    ],
    accent: 'text-orange-400',
    accentBg: 'bg-orange-400/10',
  },
};

export function MarketingHero({ page }: { page: string }) {
  const config = HERO_CONFIG[page] ?? HERO_CONFIG['/carve'];
  const [chatIndex, setChatIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    setShowAnswer(false);
    const answerTimer = setTimeout(() => setShowAnswer(true), 1200);
    const cycleTimer = setTimeout(() => {
      setShowAnswer(false);
      setTimeout(() => setChatIndex((i) => (i + 1) % config.chats.length), 400);
    }, 6000);

    return () => {
      clearTimeout(answerTimer);
      clearTimeout(cycleTimer);
    };
  }, [chatIndex, config.chats.length]);

  const chat = config.chats[chatIndex];

  return (
    <section className="pt-8 pb-16 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Left: AI Chat Demo */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className={`w-6 h-6 rounded-full ${config.accentBg} flex items-center justify-center`}>
                <Sparkles className={`w-3 h-3 ${config.accent}`} />
              </div>
              <span className="text-xs font-medium text-white/40 tracking-wide uppercase">AI Coach</span>
            </div>

            <div className="space-y-3 min-h-[160px]">
              {/* User question */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={`q-${chatIndex}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                  className="flex justify-end"
                >
                  <div className="bg-white/[0.08] rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[85%]">
                    <p className="text-sm text-white/80">{chat.question}</p>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* AI answer or typing indicator */}
              <AnimatePresence mode="wait">
                {showAnswer ? (
                  <motion.div
                    key={`a-${chatIndex}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.35 }}
                    className="flex justify-start"
                  >
                    <div className={`${config.accentBg} rounded-2xl rounded-tl-sm px-4 py-2.5 max-w-[90%]`}>
                      <p className="text-sm text-white/70 leading-relaxed">{chat.answer}</p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key={`typing-${chatIndex}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex justify-start"
                  >
                    <div className={`${config.accentBg} rounded-2xl rounded-tl-sm px-4 py-3`}>
                      <div className="flex gap-1.5">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            className="w-1.5 h-1.5 rounded-full bg-white/30"
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                          />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right: CTA */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col justify-center lg:py-4"
          >
            <div className="space-y-4 max-w-xs">
              <Link
                href="/signup"
                className="block w-full text-center bg-white text-black rounded-xl font-semibold py-3.5 px-6 text-sm hover:bg-white/90 transition-colors"
              >
                Get Started — It&apos;s Free
              </Link>

              <a
                href={APP_STORE_URL}
              onClick={() => track('app_store_click', { source: 'marketing_hero' })}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full text-center border border-white/[0.1] text-white/70 rounded-xl font-medium py-3.5 px-6 text-sm hover:bg-white/[0.04] hover:border-white/[0.15] transition-colors"
              >
                <AppleGlyph className="w-4 h-4" />
                Download the App
              </a>

              <p className="text-sm text-white/40 text-center">
                Already have an account?{' '}
                <Link href="/login" className="text-white/60 hover:text-white transition-colors underline">
                  Sign in
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
