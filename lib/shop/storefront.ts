import { ARTICLE_PRODUCTS } from './article-products';

/**
 * Producten uit de Shopify-winkel van de partner, via de Storefront API (TDR-0019).
 *
 * @ai-why: Alleen lezen. Winkelwagen, checkout en bestellingen zitten in Shopify; een klik gaat
 *   naar de productpagina daar. Zo kan de partner de winkel runnen zonder developer.
 * @ai-gotcha: Alle fouten worden een lege lijst. Het blok is bijzaak naast het artikel, en een
 *   winkel die even plat ligt mag een artikel nooit laten falen.
 * @ai-gotcha: Een throttle- of GraphQL-fout komt bij Shopify als HTTP 200 binnen. Next bewaart
 *   dat antwoord een kwartier, dus het blok kan zo lang wegblijven. Bewust geaccepteerd.
 */

export interface ShopProduct {
  handle: string;
  title: string;
  price: string;
  image: { url: string; alt: string } | null;
  href: string;
}

/** `process.env`, of in een test een los object met `SHOPIFY_STOREFRONT_URL` en `SHOPIFY_STOREFRONT_TOKEN`. */
type Env = Record<string, string | undefined>;
type FetchLike = (url: string, init: RequestInit & { next?: { revalidate: number } }) => Promise<Response>;

interface RawProduct {
  handle: string;
  title: string;
  availableForSale: boolean;
  onlineStoreUrl: string | null;
  featuredImage: { url: string; altText: string | null } | null;
  priceRange: { minVariantPrice: { amount: string; currencyCode: string } };
}

// @ai-why: Een kwartier. Lager dan de verversing van het artikel (een uur), dus de hele pagina
//   ververst nu elk kwartier; dat kost een paar extra databasevragen en scheelt een uitverkocht
//   product dat drie kwartier te lang in beeld staat. Echt live (in de browser) is afgewogen in
//   TDR-0019.
// @ai-sync: app/wiki/[category]/[slug]/page.tsx (`revalidate = 3600`)
// @ai-sync: app/shop/page.tsx (`revalidate = 3600`)
const REVALIDATE_SECONDS = 900;

// @ai-why: Een Shopify die hangt in plaats van faalt, blokkeert anders de build en elke
//   verversing tot de functielimiet. Drie seconden en dan zonder blok verder.
const TIMEOUT_MS = 3000;

const HANDLE = /^[a-z0-9][a-z0-9-]*$/;

/** Eén GraphQL-query met een alias per handle, zodat de volgorde van de koppeling blijft. */
export function productQuery(handles: string[]): string {
  const fields = handles.map((h, i) => {
    if (!HANDLE.test(h)) throw new Error(`Ongeldige Shopify-handle: ${h}`);
    return `p${i}: product(handle: "${h}") { ...P }`;
  });
  return `fragment P on Product { handle title availableForSale onlineStoreUrl featuredImage { url altText } priceRange { minVariantPrice { amount currencyCode } } }
query { ${fields.join(' ')} }`;
}

/** "€75" bij een rond bedrag, anders "€49.99". */
export function formatPrice(amount: string, currency: string): string {
  const n = Number(amount);
  const whole = Number.isInteger(n);
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency,
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: whole ? 0 : 2,
  }).format(n);
}

/** Waar een klik vandaan kwam: `wiki` (blok onder een artikel) of `shop` (de winkelpagina). */
export interface Utm {
  medium: 'wiki' | 'shop';
  /** Artikel-slug of challenge-id. */
  campaign: string;
}

function withUtm(url: string, { medium, campaign }: Utm): string {
  const u = new URL(url);
  u.searchParams.set('utm_source', 'carve.wiki');
  u.searchParams.set('utm_medium', medium);
  u.searchParams.set('utm_campaign', campaign);
  return u.toString();
}

function smallImage(url: string): string {
  return `${url}${url.includes('?') ? '&' : '?'}width=240`;
}

