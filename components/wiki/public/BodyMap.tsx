'use client';

import Link from 'next/link';
import { useState } from 'react';

export interface BodyMapCategory {
  name: string;
  slug: string;
  count: number;
  /** De sterkste artikelen eerst, hooguit zeven. */
  articles: { title: string; href: string; evidence: number }[];
}

type Figure = 'man' | 'woman';

/**
 * De home van de wiki: tik op een deel van het lichaam en lees wat de wetenschap erover zegt
 * (richting C uit de companion, 2026-10-16; TDR-0016).
 *
 * @ai-why: Het personage als navigatie, omdat dat het enige is wat geen andere fitness-wiki
 *   heeft. Hoofd is Mindset, spieren Training, buik Nutrition, hand Supplements, benen Recovery.
 * @ai-why: Monochroom zoals de app: een witte stip, en wat gekozen is een witte pil met zwarte
 *   tekst (`selection` in de app). Het goud uit de companion is bewust weg.
 * @ai-fragile: De punten staan in procenten van de tekening, gemeten op 2026-10-16 (de hand op
 *   het midden van de witte handband, de benen boven de kniebeschermer). Wordt het personage opnieuw
 *   gegenereerd (Carve-AI `Scripts/character/generate.py`), kijk dan of ze nog op het lijf vallen.
 */
const POINTS: Record<Figure, { category: string; x: number; y: number; left?: boolean; label: string }[]> = {
  man: [
    { category: 'Mindset', x: 50, y: 8, label: 'Your head' },
    { category: 'Training', x: 21, y: 28, left: true, label: 'Your muscles' },
    { category: 'Nutrition', x: 50, y: 36, label: 'Your fuel' },
    { category: 'Supplements', x: 91, y: 53, label: 'What you add' },
    { category: 'Recovery', x: 34, y: 64, left: true, label: 'Your legs, your sleep' },
  ],
  woman: [
    { category: 'Mindset', x: 50, y: 8, label: 'Your head' },
    { category: 'Training', x: 24, y: 28, left: true, label: 'Your muscles' },
    { category: 'Nutrition', x: 50, y: 37, label: 'Your fuel' },
    { category: 'Supplements', x: 89, y: 52, label: 'What you add' },
    { category: 'Recovery', x: 35, y: 64, left: true, label: 'Your legs, your sleep' },
  ],
};

// @ai-gotcha: Man en vrouw hebben een andere breedte (581 en 538 bij 1400, zie Carve-AI
//   `CharacterAvatar.headArt`). Met één verhouding voor allebei werd de man ingedrukt en vielen
//   de punten naast het lijf (Supplements op de broekband in plaats van bij de hand).
const ART: Record<Figure, { body: string; hair: string; ratio: string }> = {
  man: { body: '/character/character_man_s3_front.png', hair: '/character/character_man_front_hair_crew.png', ratio: '581 / 1400' },
  woman: { body: '/character/character_woman_s3_front.png', hair: '/character/character_woman_front_hair_ponytail.png', ratio: '538 / 1400' },
};

export function BodyMap({ categories }: { categories: BodyMapCategory[] }) {
  const [figure, setFigure] = useState<Figure>('man');
  const [selected, setSelected] = useState('Nutrition');
  const current = categories.find((c) => c.name === selected) ?? categories[0];
  const point = POINTS[figure].find((p) => p.category === current?.name);

  return (
    <section className="wiki-stage">
      <div className="wiki-stage-intro">
        <div className="eyebrow">{categories.reduce((n, c) => n + c.count, 0)} articles · rated by evidence</div>
        <h1>
          Know your
          <br />
          body.
        </h1>
        <p>Tap a part of you. Read what the science says about it.</p>
      </div>

      <div className="wiki-figwrap">
        <div className="wiki-fig" style={{ aspectRatio: ART[figure].ratio }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- lagen die exact op elkaar moeten vallen */}
          <img src={ART[figure].body} alt="" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={ART[figure].hair} alt="" className="hair" />
          {POINTS[figure].map((p) => (
            <button
              key={p.category}
              type="button"
              className={`wiki-pt${p.left ? ' left' : ''}`}
              style={{ left: `${p.x}%`, top: `${p.y}%` }}
              aria-pressed={p.category === selected}
              onClick={() => setSelected(p.category)}
            >
              <i />
              <span>{p.category}</span>
            </button>
          ))}
        </div>
        <div className="wiki-floor" />
        <div className="wiki-who" role="group" aria-label="Figure">
          <button type="button" aria-pressed={figure === 'man'} onClick={() => setFigure('man')}>Him</button>
          <button type="button" aria-pressed={figure === 'woman'} onClick={() => setFigure('woman')}>Her</button>
        </div>
      </div>

      {current && (
        <div className="wiki-panel" key={current.name}>
          <div className="k">{point?.label}</div>
          <h2>{current.name}</h2>
          <div className="n">{current.count} articles</div>
          <div className="wiki-list">
            {current.articles.map((a, i) => (
              <Link key={a.href} href={a.href} style={{ animationDelay: `${i * 35}ms` }}>
                {a.title}
                <span />
              </Link>
            ))}
          </div>
          <Link className="all" href={`/wiki/${current.slug}`}>
            All {current.name.toLowerCase()} articles
          </Link>
        </div>
      )}
    </section>
  );
}
