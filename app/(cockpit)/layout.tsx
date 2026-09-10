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

  // @ai-why: Het volledige venster hangt hier en niet in de root-layout. Tot 2026-09-10
  // koos `components/app/layout-wrapper.tsx` de schil op het pad, en die kende maar één
  // cockpit-adres: `/`. Zodra de modi eigen routes kregen, viel /jij, /hiscores en
  // /beheer daar buiten. Zichtbaar gevolg: `h-full` op de zijbalk had geen hoogte om
  // zich aan te meten en stopte halverwege, en `bg-white/[0.03]` kleurde tegen de
  // body-achtergrond in plaats van tegen #191a1c. /wiki viel juist ín de wiki-tak en
  // kreeg er een marketingheader bij.
  //
  // Hier staat het één keer voor de hele groep, dus een nieuwe modus onder
  // `app/(cockpit)/` erft hem zonder dat er ergens een lijst bijgewerkt hoeft te worden.
  //
  // @ai-gotcha: `fixed inset-0` en niet `h-screen`. De cockpit scrollt binnenin (de chat
  // en de beheerpanelen doen hun eigen `overflow-y`), en met `h-screen` scrollt het
  // document eronder mee zodra een paneel langer wordt dan het scherm.
  //
  // @ai-sync: components/app/layout-wrapper.tsx (kent geen cockpit-paden meer)
  // @ai-sync: components/chat/ChatSidebar.tsx (`h-full` en `bg-white/[0.03]` leunen hierop)
  return (
    <div className="fixed inset-0 bg-[#191a1c]">
      <CockpitShell
        userId={user.id}
        userName={profile?.display_name || user.user_metadata?.full_name || 'User'}
        isAdmin={await isAdmin()}
      >
        {children}
      </CockpitShell>
    </div>
  )
}
