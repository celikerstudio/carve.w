import Link from 'next/link';
import type { WikiArticleSummary, WikiCitation } from '@/lib/wiki/articles';
import { categoryByName } from '@/lib/wiki/catalog';

/** Links: de andere artikelen uit dezelfde categorie. */
export function WikiSidebar({ category, articles, current }: { category: string; articles: WikiArticleSummary[]; current?: string }) {
  const cat = categoryByName(category);
  const own = articles.filter((a) => a.category === category);
  // @ai-why: Hooguit twaalf, met het huidige artikel er altijd bij. Een lijst van 25 in een zijbalk
  //   is een tweede pagina naast de pagina; de categoriepagina heeft ze allemaal.
  const shown = own.slice(0, 12);
  const cur = own.find((a) => a.slug === current);
  if (cur && !shown.includes(cur)) shown[shown.length - 1] = cur;
  return (
    <nav className="wiki-side" aria-label={category}>
      <div className="h">{category}</div>
      {shown.map((a) => (
        <Link key={a.slug} href={a.href} aria-current={a.slug === current ? 'page' : undefined}>
          {a.title.replace(/ \(.*\)$/, '')}
        </Link>
      ))}
      {cat && own.length > shown.length && (
        <Link className="more" href={`/wiki/${cat.slug}`}>
          All {own.length} articles
        </Link>
      )}
    </nav>
  );
}

/** Onderaan: de bronnen. Toont niets zolang een artikel er geen heeft. */
export function Sources({ citations }: { citations: WikiCitation[] }) {
  if (citations.length === 0) return null;
  return (
    <section className="wiki-refs">
      <div className="h">Sources</div>
      <ol>
        {citations.map((c) => (
          <li key={c.number}>
            {c.authors}
            {c.year ? ` (${c.year})` : ''}. {c.title}. {c.publication}.
            {c.url && (
              <>
                {' '}
                <a href={c.url} target="_blank" rel="noopener noreferrer">Link</a>
              </>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}

/** "See also": een lijst zoals in de app, één regel per artikel met een chevron. */
export function SeeAlso({ articles }: { articles: WikiArticleSummary[] }) {
  if (articles.length === 0) return null;
  return (
    <section className="wiki-see">
      <div className="h">See also</div>
      <div className="wiki-list">
        {articles.map((a) => (
          <Link key={a.slug} href={a.href}>
            {a.title}
            <span>{a.category}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
