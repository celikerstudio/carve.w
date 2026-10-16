import { remark } from 'remark';
import html from 'remark-html';

/**
 * Markdown van een wiki-artikel naar HTML, plus de inhoudsopgave (TDR-0016 §3).
 *
 * @ai-why: Hier en niet in het sync-script: `content_html` is voor alle 97 artikelen leeg, en
 *   twee renderers (sync en web) geven twee waarheden over hoe een blok eruitziet.
 * @ai-why: De blokken worden vóór remark uit de tekst geknipt en zelf opgebouwd. remark-html
 *   saneert ruwe HTML weg (en dat moet zo blijven), dus een `<aside>` in de markdown zetten en
 *   remark laten doorgeven lukt niet zonder `sanitize: false`.
 * @ai-gotcha: Wat we zelf opbouwen (checklist-label en -tekst) gaat niet door de sanitizer
 *   van remark. Daarom gaat elke regel daar door `inline()`, en die laat remark het werk doen.
 */

export interface WikiLink {
  title: string;
  href: string;
}

export interface TocItem {
  id: string;
  text: string;
}

const BLOCK = /^:::(\w+)\s*\n([\s\S]*?)\n:::\s*$/gm;
const WIKILINK = /\[\[([a-z0-9-]+)(?:\|([^\]]+))?\]\]/g;

/** De entiteiten die remark schrijft, terug naar tekens: de inhoudsopgave is platte tekst. */
function decodeEntities(text: string): string {
  return text
    .replace(/&#x([0-9a-f]+);/gi, (_, h: string) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d: string) => String.fromCodePoint(Number(d)))
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"');
}

/** "What is Protein?" → "what-is-protein". */
export function anchorId(text: string): string {
  return text
    .toLowerCase()
    .replace(/<[^>]+>/g, '')
    .replace(/&#?[a-z0-9]+;/gi, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function resolveLinks(markdown: string, links: Map<string, WikiLink>): string {
  return markdown.replace(WIKILINK, (_, slug: string, label?: string) => {
    const target = links.get(slug);
    // @ai-why: Een link naar een artikel dat (nog) niet bestaat wordt gewone tekst. 84 van de 97
    //   artikelen linken zo, en een dode link in een naslagwerk kost meer vertrouwen dan geen link.
    if (!target) return label ?? slug.replace(/-/g, ' ');
    return `[${label ?? target.title}](${target.href})`;
  });
}

async function markdownToHtml(markdown: string): Promise<string> {
  const file = await remark().use(html).process(markdown);
  return String(file);
}

/** Eén regel markdown, zonder de `<p>` eromheen. */
async function inline(markdown: string): Promise<string> {
  return (await markdownToHtml(markdown)).trim().replace(/^<p>|<\/p>$/g, '');
}

async function renderBlock(kind: string, body: string): Promise<string> {
  if (kind === 'checklist') {
    const items = body
      .split('\n')
      .map((line) => line.replace(/^\s*-\s*/, '').trim())
      .filter(Boolean);
    const rows = await Promise.all(
      items.map(async (item) => {
        const [label, ...rest] = item.split('|');
        return `<li><strong>${await inline(label.trim())}</strong><span>${await inline(rest.join('|').trim())}</span></li>`;
      }),
    );
    return `<ul class="wiki-checklist">${rows.join('')}</ul>`;
  }
  // takeaway, en elk onbekend blok: een vlak met de inhoud gewoon als markdown.
  return `<aside class="wiki-${kind === 'takeaway' ? 'takeaway' : 'note'}">${await markdownToHtml(body)}</aside>`;
}

/**
 * Haalt het eerste `:::takeaway`-blok uit de tekst. Dat is het korte antwoord bovenaan
 * (TDR-0016 §4); in de tekst eronder zou het er dan twee keer staan.
 */
export function splitTakeaway(markdown: string): { takeaway: string | null; rest: string } {
  const match = /^:::takeaway\s*\n([\s\S]*?)\n:::\s*$/m.exec(markdown);
  if (!match) return { takeaway: null, rest: markdown };
  const rest = (markdown.slice(0, match.index) + markdown.slice(match.index + match[0].length)).replace(/\n{3,}/g, '\n\n');
  return { takeaway: match[1].trim(), rest };
}

/** Een los stuk markdown naar HTML, zoals het antwoord bovenaan. */
export async function renderFragment(markdown: string, links: Map<string, WikiLink>): Promise<string> {
  return markdownToHtml(resolveLinks(markdown, links));
}

export async function renderArticle(
  markdown: string,
  links: Map<string, WikiLink>,
): Promise<{ html: string; toc: TocItem[] }> {
  const source = resolveLinks(markdown, links);
  const parts: string[] = [];
  let last = 0;
  for (const match of source.matchAll(BLOCK)) {
    const before = source.slice(last, match.index);
    if (before.trim()) parts.push(await markdownToHtml(before));
    parts.push(await renderBlock(match[1], match[2]));
    last = (match.index ?? 0) + match[0].length;
  }
  const rest = source.slice(last);
  if (rest.trim()) parts.push(await markdownToHtml(rest));

  const toc: TocItem[] = [];
  const out = parts.join('\n').replace(/<h2>([\s\S]*?)<\/h2>/g, (_, inner: string) => {
    const id = anchorId(inner);
    toc.push({ id, text: decodeEntities(inner.replace(/<[^>]+>/g, '')) });
    return `<h2 id="${id}">${inner}</h2>`;
  });
  return { html: out, toc };
}
