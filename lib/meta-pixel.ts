/**
 * De Meta-pixel (Facebook/Instagram-advertenties).
 *
 * Setup:
 * 1. Maak een pixel aan in Meta Events Manager en koppel hem aan het advertentieaccount
 * 2. Zet het pixel-ID als NEXT_PUBLIC_META_PIXEL_ID in de omgeving van de deploy
 * 3. Maak in Events Manager een aangepaste conversie op het event `AppStoreClick`,
 *    anders staat het event er wel maar kun je er geen campagne op laten optimaliseren
 *
 * @ai-context: Deze pixel bestaat om één reden: zonder conversiesignaal kan Meta alleen
 * op klikken optimaliseren, en dan koopt het de goedkoopste klikkers in plaats van
 * mensen die downloaden. `AppStoreClick` is het dichtste bij een install dat we vanaf de
 * website kunnen meten. Het échte signaal is een install via de Meta-SDK in de iOS-app;
 * zodra die er is, is dit de tweede keus en niet meer de enige.
 *
 * @ai-sync: lib/analytics.ts (track() geeft gemapte events hierheen door)
 * @ai-sync: components/analytics/meta-pixel.tsx
 */

import type { EventName } from './analytics';

export type MetaEventName = 'AppStoreClick';

export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

/**
 * Welke GA4-events ook naar Meta gaan.
 *
 * @ai-why: Een witte lijst en geen doorgeefluik. Alles wat hierin staat wordt naar een
 * advertentieplatform gestuurd en een jaar bewaard, dus de standaard is "gaat niet mee".
 * `wiki_article_view` en de dashboard-events zeggen Meta niets en horen dus nergens.
 * Zet je hier een event bij, vraag dan eerst of het in de privacyverklaring gedekt is.
 * @ai-sync: app/privacy/page.tsx
 */
const META_EVENTS: Partial<Record<EventName, MetaEventName>> = {
  app_store_click: 'AppStoreClick',
};

export function metaEventFor(name: EventName): MetaEventName | undefined {
  return META_EVENTS[name];
}

/**
 * Meet een gebeurtenis op de Meta-pixel.
 *
 * @ai-why: Altijd `trackCustom` en nooit `track`. Meta's standaardevents (Purchase, Lead,
 * CompleteRegistration) hebben een vaste betekenis die adverteerders én Meta's modellen
 * delen; er "App Store-klik" in proppen omdat het makkelijker in te stellen is vervuilt
 * je eigen data en die van niemand anders is daarmee geholpen. Een aangepaste conversie
 * op `AppStoreClick` is één handeling in Events Manager en daarna net zo goed te
 * optimaliseren.
 *
 * @ai-gotcha: Anders dan bij gtag is een ontbrekende fbq hier géén fout. De pixel laadt
 * alleen na toestemming, dus voor iedereen die de banner weigert bestaat `window.fbq`
 * niet en hoort deze functie stil niets te doen. Ga hier dus niet waarschuwen zoals
 * lib/analytics.ts dat wel doet.
 */
export function trackMeta(name: MetaEventName, props?: Record<string, unknown>): void {
  if (typeof window === 'undefined') return;
  if (!window.fbq) return;

  try {
    window.fbq('trackCustom', name, { ...props });
  } catch (error) {
    console.error('Meta pixel error:', error);
  }
}

/**
 * @ai-why: `_fbp` is de cookie die de pixel zelf zet; `_fbc` bewaart de klik-id waarmee
 * Meta een bezoek aan een advertentie koppelt. Beide horen bij de toestemming, dus bij
 * het intrekken gaan ze allebei weg. Sla je `_fbc` over, dan blijft de advertentieklik
 * nog maanden op het apparaat staan.
 */
const META_COOKIES = ['_fbp', '_fbc'];

/**
 * Zet de pixel stil nadat de bezoeker zijn toestemming intrekt.
 *
 * @ai-why: Het verwijderen van de `<Script>`-tag is niet genoeg. Die injecteert
 * `window.fbq` en dat blijft daarna gewoon staan, dus trackMeta() zou doorvuren tot de
 * bezoeker toevallig herlaadt. Dat is meten na een expliciet nee.
 *
 * @ai-gotcha: Het al geladen `fbevents.js` blijft tot een herlading in de pagina staan.
 * Weghalen van het scripttag draait de neveneffecten niet terug, dus het gaat er hier om
 * dat er niets meer verstuurd wordt en dat de cookies weg zijn. Wil je harder ingrijpen,
 * dan is een `location.reload()` na het intrekken de enige echte garantie.
 */
export function disableMetaPixel(): void {
  if (typeof window === 'undefined') return;

  delete window.fbq;
  delete window._fbq;

  if (typeof document === 'undefined') return;
  for (const name of META_COOKIES) {
    document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT`;
  }
}

/**
 * De basiscode van Meta, ongewijzigd op het pixel-ID na.
 *
 * @ai-why: Deze string staat hier en niet in de component, zodat het snippet één plek
 * heeft en de component alleen nog over toestemming gaat. Verander er niets aan: dit is
 * letterlijk wat Events Manager uitgeeft, en een "opgeschoonde" versie is precies hoe je
 * een pixel krijgt die in de console werkt maar niet in Meta's rapportage aankomt.
 *
 * @ai-gotcha: De `PageView` zit in dit snippet en niet in trackMeta(). Hij hoort één
 * keer per lading te vuren op het moment dat de pixel initialiseert; verplaats je hem,
 * dan telt hij dubbel of helemaal niet.
 */
export function metaPixelSnippet(pixelId: string): string {
  return `!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${pixelId}');
fbq('track', 'PageView');`;
}

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
  }
}
