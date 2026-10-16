#!/usr/bin/env tsx
/**
 * Controleert de artikelen in `content/wiki/` voordat ze naar de database gaan (TDR-0017 §4-5).
 *
 *   pnpm wiki:check                 alle artikelen: opmaak, links, en elke bron live opgezocht
 *   pnpm wiki:check protein calories alleen deze
 *   pnpm wiki:check protein --fill   vult titel, auteurs, tijdschrift en jaar in bij bronnen die
 *                                    alleen een DOI of PMID hebben, en schrijft het bestand terug
 *   pnpm wiki:check protein --abstracts
 *                                    toont per bron de bewering naast de samenvatting uit PubMed
 *
 * Stopt met code 1 bij een fout. `pnpm sync-wiki` draait dezelfde opmaakcontrole en weigert ook.
 *
 * @ai-gotcha: `--fill` neemt de gegevens van de uitgever over. Het vult nooit een bron aan die
 *   niet gevonden wordt; die blijft een fout tot de DOI of PMID klopt of de bron weg is.
 */
import { lintArticle, listChecks, type ArticleFile } from '../../lib/wiki/source-file';
import { fetchAbstract, lookupSource, titlesMatch } from '../../lib/wiki/sources';
import { readArticleFiles, writeArticleFile } from './files';

async function checkSources(file: ArticleFile, fill: boolean, abstracts: boolean): Promise<{ errors: string[]; changed: boolean }> {
  const errors: string[] = [];
  let changed = false;
  for (const [i, s] of file.sources.entries()) {
    const label = `bron ${i + 1} (${s.doi ? `doi ${s.doi}` : `pmid ${s.pmid}`})`;
    if (!s.doi && !s.pmid) continue; // lintArticle meldt dit al
    const meta = await lookupSource(s);
    if (!meta) {
      errors.push(`${label} bestaat niet bij ${s.doi ? 'Crossref' : 'PubMed'}`);
      continue;
    }
    if (!s.title) {
      if (fill) {
        Object.assign(s, meta);
        changed = true;
      }
    } else if (!titlesMatch(s.title, meta.title)) {
      errors.push(`${label}: titel in het bestand ("${s.title}") is niet die van de uitgever ("${meta.title}")`);
    }
    if (abstracts) {
      const text = await fetchAbstract(s);
      console.log(`\n── ${file.slug} · ${label}\nBEWERING: ${s.claim}\n\n${text ?? '(geen samenvatting in PubMed)'}\n`);
    }
  }
  return { errors, changed };
}

async function main() {
  const args = process.argv.slice(2);
  const fill = args.includes('--fill');
  const abstracts = args.includes('--abstracts');
  const only = args.filter((a) => !a.startsWith('--'));

  const all = readArticleFiles();
  const slugs = new Set(all.map((a) => a.file.slug));
  const unknown = only.filter((s) => !slugs.has(s));
  if (unknown.length) {
    console.error(`Onbekend artikel: ${unknown.join(', ')}`);
    process.exit(1);
  }
  const picked = only.length ? all.filter((a) => only.includes(a.file.slug)) : all;

  let failed = 0;
  for (const { file } of picked) {
    const { errors: sourceErrors, changed } = await checkSources(file, fill, abstracts);
    if (changed) writeArticleFile(file);
    const errors = [...lintArticle(file, slugs), ...sourceErrors];
    if (errors.length) {
      failed++;
      console.log(`✗ ${file.slug}`);
      errors.forEach((e) => console.log(`    ${e}`));
    } else if (only.length) {
      console.log(`✓ ${file.slug} (${file.status}, ${file.sources.length} ${file.sources.length === 1 ? 'bron' : 'bronnen'})`);
    }
  }
  // De redactielijst: wat in :::check staat, staat niet online en wacht op een bron of op Furkan.
  const open = picked.flatMap(({ file }) => listChecks(file.body).map((c) => `  ${file.slug}: ${c.replace(/\s+/g, ' ').slice(0, 140)}`));
  if (open.length) console.log(`\nRedactielijst (${open.length} open, niet online):\n${open.join('\n')}`);

  const reviewed = picked.filter((a) => a.file.status === 'reviewed').length;
  console.log(`\n${picked.length} gecontroleerd, ${failed} met fouten, ${reviewed} beoordeeld.`);
  process.exit(failed ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
