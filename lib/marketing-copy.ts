/**
 * Alle tekst van de marketingpagina, per taal.
 *
 * @ai-why: Tot 2026-09-14 stond deze copy hardcoded in de JSX van vijf componenten.
 * Dat kon zolang de pagina één taal had. TDR-0012 zet er een Nederlandse variant
 * naast omdat de Google Ads-campagnes op Nederland staan en de zoektermen die
 * binnenkomen voor een groot deel Nederlands zijn; een Nederlandse advertentie die
 * op een Engelse pagina uitkomt houdt de helft van dat probleem in stand.
 *
 * @ai-why: Geen `next-intl`. Voor één extra taal op één pagina is dat meer machinerie
 * dan probleem. De keuze staat open en de afweging staat in de TDR: komt er een derde
 * taal met datums en getallen bij, dan is dat de opvolger.
 *
 * @ai-gotcha: De vorm wordt niet alleen door TypeScript bewaakt maar ook door
 * `lib/marketing-copy.test.ts`. Een vergeten vertaling geeft namelijk geen fout; de
 * pagina rendert de lege string gewoon.
 *
 * @ai-sync: lib/marketing-copy.test.ts (sleutelpariteit en de nadrukmarkering)
 * @ai-sync: docs/tdr/0012-de-marketingpagina-krijgt-een-nederlandse-variant.md
 * @ai-sync: app/nl/app/page.tsx (gebruikt `nl` voor metadata en structured data)
 * @ai-sync: app/app/page.tsx (gebruikt `en`, idem)
 */

export const TALEN = ['en', 'nl'] as const;

export type Taal = (typeof TALEN)[number];

/**
 * Wat Carve AI is, in één zin, overal hetzelfde.
 *
 * @ai-why: In de nulmeting van 2026-09-27 kende Gemini "Carve AI" alleen als
 * enterprise-AI-platform, datatool, notulen-app en ski-coach. Een model kan een app pas
 * aanraden als het hem als app herkent, en dat lukt beter als elke pagina en elk stuk
 * structured data exact dezelfde zin draagt dan als elke pagina het net anders zegt.
 * Pas je hem aan, dan verandert hij overal tegelijk; dat is de bedoeling.
 * @ai-sync: lib/marketing-seo.ts (description in de structured data)
 * @ai-sync: lib/vraagpaginas.ts (elk antwoord opent met deze zin, bewaakt door de test)
 * @ai-sync: docs/tdr/0014-drie-vraagpaginas-voor-ai-antwoorden.md
 */
export const APP_OMSCHRIJVING: Record<Taal, string> = {
  en: 'Carve AI is an iPhone app that tracks your food and your training.',
  nl: 'Carve AI is een iPhone-app die je eten en je training bijhoudt.',
};

/** Een vast aantal, zodat een ontbrekende kaart of regel een typefout is en geen lege plek. */
type Drie<T> = readonly [T, T, T];
type Vier<T> = readonly [T, T, T, T];
type Vijf<T> = readonly [T, T, T, T, T];

interface Kaart {
  titel: string;
  tekst: string;
}

export interface MarketingCopy {
  meta: {
    titel: string;
    beschrijving: string;
  };
  hero: {
    /** De eerste, harde regel van de kop. */
    kop: string;
    /** De tweede regel, gedimd. */
    kopZacht: string;
    tekst: string;
    onderKnop: string;
  };
  /** De vijf lijfstadia van het personage onder de hero (variant A, 2026-10-16). */
  stadia: {
    alt: string;
    /** Zoals in de app: Carve-AI `health.body.stage.*` voor de man. */
    namen: Vijf<string>;
  };
  bewijs: {
    eyebrow: string;
    getalLabel: string;
    eenheid: string;
    regel: string;
    onderregel: string;
    voorLabel: string;
    nuLabel: string;
    voorAlt: string;
    nuAlt: string;
  };
  drie: {
    eyebrow: string;
    kop: string;
    /** Foto van je bord, wat je trainde, waar je staat. */
    kaarten: Drie<Kaart>;
    bord: string;
    bordMacro: string;
    ringVan: string;
    figuurAlt: string;
    health: string;
    privacy: string;
    privacyLink: string;
  };
  wiki: {
    eyebrow: string;
    kop: string;
    tekst: string;
    alles: string;
  };
  prijs: {
    eyebrow: string;
    kop: string;
    intro: string;
    gratisNaam: string;
    gratisTag: string;
    gratisRegels: Vier<string>;
    proNaam: string;
    proTag: string;
    proRegels: Vier<string>;
    proef: string;
  };
  slot: {
    kop: string;
    tekst: string;
    onderKnop: string;
  };
  footer: {
    privacy: string;
    terms: string;
    support: string;
    copyright: string;
  };
}

