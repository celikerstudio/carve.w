/**
 * Analytics tracking using Plausible
 * Privacy-first analytics with no cookies or personal data collection
 *
 * Setup instructions:
 * 1. Create account at https://plausible.io
 * 2. Add domain (carve.wiki or your production domain)
 * 3. Add NEXT_PUBLIC_PLAUSIBLE_DOMAIN to .env.local
 * 4. Script is auto-loaded via layout.tsx
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

  // @ai-why: Advertentie-toewijzing. Plausible hangt utm-parameters al aan de sessie,
  // maar een doel dat zijn bron zélf draagt blijft kloppen als je later per campagne
  // wilt uitsplitsen zonder op het sessiefilter in het dashboard te leunen.
  // @ai-sync: components/analytics/ad-attribution.tsx
  utm_source?: string;
  utm_campaign?: string;
  paid_click?: 'yes';
};

// @ai-why: Google Ads' auto-tagging plakt alleen `gclid` achter je URL en géén
// utm-parameters. Plausible leest zo'n bezoek dan als verwijzing van google.com,
// precies zoals een organische treffer, en dan is betaald verkeer niet van gratis
// verkeer te onderscheiden. Daarom zetten we de utm-parameters met de hand op de
// advertentie (het veld "Final URL-achtervoegsel" in Google Ads Editor) en leggen we
// ze hier vast zodra iemand binnenkomt.
//
// @ai-why: `gclid` gaat wél de sessieopslag in maar níet naar Plausible. Elke klik
// heeft zijn eigen gclid, dus als property blaast hij de cardinaliteit op, en het is
// een identificator van één bezoeker. Naar Plausible gaat alleen `paid_click: 'yes'`
// plus de campagnenaam. De gclid blijft lokaal staan voor het geval we later
// conversies handmatig in Google Ads willen importeren.
//
// @ai-gotcha: sessionStorage en niet localStorage. De toewijzing hoort bij dít bezoek.
// Blijft hij een maand staan, dan krijgt iemand die over drie weken organisch
// terugkomt alsnog het label "uit de advertentie" en telt dezelfde klik twee keer.
const AD_ATTRIBUTION_KEY = 'carve_ad_attribution';

type AdAttribution = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  gclid?: string;
};

/**
 * Legt de advertentieherkomst van dit bezoek vast. Veilig om vaker aan te roepen:
 * een pagina zónder parameters laat staan wat de landingspagina al opsloeg.
 */
export function recordAdAttribution(): void {
  if (typeof window === 'undefined') return;

  try {
    const params = new URLSearchParams(window.location.search);
    const next: AdAttribution = {};

    for (const key of ['utm_source', 'utm_medium', 'utm_campaign'] as const) {
      const value = params.get(key);
      if (value) next[key] = value.slice(0, 80);
    }

    const gclid = params.get('gclid');
    if (gclid) next.gclid = gclid.slice(0, 200);

    // Geen parameters in de URL betekent "geen nieuws", niet "geen advertentie".
    if (Object.keys(next).length === 0) return;

    window.sessionStorage.setItem(AD_ATTRIBUTION_KEY, JSON.stringify(next));
  } catch {
    // Privémodus of geblokkeerde opslag. Dan meten we zonder toewijzing verder.
  }
}

function adAttributionProps(): EventProps {
  if (typeof window === 'undefined') return {};

  try {
    const raw = window.sessionStorage.getItem(AD_ATTRIBUTION_KEY);
    if (!raw) return {};

    const stored = JSON.parse(raw) as AdAttribution;
    const props: EventProps = {};
    if (stored.utm_source) props.utm_source = stored.utm_source;
    if (stored.utm_campaign) props.utm_campaign = stored.utm_campaign;
    if (stored.gclid) props.paid_click = 'yes';
    return props;
  } catch {
    return {};
  }
}

let warnedAboutMissingPlausible = false;

/**
 * Track a custom event in Plausible
 * Falls back to console.log in development or when Plausible is not configured
 */
export function track(eventName: EventName, props?: EventProps): void {
  // Een expliciete prop van de aanroeper wint van de opgeslagen toewijzing.
  const enriched: EventProps = { ...adAttributionProps(), ...props };

  if (typeof window !== 'undefined' && window.plausible) {
    try {
      window.plausible(eventName, { props: enriched });
    } catch (error) {
      console.error('Analytics error:', error);
    }
    return;
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('📊 Analytics Event:', eventName, enriched);
    return;
  }

  // @ai-why: Dit blok bestaat omdat de stille variant ons maanden heeft gekost.
  // `app/layout.tsx` laadt de Plausible-tag alleen als NEXT_PUBLIC_PLAUSIBLE_DOMAIN
  // gezet is, en die stond op 05-09-2026 nergens: niet in .env.local en niet in de
  // productie-HTML van carve.wiki. Élke track()-aanroep viel daardoor in productie
  // stil op de grond terwijl de code eruitzag alsof er gemeten werd, en "niemand
  // klikt" is dan niet te onderscheiden van "niemand meet". Eén waarschuwing per
  // sessie maakt dat verschil zichtbaar zonder de console vol te schrijven.
  // @ai-sync: app/layout.tsx
  if (!warnedAboutMissingPlausible) {
    warnedAboutMissingPlausible = true;
    console.warn(
      '[analytics] Plausible is niet geladen; dit event wordt weggegooid. ' +
        'Zet NEXT_PUBLIC_PLAUSIBLE_DOMAIN in de omgeving van deze deploy.',
    );
  }
}

/**
 * Track page views automatically (Plausible does this by default)
 * This is a no-op unless you need custom page view tracking
 */
export function trackPageView(url?: string): void {
  if (typeof window !== 'undefined' && window.plausible) {
    window.plausible('pageview', { props: { url: url || window.location.pathname } });
  }
}

// TypeScript declaration for Plausible global
declare global {
  interface Window {
    plausible?: (eventName: string, options?: { props?: Record<string, any> }) => void;
  }
}
