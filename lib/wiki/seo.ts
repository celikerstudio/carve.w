import type { Metadata } from 'next';

/**
 * Metadata en gestructureerde data voor de wiki (TDR-0016, TDR-0017).
 *
 * @ai-sync: app/sitemap.ts (dezelfde BASE, dezelfde indexregel)
 */
export const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://carve.wiki';

/**
 * De auteur van de beoordeelde artikelen (TDR-0017 §1).
 *
 * @ai-why: `sameAs` is hoe Google en de taalmodellen "Furkan Celiker" aan zijn eigen profielen
 *   koppelen, en daarmee aan Carve AI. Alleen profielen die Furkan zelf publiek wil koppelen.
 * @ai-todo: `sameAs` is leeg tot Furkan de links geeft.
 */
export const AUTHOR = {
  name: 'Furkan Celiker',
  jobTitle: 'Founder of Carve AI',
  path: '/about',
  sameAs: [] as string[],
};

/**
 * Of een artikel in Google mag (TDR-0017 §2): Furkan heeft het gelezen en aangevuld, en het heeft
 * minstens één bron die `pnpm wiki:check` heeft gecontroleerd.
 *
 * @ai-why: Op het artikel en niet op de site. Een dun artikel blijft leesbaar voor wie het via een
 *   link of de app vindt; het hoort alleen niet in de index, omdat Google dunne AI-inhoud op
 *   siteniveau weegt en daarmee ook de goede pagina's omlaag trekt.
 */
export function isIndexable(a: { reviewed: boolean; sources: number }): boolean {
  return a.reviewed && a.sources > 0;
}

export function wikiMetadata({
  title,
  description,
  path,
  index = true,
}: {
  title: string;
  description: string;
  path: string;
  index?: boolean;
}): Metadata {
  return {
    // @ai-why: Het overzicht heet zelf al "Carve Wiki"; daar geen "· Carve Wiki" achter.
    title: title === 'Carve Wiki' ? title : `${title} · Carve Wiki`,
    description,
    alternates: { canonical: `${SITE}${path}` },
    // @ai-why: `follow` blijft aan. De links op een dun artikel wijzen vaak naar een goed artikel,
    //   en die moeten meetellen.
    ...(index ? {} : { robots: { index: false, follow: true } }),
    openGraph: { title, description, url: `${SITE}${path}`, siteName: 'Carve Wiki', type: 'article' },
    twitter: { card: 'summary', title, description },
  };
}

/** JSON-LD voor een artikel, met de broodkruimel erbij. */
export function articleJsonLd(a: {
  title: string;
  summary: string;
  href: string;
  category: string;
  categoryHref: string;
  updatedAt: string;
  reviewed: boolean;
}) {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: a.title,
      description: a.summary,
      url: `${SITE}${a.href}`,
      // @ai-why: `updated_at` en geen aparte reviewdatum. De sync schrijft alleen velden die
      //   veranderd zijn, dus voor een beoordeeld artikel is dit de laatste keer dat er iets aan
      //   tekst, titel, tags of status veranderde. Een eigen kolom zou een migratie in Carve-AI vragen.
      // @ai-gotcha: Elke UPDATE op de rij zet `updated_at` (trigger in de database). Een bronnen-
      //   wijziging alleen raakt de rij niet; `app/api/wiki/track-view` zou bij elk bezoek de datum
      //   verzetten als iemand hem ooit aanzet.
      // @ai-sync: scripts/wiki/sync.ts (schrijft alleen wat veranderd is)
      dateModified: a.updatedAt,
      // @ai-why: Een persoon alleen onder wat hij gelezen heeft. Zijn naam onder een AI-concept
      //   is precies de claim die Google en de lezer niet moeten kunnen betrappen.
      author: a.reviewed
        ? { '@type': 'Person', name: AUTHOR.name, url: `${SITE}${AUTHOR.path}`, jobTitle: AUTHOR.jobTitle }
        : { '@type': 'Organization', name: 'Carve', url: SITE },
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