const en: MarketingCopy = {
  meta: {
    titel: 'Carve AI — Fitness Coach',
    beschrijving: 'Logs your food from a photo. Tracks the muscles you are skipping. Built by someone who lost 50kg using it.',
  },
  hero: {
    kop: 'Train. Eat.',
    kopZacht: 'Watch yourself grow.',
    tekst: 'Log your food and your workouts. Your Carve character grows as you train.',
    onderKnop: 'Free · iPhone',
  },
  stadia: {
    alt: 'The Carve character in five stages, from Start to Beast.',
    namen: ['Start', 'Fit', 'Athletic', 'Muscular', 'Beast'],
  },
  bewijs: {
    eyebrow: 'Why it exists',
    getalLabel: 'From 130 to 80 kilograms',
    eenheid: 'kg',
    regel: 'I built this app while losing 50 kg. I still use it every day.',
    onderregel: 'It started as a food tracker for myself. It turned into a coach.',
    voorLabel: 'Before',
    nuLabel: 'Now',
    voorAlt: 'Furkan at 130 kg, standing on a street in Istanbul, phone in hand.',
    nuAlt: 'Furkan at 80 kg, hiking with a backpack and poles, phone in hand.',
  },
  drie: {
    eyebrow: 'What it does',
    kop: 'Three things, done well.',
    kaarten: [
      { titel: 'Snap your plate', tekst: 'A photo becomes calories and protein.' },
      { titel: 'See what you trained', tekst: 'Every workout lights up on your character.' },
      { titel: 'Know where you stand', tekst: 'Your protein, your week and your steps in one place.' },
    ],
    bord: 'Chicken, rice, broccoli',
    bordMacro: '640 kcal · 48 g protein',
    ringVan: 'of 144 g',
    figuurAlt: 'The Carve character with chest, shoulders and triceps lit up after a push workout.',
    health: 'Reads your daily steps from Apple Health. Nothing else.',
    privacy: 'Your photo goes to the AI that reads it and is not used to train anything.',
    privacyLink: 'How we handle your data',
  },
  wiki: {
    eyebrow: 'Carve Wiki',
    kop: 'Know what works.',
    tekst: 'Articles on training, food and recovery. The short answer first, with how strong the evidence is.',
    alles: 'Read the wiki',
  },
  prijs: {
    eyebrow: 'What it costs',
    kop: 'The free plan has no end date.',
    intro: 'Logging your food and your training is the app, and that part stays free. Pro raises the ceiling for people who lean on the coach all day.',
    gratisNaam: 'Free',
    gratisTag: 'The app, without a subscription',
    gratisRegels: [
      'Log food by photo and by barcode',
      'Workout log, muscle map, week plan',
      'Your steps from Apple Health',
      'Up to 25 AI actions a day',
    ],
    proNaam: 'Pro adds',
    proTag: 'Price in the App Store, in your own currency',
    proRegels: ['Unlimited scanning', 'Unlimited chat with the coach', 'A smarter AI model', 'All analysis tools'],
    proef: 'Every new account starts with 30 days of Pro. It begins when you sign up; there is no card to enter first.',
  },
  slot: {
    kop: 'Carve a better you.',
    tekst: 'Free on the App Store.',
    onderKnop: 'Free · iPhone · Built in Amsterdam',
  },
  footer: {
    privacy: 'Privacy',
    terms: 'Terms',
    support: 'Support',
    copyright: '© 2026 Carve AI · Amsterdam',
  },
};

