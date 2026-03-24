"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { motion } from "framer-motion"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

interface TripPin {
  id: string
  title: string
  destination: string
  start_date: string | null
  end_date: string | null
  total_budget: number | null
  currency: string
  status: string
  latitude: number | null
  longitude: number | null
}

interface BucketlistItem {
  id: string
  type: string
  title: string
  destination: string
  description: string | null
  completed: boolean
  trip_id: string | null
  created_at: string
}

interface TravelMapProps {
  trips: TripPin[]
  homebase?: string
  bucketlist: BucketlistItem[]
}

// Fallback coordinates for popular destinations
const CITY_COORDS: Record<string, [number, number]> = {
  barcelona: [41.3874, 2.1686],
  paris: [48.8566, 2.3522],
  rome: [41.9028, 12.4964],
  amsterdam: [52.3676, 4.9041],
  london: [51.5074, -0.1278],
  tokyo: [35.6762, 139.6503],
  istanbul: [41.0082, 28.9784],
  lisbon: [38.7223, -9.1393],
  berlin: [52.52, 13.405],
  prague: [50.0755, 14.4378],
  vienna: [48.2082, 16.3738],
  budapest: [47.4979, 19.0402],
  athens: [37.9838, 23.7275],
  madrid: [40.4168, -3.7038],
  dublin: [53.3498, -6.2603],
  copenhagen: [55.6761, 12.5683],
  stockholm: [59.3293, 18.0686],
  bangkok: [13.7563, 100.5018],
  "new york": [40.7128, -74.006],
  dubai: [25.2048, 55.2708],
  singapore: [1.3521, 103.8198],
  sydney: [-33.8688, 151.2093],
  "buenos aires": [-34.6037, -58.3816],
  marrakech: [31.6295, -7.9811],
  cairo: [30.0444, 31.2357],
  bali: [-8.3405, 115.092],
  "mexico city": [19.4326, -99.1332],
  florence: [43.7696, 11.2558],
  milan: [45.4642, 9.19],
  osaka: [34.6937, 135.5023],
  seoul: [37.5665, 126.978],
  munich: [48.1351, 11.582],
  zurich: [47.3769, 8.5417],
  "kuala lumpur": [3.139, 101.6869],
  "cape town": [-33.9249, 18.4241],
  porto: [41.1579, -8.6291],
  nice: [43.7102, 7.262],
  "ho chi minh city": [10.8231, 106.6297],
  kyoto: [35.0116, 135.7681],
}

function getCityCoords(destination: string): [number, number] | null {
  const normalized = destination.toLowerCase().trim()
  if (CITY_COORDS[normalized]) return CITY_COORDS[normalized]
  for (const [city, coords] of Object.entries(CITY_COORDS)) {
    if (normalized.includes(city) || city.includes(normalized)) return coords
  }
  return null
}

const STATUS_COLORS: Record<string, string> = {
  planned: "#b8d8e8",
  active: "#10b981",
  completed: "#555d70",
  draft: "#7a8299",
}

const BUCKETLIST_COLOR = "#f59e0b"

function createCurvedLine(from: [number, number], to: [number, number], points = 50): [number, number][] {
  const latlngs: [number, number][] = []
  for (let i = 0; i <= points; i++) {
    const t = i / points
    const lat = from[0] + (to[0] - from[0]) * t
    const lng = from[1] + (to[1] - from[1]) * t
    const offset = Math.sin(t * Math.PI) * Math.abs(to[1] - from[1]) * 0.15
    latlngs.push([lat + offset, lng])
  }
  return latlngs
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return ""
  return new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "short" })
}

