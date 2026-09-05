'use client';

import { useEffect, useState } from 'react';
import { AppStoreButton } from '@/components/carve/AppStoreButton';

interface AppStoreDockProps {
  /** Id van de hero-knop: zodra die uit beeld is, schuift de dock in. */
  heroId: string;
  /** Id van de slot-knop: zodra die in beeld is, schuift de dock weer weg. */
  closeId: string;
}

/**
 * De vaste App Store-knop onderaan het scherm op mobiel.
 *
 * @ai-why: De bezoeker komt via een bio-link op zijn telefoon en scrolt. De knop
 * hoort altijd binnen duimbereik, maar niet dubbel: hij verschijnt pas als de
 * hero-knop uit beeld is en verdwijnt bij de slot-knop. Op desktop (`md:`) is hij
 * er niet, daar staat de knop toch al in beeld.
 * @ai-gotcha: Zonder IntersectionObserver (oude WebViews) blijft hij gewoon weg;
 * de twee knoppen in de pagina zijn dan genoeg.
 */
export function AppStoreDock({ heroId, closeId }: AppStoreDockProps) {
  const [heroOut, setHeroOut] = useState(false);
  const [closeIn, setCloseIn] = useState(false);

  useEffect(() => {
    const hero = document.getElementById(heroId);
    const close = document.getElementById(closeId);
    if (!hero || !close || !('IntersectionObserver' in window)) return;
    const o1 = new IntersectionObserver(([e]) => setHeroOut(!e.isIntersecting && e.boundingClientRect.top < 0));
    const o2 = new IntersectionObserver(([e]) => setCloseIn(e.isIntersecting));
    o1.observe(hero);
    o2.observe(close);
    return () => {
      o1.disconnect();
      o2.disconnect();
    };
  }, [heroId, closeId]);

  const on = heroOut && !closeIn;

  return (
    <div
      aria-hidden={!on}
      className={`fixed inset-x-0 bottom-0 z-50 px-4 pt-3 pb-[calc(12px+env(safe-area-inset-bottom))] transition-transform duration-300 ease-out md:hidden ${on ? 'translate-y-0' : 'pointer-events-none translate-y-[110%]'}`}
      style={{ background: 'linear-gradient(180deg, rgba(10,10,11,0), rgba(10,10,11,.94) 45%)' }}
    >
      <AppStoreButton source="dock" className="w-full justify-center" />
    </div>
  );
}
