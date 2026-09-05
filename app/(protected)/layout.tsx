import { notFound } from 'next/navigation'
import { SHOW_WEB_APP } from '@/lib/flags'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Auth is handled by middleware.ts — it redirects unauthenticated users to /login
  //
  // @ai-why: Eén poort voor de hele routegroep (68 bestanden, elf secties). Een gate per
  // sectie is elf plekken om te vergeten, en de volgende sectie die iemand toevoegt komt
  // er ongegate bij. In development staat de vlag aan, dus dit is wat een bezoeker ziet
  // en niet wat jij ziet.
  // @ai-gotcha: `/admin` zit in deze groep en gaat hiermee óók dicht in productie. Dat is
  // bewust zolang jij lokaal werkt; moet admin live bereikbaar zijn, zet dan
  // NEXT_PUBLIC_SHOW_WEB_APP=true of geef admin een eigen uitzondering hier.
  // @ai-sync: lib/flags.ts (SHOW_WEB_APP)
  if (!SHOW_WEB_APP) notFound()

  return <>{children}</>
}
