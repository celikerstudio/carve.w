import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import '../wiki/wiki.css';
import { SiteHeader } from '@/components/site/SiteHeader';
import { APP_OMSCHRIJVING, marketingCopy } from '@/lib/marketing-copy';
import { AUTHOR, SITE } from '@/lib/wiki/seo';

/**
 * Wie de wiki schrijft (TDR-0017 §1).
 *
 * @ai-why: Een eigen pagina en niet een alinea onder elk artikel. Google en de taalmodellen lezen
 *   de auteur als entiteit: één adres met een `Person`, waar elk artikel naar verwijst.
 * @ai-why: In de huisstijl van de wiki (`.wiki`), want hier kom je vanuit een artikel.
 * @ai-gotcha: Alleen feiten die Furkan zelf publiek heeft gemaakt (de marketingpagina,
 *   `marketingCopy.en.bewijs`). Geen opleiding of titel verzinnen: "not a doctor" staat er juist om
 *   te laten zien wat hij niet is.
 * @ai-todo: De eerste alinea mag Furkan in zijn eigen woorden herschrijven; dit is een concept
 *   uit de feiten die al op /app staan.
 * @ai-sync: lib/wiki/seo.ts (AUTHOR, dezelfde naam en hetzelfde pad als in elk artikel)
 */
export const metadata: Metadata = {
  title: `${AUTHOR.name} · Carve Wiki`,
  description: 'Who writes the Carve Wiki, and how an article gets made.',
  alternates: { canonical: `${SITE}${AUTHOR.path}` },
};

const proof = marketingCopy.en.bewijs;

export default function AboutPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    url: `${SITE}${AUTHOR.path}`,
    mainEntity: {
      '@type': 'Person',
      name: AUTHOR.name,
      jobTitle: AUTHOR.jobTitle,
      url: `${SITE}${AUTHOR.path}`,
      worksFor: { '@type': 'Organization', name: 'Carve AI', url: `${SITE}/app` },
      ...(AUTHOR.sameAs.length > 0 ? { sameAs: AUTHOR.sameAs } : {}),
    },
  };

  return (
    <div className="wiki">
      <SiteHeader />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <main className="wiki-about">
        <h1>{AUTHOR.name}</h1>
        <div className="wiki-sum">I built Carve while losing 50 kilos. I write the Carve Wiki.</div>

        <div className="photos">
          <figure>
            <Image src="/photos/before.jpg" alt={proof.voorAlt} width={720} height={960} className="before" />
            <figcaption>130 kg</figcaption>
          </figure>
          <figure>
            <Image src="/photos/now.jpg" alt={proof.nuAlt} width={528} height={704} />
            <figcaption>80 kg</figcaption>
          </figure>
        </div>

        <div className="wiki-prose">
          <p>
            I went from 130 to 80 kilograms. It started with a food tracker I built for myself, and that
            tracker became <Link href="/app">Carve AI</Link>. {APP_OMSCHRIJVING.en} I still use it every day.
          </p>

          <h2>How an article gets made</h2>
          <ol>
            <li>A first draft is written with the help of AI.</li>
            <li>
              Every source is a published study or a position stand from a professional body. Each one is
              looked up by its DOI or PubMed ID before it goes in. If a study doesn&apos;t say what the text
              says, the claim goes.
            </li>
            <li>I read the article, correct it, and add what I did myself. Only then does my name go on it.</li>
          </ol>
          <p>
            Articles without my name are older drafts. You can read them, but I haven&apos;t reviewed them
            yet.
          </p>

          <h2>What I&apos;m not</h2>
          <p>
            I&apos;m not a doctor or a dietitian. If you have a medical condition, are pregnant or take
            medication, talk to one before you change how you eat or train.
          </p>
        </div>
      </main>
    </div>
  );
}
