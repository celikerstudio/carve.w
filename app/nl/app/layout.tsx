// @ai-why: Dezelfde donkere schil als `app/app/layout.tsx`. Zonder deze laag valt de
// pagina terug op de achtergrond van de root-layout en flitst er wit tussen het laden en
// de eerste verf.
// @ai-sync: app/app/layout.tsx (dezelfde schil, Engelse pagina)
export default function NederlandseAppPageLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white">
      {children}
    </div>
  )
}
