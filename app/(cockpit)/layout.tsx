import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/admin/auth'
import { CockpitShell } from '@/components/chat/CockpitShell'

/**
 * De schil om de hele cockpit.
 *
 * @ai-why: De zijbalk én het chatvenster wonen in deze layout en niet in de pagina's.
 * Next hergebruikt een layout bij navigatie binnen dezelfde groep, dus een klik naar
 * /beheer laat het gesprek staan. Zaten ze in de pagina, dan werd de chat bij elke
 * sectiewissel opnieuw aangekoppeld en was je lopende antwoord weg.
 *
 * @ai-why: Naar /app en niet naar /login zonder sessie. Dit is de wortel van de site en
 * dus het adres in advertenties; een bezoeker hoort de marketingpagina te zien. De
 * middleware vangt dit normaal al af, dit is de tweede grendel.
 *
 * @ai-sync: middleware.ts
 * @ai-sync: components/chat/CockpitShell.tsx
 */
export default async function CockpitLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/app')

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', user.id)
    .single()

  return (
    <CockpitShell
      userId={user.id}
      userName={profile?.display_name || user.user_metadata?.full_name || 'User'}
      isAdmin={await isAdmin()}
    >
      {children}
    </CockpitShell>
  )
}
