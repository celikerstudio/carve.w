import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  // Fetch all knowledge entries for the user
  const { data: knowledge, error: knowledgeError } = await supabase
    .from('user_knowledge')
    .select('*')
    .eq('user_id', user.id)

  if (knowledgeError) {
    return NextResponse.json({ error: knowledgeError.message }, { status: 500 })
  }

  // Fetch 10 most recent completed quiz sessions
  const { data: recentSessions, error: sessionsError } = await supabase
    .from('quiz_sessions')
    .select('*')
    .eq('user_id', user.id)
    .not('completed_at', 'is', null)
    .order('completed_at', { ascending: false })
    .limit(10)

  if (sessionsError) {
    return NextResponse.json({ error: sessionsError.message }, { status: 500 })
  }

  return NextResponse.json({
    knowledge: knowledge ?? [],
    recent_sessions: recentSessions ?? [],
  })
}
