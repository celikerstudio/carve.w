import Link from 'next/link'
import { ScrollReveal } from '@/components/ui/scroll-reveal'

export function LandingCTA() {
  return (
    <section className="text-center py-24 md:py-32 px-6">
      <ScrollReveal animation="fade-up" once>
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
          Your AI. Your data.{' '}
          <span className="text-white/20">Your life.</span>
        </h2>
        <p className="text-white/25 text-[14px] mb-8">
          Start free. No credit card. Just chat.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/signup"
            className="bg-white text-[#0A0A0B] px-7 py-3.5 rounded-full text-[13px] font-semibold hover:opacity-85 transition-opacity"
          >
            Get Started — It's Free
          </Link>
          <Link
            href="/login"
            className="border border-white/[0.08] text-white/40 px-7 py-3.5 rounded-full text-[13px] hover:border-white/[0.15] hover:text-white/60 transition-all"
          >
            Sign In
          </Link>
        </div>
      </ScrollReveal>
    </section>
  )
}
