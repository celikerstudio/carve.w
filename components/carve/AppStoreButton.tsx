'use client';

import Image from 'next/image';
import { APP_STORE_URL, cn } from '@/lib/utils';
import { track } from '@/lib/analytics';

type Source = 'hero' | 'close' | 'dock' | 'header';

interface AppStoreButtonProps {
  /** Waar op de pagina de knop staat; bepaalt zowel de maat als de `source` in het event. */
  source: Source;
  id?: string;
  className?: string;
}

/** Verhouding van Apple's badge-artwork: 119.66 × 40. */
const RATIO = 119.66407 / 40;

// @ai-why: De hoogte hangt aan de plek en niet aan een losse `size`-prop. Op 54px viel de
// badge weg onder een kop van 76px (beoordeeld op 2026-09-07 met de drie maten naast
// elkaar in de echte pagina); 68 is de maat waarop hij als keuze leest in plaats van als
// een plaatje dat erbij geplakt is. De dock is lager omdat een balk van 68px plus
// veilige zone een flink deel van een telefoonscherm wegneemt, en de balk bovenin volgt
// gewoon de hoogte van die balk.
const HEIGHT: Record<Source, number> = { hero: 68, close: 68, dock: 58, header: 40 };

/**
 * De App Store-knop van de marketingpagina.
 *
 * @ai-why: Dit was tot 2026-09-07 een eigen witte pil met het Apple-logo erin en de tekst
 * "Download on the App Store". Apple's Identity Guidelines staan dat niet toe: je gebruikt
 * hun badge-artwork of je linkt met kale tekst, en een zelfgemaakte knop met hun logo en
 * hun badge-tekst is precies wat er niet mag. Het artwork hieronder komt van Apple zelf
 * (tools.applemediaservices.com, de "white"-variant: witte pil, zwarte tekst) en is
 * ongewijzigd. Vervang het niet door een nagetekende versie en zet er geen eigen kleuren
 * of hoeken op; dan begint het probleem opnieuw.
 *
 * @ai-gotcha: De badge heeft een vaste verhouding, dus hij rekt niet mee met een
 * `w-full`-ouder zoals de oude pil deed. `AppStoreDock` centreert hem daarom in plaats
 * van hem breed te trekken. Wil je hem groter, verhoog dan `HEIGHT` en niet de breedte.
 *
 * @ai-why: Eén component voor alle ingangen (hero, slot, sticky knop op mobiel, balk
 * bovenin op desktop) zodat ze hetzelfde event vuren en dezelfde vorm houden. De pagina
 * zelf is daardoor een server component; alleen dit knopje heeft `onClick` nodig.
 * @ai-sync: lib/analytics.ts (het `source`-type van `app_store_click`)
 */
export function AppStoreButton({ source, id, className }: AppStoreButtonProps) {
  const h = HEIGHT[source];
  return (
    <a
      id={id}
      href={APP_STORE_URL}
      onClick={() => track('app_store_click', { source })}
      target="_blank"
      rel="noopener noreferrer"
      className={cn('inline-block rounded-[9px] transition-opacity hover:opacity-85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D4A843]', className)}
    >
      <Image
        src="/app-store-badge.svg"
        alt="Download on the App Store"
        width={Math.round(h * RATIO)}
        height={h}
        priority={source === 'hero'}
      />
    </a>
  );
}
