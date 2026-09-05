import { notFound } from 'next/navigation'
import { SHOW_WEB_APP } from '@/lib/flags'

export default function LabOverviewPage() {
  // @ai-why: Onderdeel van het web-platform, uit in productie sinds 2026-09-05.
  // @ai-sync: lib/flags.ts (SHOW_WEB_APP)
  if (!SHOW_WEB_APP) notFound()

  return (
    <div className="px-8 pt-8 pb-8 max-w-5xl">
      <h1 className="text-[28px] font-bold tracking-tight text-ink">
        Carve Lab
      </h1>
      <p className="mt-1 text-[14px] text-ink-secondary">
        Design safely before wiring production.
      </p>
    </div>
  )
}
