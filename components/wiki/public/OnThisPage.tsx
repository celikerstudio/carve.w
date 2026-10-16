'use client';

import { useEffect, useState } from 'react';
import type { TocItem } from '@/lib/wiki/render';

/** "On this page": de koppen van het artikel, met de kop waar je nu leest gemarkeerd. */
export function OnThisPage({ toc }: { toc: TocItem[] }) {
  const [active, setActive] = useState(toc[0]?.id);

  useEffect(() => {
    // @ai-why: Op de scrollpositie en niet met een IntersectionObserver. Die meldt alleen een kop
    //   die door de band gaat, en een snelle scroll of een klik in de inhoud springt eroverheen:
    //   dan bleef de eerste kop gemarkeerd terwijl je drie koppen verder las.
    let frame = 0;
    const update = () => {
      frame = 0;
      const line = window.innerHeight * 0.3;
      let current = toc[0]?.id;
      for (const t of toc) {
        const el = document.getElementById(t.id);
        if (el && el.getBoundingClientRect().top <= line) current = t.id;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    // Ook meteen, voor wie via een anker midden in het artikel binnenkomt.
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
    };
  }, [toc]);

  if (toc.length < 2) return null;
  return (
    <nav className="wiki-toc" aria-label="On this page">
      <div className="h">On this page</div>
      {toc.map((t) => (
        <a key={t.id} href={`#${t.id}`} data-active={t.id === active}>
          {t.text}
        </a>
      ))}
    </nav>
  );
}
