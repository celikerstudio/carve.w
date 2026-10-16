import matter from 'gray-matter';
import { EVIDENCE_LABEL, categoryByName } from './catalog';

/**
 * Het bronbestand van een artikel: `content/wiki/<categorie>/<slug>.md` (TDR-0017 §3).
 *
 * @ai-why: De repo is de bron en de database een kopie. Zo heeft elk artikel een geschiedenis en
 *   een diff die Furkan kan lezen, en is een fout terug te draaien. Rechtstreeks in de database
 *   schrijven had geen van drieën.
 * @ai-sync: scripts/wiki/sync.ts (schrijft deze velden naar wiki_articles en wiki_citations)
 */

export type ArticleStatus = 'draft' | 'reviewed';

export interface ArticleSource {
  /** Zonder `https://doi.org/` ervoor. */
  doi?: string;
  pmid?: string;
  /** Opgehaald door `pnpm wiki:check --fill`, niet met de hand. */
  title?: string;
  authors?: string[];
  journal?: string;
  year?: number;
  /** Welke bewering in de tekst deze bron draagt. Daarop is hij gekozen en gecontroleerd. */
  claim: string;
}

export interface ArticleTease {
  title: string;
  line: string;
  preview: string;
}

export interface ArticleFile {
  slug: string;
  title: string;
  /** Zoals in de database: `Nutrition`, `Training`, ... */
  category: string;
  summary: string;
  evidence: string;
  status: ArticleStatus;
  tags: string[];
  /** De vaste bronnen in de app (`HealthCitation.swift`). Blijven staan tot de app `wiki_citations` leest. */
  citationIds: string[];
  sources: ArticleSource[];
  tease?: ArticleTease;
  body: string;
}

export function parseArticleFile(slug: string, text: string): ArticleFile {
  // @ai-gotcha: Met een (leeg) options-object. Zonder opties cachet gray-matter het resultaat per
  //   tekst en geeft het hetzelfde object terug, zodat een wijziging aan het ene bestand in het
  //   volgende opduikt.
  const { data, content } = matter(text, {});
  return {
    slug,
    title: String(data.title ?? ''),
    category: String(data.category ?? ''),
    summary: String(data.summary ?? ''),
    evidence: String(data.evidence ?? ''),
    status: data.status === 'reviewed' ? 'reviewed' : 'draft',
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    citationIds: Array.isArray(data.citation_ids) ? data.citation_ids.map(String) : [],
    sources: Array.isArray(data.sources) ? data.sources.map(parseSource) : [],
    ...(data.tease ? { tease: data.tease as ArticleTease } : {}),
    body: content.replace(/^\n+/, '').replace(/\s+$/, ''),
  };
}

function parseSource(raw: Record<string, unknown>): ArticleSource {
  const s: ArticleSource = { claim: String(raw.claim ?? '') };
  if (raw.doi) s.doi = String(raw.doi);
  if (raw.pmid) s.pmid = String(raw.pmid);
  if (raw.title) s.title = String(raw.title);
  if (Array.isArray(raw.authors)) s.authors = raw.authors.map(String);
  if (raw.journal) s.journal = String(raw.journal);
  if (raw.year) s.year = Number(raw.year);
  return s;
}

export function serializeArticleFile(a: ArticleFile): string {
  const data: Record<string, unknown> = {
    title: a.title,
    category: a.category,
    summary: a.summary,
    evidence: a.evidence,
    status: a.status,
    tags: a.tags,
  };
  if (a.citationIds.length) data.citation_ids = a.citationIds;
  if (a.tease) data.tease = a.tease;
  if (a.sources.length) {
    // Vaste volgorde per bron, zodat de diff van een review alleen laat zien wat er veranderde.
    data.sources = a.sources.map((s) =>
      Object.fromEntries(
        (['doi', 'pmid', 'title', 'authors', 'journal', 'year', 'claim'] as const)
          .filter((k) => s[k] !== undefined)
          .map((k) => [k, s[k]]),
      ),
    );
  }
  return matter.stringify(`\n${a.body}\n`, data, { lineWidth: -1 } as never);
}

const ALLOWED_BLOCKS = new Set(['takeaway', 'checklist']);

/**
 * De opmaak die zowel de web-renderer (`lib/wiki/render.ts`) als de app-lezer kent (TDR-0017 §5).
 * Geeft een lijst fouten in gewone taal; leeg is goed.
 *
 * @ai-why: Twee lezers met elk een eigen parser. Wat alleen het web snapt, staat in de app als kale
 *   tekst, en dat zie je pas als iemand het artikel op zijn telefoon opent.
 * @ai-sync: ~/Developer/Carve-AI/Carve AI/App/Views/Components/Wiki/WikiArticleDetailView.swift
 * @ai-sync: lib/wiki/render.ts
 */
