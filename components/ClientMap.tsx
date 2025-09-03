"use client"

import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import { useEffect, useMemo, useState } from "react"
import { useWebSocket } from "@/hooks/use-websocket"

// Fix default icon assets
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png"
import iconUrl from "leaflet/dist/images/marker-icon.png"
import shadowUrl from "leaflet/dist/images/marker-shadow.png"

L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl })

type Pos = { lat: number; lng: number; speed?: number; delayMinutes?: number; name?: string }

export default function ClientMap() {
  const [positions, setPositions] = useState<Record<string, Pos>>({})
  const wsData = useWebSocket("/ws/updates")

  useEffect(() => {
    if (!wsData) return
    // Assuming wsData.data contains the payload now based on recent changes
    const payload = wsData.data || wsData
    payload.trains?.forEach((t: any) => {
      setPositions((prev) => ({
        ...prev,
        [t.id]: {
          lat: t.lat,
          lng: t.lng,
          speed: t.speed,
          delayMinutes: t.delayMinutes || 0,
          name: t.name,
        }
      }))
    })
  }, [wsData])

  const first = Object.values(positions)[0]
  const center = useMemo<[number, number]>(() => {
    return first ? [first.lat, first.lng] : [28.6139, 77.2090] // Default to Delhi, India
  }, [first])

  return (
    <MapContainer center={center} zoom={7} style={{ height: 560, width: "100%" }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
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
  )
}