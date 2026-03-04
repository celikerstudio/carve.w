'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Dumbbell, Wallet, MapPin, ArrowUp } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/scroll-reveal';

const CONVERSATIONS = [
  {
    key: 'health',
    label: 'Health',
    icon: Dumbbell,
    accent: '#D4A843',
    user: 'What should I eat after my workout?',
    ai: 'Based on your push day, aim for 140g protein today. Try chicken with rice and greens — that\u2019s 45g protein in one meal.',
    chips: ['Log meal', 'Plan workout', 'My progress'],
  },
  {
    key: 'money',
    label: 'Money',
    icon: Wallet,
    accent: '#3B82F6',
    user: 'Where can I cut spending?',
    ai: 'Found 2 unused subscriptions: Adobe CC (\u20AC54.99) and Headspace (\u20AC12.99). Cancel both to save \u20AC67.98/mo.',
    chips: ['Budget status', 'Find savings', 'Subscriptions'],
  },
  {
    key: 'travel',
    label: 'Travel',
    icon: MapPin,
    accent: '#F97316',
    user: 'Plan me 5 days in Tokyo',
    ai: 'Day 1 \u2014 Shibuya & Harajuku. Day 2 \u2014 Senso-ji & Akihabara. Day 3 \u2014 Tsukiji & Ginza. Estimated: ~\u20AC120/day.',
    chips: ['Plan a trip', 'Bucket list', 'Trip budget'],
  },
];

const TYPING_SPEED = 25;
const PAUSE_BEFORE_TYPING = 1000;
const HOLD_COMPLETE = 3000;

type Phase = 'user' | 'dots' | 'typing' | 'complete' | 'transition';

