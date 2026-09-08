'use client';

import { useEffect, useSyncExternalStore } from 'react';
import Script from 'next/script';
import { readConsent, subscribeConsent } from '@/lib/consent';
import { disableMetaPixel, META_PIXEL_ID, metaPixelSnippet } from '@/lib/meta-pixel';

// @ai-why: Dezelfde serverwaarde als de banner gebruikt, en om dezelfde reden: de server
// weet niet wat de bezoeker koos. Zou hij hier null teruggeven en zouden we dat als
// "nog niets gekozen" lezen, dan is dat niet te onderscheiden van een weigering.
// @ai-sync: components/analytics/cookie-consent.tsx
const SERVER_SNAPSHOT = 'unknown';

/**
 * Laadt de Meta-pixel, en alleen na een expliciete ja.
 *
 * @ai-why: Dit is een component en geen `<Script>` in de layout, en dat verschil is het
 * hele punt. Google's tag mag altijd laden omdat Consent Mode hem vertelt wat hij niet
 * mag opslaan. Meta heeft zoiets niet: de pixel zet zijn `_fbp`-cookie zodra hij laadt,
 * er is geen stand waarin hij laadt maar niets doet. De enige manier om hem netjes achter
 * toestemming te houden is dus hem pas te injecteren nadat er ja is gezegd, en daarvoor
 * moet je de keuze in de client kunnen lezen.
 *
 * @ai-gotcha: Zet dit niet om naar `strategy="beforeInteractive"` zoals het GA-blok
 * hierboven in de layout. Dat draait vóór React en dus vóór iemand iets heeft kunnen
 * kiezen, en dan zet je de cookie alsnog voor wie weigert.
 *
 * @ai-sync: lib/meta-pixel.ts
 * @ai-sync: lib/consent.ts
 * @ai-sync: app/layout.tsx
 */
export function MetaPixel() {
  const choice = useSyncExternalStore(subscribeConsent, readConsent, () => SERVER_SNAPSHOT);

  // @ai-why: Het weghalen van de `<Script>` hieronder is niet genoeg om te stoppen met
  // meten. De basiscode heeft `window.fbq` dan al gezet en die blijft staan, dus zonder
  // dit effect vuurt track() door na een intrekking, tot de bezoeker toevallig herlaadt.
  // Dat is meten na een expliciet nee. Zie lib/meta-pixel.ts voor wat er precies weggaat.
  useEffect(() => {
    if (choice !== 'granted') disableMetaPixel();
  }, [choice]);

  if (choice !== 'granted') return null;
  if (!META_PIXEL_ID) return null;

  return (
    <Script id="meta-pixel" strategy="afterInteractive">
      {metaPixelSnippet(META_PIXEL_ID)}
    </Script>
  );
}
