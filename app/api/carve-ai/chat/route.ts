import { createClient } from "@/lib/supabase/server"
import { buildCoachContext } from "@/lib/ai/health-context"
import { buildMoneyContext } from "@/lib/ai/money-context"

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
  const { messages, activeApp, timeZone } = body as {
    messages: Array<{ role: string; content: string }>
    activeApp?: string
    timeZone?: string
  }

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return new Response("Messages required", { status: 400 })
  }

  // @ai-why: Rate limiting is handled server-side by the edge function via check_chat_quota RPC.
  // In-memory rate limiters don't work in serverless (state resets on cold start).

  // @ai-why: AI SDK v5 DefaultChatTransport sends messages with `parts` array, not `content` string.
  // We need to extract text content from either format.
  function extractContent(m: any): string {
    if (typeof m.content === 'string') return m.content
    if (Array.isArray(m.parts)) {
      return m.parts
        .filter((p: any) => p.type === 'text')
        .map((p: any) => p.text)
        .join('')
    }
    return ''
  }

  // Extract the latest user message
  const lastUserMessage = messages[messages.length - 1]
  if (!lastUserMessage || lastUserMessage.role !== 'user') {
    return new Response("Last message must be from user", { status: 400 })
  }

  // Build conversation history (all messages except the last one)
  const conversationHistory = messages.slice(0, -1)
    .map((m) => ({
      role: m.role as "user" | "assistant",
      content: extractContent(m),
    }))
    .filter((m) => m.content)

  // Build real context from Supabase user data
  // @ai-sync: ~/Developer/carve-ai/Carve AI/App/Services/Coach/CoachContextBuilder.swift
  const userName = session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "User"
  const [healthContext, moneyContext, wikiArticlesRes] = await Promise.all([
    buildCoachContext(session.user.id, activeApp ?? "home", userName, timeZone),
    buildMoneyContext(session.user.id),
    supabase
      .from('wiki_articles')
      .select('slug, title, category, summary')
      .eq('is_published', true)
      .order('view_count', { ascending: false }),
  ])
  // @ai-why: Auto-detect active domains based on actual data presence.
  // Apple approach: the coach just knows what it knows — no toggles, no config.
  // activeDomains tells the edge function which domain sections to activate in the prompt.
  const activeDomains: string[] = []
  if (healthContext.lastWorkoutName || healthContext.todayCalories > 0 || healthContext.stepsToday > 0) {
    activeDomains.push("health")
  }
  if (moneyContext.monthlySpending !== null) {
    activeDomains.push("money")
  }
  // Always include the active app even if no data yet (user explicitly navigated there)
  if (activeApp && activeApp !== "home" && !activeDomains.includes(activeApp)) {
    activeDomains.push(activeApp)
  }

  // Format wiki articles as compact metadata for the coach prompt
  const wikiArticles = wikiArticlesRes.data?.length
    ? wikiArticlesRes.data.map((a) => `- [[${a.slug}]] ${a.title} (${a.category}) — ${a.summary}`).join('\n')
    : null

  const context = { ...healthContext, ...moneyContext, activeDomains, wikiArticles }

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
      message: extractContent(lastUserMessage),
      context,
      conversationHistory,
      stream: true,
    }),
  })

  if (!edgeResponse.ok) {
    const errorText = await edgeResponse.text()
    console.error(`[coach-chat] Edge function error: ${errorText}`)
    return new Response(errorText, { status: edgeResponse.status })
  }

  // Transform SSE stream (thinking/token/done) → AI SDK v5 UI Message Stream (NDJSON)
  // @ai-why: AI SDK v5 DefaultChatTransport.processResponseStream uses parseJsonEventStream
  // with uiMessageChunkSchema. It expects NDJSON lines with types: text-start, text-delta, text-end.
  // The old data stream v1 format (0:"text"\n) does NOT work with v5.
  const encoder = new TextEncoder()
  const messageId = crypto.randomUUID()

  const responseStream = new ReadableStream({
    async start(controller) {
      const reader = edgeResponse.body?.getReader()
      if (!reader) {
        controller.close()
        return
      }

      const decoder = new TextDecoder()
      let buffer = ""
      let started = false

      // @ai-why: Must use SSE format (data: {json}\n\n), not plain NDJSON.
      // DefaultChatTransport uses parseJsonEventStream which parses SSE, and
      // createUIMessageStreamResponse wraps JSON with JsonToSseTransformStream.
      function send(obj: Record<string, unknown>) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`))
      }

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
                if (!started) {
                  send({ type: "text-start", id: messageId })
                  started = true
                }
                send({ type: "text-delta", id: messageId, delta: event.content })
              }

              if (event.type === "done") {
                if (!started) {
                  send({ type: "text-start", id: messageId })
                }
                send({ type: "text-end", id: messageId })
                started = false
              }

              if (event.type === "error") {
                send({ type: "error", errorText: event.message || "Unknown error" })
              }
            } catch {
              // Skip unparseable SSE lines
            }
          }
        }

        // Close text if edge function ended without "done" event
        if (started) {
          send({ type: "text-end", id: messageId })
        }
      } catch {
        send({ type: "error", errorText: "Stream connection error" })
      } finally {
        controller.enqueue(encoder.encode("data: [DONE]\n\n"))
        controller.close()
      }
    },
  })

  return new Response(responseStream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  })
}
