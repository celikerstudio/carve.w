'use client';

import { useEffect, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  applyConsent,
  readConsent,
  subscribeConsent,
  writeConsent,
  type ConsentChoice,
} from '@/lib/consent';

// @ai-why: Een aparte serverwaarde in plaats van null. De server weet niet wat de
// bezoeker eerder koos, en zou hij null teruggeven dan staat de banner in de HTML van
// iedereen, ook van wie allang een keuze heeft gemaakt. Die flitst er dan bij hydratie
// weer uit, en dat is precies het gedrag dat mensen aan cookiebanners haten.
const SERVER_SNAPSHOT = 'unknown';

/**
 * Vraagt toestemming voor de meetcookies van GA4 en Google Ads.
 *
 * @ai-context: Verplicht sinds de overstap van Plausible naar GA4 op 2026-09-08.
 * Plausible zette geen cookies en had dus geen banner nodig; GA4 zet `_ga` en mag dat
 * in de EU pas na toestemming. De banner is daarmee geen nette toevoeging maar de
 * voorwaarde waaronder de tag überhaupt mag meten.
 *
 * @ai-sync: lib/consent.ts
 * @ai-sync: app/privacy/page.tsx
 */
export function CookieConsent() {
  const choice = useSyncExternalStore(subscribeConsent, readConsent, () => SERVER_SNAPSHOT);

  // @ai-why: Een bestaande keuze moet bij elke paginalading opnieuw aan Google gemeld
  // worden. De layout zet Consent Mode standaard op `denied`, dus zonder dit blijft
  // iemand die vorige week accepteerde alsnog ongemeten, zonder dat er zichtbaar iets
  // misgaat. Dit is een effect en geen renderwerk, want het praat tegen een systeem
  // buiten React. Zie lib/consent.ts voor waarom dit een aparte functie is.
  useEffect(() => {
    const stored = readConsent();
    if (stored) applyConsent(stored);
  }, []);

  function decide(next: ConsentChoice) {
    writeConsent(next);
  }

  if (choice !== null) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent"
      className="fixed inset-x-0 bottom-0 z-50 p-3 sm:p-4"
    >
      <div className="mx-auto flex max-w-3xl flex-col gap-3 rounded-xl border border-white/10 bg-neutral-900/95 p-4 shadow-lg backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <p className="text-sm leading-relaxed text-neutral-300">
          We use Google Analytics to see which pages get used and which ads work. That
          needs cookies. Decline and we measure nothing.{' '}
          <Link href="/privacy" className="underline underline-offset-4 hover:text-white">
            Privacy policy
          </Link>
        </p>
        <div className="flex shrink-0 gap-2">
          {/* @ai-why: Weigeren staat links en is even bereikbaar als accepteren. Een
              banner waarin weigeren moeilijker is dan accepteren is onder de AVG geen
              geldige toestemming, en toezichthouders beboeten daar ook op.
              @ai-gotcha: De kleuren staan hier hard en niet via de `outline`-variant van
              Button. Die leunt op `bg-background` en `text-foreground`, en op dit paneel
              leverde dat zwarte tekst op een zwarte knop op: onleesbaar, en daarmee dus
              precies de ongeldige toestemming waar de regel hierboven tegen waarschuwt.
              Het paneel heeft een eigen donkere achtergrond, dus de themavariabelen
              kloppen hier niet. */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => decide('denied')}
            className="border-white/25 bg-transparent text-white hover:bg-white/10 hover:text-white"
          >
            Decline
          </Button>
          <Button size="sm" onClick={() => decide('granted')}>
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
}
