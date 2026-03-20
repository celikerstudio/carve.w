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

  // Create new conversation
  const createConversation = useCallback(async (activeApp: string, firstMessage: string): Promise<string | null> => {
    const supabase = createClient()
    const title = firstMessage.length > 60
      ? firstMessage.slice(0, 57) + '...'
      : firstMessage

    const { data, error } = await supabase
      .from('ai_conversations')
      .insert({ user_id: userId, title, active_app: activeApp })
      .select('id')
      .single()

    if (error || !data) return null

    // Refresh list
    fetchConversations()
    return data.id
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

  // Delete conversation
  const deleteConversation = useCallback(async (conversationId: string) => {
    const supabase = createClient()
    await supabase.from('ai_conversations').delete().eq('id', conversationId)
    setConversations(prev => prev.filter(c => c.id !== conversationId))
  }, [])

  return {
    conversations,
    loading,
    createConversation,
    loadMessages,
    deleteConversation,
    refreshConversations: fetchConversations,
  }
}
