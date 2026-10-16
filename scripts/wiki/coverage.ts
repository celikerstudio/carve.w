#!/usr/bin/env tsx
/**
 * Hoe ver de wiki is ten opzichte van zijn leerdoelen (TDR-0018 §4).
 *
 *   pnpm wiki:dekking            per laag: hoeveel leerdoelen een artikel hebben, en wat er mist
 *   pnpm wiki:dekking --wezen    ook de artikelen die bij geen enkel leerdoel horen
 *
 * Stopt met code 1 als een leerdoel niet klopt: een passage die niet letterlijk in de richtlijn
 * staat, een bron of artikel dat niet bestaat. Ontbrekende artikelen zijn geen fout, dat is werk.
 *
 * @ai-sync: lib/wiki/curriculum.ts
 */
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { LAGEN, checkCurriculum, parseLeerdoelen } from '../../lib/wiki/curriculum';
import { CONTENT_DIR, readArticleFiles } from './files';

const file = path.join(CONTENT_DIR, 'leerdoelen.yaml');
const dir = path.join(CONTENT_DIR, 'bronnen/richtlijnen');

const leerdoelen = fs.existsSync(file) ? parseLeerdoelen(fs.readFileSync(file, 'utf8')) : [];
const bronnen = new Map(
  fs.readdirSync(dir).filter((f) => f.endsWith('.md')).map((f) => [f.replace(/\.md$/, ''), matter(fs.readFileSync(path.join(dir, f), 'utf8'), {}).content]),
);
const artikelen = readArticleFiles();
const reviewed = new Set(artikelen.filter((a) => a.file.status === 'reviewed').map((a) => a.file.slug));
const { errors, uncovered, orphans } = checkCurriculum(leerdoelen, bronnen, new Set(artikelen.map((a) => a.file.slug)));

for (const laag of LAGEN) {
  const eigen = leerdoelen.filter((d) => d.laag === laag);
  if (!eigen.length) continue;
  const metArtikel = eigen.filter((d) => d.artikel).length;
  const klaar = eigen.filter((d) => d.artikel && reviewed.has(d.artikel)).length;
  console.log(`${laag.padEnd(15)} ${String(eigen.length).padStart(3)} leerdoelen · ${metArtikel} met artikel · ${klaar} beoordeeld`);
}
if (uncovered.length) {
  console.log(`\nNog zonder artikel (${uncovered.length}):`);
  uncovered.forEach((d) => console.log(`  ${d.laag.padEnd(15)} ${d.id}: ${d.doel}`));
}
console.log(`\n${orphans.length} van de ${artikelen.length} artikelen dienen geen leerdoel.`);
if (process.argv.includes('--wezen')) console.log(`  ${orphans.join(', ')}`);

if (errors.length) {
  console.log(`\n✗ ${errors.length} ${errors.length === 1 ? 'fout' : 'fouten'} in leerdoelen.yaml:`);
  errors.forEach((e) => console.log(`  ${e}`));
  process.exit(1);
}
