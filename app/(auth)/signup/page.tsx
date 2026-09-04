import { Suspense } from 'react'
import { AuthCard } from '@/components/landing/AuthCard'

// @ai-why: Eigen metadata per pagina. De layout zette voor allebei "Sign In" in de
// tab, dus wie zich aanmeldde zag "Sign In" boven zijn venster staan.
export const metadata = {
  title: 'Create Account — Carve',
  description: 'Create your Carve account and make the numbers yours.',
}

// @ai-context: Deze pagina was een eigen tweekoloms scherm van ruim 300 regels met
// een derde kopie van dezelfde Supabase-aanroepen. Hij rendert nu hetzelfde kader
// als /login en als de demo. Meeverhuisd naar InlineAuth: Google en Apple, het
// bevestigingsveld en de wachtwoordsterkte.
// @ai-sync: components/landing/InlineAuth.tsx

export default function SignupPage() {
  // @ai-gotcha: Suspense is verplicht — AuthCard leest `redirect` uit
  // useSearchParams, en dat dwingt Next tot een suspense-grens bij het prerenderen.
  return (
    <Suspense fallback={<div className="min-h-[100dvh] bg-[#0A0A0B]" />}>
      <AuthCard initialMode="signup" />
    </Suspense>
  )
}
