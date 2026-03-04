'use client';

import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Globe, Compass } from 'lucide-react';
import { useState, useEffect } from 'react';

// City positions on a 300x100 equirectangular projection
// x = (lon + 180) / 360 * 300, y = (70 - lat) / 120 * 100
const CITIES = [
  /* 0  */ { x: 150, y: 15 },  // London
  /* 1  */ { x: 152, y: 18 },  // Paris
  /* 2  */ { x: 154, y: 15 },  // Amsterdam
  /* 3  */ { x: 161, y: 15 },  // Berlin
  /* 4  */ { x: 152, y: 24 },  // Barcelona
  /* 5  */ { x: 160, y: 23 },  // Rome
  /* 6  */ { x: 174, y: 24 },  // Istanbul
  /* 7  */ { x: 196, y: 37 },  // Dubai
  /* 8  */ { x: 165, y: 87 },  // Cape Town
  /* 9  */ { x: 181, y: 59 },  // Nairobi
  /* 10 */ { x: 211, y: 42 },  // Mumbai
  /* 11 */ { x: 234, y: 47 },  // Bangkok
  /* 12 */ { x: 237, y: 57 },  // Singapore
  /* 13 */ { x: 246, y: 65 },  // Bali
  /* 14 */ { x: 251, y: 32 },  // Shanghai
  /* 15 */ { x: 266, y: 29 },  // Tokyo
  /* 16 */ { x: 88,  y: 24 },  // New York
  /* 17 */ { x: 48,  y: 27 },  // San Francisco
  /* 18 */ { x: 67,  y: 42 },  // Mexico City
  /* 19 */ { x: 114, y: 77 },  // Rio de Janeiro
  /* 20 */ { x: 276, y: 87 },  // Sydney
];

// Growth phases — watching your world light up
const PHASES = [
  {
    countries: 5,
    cities: 8,
    continents: 1,
    active: [0, 1, 2, 3, 4, 5],                                       // Europe
    trip: { city: 'Barcelona', country: 'Spain', flag: '\u{1F1EA}\u{1F1F8}', date: 'Mar 2025', days: 5 },
  },
  {
    countries: 9,
    cities: 24,
    continents: 2,
    active: [0, 1, 2, 3, 4, 5, 6, 11, 12, 13],                       // + SE Asia
    trip: { city: 'Bali', country: 'Indonesia', flag: '\u{1F1EE}\u{1F1E9}', date: 'Aug 2025', days: 12 },
  },
  {
    countries: 15,
    cities: 48,
    continents: 4,
    active: [0, 1, 2, 3, 4, 5, 6, 7, 10, 11, 12, 13, 14, 15, 16],   // + East Asia, Middle East, Americas
    trip: { city: 'Tokyo', country: 'Japan', flag: '\u{1F1EF}\u{1F1F5}', date: 'Jan 2026', days: 10 },
  },
  {
    countries: 21,
    cities: 67,
    continents: 6,
    active: CITIES.map((_, i) => i),                                    // Everywhere
    trip: { city: 'Sydney', country: 'Australia', flag: '\u{1F1E6}\u{1F1FA}', date: 'Mar 2026', days: 14 },
  },
];

const CYCLE_MS = 2800;
const ENTRANCE_DELAY = 1.2;
const ENTRANCE_DURATION = 0.7;

