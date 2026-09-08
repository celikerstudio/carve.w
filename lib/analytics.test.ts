import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

type GtagMock = ReturnType<typeof vi.fn>;

/**
 * @ai-why: Elke test importeert de module opnieuw via resetModules(). `track()` houdt
 * bij of de "gtag ontbreekt"-waarschuwing al is gegeven, en die vlag leeft op
 * moduleniveau. Zonder verse import lekt de vlag van de ene test naar de volgende en
 * slaagt de "waarschuwt precies één keer"-test ook als de implementatie stuk is.
 */
async function loadAnalytics() {
  vi.resetModules();
  return import('./analytics');
}

function setGtag(fn: GtagMock | undefined) {
  (globalThis as { window?: unknown }).window = fn ? { gtag: fn } : {};
}

function setGtagAndFbq(gtag: GtagMock, fbq: GtagMock) {
  (globalThis as { window?: unknown }).window = { gtag, fbq };
}

beforeEach(() => {
  vi.stubEnv('NODE_ENV', 'production');
});

afterEach(() => {
  delete (globalThis as { window?: unknown }).window;
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe('track', () => {
  it('stuurt het event met zijn props door naar gtag', async () => {
    const gtag = vi.fn();
    setGtag(gtag);

    const { track } = await loadAnalytics();
    track('app_store_click', { source: 'hero' });

    expect(gtag).toHaveBeenCalledWith('event', 'app_store_click', { source: 'hero' });
  });

  it('stuurt een leeg props-object als de aanroeper niets meegeeft', async () => {
    const gtag = vi.fn();
    setGtag(gtag);

    const { track } = await loadAnalytics();
    track('waitlist_signup_success');

    expect(gtag).toHaveBeenCalledWith('event', 'waitlist_signup_success', {});
  });

  it('laat een fout uit gtag niet doorslaan naar de aanroeper', async () => {
    const gtag = vi.fn(() => {
      throw new Error('tag geblokkeerd door adblocker');
    });
    setGtag(gtag);
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { track } = await loadAnalytics();

    expect(() => track('app_store_click', { source: 'dock' })).not.toThrow();
    expect(consoleError).toHaveBeenCalled();
  });

  it('waarschuwt precies één keer als gtag ontbreekt, hoe vaak je ook meet', async () => {
    setGtag(undefined);
    const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const { track } = await loadAnalytics();
    track('app_store_click', { source: 'hero' });
    track('app_store_click', { source: 'dock' });
    track('home_card_click');

    expect(consoleWarn).toHaveBeenCalledTimes(1);
    expect(consoleWarn.mock.calls[0]?.[0]).toContain('NEXT_PUBLIC_GA_MEASUREMENT_ID');
  });

  it('logt naar de console in development in plaats van te waarschuwen', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    setGtag(undefined);
    const consoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});
    const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const { track } = await loadAnalytics();
    track('demo_message_sent');

    expect(consoleLog).toHaveBeenCalled();
    expect(consoleWarn).not.toHaveBeenCalled();
  });

  it('doet niets op de server, waar window niet bestaat', async () => {
    delete (globalThis as { window?: unknown }).window;
    const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const { track } = await loadAnalytics();

    expect(() => track('wiki_article_view', { article_slug: 'squat' })).not.toThrow();
    expect(consoleWarn).not.toHaveBeenCalled();
  });
});

/**
 * @ai-why: Deze tests bestaan omdat één aanroep twee platforms moet bedienen. Zou de
 * Meta-pixel een eigen aanroep op de knop krijgen, dan vergeet de volgende die bij het
 * volgende event, en dat merk je pas als een campagne al een week op niets optimaliseert.
 * @ai-sync: lib/meta-pixel.ts
 */
describe('track, doorgifte naar de Meta-pixel', () => {
  it('vuurt een gemapt event ook op de pixel', async () => {
    const gtag = vi.fn();
    const fbq = vi.fn();
    setGtagAndFbq(gtag, fbq);

    const { track } = await loadAnalytics();
    track('app_store_click', { source: 'hero' });

    expect(gtag).toHaveBeenCalledWith('event', 'app_store_click', { source: 'hero' });
    expect(fbq).toHaveBeenCalledWith('trackCustom', 'AppStoreClick', { source: 'hero' });
  });

  it('laat een event dat Meta niet nodig heeft ongemoeid', async () => {
    const gtag = vi.fn();
    const fbq = vi.fn();
    setGtagAndFbq(gtag, fbq);

    const { track } = await loadAnalytics();
    track('wiki_article_view', { article_slug: 'squat' });

    expect(gtag).toHaveBeenCalled();
    expect(fbq).not.toHaveBeenCalled();
  });

  it('meet gewoon door in GA4 als de pixel niet geladen is', async () => {
    const gtag = vi.fn();
    setGtag(gtag);

    const { track } = await loadAnalytics();

    expect(() => track('app_store_click', { source: 'dock' })).not.toThrow();
    expect(gtag).toHaveBeenCalled();
  });
});
