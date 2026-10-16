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

/** Een alinea; een `<list>` erin komt op eigen regels, los van de inleiding ervoor. */
function paragraph(xml: string): string[] {
  const at = xml.search(/<list[\s>]/);
  if (at === -1) {
    const text = inline(xml);
    return text ? [text] : [];
  }
  const out: string[] = [];
  const intro = inline(xml.slice(0, at));
  if (intro) out.push(intro);
  const list = matchBalanced(xml, at, 'list');
  for (let i = list.body.search(/<list-item[\s>]/); i !== -1; ) {
    const item = matchBalanced(list.body, i, 'list-item');
    out.push(`- ${inline(item.body)}`);
    const next = list.body.slice(item.end).search(/<list-item[\s>]/);
    i = next === -1 ? -1 : item.end + next;
  }
  out.push(...paragraph(xml.slice(list.end)));
  return out;
}

/** Eén `<sec>` met zijn kop, alinea's, tabellen en geneste secties, op diepte `level`. */
function section(xml: string, level: number): string[] {
  const out: string[] = [];
  const clean = xml.replace(/<sec-meta[\s>][\s\S]*?<\/sec-meta>/g, '');
  const head = /^\s*(?:<label[^>]*>([\s\S]*?)<\/label>\s*)?<title[^>]*>([\s\S]*?)<\/title>/.exec(clean);
  if (head) out.push(`${'#'.repeat(Math.min(level, 6))} ${[head[1], head[2]].filter(Boolean).map(inline).join(' ')}`);
  let rest = head ? clean.slice(head.index + head[0].length) : clean;

  // Geneste secties en losse blokken in hun volgorde aflopen. `<sec[\s>]` en niet `<sec\b`, want
  // dat laatste ziet ook `<sec-meta>` als sectie.
  const token = /<sec[\s>]|<p[\s>]|<table-wrap\b[^>]*>([\s\S]*?)<\/table-wrap>|<list-item\b[^>]*>([\s\S]*?)<\/list-item>/g;
  while (rest.length) {
    token.lastIndex = 0;
    const m = token.exec(rest);
    if (!m) break;
    if (m[0].startsWith('<sec') || m[0].startsWith('<p')) {
      const tag = m[0].startsWith('<sec') ? 'sec' : 'p';
      const inner = matchBalanced(rest, m.index, tag);
      out.push(...(tag === 'sec' ? section(inner.body, level + 1) : paragraph(inner.body)));
      rest = rest.slice(inner.end);
      continue;
    }
    if (m[1] !== undefined) {
      const caption = /<caption>([\s\S]*?)<\/caption>/.exec(m[1]);
      if (caption) out.push(inline(caption[1]));
      for (const row of m[1].matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/g)) {
        const cells = [...row[1].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/g)].map((c) => inline(c[1]));
        if (cells.some(Boolean)) out.push(cells.join(' | '));
      }
    } else if (m[2] !== undefined) {
      out.push(`- ${inline(m[2])}`);
    }
    rest = rest.slice(m.index + m[0].length);
  }
  return out;
}

/** De inhoud van een element met geneste elementen van dezelfde naam. */
function matchBalanced(xml: string, start: number, tag: string): { body: string; end: number } {
  const re = new RegExp(`<${tag}(?:\\s[^>]*)?>|</${tag}>`, 'g');
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
    out.push(...section(abstract[1], 2));
  }
  // De hele body als één sectie zonder kop, zodat ook alinea's buiten een <sec> meekomen.
  const body = /<body\b[^>]*>([\s\S]*)<\/body>/.exec(xml);
  if (body) out.push(...section(body[1], 1));
  return out.join('\n\n');
}

/**
 * Mag de volledige tekst in deze (publieke) repo? Alleen bij CC BY of CC0.
 *
 * @ai-why: Europe PMC rekent ook CC BY-NC en CC BY-NC-ND tot open access. Die mogen niet in een
 *   publieke repo van een commercieel product. Liever te streng: CC BY-SA valt er ook buiten.
 */
export function allowsFullText(license: string | undefined): boolean {
  if (!license) return false;
  return /^\s*cc[\s-]?0\s*$/i.test(license) || /^\s*cc[\s-]by(?:[\s-]\d+(?:\.\d+)?)?(?:[\s-]igo)?\s*$/i.test(license);
}

/** Een DOI als bestandsnaam: kleine letters, alles behalve letters en cijfers wordt een streepje. */
export function sourceFileName(doi: string): string {
  return doi.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
