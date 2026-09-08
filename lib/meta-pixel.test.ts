import { afterEach, describe, expect, it, vi } from 'vitest';

type FbqMock = ReturnType<typeof vi.fn>;

async function loadMetaPixel() {
  vi.resetModules();
  return import('./meta-pixel');
}

function setWindow(fbq: FbqMock | undefined) {
  (globalThis as { window?: unknown }).window = fbq ? { fbq } : {};
}

afterEach(() => {
  delete (globalThis as { window?: unknown }).window;
  delete (globalThis as { document?: unknown }).document;
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe('trackMeta', () => {
  it('stuurt het event als trackCustom door naar fbq', async () => {
    const fbq = vi.fn();
    setWindow(fbq);

    const { trackMeta } = await loadMetaPixel();
    trackMeta('AppStoreClick', { source: 'hero' });

    expect(fbq).toHaveBeenCalledWith('trackCustom', 'AppStoreClick', { source: 'hero' });
  });

  it('stuurt een leeg props-object als de aanroeper niets meegeeft', async () => {
    const fbq = vi.fn();
    setWindow(fbq);

    const { trackMeta } = await loadMetaPixel();
    trackMeta('AppStoreClick');

    expect(fbq).toHaveBeenCalledWith('trackCustom', 'AppStoreClick', {});
  });

  /**
   * @ai-why: Deze test bewaakt het verschil met lib/analytics.ts. Daar is een ontbrekende
   * gtag een fout die je wilt zien, hier is een ontbrekende fbq de normale toestand voor
   * iedereen die de cookiebanner heeft geweigerd. Een waarschuwing zou dan bij elke
   * weigeraar in de console staan en het echte probleem (verkeerd pixel-ID) verbergen.
   */
  it('waarschuwt niet als de pixel niet geladen is, want dat is de normale toestand na weigeren', async () => {
    setWindow(undefined);
    const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const { trackMeta } = await loadMetaPixel();

    expect(() => trackMeta('AppStoreClick', { source: 'dock' })).not.toThrow();
    expect(consoleWarn).not.toHaveBeenCalled();
  });

  it('laat een fout uit fbq niet doorslaan naar de aanroeper', async () => {
    const fbq = vi.fn(() => {
      throw new Error('pixel geblokkeerd door adblocker');
    });
    setWindow(fbq);
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { trackMeta } = await loadMetaPixel();

    expect(() => trackMeta('AppStoreClick', { source: 'hero' })).not.toThrow();
    expect(consoleError).toHaveBeenCalled();
  });

  it('doet niets op de server, waar window niet bestaat', async () => {
    delete (globalThis as { window?: unknown }).window;

    const { trackMeta } = await loadMetaPixel();

    expect(() => trackMeta('AppStoreClick')).not.toThrow();
  });
});

/**
 * @ai-why: "Ik accepteer, ik bedenk me" is normaal gedrag en geen randgeval. Zonder deze
 * functie blijft `window.fbq` bestaan na het intrekken en vuurt trackMeta() vrolijk door
 * tot de bezoeker toevallig de pagina herlaadt. Dat is precies de situatie waar het hele
 * toestemmingssysteem voor bestaat, dus die mag niet stil misgaan.
 */
describe('disableMetaPixel', () => {
  function setWindowAndDocument(fbq: FbqMock, cookie = '') {
    (globalThis as { window?: unknown }).window = { fbq, _fbq: {} };
    (globalThis as { document?: unknown }).document = { cookie };
  }

  it('haalt fbq weg zodat er niets meer verstuurd wordt', async () => {
    const fbq = vi.fn();
    setWindowAndDocument(fbq);

    const { disableMetaPixel, trackMeta } = await loadMetaPixel();
    disableMetaPixel();
    trackMeta('AppStoreClick', { source: 'hero' });

    expect(window.fbq).toBeUndefined();
    expect(fbq).not.toHaveBeenCalled();
  });

  /**
   * @ai-gotcha: `document.cookie` is in een echte browser een accessor die bij elke
   * toewijzing één cookie bijzet, niet een string die je overschrijft. Een nep-document
   * met een gewone property houdt dus alleen de laatste toewijzing over, en dan test je
   * per ongeluk dat er precies één cookie verwijderd is. Vandaar de setter die alles
   * opvangt.
   */
  it('laat elke Meta-cookie verlopen', async () => {
    const writes: string[] = [];
    (globalThis as { window?: unknown }).window = { fbq: vi.fn(), _fbq: {} };
    (globalThis as { document?: unknown }).document = {
      set cookie(value: string) {
        writes.push(value);
      },
      get cookie() {
        return writes.join('; ');
      },
    };

    const { disableMetaPixel } = await loadMetaPixel();
    disableMetaPixel();

    expect(writes).toHaveLength(2);
    expect(writes[0]).toContain('_fbp=;');
    expect(writes[1]).toContain('_fbc=;');
    for (const write of writes) expect(write).toContain('Expires=Thu, 01 Jan 1970');
  });

  it('doet niets op de server, waar window niet bestaat', async () => {
    delete (globalThis as { window?: unknown }).window;
    delete (globalThis as { document?: unknown }).document;

    const { disableMetaPixel } = await loadMetaPixel();

    expect(() => disableMetaPixel()).not.toThrow();
  });
});

describe('metaEventFor', () => {
  it('vertaalt app_store_click naar het Meta-event', async () => {
    const { metaEventFor } = await loadMetaPixel();

    expect(metaEventFor('app_store_click')).toBe('AppStoreClick');
  });

  /**
   * @ai-why: Niet elk GA4-event hoort bij Meta. De pixel stuurt gedrag naar een
   * advertentieplatform, dus alles wat er niet in hoeft gaat er ook niet in. Deze test
   * legt vast dat de lijst een witte lijst is en geen doorgeefluik.
   */
  it('vertaalt een event dat Meta niet nodig heeft naar niets', async () => {
    const { metaEventFor } = await loadMetaPixel();

    expect(metaEventFor('wiki_article_view')).toBeUndefined();
  });
});
