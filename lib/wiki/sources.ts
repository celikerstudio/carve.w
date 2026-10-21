import type { ArticleSource } from './source-file';

/**
 * Bronnen opzoeken bij Crossref (DOI) en PubMed (PMID) (TDR-0017 §4).
 *
 * @ai-why: Opzoeken en niet herinneren. Taalmodellen verzinnen studies die echt lijken: bestaande
 *   auteurs, een plausibel tijdschrift, een titel die nergens bestaat. Onder Furkans naam is dat het
 *   grootste risico van de wiki. Een DOI die niet bestaat of een titel die niet klopt, valt hier af.
 * @ai-gotcha: Dit bewijst dat de studie bestaat, niet dat hij de bewering draagt. Dat is de tweede
 *   controle: `pnpm wiki:check --abstracts` toont de samenvatting naast de `claim`, en die lees je.
 */

export interface SourceMeta {
  title: string;
  authors: string[];
  journal: string;
  year: number;
}

function normalize(title: string): string {
  return title
    .replace(/<[^>]+>/g, '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/**
 * Dezelfde studie? Gelijk na normaliseren, of de ene titel is de andere plus een ondertitel.
 * Het kortste stuk moet minstens vier woorden zijn, anders telt "Protein" als treffer.
 */
export function titlesMatch(a: string, b: string): boolean {
  const x = normalize(a);
  const y = normalize(b);
  if (x === y) return true;
  const [short, long] = x.length <= y.length ? [x, y] : [y, x];
  return short.split(' ').length >= 4 && long.startsWith(short);
}

function cleanTitle(t: string): string {
  // Crossref zet soms een losse ' voor de titel (Devries 2018).
  return t.replace(/<[^>]+>/g, '').replace(/\.\s*$/, '').replace(/^['"\u2018\u201c]+|['"\u2019\u201d]+$/g, '').trim();
}

type CrossrefWork = {
  title?: string[];
  author?: { family?: string; given?: string; name?: string }[];
  'container-title'?: string[];
  issued?: { 'date-parts'?: number[][] };
};

export function fromCrossref(w: CrossrefWork): SourceMeta {
  return {
    title: cleanTitle(w.title?.[0] ?? ''),
    // "Kerksick CM", zoals PubMed het schrijft, zodat beide bronnen dezelfde vorm geven.
    authors: (w.author ?? []).map((p) =>
      p.family ? `${p.family} ${(p.given ?? '').split(/[\s.-]+/).filter(Boolean).map((n) => n[0]).join('')}`.trim() : (p.name ?? ''),
    ),
    // Crossref levert soms entiteiten ("Medicine &amp; Science ...").
    journal: (w['container-title']?.[0] ?? '').replace(/&amp;/g, '&'),
    year: w.issued?.['date-parts']?.[0]?.[0] ?? 0,
  };
}

type PubmedSummary = { title?: string; authors?: { name: string }[]; fulljournalname?: string; pubdate?: string };

export function fromPubmed(s: PubmedSummary): SourceMeta {
  return {
    title: cleanTitle(s.title ?? ''),
    authors: (s.authors ?? []).map((a) => a.name),
    journal: s.fulljournalname ?? '',
    year: Number((s.pubdate ?? '').slice(0, 4)) || 0,
  };
}

const UA = 'CarveWiki/1.0 (https://carve.wiki; source check)';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * @ai-why: Met een pauze en opnieuw proberen bij 429. `pnpm wiki:check` over alle artikelen doet
 *   tientallen verzoeken achter elkaar, en Crossref en NCBI (ongeveer drie per seconde) weigeren
 *   dan. Zonder retry faalde de hele check op een bron die gewoon bestaat.
 */
async function getJson(url: string): Promise<unknown> {
  for (let attempt = 0; ; attempt++) {
    await sleep(350);
    const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json' } });
    if (res.status === 404) return null;
    if (res.status === 429 && attempt < 4) {
      await sleep(1000 * 2 ** attempt);
      continue;
    }
    if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
    return res.json();
  }
}

/** De gegevens zoals de uitgever ze kent, of `null` als de DOI of PMID niet bestaat. */
export async function lookupSource(s: Pick<ArticleSource, 'doi' | 'pmid'>): Promise<SourceMeta | null> {
  if (s.doi) {
    const json = (await getJson(`https://api.crossref.org/works/${encodeURIComponent(s.doi)}`)) as { message?: CrossrefWork } | null;
    return json?.message ? fromCrossref(json.message) : null;
  }
  if (s.pmid) {
    const json = (await getJson(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&retmode=json&id=${s.pmid}`)) as
      | { result?: Record<string, PubmedSummary & { error?: string }> }
      | null;
    const hit = json?.result?.[s.pmid];
    return hit && !hit.error && hit.title ? fromPubmed(hit) : null;
  }
  return null;
}

/** De samenvatting uit PubMed, om naast de `claim` te lezen. Zoekt de PMID bij een DOI zelf op. */
export async function fetchAbstract(s: Pick<ArticleSource, 'doi' | 'pmid'>): Promise<string | null> {
  let pmid = s.pmid;
  if (!pmid && s.doi) {
    const found = (await getJson(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&retmode=json&term=${encodeURIComponent(`${s.doi}[doi]`)}`)) as
      | { esearchresult?: { idlist?: string[] } }
      | null;
    pmid = found?.esearchresult?.idlist?.[0];
  }
  if (!pmid) return null;
  const res = await fetch(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&rettype=abstract&retmode=text&id=${pmid}`, {
    headers: { 'User-Agent': UA },
  });
  return res.ok ? (await res.text()).trim() : null;
}

/** Waar de bron op het web staat: de DOI als die er is, anders PubMed. */
export function sourceUrl(s: Pick<ArticleSource, 'doi' | 'pmid' | 'url'>): string | null {
  if (s.doi) return `https://doi.org/${s.doi}`;
  if (s.pmid) return `https://pubmed.ncbi.nlm.nih.gov/${s.pmid}/`;
  return s.url ?? null;
}
