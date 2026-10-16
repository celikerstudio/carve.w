import { describe, expect, it } from 'vitest';
import { hasOpenNotes, lintArticle, listChecks, parseArticleFile, stripChecks, serializeArticleFile, toSearchText, type ArticleFile } from './source-file';

const ok: ArticleFile = {
  slug: 'protein',
  title: 'Protein',
  category: 'Nutrition',
  summary: 'How much protein you need to build muscle.',
  evidence: 'well-established',
  status: 'draft',
  tags: ['protein'],
  citationIds: ['issn-protein-2017'],
  sources: [],
  body: [
    '## What is protein?',
    '',
    'Protein builds muscle. See [[hypertrophy]].',
    '',
    ':::takeaway',
    'Eat **1.6 to 2.2 g per kg** a day.',
    ':::',
    '',
    ':::checklist',
    '- Breakfast | Start with 30 g.',
    ':::',
  ].join('\n'),
};

const slugs = new Set(['protein', 'hypertrophy']);
const source = {
  doi: '10.1186/s12970-017-0177-8',
  title: 'International Society of Sports Nutrition Position Stand: protein and exercise',
  authors: ['Jäger R', 'Kerksick CM'],
  journal: 'Journal of the International Society of Sports Nutrition',
  year: 2017,
  claim: '1.4 to 2.0 g/kg/day is sufficient for most exercising people.',
};

describe('het bestandsformaat', () => {
  it('leest terug wat het schrijft', () => {
    const file = { ...ok, sources: [source] };
    expect(parseArticleFile('protein', serializeArticleFile(file))).toEqual(file);
  });

  it('laat lege optionele velden weg uit de frontmatter', () => {
    const text = serializeArticleFile({ ...ok, citationIds: [], sources: [] });
    expect(text).not.toMatch(/citation_ids|sources|tease/);
  });
});

describe('opmaakregels (TDR-0017 §5)', () => {
  it('keurt een gewoon concept goed', () => {
    expect(lintArticle(ok, slugs)).toEqual([]);
  });

  it('weigert een tabel, want de app toont hem als losse streepjes', () => {
    const body = `${ok.body}\n\n| a | b |\n|---|---|\n| 1 | 2 |`;
    expect(lintArticle({ ...ok, body }, slugs)).toContainEqual(expect.stringMatching(/tabel/));
  });

  it('weigert een blok dat de app niet kent', () => {
    const body = `${ok.body}\n\n:::experience\nI did this.\n:::`;
    expect(lintArticle({ ...ok, body }, slugs)).toContainEqual(expect.stringMatching(/:::experience/));
  });

  it('weigert een link naar een artikel dat niet bestaat', () => {
    const body = ok.body.replace('[[hypertrophy]]', '[[-volume]]');
    expect(lintArticle({ ...ok, body }, slugs)).toContainEqual(expect.stringMatching(/-volume/));
  });

  it('weigert een checklist-regel zonder " | ", want de app splitst daarop', () => {
    const body = ok.body.replace('Breakfast | Start', 'Breakfast|Start');
    expect(lintArticle({ ...ok, body }, slugs)).toContainEqual(expect.stringMatching(/checklist/));
  });

  it('weigert een externe link in de tekst: bronnen horen in de bronnenlijst', () => {
    const body = `${ok.body}\n\nSee [this](https://example.com).`;
    expect(lintArticle({ ...ok, body }, slugs)).toContainEqual(expect.stringMatching(/externe link/));
  });

  it('weigert een verwijzing [n] zonder bron n', () => {
    const body = `${ok.body}\n\nMost people need more [2].`;
    expect(lintArticle({ ...ok, body, sources: [source] }, slugs)).toContainEqual(expect.stringMatching(/\[2\]/));
  });

  it('eist een takeaway: het antwoord staat bovenaan (TDR-0016 §4)', () => {
    const body = ok.body.replace(/:::takeaway[\s\S]*?:::\n/, '');
    expect(lintArticle({ ...ok, body }, slugs)).toContainEqual(expect.stringMatching(/takeaway/));
  });

  it('eist bij een beoordeeld artikel minstens één bron', () => {
    expect(lintArticle({ ...ok, status: 'reviewed' }, slugs)).toContainEqual(expect.stringMatching(/bron/));
    expect(lintArticle({ ...ok, status: 'reviewed', sources: [source] }, slugs)).toEqual([]);
  });

  it('eist dat elke bron een DOI of PubMed-ID en een bewering heeft', () => {
    const errors = lintArticle({ ...ok, sources: [{ ...source, doi: undefined, claim: '' }] }, slugs);
    expect(errors).toContainEqual(expect.stringMatching(/DOI of PubMed/));
    expect(errors).toContainEqual(expect.stringMatching(/bewering/));
  });

  it('meldt een open notitie voor Furkan: die hoort niet in de app of op het web', () => {
    const body = `${ok.body}\n\n<!-- FURKAN: jouw stuk hier -->`;
    expect(lintArticle({ ...ok, body }, slugs)).toContainEqual(expect.stringMatching(/open notitie/));
    expect(hasOpenNotes(body)).toBe(true);
    expect(hasOpenNotes(ok.body)).toBe(false);
  });

  it('weigert opmaak die de app als kale tekst toont', () => {
    for (const extra of ['#### Klein', '> Citaat', '```\ncode\n```', '---', 'Zie [protein](/wiki/nutrition/protein).', '## Key Takeaways']) {
      expect(lintArticle({ ...ok, body: `${ok.body}\n\n${extra}` }, slugs).length, extra).toBeGreaterThan(0);
    }
  });

  it('weigert een lijst in de takeaway, want de app plakt die tot één regel', () => {
    const body = ok.body.replace('Eat **1.6 to 2.2 g per kg** a day.', '- One\n- Two');
    expect(lintArticle({ ...ok, body }, slugs)).toContainEqual(expect.stringMatching(/takeaway/));
  });

  it('weigert een onbekende categorie', () => {
    expect(lintArticle({ ...ok, category: 'jiujitsu' }, slugs)).toContainEqual(expect.stringMatching(/categorie/));
  });
});

