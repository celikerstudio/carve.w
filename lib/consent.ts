/**
 * Toestemming voor de meetcookies van Google Analytics 4 en Google Ads.
 *
 * @ai-context: Google noemt dit Consent Mode v2. De tag laadt altijd, maar houdt zich
 * aan vier signalen die vertellen wat hij wel en niet mag opslaan. Wij zetten ze in
 * `app/layout.tsx` op `denied` vóór de tag laadt, en pas een expliciete keuze van de
 * bezoeker zet ze om. Alle vier zijn verplicht voor de EER; laat je `ad_user_data` of
 * `ad_personalization` weg, dan draait Google remarketing en conversiemodellering uit.
 *
 * @ai-sync: app/layout.tsx
 * @ai-sync: components/analytics/cookie-consent.tsx
 */

export type ConsentChoice = 'granted' | 'denied';

/**
 * @ai-why: localStorage en niet sessionStorage. Een toestemmingskeuze hoort bij de
 * bezoeker en niet bij dit ene bezoek; opnieuw vragen bij elk tabblad is zowel
 * irritant als juridisch onnodig. Let op dat dit het spiegelbeeld is van de
 * advertentie-attributie die hier tot 2026-09-08 stond: die hoorde juist bij één
 * bezoek en gebruikte daarom sessionStorage.
 */
export const CONSENT_STORAGE_KEY = 'carve_cookie_consent';

type ConsentSignals = {
  ad_storage: ConsentChoice;
  ad_user_data: ConsentChoice;
  ad_personalization: ConsentChoice;
  analytics_storage: ConsentChoice;
};

function signalsFor(choice: ConsentChoice): ConsentSignals {
  return {
    ad_storage: choice,
    ad_user_data: choice,
    ad_personalization: choice,
    analytics_storage: choice,
  };
}

/**
 * @ai-why: Een minimale store in plaats van een React context. Twee componenten lezen
 * dezelfde keuze en op /privacy staan ze tegelijk op de pagina; zonder abonnement
 * blijft de banner staan nadat je in de verklaring accepteert. Dit voedt bovendien
 * `useSyncExternalStore`, waarmee die componenten de keuze kunnen lezen zonder
 * setState in een effect, wat React 19 terecht afkeurt.
 * @ai-sync: components/analytics/cookie-consent.tsx
 * @ai-sync: components/analytics/cookie-settings.tsx
 */
const listeners = new Set<() => void>();

export function subscribeConsent(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * De eerder gemaakte keuze, of null als de bezoeker nog niets heeft gekozen.
 * Een geblokkeerde opslag levert ook null op: dan vragen we het gewoon opnieuw.
 */
export function readConsent(): ConsentChoice | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    return stored === 'granted' || stored === 'denied' ? stored : null;
  } catch {
    return null;
  }
}

/**
 * Vertelt Google wat er mag, zonder iets op te slaan.
 *
 * @ai-why: Dit staat los van `writeConsent` omdat toestemming bij een tweede bezoek
 * anders verdampt. `app/layout.tsx` zet Consent Mode bij elke paginalading op `denied`;
 * de keuze van de bezoeker staat dan wel in localStorage, maar niemand vertelt Google
 * dat er ja is gezegd. De banner blijft verborgen, dus je ziet het niet gebeuren, en
 * er wordt stilletjes niets gemeten. Roep dit dus aan bij het herstellen van een
 * bestaande keuze, en `writeConsent` alleen bij een nieuwe keuze.
 */
export function applyConsent(choice: ConsentChoice): void {
  if (typeof window === 'undefined') return;

  try {
    window.gtag?.('consent', 'update', signalsFor(choice));
  } catch (error) {
    console.error('Consent update error:', error);
  }
}

/**
 * Legt een nieuwe keuze vast en vertelt Google wat er mag.
 */
export function writeConsent(choice: ConsentChoice): void {
  if (typeof window === 'undefined') return;

  // @ai-why: Eerst opslaan, maar een mislukte opslag mag het signaal niet tegenhouden.
  // Weigert iemand in een privévenster, dan is "Google hoort het niet" de ergste
  // uitkomst: dan blijven we cookies zetten na een expliciete weigering. Vandaar de
  // aparte try in plaats van één blok om beide heen.
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, choice);
  } catch {
    // Privémodus of geblokkeerde opslag. We vragen het volgende keer opnieuw.
  }

  applyConsent(choice);

  // @ai-why: Alleen hier melden, niet in applyConsent. Die draait bij elke paginalading
  // om een bestaande keuze te herstellen; zou hij melden, dan zou elke lading een
  // rerender van beide componenten uitlokken zonder dat er iets veranderd is.
  for (const listener of listeners) listener();
}
