import { describe, expect, it } from 'vitest';
import { articleJsonLd, isIndexable, wikiMetadata } from './seo';

const base = {
  title: 'Protein',
  summary: 'How much you need.',
  href: '/wiki/nutrition/protein',
  category: 'Nutrition',
  categoryHref: '/wiki/nutrition',
  updatedAt: '2026-10-20T10:00:00Z',
};

describe('indexregel (TDR-0017 §2)', () => {
  it('indexeert alleen een beoordeeld artikel met minstens één bron', () => {
    expect(isIndexable({ reviewed: true, sources: 1 })).toBe(true);
    expect(isIndexable({ reviewed: true, sources: 0 })).toBe(false);
    expect(isIndexable({ reviewed: false, sources: 6 })).toBe(false);
  });

  it('zet een niet-indexeerbaar artikel op noindex maar laat links volgen', () => {
    const meta = wikiMetadata({ title: 'Protein', description: 'x', path: '/wiki/nutrition/protein', index: false });
    expect(meta.robots).toEqual({ index: false, follow: true });
  });

  it('laat robots weg op een indexeerbare pagina, zodat de standaard van de site geldt', () => {
    expect(wikiMetadata({ title: 'Protein', description: 'x', path: '/wiki/nutrition/protein' }).robots).toBeUndefined();
  });
});

describe('auteur in de structured data', () => {
  it('noemt Furkan als auteur van een beoordeeld artikel, met een link naar /about', () => {
    const [article] = articleJsonLd({ ...base, reviewed: true });
    expect(article.author).toMatchObject({ '@type': 'Person', name: 'Furkan Celiker' });
    expect(String((article.author as { url: string }).url)).toMatch(/\/about$/);
  });

  it('zet geen persoon onder een artikel dat hij niet heeft gelezen', () => {
    const [article] = articleJsonLd({ ...base, reviewed: false });
    expect(article.author).toMatchObject({ '@type': 'Organization', name: 'Carve' });
  });
});