describe('zoektekst', () => {
  it('maakt platte tekst voor de zoekvector, zonder opmaak en met de linktekst', () => {
    expect(toSearchText('## Kop\n\n**Vet** en [[hypertrophy|groei]] [1].\n\n:::takeaway\nEet.\n:::')).toBe('Kop Vet en groei. Eet.');
  });
});

describe(':::check (TDR-0018 §6)', () => {
  const withCheck = `${ok.body}\n\n:::check\nMost people lose 1 kg a week at first.\n:::\n\nLast line.`;

  it('haalt een check-blok weg uit wat naar buiten gaat, en laat de rest staan', () => {
    const out = stripChecks(withCheck);
    expect(out).not.toContain('Most people lose');
    expect(out).not.toMatch(/^:::check\s*$/m);
    expect(out).toContain('Last line.');
    expect(out).not.toMatch(/\n{3,}/);
  });

  it('geeft de open checks terug voor de redactielijst', () => {
    expect(listChecks(withCheck)).toEqual(['Most people lose 1 kg a week at first.']);
  });

  it('keurt een artikel met een check goed: de check gaat toch niet mee', () => {
    expect(lintArticle({ ...ok, body: withCheck }, slugs)).toEqual([]);
  });

  it('haalt ook een ingesprongen check weg, want de app trimt de regel en toont hem anders', () => {
    const body = `${ok.body}\n\n- item\n  :::check\n  secret\n  :::`;
    expect(stripChecks(body)).not.toContain('secret');
  });

  it('weigert wat na het strippen nog naar ::: ruikt: geneste checks en losse sluiters', () => {
    const nested = `${ok.body}\n\n:::check\na\n:::check\nb\n:::\nsecret tail\n:::`;
    expect(lintArticle({ ...ok, body: nested }, slugs).length).toBeGreaterThan(0);
    const stray = `${ok.body}\n\n:::`;
    expect(lintArticle({ ...ok, body: stray }, slugs)).toContainEqual(expect.stringMatching(/:::/));
  });

  it('controleert de opmaak in een check niet, want die tekst gaat niet naar de app', () => {
    const body = `${ok.body}\n\n:::check\n| a | b |\n:::`;
    expect(lintArticle({ ...ok, body }, slugs)).toEqual([]);
  });
});
