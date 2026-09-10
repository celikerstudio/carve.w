import { requireAdminOrRedirect } from '@/lib/admin/auth'

/**
 * @ai-why: De rolcontrole staat op de route en niet alleen op de knop. Tot 2026-09-10 was
 * Beheer een verborgen sectie in de zijbalk; wie het pad kende kwam er alsnog, en alleen
 * de server actions weigerden. Nu weigert de route zelf, en de actions blijven hun eigen
 * controle doen omdat een server action ook zonder deze pagina aan te roepen is.
 * @ai-sync: app/actions/admin/
 */
export default async function BeheerLayout({ children }: { children: React.ReactNode }) {
  await requireAdminOrRedirect()
  return <>{children}</>
}
