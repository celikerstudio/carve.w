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

/** Vier keer hetzelfde, zodat een ontbrekend scherm een typefout is en geen lege plek. */
type Vier<T> = readonly [T, T, T, T];
type Zes<T> = readonly [T, T, T, T, T, T];
type Zeven<T> = readonly [T, T, T, T, T, T, T];

interface Scherm {
  eyebrow: string;
  titel: string;
  /** Mag `**nadruk**` bevatten; zie `splitsNadruk`. */
  body: string;
  alt: string;
}

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
    kopZacht: string;
    kopHard: string;
    tagline: string;
    onderKnop: string;
  };
  telefoon: {
    landing: { eyebrow: string; titel: string; body: string };
    schermen: Vier<Scherm>;
    figuurAlt: string;
    /** Kop boven de weekstrip in de hero. */
    weekKop: string;
    /** Toegankelijkheidslabel van de weekstrip; die is een tablist. */
    weekLabel: string;
    weekdagen: Zeven<string>;
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
  overzicht: {
    eyebrow: string;
    kop: string;
    intro: string;
    kaarten: Zes<Kaart>;
    health: string;
    privacy: string;
    privacyLink: string;
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
    kopZacht: 'Log your food.',
    kopHard: 'Track your workouts.',
    tagline: 'Carve a better you.',
    onderKnop: 'Free · iPhone',
  },
  telefoon: {
    landing: {
      eyebrow: "That's the app",
      titel: 'The map you just played with.',
      body: 'Front and back. Every workout you log fills it in, so you see what you trained this week **and what you keep skipping.**',
    },
    schermen: [
      {
        eyebrow: 'Snap it',
        titel: 'Logged.',
        body: 'Take a picture of your plate. The AI works out the calories and macros. **No database digging, no guessing portions.**',
        alt: "Carve's home screen with the day's meals, each with its time and calories.",
      },
      {
        eyebrow: 'Packet in your hand?',
        titel: 'Scan it.',
        body: 'Point the camera at a barcode, a plate, even a receipt. **It reads what is in front of it** and fills in the macros.',
        alt: 'The Carve camera pointed at a drink, with the hint "Point at your meal, a receipt or a barcode".',
      },
      {
        eyebrow: 'Ask anything.',
        titel: 'Carve adds it.',
        body: 'Type “today I trained chest and triceps” and it lands in the log. **The coach answers from what you logged,** not from a generic plan.',
        alt: "Chat with Carve: 'Today i trained chest and triceps', saved as a Push workout with chest and triceps filled in.",
      },
      {
        eyebrow: 'Your week at a glance',
        titel: 'Nothing gets skipped.',
        body: 'Every session you log fills the bars. **One look tells you which muscle has been waiting** since last week.',
        alt: 'The Carve health screen: the muscle figure with a progress bar per muscle group beside it.',
      },
    ],
    figuurAlt: 'Illustrated muscle map of a body, front view, as shown in Carve. The muscles of the selected training day are highlighted.',
    weekKop: 'This week',
    weekLabel: 'Training week',
    weekdagen: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
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
  overzicht: {
    eyebrow: 'Everything in it',
    kop: 'One place for your food and your training.',
    intro: "Most trackers stop at the number. Carve keeps both in the same place, so it can show you the muscle you haven't touched in nine days, right next to the week you thought went fine.",
    kaarten: [
      { titel: 'Photo logging', tekst: 'A picture of your plate becomes calories and macros. No database digging.' },
      { titel: 'Barcode scanner', tekst: 'Point at the packet. The product and its macros are filled in.' },
      { titel: 'Workout log', tekst: 'Sets, weights, done. Every session fills the muscle map.' },
      { titel: 'Muscle map, front and back', tekst: 'See what you trained this week and what you keep skipping.' },
      { titel: 'Week plan', tekst: 'Set a goal, a split and your training days once. The week is on your home screen.' },
      { titel: 'A coach that reads your log', tekst: 'Ask about your protein, your week or what to train. It answers from what you logged.' },
    ],
    health: 'Reads your daily steps from Apple Health. Nothing else.',
    privacy: 'Your photo goes to the AI that reads it and is not used to train anything.',
    privacyLink: 'How we handle your data',
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
    kop: 'Ready to start?',
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
//
// @ai-gotcha: Scherm 3 citeert in het Engels geen zin meer. De screenshot toont
//   letterlijk "Today i trained chest and triceps", dus een Nederlands citaat zou naast
//   een Engels scherm staan; de regel uit PhoneStory is dat bijschrift en scherm
//   hetzelfde zeggen. De Nederlandse body beschrijft daarom wat er gebeurt zonder te
//   citeren. Komt er ooit een Nederlandse export, dan mag het citaat terug.
//
// @ai-context: De trainingslabels in de weekdemo (Push, Pull, Legs, Rest) worden niet
//   vertaald: zo staan ze in de app. Alleen de dagafkortingen gaan mee.
const nl: MarketingCopy = {
  meta: {
    titel: 'Carve AI — calorieën tellen met een foto',
    beschrijving: 'Logt je eten vanaf een foto. Laat zien welke spieren je overslaat. Gebouwd door iemand die er 50 kilo mee verloor.',
  },
  hero: {
    kopZacht: 'Log je eten.',
    kopHard: 'Volg je training.',
    tagline: 'Carve a better you.',
    onderKnop: 'Gratis · iPhone',
  },
  telefoon: {
    landing: {
      eyebrow: 'Dat ís de app',
      titel: 'De kaart waar je net mee speelde.',
      body: 'Voorkant en achterkant. Elke training die je logt vult hem, dus je ziet wat je deze week deed **en wat je blijft overslaan.**',
    },
    schermen: [
      {
        eyebrow: 'Maak een foto',
        titel: 'Gelogd.',
        body: "Fotografeer je bord. De AI rekent de calorieën en macro's uit. **Geen database doorzoeken, geen porties gokken.**",
        alt: 'Het beginscherm van Carve met de maaltijden van de dag, elk met tijd en calorieën.',
      },
      {
        eyebrow: 'Verpakking in je hand?',
        titel: 'Scan hem.',
        body: "Richt de camera op een barcode, een bord, zelfs een kassabon. **Hij leest wat ervoor ligt** en vult de macro's in.",
        alt: 'De camera van Carve gericht op een drankje, met de hint "Point at your meal, a receipt or a barcode".',
      },
      {
        eyebrow: 'Vraag maar raak.',
        titel: 'Carve zet het erbij.',
        body: 'Typ in gewone taal wat je getraind hebt en het staat in je log. **De coach antwoordt op wat jij logde,** niet op een standaardschema.',
        alt: "Chat met Carve: 'Today i trained chest and triceps', opgeslagen als een Push-workout met borst en triceps ingevuld.",
      },
      {
        eyebrow: 'Je week in één blik',
        titel: 'Niets blijft liggen.',
        body: 'Elke sessie die je logt vult de balken. **Eén blik zegt welke spier staat te wachten** sinds vorige week.',
        alt: 'Het health-scherm van Carve: het spierfiguur met een voortgangsbalk per spiergroep ernaast.',
      },
    ],
    figuurAlt: 'Getekende spierkaart van een lichaam, vooraanzicht, zoals in Carve. De spieren van de gekozen trainingsdag lichten op.',
    weekKop: 'Deze week',
    weekLabel: 'Trainingsweek',
    weekdagen: ['ma', 'di', 'wo', 'do', 'vr', 'za', 'zo'],
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
  overzicht: {
    eyebrow: 'Wat erin zit',
    kop: 'Je eten en je training op één plek.',
    intro: 'De meeste trackers stoppen bij het getal. Carve houdt allebei bij, en laat je daardoor de spier zien die je negen dagen niet hebt aangeraakt, naast de week waarvan je dacht dat hij goed ging.',
    kaarten: [
      { titel: 'Loggen met een foto', tekst: "Een foto van je bord wordt calorieën en macro's. Geen database doorzoeken." },
      { titel: 'Barcodescanner', tekst: "Richt op de verpakking. Het product en de macro's staan erin." },
      { titel: 'Trainingslog', tekst: 'Sets, gewichten, klaar. Elke sessie vult de spierkaart.' },
      { titel: 'Spierkaart, voor en achter', tekst: 'Zie wat je deze week trainde en wat je blijft overslaan.' },
      { titel: 'Weekplan', tekst: 'Stel één keer een doel, een split en je trainingsdagen in. De week staat op je beginscherm.' },
      { titel: 'Een coach die je log leest', tekst: 'Vraag naar je eiwitten, je week of wat je moet trainen. Hij antwoordt op wat je logde.' },
    ],
    health: 'Leest je dagelijkse stappen uit Apple Health. Verder niets.',
    privacy: 'Je foto gaat naar de AI die hem leest en wordt niet gebruikt om iets te trainen.',
    privacyLink: 'Hoe we met je gegevens omgaan',
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
    kop: 'Zullen we beginnen?',
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
