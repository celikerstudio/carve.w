/**
 * Analytics via Google Analytics 4.
 *
 * Setup:
 * 1. Maak een GA4-property aan voor carve.wiki in https://analytics.google.com
 * 2. Zet het measurement ID (`G-…`) als NEXT_PUBLIC_GA_MEASUREMENT_ID in de omgeving
 * 3. De tag wordt geladen in app/layout.tsx, achter Consent Mode v2
 *
 * @ai-context: Tot 2026-09-08 liep dit op Plausible. De overstap is gemaakt omdat GA4
 * aan Google Ads gekoppeld kan worden: `app_store_click` wordt daar als conversie
 * geïmporteerd en Google kan er zijn biedingen op sturen. Plausible kon dat niet. De
 * prijs is een cookiebanner, want GA4 zet `_ga`-cookies. Afgewogen alternatieven waren
 * Plausible houden met handmatige offline conversie-import via de gclid, en GA4 naast
 * Vercel Analytics als cookieloze basislijn. Het eerste is te veel handwerk per
 * campagne, het tweede is een tweede systeem onderhouden voordat er verkeer is.
 *
 * @ai-sync: app/layout.tsx
 * @ai-sync: lib/consent.ts
 */

type EventName =
  // Waitlist events
  | 'waitlist_signup_initiated'
  | 'waitlist_signup_success'
  | 'waitlist_signup_failed'
  | 'waitlist_email_verified'

  // Wiki events (for future use)
  | 'wiki_article_view'
  | 'wiki_search'
  | 'wiki_suggestion_submitted'

  // Dashboard events (for future use)
  | 'dashboard_view'
  | 'workout_logged'
  | 'achievement_unlocked'

  // @ai-why: Homepage-trechter. Deze drie horen bij de bouw van het keuzescherm
  // en niet erna: TDR-0001 laat zich alleen overrulen met de klikratio op de
  // kaarten en de doorloop naar signup, en zonder deze events bestaat die
  // meting niet. Zie docs/tdr/0001-homepage-is-een-keuzescherm.md beslissing 8.
  | 'home_card_click'
  | 'demo_message_sent'
  | 'demo_to_signup'

  // @ai-why: De app-pagina heeft meerdere App Store-knoppen (hero, marketing-hero,
  // pricing) en zonder dit event is niet te zien of er iemand doorklikt — precies het
  // cijfer waar advertenties op beoordeeld worden. Eén event met een `source`-prop in
  // plaats van een event per knop, zodat het totaal klopt zonder optellen.
  //
  // @ai-context: Dit is het event dat je in Google Ads als conversie importeert. Markeer
  // het daar als key event, anders heeft de biedstrategie niets om op te sturen.
  // @ai-sync: components/carve/AppStoreButton.tsx
  // @ai-sync: components/carve/MarketingHero.tsx
  // @ai-sync: components/carve/PricingHub.tsx
  | 'app_store_click';

type EventProps = {
  // Waitlist + app-pagina
  // Marketingpagina: 'hero' is de knop bovenaan, 'close' de slot-knop, 'dock' de
  // vaste knop op mobiel en 'header' de balk die op desktop inschuift.
  source?: 'hero' | 'close' | 'dock' | 'header' | 'footer' | 'demo' | 'pricing' | 'marketing_hero' | 'showcase';
  error_type?: string;

  // Wiki
  article_slug?: string;
  category?: string;
  search_query?: string;

  // Dashboard
  workout_type?: string;
  achievement_type?: string;

  // Homepage-trechter
  domain?: string;
};

let warnedAboutMissingGtag = false;

/**
 * Meet een gebeurtenis in GA4.
 *
 * @ai-why: Er zit geen advertentie-toewijzing meer in deze functie. Tot 2026-09-08
 * las `recordAdAttribution()` de gclid en utm-parameters uit de URL en plakte die als
 * props aan elk event. Dat bestond puur omdat Plausible een bezoek met alleen een
 * `gclid` niet van organisch google.com-verkeer kon onderscheiden. GA4 leest gclid en
 * utm zelf en koppelt de sessie aan de campagne, dus dat handwerk is weg. Zet je ooit
 * een meetsysteem terug dat gclid niet begrijpt, dan komt dit probleem terug.
 */
export function track(eventName: EventName, props?: EventProps): void {
  if (typeof window === 'undefined') return;

  if (window.gtag) {
    try {
      window.gtag('event', eventName, { ...props });
    } catch (error) {
      console.error('Analytics error:', error);
    }
    return;
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('📊 Analytics Event:', eventName, { ...props });
    return;
  }

  // @ai-why: Dit blok bestaat omdat de stille variant ons maanden heeft gekost. De
  // meettag laadde in productie niet en élke track()-aanroep viel op de grond terwijl
  // de code eruitzag alsof er gemeten werd. "Niemand klikt" was toen niet te
  // onderscheiden van "niemand meet". Eén waarschuwing per sessie maakt dat verschil
  // zichtbaar zonder de console vol te schrijven.
  // @ai-sync: app/layout.tsx
  if (!warnedAboutMissingGtag) {
    warnedAboutMissingGtag = true;
    console.warn(
      '[analytics] gtag is niet geladen; dit event wordt weggegooid. ' +
        'Zet NEXT_PUBLIC_GA_MEASUREMENT_ID in de omgeving van deze deploy.',
    );
  }
}

declare global {
  interface Window {
    // @ai-why: Losse signatuur in plaats van een union per commando. gtag krijgt
    // 'js', 'config', 'event' en 'consent' met elk een andere vorm, en een precieze
    // overload-lijst levert hier alleen ruis op: de aanroepen staan op drie plekken
    // en zijn allemaal door een test gedekt.
    // @ai-sync: lib/consent.ts
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}
