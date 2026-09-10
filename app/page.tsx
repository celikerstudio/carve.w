import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ChatLayout } from "@/components/chat/ChatLayout"
import { isAdmin } from "@/lib/admin/auth"

/**
 * De homepage: de cockpit voor wie is ingelogd.
 *
 * @ai-why: Deze pagina stond tot 2026-09-09 op `/chat`, binnen de `(protected)`-groep en
 * dus achter `SHOW_WEB_APP`. Die vlag zou de homepage in productie een 404 geven; hij is
 * met het web-platform verdwenen (TDR-0010). De grens is de sessie plus de rolcontrole in
 * lib/admin/auth.ts, en dat was sowieso de echte grens.
 *
 * @ai-sync: next.config.ts (/chat stuurt hierheen door)
 * @ai-sync: docs/tdr/0008-de-cockpit-is-de-homepage.md
 */
export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  // @ai-why: Naar /app en niet naar /login. `/` is sinds TDR-0008 de cockpit, maar het
  // is ook het adres in advertenties, in de App Store-listing en in de bio-link. Een
  // bezoeker die hier zonder sessie aankomt hoort de marketingpagina te zien, niet een
  // formulier. De middleware vangt dit normaal al af; dit is de tweede grendel voor het
  // geval iemand de matcher aanpast.
  // @ai-sync: middleware.ts
  // @ai-sync: docs/tdr/0008-de-cockpit-is-de-homepage.md
  if (!user) redirect("/app")

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', user.id)
    .single()

  const userName = profile?.display_name || user.user_metadata?.full_name || 'User'

  // @ai-why: Op de server, want de rol staat in de database en een client mag daar niet
  // over beslissen. Zie app/actions/admin/overview.ts voor de controle die echt telt.
  const admin = await isAdmin()

  return <ChatLayout userId={user.id} userName={userName} isAdmin={admin} />
}
