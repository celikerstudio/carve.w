import type { Metadata } from 'next';

/**
 * Metadata en gestructureerde data voor de wiki (TDR-0016).
 *
 * @ai-sync: app/sitemap.ts (dezelfde BASE)
 */
export const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://carve.wiki';

export function wikiMetadata({ title, description, path }: { title: string; description: string; path: string }): Metadata {
  return {
    // @ai-why: Het overzicht heet zelf al "Carve Wiki"; daar geen "· Carve Wiki" achter.
    title: title === 'Carve Wiki' ? title : `${title} · Carve Wiki`,
    description,
    alternates: { canonical: `${SITE}${path}` },
    openGraph: { title, description, url: `${SITE}${path}`, siteName: 'Carve Wiki', type: 'article' },
    twitter: { card: 'summary', title, description },
  };
}

/** JSON-LD voor een artikel, met de broodkruimel erbij. */
export function articleJsonLd(a: { title: string; summary: string; href: string; category: string; categoryHref: string; updatedAt: string }) {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: a.title,
      description: a.summary,
      url: `${SITE}${a.href}`,
      dateModified: a.updatedAt,
      publisher: { '@type': 'Organization', name: 'Carve', url: SITE },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Wiki', item: `${SITE}/wiki` },
        { '@type': 'ListItem', position: 2, name: a.category, item: `${SITE}${a.categoryHref}` },
        { '@type': 'ListItem', position: 3, name: a.title, item: `${SITE}${a.href}` },
      ],
    },
  ];
}
