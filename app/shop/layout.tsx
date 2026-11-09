import '../wiki/wiki.css';
import './shop.css';

/**
 * De winkelpagina draagt de tokens en de knoppen van de wiki (TDR-0019 §7).
 *
 * @ai-why: Dezelfde schil als de wiki en geen eigen stijl: de winkel hoort te voelen als een deel
 *   van de wiki, niet als een andere site.
 * @ai-sync: app/wiki/layout.tsx
 * @ai-sync: components/app/layout-wrapper.tsx (/shop valt in de tak zonder chrome, de pagina draagt zelf de kop)
 */
export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return <div className="wiki">{children}</div>;
}