export function TravelMapClient({ trips, homebase = "Amsterdam", bucketlist }: TravelMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markersRef = useRef<Map<string, L.Marker>>(new Map())
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [addingBucketlist, setAddingBucketlist] = useState(false)
  const [newBLTitle, setNewBLTitle] = useState("")
  const [newBLDestination, setNewBLDestination] = useState("")
  const [newBLType, setNewBLType] = useState<"destination" | "experience">("destination")

  const homeCoords = getCityCoords(homebase)

  // Resolve trip coordinates
  const tripsResolved = trips.map((t) => {
    if (t.latitude && t.longitude) return { ...t, lat: t.latitude, lng: t.longitude }
    const fallback = getCityCoords(t.destination)
    if (fallback) return { ...t, lat: fallback[0], lng: fallback[1] }
    return { ...t, lat: null as number | null, lng: null as number | null }
  })

  const tripsWithCoords = tripsResolved.filter((t) => t.lat !== null && t.lng !== null)
  const upcomingTrips = trips.filter((t) => t.status === "planned" || t.status === "active")
  const pastTrips = trips.filter((t) => t.status === "completed")

  // Resolve bucketlist coordinates
  const bucketlistResolved = bucketlist.map((item) => {
    const coords = getCityCoords(item.destination)
    return { ...item, lat: coords?.[0] ?? null, lng: coords?.[1] ?? null }
  })
  const bucketlistWithCoords = bucketlistResolved.filter((b) => b.lat !== null && b.lng !== null)
  const uncompletedBucketlist = bucketlist.filter((b) => !b.completed)
  const completedBucketlist = bucketlist.filter((b) => b.completed)

  const flyTo = useCallback((id: string, lat: number, lng: number) => {
    if (!mapRef.current) return
    setSelectedId(id)
    mapRef.current.flyTo([lat, lng], 8, { duration: 1.2 })
    const marker = markersRef.current.get(id)
    if (marker) setTimeout(() => marker.openPopup(), 600)
  }, [])

  const addBucketlistItem = async () => {
    if (!newBLTitle.trim() || !newBLDestination.trim()) return
    const res = await fetch("/api/travel/bucketlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newBLTitle, destination: newBLDestination, type: newBLType }),
    })
    if (res.ok) {
      setNewBLTitle("")
      setNewBLDestination("")
      setAddingBucketlist(false)
      window.location.reload()
    }
  }

  const deleteBucketlistItem = async (id: string) => {
    await fetch(`/api/travel/bucketlist?id=${id}`, { method: "DELETE" })
    window.location.reload()
  }

  const planBucketlistTrip = async (item: BucketlistItem) => {
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
      window.location.href = `/travel/${tripId}`
    }
  }

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return

    const map = L.map(mapContainer.current, {
      center: [30, 10],
      zoom: 2,
      zoomControl: false,
    })

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
      subdomains: "abcd",
      maxZoom: 19,
    }).addTo(map)

    L.control.zoom({ position: "bottomright" }).addTo(map)

    const bounds = L.latLngBounds([])
    let hasPoints = false

    // Homebase marker
    if (homeCoords) {
      hasPoints = true
      bounds.extend(homeCoords)

      const homeIcon = L.divIcon({
        className: "",
        html: `<div style="width:16px;height:16px;border-radius:50%;background:#ffffff;border:3px solid rgba(0,0,0,0.5);box-shadow:0 0 12px rgba(255,255,255,0.3);"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      })

      L.marker(homeCoords, { icon: homeIcon })
        .bindPopup(
          `<div style="font-family:system-ui;padding:4px 0;">
            <div style="font-size:14px;font-weight:600;color:white;">${homebase}</div>
            <div style="font-size:12px;color:#9da6b9;margin-top:2px;">Your homebase</div>
          </div>`,
          { className: "travel-map-popup", closeButton: false }
        )
        .addTo(map)
    }

    // Trip markers
    tripsWithCoords.forEach((trip) => {
      if (!trip.lat || !trip.lng) return

      hasPoints = true
      bounds.extend([trip.lat, trip.lng])

      const color = STATUS_COLORS[trip.status] || STATUS_COLORS.draft
      const currencySymbol = trip.currency === "EUR" ? "\u20AC" : trip.currency === "USD" ? "$" : trip.currency === "GBP" ? "\u00A3" : trip.currency

      if (homeCoords) {
        const latlngs = createCurvedLine(homeCoords, [trip.lat, trip.lng])
        L.polyline(latlngs, {
          color,
          weight: 1.5,
          opacity: 0.25,
          dashArray: "6 4",
          smoothFactor: 1,
        }).addTo(map)
      }

      const icon = L.divIcon({
        className: "",
        html: `<div style="width:12px;height:12px;border-radius:50%;background:${color};border:2px solid rgba(0,0,0,0.4);box-shadow:0 0 8px ${color}40;"></div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6],
      })

      const dates = trip.start_date && trip.end_date
        ? `${formatDate(trip.start_date)} \u2014 ${formatDate(trip.end_date)}`
        : ""
      const budgetText = trip.total_budget ? `${currencySymbol}${trip.total_budget.toFixed(0)}` : ""

      const popupContent = `
        <div style="font-family:system-ui;padding:4px 0;">
          <div style="font-size:14px;font-weight:600;color:white;">${trip.destination}</div>
          <div style="font-size:12px;color:#9da6b9;margin-top:2px;">${trip.title}</div>
          ${dates ? `<div style="font-size:11px;color:#7a8299;margin-top:4px;">${dates}</div>` : ""}
          ${budgetText ? `<div style="font-size:12px;font-weight:500;color:${color};margin-top:4px;">${budgetText}</div>` : ""}
          <a href="/travel/${trip.id}" style="display:inline-block;margin-top:8px;font-size:11px;color:#b8d8e8;text-decoration:none;">View trip \u2192</a>
        </div>
      `

      const marker = L.marker([trip.lat, trip.lng], { icon })
        .bindPopup(popupContent, { className: "travel-map-popup", closeButton: false })
        .addTo(map)

      markersRef.current.set(trip.id, marker)
    })

    // Bucketlist markers
    bucketlistWithCoords.forEach((item) => {
      if (!item.lat || !item.lng) return

      hasPoints = true
      bounds.extend([item.lat, item.lng])

      if (homeCoords) {
        const latlngs = createCurvedLine(homeCoords, [item.lat, item.lng])
        L.polyline(latlngs, {
          color: BUCKETLIST_COLOR,
          weight: 1.5,
          opacity: item.completed ? 0.1 : 0.2,
          dashArray: "4 6",
          smoothFactor: 1,
        }).addTo(map)
      }

      const icon = L.divIcon({
        className: "",
        html: `<div style="width:10px;height:10px;border-radius:50%;background:${BUCKETLIST_COLOR};border:2px solid rgba(0,0,0,0.4);box-shadow:0 0 8px ${BUCKETLIST_COLOR}40;opacity:${item.completed ? 0.4 : 1};"></div>`,
        iconSize: [10, 10],
        iconAnchor: [5, 5],
      })

      const popupContent = `
        <div style="font-family:system-ui;padding:4px 0;">
          <div style="font-size:14px;font-weight:600;color:${BUCKETLIST_COLOR};">${item.title}</div>
          <div style="font-size:12px;color:#9da6b9;margin-top:2px;">${item.destination}</div>
          ${item.description ? `<div style="font-size:11px;color:#7a8299;margin-top:4px;">${item.description}</div>` : ""}
          <div style="font-size:10px;color:#555d70;margin-top:4px;">${item.completed ? "Completed" : "Bucketlist"}</div>
        </div>
      `

      const marker = L.marker([item.lat, item.lng], { icon })
        .bindPopup(popupContent, { className: "travel-map-popup", closeButton: false })
        .addTo(map)

      markersRef.current.set(`bl-${item.id}`, marker)
    })

    if (hasPoints) {
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 6 })
    }

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
      markersRef.current.clear()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="h-full flex">
      {/* Map */}
      <div className="flex-1 min-w-0 relative">
        <div ref={mapContainer} className="w-full h-full" />

        {/* Stats overlay */}
        <div className="absolute top-4 left-4 z-[1000] flex items-center gap-3 px-4 py-2 rounded-xl bg-[#0c0e14]/80 backdrop-blur-sm border border-white/[0.06]">
          <span className="text-sm text-white font-medium">{trips.length} trips</span>
          <span className="w-px h-4 bg-white/[0.08]" />
          <span className="text-sm text-[#7a8299]">{new Set(trips.map((t) => t.destination)).size} destinations</span>
          <span className="w-px h-4 bg-white/[0.08]" />
          <span className="text-sm text-[#b8d8e8]">{upcomingTrips.length} upcoming</span>
          {bucketlist.length > 0 && (
            <>
              <span className="w-px h-4 bg-white/[0.08]" />
              <span className="text-sm text-[#f59e0b]">{uncompletedBucketlist.length} bucketlist</span>
            </>
          )}
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-[400px] shrink-0 border-l border-white/[0.06] bg-[#0c0e14] overflow-y-auto">
        <div className="p-5 space-y-5">
          {/* Upcoming */}
          {upcomingTrips.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs uppercase tracking-wider text-[#555d70]">Upcoming</h3>
              {upcomingTrips.map((trip, idx) => {
                const resolved = tripsResolved.find((t) => t.id === trip.id)
                const hasCoords = resolved?.lat !== null

                return (
                  <motion.button
                    key={trip.id}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    onClick={() => hasCoords && resolved?.lat && resolved?.lng && flyTo(trip.id, resolved.lat, resolved.lng)}
                    className={`w-full text-left p-3 rounded-xl border transition-all ${
                      selectedId === trip.id
                        ? "bg-[#b8d8e8]/10 border-[#b8d8e8]/20"
                        : "bg-[#1c1f27] border-white/[0.06] hover:border-[#b8d8e8]/20"
                    } ${hasCoords ? "cursor-pointer" : "opacity-60 cursor-default"}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">{trip.destination}</p>
                        <p className="text-xs text-[#7a8299] truncate mt-0.5">{trip.title}</p>
                      </div>
                      <span
                        className="shrink-0 w-2 h-2 rounded-full mt-1.5"
                        style={{ backgroundColor: STATUS_COLORS[trip.status] || STATUS_COLORS.draft }}
                      />
                    </div>
                    {(trip.start_date || trip.total_budget) && (
                      <div className="flex items-center gap-3 mt-2 text-[10px] text-[#555d70]">
                        {trip.start_date && trip.end_date && (
                          <span>{formatDate(trip.start_date)} — {formatDate(trip.end_date)}</span>
                        )}
                        {trip.total_budget && (
                          <span>
                            {trip.currency === "EUR" ? "\u20AC" : trip.currency === "USD" ? "$" : trip.currency === "GBP" ? "\u00A3" : trip.currency}
                            {trip.total_budget.toFixed(0)}
                          </span>
                        )}
                      </div>
                    )}
                  </motion.button>
                )
              })}
            </div>
          )}

          {/* Completed trips */}
          {pastTrips.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs uppercase tracking-wider text-[#555d70]">Completed</h3>
              {pastTrips.map((trip, idx) => {
                const resolved = tripsResolved.find((t) => t.id === trip.id)
                const hasCoords = resolved?.lat !== null

                return (
                  <motion.button
                    key={trip.id}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    onClick={() => hasCoords && resolved?.lat && resolved?.lng && flyTo(trip.id, resolved.lat, resolved.lng)}
                    className={`w-full text-left p-3 rounded-xl border transition-all ${
                      selectedId === trip.id
                        ? "bg-[#b8d8e8]/10 border-[#b8d8e8]/20"
                        : "bg-[#1c1f27] border-white/[0.06] hover:border-white/[0.08]"
                    } ${hasCoords ? "cursor-pointer" : "opacity-60 cursor-default"}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[#7a8299] truncate">{trip.destination}</p>
                        <p className="text-xs text-[#555d70] truncate mt-0.5">{trip.title}</p>
                      </div>
                      <span
                        className="shrink-0 w-2 h-2 rounded-full mt-1.5"
                        style={{ backgroundColor: STATUS_COLORS.completed }}
                      />
                    </div>
                  </motion.button>
                )
              })}
            </div>
          )}

          {/* Bucketlist */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs uppercase tracking-wider text-[#f59e0b]">Bucketlist</h3>
              <button
                onClick={() => setAddingBucketlist(!addingBucketlist)}
                className="text-xs text-[#f59e0b] hover:text-[#f59e0b]/80 transition-colors"
              >
                {addingBucketlist ? "Cancel" : "+"}
              </button>
            </div>

            {/* Add form */}
            {addingBucketlist && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="p-3 rounded-xl bg-[#1c1f27] border border-[#f59e0b]/20 space-y-2"
              >
                <input
                  value={newBLTitle}
                  onChange={(e) => setNewBLTitle(e.target.value)}
                  placeholder="Title (e.g. Northern Lights)"
                  className="w-full bg-transparent text-sm text-white placeholder-[#555d70] outline-none border-b border-white/[0.06] pb-2"
                  autoFocus
                />
                <input
                  value={newBLDestination}
                  onChange={(e) => setNewBLDestination(e.target.value)}
                  placeholder="Destination (e.g. Iceland)"
                  className="w-full bg-transparent text-sm text-white placeholder-[#555d70] outline-none border-b border-white/[0.06] pb-2"
                />
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setNewBLType("destination")}
                    className={`px-2 py-1 text-xs rounded-lg transition-colors ${
                      newBLType === "destination" ? "bg-[#f59e0b]/20 text-[#f59e0b]" : "text-[#555d70] hover:text-[#7a8299]"
                    }`}
                  >
                    Destination
                  </button>
                  <button
                    onClick={() => setNewBLType("experience")}
                    className={`px-2 py-1 text-xs rounded-lg transition-colors ${
                      newBLType === "experience" ? "bg-[#f59e0b]/20 text-[#f59e0b]" : "text-[#555d70] hover:text-[#7a8299]"
                    }`}
                  >
                    Experience
                  </button>
                  <button
                    onClick={addBucketlistItem}
                    className="ml-auto px-3 py-1 text-xs font-medium text-[#0c0e14] bg-[#f59e0b] rounded-lg hover:bg-[#f59e0b]/90 transition-colors"
                  >
                    Add
                  </button>
                </div>
              </motion.div>
            )}

            {/* Uncompleted items */}
            {uncompletedBucketlist.map((item, idx) => {
              const resolved = bucketlistResolved.find((b) => b.id === item.id)
              const hasCoords = resolved?.lat !== null

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className={`p-3 rounded-xl border transition-all group ${
                    selectedId === `bl-${item.id}`
                      ? "bg-[#f59e0b]/10 border-[#f59e0b]/20"
                      : "bg-[#1c1f27] border-white/[0.06] hover:border-[#f59e0b]/20"
                  }`}
                >
                  <div
                    className={`flex items-start justify-between gap-2 ${hasCoords ? "cursor-pointer" : ""}`}
                    onClick={() => hasCoords && resolved?.lat && resolved?.lng && flyTo(`bl-${item.id}`, resolved.lat, resolved.lng)}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b] shrink-0" />
                        <p className="text-sm font-medium text-white truncate">{item.title}</p>
                      </div>
                      <p className="text-xs text-[#7a8299] truncate mt-0.5 ml-3.5">{item.destination}</p>
                    </div>
                    <span className="shrink-0 text-[10px] text-[#555d70] capitalize mt-0.5">{item.type}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2 ml-3.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => planBucketlistTrip(item)}
                      className="text-[10px] text-[#b8d8e8] hover:text-[#b8d8e8]/80 transition-colors"
                    >
                      Plan this trip
                    </button>
                    <button
                      onClick={() => deleteBucketlistItem(item.id)}
                      className="text-[10px] text-[#555d70] hover:text-red-400 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </motion.div>
              )
            })}

            {/* Completed items */}
            {completedBucketlist.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-xl bg-[#1c1f27] border border-white/[0.06] opacity-50"
              >
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]/40 shrink-0" />
                  <p className="text-sm text-[#7a8299] truncate line-through">{item.title}</p>
                </div>
              </div>
            ))}

            {/* Empty state */}
            {bucketlist.length === 0 && !addingBucketlist && (
              <button
                onClick={() => setAddingBucketlist(true)}
                className="w-full py-4 rounded-xl border border-dashed border-[#f59e0b]/20 text-sm text-[#555d70] hover:text-[#f59e0b] hover:border-[#f59e0b]/30 transition-colors"
              >
                Add your first bucketlist item
              </button>
            )}
          </div>

          {/* Empty state — no trips and no bucketlist */}
          {trips.length === 0 && bucketlist.length === 0 && (
            <div className="text-center py-8">
              <p className="text-sm text-[#555d70]">No trips or bucketlist items yet</p>
              <p className="text-xs text-[#555d70]/60 mt-1">Start planning to see them on the map</p>
            </div>
          )}
        </div>
      </div>

      {/* Popup styles */}
      <style jsx global>{`
        .travel-map-popup .leaflet-popup-content-wrapper {
          background: #1c1f27;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.4);
        }
        .travel-map-popup .leaflet-popup-content {
          margin: 12px 16px;
        }
        .travel-map-popup .leaflet-popup-tip {
          background: #1c1f27;
        }
      `}</style>
    </div>
  )
}
