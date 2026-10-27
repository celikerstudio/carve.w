import { describe, expect, it } from 'vitest';
import { BODY_MAX, lintTipFile, parseTipFile, TIP_LANGUAGES, TITLE_MAX, tipId } from './tips';

const langs = (title: string, body: string) =>
  TIP_LANGUAGES.map((l) => `    ${l}:\n      title: "${title}"\n      body: "${l === 'nl' ? body.replace('Myth:', 'Mythe:') : body} (${l})"`).join('\n');

const yaml = (tips: string, emoji = '💊') => `article: creatine\nemoji: "${emoji}"\ntips:\n${tips}`;

const fact = `  - key: full-after-weeks\n    kind: fact\n${langs('3 to 5 g', 'A day is enough. Your muscles are full after 3 to 4 weeks.')}`;
const myth = `  - key: water-weight\n    kind: myth\n${langs('Water', 'Myth: creatine is only water. It adds real strength and lean mass.')}`;

const slugs = new Set(['creatine']);

describe('parseTipFile', () => {
  it('leest artikel, sleutel, soort en alle talen', () => {
    const file = parseTipFile(yaml(`${fact}\n${myth}`));
    expect(file.article).toBe('creatine');
    expect(file.tips.map((t) => [t.key, t.kind])).toEqual([
      ['full-after-weeks', 'fact'],
      ['water-weight', 'myth'],
    ]);
    expect(file.emoji).toBe('💊');
    expect(file.tips[1].texts.nl.body).toMatch(/^Mythe: creatine/);
    expect(file.tips[0].texts.tr.body).toContain('(tr)');
  });
});

describe('lintTipFile', () => {
  it('keurt een goed bestand goed', () => {
    expect(lintTipFile(parseTipFile(yaml(`${fact}\n${myth}`)), 'creatine', slugs)).toEqual([]);
  });

  it('wil een artikel dat bestaat en dezelfde naam heeft als het bestand', () => {
    const errors = lintTipFile(parseTipFile(yaml(fact)), 'protein', new Set(['protein']));
    expect(errors.join('\n')).toMatch(/bestandsnaam/);
    expect(errors.join('\n')).toMatch(/geen artikel "creatine"/);
  });

  it('vangt een ontbrekende taal', () => {
    const zonderTurks = yaml(fact).replace(/\n {4}tr:\n.*\n.*/, '');
    expect(lintTipFile(parseTipFile(zonderTurks), 'creatine', slugs)).toContain('tip 1 (full-after-weeks) tr: titel ontbreekt');
  });

  it('vangt een dubbele sleutel', () => {
    const errors = lintTipFile(parseTipFile(yaml(`${fact}\n${fact.replace(/3 to 5/g, 'Three to five')}`)), 'creatine', slugs);
    expect(errors.some((e) => e.includes('key komt twee keer voor'))).toBe(true);
  });

  it('vangt dezelfde tekst onder een andere sleutel', () => {
    const errors = lintTipFile(parseTipFile(yaml(`${fact}\n${fact.replace('full-after-weeks', 'again')}`)), 'creatine', slugs);
    expect(errors.some((e) => e.includes('dezelfde tekst'))).toBe(true);
  });

  it('weigert een tekst die niet op het lockscreen past', () => {
    const lang = yaml(fact).replace('A day is enough.', 'x'.repeat(BODY_MAX));
    expect(lintTipFile(parseTipFile(lang), 'creatine', slugs).some((e) => e.includes(`max ${BODY_MAX}`))).toBe(true);
  });

  it('wil een korte titel zonder emoji of "Mythe", want de app zet emoji en datum ervoor', () => {
    const lang = yaml(fact.replace('title: "3 to 5 g"', `title: "${'x'.repeat(TITLE_MAX + 1)}"`));
    expect(lintTipFile(parseTipFile(lang), 'creatine', slugs).some((e) => e.includes(`max ${TITLE_MAX}`))).toBe(true);
    const metEmoji = yaml(fact.replace('title: "3 to 5 g"', 'title: "💊 3 to 5 g"'));
    expect(lintTipFile(parseTipFile(metEmoji), 'creatine', slugs).some((e) => e.includes('geen emoji in de titel'))).toBe(true);
    const metMythe = yaml(myth.replace(/title: "Water"/g, 'title: "Myth: water"'));
    expect(lintTipFile(parseTipFile(metMythe), 'creatine', slugs).some((e) => e.includes('hoort in de tekst'))).toBe(true);
  });

  it('wil precies één emoji per bestand, en per tip als die afwijkt', () => {
    expect(lintTipFile(parseTipFile(yaml(fact, '')), 'creatine', slugs).some((e) => e.includes('emoji moet'))).toBe(true);
    expect(lintTipFile(parseTipFile(yaml(fact, '💊💪')), 'creatine', slugs).some((e) => e.includes('emoji moet'))).toBe(true);
    expect(lintTipFile(parseTipFile(yaml(fact, '🏋️‍♀️')), 'creatine', slugs)).toEqual([]);
    expect(lintTipFile(parseTipFile(yaml(fact, 'pil')), 'creatine', slugs).some((e) => e.includes('emoji moet'))).toBe(true);
    const eigen = parseTipFile(yaml(fact.replace('kind: fact', 'kind: fact\n    emoji: "😴"')));
    expect(eigen.tips[0].emoji).toBe('😴');
    expect(lintTipFile(eigen, 'creatine', slugs)).toEqual([]);
  });

  it('weigert de em-dash, markdown en bronnummers', () => {
    const errors = lintTipFile(parseTipFile(yaml(fact.replace('full after', 'full — after').replace('3 to 5 g', '**3 to 5 g** [1]'))), 'creatine', slugs);
    expect(errors.some((e) => e.includes('em-dash'))).toBe(true);
    expect(errors.some((e) => e.includes('markdown'))).toBe(true);
  });

  it('wil "Myth:" en "Mythe:" vooraan de tekst van een mythe, en niet bij een feit', () => {
    const mythZonder = myth.replace(/Myth: /g, '');
    expect(lintTipFile(parseTipFile(yaml(mythZonder)), 'creatine', slugs).some((e) => e.includes('begint met "Myth:"'))).toBe(true);
    const feitMet = fact.replace(/body: "A day/g, 'body: "Myth: a day');
    expect(lintTipFile(parseTipFile(yaml(feitMet)), 'creatine', slugs).some((e) => e.includes('maar kind is fact'))).toBe(true);
  });

  it('maakt het id uit artikel en sleutel', () => {
    expect(tipId('creatine', 'water-weight')).toBe('creatine/water-weight');
  });
});
