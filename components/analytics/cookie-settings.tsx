'use client';

import { useSyncExternalStore } from 'react';
import { Button } from '@/components/ui/button';
import { readConsent, subscribeConsent, writeConsent, type ConsentChoice } from '@/lib/consent';

// @ai-sync: components/analytics/cookie-consent.tsx (zelfde serverwaarde, zelfde reden)
const SERVER_SNAPSHOT = 'unknown';

/**
 * Laat de bezoeker een eerder gemaakte cookiekeuze terugdraaien.
 *
 * @ai-why: Dit is geen extraatje. De AVG eist dat toestemming net zo makkelijk in te
 * trekken is als te geven, en de banner verdwijnt na één keuze voorgoed. Zonder dit
 * blok is er geen enkele weg terug en voldoet de banner niet.
 *
 * @ai-sync: lib/consent.ts
 * @ai-sync: components/analytics/cookie-consent.tsx
 */
export function CookieSettings() {
  const choice = useSyncExternalStore(subscribeConsent, readConsent, () => SERVER_SNAPSHOT);

  function decide(next: ConsentChoice) {
    writeConsent(next);
  }

  // @ai-why: Niets renderen zolang we op de serverwaarde zitten. Deze pagina wordt
  // statisch gerenderd en de server kent de keuze niet, dus elke andere beginwaarde
  // zou op de eerste frame de verkeerde status tonen.
  if (choice === SERVER_SNAPSHOT) return null;

  return (
    <div className="not-prose my-4 flex flex-wrap items-center gap-3">
      <span className="text-sm text-neutral-400">
        {choice === 'granted'
          ? 'You accepted analytics cookies.'
          : choice === 'denied'
            ? 'You declined analytics cookies.'
            : 'You have not made a choice yet.'}
      </span>
      {choice !== 'denied' && (
        <Button variant="outline" size="sm" onClick={() => decide('denied')}>
          Decline analytics cookies
        </Button>
      )}
      {choice !== 'granted' && (
        <Button size="sm" onClick={() => decide('granted')}>
          Accept analytics cookies
        </Button>
      )}
    </div>
  );
}
