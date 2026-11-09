/**
 * De challenges op de winkelpagina `/shop` (TDR-0019 §7). Elke challenge heeft drie wegen: gratis,
 * met spullen uit de winkel, en tellen met de camera in Carve AI.
 *
 * @ai-why: De winkel is opgebouwd rond de camera challenges van de app en niet rond productsoorten
 *   (companion `shop-b-v3-challenges`, Furkan: "moet hand in hand gaan"). Zo verwijst de winkel
 *   naar de app, en is er bij elk product een reden om het te kopen.
 * @ai-context: De sterren zijn die van Carve-AI `Carve AI/App/Services/Workout/ChallengeStars.swift`
 *   (ADR-129 §1): push-ups op rij 5 · 20 · 50, squats op rij 10 · 30 · 60. Een andere repo, dus
 *   geen `@ai-sync` die de validator hier kan controleren. Wijzigt de app een drempel, pas hem
 *   hier dan ook aan; anders belooft de winkel een ster die de app anders uitdeelt.
 * @ai-context: `stars: null` is een challenge die de app nog niet voor iedereen heeft. Pull-ups
 *   tellen al met de camera, maar alleen voor de admin (Carve-AI ADR-116 §1, ADR-129 "Later").
 *   Gaat die open, zet de sterren dan hier.
 * @ai-why: `products: []` betekent bewust geen spullen nodig, en dat zegt de pagina ook. Een mat
 *   bij squats zou de rest van de pagina ongeloofwaardiger maken.
 * @ai-todo: Twee dingen vóór `SHOPIFY_STOREFRONT_URL` op productie gaat. (1) De handles komen uit
 *   de testcatalogus `fitness-dropship.mock.shop`; vervang ze door die uit de echte winkel, anders
 *   staat er "out of stock" bij producten die niet bestaan. (2) De sterren moeten in de App
 *   Store-versie zitten (Carve-AI ADR-129, bouwvolgorde 1 en 2). Op 2026-11-09 stond
 *   `ChallengeStars` nog niet in een release en viel de ster nog niet in de camera; daarom zegt
 *   `app` alleen dat de camera telt.
 */

export type Pose = 'push' | 'squat' | 'pull';

export interface ShopChallenge {
  /** In utm en in de App Store-campagne (`shop` + id), dus alleen kleine letters en streepjes. */
  id: string;
  title: string;
  stars: [number, number, number] | null;
  /** Slug van het wiki-artikel dat de oefening uitlegt. */
  article: string;
  free: { title: string; text: string };
  products: string[];
  /** De zin onder de camera. Alleen wat de app echt doet. */
  app: string;
  pose: Pose;
}

export const SHOP_CHALLENGES: ShopChallenge[] = [
  {
    id: 'push-ups-in-a-row',
    title: 'Push-ups in a row',
    stars: [5, 20, 50],
    article: 'home-gym',
    free: {
      title: 'The floor',
      text: 'Hands under your shoulders, body in one straight line. Start on your knees if five is too many.',
    },
    products: ['minimalist-dumbbell-set', 'premium-yoga-mat'],
    app: 'Your camera counts every rep.',
    pose: 'push',
  },
  {
    id: 'squats-in-a-row',
    title: 'Squats in a row',
    stars: [10, 30, 60],
    article: 'compound-exercises',
    free: {
      title: 'Just you',
      text: 'Feet shoulder-width apart, sit back until your thighs are level, heels stay down.',
    },
    products: [],
    app: 'Your camera counts every rep.',
    pose: 'squat',
  },
  {
    id: 'first-pull-up',
    title: 'Your first pull-up',
    stars: null,
    article: 'progressive-overload',
    free: {
      title: 'A sturdy table',
      text: 'Lie under it, grip the edge and pull your chest up. It trains the same back muscles.',
    },
    products: ['tangerine-yoga-mat', 'eco-conscious-massage-stick'],
    app: 'Pull-ups are coming to the camera. Stars follow.',
    pose: 'pull',
  },
];

/** Waar de drie sterren op een balk staan, in procent, met goud aan het eind. */
export function starMarks(stars: [number, number, number]): number[] {
  return stars.map((s) => Math.round((s / stars[2]) * 100));
}
