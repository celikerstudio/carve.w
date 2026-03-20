import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ChatLayout } from "@/components/chat/ChatLayout"

export default async function ChatPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', user.id)
    .single()

  const userName = profile?.display_name || user.user_metadata?.full_name || 'User'

  return <ChatLayout userId={user.id} userName={userName} />
}
