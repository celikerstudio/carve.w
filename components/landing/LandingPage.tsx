// @ai-context: De homepage is sinds TDR-0001 het domein-keuzescherm en niet de
// marketingpagina. Wie hier landt kiest een richting; de uitleg hoort op
// /how-it-works (nog te bouwen, wijst voorlopig naar /carve).
// De hero, de CTA en de zelf-afspelende chatdemo (LandingHero, LandingCTA,
// LandingDemo) zijn hier weg. Ze blijven staan omdat /how-it-works ze gaat
// gebruiken; zie docs/tdr/0001-homepage-is-een-keuzescherm.md.

import { LandingNav } from './LandingNav'
import { DomainPicker } from './DomainPicker'

export function LandingPage() {
  return (
    <>
      <LandingNav />
      <DomainPicker />
    </>
  )
}
