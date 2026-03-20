'use client'

import { LandingNav } from './LandingNav'
import { LandingHero } from './LandingHero'
import { LandingDemo } from './LandingDemo'
import { LandingCTA } from './LandingCTA'

export function LandingPage() {
  return (
    <>
      <LandingNav />
      <main>
        <LandingHero />
        <LandingDemo />
        <LandingCTA />
      </main>
    </>
  )
}
