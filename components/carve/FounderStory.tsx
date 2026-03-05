'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { EASE } from '@/lib/motion-config';

function AnimatedBar({
  label,
  from,
  to,
  unit = '%',
  color,
  delay = 0,
  inView,
}: {
  label: string;
  from: number;
  to: number;
  unit?: string;
  color: string;
  delay?: number;
  inView: boolean;
}) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-white/50">{label}</span>
        <span className="text-white/50">
          {from}{unit} &rarr; {to}{unit}
        </span>
      </div>
      <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: `${from}%` }}
          animate={inView ? { width: `${to}%` } : { width: `${from}%` }}
          transition={{
            duration: 1.5,
            delay,
            ease: EASE,
          }}
        />
      </div>
    </div>
  );
}

export function FounderStory() {
  const barsRef = useRef<HTMLDivElement>(null);
  const barsInView = useInView(barsRef, { once: true, margin: '-100px' });

  return (
    <section className="py-24 md:py-32 px-6">
      <div className="max-w-2xl mx-auto text-center">
        {/* The number */}
        <ScrollReveal animation="fade-up">
          <p className="text-6xl md:text-8xl font-bold text-white tracking-tight mb-8">
            130<span className="text-white/20">kg</span>
            <span className="text-white/20 mx-2 md:mx-4">&rarr;</span>
            80<span className="text-white/20">kg</span>
          </p>
        </ScrollReveal>

        {/* Animated progress bars */}
        <ScrollReveal animation="fade-up" delay={0.1}>
          <div ref={barsRef} className="max-w-md mx-auto space-y-4 mb-10">
            <AnimatedBar
              label="Body fat"
              from={38}
              to={15}
              color="#ef4444"
              delay={0}
              inView={barsInView}
            />
            <AnimatedBar
              label="Muscle mass"
              from={28}
              to={42}
              color="#22c55e"
              delay={0.2}
              inView={barsInView}
            />
          </div>
        </ScrollReveal>

        {/* Story copy */}
        <ScrollReveal animation="fade-up" delay={0.15}>
          <div className="text-white/50 text-base md:text-lg leading-relaxed max-w-xl mx-auto">
            <p>
              130kg &rarr; 80kg. 4 years. Built the app that got me there. Now it does more than fitness. So do I.
            </p>
          </div>
        </ScrollReveal>

        {/* Stats */}
        <ScrollReveal animation="fade-up" delay={0.2}>
          <div className="mt-12 grid grid-cols-3 gap-4">
            {[
              { value: '50kg', label: 'lost' },
              { value: '4 yrs', label: 'journey' },
              { value: '1', label: 'developer' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl md:text-3xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-white/30 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
