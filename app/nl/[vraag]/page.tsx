import { notFound } from 'next/navigation';
import { VraagPagina } from '@/components/carve/VraagPagina';
import { marketingJsonLd, vraagFaqJsonLd, vraagMetadata } from '@/lib/marketing-seo';
import { VRAAGPAGINAS, vraagpagina } from '@/lib/vraagpaginas';

// @ai-why: De drie vraagpagina's van TDR-0014 onder één route. `dynamicParams = false`
// maakt van elke andere slug een 404 in plaats van een lege pagina, en `/nl/app` blijft
// werken omdat een statisch segment altijd wint van een dynamisch.
// @ai-sync: lib/vraagpaginas.ts (de lijst die hier de paden bepaalt)
// @ai-sync: app/nl/app/page.tsx (het statische buurpad)
// @ai-sync: docs/tdr/0014-drie-vraagpaginas-voor-ai-antwoorden.md
export const dynamicParams = false;

export function generateStaticParams() {
  return VRAAGPAGINAS.map((p) => ({ vraag: p.slug }));
}

type Props = { params: Promise<{ vraag: string }> };

export async function generateMetadata({ params }: Props) {
  const pagina = vraagpagina((await params).vraag);
  return pagina ? vraagMetadata(pagina) : {};
}

export default async function VraagRoute({ params }: Props) {
  const pagina = vraagpagina((await params).vraag);
  if (!pagina) notFound();

  // @ai-why: Twee blokken structured data: de vragen als `FAQPage`, en de app zelf als
  // `MobileApplication` met de vaste omschrijving. Dat tweede blok staat ook op `/nl/app`,
  // en hier herhaald omdat een model dat alleen deze pagina leest anders niet weet wélke
  // Carve AI bedoeld is.
  const jsonLd = [vraagFaqJsonLd(pagina), marketingJsonLd('nl')];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <VraagPagina pagina={pagina} />
    </>
  );
}
