'use client';

import { useState } from 'react';
import { calculate, type Calculator } from '@/lib/wiki/catalog';

/**
 * Het antwoord bovenaan, uitgerekend voor het gewicht van de lezer (TDR-0016 §4).
 *
 * @ai-why: Begint op 80 kg en niet leeg. Een leeg veld vraagt eerst iets van de bezoeker; een
 *   antwoord dat er al staat en dat hij kan bijstellen geeft eerst iets. 80 kg is ook het getal
 *   dat in het artikel als voorbeeld staat.
 */
export function AnswerCalculator({ calc }: { calc: Calculator }) {
  const [kg, setKg] = useState(80);
  const [lo, hi] = calculate(calc, kg);
  const [before, after] = calc.sentence.split('{range}');
  return (
    <>
      <div className="lead">
        {before}
        <b>
          {lo} to {hi} {calc.unit}
        </b>
        {after}
      </div>
      <div className="wiki-calc">
        <button type="button" aria-label="Less" onClick={() => setKg((k) => Math.max(35, k - 1))}>−</button>
        <output aria-live="polite">{kg} kg</output>
        <button type="button" aria-label="More" onClick={() => setKg((k) => Math.min(200, k + 1))}>+</button>
      </div>
      <div className="note">{calc.basis}</div>
    </>
  );
}
