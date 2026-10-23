#!/usr/bin/env tsx
/**
 * Van `content/wiki/` naar `wiki_articles` en `wiki_citations` (TDR-0017 §3).
 *
 *   pnpm sync-wiki           laat zien wat er zou veranderen, schrijft niets
 *   pnpm sync-wiki --write   schrijft het
 *   pnpm sync-wiki --tips     alleen de tips van de dag (content/tips/), de artikelen blijven staan
 *
 * @ai-why: Alleen wat veranderd is, en per veld. De trigger in de database zet `updated_at` bij elke
 *   update, en die datum staat onder een beoordeeld artikel en in `dateModified`. Alles opnieuw
 *   schrijven zou elk artikel "vandaag bijgewerkt" maken.
 * @ai-why: Nooit verwijderen. Een rij zonder bestand krijgt een waarschuwing. Samenvoegen wacht op
 *   aliassen in de app (TDR-0017 §7), en tot dan verwijst de coach misschien nog naar die slug.
 * @ai-gotcha: Een wijziging die iemand rechtstreeks in de database maakt, wordt hier overschreven.
 *   De repo is de bron.
 * @ai-sync: lib/wiki/source-file.ts (de velden van een bronbestand)
 * @ai-sync: lib/wiki/tips.ts (de tips van de dag, naar wiki_tips)
 * @ai-sync: lib/wiki/seo.ts (articleJsonLd leest updated_at als reviewdatum)
 */
import { config } from 'dotenv';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { AUTHOR } from '../../lib/wiki/seo';
import { hasOpenNotes, lintArticle, stripChecks, toSearchText, type ArticleFile } from '../../lib/wiki/source-file';
import { sourceUrl } from '../../lib/wiki/sources';
import { lintTipFile, tipId, type TipFile } from '../../lib/wiki/tips';
import { readArticleFiles, readManualSourceUrls, readTipFiles } from './files';

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
  wiki_citations: CitationFields[];
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
    // @ai-why: Terug naar draft haalt ook Furkans naam weg. De app toont `author` onder het artikel,
    //   en zijn naam onder een ongelezen tekst is precies wat TDR-0017 §1 uitsluit.
    author: file.status === 'reviewed' ? AUTHOR.name : !existing?.author || existing.author === AUTHOR.name ? 'Carve Team' : existing.author,
    citation_ids: file.citationIds,
    // Zonder :::check: wat niet geverifieerd is, gaat niet naar buiten (TDR-0018 §6).
    content_markdown: stripChecks(file.body),
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
// Alle velden die het web toont, zodat een verbeterd jaartal of tijdschrift ook echt mee gaat.
type CitationFields = Pick<Citation, 'title' | 'doi' | 'url' | 'authors' | 'journal' | 'publication_date' | 'citation_type'> & { order_index: number | null };
const citationKey = (c: CitationFields) =>
  JSON.stringify([c.order_index, c.doi, c.url, c.title, c.authors ?? [], c.journal, c.publication_date, c.citation_type]);

async function main() {
  const write = process.argv.includes('--write');
  // @ai-why: De tips kunnen live zonder dat herschreven artikelen meegaan. Die wachten op Furkan
  //   (TDR-0017 §5); een tip-update mocht ze niet ongevraagd online zetten.
  const tipsOnly = process.argv.includes('--tips');
  const all = readArticleFiles().map((f) => f.file);
  const slugs = new Set(all.map((f) => f.slug));
  const manualUrls = readManualSourceUrls();
  // @ai-why: Een concept in bewerking (met een open notitie) slaat de sync over in plaats van hem te
  //   blokkeren. Zo kan een ander artikel live terwijl dit nog bij Furkan ligt. In de database blijft
  //   dan de vorige versie staan.
  const inProgress = all.filter((f) => hasOpenNotes(f.body));
  inProgress.forEach((f) => console.log(`… ${f.slug}: open notitie, overgeslagen`));
  const files = all.filter((f) => !hasOpenNotes(f.body));

  const broken = files.map((f) => ({ slug: f.slug, errors: lintArticle(f, slugs, manualUrls) })).filter((f) => f.errors.length);
  if (broken.length) {
    broken.forEach((b) => console.error(`✗ ${b.slug}\n    ${b.errors.join('\n    ')}`));
    console.error('\nNiets geschreven. Los de fouten op (pnpm wiki:check) en probeer opnieuw.');
    process.exit(1);
  }

  // De tips worden vóór er iets geschreven wordt gecontroleerd, net als de artikelen.
  const tipFiles = readTipFiles();
  const brokenTips = tipFiles
    .map((t) => ({ slug: t.slug, errors: t.error ? [t.error] : lintTipFile(t.file, t.slug, slugs) }))
    .filter((t) => t.errors.length);
  if (brokenTips.length) {
    brokenTips.forEach((b) => console.error(`✗ tips ${b.slug}\n    ${b.errors.join('\n    ')}`));
    console.error('\nNiets geschreven. Los de fouten op (pnpm wiki:tips) en probeer opnieuw.');
    process.exit(1);
  }

  // @ai-why: Een proefrun leest alleen, en de anon-sleutel mag alle gepubliceerde artikelen en hun
  //   bronnen lezen. Zo kan iedereen zien wat er zou veranderen zonder de service-sleutel.
  // @ai-gotcha: Ongepubliceerde rijen ziet de anon-sleutel niet. Een "+" in de proefrun kan met
  //   --write dus een bestaande verborgen rij bijwerken. Alle Engelse rijen zijn nu gepubliceerd.
  const key = write ? process.env.SUPABASE_SERVICE_ROLE_KEY : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key!, {
    auth: { persistSession: false },
  });
  const { data, error } = await sb
    .from('wiki_articles')
    .select('id, slug, title, category, summary, evidence_rating, tags, type, author, citation_ids, content_markdown, wiki_citations(title, doi, url, authors, journal, publication_date, citation_type, order_index)')
    .eq('language', 'en');
  if (error) throw error;
  const rows = new Map((data as Row[]).map((r) => [r.slug, r]));

  let changes = 0;
  for (const file of tipsOnly ? [] : files) {
    const existing = rows.get(file.slug);
    const want = desiredRow(file, existing);
    const patch: Record<string, unknown> = Object.fromEntries(
      Object.entries(want).filter(([k, v]) => !existing || !same(existing[k as keyof Row], v)),
    );
    if ('content_markdown' in patch) patch.search_text = toSearchText(stripChecks(file.body));

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
    // @ai-gotcha: Verwijderen en dan invoegen, niet atomair. Faalt het invoegen, dan staat het artikel
    //   zonder bronnen en valt het bij de volgende verversing uit de index. Draai de sync dan opnieuw.
    if (citesChanged && id) {
      const { error: d } = await sb.from('wiki_citations').delete().eq('article_id', id);
      if (d) throw new Error(`${file.slug} bronnen: ${d.message}`);
      if (cites.length) {
        const { error: i } = await sb.from('wiki_citations').insert(cites.map((c) => ({ ...c, article_id: id })));
        if (i) throw new Error(`${file.slug} bronnen: ${i.message}`);
      }
    }
  }

  for (const slug of tipsOnly ? [] : rows.keys()) {
    if (!slugs.has(slug)) console.warn(`! ${slug} staat in de database maar niet in content/wiki/ (niet verwijderd)`);
  }
  console.log(`\n${changes} ${changes === 1 ? 'artikel' : 'artikelen'} ${write ? 'geschreven' : 'zouden veranderen (proefrun; --write om te schrijven)'}.`);

  await syncTips(sb, write, tipFiles.map((t) => t.file), new Map(all.map((f) => [f.slug, f.category])));
}

