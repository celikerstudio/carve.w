"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface ChatMessageProps {
  role: "user" | "assistant"
  content: string
}

export function ChatMessage({ role, content }: ChatMessageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex",
        role === "user" ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
          role === "user"
            ? "bg-[#b8d8e8]/20 text-white"
            : "bg-white/[0.04] text-[#e2e8f0] border border-white/[0.06]"
        )}
      >
        <p className="whitespace-pre-wrap">{content}</p>
      </div>
    </motion.div>
  )
}
