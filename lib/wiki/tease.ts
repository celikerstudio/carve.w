import fs from 'node:fs';
import path from 'node:path';
import { categoryByName } from './catalog';
import { parseArticleFile, type ArticleTease } from './source-file';

/**
 * De `tease` uit het bronbestand van een artikel (TDR-0017 §8), of `undefined`.
 *
 * @ai-why: Uit het bestand en niet uit de database. `wiki_articles` heeft er geen kolom voor, en een
 *   migratie in Carve-AI voor een zin die alleen het web toont is te veel. Het bestand staat in
 *   dezelfde repo, dus een tease aanpassen is een push.
 * @ai-gotcha: Op Vercel bestaat het bestand alleen in de functie als next.config.ts het meeneemt
 *   (`outputFileTracingIncludes`). Zonder dat valt een ververste pagina stil terug op de zin per
 *   categorie.
 * @ai-sync: next.config.ts (outputFileTracingIncludes voor content/wiki)
 */
export function articleTease(slug: string, category: string): ArticleTease | undefined {
  const cat = categoryByName(category);
  if (!cat) return undefined;
  const file = path.join(process.cwd(), 'content/wiki', cat.slug, `${slug}.md`);
  try {
    return parseArticleFile(slug, fs.readFileSync(file, 'utf8')).tease;
  } catch {
    return undefined;
  }
}
