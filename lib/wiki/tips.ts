import matter from 'gray-matter';

/**
 * De tip van de dag: korte tips per artikel in `content/tips/<slug>.yaml`, die de app elke dag om
 * 12:15 als melding stuurt (Carve-AI ADR-105).
 *
 * @ai-why: Een eigen bestand per artikel en niet in de frontmatter. Vijf tips in zeven talen zou
 *   elk artikel een bestand maken dat je niet meer leest. Dezelfde slug houdt de koppeling.
 * @ai-why: De tekst staat er in alle zeven app-talen. De melding wordt op het toestel ingepland
 *   en kan dus niet bij het tonen nog vertaald worden; een ontbrekende taal zou op het lockscreen
 *   Engels zijn onder een Nederlandse app.
 * @ai-sync: scripts/wiki/sync.ts (schrijft deze tips naar wiki_tips)
 * @ai-sync: ../Carve-AI/Carve AI/App/Models/Wiki/WikiTip.swift (leest texts per taal, kind)
 */

/** De talen van de app (`*.lproj` in Carve-AI). Engels is de terugval. */
export const TIP_LANGUAGES = ['en', 'nl', 'de', 'es', 'fr', 'pt', 'tr'] as const;
export type TipLanguage = (typeof TIP_LANGUAGES)[number];

/** `fact`: iets wat klopt. `myth`: een wijsheid die niet klopt; de tekst begint dan met "Mythe:". */
export const TIP_KINDS = ['fact', 'myth'] as const;
export type TipKind = (typeof TIP_KINDS)[number];

export interface TipText {
  /** De kop na de datum: `🍗 27 okt · <title>`. Een getal uit de tip, of een kort onderwerp. */
  title: string;
  body: string;
}

export interface Tip {
  /** Vast per tip, ook als de tekst verandert: de app onthoudt welke tips je al zag op `<slug>/<key>`. */
  key: string;
  kind: TipKind;
  /** Alleen als deze tip een ander onderwerp heeft dan de rest van het artikel. */
  emoji?: string;
  texts: Record<TipLanguage, TipText>;
}

export interface TipFile {
  article: string;
  /** Het onderwerp van het artikel, vooraan in de kop van elke tip (ADR-105 §11). */
  emoji: string;
  tips: Tip[];
}

/**
 * @ai-why: De kop op het lockscreen is één regel: `🍗 27 okt · ` plus deze titel, met de tijd ernaast.
 *   Daar is zo'n 22 tekens ruimte voor; langer kapt iOS af met "...", en dan valt het getal weg.
 * @ai-why: De tekst is één of twee korte zinnen (ADR-105 §10, Furkan: "te bulky en lang"). Tot
 *   2026-10-27 mocht het 160 tekens zijn, en dat waren dan vier volle regels.
 */
export const TITLE_MAX = 22;
export const BODY_MIN = 20;
export const BODY_MAX = 120;

/** Waar de tekst van een mythe mee begint, per taal waarvan we het voorvoegsel zeker weten. */
export const MYTH_PREFIX: Partial<Record<TipLanguage, string>> = { en: 'Myth:', nl: 'Mythe:' };

/** Eén emoji, eventueel met huidskleur of variatieteken, en verder niets. */
const SINGLE_EMOJI = /^\p{Extended_Pictographic}[\u{FE0F}\u{1F3FB}-\u{1F3FF}]*(\u{200D}\p{Extended_Pictographic}[\u{FE0F}\u{1F3FB}-\u{1F3FF}]*)*$/u;

export const tipId = (article: string, key: string) => `${article}/${key}`;

export function parseTipFile(text: string): TipFile {
  // Zelfde truc als parseLeerdoelen: gray-matter heeft js-yaml aan boord.
  const data = matter(`---\n${text}\n---\n`, {}).data as Record<string, unknown>;
  const tips = Array.isArray(data.tips) ? data.tips : [];
  return {
    article: String(data.article ?? ''),
    emoji: String(data.emoji ?? '').trim(),
    tips: tips.map((raw: Record<string, unknown>) => ({
      key: String(raw?.key ?? ''),
      kind: String(raw?.kind ?? '') as TipKind,
      ...(raw?.emoji ? { emoji: String(raw.emoji).trim() } : {}),
      texts: Object.fromEntries(
        TIP_LANGUAGES.map((lang) => {
          const t = (raw?.[lang] ?? {}) as Record<string, unknown>;
          return [lang, { title: String(t.title ?? '').trim(), body: String(t.body ?? '').trim() }];
        }),
      ) as Record<TipLanguage, TipText>,
    })),
  };
}

