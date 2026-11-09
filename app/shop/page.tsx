import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { SiteHeader } from '@/components/site/SiteHeader';
import { ShopChallenge } from '@/components/shop/ShopChallenge';
import { SHOP_CHALLENGES } from '@/lib/shop/challenges';
import { getProducts, shopEnabled } from '@/lib/shop/storefront';
import { listArticles } from '@/lib/wiki/articles';
import { wikiMetadata } from '@/lib/wiki/seo';

// @ai-why: Statisch zoals de wiki. De Shopify-fetch vraagt een kwartier, en de laagste waarde wint
//   voor de route, dus prijzen en voorraad zijn hier hooguit een kwartier oud (TDR-0019 §2).
// @ai-sync: lib/shop/storefront.ts
export const revalidate = 3600;

const TITLE = 'Challenges at home';
const SUMMARY = 'Pick a challenge. Start for free, add gear when you want more, and let the free Carve app count every rep with your camera.';

export function generateMetadata(): Metadata {
  const meta = wikiMetadata({ title: TITLE, description: SUMMARY, path: '/shop' });
  // Een winkelpagina is geen artikel; `wikiMetadata` zet `type: 'article'`.
  return { ...meta, openGraph: { ...meta.openGraph, type: 'website' } };
}

/**
 * De winkelpagina: per camera challenge gratis, met spullen, en in de app (TDR-0019 §7).
 *
 * @ai-why: Zonder winkel geen pagina (TDR-0019 §6). Een winkel zonder producten zou op productie
 *   alleen lege vakken tonen.
 */
export default async function ShopPage() {
  if (!shopEnabled()) notFound();

  const [articles, ...products] = await Promise.all([
    listArticles(),
    ...SHOP_CHALLENGES.map((c) => getProducts(c.products, { medium: 'shop', campaign: c.id })),
  ]);

  return (
    <>
      <SiteHeader current="Shop" />
      <main className="shop">
        <div className="wiki-crumb">
          <Link href="/wiki">Wiki</Link> › Shop
        </div>
        <h1>{TITLE}</h1>
        <p className="shop-sum">{SUMMARY}</p>

        {SHOP_CHALLENGES.map((c, i) => {
          const a = articles.find((x) => x.slug === c.article);
          return (
            <ShopChallenge
              key={c.id}
              challenge={c}
              products={products[i]}
              article={a ? { title: a.title, href: a.href } : null}
            />
          );
        })}
      </main>
    </>
  );
}
