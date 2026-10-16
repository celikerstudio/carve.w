import { describe, expect, it } from 'vitest';
import { fromCrossref, fromPubmed, titlesMatch } from './sources';

describe('titels vergelijken', () => {
  it('ziet dezelfde titel ondanks hoofdletters, leestekens en HTML-opmaak', () => {
    expect(titlesMatch('International Society of Sports Nutrition Position Stand: protein and exercise', 'International society of sports nutrition position stand: Protein and exercise.')).toBe(true);
    expect(titlesMatch('Effects of <i>creatine</i> on strength', 'Effects of creatine on strength')).toBe(true);
  });

  it('ziet een andere studie als een andere studie', () => {
    expect(titlesMatch('Protein timing and muscle hypertrophy', 'Creatine supplementation in older adults')).toBe(false);
  });

  it('accepteert een ondertitel die bij de ene bron wel en bij de andere niet staat', () => {
    expect(titlesMatch('Dietary protein for athletes', 'Dietary protein for athletes: from requirements to optimum adaptation')).toBe(true);
  });

  it('laat een te kort stuk niet als overeenkomst tellen', () => {
    expect(titlesMatch('Protein', 'Protein supplementation and muscle mass in elderly people')).toBe(false);
  });
});

describe('antwoorden vertalen', () => {
  it('haalt titel, auteurs, tijdschrift en jaar uit Crossref', () => {
    const meta = fromCrossref({
      title: ['Protein and exercise'],
      author: [{ family: 'Jäger', given: 'Ralf' }, { family: 'Kerksick', given: 'Chad M.' }],
      'container-title': ['Journal of the International Society of Sports Nutrition'],
      issued: { 'date-parts': [[2017, 6, 20]] },
    });
    expect(meta).toEqual({
      title: 'Protein and exercise',
      authors: ['Jäger R', 'Kerksick CM'],
      journal: 'Journal of the International Society of Sports Nutrition',
      year: 2017,
    });
  });

  it('haalt hetzelfde uit PubMed', () => {
    const meta = fromPubmed({
      title: 'Protein and exercise.',
      authors: [{ name: 'Jäger R' }, { name: 'Kerksick CM' }],
      fulljournalname: 'Journal of the International Society of Sports Nutrition',
      pubdate: '2017 Jun 20',
    });
    expect(meta).toEqual({ title: 'Protein and exercise', authors: ['Jäger R', 'Kerksick CM'], journal: 'Journal of the International Society of Sports Nutrition', year: 2017 });
  });
});
