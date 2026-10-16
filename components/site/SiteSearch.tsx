'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

export interface SearchItem {
  title: string;
  href: string;
  category: string;
  summary: string;
}

/**
 * Zoeken in de kop van de site, over de artikelen van de wiki.
 *
 * @ai-why: In de browser over de titels en samenvattingen die de pagina al meekrijgt. Het zijn er
 *   97, een paar kilobyte; een zoek-RPC zou per toetsaanslag een rondje naar Supabase kosten en de
 *   pagina dynamisch maken. Groeit de wiki naar duizenden artikelen, dan is `search_vector_en` in
 *   `wiki_articles` de volgende stap.
 */
export function SiteSearch({ items, placeholder = 'Search', empty = 'Nothing on that yet.' }: { items: SearchItem[]; placeholder?: string; empty?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const inTitle = items.filter((i) => i.title.toLowerCase().includes(q));
    const inSummary = items.filter((i) => !inTitle.includes(i) && i.summary.toLowerCase().includes(q));
    return [...inTitle, ...inSummary].slice(0, 8);
  }, [items, query]);

  return (
    <div className="site-search">
      <input
        type="search"
        value={query}
        placeholder={placeholder}
        aria-label="Search the wiki"
        onChange={(e) => {
          setQuery(e.target.value);
          setActive(0);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        // @ai-why: Met vertraging dicht, anders verdwijnt de lijst vóór de klik op een resultaat aankomt.
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)); }
          if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
          if (e.key === 'Enter' && results[active]) router.push(results[active].href);
          if (e.key === 'Escape') setOpen(false);
        }}
      />
      {open && query.trim() && (
        <ul role="listbox">
          {results.length === 0 && <li className="empty">{empty}</li>}
          {results.map((r, i) => (
            <li key={r.href}>
              <a href={r.href} data-active={i === active}>
                {r.title}
                <span>{r.category}</span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
