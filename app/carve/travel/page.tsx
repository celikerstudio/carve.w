'use client';

import { motion } from 'framer-motion';
import { Globe, CalendarDays, Heart } from 'lucide-react';
import { TravelCard } from '@/components/carve/TravelCard';
import { CarveFooter } from '@/components/carve/CarveFooter';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { MarketingPageLayout } from '@/components/carve/MarketingPageLayout';

export default function CarveTravelPage() {
  return (
    <MarketingPageLayout page="/carve/travel">
      {/* Hero Section */}
      <section className="min-h-[60vh] flex flex-col items-center justify-center px-6 py-20 relative">
        {/* CARVE TRAVEL logo */}
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-5xl md:text-7xl font-bold tracking-[0.3em] text-white mb-1"
        >
          CARVE
        </motion.h1>
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="text-3xl md:text-5xl font-bold tracking-[0.3em] text-[#F97316] mb-3"
        >
          TRAVEL
        </motion.span>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-lg md:text-xl text-white/50 mb-12 font-light"
        >
          Collect moments, not things
        </motion.p>

        {/* Travel Card */}
        <TravelCard />

      </section>

      {/* Value Proposition */}
      <section className="py-24 md:py-32 px-6">
        <ScrollReveal animation="fade-up">
          <h2 className="text-3xl md:text-5xl font-bold text-center text-white mb-16 tracking-tight">
            Dream. Plan. Live.
          </h2>
        </ScrollReveal>

        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-4">
          {[
            {
              icon: <Globe className="w-5 h-5" />,
              title: 'Dream',
              text: 'Build your bucketlist. See where the world takes you.',
            },
            {
              icon: <CalendarDays className="w-5 h-5" />,
              title: 'Plan',
              text: 'Day-by-day itineraries. Budget. Packing lists. All in one place.',
            },
            {
              icon: <Heart className="w-5 h-5" />,
              title: 'Live',
              text: 'Track every moment. Your travels become your story.',
            },
          ].map((card, i) => (
            <ScrollReveal key={card.title} animation="fade-up" delay={i * 0.1}>
              <div className="rounded-xl border border-orange-500/[0.08] bg-orange-950/20 p-6 h-full">
                <div className="w-10 h-10 rounded-lg bg-orange-500/[0.08] flex items-center justify-center text-white/50 mb-4">
                  {card.icon}
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">{card.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{card.text}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Footer */}
      <section className="py-24 md:py-32 px-6">
        <ScrollReveal animation="fade-up">
          <div className="text-center">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-16 tracking-tight">
              Where will your next story begin?
            </h2>
            <CarveFooter />
          </div>
        </ScrollReveal>
      </section>
    </MarketingPageLayout>
  );
}
