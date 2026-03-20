'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

export function LandingHero() {
  return (
    <div className="text-center pt-28 pb-8 md:pt-32 md:pb-10 px-6">
      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        className="text-4xl md:text-5xl lg:text-[56px] font-bold tracking-tight leading-[1.1] mb-4"
      >
        ChatGPT knows everything.
        <br />
        <span className="text-white/25">Carve knows you.</span>
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
        className="text-white/30 text-[15px] md:text-base mb-8"
      >
        Watch it work.
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
        className="flex items-center justify-center gap-3"
      >
        <Link
          href="/signup"
          className="bg-white text-[#0A0A0B] px-7 py-3.5 rounded-full text-[14px] font-semibold hover:shadow-[0_4px_24px_rgba(255,255,255,0.1)] hover:-translate-y-0.5 transition-all"
        >
          Get Started — It's Free
        </Link>
        <a
          href="#demo"
          className="border border-white/[0.08] text-white/50 px-7 py-3.5 rounded-full text-[14px] font-medium hover:border-white/[0.15] hover:text-white/70 transition-all"
        >
          See how it works
        </a>
      </motion.div>
    </div>
  )
}
