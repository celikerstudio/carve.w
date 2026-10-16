import { GetCarveLink } from './GetCarveLink';

/**
 * Het Carve-personage rechts naast een artikel: de speelse plek en het tweede verkoopmoment
 * (TDR-0016 §5).
 *
 * @ai-why: De vrouw en niet de man: de bezoeker is nog niemand, en de man is in de app de
 *   standaard. De spieren gloeien op en uit om te laten zien wat de app doet, zonder uitleg.
 * @ai-why: Drie lagen van dezelfde tekening als in de app: verbleekt eronder, fel erboven door
 *   een spiermasker heen, en het haar erop. Zie Carve-AI `CharacterBody.swift`.
 * @ai-fragile: De plaatjes in `public/character/` zijn kopieën uit de asset-catalogus van de app
 *   (Carve-AI `Assets.xcassets/character`), verkleind tot 700 px hoog. Wordt het personage daar
 *   opnieuw gegenereerd, kopieer ze dan opnieuw; anders loopt de wiki een stadium achter.
 */
export function CharacterCard() {
  return (
    <div className="wiki-hero">
      <span className="tag">This could be you</span>
      <div className="fig" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element -- lagen die exact op elkaar moeten vallen */}
        <img src="/character/character_woman_s3_front_faded.png" alt="" />
        <div className="lit" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/character/character_woman_front_hair_ponytail.png" alt="" />
      </div>
      <div className="floor" />
      <b>Eat it. Train it. See it.</b>
      <p>Your Carve character lights up what you trained and grows as you get stronger.</p>
      <GetCarveLink source="wiki_character" />
    </div>
  );
}
