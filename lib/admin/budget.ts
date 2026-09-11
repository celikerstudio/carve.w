/**
 * Het geldrekenwerk rond dagbudgetten. Eén plek, en niets anders doet dit.
 *
 * @ai-why: Dit is het enige punt in het advertentiesysteem waar een rekenfout direct geld
 * kost. Meta rekent budgetten in de minor unit van de accountvaluta, en een factor honderd
 * de verkeerde kant op is het verschil tussen vijftig cent per dag en vijfhonderd euro per
 * dag. Geen van beide geeft een foutmelding: Meta accepteert allebei en je ziet het aan het
 * eind van de week op de factuur. Daarom één omrekenplek met tests eromheen, en een naam
 * die de eenheid draagt (`minor`) overal waar het getal langskomt.
 *
 * @ai-why: Onbekende valuta gooit in plaats van honderd aan te nemen. JPY en KRW hebben
 * nul decimalen, dus daar ís honderd de fout. Een nieuwe valuta toevoegen is één regel in
 * de tabel hieronder, en dat hoort een bewuste handeling te zijn met een plafond erbij.
 *
 * @ai-sync: lib/admin/meta-write.ts
 * @ai-sync: docs/tdr/0011-de-cockpit-bedient-de-campagnes.md
 */

/**
 * @ai-why: Decimalen en plafond staan in dezelfde rij, zodat je een valuta niet half kunt
 * toevoegen. Een valuta zonder plafond zou stilzwijgend ongelimiteerd zijn, en dat is
 * precies het geval waarin je het plafond het hardst nodig hebt.
 *
 * @ai-gotcha: Het plafond is bewust laag (€50 per dag). De eerste keer dat het in de weg
 * zit is dat een codewijziging, en dus een moment waarop iemand ernaar kijkt. Het is wel
 * het tweede net en niet het eerste: een verkeerde invoer in Ads Manager loopt hier dwars
 * langs. De enige grens die op elk pad bindt is het account spending limit bij Meta zelf.
 * Zie TDR-0011, Consequenties.
 */
const VALUTA: Record<string, { decimalen: number; plafondMajor: number }> = {
  EUR: { decimalen: 2, plafondMajor: 50 },
}

function regelVan(valuta: string): { decimalen: number; plafondMajor: number } {
  const regel = VALUTA[valuta]
  if (!regel) {
    throw new Error(
      `Valuta ${valuta} staat niet in lib/admin/budget.ts. Voeg 'm daar toe met decimalen én plafond; de omrekening raden zou hier geld kosten.`,
    )
  }
  return regel
}

export function valutaBekend(valuta: string): boolean {
  return valuta in VALUTA
}

export function naarMinorUnit(bedrag: number, valuta: string): number {
  const { decimalen } = regelVan(valuta)
  if (!Number.isFinite(bedrag) || bedrag < 0) {
    throw new Error(`Ongeldig bedrag: ${bedrag}`)
  }
  // @ai-gotcha: Math.round en niet Math.floor. Naar beneden afronden zou een dagbudget van
  // €10,005 op €10,00 zetten, en dat verschil stapelt op zodra er ooit met percentages
  // gerekend wordt. Afronden op de kleinste eenheid is wat Meta zelf ook doet.
  return Math.round(bedrag * 10 ** decimalen)
}

export function uitMinorUnit(minor: number, valuta: string): number {
  const { decimalen } = regelVan(valuta)
  return minor / 10 ** decimalen
}

/** Het plafond uit TDR-0011 beslissing 8, in minor units. */
export function plafondVan(valuta: string): number {
  const { plafondMajor } = regelVan(valuta)
  return naarMinorUnit(plafondMajor, valuta)
}

/**
 * @ai-why: De leerfase-drempel staat hier en niet in de UI, zodat de waarschuwing niet uit
 * de pas kan lopen met wat er werkelijk gebeurt. Meta zet een ad set terug in de leerfase
 * bij een budgetwijziging van ongeveer twintig procent of meer; die leerfase leeft op
 * ad-setniveau en niet op de campagne. Zie TDR-0011 beslissing 6.
 */
export const LEERFASE_DREMPEL = 0.2

export function zetLeerfaseTerug(vanMinor: number, naarMinor: number): boolean {
  if (vanMinor === 0) return naarMinor > 0
  return Math.abs(naarMinor - vanMinor) / vanMinor >= LEERFASE_DREMPEL
}
