'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { recordAdAttribution } from '@/lib/analytics';

/**
 * Onthoudt met welke advertentie iemand binnenkwam, zodat `app_store_click`
 * te herleiden is naar de campagne die voor die klik betaald heeft.
 *
 * @ai-why: Dit leest `window.location.search` in een effect en niet met
 * `useSearchParams()`. Die hook dwingt in de App Router een Suspense-grens af op
 * élke pagina die statisch gerenderd wordt; een effect heeft dat bezwaar niet en
 * draait toch al pas in de browser, waar de parameters staan.
 *
 * @ai-gotcha: Draait ook opnieuw bij een navigatie binnen de site. Dat is bewust:
 * iemand kan op een deeplink landen. `recordAdAttribution` keert stil terug als er
 * geen parameters in de URL staan, dus een vervolgpagina wist de toewijzing niet.
 *
 * @ai-sync: lib/analytics.ts
 */
export function AdAttribution() {
  const pathname = usePathname();

  useEffect(() => {
    recordAdAttribution();
  }, [pathname]);

  return null;
}