/**
 * @ai-gotcha: Niet `same()`. Postgres bewaart jsonb met de sleutels in zijn eigen volgorde (kort voor
 *   lang), dus JSON.stringify van wat terugkomt is nooit gelijk aan dat van het bestand, en elke sync
 *   zou dan alle tips opnieuw schrijven. Hier per taal vergeleken.
 */
function sameTexts(a: unknown, b: unknown): boolean {
  const x = (a ?? {}) as Record<string, { title?: string; body?: string }>;
  const y = (b ?? {}) as Record<string, { title?: string; body?: string }>;
  const langs = new Set([...Object.keys(x), ...Object.keys(y)]);
  return [...langs].every((l) => x[l]?.title === y[l]?.title && x[l]?.body === y[l]?.body);
}

type TipRow = { id: string; article_slug: string; category: string; kind: string; texts: unknown; is_published: boolean };

/**
 * Van `content/tips/` naar `wiki_tips` (Carve-AI ADR-104).
 *
 * @ai-why: Een tip die niet meer in de bestanden staat, gaat op `is_published = false` en wordt niet
 *   verwijderd. De app vervangt een ingeplande tip die niet meer gepubliceerd is bij de volgende
 *   planning; een verwijderde rij zou hetzelfde doen, maar dan is hij niet terug te zetten.
 * @ai-gotcha: De proefrun leest met de anon-sleutel en ziet dus geen ongepubliceerde tips. Een "+"
 *   kan met --write een bestaande verborgen tip weer publiceren; dat is precies wat het moet doen.
 */
async function syncTips(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sb: SupabaseClient<any, any, any>,
  write: boolean,
  files: TipFile[],
  categoryOf: Map<string, string>,
) {
  const { data, error } = await sb.from('wiki_tips').select('id, article_slug, category, kind, texts, is_published');
  if (error) throw error;
  const rows = new Map((data as TipRow[]).map((r) => [r.id, r]));

  const desired: TipRow[] = files.flatMap((f) =>
    f.tips.map((t) => ({
      id: tipId(f.article, t.key),
      article_slug: f.article,
      category: categoryOf.get(f.article) ?? '',
      kind: t.kind,
      texts: t.texts,
      is_published: true,
    })),
  );
  const ids = new Set(desired.map((d) => d.id));

  const changed = desired.filter((d) => {
    const r = rows.get(d.id);
    return !r || r.article_slug !== d.article_slug || r.category !== d.category || r.kind !== d.kind || !r.is_published || !sameTexts(r.texts, d.texts);
  });
  const retired = [...rows.values()].filter((r) => r.is_published && !ids.has(r.id));

  changed.forEach((d) => console.log(`${rows.has(d.id) ? '~' : '+'} tip ${d.id}`));
  retired.forEach((r) => console.log(`- tip ${r.id} (niet meer gepubliceerd)`));

  if (write) {
    for (let i = 0; i < changed.length; i += 200) {
      const { error: e } = await sb.from('wiki_tips').upsert(changed.slice(i, i + 200), { onConflict: 'id' });
      if (e) throw new Error(`tips: ${e.message}`);
    }
    if (retired.length) {
      const { error: e } = await sb.from('wiki_tips').update({ is_published: false }).in('id', retired.map((r) => r.id));
      if (e) throw new Error(`tips: ${e.message}`);
    }
  }
  const total = desired.length;
  console.log(`${changed.length + retired.length} van ${total} tips ${write ? 'geschreven' : 'zouden veranderen (proefrun)'}.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