export function TravelCard() {
  const [phase, setPhase] = useState(0);
  const [hasEntered, setHasEntered] = useState(false);

  useEffect(() => {
    const timer = setTimeout(
      () => setHasEntered(true),
      (ENTRANCE_DELAY + ENTRANCE_DURATION) * 1000,
    );
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!hasEntered) return;
    const interval = setInterval(() => setPhase((p) => (p + 1) % PHASES.length), CYCLE_MS);
    return () => clearInterval(interval);
  }, [hasEntered]);

  const current = PHASES[phase];

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: ENTRANCE_DURATION, delay: ENTRANCE_DELAY, ease: [0.25, 0.1, 0.25, 1] }}
      className="w-full max-w-sm mx-auto"
    >
      <div className="rounded-2xl border border-orange-500/[0.08] bg-orange-950/20 backdrop-blur-sm p-6 space-y-5">
        {/* Header — country & city count */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-white/30 mb-1">
            Your World
          </p>
          <div className="flex items-baseline justify-between">
            <AnimatePresence mode="wait">
              <motion.div
                key={current.countries}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.35, ease: 'easeInOut' }}
                className="flex items-baseline gap-1.5"
              >
                <span className="text-3xl font-bold text-white">{current.countries}</span>
                <span className="text-sm text-white/40">countries</span>
              </motion.div>
            </AnimatePresence>
            <AnimatePresence mode="wait">
              <motion.span
                key={current.cities}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="text-lg font-bold text-[#F97316]"
              >
                {current.cities} cities
              </motion.span>
            </AnimatePresence>
          </div>
        </div>

        {/* World Map */}
        <div className="rounded-xl border border-orange-500/[0.06] bg-orange-950/10 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Globe className="w-3.5 h-3.5 text-white/40" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-white/40">
              Visited Places
            </span>
          </div>

          <svg viewBox="0 0 300 100" className="w-full h-auto mb-4">
            {CITIES.map((city, i) => {
              const isActive = current.active.includes(i);
              return (
                <g key={i}>
                  {/* Outer glow */}
                  <motion.circle
                    cx={city.x}
                    cy={city.y}
                    r={6}
                    fill="#F97316"
                    initial={false}
                    animate={{ opacity: isActive ? 0.15 : 0 }}
                    transition={{ duration: 0.6, ease: 'easeInOut' }}
                  />
                  {/* Dot */}
                  <motion.circle
                    cx={city.x}
                    cy={city.y}
                    initial={false}
                    animate={{
                      r: isActive ? 2 : 1,
                      fill: isActive ? '#F97316' : 'rgba(255,255,255,0.1)',
                      opacity: isActive ? 1 : 0.3,
                    }}
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                  />
                </g>
              );
            })}
          </svg>

          {/* Stats row */}
          <div className="pt-3 border-t border-orange-500/[0.06] grid grid-cols-3 text-center">
            <AnimatedStat icon={<Globe className="w-3.5 h-3.5" />} value={current.countries} label="Countries" />
            <AnimatedStat icon={<MapPin className="w-3.5 h-3.5" />} value={current.cities} label="Cities" />
            <AnimatedStat icon={<Compass className="w-3.5 h-3.5" />} value={current.continents} label="Continents" />
          </div>
        </div>

        {/* Latest Journey */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current.trip.city}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="rounded-lg border border-orange-500/[0.1] bg-orange-500/[0.06] px-4 py-3"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-lg">{current.trip.flag}</span>
                  <p className="text-sm font-medium text-white">
                    {current.trip.city}, {current.trip.country}
                  </p>
                </div>
                <p className="text-xs text-white/40">
                  {current.trip.date} &middot; {current.trip.days} days
                </p>
              </div>
              <MapPin className="w-4 h-4 text-[#F97316]/60" />
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Bottom — continents explored */}
        <div className="text-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={current.continents}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="text-white/50 text-sm"
            >
              <span className="text-[#F97316] font-medium">{current.continents}</span>
              {' '}continents explored
              {' '}&middot;{' '}
              <span className="text-white font-medium">&infin;</span>
              {' '}to go
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

function AnimatedStat({ icon, value, label }: { icon: React.ReactNode; value: number | string; label: string }) {
  return (
    <div className="space-y-0.5">
      <div className="flex items-center justify-center text-white/30">{icon}</div>
      <AnimatePresence mode="wait">
        <motion.p
          key={String(value)}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="text-white font-bold text-lg"
        >
          {value}
        </motion.p>
      </AnimatePresence>
      <p className="text-white/40 text-[11px]">{label}</p>
    </div>
  );
}
