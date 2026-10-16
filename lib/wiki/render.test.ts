import { describe, expect, it } from 'vitest';
import { renderArticle, splitTakeaway } from './render';

const links = new Map([
  ['hypertrophy', { title: 'Hypertrophy', href: '/wiki/training/hypertrophy' }],
]);

describe('renderArticle', () => {
  it('maakt van elke ## een anker en zet hem in de inhoud', async () => {
    const { html, toc } = await renderArticle('## What is Protein?\n\nText.\n\n## How does it work?\n\nMore.', links);
    expect(toc).toEqual([
      { id: 'what-is-protein', text: 'What is Protein?' },
      { id: 'how-does-it-work', text: 'How does it work?' },
    ]);
    expect(html).toContain('<h2 id="what-is-protein">What is Protein?</h2>');
  });

  it('rendert een takeaway-blok als eigen vlak, met de markdown erin', async () => {
    const md = 'Intro.\n\n:::takeaway\nAim for **1.6 to 2.2 g** per kg.\n:::\n\nAfter.';
    const { html } = await renderArticle(md, links);
    expect(html).toContain('<aside class="wiki-takeaway">');
    expect(html).toContain('<strong>1.6 to 2.2 g</strong>');
    expect(html).toContain('<p>After.</p>');
    expect(html).not.toContain(':::');
  });

  it('rendert een checklist als lijst met label en tekst', async () => {
    const md = ':::checklist\n- Breakfast | Start with at least 30g.\n- Pre-Sleep | Casein helps.\n:::';
    const { html } = await renderArticle(md, links);
    expect(html).toContain('<ul class="wiki-checklist">');
    expect(html).toContain('<li><strong>Breakfast</strong><span>Start with at least 30g.</span></li>');
    expect(html).toContain('<li><strong>Pre-Sleep</strong><span>Casein helps.</span></li>');
  });

  it('maakt van [[slug]] een link met de titel van dat artikel', async () => {
    const { html } = await renderArticle('To maximize [[hypertrophy]], eat enough.', links);
    expect(html).toContain('<a href="/wiki/training/hypertrophy">Hypertrophy</a>');
  });

  it('maakt van een verwijzing [n] een link naar bron n onderaan (TDR-0017 §5)', async () => {
    const { html } = await renderArticle('Most lifters need 1.6 g per kg [1][2].', links);
    expect(html).toContain('<sup class="ref"><a href="#source-1">1</a></sup><sup class="ref"><a href="#source-2">2</a></sup>');
  });

  it('laat een [[slug]] zonder artikel staan als gewone tekst, zonder haken', async () => {
    const { html } = await renderArticle('See [[does-not-exist]] for more.', links);
    expect(html).toContain('See does not exist for more.');
    expect(html).not.toContain('[[');
    expect(html).not.toContain('<a');
  });

  it('haalt ruwe HTML uit de inhoud weg', async () => {
    const { html } = await renderArticle('Hi <script>alert(1)</script> there.', links);
    expect(html).not.toContain('<script');
  });

  it('escapet tekst in een checklist, want die gaat niet door de sanitizer van remark', async () => {
    const { html } = await renderArticle(':::checklist\n- <b>x</b> | <img src=x onerror=1>\n:::', links);
    expect(html).not.toContain('<img');
    expect(html).not.toContain('<b>x</b>');
  });

  it('haalt het eerste takeaway-blok eruit als kort antwoord, en uit de tekst', () => {
    const { takeaway, rest } = splitTakeaway('## A\n\nIntro.\n\n:::takeaway\nAim for **2 g**.\n:::\n\n## B');
    expect(takeaway).toBe('Aim for **2 g**.');
    expect(rest).not.toContain(':::');
    expect(rest).toContain('## B');
  });

  it('laat de tekst staan als er geen takeaway is', () => {
    expect(splitTakeaway('## A\n\nText.')).toEqual({ takeaway: null, rest: '## A\n\nText.' });
  });

  it('zet een & in een kop als teken in de inhoud, en houdt hem uit het anker', async () => {
    const { toc } = await renderArticle('## Timing & Distribution\n\nText.', links);
    expect(toc).toEqual([{ id: 'timing-distribution', text: 'Timing & Distribution' }]);
  });
});
