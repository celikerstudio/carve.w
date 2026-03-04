'use client';

import Image from 'next/image';
import { ScrollReveal } from '@/components/ui/scroll-reveal';

const phones = [
  { src: '/screenshots/dark-dashboard.png', alt: 'Carve dashboard screen' },
  { src: '/screenshots/dark-diary.png', alt: 'Carve diary screen' },
  { src: '/screenshots/dark-workout.png', alt: 'Carve workout screen' },
];

function PhoneFrame({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="w-[220px] md:w-[260px] flex-shrink-0 snap-center">
      {/* Outer bezel */}
      <div className="relative bg-surface rounded-[2.5rem] p-[3px] shadow-2xl shadow-black/50 ring-1 ring-white/[0.08]">
        {/* Screen */}
        <div className="bg-black rounded-[2.3rem] overflow-hidden aspect-[9/19.5] relative">
          <Image
            src={src}
            alt={alt}
            fill
            className="object-cover"
            sizes="260px"
          />

          {/* Home indicator */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10">
            <div className="w-24 h-1 bg-white/30 rounded-full" />
          </div>
        </div>

        {/* Side buttons - left */}
        <div className="absolute -left-[2px] top-24 w-[2px] h-6 bg-gray-700 rounded-l-sm" />
        <div className="absolute -left-[2px] top-36 w-[2px] h-12 bg-gray-700 rounded-l-sm" />
        <div className="absolute -left-[2px] top-52 w-[2px] h-12 bg-gray-700 rounded-l-sm" />

        {/* Side button - right */}
        <div className="absolute -right-[2px] top-32 w-[2px] h-16 bg-gray-700 rounded-r-sm" />
      </div>
    </div>
  );
}

export function PhoneShowcase() {
  return (
    <div className="flex gap-6 justify-center items-center overflow-x-auto px-6 pb-4 snap-x snap-mandatory md:snap-none md:overflow-visible">
      {phones.map((phone, index) => (
        <ScrollReveal
          key={phone.src}
          animation="fade-up"
          delay={index * 0.15}
        >
          <PhoneFrame src={phone.src} alt={phone.alt} />
        </ScrollReveal>
      ))}
    </div>
  );
}
