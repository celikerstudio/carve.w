'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface Conversation {
  id: string
  title: string | null
  active_app: string
  created_at: string
  updated_at: string
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

export function useChatHistory(userId: string) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch conversation list
  const fetchConversations = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('ai_conversations')
      .select('id, title, active_app, created_at, updated_at')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(30)

    setConversations(data ?? [])
    setLoading(false)
  }, [userId])

  useEffect(() => {
    if (userId) fetchConversations()
  }, [userId, fetchConversations])

  // Load messages for a conversation
  const loadMessages = useCallback(async (conversationId: string): Promise<ChatMessage[]> => {
    const supabase = createClient()
    const { data } = await supabase
      .from('ai_messages')
      .select('role, content, created_at')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })

    return (data ?? []) as ChatMessage[]
  }, [])

  // Delete conversation and its messages
  // @ai-why: Delete messages first in case there's no ON DELETE CASCADE on the FK.
  // This prevents orphaned ai_messages rows after conversation deletion.
  const deleteConversation = useCallback(async (conversationId: string) => {
    const supabase = createClient()
    await supabase.from('ai_messages').delete().eq('conversation_id', conversationId)
    await supabase.from('ai_conversations').delete().eq('id', conversationId)
    setConversations(prev => prev.filter(c => c.id !== conversationId))
  }, [])

  return {
    conversations,
    loading,
    loadMessages,
    deleteConversation,
    refreshConversations: fetchConversations,
  }
}
