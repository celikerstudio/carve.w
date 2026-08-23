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
  | 'demo_to_signup';

type EventProps = {
  // Waitlist
  source?: 'hero' | 'footer' | 'demo';
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

/**
 * Track a custom event in Plausible
 * Falls back to console.log in development or when Plausible is not configured
 */
export function track(eventName: EventName, props?: EventProps): void {
  // In production with Plausible configured
  if (typeof window !== 'undefined' && window.plausible) {
    try {
      window.plausible(eventName, { props });
    } catch (error) {
      console.error('Analytics error:', error);
    }
    return;
  }

  // Development fallback: log to console
  if (process.env.NODE_ENV === 'development') {
    console.log('📊 Analytics Event:', eventName, props || {});
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
