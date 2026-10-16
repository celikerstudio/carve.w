import Link from 'next/link';
import type { Metadata } from 'next';
import { SiteHeader } from '@/components/site/SiteHeader';
import { BodyMap } from '@/components/wiki/public/BodyMap';
import { listArticles } from '@/lib/wiki/articles';
import { WIKI_CATEGORIES } from '@/lib/wiki/catalog';
import { wikiMetadata } from '@/lib/wiki/seo';

export const revalidate = 3600;

export const metadata: Metadata = wikiMetadata({
  title: 'Carve Wiki',
  description: 'What actually works for training, food and recovery. Short answers first, rated by evidence.',
  path: '/wiki',
});

const EVIDENCE_RANK: Record<string, number> = { 'well-established': 3, 'expert-consensus': 2, 'emerging-research': 1 };

/**
 * Per categorie een uitsnede van hetzelfde personage als bovenaan: zoom en positie op de tekening.
 *
 * @ai-why: Het lichaam loopt door in de lijst eronder (variant A uit de companion, 2026-10-16).
 *   Een kale lijst met chevrons onder het personage las als een andere site.
 * @ai-fragile: Gemeten op `public/character/character_man_s3_front.png` (581 × 1400). Wordt het
 *   personage opnieuw gegenereerd, kijk dan of de uitsnedes nog op buik, schouder, benen, hand en
 *   hoofd vallen.
 */
const CROPS: Record<string, { label: string; zoom: string; at: string }> = {
  Nutrition: { label: 'Your fuel', zoom: '240%', at: '50% 30%' },
  Training: { label: 'Your muscles', zoom: '220%', at: '12% 24%' },
  Recovery: { label: 'Your legs, your sleep', zoom: '200%', at: '45% 72%' },
  Supplements: { label: 'What you add', zoom: '300%', at: '95% 49%' },
  Mindset: { label: 'Your head', zoom: '260%', at: '50% 4%' },
};

/** De vier artikelen onder "Start here": wat iedereen die begint als eerste moet weten. */
const START_HERE = ['protein', 'progressive-overload', 'sleep', 'creatine'];

/**
 * De home van de wiki: het lichaam als navigatie, daaronder "Start here" en per categorie een tegel.
 *
 * @ai-why: De tegels onderaan doen hetzelfde als het lichaam bovenaan, maar als gewone links in de
 *   HTML. Het lichaam is een client-component; langs de tegels en de categoriepagina's vindt
 *   Google elk artikel vanaf `/wiki`.
 */
export default async function WikiHome() {
  const all = await listArticles();
  const categories = WIKI_CATEGORIES.map((c) => {
    const own = all.filter((a) => a.category === c.name);
    return {
      name: c.name,
      slug: c.slug,
      count: own.length,
      articles: [...own]
        .sort((a, b) => (EVIDENCE_RANK[b.evidence] ?? 0) - (EVIDENCE_RANK[a.evidence] ?? 0))
        .slice(0, 7)
        .map((a) => ({ title: a.title, href: a.href, evidence: EVIDENCE_RANK[a.evidence] ?? 0 })),
    };
  }).filter((c) => c.count > 0);
  const start = START_HERE.map((slug) => all.find((a) => a.slug === slug)).filter((a) => a !== undefined);

  return (
    <>
      <SiteHeader current="Wiki" />
      <BodyMap categories={categories} />

      {start.length > 0 && (
        <section className="wiki-start">
          <div className="h">
            <b>Start here</b>
            <span>The four that matter most</span>
          </div>
          <div className="wiki-cards">
            {start.map((a) => (
              <Link key={a.slug} href={a.href} className="wiki-card">
                <span className="c">{a.category}</span>
                <b>{a.title}</b>
                <p>{a.summary}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="wiki-browse">
        <h2>Browse by body</h2>
        <div className="wiki-tiles">
          {categories.map((c) => {
            const crop = CROPS[c.name];
            return (
              <div key={c.slug} className="wiki-tile">
                <Link href={`/wiki/${c.slug}`} aria-label={c.name}>
                  <div className="crop" style={{ backgroundSize: `${crop.zoom} auto`, backgroundPosition: crop.at }} />
                </Link>
                <div className="b">
                  <div className="k">{crop.label}</div>
                  <h3>
                    <Link href={`/wiki/${c.slug}`}>{c.name}</Link>
                  </h3>
                  <div className="l">
                    {c.articles.slice(0, 4).map((a) => (
                      <Link key={a.href} href={a.href}>{a.title.replace(/ \(.*\)$/, '')}</Link>
                    ))}
                  </div>
                  <Link className="all" href={`/wiki/${c.slug}`}>All {c.count} ›</Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
