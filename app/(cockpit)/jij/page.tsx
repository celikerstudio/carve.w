/**
 * Alles over jou: geheugen, profiel, logbook, archief.
 *
 * @ai-why: Deze modus heette tot 2026-09-10 "Brein". De naam beschreef de coach, niet de
 * inhoud; wat er staat gaat over de gebruiker. De interne id blijft `brein`, want die zit
 * in `AppId`, in `defaultCards` en in de kaartconfiguratie van het contextpaneel.
 * Hernoemen daarvan is een eigen opruiming.
 *
 * @ai-todo: De kaarten zelf komen nog uit `components/dashboard/hub/mock-data`. Zolang
 * dat zo is, staat hier nepdata.
 * @ai-sync: components/chat/cockpit-routes.ts
 */
export default function JijPage() {
  return (
    <div className="flex h-full items-center justify-center">
      <p className="text-[13px] text-white/25">Jij — binnenkort</p>
    </div>
  )
}
