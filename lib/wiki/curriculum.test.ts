import { describe, expect, it } from 'vitest';
import { checkCurriculum, parseLeerdoelen, type Leerdoel } from './curriculum';

const bron = `## Position statement\n\n- Diets primarily focused on fat loss are driven by a sustained caloric deficit. The higher the baseline\nbody fat level, the more aggressively the caloric deficit may be imposed.\n\n- An intake of 1.4–2.0 g/kg/d is sufficient.`;
const bronnen = new Map([['issn-diets-2017', bron]]);
const artikelen = new Set(['calories', 'protein', 'bcaa']);

const doel = (over: Partial<Leerdoel>): Leerdoel => ({
  id: 'tekort',
  laag: 'fundament',
  doel: 'Weet dat vetverlies uit een tekort komt dat je volhoudt.',
  bron: 'issn-diets-2017',
  passage: 'Diets primarily focused on fat loss are driven by a sustained caloric deficit.',
  artikel: 'calories',
  ...over,
});

describe('leerdoelen lezen', () => {
  it('leest een YAML-lijst', () => {
    const text = `- id: tekort\n  laag: fundament\n  doel: Weet het.\n  bron: issn-diets-2017\n  passage: "Diets primarily focused"\n  artikel: calories\n`;
    expect(parseLeerdoelen(text)).toEqual([
      { id: 'tekort', laag: 'fundament', doel: 'Weet het.', bron: 'issn-diets-2017', passage: 'Diets primarily focused', artikel: 'calories' },
    ]);
  });
});

describe('dekking (TDR-0018 §4)', () => {
  it('keurt een leerdoel goed waarvan de passage letterlijk in de bron staat', () => {
    expect(checkCurriculum([doel({})], bronnen, artikelen).errors).toEqual([]);
  });

  it('vindt de passage ook over een regelafbreking en met een ander streepje', () => {
    const r = checkCurriculum(
      [doel({ passage: 'The higher the baseline body fat level, the more aggressively' }), doel({ id: 'eiwit', passage: 'An intake of 1.4-2.0 g/kg/d is sufficient.' })],
      bronnen,
      artikelen,
    );
    expect(r.errors).toEqual([]);
  });

  it('weigert een passage die niet in de bron staat: dat is precies de verzonnen claim', () => {
    const r = checkCurriculum([doel({ passage: 'Fat loss requires a ketogenic diet.' })], bronnen, artikelen);
    expect(r.errors).toContainEqual(expect.stringMatching(/staat niet in issn-diets-2017/));
  });

  it('weigert een onbekende bron, een onbekend artikel, een onbekende laag en een dubbel id', () => {
    const r = checkCurriculum(
      [doel({ bron: 'bestaat-niet' }), doel({ artikel: 'nergens' }), doel({ laag: 'iets' as never }), doel({})],
      bronnen,
      artikelen,
    );
    expect(r.errors).toContainEqual(expect.stringMatching(/bron "bestaat-niet"/));
    expect(r.errors).toContainEqual(expect.stringMatching(/artikel "nergens"/));
    expect(r.errors).toContainEqual(expect.stringMatching(/laag "iets"/));
    expect(r.errors).toContainEqual(expect.stringMatching(/dubbel/));
  });

  it('meldt leerdoelen zonder artikel en artikelen zonder leerdoel', () => {
    const r = checkCurriculum([doel({}), doel({ id: 'eiwit', passage: 'An intake of 1.4–2.0 g/kg/d is sufficient.', artikel: null })], bronnen, artikelen);
    expect(r.uncovered.map((d) => d.id)).toEqual(['eiwit']);
    expect(r.orphans).toEqual(['bcaa', 'protein']);
  });
});
