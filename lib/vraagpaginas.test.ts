import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { APP_OMSCHRIJVING } from '@/lib/marketing-copy';
import { vraagFaqJsonLd, marketingJsonLd } from '@/lib/marketing-seo';
import { VRAAGPAGINAS, vraagpagina } from '@/lib/vraagpaginas';
import sitemap from '@/app/sitemap';

// @ai-why: De sitemap haalt sinds TDR-0016 ook de wiki-artikelen op uit Supabase. Een test
//   hoort niet op het netwerk te leunen; hier telt alleen dat de vraagpagina's erin staan.
vi.mock('@/lib/wiki/articles', () => ({ listArticles: async () => [] }));

function teksten(waarde: unknown, pad = ''): [string, unknown][] {
  if (Array.isArray(waarde)) {
    return waarde.flatMap((item, i) => teksten(item, `${pad}.${i}`));
  }
  if (typeof waarde === 'object' && waarde !== null) {
    return Object.entries(waarde).flatMap(([sleutel, item]) => teksten(item, pad ? `${pad}.${sleutel}` : sleutel));
  }
  return [[pad, waarde]];
}

describe('VRAAGPAGINAS', () => {
  // @ai-why: TDR-0014 legt het aantal vast op drie. Een vierde hoort een eigen
  //   afweging te krijgen (een vraag uit de meting waar Carve een specifiek antwoord
  //   op heeft), niet mee te liften omdat het patroon er nu is. Deze test maakt dat
  //   een bewuste wijziging in plaats van een ongemerkte.
  it('zijn er precies drie, elk met een uniek pad onder /nl/', () => {
    expect(VRAAGPAGINAS).toHaveLength(3);
    const paden = VRAAGPAGINAS.map((p) => p.pad);
    expect(new Set(paden).size).toBe(3);
    for (const pagina of VRAAGPAGINAS) {
      expect(pagina.pad).toBe(`/nl/${pagina.slug}`);
      expect(pagina.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    }
  });

  it('botst niet met de marketingpagina op /nl/app', () => {
    expect(VRAAGPAGINAS.map((p) => p.slug)).not.toContain('app');
  });

  // @ai-why: Dit is waarom de pagina's bestaan. Een model citeert de alinea onder
  //   de kop, en in de nulmeting kende Gemini "Carve AI" alleen als enterprise-tool en
  //   ski-coach. Opent een antwoord met iets anders dan de vaste omschrijving, dan
  //   doet de pagina precies het ene ding niet waarvoor hij er staat.
  it('opent elk antwoord met de vaste omschrijving van Carve AI', () => {
    for (const pagina of VRAAGPAGINAS) {
      expect(pagina.antwoord.startsWith(APP_OMSCHRIJVING.nl), pagina.slug).toBe(true);
    }
  });

  it('heeft nergens een lege tekst', () => {
    for (const pagina of VRAAGPAGINAS) {
      for (const [pad, waarde] of teksten(pagina)) {
        if (waarde === undefined) continue;
        expect(typeof waarde, `${pagina.slug}.${pad}`).toBe('string');
        expect(String(waarde).trim(), `${pagina.slug}.${pad}`).not.toBe('');
      }
    }
  });

  it('heeft per pagina vijf vragen, en de vergelijking noemt minstens twee andere apps', () => {
    for (const pagina of VRAAGPAGINAS) {
      expect(pagina.faq, pagina.slug).toHaveLength(5);
      expect(pagina.vergelijking.apps.length, pagina.slug).toBeGreaterThanOrEqual(2);
      expect(pagina.vergelijking.apps.map((a) => a.naam), pagina.slug).not.toContain('Carve AI');
    }
  });

  // @ai-why: De em-dash is de herkenbaarste AI-tell, en deze teksten zijn juist
  //   bedoeld om als mensentaal geciteerd te worden. Een streepje in een bereik mag
  //   (dat is een en-dash of een koppelteken), het gaat om de — die zinnen aan elkaar plakt.
  it('gebruikt geen em-dash', () => {
    for (const pagina of VRAAGPAGINAS) {
      for (const [pad, waarde] of teksten(pagina)) {
        expect(String(waarde ?? ''), `${pagina.slug}.${pad}`).not.toContain('—');
      }
    }
  });

  it('verwijst alleen naar screenshots die bestaan', () => {
    for (const pagina of VRAAGPAGINAS) {
      for (const stap of pagina.stappen) {
        if (!stap.screenshot) continue;
        expect(existsSync(join(process.cwd(), 'public', stap.screenshot)), `${pagina.slug}: ${stap.screenshot}`).toBe(true);
      }
    }
  });

  it('vindt een pagina op zijn slug en niets op een onbekende', () => {
    expect(vraagpagina(VRAAGPAGINAS[0].slug)).toBe(VRAAGPAGINAS[0]);
    expect(vraagpagina('bestaat-niet')).toBeUndefined();
  });
});

describe('sitemap', () => {
  it('noemt elke vraagpagina', async () => {
    const urls = (await sitemap()).map((r) => new URL(r.url).pathname);
    for (const pagina of VRAAGPAGINAS) {
      expect(urls, pagina.pad).toContain(pagina.pad);
    }
  });
});

describe('structured data', () => {
  it('gebruikt op de marketingpagina dezelfde omschrijving als de vraagpagina\'s', () => {
    for (const taal of ['nl', 'en'] as const) {
      const data = marketingJsonLd(taal);
      expect(data.disambiguatingDescription).toBe(APP_OMSCHRIJVING[taal]);
      expect(data.description.startsWith(APP_OMSCHRIJVING[taal])).toBe(true);
    }
  });

  it('zet de vijf vragen van een pagina als FAQPage neer', () => {
    const pagina = VRAAGPAGINAS[0];
    const data = vraagFaqJsonLd(pagina);
    expect(data['@type']).toBe('FAQPage');
    expect(data.mainEntity).toHaveLength(5);
    expect(data.mainEntity[0]).toEqual({
      '@type': 'Question',
      name: pagina.faq[0].vraag,
      acceptedAnswer: { '@type': 'Answer', text: pagina.faq[0].antwoord },
    });
  });
});
