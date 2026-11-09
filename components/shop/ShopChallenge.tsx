'use client';

import Link from 'next/link';
import { GetCarveLink } from '@/components/wiki/public/GetCarveLink';
import { track } from '@/lib/analytics';
import { starMarks, type Pose, type ShopChallenge as Challenge } from '@/lib/shop/challenges';
import type { ShopProduct } from '@/lib/shop/storefront';

/**
 * Eén challenge op de winkelpagina: gratis, met spullen, en tellen in Carve AI (TDR-0019 §7).
 *
 * @ai-why: Een client-component voor de klikmeting op producten en de App Store-knop. Producten
 *   komen als props van de server, dus de pagina blijft statisch.
 * @ai-why: "Free · iPhone" onder de knop, dezelfde woorden als de marketingpagina. Het tellen met
 *   de camera valt niet onder Pro, dus "free" klopt voor wat deze kolom belooft.
 * @ai-sync: lib/marketing-copy.ts (`hero.onderKnop`: "Free · iPhone")
 * @ai-sync: lib/analytics.ts (`shop_click`, source 'shop')
 */
export function ShopChallenge({
  challenge: c,
  products,
  article,
}: {
  challenge: Challenge;
  products: ShopProduct[];
  article: { title: string; href: string } | null;
}) {
  const live = c.stars !== null;
  return (
    <section className="shop-ch" id={c.id}>
      <div className="shop-ch-head">
        <h2>{c.title}</h2>
        {c.stars ? (
          <div className="shop-stars" aria-label={`Stars at ${c.stars.join(', ')}`}>
            {c.stars.map((s, i) => (
              <span key={s} className={`s${i + 1}`}>
                <i aria-hidden>{'★'.repeat(i + 1)}</i>
                {s}
              </span>
            ))}
          </div>
        ) : (
          <span className="shop-soon">Challenge coming to the app</span>
        )}
        {article && (
          <Link className="shop-read" href={article.href}>
            Read: {article.title} ›
          </Link>
        )}
      </div>

      <div className="shop-ways">
        <div className="shop-way">
          <span className="k">Free</span>
          <span className="n">{c.free.title}</span>
          <span className="d">{c.free.text}</span>
        </div>

        <div className="shop-way">
          <span className="k">With gear</span>
          {c.products.length === 0 ? (
            <div className="shop-none">You don&apos;t need anything for this one.</div>
          ) : products.length === 0 ? (
            // @ai-why: Handles ingesteld maar niets te koop. Niet "you don't need anything": dat
            //   zou een andere bewering zijn.
            // @ai-gotcha: Een handle die in de winkel niet bestaat valt hier ook onder, en dan is
            //   "out of stock" onwaar. `getProducts` logt zo'n handle; zie de @ai-todo in
            //   lib/shop/challenges.ts vóór de winkel aan gaat.
            // @ai-sync: lib/shop/storefront.ts (getProducts logt ontbrekende handles)
            <div className="shop-none">Out of stock right now.</div>
          ) : (
            <div className="shop-prods">
              {products.map((p) => (
                <a
                  key={p.handle}
                  href={p.href}
                  target="_blank"
                  rel="noopener"
                  onClick={() => track('shop_click', { challenge: c.id, product_handle: p.handle })}
                >
                  {p.image && (
                    // eslint-disable-next-line @next/next/no-img-element -- het CDN van Shopify verkleint zelf (`width=240`)
                    <img src={p.image.url} alt={p.image.alt} loading="lazy" width={240} height={240} />
                  )}
                  <span className="n">{p.title}</span>
                  <span className="p">{p.price}</span>
                </a>
              ))}
            </div>
          )}
        </div>

        <div className={`shop-way shop-app${live ? '' : ' off'}`}>
          <span className="k">{live ? 'Count it in Carve AI' : 'Coming to Carve AI'}</span>
          <CameraPreview pose={c.pose} stars={c.stars} />
          <span className="d">{c.app}</span>
          <GetCarveLink source="shop" campaign={`shop${c.id}`} challenge={c.id} className={live ? 'wiki-button' : 'wiki-button ghost'} />
          <span className="free">Free · iPhone</span>
        </div>
      </div>
    </section>
  );
}

/**
 * Een stilstaand beeld van de camera: de schim, de teller en de balk met de drie sterren.
 *
 * @ai-why: Een tekening en geen schermopname. De sterren op de balk komen uit dezelfde drempels
 *   als de kop, zodat het plaatje niet kan afwijken van de tekst ernaast.
 */
function CameraPreview({ pose, stars }: { pose: Pose; stars: Challenge['stars'] }) {
  const count = stars ? stars[1] - 3 : null;
  return (
    <div className="shop-cam" aria-hidden>
      <svg viewBox="0 0 60 40">{FIGURES[pose]}</svg>
      {count !== null && stars && (
        <>
          <span className="cnt">{count}</span>
          <div className="bar">
            <span style={{ width: `${Math.round((count / stars[2]) * 100)}%` }} />
            {starMarks(stars).map((m) => (
              <em key={m} style={{ left: `calc(${m}% - 1px)` }} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

const FIGURES: Record<Pose, React.ReactNode> = {
  push: (
    <>
      <circle cx="10" cy="14" r="4" />
      <path d="M14 16l34 8M18 17v14M48 24v8" />
    </>
  ),
  squat: (
    <>
      <circle cx="30" cy="6" r="4" />
      <path d="M30 10v12M30 22l-8 6 2 10M30 22l8 6-2 10M22 14h16" />
    </>
  ),
  pull: (
    <>
      <path d="M10 4h40" />
      <circle cx="30" cy="12" r="4" />
      <path d="M22 4l4 10M38 4l-4 10M30 16v14M30 30l-4 8M30 30l4 8" />
    </>
  ),
};
