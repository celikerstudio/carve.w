'use client';

import { motion } from 'framer-motion';
import { Gamepad2, BarChart3, Users, Brain } from 'lucide-react';
import Link from 'next/link';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { CarveFooter } from '@/components/carve/CarveFooter';

const BELIEFS = [
  {
    icon: Gamepad2,
    color: '#D4A843',
    title: 'Fitness Should Be Fun',
    description:
      'Traditional fitness tracking is boring. Gamification, achievements, and competition make working out feel like leveling up in your favorite game.',
  },
  {
    icon: BarChart3,
    color: '#3B82F6',
    title: 'Data Drives Progress',
    description:
      "You can't improve what you don't measure. We make it effortless to track your workouts, nutrition, and progress with beautiful visualizations.",
  },
  {
    icon: Users,
    color: '#22C55E',
    title: 'Community Amplifies Results',
    description:
      'Training with friends, competing on leaderboards, and sharing achievements creates accountability and motivation that keeps you going.',
  },
  {
    icon: Brain,
    color: '#A855F7',
    title: 'Knowledge Empowers Change',
    description:
      'Understanding the science behind training and nutrition helps you make better decisions. Our wiki provides evidence-based information.',
  },
];

const REASONS = [
  {
    title: 'Fitness Apps Are Stale',
    description:
      "Most tracking apps haven't innovated in years. Complex, boring, focused on hardcore athletes.",
  },
  {
    title: 'Gamification Works',
    description:
      'Games have mastered engagement. Time to apply those principles to fitness meaningfully.',
  },
  {
    title: 'Community Is Everything',
    description:
      'Social platforms proved the power of connection. Fitness should be social by default.',
  },
  {
    title: 'Technology Is Ready',
    description:
      'AI, wearables, and mobile capabilities enable experiences impossible just a few years ago.',
  },
];

export default function VisionPage() {
  return (
    <div className="min-h-screen w-full bg-[#0A0A0B] text-white overflow-y-auto">
      {/* Hero Section */}
      <section className="py-24 md:py-32 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <ScrollReveal animation="fade-up">
            <div className="relative flex items-center justify-center">
              <div className="absolute w-[600px] h-[400px] bg-[radial-gradient(ellipse_at_center,_rgba(168,85,247,0.15)_0%,_transparent_70%)]" />
              <h1 className="relative text-5xl md:text-7xl font-bold tracking-tight text-white">
                Our Vision
              </h1>
            </div>
          </ScrollReveal>
          <ScrollReveal animation="fade-up" delay={0.15}>
            <p className="text-xl md:text-2xl text-white/60 leading-relaxed max-w-2xl mx-auto mt-6">
              Make self-improvement the most rewarding game you'll ever play.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Core Beliefs */}
      <section className="py-24 md:py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal animation="fade-up">
            <h2 className="text-3xl font-bold text-white mb-8">Core Beliefs</h2>
          </ScrollReveal>
          <div className="grid md:grid-cols-2 gap-4">
            {BELIEFS.map((belief, index) => {
              const Icon = belief.icon;
              return (
                <ScrollReveal key={belief.title} animation="fade-up" delay={index * 0.1}>
                  <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-6">
                    <div
                      className="w-11 h-11 rounded-full flex items-center justify-center mb-5"
                      style={{ backgroundColor: `${belief.color}15` }}
                    >
                      <Icon className="w-5 h-5" style={{ color: belief.color }} />
                    </div>
                    <h3 className="text-white font-semibold text-lg mb-2">{belief.title}</h3>
                    <p className="text-white/50 text-sm leading-relaxed">{belief.description}</p>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* The Future */}
      <section className="py-24 md:py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal animation="fade-up">
            <h2 className="text-3xl font-bold text-white mb-8">The Future</h2>
          </ScrollReveal>
          <ScrollReveal animation="fade-up" delay={0.1}>
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-8 md:p-10">
              <p className="text-white/50 leading-relaxed mb-6">
                We envision a world where{' '}
                <span className="text-white font-medium">
                  fitness tracking is seamless, intelligent, and social
                </span>
                . Where your phone automatically logs your workout. Where AI analyzes your data and
                suggests exactly what to do next. Where you can challenge friends and see results in
                real-time.
              </p>
              <p className="text-white/50 leading-relaxed mb-6">
                Carve will become the{' '}
                <span className="text-white font-medium">
                  central hub for your entire fitness journey
                </span>{' '}
                — from finding workout partners to discovering new exercises, from tracking your PRs
                to learning proper nutrition.
              </p>
              <p className="text-white/50 leading-relaxed">
                We're building more than an app. We're building a{' '}
                <span className="text-white font-medium">movement</span> — a community of people
                who believe that getting stronger, faster, and healthier should be as engaging as any
                game.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Why Now? */}
      <section className="py-24 md:py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal animation="fade-up">
            <h2 className="text-3xl font-bold text-white mb-8">Why Now?</h2>
          </ScrollReveal>
          <div className="grid md:grid-cols-2 gap-4">
            {REASONS.map((reason, index) => (
              <ScrollReveal key={reason.title} animation="fade-up" delay={index * 0.1}>
                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-6">
                  <h3 className="text-white font-semibold text-lg mb-2">{reason.title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{reason.description}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 md:py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal animation="fade-up">
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-12 text-center">
              <h3 className="text-3xl font-bold text-white mb-4">Join the Mission</h3>
              <p className="text-white/50 mb-8 max-w-lg mx-auto">
                We're just getting started. Be part of building the future of self-improvement.
              </p>
              <Link
                href="/carve/contributing"
                className="inline-block px-8 py-3 bg-white text-black rounded-xl font-semibold text-sm hover:bg-white/90 transition-colors"
              >
                Get Involved
              </Link>
            </div>
          </ScrollReveal>
        </div>
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
