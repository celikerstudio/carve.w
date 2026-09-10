'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
  AuthError,
  AuthField,
  AuthPanel,
  AuthShell,
  AuthSubmit,
} from '@/components/landing/AuthShell'

/**
 * De link naar een nieuw wachtwoord aanvragen.
 *
 * @ai-why: Zelfde reden als reset-password: dit droeg het oude, lichte ontwerp terwijl
 * login en signup al in het donkere kader zaten.
 *
 * @ai-gotcha: De bevestiging zegt niet of het adres bestaat. Dat is bewust: een scherm
 * dat "dit e-mailadres kennen we niet" toont, vertelt een vreemde wie er een account heeft.
 *
 * @ai-sync: app/(auth)/reset-password/page.tsx (waar de link uit de mail heen gaat)
 */
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { error } = await createClient().auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?redirect=/reset-password`,
      })
      if (error) {
        setError(error.message)
        return
      }
      setSuccess(true)
    } catch {
      setError('Something went wrong. Try again in a minute.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <AuthShell>
        <AuthPanel
          title="Check your email"
          intro={`If there is an account for ${email}, a link to set a new password is on its way.`}
        >
          <p className="mt-6 text-[13px] leading-relaxed text-white/35">
            The link works once and expires after an hour. Nothing arrived? Look in spam
            before asking for a new one.
          </p>

          <Link
            href="/login"
            className="mt-6 block text-[12.5px] text-white/30 transition-colors hover:text-white/60"
          >
            ← Back to sign in
          </Link>
        </AuthPanel>
      </AuthShell>
    )
  }

  return (
    <AuthShell>
      <AuthPanel
        title="Forgot your password?"
        intro="Give us the address you signed up with and we will send you a link."
      >
        <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-3">
          <AuthField
            label="Email"
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />

          {error && <AuthError>{error}</AuthError>}

          <AuthSubmit disabled={loading}>{loading ? 'Sending…' : 'Send the link'}</AuthSubmit>
        </form>

        <Link
          href="/login"
          className="mt-5 block text-[12.5px] text-white/30 transition-colors hover:text-white/60"
        >
          ← Back to sign in
        </Link>
      </AuthPanel>
    </AuthShell>
  )
}
