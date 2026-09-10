'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
 * Een nieuw wachtwoord instellen.
 *
 * @ai-why: Dit scherm droeg tot 2026-09-10 het oude ontwerp: witte achtergrond, blauwe
 * knop en een stockillustratie van joggers naast het formulier. Login en signup zaten al
 * in het donkere kader, dus wie zijn wachtwoord vergat kwam midden in de flow in een
 * ander product terecht. Nu deelt het het kader uit `AuthShell`.
 *
 * @ai-gotcha: `updateUser` werkt alleen als de sessie uit de e-maillink al gezet is; dat
 * gebeurt in `app/auth/callback/route.ts`. Kom je hier zonder die stap, dan geeft Supabase
 * een foutmelding over een ontbrekende sessie en niet over de link.
 * @ai-sync: app/(auth)/forgot-password/page.tsx (stuurt de link hierheen via de callback)
 */
export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('The two passwords do not match.')
      return
    }
    if (password.length < 6) {
      setError('Use at least 6 characters.')
      return
    }

    setLoading(true)
    try {
      const { error } = await createClient().auth.updateUser({ password })
      if (error) {
        setError(error.message)
        return
      }
      router.push('/login?message=Password reset successfully')
    } catch {
      setError('Something went wrong. Try the link from your email again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell>
      <AuthPanel title="Set a new password" intro="Pick something you have not used before.">
        <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-3">
          <AuthField
            label="New password"
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
          />

          <AuthField
            label="Confirm password"
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Type it again"
          />

          {error && <AuthError>{error}</AuthError>}

          <AuthSubmit disabled={loading}>
            {loading ? 'Saving…' : 'Save password'}
          </AuthSubmit>
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
