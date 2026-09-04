'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export type AuthMode = 'signup' | 'login'

interface InlineAuthProps {
  mode: AuthMode
  onModeChange: (mode: AuthMode) => void
  /** Domein waar de bezoeker vandaan kwam; gaat mee naar de onboarding. */
  domain?: string
  accent: string
  /** Eén regel die zegt wat er straks in het paneel hiernaast komt te staan. */
  promise?: string
  /** Waar de bezoeker heen gaat na inloggen. */
  redirect?: string
  onCancel?: () => void
}

// @ai-why: Aanmelden én inloggen staan in hetzelfde kader als de demo, niet op
// /signup of /login. De demo eindigt met een paneel vol data die niet van jou is;
// navigeer je daarvoor weg, dan is dat verband weg en kijk je naar een leeg
// formulier.
//
// @ai-why: Eén component voor beide vormen. De velden zijn identiek en de enige
// verschillen zijn de aanroep, de knoptekst en de wisselregel. Twee componenten
// zouden op een dag uiteenlopen op precies het stuk dat gedeeld hoort te blijven.
//
// @ai-sync: app/(auth)/signup/page.tsx doet dezelfde signUp-aanroep. /login rendert
// dit component (via AuthCard), dus daar is geen tweede kopie meer.
export function InlineAuth({
  mode, onModeChange, domain, accent, promise, redirect = '/chat', onCancel,
}: InlineAuthProps) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isSignup = mode === 'signup'

  function switchTo(next: AuthMode) {
    onModeChange(next)
    setError('')
    setPassword('')
    setConfirm('')
  }

  // @ai-why: Meeverhuisd van de oude /signup. Niet als oordeel maar als terugkoppeling:
  // zonder iets naast het veld typt iemand zes tekens en weet hij niet dat dat de
  // ondergrens is en niet een advies.
  function strengthOf(pass: string): { level: number; label: string } {
    if (pass.length === 0) return { level: 0, label: '' }
    if (pass.length < 6) return { level: 1, label: 'Too short' }
    if (pass.length >= 10 && /[A-Z]/.test(pass) && /[0-9]/.test(pass)) return { level: 3, label: 'Strong' }
    if (pass.length < 10) return { level: 2, label: 'Fair' }
    return { level: 2, label: 'Fair' }
  }
  const strength = strengthOf(password)

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

    // @ai-why: Meeverhuisd van de oude /signup. Zonder bevestigingsveld levert één
    // typefout een account op waar je daarna niet meer in komt, en de gebruiker
    // weet niet waarom — hij weet immers zeker wat hij getypt heeft.
    if (isSignup && password !== confirm) {
      setError('Passwords do not match')
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
      router.push(isSignup && domain ? `/chat?start=${domain}` : redirect)
      router.refresh()
    } catch {
      setError('Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  // @ai-why: Google en Apple staan hier omdat /login en /signup ze allebei hadden.
  // Zonder deze twee zou het samenvoegen van die schermen in dit kader een stille
  // functieverwijdering zijn, en dat merk je pas als een gebruiker niet meer
  // binnenkomt.
  // @ai-sync: app/(auth)/signup/page.tsx (dezelfde twee providers)
  async function oauth(provider: 'google' | 'apple') {
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback?redirect=${redirect}` },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  return (
    <div className="carve-msg-in flex flex-1 flex-col justify-center px-[18px] py-9 md:px-10">
      <div className="mx-auto w-full max-w-[380px]">
        {onCancel && (
          <button
            onClick={onCancel}
            className="mb-6 text-[12.5px] text-white/30 transition-colors hover:text-white/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          >
            ← Back to the demo
          </button>
        )}

        <h2 className="text-[26px] font-bold leading-tight tracking-[-0.025em]">
          {isSignup ? 'Make it yours.' : 'Welcome back.'}
        </h2>
        <p className="mt-2 text-[13.5px] leading-relaxed text-white/40">
          {isSignup
            ? promise ?? 'Your own numbers, from your first entry.'
            : 'Pick up where you left off.'}
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
            <span className="flex items-center font-mono text-[10px] uppercase tracking-[0.16em] text-white/25">
              Password
              {!isSignup && (
                <Link href="/forgot-password" className="ml-auto normal-case tracking-normal text-white/30 underline underline-offset-2 hover:text-white/60">
                  Forgot?
                </Link>
              )}
            </span>
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
            {isSignup && strength.label && (
              <span className="flex items-center gap-2 pt-0.5">
                <span className="flex flex-1 gap-1">
                  {[1, 2, 3].map((i) => (
                    <span
                      key={i}
                      className="h-[2px] flex-1 rounded-full transition-colors duration-300"
                      style={{ background: i <= strength.level ? accent : 'rgba(255,255,255,0.08)' }}
                    />
                  ))}
                </span>
                <span className="font-mono text-[10px] text-white/30">{strength.label}</span>
              </span>
            )}
          </label>

          {isSignup && (
            <label className="flex flex-col gap-1.5">
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/25">Confirm password</span>
              <input
                type="password"
                required
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Type it again"
                className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-[14px] text-white placeholder:text-white/20 focus:border-white/25 focus:outline-none"
              />
            </label>
          )}

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

        <div className="my-5 flex items-center gap-3">
          <span className="h-px flex-1 bg-white/[0.07]" />
          <span className="text-[12px] text-white/25">or</span>
          <span className="h-px flex-1 bg-white/[0.07]" />
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => oauth('google')}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-xl border border-white/[0.08] px-4 py-2.5 text-[13px] font-medium text-white/80 transition-colors hover:bg-white/[0.05] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          >
            <svg className="h-[17px] w-[17px]" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Google
          </button>
          <button
            type="button"
            onClick={() => oauth('apple')}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-[13px] font-medium text-white/80 transition-colors hover:bg-white/[0.08] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          >
            <svg className="h-[17px] w-[17px]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
            </svg>
            Apple
          </button>
        </div>

        {isSignup && (
          // @ai-why: De bankkoppeling staat hier expliciet. Wie op Money klikte weet
          // dan dat er straks om zijn bank gevraagd wordt; dat pas na het aanmaken
          // vertellen is hoe je iemand kwijtraakt.
          <p className="mt-5 text-[12px] leading-relaxed text-white/25">
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
