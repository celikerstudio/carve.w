import { Suspense } from 'react'
import { AuthCard } from '@/components/landing/AuthCard'

// @ai-why: Eigen metadata per pagina. De layout zette voor allebei "Sign In" in de
// tab, dus wie zich aanmeldde zag "Sign In" boven zijn venster staan.
export const metadata = {
  title: 'Sign In — Carve',
  description: 'Sign in to your Carve account.',
}

// @ai-context: Deze pagina was een eigen tweekoloms inlogscherm van ruim 300 regels
// met een tweede kopie van dezelfde Supabase-aanroepen. Sinds de demo zijn eigen
// kader heeft, rendert /login datzelfde kader: één inlogscherm in de app in plaats
// van drie. Google en Apple zijn meeverhuisd naar InlineAuth; zonder die twee zou
// dit een stille functieverwijdering zijn geweest.
// @ai-sync: components/landing/InlineAuth.tsx

export default function LoginPage() {
  // @ai-gotcha: Suspense is verplicht — AuthCard leest `redirect` uit
  // useSearchParams, en dat dwingt Next tot een suspense-grens bij het prerenderen.
  return (
    <Suspense fallback={<div className="min-h-[100dvh] bg-[#0A0A0B]" />}>
      <AuthCard initialMode="login" />
    </Suspense>
  )
}
