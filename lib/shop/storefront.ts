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

function withUtm(url: string, article: string): string {
  const u = new URL(url);
  u.searchParams.set('utm_source', 'carve.wiki');
  u.searchParams.set('utm_medium', 'wiki');
  u.searchParams.set('utm_campaign', article);
  return u.toString();
}

function smallImage(url: string): string {
  return `${url}${url.includes('?') ? '&' : '?'}width=240`;
}

export function toShopProducts(
  data: Record<string, RawProduct | null>,
  handles: string[],
  { shopUrl, article }: { shopUrl: string; article: string },
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
        href: withUtm(p.onlineStoreUrl ?? `${shopUrl}/products/${p.handle}`, article),
      },
    ];
  });
}

/**
 * De producten onder een artikel, of een lege lijst.
 *
 * @ai-context: `SHOPIFY_STOREFRONT_URL` is het GraphQL-adres van de winkel
 *   (`https://<winkel>.myshopify.com/api/2026-10/graphql.json`), `SHOPIFY_STOREFRONT_TOKEN` het
 *   publieke Storefront-token uit de Headless-app in Shopify. Zonder URL is er geen blok
 *   (TDR-0019 §6). De testcatalogus `https://fitness-dropship.mock.shop/api` werkt zonder token.
 */
export async function getArticleProducts(
  article: string,
  env: Env = process.env,
  fetchImpl: FetchLike = fetch,
  mapping: Record<string, string[]> = ARTICLE_PRODUCTS,
): Promise<ShopProduct[]> {
  const endpoint = env.SHOPIFY_STOREFRONT_URL;
  const handles = mapping[article];
  if (!endpoint || !handles?.length) return [];

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
    return toShopProducts(json.data, handles, { shopUrl: new URL(endpoint).origin, article });
  } catch (error) {
    console.error(`[shop] producten voor ${article} niet opgehaald:`, error);
    return [];
  }
}
