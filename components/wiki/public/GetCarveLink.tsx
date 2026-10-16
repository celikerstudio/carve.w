'use client';

import { useAppStoreUrl } from '@/hooks/useAppStoreUrl';
import { track } from '@/lib/analytics';

/**
 * "Get Carve" in de wiki: een gewone tekstknop naar de App Store, gemeten als `app_store_click`.
 *
 * @ai-why: Tekst en geen App Store-badge. Apple's richtlijnen staan een eigen knop met hun logo
 *   niet toe (zie `components/carve/AppStoreButton.tsx`), en kale tekst wel. De witte knop is die
 *   van de app (`interactivePrimary`).
 * @ai-sync: components/carve/AppStoreButton.tsx (zelfde event, andere `source`)
 */
export function GetCarveLink({
  source,
  className = 'wiki-button',
  children = 'Get Carve',
}: {
  source: 'wiki_tease' | 'wiki_character';
  className?: string;
  children?: React.ReactNode;
}) {
  const href = useAppStoreUrl();
  return (
    <a href={href} className={className} onClick={() => track('app_store_click', { source })}>
      {children}
    </a>
  );
}
