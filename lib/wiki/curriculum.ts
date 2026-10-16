import matter from 'gray-matter';

/**
 * De leerdoelen van de wiki: de "eindtermen" in `content/wiki/leerdoelen.yaml` (TDR-0018).
 *
 * @ai-why: Elk leerdoel citeert de passage uit de richtlijn waar het vandaan komt, en die passage
 *   moet letterlijk in de opgeslagen brontekst staan. Zo is "de AI bedacht dit" te onderscheiden van
 *   "de ISSN zegt dit", en wordt een verzonnen eindterm hier gevangen in plaats van in een review.
 * @ai-sync: scripts/wiki/coverage.ts (draait deze controle over de echte bestanden)
 */

export const LAGEN = ['fundament', 'vet-verliezen', 'spier-opbouwen', 'naslag'] as const;
export type Laag = (typeof LAGEN)[number];

export interface Leerdoel {
  id: string;
  laag: Laag;
  /** Wat de lezer na het artikel weet of kan, in één zin. */
  doel: string;
  /** Bestandsnaam zonder .md in `content/wiki/bronnen/richtlijnen/`. */
  bron: string;
  /** Letterlijk uit de brontekst. */
  passage: string;
  /** Het artikel dat dit leerdoel uitlegt, of `null` als dat er nog niet is. */
  artikel: string | null;
}

export function parseLeerdoelen(text: string): Leerdoel[] {
  // gray-matter heeft js-yaml aan boord; zo hoeft er geen tweede YAML-parser bij.
  const data = matter(`---\nitems:\n${text.replace(/^/gm, '  ')}\n---\n`, {}).data.items ?? [];
  return (data as Record<string, unknown>[]).map((d) => ({
    id: String(d.id ?? ''),
    laag: String(d.laag ?? '') as Laag,
    doel: String(d.doel ?? ''),
    bron: String(d.bron ?? ''),
    passage: String(d.passage ?? ''),
    artikel: d.artikel ? String(d.artikel) : null,
  }));
}

/** Witruimte samen, streepjes en aanhalingstekens gelijk, zodat een regelafbreking geen fout geeft. */
function normalize(s: string): string {
  return s
    .replace(/[‐-―−]/g, '-')
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    // Alleen een lijst- of citaatteken weg, niet een minteken: "-0.5 kg" is iets anders dan "0.5 kg".
    .replace(/^[ \t]*(?:>[ \t]*)*(?:[-*][ \t]+)?/gm, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

const MIN_PASSAGE = 40;

/** Staat `needle` in `hay` als geheel, dus niet halverwege een woord of getal ("1.6" in "11.6")? */
function containsWhole(hay: string, needle: string): boolean {
  for (let i = hay.indexOf(needle); i !== -1; i = hay.indexOf(needle, i + 1)) {
    const before = hay[i - 1] ?? ' ';
    const after = hay[i + needle.length] ?? ' ';
    // Alleen een grens eisen aan een kant die zelf op een letter of cijfer eindigt. Een passage die
    // op een punt eindigt mag gevolgd worden door een voetnootnummer ("bout length.16" bij de WHO).
    const okBefore = !/[a-z0-9]/.test(needle[0]) || !/[a-z0-9]/.test(before);
    const okAfter = !/[a-z0-9]/.test(needle[needle.length - 1]) || !/[a-z0-9]/.test(after);
    if (okBefore && okAfter) return true;
  }
  return false;
}

export function checkCurriculum(
  leerdoelen: Leerdoel[],
  bronnen: Map<string, string>,
  artikelen: Set<string>,
): { errors: string[]; uncovered: Leerdoel[]; orphans: string[] } {
  const errors: string[] = [];
  const seen = new Set<string>();
  const normalized = new Map([...bronnen].map(([k, v]) => [k, normalize(v)]));

  for (const d of leerdoelen) {
    const label = d.id || '(zonder id)';
    if (seen.has(d.id)) errors.push(`${label}: dubbel id`);
    seen.add(d.id);
    if (!(LAGEN as readonly string[]).includes(d.laag)) errors.push(`${label}: laag "${d.laag}" bestaat niet (${LAGEN.join(', ')})`);
    if (!d.doel.trim()) errors.push(`${label}: zegt niet wat de lezer weet`);
    const text = normalized.get(d.bron);
    if (text === undefined) errors.push(`${label}: bron "${d.bron}" staat niet in bronnen/richtlijnen/`);
    else if (normalize(d.passage).length < MIN_PASSAGE) errors.push(`${label}: passage is te kort om iets te bewijzen (minder dan ${MIN_PASSAGE} tekens)`);
    else if (!containsWhole(text, normalize(d.passage))) errors.push(`${label}: passage staat niet in ${d.bron}: "${d.passage.slice(0, 80)}"`);
    if (d.artikel && !artikelen.has(d.artikel)) errors.push(`${label}: artikel "${d.artikel}" bestaat niet`);
  }

  const covered = new Set(leerdoelen.map((d) => d.artikel).filter(Boolean));
  return {
    errors,
    uncovered: leerdoelen.filter((d) => !d.artikel),
    orphans: [...artikelen].filter((a) => !covered.has(a)).sort(),
  };
}
