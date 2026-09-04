import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign In - Carve',
  description: 'Access your Carve account',
}

// @ai-gotcha: De wrapper is `bg-white` omdat /signup nog het oude tweekoloms
// scherm is. /login rendert sinds 2026-09-04 het donkere kader uit de demo en zet
// zijn eigen achtergrond; zodra /signup meeverhuist mag dit wit weg.
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="fixed inset-0 z-[100] bg-white">
      {children}
    </div>
  )
}
