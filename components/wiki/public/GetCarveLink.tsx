'use client';

import { useAppStoreUrl } from '@/hooks/useAppStoreUrl';
import { wikiCampaign } from '@/lib/app-store-link';
import { track } from '@/lib/analytics';

/**
 * "Get Carve" in de wiki: een gewone tekstknop naar de App Store, gemeten als `app_store_click`.
 *
 * @ai-why: Tekst en geen App Store-badge. Apple's richtlijnen staan een eigen knop met hun logo
 *   niet toe (zie `components/carve/AppStoreButton.tsx`), en kale tekst wel. De witte knop is die
 *   van de app (`interactivePrimary`).
 * @ai-why: `article` gaat mee als `article_slug` in GA en als `ct=wiki<slug>` naar Apple, zodat
 *   klikken én downloads per artikel te zien zijn (TDR-0017 §8). Zonder artikel (de home) heet de
 *   campagne gewoon `wiki`.
 * @ai-sync: components/carve/AppStoreButton.tsx (zelfde event, andere `source`)
 */
export function GetCarveLink({
  source,
  article,
  className = 'wiki-button',
  children = 'Get Carve',
}: {
  source: 'wiki_tease' | 'wiki_character';
  article?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  const href = useAppStoreUrl(article ? wikiCampaign(article) : 'wiki');
  return (
    <a href={href} className={className} onClick={() => track('app_store_click', { source, ...(article ? { article_slug: article } : {}) })}>
      {children}
    </a>
  );
}
