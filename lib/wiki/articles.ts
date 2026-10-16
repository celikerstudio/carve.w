import { cache } from 'react';
import { createClient } from '@supabase/supabase-js';
import { articleHref, categoryByName } from './catalog';
import type { WikiLink } from './render';

/**
 * Artikelen voor de publieke wiki, uit `wiki_articles` (TDR-0016 §2).
 *
 * @ai-why: Een kale client met de anon-sleutel en zonder cookies. `lib/supabase/server.ts` leest
 *   de sessie uit de cookies, en daarmee wordt elke pagina per verzoek gerenderd in plaats van
 *   statisch. Lezen mag via de RLS-policy "Public can view published articles".
 * @ai-why: `cache()` zodat de lijst één keer per render wordt opgehaald, ook al vragen de pagina,
 *   de metadata en de zijbalk er alle drie om.
 * @ai-gotcha: `is_published = true` en `language = 'en'` staan hier en nergens anders. De RLS laat
 *   een ingelogde gebruiker álle artikelen zien, maar deze client logt nooit in, dus die policy
 *   speelt hier niet; de filter in de query is wat telt.
 */

export interface WikiArticleSummary {
  slug: string;
  title: string;
  category: string;
  summary: string;
  evidence: string;
  href: string;
  updatedAt: string;
}

export interface WikiArticle extends WikiArticleSummary {
  id: string;
  markdown: string;
  tags: string[];
}

export interface WikiCitation {
  number: number;
  authors: string;
  year: number | null;
  title: string;
  publication: string;
  url: string | null;
}

function client() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export const listArticles = cache(async (): Promise<WikiArticleSummary[]> => {
  const { data, error } = await client()
    .from('wiki_articles')
    .select('slug, title, category, summary, evidence_rating, updated_at')
    .eq('is_published', true)
    .eq('language', 'en')
    .order('title');
  // @ai-why: Gooien in plaats van een lege lijst. Een lege wiki die statisch gebouwd wordt, blijft
  //   een uur lang leeg staan; een fout laat Next de vorige versie houden.
  if (error) throw new Error(`wiki_articles: ${error.message}`);
  return (data ?? []).flatMap((row) => {
    const href = articleHref(row.category, row.slug);
    if (!href) return [];
    return [{
      slug: row.slug,
      title: row.title,
      category: categoryByName(row.category)!.name,
      summary: row.summary ?? '',
      evidence: row.evidence_rating ?? 'expert-consensus',
      href,
      updatedAt: row.updated_at,
    }];
  });
});

export const getArticle = cache(async (slug: string): Promise<WikiArticle | null> => {
  const { data, error } = await client()
    .from('wiki_articles')
    .select('id, slug, title, category, summary, evidence_rating, content_markdown, tags, updated_at')
    .eq('slug', slug)
    .eq('is_published', true)
    .eq('language', 'en')
    .maybeSingle();
  if (error) throw new Error(`wiki_articles ${slug}: ${error.message}`);
  if (!data) return null;
  const href = articleHref(data.category, data.slug);
  if (!href) return null;
  return {
    id: data.id,
    slug: data.slug,
    title: data.title,
    category: categoryByName(data.category)!.name,
    summary: data.summary ?? '',
    evidence: data.evidence_rating ?? 'expert-consensus',
    href,
    markdown: data.content_markdown ?? '',
    tags: data.tags ?? [],
    updatedAt: data.updated_at,
  };
});

/**
 * De bronnen van een artikel, in hun volgorde.
 *
 * @ai-gotcha: Op `article_id` en niet op de slug. De cockpit-hook die tot 2026-10-16 bestond vroeg
 *   `article_slug`, `citation_number`, `year` en `publication` op, kolommen die deze tabel niet
 *   heeft. Dat faalde stil (lege lijst), en zo zag de cockpit nooit één bron.
 */
export const getCitations = cache(async (articleId: string): Promise<WikiCitation[]> => {
  const { data, error } = await client()
    .from('wiki_citations')
    .select('title, authors, journal, publication_date, url, doi, order_index')
    .eq('article_id', articleId)
    .order('order_index');
  if (error) throw new Error(`wiki_citations ${articleId}: ${error.message}`);
  return (data ?? []).map((c, i) => ({
    number: i + 1,
    authors: (c.authors ?? []).join(', '),
    year: c.publication_date ? new Date(c.publication_date).getFullYear() : null,
    title: c.title ?? '',
    publication: c.journal ?? '',
    url: c.url ?? (c.doi ? `https://doi.org/${c.doi}` : null),
  }));
});

/** Slug → titel en adres, voor de `[[slug]]`-links in de tekst. */
export async function linkMap(): Promise<Map<string, WikiLink>> {
  const all = await listArticles();
  return new Map(all.map((a) => [a.slug, { title: a.title, href: a.href }]));
}

/**
 * Drie artikelen om daarna te lezen: eerst die waar dit artikel naar linkt, dan met een woord
 * uit dezelfde slug, dan uit dezelfde categorie.
 */
export async function seeAlso(article: WikiArticle): Promise<WikiArticleSummary[]> {
  const all = await listArticles();
  const linked = [...article.markdown.matchAll(/\[\[([a-z0-9-]+)/g)].map((m) => m[1]);
  const picked: WikiArticleSummary[] = [];
  for (const slug of linked) {
    const hit = all.find((a) => a.slug === slug);
    if (hit && hit.slug !== article.slug && !picked.includes(hit)) picked.push(hit);
  }
  // @ai-why: Daarna artikelen met een woord uit deze slug ("protein" → Protein Sources, Whey
  //   Protein), ook uit een andere categorie. Pas als laatste de rest van de eigen categorie;
  //   alfabetisch aanvullen gaf bij Protein "Alcohol and Fitness" en "BMR".
  const words = article.slug.split('-').filter((w) => w.length > 3);
  const add = (a: WikiArticleSummary) => {
    if (picked.length < 3 && a.slug !== article.slug && !picked.includes(a)) picked.push(a);
  };
  all.filter((a) => words.some((w) => a.slug.split('-').includes(w))).forEach(add);
  all.filter((a) => a.category === article.category).forEach(add);
  return picked;
}
