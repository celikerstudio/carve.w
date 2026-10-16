/**
 * Bronteksten als platte tekst in de repo (TDR-0018 §2 en §5).
 *
 * @ai-why: De brontekst in de repo en niet alleen een link. Een review over een jaar moet tegen
 *   dezelfde tekst kunnen kijken als de schrijver, ook als de uitgever zijn pagina verplaatst.
 *   Dezelfde reden als `bronnen/cbr/` in ~/Developer/naslagwerken.
 */

function decode(s: string): string {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h: string) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d: string) => String.fromCodePoint(Number(d)))
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');
}

/** Alles tussen tags weg, witruimte samengevoegd. */
function inline(s: string): string {
  return decode(s.replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim();
}

/** Eén `<sec>` met zijn kop, alinea's, tabellen en geneste secties, op diepte `level`. */
function section(xml: string, level: number): string[] {
  const out: string[] = [];
  const title = /^\s*<title[^>]*>([\s\S]*?)<\/title>/.exec(xml);
  if (title) out.push(`${'#'.repeat(Math.min(level, 6))} ${inline(title[1])}`);
  let rest = title ? xml.slice(title.index + title[0].length) : xml;

  // Geneste secties en losse blokken in hun volgorde aflopen.
  const token = /<sec\b[^>]*>|<p\b[^>]*>([\s\S]*?)<\/p>|<table-wrap\b[^>]*>([\s\S]*?)<\/table-wrap>|<list-item\b[^>]*>([\s\S]*?)<\/list-item>/g;
  while (rest.length) {
    token.lastIndex = 0;
    const m = token.exec(rest);
    if (!m) break;
    if (m[0].startsWith('<sec')) {
      const inner = matchBalanced(rest, m.index, 'sec');
      out.push(...section(inner.body, level + 1));
      rest = rest.slice(inner.end);
      continue;
    }
    if (m[1] !== undefined) {
      const text = inline(m[1]);
      if (text) out.push(text);
    } else if (m[2] !== undefined) {
      const caption = /<caption>([\s\S]*?)<\/caption>/.exec(m[2]);
      if (caption) out.push(inline(caption[1]));
      for (const row of m[2].matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/g)) {
        const cells = [...row[1].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/g)].map((c) => inline(c[1]));
        if (cells.some(Boolean)) out.push(cells.join(' | '));
      }
    } else if (m[3] !== undefined) {
      out.push(`- ${inline(m[3])}`);
    }
    rest = rest.slice(m.index + m[0].length);
  }
  return out;
}

/** De inhoud van een element met geneste elementen van dezelfde naam. */
function matchBalanced(xml: string, start: number, tag: string): { body: string; end: number } {
  const re = new RegExp(`<${tag}\\b[^>]*>|</${tag}>`, 'g');
  re.lastIndex = start;
  let depth = 0;
  let bodyStart = start;
  for (let m = re.exec(xml); m; m = re.exec(xml)) {
    if (m[0].startsWith('</')) {
      depth--;
      if (depth === 0) return { body: xml.slice(bodyStart, m.index), end: m.index + m[0].length };
    } else {
      if (depth === 0) bodyStart = m.index + m[0].length;
      depth++;
    }
  }
  return { body: xml.slice(bodyStart), end: xml.length };
}

/** Een JATS-artikel (Europe PMC, PMC) als markdown-achtige platte tekst: samenvatting, dan de tekst. */
export function jatsToText(xml: string): string {
  const out: string[] = [];
  const abstract = /<abstract\b[^>]*>([\s\S]*?)<\/abstract>/.exec(xml);
  if (abstract) {
    out.push('## Abstract');
    out.push(...section(abstract[1], 3));
  }
  const body = /<body\b[^>]*>([\s\S]*)<\/body>/.exec(xml);
  if (body) {
    for (let at = body[1].search(/<sec\b/); at !== -1; ) {
      const sec = matchBalanced(body[1], at, 'sec');
      out.push(...section(sec.body, 2));
      const next = body[1].slice(sec.end).search(/<sec\b/);
      at = next === -1 ? -1 : sec.end + next;
    }
  }
  return out.join('\n\n');
}

/** Een DOI als bestandsnaam: kleine letters, alles behalve letters en cijfers wordt een streepje. */
export function sourceFileName(doi: string): string {
  return doi.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
