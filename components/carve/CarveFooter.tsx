import Link from 'next/link';

// @ai-why: Alleen de drie pagina's die Apple eist en die kloppen met de app van
// vandaag. Roadmap, Vision en FAQ stonden hier tot 2026-09-05, maar die beloven
// nog de brede app (geld-tracking, XP) die sinds 2026-09-04 achter een vlag
// staat. Zolang ze niet herschreven zijn wijst de footer er niet naartoe; de
// URL's zelf bestaan nog.
// @ai-sync: docs/tdr/0005-carve-wiki-is-een-marketingpagina.md (beslissing 5: wat publiek blijft)
const LINKS = [
  { href: '/privacy', label: 'Privacy' },
  { href: '/terms', label: 'Terms' },
  { href: '/support', label: 'Support' },
] as const;

export function CarveFooter() {
  return (
    <div className="border-t border-white/[0.08] pt-8">
      <div className="flex flex-wrap justify-center gap-6 text-sm text-white/30 mb-6">
        {LINKS.map((link) => (
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
      <p className="text-white/20 text-xs">
        &copy; 2026 Carve AI &middot; Amsterdam
      </p>
    </div>
  );
}