export function toShopProducts(
  data: Record<string, RawProduct | null>,
  handles: string[],
  { shopUrl, ...utm }: { shopUrl: string } & Utm,
): ShopProduct[] {
  return handles.flatMap((_, i) => {
    const p = data[`p${i}`];
    if (!p || !p.availableForSale) return [];
    const { amount, currencyCode } = p.priceRange.minVariantPrice;
    return [
      {
        handle: p.handle,
        title: p.title,
        price: formatPrice(amount, currencyCode),
        image: p.featuredImage ? { url: smallImage(p.featuredImage.url), alt: p.featuredImage.altText ?? p.title } : null,
        href: withUtm(p.onlineStoreUrl ?? `${shopUrl}/products/${p.handle}`, utm),
      },
    ];
  });
}

/** Staat de winkel aan? Zonder `SHOPIFY_STOREFRONT_URL` is er geen blok en geen winkelpagina (TDR-0019 §6). */
export function shopEnabled(env: Env = process.env): boolean {
  return Boolean(env.SHOPIFY_STOREFRONT_URL);
}

/**
 * Producten op volgorde van `handles`, alleen wat te koop is, of een lege lijst.
 *
 * @ai-context: `SHOPIFY_STOREFRONT_URL` is het GraphQL-adres van de winkel
 *   (`https://<winkel>.myshopify.com/api/2026-10/graphql.json`), `SHOPIFY_STOREFRONT_TOKEN` het
 *   publieke Storefront-token uit de Headless-app in Shopify. De testcatalogus
 *   `https://fitness-dropship.mock.shop/api` werkt zonder token.
 */
export async function getProducts(
  handles: string[],
  utm: Utm,
  env: Env = process.env,
  fetchImpl: FetchLike = fetch,
): Promise<ShopProduct[]> {
  const endpoint = env.SHOPIFY_STOREFRONT_URL;
  if (!endpoint || handles.length === 0) return [];

  try {
    const res = await fetchImpl(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(env.SHOPIFY_STOREFRONT_TOKEN ? { 'X-Shopify-Storefront-Access-Token': env.SHOPIFY_STOREFRONT_TOKEN } : {}),
      },
      body: JSON.stringify({ query: productQuery(handles) }),
      next: { revalidate: REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) throw new Error(`Shopify ${res.status}`);
    const json = (await res.json()) as { data?: Record<string, RawProduct | null>; errors?: { message: string }[] };
    if (json.errors?.length || !json.data) throw new Error(json.errors?.[0]?.message ?? 'Shopify gaf geen data');
    // @ai-why: De productpagina staat op het adres van de winkel zelf. Bij een myshopify-domein
    //   stuurt Shopify door naar het eigen domein, dus de oorsprong van de API is genoeg.
    // @ai-why: Een handle die de winkel niet kent is een configuratiefout (lib/shop/challenges.ts,
    //   lib/shop/article-products.ts), geen voorraadstand. Loggen, zodat hij in de Vercel-logs staat.
    const missing = handles.filter((_, i) => json.data![`p${i}`] === null);
    if (missing.length) console.error(`[shop] onbekende handles voor ${utm.medium}/${utm.campaign}: ${missing.join(', ')}`);
    return toShopProducts(json.data, handles, { shopUrl: new URL(endpoint).origin, ...utm });
  } catch (error) {
    console.error(`[shop] producten voor ${utm.medium}/${utm.campaign} niet opgehaald:`, error);
    return [];
  }
}

/** De producten onder een artikel (TDR-0019 §2). */
export function getArticleProducts(
  article: string,
  env: Env = process.env,
  fetchImpl: FetchLike = fetch,
  mapping: Record<string, string[]> = ARTICLE_PRODUCTS,
): Promise<ShopProduct[]> {
  return getProducts(mapping[article] ?? [], { medium: 'wiki', campaign: article }, env, fetchImpl);
}
