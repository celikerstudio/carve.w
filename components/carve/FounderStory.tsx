'use client';

import { ScrollReveal } from '@/components/ui/scroll-reveal';

export function FounderStory() {
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

        <ScrollReveal animation="fade-up" delay={0.15}>
          <div className="space-y-4 text-white/50 text-base md:text-lg leading-relaxed max-w-xl mx-auto">
            <p>
              I was 130 kilos and hated every mirror. I tried every app&nbsp;&mdash; good nutrition but no workouts. Workouts but no progress that actually felt like something.
            </p>
            <p>
              Nothing made it a game. Nothing showed me how far I&apos;d already come.
            </p>
            <p className="text-white/70">
              So I built it myself. No coding experience. From my bedroom.
            </p>
          </div>
        </ScrollReveal>

        {/* Stats */}
        <ScrollReveal animation="fade-up" delay={0.2}>
          <div className="mt-12 grid grid-cols-3 gap-4">
            {[
              { value: '50kg', label: 'lost' },
              { value: '900+', label: 'commits' },
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
