/**
 * De Carve-modus: het chatvenster zelf.
 *
 * @ai-why: Deze pagina rendert niets. Het chatvenster hangt in de layout, want het moet
 * gekoppeld blijven als je naar een andere sectie navigeert; zou het hier staan, dan
 * verdween je gesprek bij elke klik. Wat deze route doet is de layout vertellen welke
 * modus actief is, en dat gebeurt via het pad.
 *
 * @ai-gotcha: Leeg laten is bewust. Zet hier geen inhoud neer zonder de chat mee te
 * verhuizen, anders staat er straks twee keer iets in hetzelfde venster.
 *
 * @ai-sync: components/chat/CockpitShell.tsx
 */
export default function CarveModePage() {
  return null
}
