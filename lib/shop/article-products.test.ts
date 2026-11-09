import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { ARTICLE_PRODUCTS } from './article-products';
import { productQuery } from './storefront';
import { WIKI_CATEGORIES } from '@/lib/wiki/catalog';

describe('ARTICLE_PRODUCTS (TDR-0019 §3)', () => {
  it('hangt alleen producten onder artikelen die bestaan', () => {
    for (const slug of Object.keys(ARTICLE_PRODUCTS)) {
      const found = WIKI_CATEGORIES.some((c) => existsSync(join(process.cwd(), 'content/wiki', c.slug, `${slug}.md`)));
      expect(found, `content/wiki/*/${slug}.md`).toBe(true);
    }
  });

  it('bevat alleen geldige handles, anders verdwijnt het blok stil', () => {
    for (const handles of Object.values(ARTICLE_PRODUCTS)) expect(() => productQuery(handles)).not.toThrow();
  });

  it('noemt geen product twee keer onder hetzelfde artikel', () => {
    for (const [slug, handles] of Object.entries(ARTICLE_PRODUCTS)) {
      expect(new Set(handles).size, slug).toBe(handles.length);
    }
  });
});
