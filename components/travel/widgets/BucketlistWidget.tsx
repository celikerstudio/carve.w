"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { TravelCard } from "@/components/travel/shared"

interface BucketlistItem {
  id: string
  title: string
  destination: string
  completed: boolean
}

interface BucketlistWidgetProps {
  items: BucketlistItem[]
}

export function BucketlistWidget({ items: initialItems }: BucketlistWidgetProps) {
  const [items, setItems] = useState(initialItems)
  const [adding, setAdding] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [newDestination, setNewDestination] = useState("")

  const total = items.length
  const completed = items.filter((i) => i.completed).length
  const uncompleted = items.filter((i) => !i.completed)
  const completedItems = items.filter((i) => i.completed)

  const addItem = async () => {
    if (!newTitle.trim() || !newDestination.trim()) return
    const res = await fetch("/api/travel/bucketlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle, destination: newDestination, type: "destination" }),
    })
    if (res.ok) {
      const { id } = await res.json()
      setItems((prev) => [{ id, title: newTitle, destination: newDestination, completed: false }, ...prev])
      setNewTitle("")
      setNewDestination("")
      setAdding(false)
    }
  }

  const removeItem = async (id: string) => {
    const res = await fetch(`/api/travel/bucketlist?id=${id}`, { method: "DELETE" })
    if (res.ok) {
      setItems((prev) => prev.filter((i) => i.id !== id))
    }
  }

  const planTrip = async (item: BucketlistItem) => {
    const res = await fetch("/api/travel/trips", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: item.title, destination: item.destination }),
    })
    if (res.ok) {
      const { id: tripId } = await res.json()
      await fetch("/api/travel/bucketlist", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, trip_id: tripId }),
      })
      window.location.href = `/dashboard/travel/${tripId}`
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Bucketlist</h3>
        <div className="flex items-center gap-3">
          <span className="text-xs text-[#f59e0b]">{completed}/{total} done</span>
          <button
            onClick={() => setAdding(!adding)}
            className="text-xs text-[#f59e0b] hover:text-[#f59e0b]/80 transition-colors"
          >
            {adding ? "Cancel" : "+"}
          </button>
        </div>
      </div>

      {/* Add form */}
      {adding && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
        >
          <TravelCard className="border-[#f59e0b]/20 space-y-2">
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Title (e.g. Northern Lights)"
              className="w-full bg-transparent text-sm text-white placeholder-[#555d70] outline-none border-b border-white/[0.06] pb-2"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && addItem()}
            />
            <input
              value={newDestination}
              onChange={(e) => setNewDestination(e.target.value)}
              placeholder="Destination (e.g. Iceland)"
              className="w-full bg-transparent text-sm text-white placeholder-[#555d70] outline-none border-b border-white/[0.06] pb-2"
              onKeyDown={(e) => e.key === "Enter" && addItem()}
            />
            <div className="flex justify-end">
              <button
                onClick={addItem}
                className="px-3 py-1 text-xs font-medium text-[#0c0e14] bg-[#f59e0b] rounded-lg hover:bg-[#f59e0b]/90 transition-colors"
              >
                Add
              </button>
            </div>
          </TravelCard>
        </motion.div>
      )}

      {/* Uncompleted items */}
      {uncompleted.map((item) => (
        <TravelCard key={item.id} className="group">
          <div className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b] shrink-0 mt-1.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{item.title}</p>
              <p className="text-xs text-[#555d70] truncate">{item.destination}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2 ml-3.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => planTrip(item)}
              className="text-[10px] text-[#b8d8e8] hover:text-[#b8d8e8]/80 transition-colors"
            >
              Plan this trip
            </button>
            <button
              onClick={() => removeItem(item.id)}
              className="text-[10px] text-[#555d70] hover:text-red-400 transition-colors"
            >
              Remove
            </button>
          </div>
        </TravelCard>
      ))}

      {/* Completed items */}
      {completedItems.map((item) => (
        <TravelCard key={item.id} className="opacity-50">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]/40 shrink-0" />
            <p className="text-sm text-[#7a8299] truncate line-through">{item.title}</p>
          </div>
        </TravelCard>
      ))}

      {/* Empty state */}
      {items.length === 0 && !adding && (
        <button
          onClick={() => setAdding(true)}
          className="w-full py-6 rounded-xl border border-dashed border-[#f59e0b]/20 text-sm text-[#555d70] hover:text-[#f59e0b] hover:border-[#f59e0b]/30 transition-colors"
        >
          Add your first bucketlist item
        </button>
      )}

      {items.length > 0 && (
        <Link
          href="/dashboard/travel/map"
          className="block text-xs text-[#7a8299] hover:text-[#b8d8e8] transition-colors"
        >
          View all on map →
        </Link>
      )}
    </div>
  )
}