export function AIChatDemo() {
  const [convIndex, setConvIndex] = useState(0);
  const [typedChars, setTypedChars] = useState(0);
  const [phase, setPhase] = useState<Phase>('user');

  const conv = CONVERSATIONS[convIndex];

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    switch (phase) {
      case 'user':
        timer = setTimeout(() => setPhase('dots'), 500);
        break;
      case 'dots':
        timer = setTimeout(() => setPhase('typing'), PAUSE_BEFORE_TYPING);
        break;
      case 'typing':
        if (typedChars < conv.ai.length) {
          timer = setTimeout(() => setTypedChars((c) => c + 1), TYPING_SPEED);
        } else {
          setPhase('complete');
        }
        break;
      case 'complete':
        timer = setTimeout(() => setPhase('transition'), HOLD_COMPLETE);
        break;
      case 'transition':
        timer = setTimeout(() => {
          setTypedChars(0);
          setConvIndex((i) => (i + 1) % CONVERSATIONS.length);
          setPhase('user');
        }, 400);
        break;
    }

    return () => clearTimeout(timer);
  }, [phase, typedChars, conv.ai.length]);

  return (
    <section className="py-24 md:py-32 px-6">
      <ScrollReveal animation="fade-up">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
            A coach that knows you.
          </h2>
          <p className="text-white/40 mt-4 max-w-md mx-auto text-sm md:text-base leading-relaxed">
            Not a generic answer. A coach that knows what you trained this morning, what your budget is, and where your next trip goes.
          </p>
        </div>
      </ScrollReveal>

      <div className="max-w-sm mx-auto">
        <ScrollReveal animation="fade-up" delay={0.1}>
          {/* Phone Frame */}
          <div className="relative mx-auto w-full max-w-[320px]">
            <div className="rounded-[2.5rem] border-[3px] border-white/[0.12] bg-[#0D0D0F] p-3 shadow-2xl shadow-black/50">
              {/* Notch */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-5 bg-[#0D0D0F] rounded-full z-20" />

              {/* Screen */}
              <div
                className="rounded-[2rem] overflow-hidden bg-[#111113] flex flex-col"
                style={{ aspectRatio: '9/17' }}
              >
                {/* Domain tabs */}
                <div className="flex items-center gap-1 px-4 pt-10 pb-2">
                  {CONVERSATIONS.map((d, i) => {
                    const Icon = d.icon;
                    const isActive = i === convIndex;
                    return (
                      <motion.div
                        key={d.key}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                        animate={{
                          backgroundColor: isActive
                            ? `${d.accent}18`
                            : 'rgba(255,255,255,0)',
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        <motion.div
                          animate={{ color: isActive ? d.accent : 'rgba(255,255,255,0.2)' }}
                          transition={{ duration: 0.3 }}
                        >
                          <Icon className="w-3 h-3" />
                        </motion.div>
                        <motion.span
                          className="text-[10px] font-medium"
                          animate={{ color: isActive ? d.accent : 'rgba(255,255,255,0.2)' }}
                          transition={{ duration: 0.3 }}
                        >
                          {d.label}
                        </motion.span>
                      </motion.div>
                    );
                  })}
                </div>

                <div className="mx-4 border-t border-white/[0.04]" />

                {/* Chat area */}
                <div className="flex-1 px-4 py-4 flex flex-col justify-end overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={convIndex}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="space-y-3"
                    >
                      {/* User bubble */}
                      <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                        className="flex justify-end"
                      >
                        <div className="max-w-[82%] px-3.5 py-2.5 rounded-2xl rounded-br-sm bg-white/[0.08]">
                          <p className="text-[12px] text-white/80 leading-relaxed">
                            {conv.user}
                          </p>
                        </div>
                      </motion.div>

                      {/* Typing dots indicator */}
                      {phase === 'dots' && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="flex items-start gap-2"
                        >
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                            style={{ backgroundColor: `${conv.accent}18` }}
                          >
                            <Brain className="w-3 h-3" style={{ color: conv.accent }} />
                          </div>
                          <div
                            className="px-3.5 py-3 rounded-2xl rounded-bl-sm"
                            style={{ backgroundColor: `${conv.accent}10` }}
                          >
                            <div className="flex gap-1">
                              {[0, 1, 2].map((i) => (
                                <motion.div
                                  key={i}
                                  className="w-1.5 h-1.5 rounded-full"
                                  style={{ backgroundColor: `${conv.accent}60` }}
                                  animate={{ y: [0, -3, 0] }}
                                  transition={{
                                    duration: 0.5,
                                    delay: i * 0.12,
                                    repeat: Infinity,
                                    ease: 'easeInOut',
                                  }}
                                />
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* AI response bubble */}
                      {(phase === 'typing' || phase === 'complete') && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
                          className="flex items-start gap-2"
                        >
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                            style={{ backgroundColor: `${conv.accent}18` }}
                          >
                            <Brain className="w-3 h-3" style={{ color: conv.accent }} />
                          </div>
                          <div
                            className="max-w-[82%] px-3.5 py-2.5 rounded-2xl rounded-bl-sm border"
                            style={{
                              backgroundColor: `${conv.accent}10`,
                              borderColor: `${conv.accent}15`,
                            }}
                          >
                            <p className="text-[12px] text-white/70 leading-relaxed">
                              {conv.ai.slice(0, typedChars)}
                              {phase === 'typing' && (
                                <motion.span
                                  className="inline-block w-[2px] h-[13px] ml-0.5 align-middle rounded-full"
                                  style={{ backgroundColor: conv.accent }}
                                  animate={{ opacity: [1, 0] }}
                                  transition={{ duration: 0.5, repeat: Infinity }}
                                />
                              )}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Suggestion chips */}
                <div className="px-4 pb-2">
                  <div className="flex gap-1.5">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={convIndex}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex gap-1.5"
                      >
                        {conv.chips.map((chip) => (
                          <div
                            key={chip}
                            className="px-2.5 py-1.5 rounded-full text-[10px] text-white/25 border border-white/[0.06] whitespace-nowrap"
                          >
                            {chip}
                          </div>
                        ))}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>

                {/* Input bar */}
                <div className="px-4 pb-3 pt-1">
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <span className="text-[11px] text-white/20 flex-1">
                      Ask Carve AI...
                    </span>
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${conv.accent}25` }}
                    >
                      <ArrowUp className="w-3 h-3" style={{ color: conv.accent }} />
                    </div>
                  </div>
                </div>

                {/* Home indicator */}
                <div className="flex justify-center pb-2">
                  <div className="w-24 h-1 bg-white/20 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Domain dots */}
        <div className="flex items-center justify-center gap-2 mt-8">
          {CONVERSATIONS.map((d, i) => (
            <motion.div
              key={d.key}
              className="w-1.5 h-1.5 rounded-full"
              animate={{
                backgroundColor: i === convIndex ? d.accent : 'rgba(255,255,255,0.15)',
                scale: i === convIndex ? 1.3 : 1,
              }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
