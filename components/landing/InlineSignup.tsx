'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface InlineSignupProps {
  /** Domein waar de bezoeker vandaan kwam; gaat mee naar de onboarding. */
  domain: string
  accent: string
  /** Eén regel die zegt wat er straks in het paneel hiernaast komt te staan. */
  promise: string
  onCancel: () => void
}

// @ai-why: Het formulier staat in hetzelfde kader als de demo en niet op /signup.
// De demo eindigt met een paneel vol data die niet van jou is; als je dan wegnavigeert
// naar een leeg formulier is dat verband weg. Zo blijft het paneel ernaast staan
// terwijl je je aanmeldt, en dat paneel is precies wat je koopt.
//
// @ai-sync: app/(auth)/signup/page.tsx doet dezelfde signUp-aanroep. Verandert de
// auth-flow (bevestigingsmail, redirect), dan hier mee.
export function InlineSignup({ domain, accent, promise, onCancel }: InlineSignupProps) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    // @ai-why: Zelfde ondergrens als /signup. Supabase weigert korter alsnog, maar
    // dan pas na een netwerkronde en met een Engelse servertekst.
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      })
      if (error) {
        setError(error.message)
        return
      }
      router.push(`/chat?start=${domain}`)
      router.refresh()
    } catch {
      setError('Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="carve-msg-in flex flex-1 flex-col justify-center px-[18px] py-8 md:px-10">
      <div className="mx-auto w-full max-w-[380px]">
        <button
          onClick={onCancel}
          className="mb-6 text-[12.5px] text-white/30 transition-colors hover:text-white/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
        >
          ← Back to the demo
        </button>

        <h2 className="text-[26px] font-bold leading-tight tracking-[-0.025em]">
          Make it yours.
        </h2>
        <p className="mt-2 text-[13.5px] leading-relaxed text-white/40">{promise}</p>

        <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-3">
          <label className="flex flex-col gap-1.5">
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/25">Email</span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-[14px] text-white placeholder:text-white/20 focus:border-white/25 focus:outline-none"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/25">Password</span>
            <input
              type="password"
              required
              autoComplete="new-password"
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-[14px] text-white placeholder:text-white/20 focus:border-white/25 focus:outline-none"
            />
          </label>

          {error && (
            <p role="alert" className="rounded-lg border border-[#E4783E]/25 bg-[#E4783E]/[0.08] px-3 py-2 text-[12.5px] text-[#F0A276]">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-1 rounded-xl px-4 py-3.5 text-[14px] font-semibold text-[#0A0A0B] transition-opacity hover:opacity-90 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#111112]"
            style={{ background: accent }}
          >
            {loading ? 'Creating your account…' : 'Create account'}
          </button>
        </form>

        {/* @ai-why: De bankkoppeling staat hier expliciet. Wie op Money klikte weet
            dan dat er straks om zijn bank gevraagd wordt; dat pas na het aanmaken
            vertellen is hoe je iemand kwijtraakt. */}
        <p className="mt-4 text-[12px] leading-relaxed text-white/25">
          Free to start. You choose what to connect, and you can connect nothing at all
          and still use the coach.
        </p>

        <p className="mt-5 border-t border-white/[0.05] pt-4 text-[13px] text-white/35">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-white transition-opacity hover:opacity-80">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}
