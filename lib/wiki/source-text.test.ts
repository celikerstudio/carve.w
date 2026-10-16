import { describe, expect, it } from 'vitest';
import { allowsFullText, jatsToText, sourceFileName } from './source-text';

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

describe('licentie (de repo is publiek)', () => {
  it('slaat de volledige tekst alleen op bij CC BY of CC0', () => {
    expect(allowsFullText('cc by')).toBe(true);
    expect(allowsFullText('CC BY 4.0')).toBe(true);
    expect(allowsFullText('cc0')).toBe(true);
    expect(allowsFullText('cc by-nc')).toBe(false);
    expect(allowsFullText('cc by-nc-nd')).toBe(false);
    expect(allowsFullText('cc by-sa')).toBe(false);
    expect(allowsFullText(undefined)).toBe(false);
  });
});

describe('JATS: randgevallen', () => {
  it('neemt een alinea direct in <body> mee, buiten een sectie', () => {
    expect(jatsToText('<article><body><p>Loose paragraph.</p><sec><title>A</title><p>In section.</p></sec></body></article>')).toContain('Loose paragraph.');
  });

  it('zet een lijst in een alinea op eigen regels, los van de inleiding', () => {
    const t = jatsToText('<article><body><sec><title>A</title><p>As follows:<list><list-item><p>An acute dose.</p></list-item><list-item><p>A second.</p></list-item></list></p></sec></body></article>');
    expect(t).toContain('As follows:');
    expect(t).toContain('- An acute dose.');
    expect(t).not.toContain('follows:An');
  });

  it('houdt de kop als er een <label> voor de titel staat', () => {
    expect(jatsToText('<article><body><sec><label>2.</label><title>Methods</title><p>Text.</p></sec></body></article>')).toContain('## 2. Methods');
  });

  it('ziet <sec-meta> niet als een sectie', () => {
    const t = jatsToText('<article><body><sec><sec-meta>x</sec-meta><title>A</title><p>One.</p></sec><sec><title>B</title><p>Two.</p></sec></body></article>');
    expect(t).toContain('## B');
    expect(t).toContain('Two.');
  });
});
