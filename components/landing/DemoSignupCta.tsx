'use client'

import Link from 'next/link'
import { track } from '@/lib/analytics'

// @ai-why: Losse client component omdat alleen deze knop analytics aantikt; de
// demo-pagina zelf blijft een server component. demo_to_signup is de tweede helft
// van de trechter waarmee TDR-0001 zich laat terugdraaien (home_card_click is de
// eerste), dus deze klik moet gemeten worden en niet alleen bestaan.
export function DemoSignupCta({ domain }: { domain: string }) {
  return (
    <section className="max-w-[1100px] mx-auto px-4 md:px-6 mt-14 text-center">
      <h2 className="text-[1.4rem] md:text-[1.75rem] font-bold tracking-[-0.02em] text-balance">
        Now with your own numbers.
      </h2>
      {/* @ai-why: De bankkoppeling staat hier expliciet. Wie op Money klikte weet
          dat er straks om zijn bank gevraagd wordt, en dat op het laatste scherm
          pas vertellen is precies hoe je iemand kwijtraakt. */}
      <p className="text-[13.5px] text-white/35 mt-2.5 max-w-[46ch] mx-auto leading-relaxed">
        Free to start. You choose what to connect, and you can connect nothing at all
        and still use the coach.
      </p>

      <div className="flex items-center justify-center gap-3 mt-7">
        <Link
          href={`/signup?start=${domain}`}
          onClick={() => track('demo_to_signup', { domain })}
          className="bg-white text-[#0A0A0B] px-7 py-3.5 rounded-full text-[13.5px] font-semibold
                     hover:opacity-85 transition-opacity
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60
                     focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0B]"
        >
          Get Started — It&apos;s Free
        </Link>
        <Link
          href="/login"
          className="border border-white/[0.08] text-white/40 px-7 py-3.5 rounded-full text-[13.5px]
                     hover:border-white/[0.15] hover:text-white/70 transition-all
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
        >
          Sign In
        </Link>
      </div>
    </section>
  )
}
