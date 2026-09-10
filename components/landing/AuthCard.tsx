'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { InlineAuth, type AuthMode } from './InlineAuth'
import { AuthShell } from './AuthShell'

// @ai-why: /login en /signup renderen ditzelfde kader, zodat er één inlogscherm in
// de app bestaat in plaats van drie (de twee losse pagina's plus het kader in de
// demo). Zonder rechterkolom: op /login is er geen demo om naast te zetten, en een
// leeg paneel naast een formulier belooft iets wat er niet staat.
export function AuthCard({ initialMode }: { initialMode: AuthMode }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  // @ai-sync: app/auth/callback/route.ts (dezelfde standaardbestemming)
  const redirect = searchParams.get('redirect') || '/'
  const [mode, setMode] = useState<AuthMode>(initialMode)

  // @ai-why: Wie al ingelogd is hoort hier niet te staan. Stond op de oude
  // loginpagina en is meeverhuisd; zonder deze check landt een ingelogde
  // gebruiker op een formulier dat hij niet kan gebruiken.
  useEffect(() => {
    let cancelled = false
    createClient().auth.getUser().then(({ data }) => {
      if (!cancelled && data.user) router.push(redirect)
    })
    return () => { cancelled = true }
  }, [router, redirect])

  return (
    <AuthShell>
      <InlineAuth mode={mode} onModeChange={setMode} accent="#ffffff" redirect={redirect} />
    </AuthShell>
  )
}
