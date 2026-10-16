import { describe, expect, it } from 'vitest';
import { jatsToText, sourceFileName } from './source-text';

const xml = `<article><front><article-meta><abstract><sec><title>Background</title><p>Protein matters <xref ref-type="bibr" rid="B1">[1]</xref>.</p></sec></abstract></article-meta></front>
<body><sec><title>Position statement</title><p>1. An intake of 1.4&#x2013;2.0 g/kg/d is sufficient.</p>
<sec><title>Timing</title><p>Spread it <italic>evenly</italic> over the day.</p></sec></sec>
<sec><title>Tables</title><table-wrap><caption><p>Table 1</p></caption><table><tr><td>Whey</td><td>Fast</td></tr></table></table-wrap></sec></body>
<back><ref-list><ref><mixed-citation>Someone 2001.</mixed-citation></ref></ref-list></back></article>`;

describe('JATS naar tekst', () => {
  it('houdt de samenvatting en de koppen van de tekst, als markdown-koppen', () => {
    const text = jatsToText(xml);
    expect(text).toContain('## Abstract');
    expect(text).toContain('### Background');
    expect(text).toContain('## Position statement');
    expect(text).toContain('### Timing');
  });

  it('zet entiteiten om en laat opmaak en verwijzingsnummers als gewone tekst staan', () => {
    const text = jatsToText(xml);
    expect(text).toContain('1. An intake of 1.4–2.0 g/kg/d is sufficient.');
    expect(text).toContain('Spread it evenly over the day.');
    expect(text).toContain('Protein matters [1].');
  });

  it('neemt tabellen mee als regels met cellen, want daar staan vaak de getallen', () => {
    expect(jatsToText(xml)).toContain('Whey | Fast');
  });

  it('laat de literatuurlijst weg', () => {
    expect(jatsToText(xml)).not.toContain('Someone 2001');
  });
});

describe('bestandsnaam', () => {
  it('maakt van een DOI een veilige naam', () => {
    expect(sourceFileName('10.1016/S0140-6736(11)60812-X')).toBe('10-1016-s0140-6736-11-60812-x');
  });
});