// @ai-why: De tagline blijft Engels. "Carve a better you" is de merkregel uit
//   ~/Developer/Carve-AI/docs/brand/identity.md en die hoort in elke taal hetzelfde te
//   zijn, net als de naam zelf. Een vertaalde merkregel is een tweede merk.
// Hij staat sinds 2026-10-16 als kop van het slot, in beide talen.
//
// @ai-context: De namen van de lijfstadia volgen de app (Carve-AI `health.body.stage.*`):
//   Start, Fit, Atletisch, Gespierd, Beest.
const nl: MarketingCopy = {
  meta: {
    titel: 'Carve AI — calorieën tellen met een foto',
    beschrijving: 'Logt je eten vanaf een foto. Laat zien welke spieren je overslaat. Gebouwd door iemand die er 50 kilo mee verloor.',
  },
  hero: {
    kop: 'Train. Eet.',
    kopZacht: 'Zie jezelf groeien.',
    tekst: 'Log je eten en je training. Je Carve-personage groeit mee terwijl je traint.',
    onderKnop: 'Gratis · iPhone',
  },
  stadia: {
    alt: 'Het Carve-personage in vijf stadia, van Start tot Beest.',
    namen: ['Start', 'Fit', 'Atletisch', 'Gespierd', 'Beest'],
  },
  bewijs: {
    eyebrow: 'Waarom het bestaat',
    getalLabel: 'Van 130 naar 80 kilo',
    eenheid: 'kg',
    regel: 'Ik bouwde deze app terwijl ik 50 kilo afviel. Ik gebruik hem nog elke dag.',
    onderregel: 'Het begon als een eetdagboek voor mezelf. Het werd een coach.',
    voorLabel: 'Toen',
    nuLabel: 'Nu',
    voorAlt: 'Furkan van 130 kilo, op straat in Istanbul, telefoon in de hand.',
    nuAlt: 'Furkan van 80 kilo, wandelend met rugzak en stokken, telefoon in de hand.',
  },
  drie: {
    eyebrow: 'Wat het doet',
    kop: 'Drie dingen, en die goed.',
    kaarten: [
      { titel: 'Fotografeer je bord', tekst: 'Een foto wordt calorieën en eiwit.' },
      { titel: 'Zie wat je trainde', tekst: 'Elke training licht op op je personage.' },
      { titel: 'Weet waar je staat', tekst: 'Je eiwit, je week en je stappen op één plek.' },
    ],
    bord: 'Kip, rijst, broccoli',
    bordMacro: '640 kcal · 48 g eiwit',
    ringVan: 'van 144 g',
    figuurAlt: 'Het Carve-personage met borst, schouders en triceps opgelicht na een push-training.',
    health: 'Leest je dagelijkse stappen uit Apple Health. Verder niets.',
    privacy: 'Je foto gaat naar de AI die hem leest en wordt niet gebruikt om iets te trainen.',
    privacyLink: 'Hoe we met je gegevens omgaan',
  },
  wiki: {
    eyebrow: 'Carve Wiki',
    kop: 'Weet wat werkt.',
    tekst: 'Engelstalige artikelen over training, eten en herstel. Eerst het korte antwoord, met hoe sterk het bewijs is.',
    alles: 'Naar de wiki',
  },
  prijs: {
    eyebrow: 'Wat het kost',
    kop: 'Het gratis plan heeft geen einddatum.',
    intro: 'Je eten en je training loggen ís de app, en dat deel blijft gratis. Pro verhoogt het plafond voor wie de hele dag op de coach leunt.',
    gratisNaam: 'Gratis',
    gratisTag: 'De app, zonder abonnement',
    gratisRegels: [
      'Eten loggen met een foto en met een barcode',
      'Trainingslog, spierkaart, weekplan',
      'Je stappen uit Apple Health',
      'Tot 25 AI-acties per dag',
    ],
    proNaam: 'Pro voegt toe',
    proTag: 'De prijs staat in de App Store, in je eigen valuta',
    proRegels: ['Onbeperkt scannen', 'Onbeperkt chatten met de coach', 'Een slimmer AI-model', 'Alle analysetools'],
    proef: 'Elk nieuw account begint met 30 dagen Pro. Die gaat in bij je aanmelding, en je hoeft vooraf geen kaart in te vullen.',
  },
  slot: {
    kop: 'Carve a better you.',
    tekst: 'Gratis in de App Store.',
    onderKnop: 'Gratis · iPhone · Gemaakt in Amsterdam',
  },
  footer: {
    privacy: 'Privacy',
    terms: 'Voorwaarden',
    support: 'Support',
    copyright: '© 2026 Carve AI · Amsterdam',
  },
};

export const marketingCopy: Record<Taal, MarketingCopy> = { en, nl };

export interface Segment {
  tekst: string;
  nadruk: boolean;
}

/**
 * Splitst een regel op `**nadruk**` in segmenten, zodat de copy platte tekst kan
 * blijven en het bestand geen JSX hoeft te dragen.
 *
 * @ai-why: De bijschriften naast de telefoon zetten één deel van de zin vet. Dat stond
 * als `<b>` in de JSX. Een copy-bestand met JSX erin kan niet in een `.test.ts` en
 * verplaatst het probleem alleen; deze markering houdt de tekst leesbaar op één plek.
 * @ai-sync: lib/marketing-copy.test.ts (paren-controle op de sterretjes)
 */
export function splitsNadruk(regel: string): Segment[] {
  return regel
    .split('**')
    .map((tekst, i) => ({ tekst, nadruk: i % 2 === 1 }))
    .filter((segment) => segment.tekst !== '');
}
