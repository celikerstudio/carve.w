import Link from 'next/link';
import { marketingCopy, type MarketingCopy } from '@/lib/marketing-copy';

// @ai-why: Alleen de drie pagina's die Apple eist en die kloppen met de app van
// vandaag. Roadmap, Vision en FAQ stonden hier tot 2026-09-05, maar die beloven
// nog de brede app (geld-tracking, XP) die sinds 2026-09-04 achter een vlag
// staat. Zolang ze niet herschreven zijn wijst de footer er niet naartoe; de
// URL's zelf bestaan nog.
// @ai-gotcha: De labels vertalen mee, de pagina's erachter niet: TDR-0012 maakt alleen
// de marketingpagina tweetalig. `/privacy` en `/terms` zijn juridische teksten en die
// vertaal je niet even mee.
// @ai-sync: docs/tdr/0005-carve-wiki-is-een-marketingpagina.md (beslissing 5: wat publiek blijft)
// @ai-sync: lib/marketing-copy.ts (de labels)
const HREFS = ['/privacy', '/terms', '/support'] as const;

// @ai-why: De copy heeft een standaardwaarde in plaats van verplicht te zijn. Deze footer
// staat onder acht pagina's die met TDR-0012 niets te maken hebben (`/carve/*`, de
// juridische pagina's) en die zijn allemaal Engels. Die acht een parameter laten doorgeven
// die daar niets toevoegt is ruis; alleen de marketingpagina heeft echt een keuze.
export function CarveFooter({ copy = marketingCopy.en.footer }: { copy?: MarketingCopy['footer'] }) {
  const links = [
    { href: HREFS[0], label: copy.privacy },
    { href: HREFS[1], label: copy.terms },
    { href: HREFS[2], label: copy.support },
  ];

  return (
    <div className="border-t border-white/[0.08] pt-8">
      <div className="flex flex-wrap justify-center gap-6 text-sm text-white/30 mb-6">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="hover:text-white/60 transition-colors"
          >
            {link.label}
          </Link>
        ))}
      </div>
      {/* @ai-why: Carve AI is de juridische naam en de naam in de App Store; hier
          stond "celiker studio", een tweede naam onder dezelfde pagina. */}
      <p className="text-white/20 text-xs">{copy.copyright}</p>
    </div>
  );
}
