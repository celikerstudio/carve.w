import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign In - Carve',
  description: 'Access your Carve account',
}

// @ai-gotcha: De wrapper is nog `bg-white` omdat /forgot-password en
// /reset-password nog de oude witte schermen zijn. /login en /signup dragen sinds
// 2026-09-04 het donkere kader uit de demo en zetten hun eigen achtergrond eroverheen;
// zodra die laatste twee meeverhuizen mag dit wit weg.
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
