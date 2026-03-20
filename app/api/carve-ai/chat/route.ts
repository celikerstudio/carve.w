import { createClient } from "@/lib/supabase/server"
import { buildCoachContext } from "@/lib/ai/health-context"

export const maxDuration = 60

// @ai-why: Proxies to Supabase edge function instead of calling OpenAI directly.
// The edge function handles: model selection, coach personality, memory, quota, tools.
// This route only handles: auth token forwarding, context building, and SSE→AI SDK stream translation.

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return new Response("Unauthorized", { status: 401 })
  }

  const body = await req.json()
  const { messages, activeApp } = body as {
    messages: Array<{ role: string; content: string }>
    activeApp?: string
  }

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return new Response("Messages required", { status: 400 })
  }

  // Extract the latest user message
  const lastUserMessage = messages[messages.length - 1]
  if (!lastUserMessage || lastUserMessage.role !== 'user') {
    return new Response("Last message must be from user", { status: 400 })
  }

  // Build conversation history (all messages except the last one)
  const conversationHistory = messages.slice(0, -1).map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }))

  // Build real context from Supabase user data
  // @ai-sync: ~/Developer/carve-ai/Carve AI/App/Services/Coach/CoachContextBuilder.swift
  const userName = session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "User"
  const context = await buildCoachContext(session.user.id, activeApp ?? "home", userName)

  // Call Supabase edge function
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const edgeFunctionUrl = `${supabaseUrl}/functions/v1/coach-chat`

  const edgeResponse = await fetch(edgeFunctionUrl, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${session.access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: lastUserMessage.content,
      context,
      conversationHistory,
      stream: true,
    }),
  })

  if (!edgeResponse.ok) {
    const errorText = await edgeResponse.text()
    return new Response(errorText, { status: edgeResponse.status })
  }

  // Transform SSE stream (thinking/token/done) → AI SDK stream protocol
  // AI SDK protocol: text chunks are sent as `0:"text"\n`
  const responseStream = new ReadableStream({
    async start(controller) {
      const reader = edgeResponse.body?.getReader()
      if (!reader) {
        controller.close()
        return
      }

      const decoder = new TextDecoder()
      let buffer = ""

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split("\n")
          buffer = lines.pop() || ""

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue
            const data = line.slice(6).trim()
            if (!data) continue

            try {
              const event = JSON.parse(data)

              if (event.type === "token" && event.content) {
                // AI SDK text protocol: 0:"content"\n
                const encoded = JSON.stringify(event.content)
                controller.enqueue(new TextEncoder().encode(`0:${encoded}\n`))
              }

              if (event.type === "done") {
                // AI SDK finish protocol
                controller.enqueue(new TextEncoder().encode(`d:{"finishReason":"stop"}\n`))
              }

              if (event.type === "error") {
                controller.enqueue(new TextEncoder().encode(`0:${JSON.stringify("Error: " + event.message)}\n`))
                controller.enqueue(new TextEncoder().encode(`d:{"finishReason":"error"}\n`))
              }
            } catch {
              // Skip unparseable lines
            }
          }
        }
      } catch (err) {
        controller.enqueue(new TextEncoder().encode(`0:${JSON.stringify("Stream error")}\n`))
      } finally {
        controller.close()
      }
    },
  })

  return new Response(responseStream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Vercel-AI-Data-Stream": "v1",
    },
  })
}
