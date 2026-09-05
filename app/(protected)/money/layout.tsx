import { notFound } from 'next/navigation'
import { SHOW_MONEY } from '@/lib/flags'

export default function MoneyLayout({ children }: { children: React.ReactNode }) {
  // @ai-why: De poort staat in de layout en niet in elke page. Money heeft zes
  // subroutes (analytics, budgeting, insights, settings, subscriptions, transactions);
  // een gate per page is zes plekken om te vergeten. In development is de vlag aan, in
  // productie uit, dus dit is wat een bezoeker ziet en niet wat jij ziet.
  // @ai-sync: lib/flags.ts (SHOW_MONEY)
  if (!SHOW_MONEY) notFound()

  return (
    <div className="h-full w-full overflow-y-auto relative">
      {/* Subtle green gradient glow for Money section */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-[radial-gradient(ellipse_at_top,_rgba(16,185,129,0.08)_0%,_transparent_70%)] pointer-events-none" />
      <div className="relative z-10 h-full">
        {children}
      </div>
    </div>
  )
}
