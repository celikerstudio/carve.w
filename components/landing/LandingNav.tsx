'use client'

import Link from 'next/link'

export function LandingNav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 py-4 bg-[#0A0A0B]/70 backdrop-blur-xl border-b border-white/[0.03]">
      <span className="text-[12px] font-bold tracking-[0.35em] uppercase text-white/85">
        CARVE
      </span>
      <div className="flex items-center gap-4">
        <Link
          href="/login"
          className="hidden sm:inline text-[13px] text-white/30 hover:text-white/60 transition-colors"
        >
          Sign In
        </Link>
        <Link
          href="/signup"
          className="bg-white text-[#0A0A0B] px-5 py-2 rounded-full text-[12px] font-semibold hover:opacity-85 transition-opacity"
        >
          Get Started
        </Link>
      </div>
    </nav>
  )
}
