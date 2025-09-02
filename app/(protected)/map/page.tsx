"use client"

import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import { useEffect, useMemo, useState } from "react"
import { useWebSocket } from "@/hooks/use-websocket"
import { useSchedule } from "@/hooks/use-train-data"

// Fix default icon assets (even if using CircleMarker)
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png"
import iconUrl from "leaflet/dist/images/marker-icon.png"
import shadowUrl from "leaflet/dist/images/marker-shadow.png"
L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl })

type Pos = { lat: number; lng: number; speed?: number; delayMinutes?: number; name?: string }

export default function MapPage() {
  const { data: schedule } = useSchedule()
  const [positions, setPositions] = useState<Record<string, Pos>>({})
  const wsData = useWebSocket("/ws/live-updates")

  useEffect(() => {
    if (!wsData) return
    setPositions((prev) => {
      const next = { ...prev }
      wsData.trains?.forEach((t: any) => {
        next[t.id] = {
          lat: t.lat,
          lng: t.lng,
          speed: t.speed,
          delayMinutes: t.delayMinutes || 0,
          name: t.name,
        }
      })
      return next
    })
  }, [wsData])

  const first = Object.values(positions)[0]
  const center = useMemo<[number, number]>(() => {
    return first ? [first.lat, first.lng] : [51.5072, -0.1276]
  }, [first])

  return (
    <div className="mx-auto max-w-[1400px] space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Live Train Map</h2>
      </div>
      <div className="rounded-2xl border border-border bg-card shadow-lg overflow-hidden">
        <MapContainer center={center} zoom={7} style={{ height: 560, width: "100%" }}>
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {Object.entries(positions).map(([id, p]) => {
            const color = (p.delayMinutes || 0) > 0 ? "red" : "hsl(var(--chart-2))"
            return (
              <CircleMarker
                key={id}
                center={[p.lat, p.lng]}
                radius={8}
                pathOptions={{ color, fillColor: color, fillOpacity: 0.9 }}
              >
                <Popup>
                  <div className="text-sm">
                    <div className="font-semibold">{p.name || id}</div>
                    <div>Speed: {p.speed ?? "-"} km/h</div>
                    <div>Delay: {p.delayMinutes || 0} min</div>
                  </div>
                </Popup>
              </CircleMarker>
            )
          })}
        </MapContainer>
      </div>
    </div>
  )
}
