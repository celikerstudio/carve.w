import Link from 'next/link'

/**
 * Het kader om elk inlogscherm: de balk bovenaan en de kaart in het midden.
 *
 * @ai-why: Losgetrokken uit `AuthCard` op 2026-09-10. Login en signup deelden dit kader
 * al, maar `/forgot-password` en `/reset-password` droegen nog het oude ontwerp: lichte
 * achtergrond, blauwe knop en een stockillustratie van joggers. Drie schermen die tot
 * dezelfde flow horen en er anders uitzien lezen als drie producten.
 *
 * @ai-gotcha: Dit is bewust een server component zonder staat. Wie hier een `useState`
 * bij zet, dwingt elk inlogscherm dat het kader gebruikt in de client-bundle.
 *
 * @ai-sync: components/landing/AuthCard.tsx
 * @ai-sync: app/(auth)/forgot-password/page.tsx
 * @ai-sync: app/(auth)/reset-password/page.tsx
 */
export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] bg-[#0A0A0B] text-white">
      <nav className="flex items-center justify-between border-b border-white/[0.03] px-6 py-4 md:px-10">
        <Link
          href="/app"
          className="text-[12px] font-bold uppercase tracking-[0.35em] text-white/85"
        >
          CARVE
        </Link>
        <Link
          href="/app"
          className="text-[12.5px] text-white/30 transition-colors hover:text-white/60"
        >
          See the app
        </Link>
      </nav>

      <main className="flex min-h-[calc(100dvh-57px)] items-center justify-center px-4 py-10 md:px-6">
        <div className="w-full max-w-[520px] overflow-hidden rounded-2xl border border-white/[0.06] bg-[#111112] shadow-[0_24px_80px_rgba(0,0,0,0.4)]">
          {children}
        </div>
      </main>
    </div>
  )
}

/** De binnenkant van een wachtwoordscherm, met dezelfde maten als InlineAuth. */
export function AuthPanel({
  title,
  intro,
  children,
}: {
  title: string
  intro: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-1 flex-col justify-center px-[18px] py-9 md:px-10">
      <div className="mx-auto w-full max-w-[380px]">
        <h1 className="text-[26px] font-bold leading-tight tracking-[-0.025em]">{title}</h1>
        <p className="mt-2 text-[13.5px] leading-relaxed text-white/40">{intro}</p>
        {children}
      </div>
    </div>
  )
}

/** Eén tekstveld, met het label erboven zoals in InlineAuth. */
export function AuthField({
  label,
  extra,
  ...input
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; extra?: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="flex items-center font-mono text-[10px] uppercase tracking-[0.16em] text-white/25">
        {label}
        {extra}
      </span>
      <input
        {...input}
        className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-[14px] text-white placeholder:text-white/20 focus:border-white/25 focus:outline-none"
      />
    </label>
  )
}

export function AuthError({ children }: { children: React.ReactNode }) {
  return (
    <p
      role="alert"
      className="rounded-lg border border-[#E4783E]/25 bg-[#E4783E]/[0.08] px-3 py-2 text-[12.5px] text-[#F0A276]"
    >
      {children}
    </p>
  )
}

export function AuthSubmit({
  children,
  ...button
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...button}
      type="submit"
      style={{ backgroundColor: '#ffffff' }}
      className="mt-1 rounded-xl px-4 py-3.5 text-[14px] font-semibold text-[#0A0A0B] transition-opacity hover:opacity-90 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#111112]"
    >
      {children}
    </button>
  )
}
