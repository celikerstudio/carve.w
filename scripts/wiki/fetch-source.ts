#!/usr/bin/env tsx
/**
 * Haalt een bron op en zet hem als tekst in `content/wiki/bronnen/` (TDR-0018 §2 en §5).
 *
 *   pnpm wiki:bron <doi> --richtlijn <id>   een richtlijn, als `bronnen/richtlijnen/<id>.md`
 *   pnpm wiki:bron <doi>                     een studie, als `bronnen/studies/<doi-als-naam>.md`
 *
 * Volledige tekst als Europe PMC hem open access heeft (de licentie staat in de kop), anders de
 * samenvatting. Een bestaand bestand wordt niet overschreven zonder --force: de ophaaldatum is
 * juist wat laat zien hoe oud de tekst is.
 *
 * @ai-gotcha: Alleen open access in volledige tekst. Een artikel achter een betaalmuur krijgt hier
 *   zijn samenvatting, en daar mag een leerdoel dan ook alleen op steunen.
 */
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { jatsToText, sourceFileName } from '../../lib/wiki/source-text';
import { CONTENT_DIR } from './files';

const EPMC = 'https://www.ebi.ac.uk/europepmc/webservices/rest';

type EpmcRecord = {
  pmid?: string;
  pmcid?: string;
  doi?: string;
  title?: string;
  authorString?: string;
  pubYear?: string;
  isOpenAccess?: 'Y' | 'N';
  license?: string;
  abstractText?: string;
  journalInfo?: { journal?: { title?: string } };
};

export async function fetchSource(doi: string): Promise<{ meta: Record<string, unknown>; text: string } | null> {
  const res = await fetch(`${EPMC}/search?query=${encodeURIComponent(`DOI:"${doi}"`)}&format=json&resultType=core`);
  if (!res.ok) throw new Error(`Europe PMC: HTTP ${res.status}`);
  const rec = ((await res.json()) as { resultList?: { result?: EpmcRecord[] } }).resultList?.result?.[0];
  if (!rec) return null;

  let text = '';
  let kind: 'full' | 'abstract' = 'abstract';
  if (rec.isOpenAccess === 'Y' && rec.pmcid) {
    const xml = await fetch(`${EPMC}/${rec.pmcid}/fullTextXML`);
    if (xml.ok) {
      text = jatsToText(await xml.text());
      kind = 'full';
    }
  }
  if (!text) text = `## Abstract\n\n${(rec.abstractText ?? '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()}`;

  return {
    meta: {
      doi,
      ...(rec.pmid ? { pmid: rec.pmid } : {}),
      ...(rec.pmcid ? { pmcid: rec.pmcid } : {}),
      title: (rec.title ?? '').replace(/\.$/, ''),
      authors: rec.authorString?.replace(/\.$/, ''),
      journal: rec.journalInfo?.journal?.title,
      year: rec.pubYear ? Number(rec.pubYear) : undefined,
      license: rec.license ?? (rec.isOpenAccess === 'Y' ? 'open access' : 'niet open access'),
      text: kind,
      url: `https://doi.org/${doi}`,
      fetched: new Date().toISOString().slice(0, 10),
    },
    text,
  };
}

export function sourcePath(doi: string, richtlijn?: string): string {
  return richtlijn
    ? path.join(CONTENT_DIR, 'bronnen/richtlijnen', `${richtlijn}.md`)
    : path.join(CONTENT_DIR, 'bronnen/studies', `${sourceFileName(doi)}.md`);
}

export function writeSource(file: string, meta: Record<string, unknown>, text: string) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const clean = Object.fromEntries(Object.entries(meta).filter(([, v]) => v !== undefined));
  fs.writeFileSync(file, matter.stringify(`\n${text}\n`, clean, { lineWidth: -1 } as never));
}

async function main() {
  const args = process.argv.slice(2);
  const doi = args.find((a) => !a.startsWith('--') && a.includes('/'));
  const ri = args.indexOf('--richtlijn');
  const richtlijn = ri >= 0 ? args[ri + 1] : undefined;
  if (!doi || (ri >= 0 && !richtlijn)) {
    console.error('Gebruik: pnpm wiki:bron <doi> [--richtlijn <id>] [--force]');
    process.exit(1);
  }
  const file = sourcePath(doi, richtlijn);
  if (fs.existsSync(file) && !args.includes('--force')) {
    console.log(`${path.relative(process.cwd(), file)} bestaat al (gebruik --force om opnieuw op te halen)`);
    return;
  }
  const got = await fetchSource(doi);
  if (!got) {
    console.error(`${doi}: niet gevonden in Europe PMC`);
    process.exit(1);
  }
  writeSource(file, got.meta, got.text);
  console.log(`${path.relative(process.cwd(), file)}: ${got.meta.text === 'full' ? 'volledige tekst' : 'samenvatting'}, ${got.text.length} tekens, licentie ${got.meta.license}`);
}

if (process.argv[1]?.endsWith('fetch-source.ts')) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
