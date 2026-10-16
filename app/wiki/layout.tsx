import './wiki.css';

/**
 * De schil van de publieke wiki (TDR-0016): alleen de achtergrond en de tokens.
 *
 * @ai-why: De kop zit in elke pagina en niet hier, omdat hij moet weten welke categorie open
 *   staat. Een layout krijgt die niet mee.
 * @ai-sync: components/app/layout-wrapper.tsx (/wiki valt daar in de tak zonder chrome)
 */
export default function WikiLayout({ children }: { children: React.ReactNode }) {
  return <div className="wiki">{children}</div>;
}
