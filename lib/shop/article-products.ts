/**
 * Welke producten uit de winkel onder welk wiki-artikel staan, per slug (TDR-0019 §3).
 *
 * @ai-why: In code en niet in Shopify. De partner beheert de producten, maar Furkan tekent als
 *   auteur voor wat er onder zijn artikel staat. Een tag in Shopify zou de partner zelf producten
 *   onder artikelen laten hangen.
 * @ai-todo: Dit zijn handles uit de testcatalogus `fitness-dropship.mock.shop`. Vervang ze door
 *   de handles uit de echte winkel zodra die bestaat. Een handle die daar niet bestaat toont
 *   niets, dus vergeten geeft een leeg blok en geen verkeerd product.
 * @ai-sync: lib/shop/storefront.ts
 */
export const ARTICLE_PRODUCTS: Record<string, string[]> = {
  'home-gym': ['minimalist-dumbbell-set', 'premium-yoga-mat'],
  'foam-rolling': ['eco-conscious-massage-stick'],
};
