#!/usr/bin/env tsx
/**
 * Controleert de tips van de dag in `content/tips/` (Carve-AI ADR-104).
 *
 *   pnpm wiki:tips            alle bestanden, plus hoeveel tips er per categorie zijn
 *   pnpm wiki:tips creatine   alleen deze
 *
 * Stopt met code 1 bij een fout. `pnpm sync-wiki` draait dezelfde controle en weigert ook.
 */
import { lintTipFile } from '../../lib/wiki/tips';
import { readArticleFiles, readTipFiles } from './files';

function main() {
  const only = process.argv.slice(2).filter((a) => !a.startsWith('--'));
  const articles = readArticleFiles().map((a) => a.file);
  const slugs = new Set(articles.map((a) => a.slug));
  const category = new Map(articles.map((a) => [a.slug, a.category]));
  const files = readTipFiles().filter((f) => !only.length || only.includes(f.slug));

  let failed = 0;
  const perCategory = new Map<string, number>();
  for (const { file, slug, error } of files) {
    const errors = error ? [error] : lintTipFile(file, slug, slugs);
    if (errors.length) {
      failed++;
      console.log(`✗ ${slug}`);
      errors.forEach((e) => console.log(`    ${e}`));
    } else if (only.length) {
      console.log(`✓ ${slug} (${file.tips.length} tips)`);
    }
    const cat = category.get(file.article) ?? '?';
    perCategory.set(cat, (perCategory.get(cat) ?? 0) + file.tips.length);
  }

  const total = [...perCategory.values()].reduce((a, b) => a + b, 0);
  const myths = files.reduce((n, f) => n + f.file.tips.filter((t) => t.kind === 'myth').length, 0);
  if (!only.length) {
    const without = articles.filter((a) => !files.some((f) => f.slug === a.slug)).map((a) => a.slug);
    console.log(`\nPer categorie: ${[...perCategory].map(([c, n]) => `${c} ${n}`).join(', ')}`);
    if (without.length) console.log(`Zonder tips (${without.length}): ${without.join(', ')}`);
  }
  console.log(`\n${files.length} bestanden, ${total} tips (${myths} mythes, ${total - myths} feiten), ${failed} met fouten.`);
  console.log(`Dat is ${total} dagen voor er iets terugkomt.`);
  process.exit(failed ? 1 : 0);
}

main();
