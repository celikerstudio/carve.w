import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ChatLayout } from "@/components/chat/ChatLayout"

export default async function ChatPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  return <ChatLayout userId={user.id} userName={user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'} />
}
