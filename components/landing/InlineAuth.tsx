'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Mode = 'signup' | 'login'

interface InlineAuthProps {
  /** Domein waar de bezoeker vandaan kwam; gaat mee naar de onboarding. */
  domain: string
  accent: string
  /** Eén regel die zegt wat er straks in het paneel hiernaast komt te staan. */
  promise: string
  onCancel: () => void
}

// @ai-why: Aanmelden én inloggen staan in hetzelfde kader als de demo, niet op
// /signup of /login. De demo eindigt met een paneel vol data die niet van jou is;
// navigeer je daarvoor weg, dan is dat verband weg en kijk je naar een leeg
// formulier. Zo blijft het paneel ernaast staan, en dat paneel is wat je koopt.
//
// @ai-why: Eén component voor beide en geen twee. De velden zijn identiek en de
// enige verschillen zijn de aanroep, de knoptekst en de wisselregel eronder. Twee
// componenten zouden op een dag uiteenlopen op precies het stuk dat gedeeld hoort
// te blijven, en dat is de auth-flow.
//
// @ai-sync: app/(auth)/signup/page.tsx en app/(auth)/login/page.tsx doen dezelfde
// aanroepen. Verandert de auth-flow (bevestigingsmail, redirect), dan hier mee.
export function InlineAuth({ domain, accent, promise, onCancel }: InlineAuthProps) {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('signup')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isSignup = mode === 'signup'

  function switchTo(next: Mode) {
    setMode(next)
    setError('')
    setPassword('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    // @ai-why: Zelfde ondergrens als /signup, en alleen bij registreren. Bij inloggen
    // hoort een te kort wachtwoord "verkeerde gegevens" te zijn en geen vormfout —
    // anders vertel je een aanvaller dat dit account een langer wachtwoord heeft.
    if (isSignup && password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = isSignup
        ? await supabase.auth.signUp({
            email,
            password,
            options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
          })
        : await supabase.auth.signInWithPassword({ email, password })

      if (error) {
        setError(error.message)
        return
      }
      router.push(isSignup ? `/chat?start=${domain}` : '/chat')
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
          {isSignup ? 'Make it yours.' : 'Welcome back.'}
        </h2>
        <p className="mt-2 text-[13.5px] leading-relaxed text-white/40">
          {isSignup ? promise : 'Sign in and this panel fills with your own numbers.'}
        </p>

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
              // @ai-gotcha: `new-password` bij registreren, `current-password` bij
              // inloggen. Staat dit op één waarde, dan biedt de wachtwoordmanager bij
              // inloggen een nieuw gegenereerd wachtwoord aan in plaats van het
              // opgeslagen wachtwoord.
              autoComplete={isSignup ? 'new-password' : 'current-password'}
              minLength={isSignup ? 6 : undefined}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isSignup ? 'At least 6 characters' : 'Your password'}
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
            {loading
              ? isSignup ? 'Creating your account…' : 'Signing you in…'
              : isSignup ? 'Create account' : 'Sign in'}
          </button>
        </form>

        {isSignup && (
          // @ai-why: De bankkoppeling staat hier expliciet. Wie op Money klikte weet
          // dan dat er straks om zijn bank gevraagd wordt; dat pas na het aanmaken
          // vertellen is hoe je iemand kwijtraakt.
          <p className="mt-4 text-[12px] leading-relaxed text-white/25">
            Free to start. You choose what to connect, and you can connect nothing at all
            and still use the coach.
          </p>
        )}

        <p className="mt-5 border-t border-white/[0.05] pt-4 text-[13px] text-white/35">
          {isSignup ? 'Already have an account? ' : 'No account yet? '}
          <button
            type="button"
            onClick={() => switchTo(isSignup ? 'login' : 'signup')}
            className="font-semibold text-white underline underline-offset-2 transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          >
            {isSignup ? 'Log in' : 'Create one'}
          </button>
        </p>
      </div>
    </div>
  )
}
