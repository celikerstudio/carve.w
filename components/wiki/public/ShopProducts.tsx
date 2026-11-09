'use client';

import { track } from '@/lib/analytics';
import type { ShopProduct } from '@/lib/shop/storefront';

/**
 * Het winkelblok onder een artikel: producten uit de winkel van de partner (TDR-0019).
 *
 * @ai-why: Onder de bronnen en met "From the Carve shop" erboven, zodat niemand een product voor
 *   een bevinding uit het artikel aanziet (TDR-0019 §4). Geen "recommended" of "best": dat zou
 *   een oordeel van de wiki suggereren.
 * @ai-why: Een client-component alleen voor de klikmeting. De producten komen als props van de
 *   server, dus de pagina blijft statisch.
 * @ai-sync: lib/analytics.ts (`shop_click`)
 * @ai-sync: app/wiki/[category]/[slug]/page.tsx (plek onder de bronnen, producten als props)
 */
export function ShopProducts({ products, article }: { products: ShopProduct[]; article: string }) {
  if (products.length === 0) return null;
  return (
    <section className="wiki-shop" aria-label="From the Carve shop">
      <div className="h">From the Carve shop</div>
      <div className="wiki-shop-grid">
        {products.map((p) => (
          <a
            key={p.handle}
            href={p.href}
            target="_blank"
            rel="noopener"
            onClick={() => track('shop_click', { article_slug: article, product_handle: p.handle })}
          >
            {p.image && (
              // eslint-disable-next-line @next/next/no-img-element -- het CDN van Shopify verkleint zelf (`width=240`)
              <img src={p.image.url} alt={p.image.alt} loading="lazy" width={240} height={240} />
            )}
            <span className="t">{p.title}</span>
            <span className="p">{p.price}</span>
          </a>
        ))}
      </div>
    </section>
  );
}
