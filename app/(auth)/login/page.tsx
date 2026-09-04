import { Suspense } from 'react'
import { AuthCard } from '@/components/landing/AuthCard'

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
