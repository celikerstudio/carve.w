import { describe, expect, it, vi } from 'vitest';
import { formatPrice, getArticleProducts, productQuery, toShopProducts } from './storefront';

const node = (handle: string, over: Record<string, unknown> = {}) => ({
  handle,
  title: handle.replace(/-/g, ' '),
  availableForSale: true,
  onlineStoreUrl: null,
  featuredImage: { url: `https://cdn.shopify.com/${handle}.jpg`, altText: null },
  priceRange: { minVariantPrice: { amount: '75.0', currencyCode: 'EUR' } },
  ...over,
});

const opts = { shopUrl: 'https://shop.example', article: 'home-gym' };

describe('productQuery', () => {
  it('vraagt elk product op met een eigen alias, zodat de volgorde van de koppeling blijft', () => {
    const q = productQuery(['dumbbell-set', 'yoga-mat']);
    expect(q).toContain('p0: product(handle: "dumbbell-set")');
    expect(q).toContain('p1: product(handle: "yoga-mat")');
  });

  it('laat een handle met rare tekens niet in de query lekken', () => {
    expect(() => productQuery(['ok", evil: shop { name }'])).toThrow();
  });
});

describe('toShopProducts (TDR-0019 §2)', () => {
  it('houdt de volgorde van de koppeling aan', () => {
    const data = { p0: node('b'), p1: node('a') };
    expect(toShopProducts(data, ['b', 'a'], opts).map((p) => p.handle)).toEqual(['b', 'a']);
  });

  it('laat weg wat niet te koop is of niet bestaat', () => {
    const data = { p0: node('sold-out', { availableForSale: false }), p1: null, p2: node('ok') };
    expect(toShopProducts(data, ['sold-out', 'missing', 'ok'], opts).map((p) => p.handle)).toEqual(['ok']);
  });

  it('linkt naar de productpagina met utm per artikel (TDR-0019 §5)', () => {
    const [p] = toShopProducts({ p0: node('dumbbell-set') }, ['dumbbell-set'], opts);
    const url = new URL(p.href);
    expect(url.origin + url.pathname).toBe('https://shop.example/products/dumbbell-set');
    expect(url.searchParams.get('utm_source')).toBe('carve.wiki');
    expect(url.searchParams.get('utm_medium')).toBe('wiki');
    expect(url.searchParams.get('utm_campaign')).toBe('home-gym');
  });

  it('gebruikt de eigen winkel-URL van Shopify als die er is', () => {
    const data = { p0: node('mat', { onlineStoreUrl: 'https://carve.shop/products/mat' }) };
    const [p] = toShopProducts(data, ['mat'], opts);
    expect(p.href.startsWith('https://carve.shop/products/mat?')).toBe(true);
  });

  it('vraagt het plaatje klein op bij het CDN van Shopify', () => {
    const [p] = toShopProducts({ p0: node('mat') }, ['mat'], opts);
    expect(p.image?.url).toBe('https://cdn.shopify.com/mat.jpg?width=240');
    expect(p.image?.alt).toBe('mat');
  });
});

describe('formatPrice', () => {
  it('laat de centen weg bij een rond bedrag', () => {
    expect(formatPrice('75.0', 'EUR')).toBe('€75');
    expect(formatPrice('49.99', 'EUR')).toBe('€49.99');
  });
});

describe('getArticleProducts', () => {
  const env = { SHOPIFY_STOREFRONT_URL: 'https://shop.example/api/2026-10/graphql.json', SHOPIFY_STOREFRONT_TOKEN: 'tok' };

  it('doet niets zonder winkel, zodat productie pas iets toont als de winkel er is (TDR-0019 §6)', async () => {
    const fetchImpl = vi.fn();
    expect(await getArticleProducts('home-gym', {}, fetchImpl)).toEqual([]);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('doet niets voor een artikel zonder producten', async () => {
    const fetchImpl = vi.fn();
    expect(await getArticleProducts('protein', env, fetchImpl)).toEqual([]);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('stuurt het token mee en geeft de producten terug', async () => {
    const fetchImpl = vi.fn<(url: string, init: RequestInit) => Promise<Response>>(
      async () => new Response(JSON.stringify({ data: { p0: node('x'), p1: node('y') } })),
    );
    const out = await getArticleProducts('home-gym', env, fetchImpl, { 'home-gym': ['x', 'y'] });
    expect(out.map((p) => p.handle)).toEqual(['x', 'y']);
    const [url, init] = fetchImpl.mock.calls[0];
    expect(url).toBe(env.SHOPIFY_STOREFRONT_URL);
    expect((init.headers as Record<string, string>)['X-Shopify-Storefront-Access-Token']).toBe('tok');
    expect(out[0].href.startsWith('https://shop.example/products/x?')).toBe(true);
  });

  it('laat het artikel staan als Shopify faalt', async () => {
    const quiet = vi.spyOn(console, 'error').mockImplementation(() => {});
    const down = vi.fn(async () => new Response('nope', { status: 503 }));
    expect(await getArticleProducts('home-gym', env, down, { 'home-gym': ['x'] })).toEqual([]);
    const throws = vi.fn(async () => {
      throw new Error('offline');
    });
    expect(await getArticleProducts('home-gym', env, throws, { 'home-gym': ['x'] })).toEqual([]);
    const gqlError = vi.fn(async () => new Response(JSON.stringify({ errors: [{ message: 'bad' }] })));
    expect(await getArticleProducts('home-gym', env, gqlError, { 'home-gym': ['x'] })).toEqual([]);
    quiet.mockRestore();
  });
});
