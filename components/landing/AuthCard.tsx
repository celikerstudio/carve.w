'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { InlineAuth, type AuthMode } from './InlineAuth'

// @ai-why: /login en /signup renderen ditzelfde kader, zodat er één inlogscherm in
// de app bestaat in plaats van drie (de twee losse pagina's plus het kader in de
// demo). Zonder rechterkolom: op /login is er geen demo om naast te zetten, en een
// leeg paneel naast een formulier belooft iets wat er niet staat.
export function AuthCard({ initialMode }: { initialMode: AuthMode }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/chat'
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
    <div className="min-h-[100dvh] bg-[#0A0A0B] text-white">
      <nav className="flex items-center justify-between border-b border-white/[0.03] px-6 py-4 md:px-10">
        <Link href="/" className="text-[12px] font-bold uppercase tracking-[0.35em] text-white/85">
          CARVE
        </Link>
        <Link href="/" className="text-[12.5px] text-white/30 transition-colors hover:text-white/60">
          See the demo
        </Link>
      </nav>

      <main className="flex min-h-[calc(100dvh-57px)] items-center justify-center px-4 py-10 md:px-6">
        <div className="w-full max-w-[520px] overflow-hidden rounded-2xl border border-white/[0.06] bg-[#111112] shadow-[0_24px_80px_rgba(0,0,0,0.4)]">
          <InlineAuth
            mode={mode}
            onModeChange={setMode}
            accent="#ffffff"
            redirect={redirect}
          />
        </div>
      </main>
    </div>
  )
}