const KEY = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/**
 * Alles wat een tip ongeschikt maakt voor het lockscreen. Leeg = goed.
 *
 * @ai-why: De em-dash staat erin omdat hij de herkenbaarste AI-tell is, en een melding die naar een
 *   chatbot klinkt wordt weggeveegd. Markdown en bronnummers horen in het artikel, niet in een
 *   melding waar `**` gewoon als sterretjes verschijnt.
 */
export function lintTipFile(file: TipFile, fileSlug: string, articleSlugs: Set<string>): string[] {
  const errors: string[] = [];
  if (file.article !== fileSlug) errors.push(`article "${file.article}" is niet de bestandsnaam "${fileSlug}"`);
  if (!articleSlugs.has(file.article)) errors.push(`geen artikel "${file.article}" in content/wiki/`);
  if (file.tips.length === 0) errors.push('geen tips');
  if (!SINGLE_EMOJI.test(file.emoji)) errors.push(`emoji moet één emoji zijn, niet "${file.emoji}"`);

  const keys = new Set<string>();
  const bodies = new Set<string>();
  for (const [i, tip] of file.tips.entries()) {
    const at = `tip ${i + 1}${tip.key ? ` (${tip.key})` : ''}`;
    if (!KEY.test(tip.key)) errors.push(`${at}: key moet kleine letters en streepjes zijn`);
    if (keys.has(tip.key)) errors.push(`${at}: key komt twee keer voor`);
    keys.add(tip.key);
    if (!TIP_KINDS.includes(tip.kind)) errors.push(`${at}: kind moet ${TIP_KINDS.join(' of ')} zijn`);
    if (tip.emoji !== undefined && !SINGLE_EMOJI.test(tip.emoji)) errors.push(`${at}: emoji moet één emoji zijn, niet "${tip.emoji}"`);

    for (const lang of TIP_LANGUAGES) {
      const { title, body } = tip.texts[lang];
      const where = `${at} ${lang}`;
      if (!title) errors.push(`${where}: titel ontbreekt`);
      if (!body) errors.push(`${where}: tekst ontbreekt`);
      if (title.length > TITLE_MAX) errors.push(`${where}: titel is ${title.length} tekens (max ${TITLE_MAX})`);
      if (body && body.length < BODY_MIN) errors.push(`${where}: tekst is ${body.length} tekens (min ${BODY_MIN})`);
      if (body.length > BODY_MAX) errors.push(`${where}: tekst is ${body.length} tekens (max ${BODY_MAX})`);
      for (const text of [title, body]) {
        if (text.includes('—')) errors.push(`${where}: em-dash ("—")`);
        if (/\*\*|\[\[|\[\d+\]/.test(text)) errors.push(`${where}: markdown of bronnummer in "${text}"`);
      }
      // @ai-why: De app zet emoji en datum zelf voor de titel. Staat er al een emoji of "Mythe:" in,
      //   dan komt die er dubbel of midden in de kop te staan.
      if (/\p{Extended_Pictographic}/u.test(title)) errors.push(`${where}: geen emoji in de titel, die komt uit "emoji:"`);
      if (/^(myth|mythe|mythos|mito|efsane)\b/i.test(title)) errors.push(`${where}: "Mythe" hoort in de tekst, niet in de titel`);
      const prefix = MYTH_PREFIX[lang];
      if (prefix && tip.kind === 'myth' && !body.startsWith(prefix)) errors.push(`${where}: de tekst van een mythe begint met "${prefix}"`);
      if (prefix && tip.kind === 'fact' && body.startsWith(prefix)) errors.push(`${where}: "${prefix}" maar kind is fact`);
      if (body && bodies.has(`${lang}:${body}`)) errors.push(`${where}: dezelfde tekst als een andere tip`);
      bodies.add(`${lang}:${body}`);
    }
  }
  return errors;
}