export function lintArticle(a: ArticleFile, slugs: Set<string>): string[] {
  const errors: string[] = [];
  const body = a.body;

  if (!a.title) errors.push('titel ontbreekt');
  if (!categoryByName(a.category)) errors.push(`onbekende categorie "${a.category}"`);
  if (!a.summary) errors.push('summary ontbreekt');
  if (a.summary.length > 160) errors.push(`summary is ${a.summary.length} tekens; Google kapt af na ~160`);
  if (!(a.evidence in EVIDENCE_LABEL)) errors.push(`onbekend evidence-label "${a.evidence}"`);

  if (/^# /m.test(body)) errors.push('een # in de tekst: de titel is al de enige h1');
  if (/^\s*\|.*\|\s*$/m.test(body)) errors.push('een tabel: de app toont die als losse streepjes; maak er een lijst van');
  if (/!\[/.test(body)) errors.push('een afbeelding: de app toont geen afbeeldingen in de tekst');
  if (/<[a-zA-Z][^>]*>/.test(body)) errors.push('HTML in de tekst');
  if (/\]\(https?:\/\//.test(body)) errors.push('een externe link in de tekst: bronnen horen in `sources`, met [n] in de tekst');

  for (const [, kind] of body.matchAll(/^:::(\w+)/gm)) {
    if (!ALLOWED_BLOCKS.has(kind)) errors.push(`blok :::${kind} kent de app niet`);
  }
  if (!/^:::takeaway\s*$/m.test(body)) errors.push('geen :::takeaway: het antwoord hoort bovenaan');

  for (const [, items] of body.matchAll(/^:::checklist\s*\n([\s\S]*?)\n:::\s*$/gm)) {
    for (const line of items.split('\n').filter((l) => l.trim().startsWith('- '))) {
      if (!line.includes(' | ')) errors.push(`checklist-regel zonder " | ": ${line.trim()}`);
    }
  }

  for (const [, target] of body.matchAll(/\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g)) {
    if (!slugs.has(target)) errors.push(`link naar [[${target}]], dat artikel bestaat niet`);
  }

  for (const [ref, n] of body.matchAll(/(?<!\[)\[(\d+)\](?!\()/g)) {
    if (Number(n) < 1 || Number(n) > a.sources.length) errors.push(`verwijzing ${ref} zonder bron ${n}`);
  }

  a.sources.forEach((s, i) => {
    const label = `bron ${i + 1}`;
    if (!s.doi && !s.pmid) errors.push(`${label} heeft geen DOI of PubMed-ID`);
    if (!s.claim.trim()) errors.push(`${label} zegt niet welke bewering hij draagt`);
    if (!s.title) errors.push(`${label} is nog niet opgezocht (pnpm wiki:check --fill)`);
  });

  if (hasOpenNotes(body)) errors.push('open notitie (<!-- ... -->): eerst invullen of weghalen');

  if (a.status === 'reviewed' && a.sources.length === 0) {
    errors.push('beoordeeld zonder bron: zonder bron komt het niet in Google (TDR-0017 §2)');
  }

  return errors;
}

/**
 * Een `<!-- ... -->` in de tekst: een notitie in een concept, meestal de plek voor Furkans eigen stuk.
 *
 * @ai-why: De web-renderer haalt een HTML-commentaar weg, maar de app-lezer toont hem als tekst. Een
 *   concept met een open notitie gaat daarom niet mee met `pnpm sync-wiki`.
 */
export function hasOpenNotes(markdown: string): boolean {
  return /<!--[\s\S]*?-->/.test(markdown);
}

/**
 * Platte tekst voor `search_text`, waar de trigger in de database de zoekvector van maakt.
 *
 * @ai-sync: ~/Developer/Carve-AI/supabase/migrations/20260101000000_baseline.sql (wiki_update_search_vectors)
 */
export function toSearchText(markdown: string): string {
  return markdown
    .replace(/^:::\w*\s*$/gm, '')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^\s*[-*]\s+/gm, '')
    .replace(/\[\[[^\]|]+\|([^\]]+)\]\]/g, '$1')
    .replace(/\[\[([^\]]+)\]\]/g, (_, s: string) => s.replace(/-/g, ' '))
    .replace(/\s*(?<!\[)\[\d+\](?!\()/g, '')
    .replace(/\*\*|__|\*|_|`/g, '')
    .replace(/\s+\|\s+/g, ': ')
    .replace(/\s+/g, ' ')
    .trim();
}
