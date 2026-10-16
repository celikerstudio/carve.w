/**
 * Categorieën, adressen en de rekenhulp per artikel van de publieke wiki (TDR-0016).
 *
 * @ai-why: Puur en zonder database, zodat de adressen en de formules te testen zijn. De
 *   database kent de categorie als "Nutrition"; het adres als "nutrition".
 * @ai-gotcha: De volgorde hieronder is de volgorde in de navigatie. Een categorie die in de
 *   database staat maar hier niet, verschijnt nergens: de 14 Nederlandse jiujitsu-stubs vallen
 *   daar bewust door weg (en door `language = 'en'` in `lib/wiki/articles.ts`).
 */

export const WIKI_CATEGORIES = [
  { name: 'Nutrition', slug: 'nutrition' },
  { name: 'Training', slug: 'training' },
  { name: 'Recovery', slug: 'recovery' },
  { name: 'Supplements', slug: 'supplements' },
  { name: 'Mindset', slug: 'mindset' },
] as const;

export type WikiCategory = (typeof WIKI_CATEGORIES)[number];

export function categoryBySlug(slug: string): WikiCategory | undefined {
  return WIKI_CATEGORIES.find((c) => c.slug === slug);
}

export function categoryByName(name: string): WikiCategory | undefined {
  return WIKI_CATEGORIES.find((c) => c.name.toLowerCase() === name.toLowerCase());
}

export function articleHref(categoryName: string, slug: string): string | null {
  const category = categoryByName(categoryName);
  return category ? `/wiki/${category.slug}/${slug}` : null;
}

/** Hoeveel minuten lezen, op 220 woorden per minuut en minstens één. */
export function readMinutes(markdown: string): number {
  const words = markdown.replace(/[#*:>|[\]-]/g, ' ').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

export const EVIDENCE_LABEL: Record<string, string> = {
  'well-established': 'Well established',
  'expert-consensus': 'Expert consensus',
  'emerging-research': 'Emerging research',
};

/**
 * Een getal dat van de lezer afhangt, bovenaan het artikel (TDR-0016 §4).
 *
 * @ai-why: In code en niet in de database. Het zijn er weinig, het zijn formules, en een
 *   formule in een tekstkolom is niet te testen.
 * @ai-gotcha: De bandbreedte moet uit het artikel zelf komen. Pas je de tekst van een artikel
 *   aan, kijk dan of de formule hier nog hetzelfde zegt.
 */
export interface Calculator {
  /** "Eat {range} a day to build muscle." `{range}` wordt de uitkomst. */
  sentence: string;
  /** Kleine regel onder de zin: waar het getal vandaan komt. */
  basis: string;
  unit: string;
  perKg: [number, number];
}

export const CALCULATORS: Record<string, Calculator> = {
  protein: {
    sentence: 'Eat {range} a day to build muscle.',
    basis: '1.6 to 2.2 g per kilo of bodyweight.',
    unit: 'g',
    perKg: [1.6, 2.2],
  },
};

export function calculate(calc: Calculator, kg: number): [number, number] {
  return [Math.round(kg * calc.perKg[0]), Math.round(kg * calc.perKg[1])];
}
