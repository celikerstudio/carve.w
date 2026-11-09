import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { SHOP_CHALLENGES, starMarks } from './challenges';
import { productQuery } from './storefront';
import { WIKI_CATEGORIES } from '@/lib/wiki/catalog';

describe('SHOP_CHALLENGES (TDR-0019 §7)', () => {
  it('linkt alleen naar artikelen die bestaan', () => {
    for (const c of SHOP_CHALLENGES) {
      const found = WIKI_CATEGORIES.some((cat) => existsSync(join(process.cwd(), 'content/wiki', cat.slug, `${c.article}.md`)));
      expect(found, c.article).toBe(true);
    }
  });

  it('heeft unieke ids van alleen kleine letters en streepjes, voor utm en de App Store-campagne', () => {
    const ids = SHOP_CHALLENGES.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^[a-z0-9-]+$/);
  });

  it('heeft drie oplopende sterren, of geen als de challenge nog niet in de app staat', () => {
    for (const c of SHOP_CHALLENGES) {
      if (c.stars === null) continue;
      expect(c.stars).toHaveLength(3);
      expect(c.stars[0]).toBeLessThan(c.stars[1]);
      expect(c.stars[1]).toBeLessThan(c.stars[2]);
    }
  });

  it('bevat alleen geldige handles', () => {
    for (const c of SHOP_CHALLENGES) if (c.products.length) expect(() => productQuery(c.products)).not.toThrow();
  });
});

describe('starMarks', () => {
  it('zet de drempels op een balk die bij goud eindigt', () => {
    expect(starMarks([5, 20, 50])).toEqual([10, 40, 100]);
    expect(starMarks([10, 30, 60])).toEqual([17, 50, 100]);
  });
});
