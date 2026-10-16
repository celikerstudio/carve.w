import Image from 'next/image';
import Link from 'next/link';
import { AppStoreButton } from '@/components/carve/AppStoreButton';
import { listArticles } from '@/lib/wiki/articles';
import { WIKI_CATEGORIES } from '@/lib/wiki/catalog';
import type { Taal } from '@/lib/marketing-copy';
import { SiteSearch } from './SiteSearch';
import './site-header.css';

const COPY: Record<Taal, { about: string; signIn: string; search: string; empty: string }> = {
  en: { about: "What's Carve?", signIn: 'Sign in', search: 'Search', empty: 'Nothing on that yet.' },
  nl: { about: 'Wat is Carve?', signIn: 'Inloggen', search: 'Zoeken', empty: 'Daar staat nog niets over.' },
};

/**
 * De ene kop van carve.wiki (Furkan, 2026-10-16: "we hebben meerdere headers, laten we dat tot 1
 * verwerken").
 *
 * @ai-why: Tot 2026-10-16 waren het er vier: de inschuivende balk van de marketingpagina, de kop
 *   van de juridische pagina's, die van de vraagpagina's en die van de wiki. Elk met een eigen
 *   logo, eigen maten en eigen links; wie van de wiki naar /app ging, kwam op een andere site.
 * @ai-why: De wiki-categorieën staan op elke pagina en niet alleen in de wiki. Zo is de wiki
 *   vanaf de marketingpagina één klik weg, en dat helpt Google de artikelen te vinden.
 * @ai-gotcha: Haalt de artikelen op voor het zoekveld. De pagina's die hem tonen zijn statisch
 *   (ISR), dus dat is één query per build of per verversing, niet per bezoek.
 * @ai-sync: components/carve/AppStoreButton.tsx (source 'header', nu op elke pagina)
 */
export async function SiteHeader({ taal = 'en', current }: { taal?: Taal; current?: string }) {
  const t = COPY[taal];
  const articles = await listArticles();
  const items = articles.map((a) => ({ title: a.title, href: a.href, category: a.category, summary: a.summary }));
  const home = taal === 'nl' ? '/nl/app' : '/app';

  return (
    <header className="site-header">
      <div className="site-header-bar">
        <Link href={home} className="site-brand">
          <Image src="/carve-logo.png" alt="" width={20} height={20} />
          Carve
        </Link>
        <nav className="site-nav" aria-label="Wiki">
          <Link href="/wiki" aria-current={current === 'Wiki' ? 'page' : undefined}>Wiki</Link>
          <span className="sep" aria-hidden />
          {WIKI_CATEGORIES.map((c) => (
            <Link key={c.slug} href={`/wiki/${c.slug}`} aria-current={current === c.name ? 'page' : undefined}>
              {c.name}
            </Link>
          ))}
          <span className="sep" aria-hidden />
          <Link href={home} aria-current={current === 'About' ? 'page' : undefined}>{t.about}</Link>
        </nav>
        <div className="site-end">
          <SiteSearch items={items} placeholder={t.search} empty={t.empty} />
          {/* @ai-why: Inloggen leidt nu naar de cockpit. De persoonlijke laag in de wiki komt later
              (TDR-0016, Consequenties). */}
          <Link href="/login" className="site-signin">{t.signIn}</Link>
          {/* @ai-why: Apple's eigen badge en geen zelfgemaakte knop met hun logo: dat staan hun
              richtlijnen niet toe (zie AppStoreButton). */}
          <AppStoreButton source="header" />
        </div>
      </div>
    </header>
  );
}
