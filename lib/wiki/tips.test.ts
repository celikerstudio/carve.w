import { describe, expect, it } from 'vitest';
import { BODY_MAX, lintTipFile, parseTipFile, TIP_LANGUAGES, tipId } from './tips';

const langs = (title: string, body: string) =>
  TIP_LANGUAGES.map((l) => `    ${l}:\n      title: "${l === 'nl' ? title.replace('Myth:', 'Mythe:') : title}"\n      body: "${body} (${l})"`).join('\n');

const yaml = (tips: string) => `article: creatine\ntips:\n${tips}`;

const fact = `  - key: full-after-weeks\n    kind: fact\n${langs('Creatine', 'With 3 to 5 g a day your muscles are full after 3 to 4 weeks.')}`;
const myth = `  - key: water-weight\n    kind: myth\n${langs('Myth: creatine is only water', 'Not true. It adds a modest amount of strength and lean mass.')}`;

const slugs = new Set(['creatine']);

describe('parseTipFile', () => {
  it('leest artikel, sleutel, soort en alle talen', () => {
    const file = parseTipFile(yaml(`${fact}\n${myth}`));
    expect(file.article).toBe('creatine');
    expect(file.tips.map((t) => [t.key, t.kind])).toEqual([
      ['full-after-weeks', 'fact'],
      ['water-weight', 'myth'],
    ]);
    expect(file.tips[1].texts.nl.title).toBe('Mythe: creatine is only water');
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
    const lang = yaml(fact).replace('With 3 to 5 g a day', 'x'.repeat(BODY_MAX));
    expect(lintTipFile(parseTipFile(lang), 'creatine', slugs).some((e) => e.includes('max 160'))).toBe(true);
  });

  it('weigert de em-dash, markdown en bronnummers', () => {
    const errors = lintTipFile(parseTipFile(yaml(fact.replace('full after', 'full — after').replace('3 to 5 g', '**3 to 5 g** [1]'))), 'creatine', slugs);
    expect(errors.some((e) => e.includes('em-dash'))).toBe(true);
    expect(errors.some((e) => e.includes('markdown'))).toBe(true);
  });

  it('wil "Myth:" en "Mythe:" voor een mythe, en niet voor een feit', () => {
    const mythZonder = myth.replace(/Myth: /g, '').replace(/Mythe: /g, '');
    expect(lintTipFile(parseTipFile(yaml(mythZonder)), 'creatine', slugs).some((e) => e.includes('begint met "Myth:"'))).toBe(true);
    const feitMet = fact.replace(/title: "Creatine"/, 'title: "Myth: Creatine"');
    expect(lintTipFile(parseTipFile(yaml(feitMet)), 'creatine', slugs).some((e) => e.includes('maar kind is fact'))).toBe(true);
  });

  it('maakt het id uit artikel en sleutel', () => {
    expect(tipId('creatine', 'water-weight')).toBe('creatine/water-weight');
  });
});
