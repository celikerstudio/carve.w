'use client';

import { APP_STORE_URL, cn } from '@/lib/utils';
import { track } from '@/lib/analytics';
import { AppleGlyph } from '@/components/carve/AppleGlyph';

interface AppStoreButtonProps {
  /** Waar op de pagina de knop staat; wordt als `source` meegestuurd. */
  source: 'hero' | 'close' | 'dock';
  id?: string;
  className?: string;
}

/**
 * De App Store-knop van de marketingpagina.
 *
 * @ai-why: Eén component voor alle drie de ingangen (hero, slot, sticky knop op
 * mobiel) zodat ze hetzelfde event vuren en dezelfde vorm houden. De pagina zelf
 * is daardoor een server component; alleen dit knopje heeft `onClick` nodig.
 * @ai-sync: lib/analytics.ts (het `source`-type van `app_store_click`)
 */
export function AppStoreButton({ source, id, className }: AppStoreButtonProps) {
  return (
    <a
      id={id}
      href={APP_STORE_URL}
      onClick={() => track('app_store_click', { source })}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'inline-flex items-center gap-2.5 rounded-xl bg-white px-6 py-3.5 text-[15px] font-semibold text-black transition-colors hover:bg-white/90',
        className,
      )}
    >
      <AppleGlyph className="h-4 w-4" />
      Download on the App Store
    </a>
  );
}
