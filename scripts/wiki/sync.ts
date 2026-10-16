#!/usr/bin/env tsx
/**
 * Van `content/wiki/` naar `wiki_articles` en `wiki_citations` (TDR-0017 §3).
 *
 *   pnpm sync-wiki           laat zien wat er zou veranderen, schrijft niets
 *   pnpm sync-wiki --write   schrijft het
 *
 * @ai-why: Alleen wat veranderd is, en per veld. De trigger in de database zet `updated_at` bij elke
 *   update, en die datum staat onder een beoordeeld artikel en in `dateModified`. Alles opnieuw
 *   schrijven zou elk artikel "vandaag bijgewerkt" maken.
 * @ai-why: Nooit verwijderen. Een rij zonder bestand krijgt een waarschuwing. Samenvoegen wacht op
 *   aliassen in de app (TDR-0017 §7), en tot dan verwijst de coach misschien nog naar die slug.
 * @ai-gotcha: Een wijziging die iemand rechtstreeks in de database maakt, wordt hier overschreven.
 *   De repo is de bron.
 * @ai-sync: lib/wiki/source-file.ts (de velden van een bronbestand)
 * @ai-sync: lib/wiki/seo.ts (articleJsonLd leest updated_at als reviewdatum)
 */
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { AUTHOR } from '../../lib/wiki/seo';
import { lintArticle, toSearchText, type ArticleFile } from '../../lib/wiki/source-file';
import { sourceUrl } from '../../lib/wiki/sources';
import { readArticleFiles } from './files';

config({ path: '.env.local' });

type Row = {
  id: string;
  slug: string;
  title: string;
  category: string;
  summary: string | null;
  evidence_rating: string | null;
  tags: string[] | null;
  type: string | null;
  author: string | null;
  citation_ids: string[] | null;
  content_markdown: string | null;
  wiki_citations: { title: string; doi: string | null; url: string | null; order_index: number | null }[];
};

type Citation = {
  citation_type: 'study';
  title: string;
  authors: string[];
  url: string | null;
  doi: string | null;
  publication_date: string | null;
  journal: string | null;
  order_index: number;
};

function desiredRow(file: ArticleFile, existing: Row | undefined) {
  return {
    title: file.title,
    category: file.category,
    summary: file.summary,
    evidence_rating: file.evidence,
    tags: file.tags,
    // Een concept dat ooit beoordeeld was en terug op draft staat, wordt weer 'ai'.
    type: file.status === 'reviewed' ? 'reviewed' : existing?.type === 'reviewed' || !existing?.type ? 'ai' : existing.type,
    author: file.status === 'reviewed' ? AUTHOR.name : (existing?.author ?? 'Carve Team'),
    citation_ids: file.citationIds,
    content_markdown: file.body,
  };
}

function desiredCitations(file: ArticleFile): Citation[] {
  return file.sources.map((s, i) => ({
    citation_type: 'study',
    title: s.title ?? '',
    authors: s.authors ?? [],
    url: sourceUrl(s),
    doi: s.doi ?? null,
    publication_date: s.year ? `${s.year}-01-01` : null,
    journal: s.journal ?? null,
    order_index: i + 1,
  }));
}

// @ai-why: `null` in de database en een lege lijst of tekst in het bestand zijn hetzelfde. Zonder
//   dit zag de eerste proefrun 65 artikelen "veranderen" op `citation_ids: null` tegen `[]`.
const norm = (v: unknown) => (v === null || v === undefined || v === '' || (Array.isArray(v) && v.length === 0) ? null : v);
const same = (a: unknown, b: unknown) => JSON.stringify(norm(a)) === JSON.stringify(norm(b));
const citationKey = (c: { title: string; doi: string | null; url: string | null; order_index: number | null }) =>
  `${c.order_index}|${c.doi ?? ''}|${c.url ?? ''}|${c.title}`;

async function main() {
  const write = process.argv.includes('--write');
  const files = readArticleFiles().map((f) => f.file);
  const slugs = new Set(files.map((f) => f.slug));

  const broken = files.map((f) => ({ slug: f.slug, errors: lintArticle(f, slugs) })).filter((f) => f.errors.length);
  if (broken.length) {
    broken.forEach((b) => console.error(`✗ ${b.slug}\n    ${b.errors.join('\n    ')}`));
    console.error('\nNiets geschreven. Los de fouten op (pnpm wiki:check) en probeer opnieuw.');
    process.exit(1);
  }

  // @ai-why: Een proefrun leest alleen, en de anon-sleutel mag alle gepubliceerde artikelen en hun
  //   bronnen lezen. Zo kan iedereen zien wat er zou veranderen zonder de service-sleutel.
  const key = write ? process.env.SUPABASE_SERVICE_ROLE_KEY : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key!, {
    auth: { persistSession: false },
  });
  const { data, error } = await sb
    .from('wiki_articles')
    .select('id, slug, title, category, summary, evidence_rating, tags, type, author, citation_ids, content_markdown, wiki_citations(title, doi, url, order_index)')
    .eq('language', 'en');
  if (error) throw error;
  const rows = new Map((data as Row[]).map((r) => [r.slug, r]));

  let changes = 0;
  for (const file of files) {
    const existing = rows.get(file.slug);
    const want = desiredRow(file, existing);
    const patch: Record<string, unknown> = Object.fromEntries(
      Object.entries(want).filter(([k, v]) => !existing || !same(existing[k as keyof Row], v)),
    );
    if ('content_markdown' in patch) patch.search_text = toSearchText(file.body);

    const cites = desiredCitations(file);
    const citesChanged = !same(
      (existing?.wiki_citations ?? []).map(citationKey).sort(),
      cites.map(citationKey).sort(),
    );

    if (Object.keys(patch).length === 0 && !citesChanged) continue;
    changes++;
    const what = [...Object.keys(patch).filter((k) => k !== 'search_text'), ...(citesChanged ? [`${cites.length} bronnen`] : [])];
    console.log(`${existing ? '~' : '+'} ${file.slug}: ${what.join(', ')}`);
    if (!write) continue;

    let id = existing?.id;
    if (existing && Object.keys(patch).length) {
      const { error: e } = await sb.from('wiki_articles').update(patch).eq('id', existing.id);
      if (e) throw new Error(`${file.slug}: ${e.message}`);
    } else if (!existing) {
      const { data: ins, error: e } = await sb
        .from('wiki_articles')
        .insert({ slug: file.slug, language: 'en', is_published: true, ...patch })
        .select('id')
        .single();
      if (e) throw new Error(`${file.slug}: ${e.message}`);
      id = ins.id;
    }
    if (citesChanged && id) {
      const { error: d } = await sb.from('wiki_citations').delete().eq('article_id', id);
      if (d) throw new Error(`${file.slug} bronnen: ${d.message}`);
      if (cites.length) {
        const { error: i } = await sb.from('wiki_citations').insert(cites.map((c) => ({ ...c, article_id: id })));
        if (i) throw new Error(`${file.slug} bronnen: ${i.message}`);
      }
    }
  }

  for (const slug of rows.keys()) {
    if (!slugs.has(slug)) console.warn(`! ${slug} staat in de database maar niet in content/wiki/ (niet verwijderd)`);
  }
  console.log(`\n${changes} ${changes === 1 ? 'artikel' : 'artikelen'} ${write ? 'geschreven' : 'zouden veranderen (proefrun; --write om te schrijven)'}.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
