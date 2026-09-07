'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { AppStoreButton } from '@/components/carve/AppStoreButton';

interface MarketingHeaderProps {
  /** Id van de hero-knop: zodra die uit beeld is, schuift de balk in. */
  heroId: string;
}

/**
 * De dunne balk bovenin op desktop: logo links, App Store-knop rechts.
 *
 * @ai-why: De hero is bewust kaal, dus geen vaste navigatie erboven. Maar op
 * desktop is er na scherm 1 tot aan het slot geen knop meer in beeld (de
 * sticky knop onderaan is alleen mobiel). Deze balk verschijnt pas als de
 * hero-knop uit beeld is, en alleen vanaf `md:`; op mobiel doet `AppStoreDock`
 * hetzelfde werk onderaan.
 *
 * @ai-why: Geen menu. Health, Money, Life, wiki en inloggen staan achter een
 * vlag (TDR-0005) en Privacy, Terms en Support staan in de footer. Een menu
 * met één item is een knop, dus dat is het geworden.
 */
export function MarketingHeader({ heroId }: MarketingHeaderProps) {
  const [on, setOn] = useState(false);

  useEffect(() => {
    const hero = document.getElementById(heroId);
    if (!hero || !('IntersectionObserver' in window)) return;
    const o = new IntersectionObserver(([e]) => setOn(!e.isIntersecting && e.boundingClientRect.top < 0));
    o.observe(hero);
    return () => o.disconnect();
  }, [heroId]);

  return (
    <header
      aria-hidden={!on}
      className={`fixed inset-x-0 top-0 z-40 hidden border-b border-white/[0.06] bg-[#0A0A0B]/85 backdrop-blur-md transition-transform duration-300 ease-out md:block ${on ? 'translate-y-0' : 'pointer-events-none -translate-y-full'}`}
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
        <a href="#top" className="flex items-center gap-3" aria-label="Back to top">
          <Image src="/carve-logo.png" alt="" width={160} height={160} className="h-7 w-7" />
          <span className="pl-[0.3em] text-[13px] font-bold tracking-[0.3em] text-white/70">CARVE</span>
        </a>
        <AppStoreButton source="header" className="px-4 py-2 text-[13px]" />
      </div>
    </header>
  );
}
