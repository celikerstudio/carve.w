'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { CarveFooter } from '@/components/carve/CarveFooter';

const CATEGORIES = ['All', 'General', 'Features', 'Privacy', 'Development'] as const;
type Category = (typeof CATEGORIES)[number];

const FAQ_ITEMS: { category: Category; question: string; answer: string }[] = [
  // General
  {
    category: 'General',
    question: 'What is Carve?',
    answer:
      'Carve is a self-improvement platform that gamifies fitness and money tracking. Log workouts, scan meals, track spending — earn XP, climb ranks, and compete with friends. Think of it as an RPG for real life.',
  },
  {
    category: 'General',
    question: 'What does Carve stand for?',
    answer:
      'Carve means to shape and define. We help you carve your best self — your physique, your habits, your finances.',
  },
  {
    category: 'General',
    question: 'When will the app be available?',
    answer:
      "We're currently in active development. The iOS app beta launches Spring 2026. Join the waitlist to be notified.",
  },
  {
    category: 'General',
    question: 'How much does it cost?',
    answer:
      'Core features are free forever. Carve Pro ($4.99/mo yearly) unlocks AI coaching, advanced analytics, and priority features. You can also earn Pro through rank achievements.',
  },
  {
    category: 'General',
    question: 'What platforms are supported?',
    answer:
      'Launching on iOS first, with Android and web following. Your data syncs across all devices.',
  },
  // Features
  {
    category: 'Features',
    question: 'How does the AI food scanner work?',
    answer:
      'Take a photo of your meal and our AI identifies ingredients, estimates portions, and calculates macros instantly. You can also scan barcodes, search manually, or enter text descriptions.',
  },
  {
    category: 'Features',
    question: 'What is the scoreboard system?',
    answer:
      'Every workout earns XP. Accumulate XP to climb through 7 ranks — from Rookie to Legend. Compete with friends on global and local leaderboards. Seasons reset quarterly for fresh competition.',
  },
  {
    category: 'Features',
    question: 'What can I track?',
    answer:
      'Workouts (exercises, sets, reps, weight), nutrition (meals, macros, calories via AI scan), spending (subscriptions, transactions), body measurements, and daily habits. Everything earns XP.',
  },
  {
    category: 'Features',
    question: 'Can I compete with friends?',
    answer:
      'Yes! Follow friends, compare stats on leaderboards, create challenges, and share achievements. You can keep your profile private if you prefer solo mode.',
  },
  // Privacy
  {
    category: 'Privacy',
    question: 'Is my data private?',
    answer:
      'Yes. All data is private by default. You choose what to share and with whom. You can opt out of public leaderboards while using all other features.',
  },
  {
    category: 'Privacy',
    question: 'Can I export my data?',
    answer:
      'Absolutely. You own your data. Export all workouts, nutrition logs, and financial data in CSV or JSON format at any time.',
  },
  {
    category: 'Privacy',
    question: 'What happens if I delete my account?',
    answer:
      'All data is permanently deleted from our servers within 30 days. You can download a full export before deletion.',
  },
  // Development
  {
    category: 'Development',
    question: 'Who is building Carve?',
    answer:
      'Carve is built by Furkan Celiker, an independent developer based in Amsterdam. Learn more on the Developer page.',
  },
  {
    category: 'Development',
    question: 'Can I suggest features?',
    answer:
      'Yes! Visit the Contributing page to submit feature requests, bug reports, or wiki contributions. Community feedback shapes our roadmap.',
  },
  {
    category: 'Development',
    question: 'Is Carve open source?',
    answer:
      'The core app is in private development. Parts of the ecosystem (like the wiki content and documentation) may be opened up in the future.',
  },
];

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className={`rounded-xl border transition-colors ${
        isOpen
          ? 'border-white/[0.12] bg-white/[0.06]'
          : 'border-white/[0.08] bg-white/[0.03]'
      }`}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-5 text-left flex items-center justify-between gap-4"
      >
        <span className="font-medium text-white">{question}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4 text-white/30 flex-shrink-0" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-5">
              <p className="text-white/50 text-sm leading-relaxed">{answer}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState<Category>('All');

  const filtered =
    activeCategory === 'All'
      ? FAQ_ITEMS
      : FAQ_ITEMS.filter((item) => item.category === activeCategory);

  return (
    <div className="min-h-screen w-full bg-[#0A0A0B] text-white overflow-y-auto">
      {/* Hero Section */}
      <section className="py-24 md:py-32 px-6 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-4"
        >
          Frequently Asked Questions
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.6,
            delay: 0.15,
            ease: [0.25, 0.1, 0.25, 1],
          }}
          className="text-lg text-white/50 max-w-xl mx-auto"
        >
          Everything you need to know about Carve.
        </motion.p>
      </section>

      {/* Category Pill Navigation */}
      <section className="px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.6,
            delay: 0.3,
            ease: [0.25, 0.1, 0.25, 1],
          }}
          className="flex flex-wrap gap-2 justify-center mb-12"
        >
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeCategory === cat
                  ? 'bg-white text-black'
                  : 'bg-white/[0.06] text-white/50 hover:bg-white/[0.1] hover:text-white/70'
              }`}
            >
              {cat}
            </button>
          ))}
        </motion.div>
      </section>

      {/* FAQ Items */}
      <section className="py-24 md:py-32 px-6">
        <div className="max-w-3xl mx-auto space-y-3">
          {filtered.map((item, index) => (
            <ScrollReveal key={item.question} animation="fade-up" delay={index * 0.03}>
              <FAQItem question={item.question} answer={item.answer} />
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 md:py-32 px-6">
        <ScrollReveal animation="fade-up">
          <div className="max-w-3xl mx-auto rounded-2xl border border-white/[0.08] bg-white/[0.04] p-10 text-center">
            <h3 className="text-2xl font-bold text-white mb-3">Still have questions?</h3>
            <p className="text-white/50 mb-6">We&apos;re here to help.</p>
            <Link
              href="/carve/contributing"
              className="inline-block px-6 py-3 bg-white text-black rounded-xl font-semibold text-sm hover:bg-white/90 transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </ScrollReveal>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 text-center">
        <div className="max-w-5xl mx-auto">
          <CarveFooter />
        </div>
      </footer>
    </div>
  );
}
