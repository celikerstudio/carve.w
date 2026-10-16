import type { ArticleTease } from '@/lib/wiki/source-file';
import { GetCarveLink } from './GetCarveLink';

/**
 * Onder het antwoord: een wazige blik op wat een gebruiker op deze plek in de app ziet
 * (TDR-0016 §5).
 *
 * @ai-why: Wazig en niet weg. De bezoeker heeft zijn antwoord al; dit laat zien dat er een
 *   antwoord óver hem bestaat, en dat is de reden om de app te nemen. Een muur voor de tekst
 *   zou Google en de lezer allebei buitensluiten.
 * @ai-gotcha: Elke zin hier is een belofte over de app. Alleen wat de app vandaag kan:
 *   eten loggen met een foto, sets loggen, herstel per spier, weken op rij.
 * @ai-why: Een artikel kan een eigen `tease` hebben in zijn bronbestand (TDR-0017 §8): bij Protein
 *   past "Protein today: 96 of 144 g" beter dan de zin voor heel Nutrition. Zonder `tease` blijft
 *   de zin per categorie hieronder.
 */
const COPY: Record<string, { title: string; line: string; preview: string }> = {
  Nutrition: { title: 'And how much do you eat?', line: 'Snap your plate. Carve counts it and shows your gap.', preview: 'Breakfast is the gap. You average 12 g there.' },
  Supplements: { title: 'Do you already get enough?', line: 'Log your meals. Carve shows what your food already covers.', preview: 'Protein: 121 of 144 g on average.' },
  Training: { title: 'Is your lift still moving?', line: 'Log your sets. Carve shows when a lift stops going up.', preview: 'Bench press: 67.5 kg for 4 weeks.' },
  Recovery: { title: 'Are you recovered?', line: 'Carve shows which muscles are still recovering from your last session.', preview: 'Chest and triceps: still recovering.' },
  Mindset: { title: 'How consistent are you?', line: 'Carve keeps your weeks in a row, so you see it.', preview: '4 weeks in a row.' },
};

export function VisitorTease({ category, article, tease }: { category: string; article?: string; tease?: ArticleTease }) {
  const copy = tease ?? COPY[category] ?? COPY.Nutrition;
  return (
    <div className="wiki-tease">
      <div className="blur" aria-hidden>
        <div className="label">Your week</div>
        <div className="track"><i /></div>
        <div className="line">{copy.preview}</div>
      </div>
      <div className="over">
        <div>
          <b>{copy.title}</b>
          <span>{copy.line}</span>
        </div>
        <GetCarveLink source="wiki_tease" article={article} />
      </div>
    </div>
  );
}
