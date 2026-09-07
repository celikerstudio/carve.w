import { afterEach, describe, expect, it, vi } from 'vitest';

type StorageStub = {
  getItem: ReturnType<typeof vi.fn>;
  setItem: ReturnType<typeof vi.fn>;
};

function setWindow(options: { stored?: string | null; throws?: boolean; gtag?: ReturnType<typeof vi.fn> }) {
  const storage: StorageStub = {
    getItem: vi.fn(() => {
      if (options.throws) throw new Error('opslag geblokkeerd');
      return options.stored ?? null;
    }),
    setItem: vi.fn(() => {
      if (options.throws) throw new Error('opslag geblokkeerd');
    }),
  };

  (globalThis as { window?: unknown }).window = {
    localStorage: storage,
    gtag: options.gtag,
  };

  return storage;
}

afterEach(() => {
  delete (globalThis as { window?: unknown }).window;
  vi.restoreAllMocks();
});

describe('readConsent', () => {
  it('geeft null als er nog niets gekozen is', async () => {
    setWindow({ stored: null });
    const { readConsent } = await import('./consent');
    expect(readConsent()).toBeNull();
  });

  it('geeft de eerder gemaakte keuze terug', async () => {
    setWindow({ stored: 'granted' });
    const { readConsent } = await import('./consent');
    expect(readConsent()).toBe('granted');
  });

  it('behandelt een onbekende opgeslagen waarde als geen keuze', async () => {
    setWindow({ stored: 'misschien' });
    const { readConsent } = await import('./consent');
    expect(readConsent()).toBeNull();
  });

  it('geeft null als de opslag geblokkeerd is in plaats van te crashen', async () => {
    setWindow({ throws: true });
    const { readConsent } = await import('./consent');
    expect(readConsent()).toBeNull();
  });

  it('geeft null op de server', async () => {
    delete (globalThis as { window?: unknown }).window;
    const { readConsent } = await import('./consent');
    expect(readConsent()).toBeNull();
  });
});

describe('writeConsent', () => {
  it('slaat de keuze op en zet alle vier de Consent Mode-signalen op granted', async () => {
    const gtag = vi.fn();
    const storage = setWindow({ gtag });

    const { writeConsent, CONSENT_STORAGE_KEY } = await import('./consent');
    writeConsent('granted');

    expect(storage.setItem).toHaveBeenCalledWith(CONSENT_STORAGE_KEY, 'granted');
    expect(gtag).toHaveBeenCalledWith('consent', 'update', {
      ad_storage: 'granted',
      ad_user_data: 'granted',
      ad_personalization: 'granted',
      analytics_storage: 'granted',
    });
  });

  it('zet bij weigeren alle vier de signalen op denied', async () => {
    const gtag = vi.fn();
    setWindow({ gtag });

    const { writeConsent } = await import('./consent');
    writeConsent('denied');

    expect(gtag).toHaveBeenCalledWith('consent', 'update', {
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: 'denied',
    });
  });

  /**
   * @ai-why: De volgorde is niet vrijblijvend. Weigert iemand terwijl de opslag
   * geblokkeerd is, dan moet Google alsnog te horen krijgen dat er geen toestemming
   * is. Een throw uit setItem die het consent-signaal tegenhoudt zou betekenen dat
   * we cookies blijven zetten na een expliciete weigering.
   */
  it('meldt de keuze aan gtag ook als de opslag faalt', async () => {
    const gtag = vi.fn();
    setWindow({ gtag, throws: true });

    const { writeConsent } = await import('./consent');

    expect(() => writeConsent('denied')).not.toThrow();
    expect(gtag).toHaveBeenCalledWith('consent', 'update', expect.objectContaining({ ad_storage: 'denied' }));
  });

  it('crasht niet als gtag nog niet geladen is', async () => {
    setWindow({ gtag: undefined });
    const { writeConsent } = await import('./consent');
    expect(() => writeConsent('granted')).not.toThrow();
  });
});

/**
 * @ai-why: Deze groep dekt het gat waardoor toestemming bij een tweede bezoek
 * verdampte. De keuze staat dan in localStorage, maar Consent Mode staat na het laden
 * op `denied` en niemand vertelt Google dat de bezoeker allang ja heeft gezegd. De
 * banner blijft verborgen, dus de gebruiker ziet niets, en er wordt stilletjes niets
 * gemeten. Vandaar een aparte functie die alleen het signaal stuurt, zonder opslag.
 */
describe('applyConsent', () => {
  it('stuurt de signalen door zonder de opslag aan te raken', async () => {
    const gtag = vi.fn();
    const storage = setWindow({ gtag });

    const { applyConsent } = await import('./consent');
    applyConsent('granted');

    expect(gtag).toHaveBeenCalledWith('consent', 'update', {
      ad_storage: 'granted',
      ad_user_data: 'granted',
      ad_personalization: 'granted',
      analytics_storage: 'granted',
    });
    expect(storage.setItem).not.toHaveBeenCalled();
  });

  it('crasht niet als gtag nog niet geladen is', async () => {
    setWindow({ gtag: undefined });
    const { applyConsent } = await import('./consent');
    expect(() => applyConsent('denied')).not.toThrow();
  });
});

/**
 * @ai-why: De banner en het knopje in de privacyverklaring lezen allebei dezelfde
 * keuze, en op /privacy staan ze tegelijk op de pagina. Zonder abonnement blijft de
 * banner staan nadat je in de verklaring accepteert. Deze store voedt bovendien
 * `useSyncExternalStore`, dat een echte subscribe-functie vereist.
 */
describe('subscribeConsent', () => {
  it('meldt een nieuwe keuze aan alle luisteraars', async () => {
    vi.resetModules();
    setWindow({ gtag: vi.fn() });

    const { subscribeConsent, writeConsent } = await import('./consent');
    const first = vi.fn();
    const second = vi.fn();
    subscribeConsent(first);
    subscribeConsent(second);

    writeConsent('granted');

    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(1);
  });

  it('stopt met melden na afmelden', async () => {
    vi.resetModules();
    setWindow({ gtag: vi.fn() });

    const { subscribeConsent, writeConsent } = await import('./consent');
    const listener = vi.fn();
    const unsubscribe = subscribeConsent(listener);

    unsubscribe();
    writeConsent('denied');

    expect(listener).not.toHaveBeenCalled();
  });

  it('meldt niets bij het enkel toepassen van een bestaande keuze', async () => {
    vi.resetModules();
    setWindow({ gtag: vi.fn() });

    const { subscribeConsent, applyConsent } = await import('./consent');
    const listener = vi.fn();
    subscribeConsent(listener);

    applyConsent('granted');

    expect(listener).not.toHaveBeenCalled();
  });
});
