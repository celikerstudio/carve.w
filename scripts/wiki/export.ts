#!/usr/bin/env tsx
/**
 * Eenmalig: de Engelse artikelen uit `wiki_articles` naar `content/wiki/` (TDR-0017 §3).
 *
 * Daarna is de repo de bron en schrijft alleen `pnpm sync-wiki` nog naar de database. Draai dit
 * niet opnieuw over bestaande bestanden: het overschrijft wat er in de repo veranderd is.
 *
 * Gebruik: pnpm tsx scripts/wiki/export.ts [--force]
 */
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { CONTENT_DIR, readArticleFiles, writeArticleFile } from './files';

config({ path: '.env.local' });

async function main() {
  const force = process.argv.includes('--force');
  if (readArticleFiles().length > 0 && !force) {
    console.error(`${CONTENT_DIR} bevat al artikelen. De repo is de bron; gebruik --force alleen als je weet waarom.`);
    process.exit(1);
  }
  // De anon-sleutel is genoeg: alle Engelse artikelen zijn gepubliceerd en de RLS laat die lezen.
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false },
  });
  const { data, error } = await sb
    .from('wiki_articles')
    .select('slug, title, category, summary, evidence_rating, tags, type, citation_ids, content_markdown')
    .eq('language', 'en')
    .order('slug');
  if (error) throw error;
  for (const row of data ?? []) {
    writeArticleFile({
      slug: row.slug,
      title: row.title,
      category: row.category,
      summary: row.summary ?? '',
      evidence: row.evidence_rating ?? 'expert-consensus',
      status: row.type === 'reviewed' ? 'reviewed' : 'draft',
      tags: row.tags ?? [],
      citationIds: row.citation_ids ?? [],
      sources: [],
      body: (row.content_markdown ?? '').replace(/\r\n/g, '\n').trim(),
    });
  }
  console.log(`${data?.length ?? 0} artikelen naar ${CONTENT_DIR}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
