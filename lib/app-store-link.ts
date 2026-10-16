/**
 * De App Store-link met Apple's campagneparameters erachter.
 *
 * @ai-why: Apple kan downloads per campagne rapporteren, maar alleen als de link `pt` en
 * `ct` draagt op het moment dat er geklikt wordt. Net als bij UTM's is dat niet met
 * terugwerkende kracht te herstellen: wat er niet in stond, is weg. De cockpit leest deze
 * cijfers niet, want ze zitten in Apple's asynchrone Analytics-rapporten (afgewezen in
 * TDR-0006 beslissing 2). Ze zijn te lezen in App Store Connect zelf.
 *
 * @ai-gotcha: Deze parameters horen niet in de structured data van app/app/page.tsx.
 * `installUrl` en `sameAs` zijn de canonieke URL voor zoekmachines en die hoort schoon.
 *
 * @ai-sync: docs/tdr/0009-campagnerendement-komt-uit-ga4.md
 * @ai-sync: hooks/useAppStoreUrl.ts
 */

/**
 * @ai-gotcha: Apple accepteert maximaal veertig alfanumerieke tekens in een `ct`. Langer
 * of met leestekens erin wordt niet afgekapt maar genegeerd, en dan verdwijnt de campagne
 * stilletjes uit de rapportage. Vandaar dat we hier opschonen in plaats van hopen.
 */
const MAX_CT = 40

function schoon(campagne: string): string {
  return campagne.replace(/[^a-zA-Z0-9]/g, '').slice(0, MAX_CT)
}

export function appStoreCampaignUrl(
  basis: string,
  campagne: string | null | undefined,
  providerToken: string | undefined,
): string {
  if (!campagne || !providerToken) return basis

  const ct = schoon(campagne)
  if (ct === '') return basis

  const url = new URL(basis)
  url.searchParams.set('pt', providerToken)
  url.searchParams.set('ct', ct)
  return url.toString()
}

/**
 * Welke campagne er achter de link komt: die uit de advertentie waarmee de bezoeker binnenkwam,
 * anders die van de plek op de site (TDR-0017 §8).
 *
 * @ai-why: De advertentie gaat voor. Wie via een advertentie op een wiki-artikel landt, is door
 *   de advertentie gekomen; die download hoort bij de campagne die ervoor betaalde.
 */
export function pickCampaign(params: URLSearchParams, fallback?: string): string | null {
  return params.get('utm_campaign') ?? params.get('utm_id') ?? fallback ?? null
}

/**
 * `wiki` plus de slug, zodat App Store Connect de downloads per artikel laat zien. De streepjes
 * verdwijnen in `schoon`; `calorie-deficit` wordt `wikicaloriedeficit`.
 */
export function wikiCampaign(slug: string): string {
  return `wiki${slug}`
}
